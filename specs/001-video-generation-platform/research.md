# Research: Video Generation Platform

## Technology Stack Decisions

### Backend Framework
**Decision**: Node.js with Express.js (or Python with FastAPI as alternative)

**Rationale**:
- Excellent streaming support (SSE/WebSocket) built-in
- Large ecosystem for authentication (Passport.js, JWT libraries)
- ORM support (Prisma, TypeORM, Sequelize for Node; SQLAlchemy for Python)
- Strong async/await patterns for handling concurrent requests
- Easy integration with frontend TypeScript types

**Alternatives Considered**:
- Python FastAPI: Also excellent choice, strong typing, async support
- Django: More heavyweight, REST framework well-established but streaming less natural
- Go: Excellent performance but smaller ecosystem for rapid development

### Frontend Framework
**Decision**: React 18 with TypeScript + Vite

**Rationale**:
- Most popular framework with largest component ecosystem
- Excellent state management options (Zustand, Redux Toolkit, Context)
- Strong TypeScript support
- Server-Sent Events (SSE) libraries well-supported (EventSource API)
- Component-based architecture matches design requirements
- Vite provides fast development experience

**Alternatives Considered**:
- Vue 3: Excellent choice, slightly simpler API, smaller ecosystem
- Svelte: Most performant, smallest bundle size, less mature ecosystem
- Next.js: Adds SSR complexity not needed for this use case

### Database
**Decision**: PostgreSQL with Prisma ORM (Node.js) or SQLAlchemy (Python)

**Rationale**:
- ACID compliance critical for user data and video metadata
- Excellent relationship support (users → videos)
- JSON field support for storing API responses/metadata
- Prisma provides type-safe queries, auto-migrations
- Wide hosting support (Supabase, Railway, Docker)

**Alternatives Considered**:
- MySQL: Equally viable, slightly less feature-rich
- MongoDB: NoSQL flexibility not needed, relationships are core requirement
- SQLite: Too limited for production multi-user scenario

### Authentication
**Decision**: JWT-based authentication with bcrypt password hashing

**Rationale**:
- Stateless tokens enable horizontal scaling
- Industry standard approach
- Easy to implement with Passport.js or custom middleware
- Refresh token pattern for security

**Alternatives Considered**:
- Session-based: Requires session store, harder to scale
- OAuth only: Adds complexity, still need user database
- Auth0/Clerk: External dependency, cost implications

### Streaming API Integration
**Decision**: Server-Sent Events (SSE) from backend to frontend, HTTP streaming to external API

**Rationale**:
- SSE perfect for unidirectional progress updates
- EventSource API native browser support
- Backend can consume external streaming API and relay to frontend
- Simpler than WebSocket for this use case (no bidirectional needed)

**Implementation Pattern**:
1. Frontend opens SSE connection to backend endpoint
2. Backend initiates streaming request to external Sora API
3. Backend parses streamed chunks, extracts progress updates
4. Backend forwards progress to frontend via SSE
5. Backend stores final video URL in database when complete

**Alternatives Considered**:
- WebSocket: Overkill for unidirectional updates
- Long polling: Less efficient, more server load
- Direct frontend → API: Exposes API token, CORS issues

## Best Practices Identified

### Video Generation Flow
1. User submits prompt + orientation
2. Backend validates auth, creates VideoJob record (status: pending)
3. Backend returns job ID immediately (non-blocking)
4. Frontend opens SSE connection with job ID
5. Backend worker starts streaming API call
6. Progress updates streamed to frontend (36% → 99% → complete)
7. Final video URL saved to database, associated with user
8. SSE connection closed with completion event

### Security Considerations
- Never expose Sora API token to frontend
- All video generation requests must go through authenticated backend
- Validate user owns requested videos before serving URLs
- Rate limit video generation per user to prevent abuse
- Hash passwords with bcrypt (12+ rounds)
- Use HTTPS in production
- Set secure HTTP-only cookies for refresh tokens

### Error Handling
- External API errors (invite full, network failure) → graceful UI message
- Timeout handling for stuck generation jobs (>10 min)
- Retry logic for transient API failures
- Database transaction rollbacks on failures
- Frontend error boundaries for component crashes

### State Management (Frontend)
- User state: auth token, user profile (Zustand/Context)
- Video gallery: list of user's videos (React Query for caching)
- Active generation: real-time progress updates (local component state + SSE)
- Orientation selection: form state (React Hook Form)

### Testing Strategy
- Backend contract tests: API request/response schemas
- Backend integration tests: Auth flow, video generation flow end-to-end
- Frontend unit tests: Components, services, state management
- Frontend integration tests: User flows (register → login → create video)
- Mock external Sora API in tests

## UI Component Architecture

### Pages
1. **LoginPage**: Email/password form, link to register
2. **RegisterPage**: Email/password/confirm form
3. **VideoCreationPage**: Prompt input, orientation selector (portrait/landscape), submit button, active generation progress
4. **ProfilePage**: User info, gallery of generated videos, video playback

### Reusable Components
- **OrientationSelector**: Toggle/radio for portrait vs landscape (matches design)
- **ProgressBar**: Animated progress with percentage display
- **VideoCard**: Thumbnail, title (prompt), orientation badge, play button
- **VideoPlayer**: Modal or inline player for video playback
- **AuthGuard**: HOC/wrapper for protected routes

### Design Implementation Notes
Based on `screen_shoot/` images:
- Dark theme with gradient backgrounds
- Profile page shows user avatar, stats (videos/cameos/followers)
- Video creation has "Add cameo" avatar selector row
- Draft videos shown with preview thumbnails
- Orientation selector appears as overlay buttons (Portrait/Landscape)
- Progress updates shown in real-time during generation

## Deployment Considerations
- Frontend: Static hosting (Vercel, Netlify, S3 + CloudFront)
- Backend: Container deployment (Docker on Railway, Render, DigitalOcean)
- Database: Managed PostgreSQL (Supabase, Railway, AWS RDS)
- Environment variables: API endpoint, token, DB connection, JWT secret
- CORS configuration: Allow frontend origin
- Reverse proxy/nginx if needed for production

## Performance Optimization
- Frontend: Code splitting, lazy loading for video player
- Backend: Connection pooling for database
- Caching: User profiles, video metadata (short TTL)
- CDN for static assets
- Pagination for video galleries (limit 20 per page)
- Debounce prompt input validation

## Open Questions Resolved
All technical context items resolved. No NEEDS CLARIFICATION remaining.
