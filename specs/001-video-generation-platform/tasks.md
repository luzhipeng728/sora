# Tasks: Video Generation Platform

**Input**: Design documents from `/specs/001-video-generation-platform/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Backend**: `backend/src/`, `backend/tests/`
- **Frontend**: `frontend/src/`, `frontend/tests/`
- **Shared**: `shared/types/`

---

## Phase 3.1: Setup & Infrastructure

- [x] T001 [P] Create backend project structure with directories: backend/src/{models,services,api,middleware,db}, backend/tests/{contract,integration,unit}
- [x] T002 [P] Create frontend project structure with directories: frontend/src/{components,pages,services,stores,utils}, frontend/tests/{unit,integration}
- [x] T003 [P] Initialize backend package.json with Node.js 18+ dependencies: express, cors, dotenv, bcryptjs, jsonwebtoken, prisma (or sequelize), node-fetch
- [x] T004 [P] Initialize frontend package.json with dependencies: react@18, typescript@5, vite, zustand (or redux-toolkit), react-router-dom, axios
- [x] T005 [P] Configure TypeScript for backend in backend/tsconfig.json with strict mode and ES2022 target
- [x] T006 [P] Configure TypeScript for frontend in frontend/tsconfig.json with React JSX and strict mode
- [x] T007 Create shared/types/index.ts with TypeScript interfaces for User, Video, VideoJob, API requests/responses
- [x] T008 Setup Prisma schema in backend/prisma/schema.prisma with User, Video, VideoJob models matching data-model.md
- [ ] T009 Create database migration for initial schema (users, videos, video_jobs tables with indexes)
- [x] T010 Create backend/.env.example with DATABASE_URL, JWT_SECRET, SORA_API_URL, SORA_API_TOKEN placeholders
- [x] T011 [P] Setup ESLint and Prettier for backend in backend/.eslintrc.json
- [x] T012 [P] Setup ESLint and Prettier for frontend in frontend/.eslintrc.json
- [x] T013 Create backend/src/db/client.ts for Prisma client initialization with connection pooling
- [x] T014 [P] Create frontend/.env.example with VITE_API_URL placeholder

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests (Backend API)

- [ ] T015 [P] Contract test POST /api/auth/register in backend/tests/contract/auth-register.test.ts - validates 201 response with user + token, 400 for invalid input, 409 for duplicate email
- [ ] T016 [P] Contract test POST /api/auth/login in backend/tests/contract/auth-login.test.ts - validates 200 response with user + token, 401 for invalid credentials
- [ ] T017 [P] Contract test GET /api/auth/me in backend/tests/contract/auth-me.test.ts - validates 200 response with user data when authenticated, 401 when not authenticated
- [ ] T018 [P] Contract test GET /api/videos in backend/tests/contract/videos-get.test.ts - validates 200 response with videos array and pagination, supports page/limit/status query params
- [ ] T019 [P] Contract test POST /api/videos in backend/tests/contract/videos-create.test.ts - validates 202 response with job + streamUrl, 400 for invalid prompt, 401 when not authenticated
- [ ] T020 [P] Contract test GET /api/videos/:videoId in backend/tests/contract/videos-get-id.test.ts - validates 200 response with video details, 403 for other user's video, 404 for not found
- [ ] T021 [P] Contract test GET /api/videos/jobs/:jobId in backend/tests/contract/jobs-get.test.ts - validates 200 response with job status/progress, 403 for other user's job
- [ ] T022 [P] Contract test GET /api/videos/jobs/:jobId/stream in backend/tests/contract/jobs-stream.test.ts - validates SSE stream with progress events, complete event, error event

### Integration Tests (User Flows)

- [ ] T023 [P] Integration test: User registration flow in backend/tests/integration/user-registration.test.ts - creates user, hashes password, returns JWT, verifies DB record
- [ ] T024 [P] Integration test: User login flow in backend/tests/integration/user-login.test.ts - validates credentials with bcrypt, issues JWT, handles invalid password
- [ ] T025 [P] Integration test: Create portrait video in backend/tests/integration/video-portrait.test.ts - creates job, verifies model 'sora_video2-hd-portrait', streams progress, creates video record
- [ ] T026 [P] Integration test: Create landscape video in backend/tests/integration/video-landscape.test.ts - creates job, verifies model 'sora_video2-hd-landscape', streams progress
- [ ] T027 [P] Integration test: Video retrieval for user in backend/tests/integration/video-retrieval.test.ts - queries user's videos with pagination, filters by status
- [ ] T028 [P] Integration test: Unauthorized video access in backend/tests/integration/security-unauthorized.test.ts - blocks access to other user's videos (403), requires auth (401)

### Frontend Tests (Components & Flows)

- [ ] T029 [P] Unit test: OrientationSelector component in frontend/tests/unit/OrientationSelector.test.tsx - toggles between portrait/landscape, defaults to portrait
- [ ] T030 [P] Unit test: ProgressBar component in frontend/tests/unit/ProgressBar.test.tsx - displays progress percentage, updates in real-time
- [ ] T031 [P] Unit test: VideoCard component in frontend/tests/unit/VideoCard.test.tsx - renders prompt, orientation badge, thumbnail
- [ ] T032 [P] Integration test: Login flow in frontend/tests/integration/login.test.tsx - submits credentials, stores token, redirects to dashboard

---

## Phase 3.3: Backend Core Implementation

### Database & Models

- [ ] T033 Run Prisma migration to create database schema: npx prisma migrate dev --name initial_schema
- [ ] T034 [P] User model methods in backend/src/models/User.ts - create, findByEmail, findById, hash password with bcrypt (12 rounds)
- [ ] T035 [P] Video model methods in backend/src/models/Video.ts - create, findByUserId with pagination, findById, validate orientation/prompt
- [ ] T036 [P] VideoJob model methods in backend/src/models/VideoJob.ts - create, updateProgress, updateStatus, findById, handle state transitions

### Services

- [ ] T037 AuthService in backend/src/services/AuthService.ts - register(email, password), login(email, password), generateJWT(userId), validateJWT(token)
- [ ] T038 VideoGenerationService in backend/src/services/VideoGenerationService.ts - createJob(userId, prompt, orientation), streamProgress(jobId), callSoraAPI(prompt, model)
- [ ] T039 Implement streaming API client in backend/src/services/VideoGenerationService.ts - parse SSE chunks, extract progress percentages, handle completion/errors
- [ ] T040 Complete video creation in backend/src/services/VideoGenerationService.ts - when job completes, extract videoUrl from API response, create Video record, link to VideoJob

### Middleware

- [ ] T041 Auth middleware in backend/src/middleware/auth.ts - verify JWT from Authorization header, attach user to request, return 401 if invalid
- [ ] T042 Error handler middleware in backend/src/middleware/errorHandler.ts - catch errors, return appropriate status codes, log errors
- [ ] T043 [P] CORS middleware configuration in backend/src/middleware/cors.ts - allow frontend origin, credentials support
- [ ] T044 [P] Request validation middleware in backend/src/middleware/validation.ts - validate email format, password strength, prompt length

### API Endpoints

- [ ] T045 POST /api/auth/register endpoint in backend/src/api/auth.ts - validate input, check email uniqueness, hash password, create user, return user + JWT
- [ ] T046 POST /api/auth/login endpoint in backend/src/api/auth.ts - find user, compare password with bcrypt, generate JWT, return user + token
- [ ] T047 GET /api/auth/me endpoint in backend/src/api/auth.ts - require auth middleware, return current user from JWT
- [ ] T048 GET /api/videos endpoint in backend/src/api/videos.ts - require auth, get user's videos with pagination (page, limit, status query params)
- [ ] T049 POST /api/videos endpoint in backend/src/api/videos.ts - require auth, validate prompt/orientation, create VideoJob, return job + streamUrl
- [ ] T050 GET /api/videos/:videoId endpoint in backend/src/api/videos.ts - require auth, verify ownership, return video details
- [ ] T051 GET /api/videos/jobs/:jobId endpoint in backend/src/api/videos.ts - require auth, verify ownership, return job status/progress
- [ ] T052 GET /api/videos/jobs/:jobId/stream endpoint in backend/src/api/videos.ts - require auth, verify ownership, setup SSE stream, relay progress from VideoGenerationService

### Server Setup

- [ ] T053 Express server setup in backend/src/index.ts - configure middleware (CORS, JSON parser, error handler), mount routes, start server on port from env
- [ ] T054 Environment configuration in backend/src/config.ts - load and validate required env vars (DATABASE_URL, JWT_SECRET, SORA_API_URL, SORA_API_TOKEN)

---

## Phase 3.4: Frontend Implementation

### Routing & Layout

- [ ] T055 Setup React Router in frontend/src/App.tsx - routes for /, /login, /register, /videos/create, /profile with auth guards
- [ ] T056 [P] Create AuthGuard component in frontend/src/components/AuthGuard.tsx - redirect to /login if not authenticated
- [ ] T057 [P] Create Layout component in frontend/src/components/Layout.tsx - navbar, footer, user menu

### Pages

- [ ] T058 [P] LoginPage in frontend/src/pages/LoginPage.tsx - email/password form, submit to API, store token, redirect to /videos/create
- [ ] T059 [P] RegisterPage in frontend/src/pages/RegisterPage.tsx - email/password/username form, submit to API, auto-login, redirect
- [ ] T060 VideoCreationPage in frontend/src/pages/VideoCreationPage.tsx - prompt textarea, orientation selector, submit button, progress display on creation
- [ ] T061 ProfilePage in frontend/src/pages/ProfilePage.tsx - user info display, video gallery grid, pagination controls

### Components

- [ ] T062 [P] OrientationSelector component in frontend/src/components/OrientationSelector.tsx - portrait/landscape toggle matching design, defaults to portrait
- [ ] T063 [P] ProgressBar component in frontend/src/components/ProgressBar.tsx - animated bar, percentage text, status messages ("⌛️ queued", "🏃 progress", "✅ complete")
- [ ] T064 [P] VideoCard component in frontend/src/components/VideoCard.tsx - thumbnail, prompt text, orientation badge, creation date, play button
- [ ] T065 [P] VideoPlayer component in frontend/src/components/VideoPlayer.tsx - video element with controls, fullscreen support, modal/inline modes

### Services & Utilities

- [ ] T066 API client in frontend/src/services/api.ts - axios instance with base URL, auth interceptor (attach JWT), error handling
- [ ] T067 Auth service in frontend/src/services/authService.ts - register(email, password), login(email, password), logout(), getToken(), getCurrentUser()
- [ ] T068 Video service in frontend/src/services/videoService.ts - createVideo(prompt, orientation), getVideos(page, limit), getVideo(id)
- [ ] T069 SSE utility in frontend/src/utils/sse.ts - createEventSource(url, token), handle progress/complete/error events, auto-reconnect logic

### State Management

- [ ] T070 User store in frontend/src/stores/userStore.ts - current user state, login/logout actions, token persistence (localStorage)
- [ ] T071 Video store in frontend/src/stores/videoStore.ts - videos list, active job, progress state, fetch/create actions

### Styling

- [ ] T072 [P] Global styles in frontend/src/styles/globals.css - dark theme, typography, color variables matching screen_shoot/ design
- [ ] T073 [P] Component styles matching design specifications from screen_shoot/*.png files - gradient backgrounds, card layouts, profile stats

---

## Phase 3.5: Integration & Streaming

- [ ] T074 Integrate SSE streaming in frontend/src/pages/VideoCreationPage.tsx - open SSE connection after job creation, update ProgressBar in real-time, handle completion
- [ ] T075 Video gallery integration in frontend/src/pages/ProfilePage.tsx - fetch videos on mount, implement pagination, handle empty state
- [ ] T076 Video playback integration in frontend/src/components/VideoPlayer.tsx - load video from URL, handle loading states, error fallbacks
- [ ] T077 Test backend→frontend flow - start backend server, start frontend dev server, verify CORS, test auth flow end-to-end
- [ ] T078 Implement concurrent job handling - verify multiple users can generate videos simultaneously without conflicts

---

## Phase 3.6: Polish & Security

- [ ] T079 [P] Add input validation to frontend forms in frontend/src/pages/ - email format, password strength indicator, prompt character count
- [ ] T080 [P] Error handling in frontend - display user-friendly error messages, handle network failures, API errors (invite_full, timeout)
- [ ] T081 Security audit: verify bcrypt rounds ≥12 in backend/src/models/User.ts
- [ ] T082 Security audit: verify JWT secret is strong (≥32 chars) in backend/.env
- [ ] T083 Security audit: verify Sora API token never exposed to frontend (check network tab in browser DevTools)
- [ ] T084 [P] Loading states for all async operations - spinners, skeleton screens, disabled buttons during submission
- [ ] T085 [P] Add request rate limiting in backend/src/middleware/rateLimit.ts - limit video generation to 5 per user per hour
- [ ] T086 [P] Add timeout handling for stuck jobs in backend/src/services/VideoGenerationService.ts - fail jobs after 15 minutes
- [ ] T087 Implement video gallery pagination UI in frontend/src/pages/ProfilePage.tsx - page buttons, results per page selector
- [ ] T088 Match UI to design specs - verify orientation selector UI matches screen_shoot/create_video_2.png
- [ ] T089 Match UI to design specs - verify profile page layout matches screen_shoot/profile.png
- [ ] T090 [P] Add accessibility - ARIA labels, keyboard navigation, screen reader support
- [ ] T091 Performance: verify initial API response <2s, verify progress updates stream every 2-3s
- [ ] T092 Performance: verify database queries use indexes - run EXPLAIN ANALYZE on videos query

---

## Phase 3.7: Documentation & Testing

- [ ] T093 [P] Create backend/README.md - setup instructions, environment variables, running migrations, starting server
- [ ] T094 [P] Create frontend/README.md - setup instructions, environment variables, starting dev server, building for production
- [ ] T095 Execute quickstart.md scenarios manually - verify all user stories pass (registration, login, video creation, playback, security)
- [ ] T096 [P] Add API documentation - generate Swagger/OpenAPI docs from contracts/*.yaml, serve at /api/docs
- [ ] T097 Run all contract tests - verify all backend API endpoints pass contract tests
- [ ] T098 Run all integration tests - verify all user flows pass integration tests
- [ ] T099 Run all frontend tests - verify all components and pages pass unit/integration tests
- [ ] T100 [P] Create deployment guide in docs/DEPLOYMENT.md - Docker setup, database migration steps, environment configuration

---

## Dependencies

**Setup Phase (T001-T014)** must complete before all other tasks

**Test Phase (T015-T032)** must complete and FAIL before implementation (T033-T076)

**Backend Core (T033-T054)** dependencies:
- T033 (DB migration) blocks T034-T036 (models)
- T034-T036 (models) block T037-T040 (services)
- T037-T040 (services) block T045-T052 (endpoints)
- T041-T044 (middleware) can run parallel with services
- T045-T054 (endpoints + server) complete backend core

**Frontend (T055-T073)** dependencies:
- T055 (routing) blocks T056-T061 (pages/guards)
- T062-T065 (components) can run parallel [P]
- T066-T069 (services/utils) can run parallel with components
- T070-T071 (state) can run parallel with services
- T072-T073 (styles) can run parallel [P]

**Integration (T074-T078)** requires both backend and frontend core complete

**Polish (T079-T092)** requires integration complete

**Documentation (T093-T100)** can run parallel [P] after polish

---

## Parallel Execution Examples

### Contract Tests (can all run in parallel):
```bash
# Launch all contract tests simultaneously
T015: "Write contract test for POST /api/auth/register in backend/tests/contract/auth-register.test.ts"
T016: "Write contract test for POST /api/auth/login in backend/tests/contract/auth-login.test.ts"
T017: "Write contract test for GET /api/auth/me in backend/tests/contract/auth-me.test.ts"
T018: "Write contract test for GET /api/videos in backend/tests/contract/videos-get.test.ts"
T019: "Write contract test for POST /api/videos in backend/tests/contract/videos-create.test.ts"
T020: "Write contract test for GET /api/videos/:videoId in backend/tests/contract/videos-get-id.test.ts"
T021: "Write contract test for GET /api/videos/jobs/:jobId in backend/tests/contract/jobs-get.test.ts"
T022: "Write contract test for GET /api/videos/jobs/:jobId/stream in backend/tests/contract/jobs-stream.test.ts"
```

### Model Creation (independent entities):
```bash
# Launch model creation in parallel
T034: "Create User model in backend/src/models/User.ts with bcrypt password hashing"
T035: "Create Video model in backend/src/models/Video.ts with validation"
T036: "Create VideoJob model in backend/src/models/VideoJob.ts with state transitions"
```

### Frontend Components (independent files):
```bash
# Launch component creation in parallel
T062: "Create OrientationSelector component in frontend/src/components/OrientationSelector.tsx"
T063: "Create ProgressBar component in frontend/src/components/ProgressBar.tsx"
T064: "Create VideoCard component in frontend/src/components/VideoCard.tsx"
T065: "Create VideoPlayer component in frontend/src/components/VideoPlayer.tsx"
```

---

## Notes

- **Verify tests FAIL** before implementation (T015-T032)
- **Use TDD**: Write test → See it fail → Implement → See it pass
- **Commit after each task** to track progress
- **Environment setup**: Copy .env.example to .env and fill values before running
- **Database**: Run migrations (T033) before any backend tests
- **Sora API**: Hardcoded endpoint `http://172.93.101.237:9800/sora/v1/chat/completions`
- **Sora API Token**: `31243dca-83b9-44dd-8181-6162430ae845` (store in backend env only)
- **Portrait model**: `sora_video2-hd-portrait` (default)
- **Landscape model**: `sora_video2-hd-landscape`

---

## Task Count Summary

- **Phase 3.1 Setup**: 14 tasks (T001-T014)
- **Phase 3.2 Tests**: 18 tasks (T015-T032)
- **Phase 3.3 Backend**: 22 tasks (T033-T054)
- **Phase 3.4 Frontend**: 19 tasks (T055-T073)
- **Phase 3.5 Integration**: 5 tasks (T074-T078)
- **Phase 3.6 Polish**: 14 tasks (T079-T092)
- **Phase 3.7 Documentation**: 8 tasks (T093-T100)

**Total**: 100 tasks
