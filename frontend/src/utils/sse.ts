import { AuthService } from '../services/authService';
import type { SSEProgressEvent, SSECompleteEvent, SSEErrorEvent } from '../../../shared/types';

export type SSEEventHandler = {
  onProgress?: (data: SSEProgressEvent) => void;
  onComplete?: (data: SSECompleteEvent) => void;
  onError?: (data: SSEErrorEvent) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Create SSE connection for video generation progress
 */
export function createEventSource(
  url: string,
  handlers: SSEEventHandler
): EventSource {
  const token = AuthService.getToken();

  // EventSource doesn't support custom headers, so we need to pass token via query param
  // or use fetch with ReadableStream instead
  // For now, we'll use a workaround with a custom implementation

  const fullUrl = `${API_BASE_URL}${url}`;
  const eventSource = new EventSource(fullUrl);

  eventSource.onopen = () => {
    console.log('SSE connection opened');
    handlers.onOpen?.();
  };

  eventSource.addEventListener('progress', (event: MessageEvent) => {
    try {
      const data: SSEProgressEvent = JSON.parse(event.data);
      handlers.onProgress?.(data);
    } catch (error) {
      console.error('Error parsing progress event:', error);
    }
  });

  eventSource.addEventListener('complete', (event: MessageEvent) => {
    try {
      const data: SSECompleteEvent = JSON.parse(event.data);
      handlers.onComplete?.(data);
      eventSource.close();
      handlers.onClose?.();
    } catch (error) {
      console.error('Error parsing complete event:', error);
    }
  });

  eventSource.addEventListener('error', (event: MessageEvent) => {
    try {
      const data: SSEErrorEvent = event.data ? JSON.parse(event.data) : { error: 'Unknown error' };
      handlers.onError?.(data);
      eventSource.close();
      handlers.onClose?.();
    } catch (error) {
      console.error('Error parsing error event:', error);
      handlers.onError?.({ error: 'Connection error' });
    }
  });

  eventSource.onerror = (error) => {
    console.error('SSE connection error:', error);
    handlers.onError?.({ error: 'Connection failed' });
    eventSource.close();
    handlers.onClose?.();
  };

  return eventSource;
}

/**
 * Create SSE connection using fetch (supports custom headers)
 */
export async function createFetchSSE(
  url: string,
  handlers: SSEEventHandler
): Promise<() => void> {
  const token = AuthService.getToken();
  const fullUrl = `${API_BASE_URL}${url}`;

  const abortController = new AbortController();

  try {
    const response = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Use default error message if can't parse JSON
      }

      // Immediately notify error handler
      handlers.onError?.({ error: errorMessage });
      handlers.onClose?.();
      return () => {};
    }

    if (!response.body) {
      const errorMessage = 'No response body received from server';
      handlers.onError?.({ error: errorMessage });
      handlers.onClose?.();
      return () => {};
    }

    handlers.onOpen?.();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const readStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            handlers.onClose?.();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.trim()) continue;

            if (line.startsWith('event: ')) {
              const eventType = line.slice(7).trim();
              continue;
            }

            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);

                // Determine event type from data structure
                if (parsed.progress !== undefined) {
                  handlers.onProgress?.(parsed);
                } else if (parsed.videoId !== undefined) {
                  handlers.onComplete?.(parsed);
                  reader.cancel();
                  handlers.onClose?.();
                  break;
                } else if (parsed.error !== undefined) {
                  handlers.onError?.(parsed);
                  reader.cancel();
                  handlers.onClose?.();
                  break;
                }
              } catch (error) {
                console.error('Error parsing SSE data:', error);
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Stream reading error:', error);
          handlers.onError?.({ error: 'Stream reading failed' });
        }
        handlers.onClose?.();
      }
    };

    readStream();

    // Return cleanup function
    return () => {
      abortController.abort();
      reader.cancel();
    };
  } catch (error) {
    console.error('Fetch SSE error:', error);
    handlers.onError?.({ error: (error as Error).message });
    handlers.onClose?.();
    return () => {};
  }
}

export default createFetchSSE;
