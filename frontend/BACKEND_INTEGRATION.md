# Backend Integration Guide for EduLearn

## Quick Start: Connecting Your Backend

This guide explains how to connect your backend API to the EduLearn frontend.

---

## 1. Configure API Endpoint

**File**: Create `.env.local` in project root

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=15000
```

The frontend will send all API requests to this URL.

---

## 2. Required Backend Endpoints

Your backend must implement these endpoints. All requests include `Authorization: Bearer {jwt_token}` header.

### Authentication Endpoints

```
POST /auth/login
Request:  { email: string, password: string }
Response: {
  token: string (JWT),
  user: {
    userId: string,
    email: string,
    name: string,
    role: "student" | "teacher"
  }
}
Status: 200 success, 401 invalid credentials

POST /auth/register
Request:  { 
  email: string, 
  password: string,
  name: string,
  role: "student" | "teacher"
}
Response: { token: string, user: {...} }
Status: 201 created, 409 already exists

POST /auth/logout
Request:  {}
Response: { success: true }
Status: 200

GET /auth/verify (optional but recommended)
Request:  Authorization header with JWT
Response: { valid: true, user: {...} }
Status: 200 valid, 401 expired/invalid
```

### Course Endpoints

```
GET /courses
Request:  Authorization header
Response: [
  {
    courseId: string,
    title: string,
    description: string,
    category: string,
    instructor: string,
    enrolledAt: ISO timestamp,
    modules: [
      {
        moduleId: string,
        title: string,
        order: number,
        lessons: [
          {
            lessonId: string,
            title: string,
            type: "video" | "pdf" | "quiz",
            order: number,
            contentUrl: string,
            duration?: number,
            completed: boolean
          }
        ]
      }
    ]
  }
]
Status: 200

GET /courses/:courseId
Request:  Authorization header
Response: { (same as single course object) }
Status: 200, 404 not found

GET /courses/:courseId/download
Request:  Authorization header
Response: {
  downloads: [
    {
      lessonId: string,
      videoUrl: string,
      pdfUrl: string,
      quizData: object
    }
  ]
}
Status: 200
Purpose: Returns downloadable content URLs
```

### Progress Tracking

```
POST /progress
Request:  {
  lessonId: string,
  courseId: string,
  completedAt: ISO timestamp,
  watchedDuration?: number,
  status: "in-progress" | "completed"
}
Response: {
  progressId: string,
  userId: string,
  lessonId: string,
  courseId: string,
  completedAt: ISO timestamp,
  createdAt: ISO timestamp
}
Status: 201 created, 400 validation error

GET /users/:userId/progress
Request:  Authorization header
Response: [
  {
    progressId: string,
    lessonId: string,
    courseId: string,
    completedAt: ISO timestamp,
    watchedDuration: number,
    status: string
  }
]
Status: 200

GET /courses/:courseId/progress
Request:  Authorization header
Response: [
  {
    lessonId: string,
    progress: number (0-100 percentage),
    status: "not-started" | "in-progress" | "completed"
  }
]
Status: 200
Purpose: Get progress for all lessons in a course
```

### Quiz Endpoints

```
GET /quizzes/:quizId
Request:  Authorization header
Response: {
  quizId: string,
  title: string,
  description: string,
  passingScore: number (0-100),
  timeLimit?: number (seconds),
  questions: [
    {
      questionId: string,
      text: string,
      options: [
        { optionId: string, text: string }
      ],
      correctOptionId: string,
      explanation: string
    }
  ]
}
Status: 200, 404 not found

POST /quizzes/:quizId/submit
Request:  {
  answers: [
    {
      questionId: string,
      selectedOptionId: string,
      timeSpent: number (seconds)
    }
  ],
  totalTime: number (seconds)
}
Response: {
  resultId: string,
  quizId: string,
  userId: string,
  score: number (0-100),
  passed: boolean,
  answersReview: [
    {
      questionId: string,
      userAnswer: string,
      correctAnswer: string,
      isCorrect: boolean,
      explanation: string
    }
  ],
  submittedAt: ISO timestamp
}
Status: 201, 400 validation error

