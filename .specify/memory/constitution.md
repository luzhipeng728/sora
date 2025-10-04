<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0
Modified Principles: N/A (initial creation)
Added Sections:
  - Core Principles (5 principles)
  - Technical Architecture Standards
  - Development Workflow
  - Governance
Templates Requiring Updates:
  ✅ plan-template.md - aligned with constitution principles
  ✅ spec-template.md - scope/requirements alignment verified
  ✅ tasks-template.md - task categorization reflects principles
Follow-up TODOs: None
-->

# Sora Video Generation Platform Constitution

## Core Principles

### I. User-Centric Video Generation
The platform MUST prioritize user experience in video generation workflows. Every feature MUST support the complete user journey from prompt submission to video retrieval. Users MUST be able to submit prompts, monitor generation progress via streaming updates, and access completed videos associated with their accounts.

**Rationale**: Video generation is a long-running asynchronous process. Users need visibility into progress and reliable access to their generated content. This principle ensures the platform remains usable and trustworthy despite potentially lengthy generation times.

### II. Asynchronous Job Processing
All video generation requests MUST be handled asynchronously with progress tracking. The system MUST NOT block users while videos are being generated. Progress updates MUST be streamed to provide real-time feedback. Video generation jobs MUST be queued and processed independently of user session state.

**Rationale**: Video generation can take significant time (minutes to hours). Synchronous processing would create poor user experience and resource utilization. Asynchronous processing with progress streaming ensures scalability and user satisfaction.

### III. Secure Authentication & Authorization
User authentication and registration MUST be implemented before any video generation features. All video generation requests MUST be associated with authenticated users. Generated videos MUST be accessible only to the user who created them. User credentials MUST be securely stored and transmitted.

**Rationale**: Video generation consumes significant computational resources. User authentication enables proper resource tracking, quota management, and ensures users can only access their own generated content.

### IV. Data Integrity & Persistence
All user data (accounts, videos, generation history) MUST be persisted in a reliable database. Video metadata and user associations MUST survive system restarts. The system MUST use appropriate database middleware for data access. Lost or corrupted user data is unacceptable.

**Rationale**: Users invest time creating video prompts and waiting for generation. Loss of their generated videos or account data would severely damage trust and usability.

### V. Modern Frontend Architecture
The frontend MUST use a modern, maintainable architecture with clear separation of concerns. Components MUST be reusable and testable. State management MUST be predictable and debuggable. The UI MUST match the approved design specifications in `screen_shoot/`.

**Rationale**: The platform's UI includes complex features (video preview, progress tracking, user profiles, orientation selection). A well-structured frontend ensures maintainability and enables future feature additions without technical debt.

## Technical Architecture Standards

### API Integration
- The video generation API endpoint is hardcoded: `http://172.93.101.237:9800/sora/v1/chat/completions`
- API authentication uses Bearer token: `31243dca-83b9-44dd-8181-6162430ae845`
- The API is streaming (Server-Sent Events) and MUST be consumed as a stream
- Model configuration is fixed (no user selection required)

### Video Orientation
- Two orientation options MUST be supported: Portrait (default) and Landscape
- Portrait mode uses model: `sora_video2-hd-portrait`
- Landscape mode uses model: `sora_video2-hd-landscape`
- Default orientation is Portrait unless user explicitly selects Landscape
- The orientation selection UI MUST match the design in `screen_shoot/create_video_2.png`

### Technology Constraints
- Frontend: Modern JavaScript framework (React/Vue/Svelte recommended)
- Backend: RESTful API with streaming support
- Database: SQL or NoSQL with proper ORM/middleware
- Must support long-running connections for streaming responses
- Must handle concurrent video generation requests per user

## Development Workflow

### Test-Driven Development
- Integration tests MUST be written for critical user flows (registration, login, video generation, video retrieval)
- API streaming functionality MUST have integration tests
- Frontend components MUST have unit tests for state management
- Tests MUST pass before deployment

### Code Quality
- API endpoints MUST have clear error handling and validation
- Database queries MUST use parameterized statements (prevent SQL injection)
- Frontend MUST handle loading states, errors, and edge cases
- Code MUST be reviewed for security vulnerabilities

### Documentation Requirements
- API contracts MUST be documented (request/response formats)
- Database schema MUST be documented
- User authentication flow MUST be documented
- Deployment and configuration MUST be documented

## Governance

### Constitutional Authority
This constitution supersedes all other development practices and decisions. When technical choices conflict with constitutional principles, the constitution takes precedence. Violations MUST be justified in the Complexity Tracking section of implementation plans.

### Amendment Process
1. Proposed changes MUST be documented with rationale
2. Version number MUST be incremented according to semantic versioning:
   - MAJOR: Breaking changes to core principles or governance
   - MINOR: New principles added or existing principles expanded
   - PATCH: Clarifications, wording improvements, non-semantic updates
3. All dependent templates and documentation MUST be updated to reflect amendments
4. Migration plans MUST be provided for breaking changes

### Compliance & Review
- All pull requests MUST verify constitutional compliance
- Design documents MUST include Constitution Check sections
- Complexity introduced without justification MUST be rejected
- Security vulnerabilities violate Principle III and MUST be fixed immediately

### Version Control
- Feature branches follow naming: `###-feature-name`
- Commits MUST reference the principle they implement or uphold
- Breaking changes MUST be approved and documented

**Version**: 1.0.0 | **Ratified**: 2025-10-04 | **Last Amended**: 2025-10-04
