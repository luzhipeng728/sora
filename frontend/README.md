# Sora Video Generation Platform - Frontend

React-based frontend application for the Sora video generation platform.

## Features

- ✅ User authentication (register, login)
- ✅ Video creation with text prompts
- ✅ Real-time progress tracking (SSE)
- ✅ Portrait/landscape orientation selection
- ✅ Video gallery with pagination
- ✅ Video playback modal
- ✅ Responsive design
- ✅ Dark theme UI

## Prerequisites

- Node.js 18+ or compatible version
- Backend API running (see backend/README.md)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create `.env` file (or use existing):

```env
VITE_API_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will start on `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable components
│   │   ├── AuthGuard.tsx
│   │   ├── OrientationSelector.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── VideoCard.tsx
│   │   └── VideoPlayer.tsx
│   ├── pages/            # Page components
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── VideoCreationPage.tsx
│   │   └── ProfilePage.tsx
│   ├── services/         # API services
│   │   ├── api.ts        # Axios instance
│   │   ├── authService.ts
│   │   └── videoService.ts
│   ├── stores/           # Zustand state management
│   │   ├── userStore.ts
│   │   └── videoStore.ts
│   ├── utils/            # Utilities
│   │   └── sse.ts        # SSE helper
│   ├── styles/           # Global styles
│   │   └── globals.css
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
└── index.html
```

## Routes

- `/` - Redirects to `/videos/create`
- `/login` - Login page
- `/register` - Registration page
- `/videos/create` - Video creation page (protected)
- `/profile` - User profile and video gallery (protected)

## Components

### OrientationSelector
Toggle between portrait and landscape video orientation.

### ProgressBar
Displays real-time generation progress with status indicators:
- ⌛️ Pending
- 🏃 Processing (with percentage)
- ✅ Completed
- ❌ Failed

### VideoCard
Video thumbnail card with:
- Thumbnail/placeholder
- Prompt text
- Orientation badge
- Creation date
- Play button overlay

### VideoPlayer
Modal video player with:
- Video controls
- Fullscreen support
- Orientation indicator
- Model information

## State Management

### User Store (Zustand)
- User authentication state
- Login/register/logout actions
- Token persistence

### Video Store (Zustand)
- Videos list with pagination
- Active generation job
- Progress tracking
- Video CRUD operations

## API Integration

All API calls use Axios with:
- Automatic JWT token injection
- Error handling
- 401 redirect to login

### SSE Integration

Real-time progress updates via Server-Sent Events:

```typescript
createFetchSSE('/api/videos/jobs/:id/stream', {
  onProgress: (data) => updateProgress(data.progress),
  onComplete: (data) => handleComplete(data),
  onError: (error) => handleError(error),
});
```

## Styling

Dark theme with:
- CSS custom properties (variables)
- Gradient accents
- Smooth transitions
- Responsive breakpoints
- Mobile-first approach

## Development

### Adding a New Page

1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Wrap with `<AuthGuard>` if protected

### Adding a Component

1. Create in `src/components/`
2. Follow TypeScript interfaces from `shared/types/`
3. Add styles in component file or `globals.css`

## Building for Production

```bash
npm run build
```

Output will be in `dist/` directory.

Deploy to:
- Vercel: `vercel deploy`
- Netlify: `netlify deploy --prod`
- Static hosting: Upload `dist/` folder

## Environment Variables

- `VITE_API_URL` - Backend API base URL (required)

## Troubleshooting

### SSE Connection Issues

Ensure:
1. Backend is running
2. CORS is configured correctly
3. JWT token is valid

### API Errors

Check browser console and network tab.
Verify backend `.env` matches frontend expectations.

## License

MIT