GET /users/:userId/quiz-results
Request:  Authorization header
Response: [
  {
    resultId: string,
    quizId: string,
    score: number,
    passed: boolean,
    submittedAt: ISO timestamp
  }
]
Status: 200
```

### User Endpoints

```
GET /users/:userId
Request:  Authorization header
Response: {
  userId: string,
  email: string,
  name: string,
  role: "student" | "teacher",
  createdAt: ISO timestamp,
  lastLogin: ISO timestamp,
  profilePicture?: string
}
Status: 200, 404 not found

PUT /users/:userId
Request:  {
  name?: string,
  profilePicture?: string,
  preferences?: object
}
Response: { (updated user object) }
Status: 200, 404 not found

GET /users/:userId/settings (optional)
Request:  Authorization header
Response: {
  theme: "light" | "dark",
  notifications: boolean,
  language: string,
  timezone: string
}
Status: 200

PUT /users/:userId/settings (optional)
Request:  { (any settings fields) }
Response: { (updated settings) }
Status: 200
```

### Teacher Endpoints

```
GET /teacher/courses
Request:  Authorization header (teacher only)
Response: [
  {
    courseId: string,
    title: string,
    description: string,
    createdAt: ISO timestamp,
    studentCount: number,
    totalLessons: number,
    modules: [...]
  }
]
Status: 200, 403 not teacher

POST /teacher/courses
Request:  {
  title: string,
  description: string,
  category: string,
  modules: [
    {
      title: string,
      lessons: [
        {
          title: string,
          type: "video" | "pdf" | "quiz",
          contentUrl: string,
          duration?: number
        }
      ]
    }
  ]
}
Response: { courseId: string, ...course object }
Status: 201, 400 validation error

GET /teacher/analytics
Request:  Authorization header (teacher only)
Response: {
  totalStudents: number,
  totalCourses: number,
  coursesAnalytics: [
    {
      courseId: string,
      title: string,
      enrolledStudents: number,
      avgCompletion: number (0-100),
      studentProgress: [
        {
          studentId: string,
          studentName: string,
          email: string,
          coursesCompleted: number,
          lessonsCompleted: number,
          avgScore: number
        }
      ]
    }
  ]
}
Status: 200

GET /teacher/students/:courseId
Request:  Authorization header (teacher only)
Response: [
  {
    studentId: string,
    email: string,
    name: string,
    enrolledAt: ISO timestamp,
    progress: {
      lessonsCompleted: number,
      totalLessons: number,
      percentageComplete: number
    },
    quizScores: [
      {
        quizId: string,
        score: number,
        passed: boolean,
        submittedAt: ISO timestamp
      }
    ]
  }
]
Status: 200
```

---

## 3. Error Response Format

All error responses should follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  }
}
```

**Status codes**:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (no permission)
- `404` - Not found
- `409` - Conflict (duplicate email, etc)
- `500` - Server error

**Example Error Response**:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect",
    "details": null
  }
}
```

---

## 4. JWT Token Details

### Token Requirements

- **Type**: Bearer token
- **Algorithm**: HS256 or RS256 recommended
- **Header**: `Authorization: Bearer {token}`

### Expected JWT Payload

```json
{
  "userId": "user-123",
  "email": "student@example.com",
  "role": "student",
  "iat": 1234567890,
  "exp": 1234654290,
  "iss": "edulearn"
}
```

### Token Handling in Frontend

Frontend stores token in IndexedDB and:
- Attaches to every API request
- Refreshes token on 401 response (recommended: add refresh token endpoint)
- Clears token on logout
- Auto-expires when `exp` time reached

---

## 5. CORS Configuration

Your backend must allow CORS from the frontend URL:

**Development**:
```
Allow-Origin: http://localhost:3000
```

**Production**:
```
Allow-Origin: https://yourdomain.com
```

**Required Headers**:
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

---

## 6. Testing Your Backend Integration

### Test Login Flow

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'

# Expected response:
# {
#   "token": "eyJhbGciOiJIUzI1NiIs...",
#   "user": {
#     "userId": "user-1",
#     "email": "student@example.com",
#     "name": "John Student",
#     "role": "student"
#   }
# }
```

