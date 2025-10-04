# Quickstart: Video Generation Platform

This document provides step-by-step instructions to validate the video generation platform implementation through manual testing.

## Prerequisites

- Backend server running (default: http://localhost:3000 or http://localhost:8000)
- Frontend application running (default: http://localhost:5173 or http://localhost:3001)
- Database initialized with migrations applied
- API credentials configured in backend environment variables

## User Story 1: User Registration & Login

### Scenario: New User Registration

**Steps**:
1. Navigate to the frontend application homepage
2. Click "Register" or "Sign Up" button
3. Fill in the registration form:
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
   - Username (optional): `testuser`
4. Click "Submit" or "Create Account"

**Expected Results**:
- ✅ Registration form validates email format
- ✅ Registration form enforces minimum 8 character password
- ✅ User account is created in database
- ✅ JWT token is returned and stored
- ✅ User is automatically logged in
- ✅ User is redirected to video creation page or profile
- ✅ Success message displayed

**Validation**:
```bash
# Query database to verify user exists
psql -d sora_db -c "SELECT id, email, username FROM users WHERE email = 'testuser@example.com';"
```

---

### Scenario: User Login

**Steps**:
1. Log out from current session (if logged in)
2. Navigate to login page
3. Enter credentials:
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
4. Click "Login" or "Sign In"

**Expected Results**:
- ✅ Login validates credentials against bcrypt hash
- ✅ JWT token is issued
- ✅ User is redirected to video creation page
- ✅ User profile information displayed (avatar, username)
- ✅ Invalid credentials show appropriate error message

---

## User Story 2: Video Generation

### Scenario: Create Portrait Video

**Steps**:
1. Ensure user is logged in
2. Navigate to video creation page
3. Enter a text prompt: `"A cat playing piano in a jazz club"`
4. Select orientation: **Portrait** (should be default)
5. Click "Generate Video" or similar submit button

**Expected Results**:
- ✅ Form validates prompt is not empty
- ✅ VideoJob is created with status "pending"
- ✅ Job ID is returned immediately (non-blocking)
- ✅ User is shown progress UI
- ✅ SSE connection is established to backend
- ✅ Progress updates stream in real-time:
  - "⌛️ Task queued, please wait..."
  - "🏃 Progress: 36.0%"
  - "🏃 Progress: 50.7%"
  - "🏃 Progress: 99.0%"
  - "✅ Video generated successfully"
- ✅ Video player shows final video when complete
- ✅ Video URL is saved to database

**Validation**:
```bash
# Check job status in database
psql -d sora_db -c "SELECT id, status, progress FROM video_jobs ORDER BY created_at DESC LIMIT 1;"

# Check created video
psql -d sora_db -c "SELECT id, prompt, orientation, video_url FROM videos ORDER BY created_at DESC LIMIT 1;"
```

**API Verification**:
```bash
# Monitor SSE stream
curl -N -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/videos/jobs/JOB_ID/stream
```

---

### Scenario: Create Landscape Video

**Steps**:
1. Navigate to video creation page
2. Enter a text prompt: `"Sunset over mountains with birds flying"`
3. Select orientation: **Landscape**
4. Click "Generate Video"

**Expected Results**:
- ✅ Orientation selector UI matches design (`screen_shoot/create_video_2.png`)
- ✅ Backend uses model `sora_video2-hd-landscape` (not portrait)
- ✅ Video generation proceeds with landscape aspect ratio
- ✅ Progress updates display correctly
- ✅ Final video is landscape format

**Validation**:
```bash
# Verify model_used field
psql -d sora_db -c "SELECT model_used, orientation FROM videos ORDER BY created_at DESC LIMIT 1;"
# Expected: model_used = 'sora_video2-hd-landscape', orientation = 'landscape'
```

---

### Scenario: Concurrent Video Generation

**Steps**:
1. Start first video generation job
2. Before first job completes, submit second video generation request
3. Monitor both jobs' progress

**Expected Results**:
- ✅ Both jobs are queued independently
- ✅ Both SSE streams work simultaneously
- ✅ Progress updates for each job are independent
- ✅ Both jobs complete successfully
- ✅ Database contains two separate video records

---

## User Story 3: Video Gallery & Playback

### Scenario: View User's Video Gallery

**Steps**:
1. Navigate to profile page or video gallery
2. View list of previously generated videos

**Expected Results**:
- ✅ All videos belong to authenticated user only
- ✅ Videos displayed in reverse chronological order (newest first)
- ✅ Each video card shows:
  - Thumbnail (if available) or placeholder
  - Prompt text (or truncated version)
  - Orientation badge (Portrait/Landscape)
  - Creation date
- ✅ Pagination works (if more than 20 videos)
- ✅ UI matches design (`screen_shoot/profile.png`)

---

### Scenario: Play Video

**Steps**:
1. Click on a video card or "Play" button
2. Video player opens (modal or inline)
3. Click play controls

**Expected Results**:
- ✅ Video loads from stored URL
- ✅ Video plays smoothly in correct orientation
- ✅ Player controls work (play, pause, fullscreen)
- ✅ Video can be closed and reopened

---

## User Story 4: Error Handling

### Scenario: External API Failure

**Steps**:
1. Simulate API failure (disconnect network or block endpoint)
2. Submit video generation request

**Expected Results**:
- ✅ Error is caught gracefully
- ✅ User sees friendly error message
- ✅ VideoJob status updated to "failed"
- ✅ Error message stored in database
- ✅ SSE stream closes with error event

---

### Scenario: Invalid Authentication

**Steps**:
1. Remove or corrupt JWT token
2. Try to access protected route (e.g., create video)

**Expected Results**:
- ✅ 401 Unauthorized response
- ✅ User redirected to login page
- ✅ Error message: "Please login to continue"

---

### Scenario: Unauthorized Video Access

**Steps**:
1. Login as User A
2. Note a video ID from User A's gallery
3. Logout and login as User B
4. Try to access User A's video directly (via URL or API)

**Expected Results**:
- ✅ 403 Forbidden response
- ✅ Video not displayed
- ✅ Error message: "You don't have permission to view this video"

---

## Performance Validation

### Streaming Latency

**Test**:
1. Submit video generation request
2. Measure time to first progress update

**Expected**:
- ✅ Initial response < 2 seconds
- ✅ First progress update < 5 seconds
- ✅ Progress updates at regular intervals (every 2-3 seconds)

---

### Database Performance

**Test**:
```bash
# Query user's 100 videos
EXPLAIN ANALYZE SELECT * FROM videos WHERE user_id = 'USER_ID' ORDER BY created_at DESC LIMIT 20;
```

**Expected**:
- ✅ Uses index on (user_id, created_at)
- ✅ Query execution < 50ms

---

## Security Validation

### Password Security

**Test**:
```bash
# Check password is hashed, not plain text
psql -d sora_db -c "SELECT password_hash FROM users LIMIT 1;"
```

**Expected**:
- ✅ Password hash starts with `$2b$` or `$2a$` (bcrypt)
- ✅ Hash length is 60 characters

---

### API Token Security

**Test**:
1. Inspect frontend network requests in browser DevTools
2. Check for API credentials

**Expected**:
- ✅ Sora API token is NOT visible in frontend
- ✅ All video generation requests go through backend
- ✅ JWT tokens use HTTP-only cookies or secure storage

---

## Integration Test Checklist

- [ ] User can register with valid email and password
- [ ] User cannot register with duplicate email
- [ ] User can login with correct credentials
- [ ] User cannot login with wrong password
- [ ] User can create portrait video (default)
- [ ] User can create landscape video
- [ ] Progress updates stream in real-time
- [ ] Video appears in user's gallery after completion
- [ ] User can play generated video
- [ ] User can view multiple videos in gallery
- [ ] Pagination works for large galleries
- [ ] User cannot access other users' videos
- [ ] Unauthenticated users redirected to login
- [ ] API errors handled gracefully
- [ ] Multiple concurrent jobs work correctly
- [ ] Database indexes improve query performance
- [ ] Passwords are bcrypt hashed
- [ ] API credentials not exposed to frontend

---

## Manual Testing Script

For automated testing of the quickstart scenarios, use this script:

```bash
#!/bin/bash

API_BASE="http://localhost:3000/api"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="TestPass123!"

echo "1. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "$REGISTER_RESPONSE"

TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.token')
echo "Token: $TOKEN"

echo -e "\n2. Testing Video Generation (Portrait)..."
JOB_RESPONSE=$(curl -s -X POST "$API_BASE/videos" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"prompt\":\"A cat playing piano\",\"orientation\":\"portrait\"}")
echo "$JOB_RESPONSE"

JOB_ID=$(echo "$JOB_RESPONSE" | jq -r '.job.id')
echo "Job ID: $JOB_ID"

echo -e "\n3. Streaming Progress..."
curl -N -H "Authorization: Bearer $TOKEN" \
  "$API_BASE/videos/jobs/$JOB_ID/stream"

echo -e "\n4. Fetching User Videos..."
curl -s -H "Authorization: Bearer $TOKEN" \
  "$API_BASE/videos?limit=10" | jq

echo -e "\nTests complete!"
```

---

## Success Criteria

All items in the Integration Test Checklist must pass. Users should be able to:

1. ✅ Register and login without errors
2. ✅ Generate videos in both portrait and landscape
3. ✅ See real-time progress updates
4. ✅ View and play their generated videos
5. ✅ Experience secure, isolated access to their own content