### Test Protected Endpoint

```bash
curl -X GET http://localhost:3001/courses \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# Expected response:
# [
#   {
#     "courseId": "course-1",
#     "title": "React Basics",
#     ...
#   }
# ]
```

### Test Offline Sync

1. Start app with backend running
2. Load some pages (data caches in IndexedDB)
3. Stop backend / go offline (use DEV toggle)
4. Make changes (mark lesson complete, submit quiz)
5. Changes appear in sync queue
6. Restart backend
7. Changes automatically sync and disappear from queue

---

## 7. Database Schema Considerations

### What Frontend Caches

The frontend stores ALL of this in IndexedDB:

```
• User profile
• All enrolled courses
• All modules and lessons
• Progress for each lesson
• Quiz results
• Bookmarks/downloads
• Pending changes (sync queue)
• JWT token
• User settings
```

### What Stays on Backend

```
• Source of truth for all data
• User authentication credentials
• Teacher created content
• Detailed analytics
• Audit logs
• File storage (videos, PDFs)
```

### Data Consistency

**Conflict Resolution**:
- Backend last-write-wins for same resource
- Frontend queues changes in order
- No conflict detection needed for this design
- If user edits offline AND someone edits online:
  - Frontend change will overwrite when synced
  - Recommend "save time" comparison for conflicts

---

## 8. Performance Recommendations

### Pagination

For list endpoints like `/courses`, support pagination:

```
GET /courses?page=1&limit=20
Response: {
  data: [...],
  pagination: {
    page: 1,
    limit: 20,
    total: 145,
    totalPages: 8
  }
}
```

### Filtering

Support common filters:

```
GET /teacher/students?courseId=course-1&status=active
GET /courses?category=programming&level=beginner
GET /users/progress?courseId=course-1&status=completed
```

### Compression

Enable gzip compression for API responses - frontend will decompress automatically.

### Caching Headers

Set appropriate cache headers:

```
GET /courses (200 second cache)
Cache-Control: public, max-age=200

GET /users/progress (no cache - real-time)
Cache-Control: no-cache, must-revalidate

GET /quizzes/:id (permanent - quiz never changes)
Cache-Control: public, max-age=31536000
```

---

## 9. Security Checklist

- [ ] Use HTTPS in production
- [ ] Validate all JWT tokens
- [ ] Implement rate limiting
- [ ] Sanitize all inputs
- [ ] Use CORS properly (allow specific origins)
- [ ] Store passwords as hashed (bcrypt)
- [ ] Implement password reset endpoint
- [ ] Add refresh token rotation
- [ ] Log all security events
- [ ] Add request signing for offline sync
- [ ] Validate user can only access own data

---

## 10. Example: Adding a New Backend Feature

### Scenario: Add Bookmarks Feature

**Step 1: Backend Implementation**

```javascript
// Endpoints to add:
POST /bookmarks
Request: { lessonId: string }
Response: { bookmarkId: string, lessonId: string, createdAt: timestamp }

DELETE /bookmarks/:bookmarkId
Request: Authorization header
Response: { success: true }

GET /bookmarks
Request: Authorization header
Response: [{ bookmarkId: string, lessonId: string, ... }]
```

**Step 2: Update Frontend Database** (`lib/db.ts`)

```typescript
bookmarks!: Table<Bookmark>;

interface Bookmark {
  bookmarkId: string;
  userId: string;
  lessonId: string;
  createdAt: Date;
}

version(1).stores({
  // ... existing
  bookmarks: '++id, userId, lessonId'
});
```

**Step 3: Update API Service** (`lib/api.ts`)

```typescript
addBookmark: async (lessonId: string) => 
  apiCall('POST', '/bookmarks', { lessonId }),

removeBookmark: async (bookmarkId: string) => 
  apiCall('DELETE', `/bookmarks/${bookmarkId}`),

getBookmarks: async () => 
  apiCall('GET', '/bookmarks'),
```

**Step 4: Create Hook** (`hooks/useBookmarks.ts`)

```typescript
'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api';
import { db } from '@/lib/db';
import { useAuth } from './useAuth';

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);

  // Load bookmarks on mount
  useEffect(() => {
    if (!user) return;
    
    const loadBookmarks = async () => {
      try {
        // Try API first
        const data = await apiService.getBookmarks();
        await db.bookmarks.bulkPut(data);
        setBookmarks(data);
      } catch {
        // Fallback to cached
        const cached = await db.bookmarks.toArray();
        setBookmarks(cached);
      }
    };

    loadBookmarks();
  }, [user]);

  const addBookmark = useCallback(async (lessonId: string) => {
    try {
      const response = await apiService.addBookmark(lessonId);
      await db.bookmarks.add(response);
      setBookmarks([...bookmarks, response]);
    } catch (error) {
      console.error('[v0] Bookmark add failed:', error);
    }
  }, [bookmarks]);

  const removeBookmark = useCallback(async (bookmarkId: string) => {
    try {
      await apiService.removeBookmark(bookmarkId);
      await db.bookmarks.delete(bookmarkId);
      setBookmarks(bookmarks.filter(b => b.bookmarkId !== bookmarkId));
    } catch (error) {
      console.error('[v0] Bookmark remove failed:', error);
    }
  }, [bookmarks]);

  const isBookmarked = useCallback((lessonId: string) => {
    return bookmarks.some(b => b.lessonId === lessonId);
  }, [bookmarks]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
```

**Step 5: Use in Component**

```tsx
'use client';

import { useBookmarks } from '@/hooks/useBookmarks';

export function LessonHeader({ lessonId }) {
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarks();
  const bookmarked = isBookmarked(lessonId);

  const handleBookmarkToggle = async () => {
    if (bookmarked) {
      await removeBookmark(lessonId);
    } else {
      await addBookmark(lessonId);
    }
  };

  return (
    <button
      onClick={handleBookmarkToggle}
      className={bookmarked ? 'text-yellow-500' : 'text-gray-400'}
    >
      ★ {bookmarked ? 'Bookmarked' : 'Bookmark'}
    </button>
  );
}
```

---

## 11. Troubleshooting

### "401 Unauthorized" on every request

**Cause**: Token not being sent or invalid
**Fix**: 
- Check `Authorization` header is in request
- Verify token is stored in IndexedDB
- Check token hasn't expired
- Verify backend is validating JWT correctly

### "CORS error"

**Cause**: Backend not allowing requests from frontend
**Fix**:
- Add frontend URL to CORS allowed origins
- Verify credentials headers are included
- Check headers sent include Content-Type and Authorization

### Offline changes not syncing

**Cause**: Sync queue has errors
**Fix**:
- Check browser DevTools → Application → IndexedDB → syncQueue
- Verify backend endpoints exist and are correct
- Check API_URL is set correctly
- Look for errors in browser console

### Data not updating after API call

**Cause**: Frontend not updating IndexedDB or React state
**Fix**:
- After API success, update IndexedDB: `await db.table.put(response)`
- Update React state to trigger re-render
- Clear stale cache if needed

---

## Summary

To integrate your backend:

1. **Implement** all required endpoints from section 2
2. **Return** correct response format with required fields
3. **Set** `NEXT_PUBLIC_API_URL` environment variable
4. **Test** with curl commands in section 6
5. **Verify** offline sync works (sections 6 & 11)
6. **Deploy** and monitor logs for errors

The frontend will automatically:
- Cache all responses in IndexedDB
- Queue offline changes
- Sync when connectivity returns
- Attach JWT tokens to requests
- Handle errors gracefully

No frontend code changes needed beyond environment variable!
