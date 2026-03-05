# EduLearn Frontend Architecture - Complete Guide

## Overview

The EduLearn frontend is a **Next.js 16 Progressive Web App (PWA)** built with an **offline-first architecture**. It's designed to function seamlessly whether users are online or offline, with automatic data synchronization when connectivity is restored.

### Key Philosophy
- **Offline-First**: App reads from local IndexedDB first, syncs changes to backend when online
- **Progressive Enhancement**: Minimal features work offline, full features available online
- **Responsive**: Mobile-first design that works on phones, tablets, and desktops
- **Type-Safe**: Full TypeScript coverage for reliability

---

## Project Structure

```
root/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Landing/redirect page
│   ├── login/page.tsx           # Login page
│   ├── register/page.tsx        # Registration page
│   ├── dashboard/page.tsx       # Student dashboard
│   ├── courses/
│   │   ├── [courseId]/page.tsx          # Course detail page
│   │   └── [lessonId]/lessons/
│   │       └── page.tsx                 # Lesson player page
│   ├── teacher/dashboard/page.tsx       # Teacher dashboard
│   ├── downloads/page.tsx               # Download management
│   ├── error.tsx                        # Error boundary
│   ├── not-found.tsx                    # 404 page
│   ├── globals.css                      # Tailwind CSS + design tokens
│   └── providers.tsx                    # Context provider wrapper
│
├── components/                   # Reusable React components
│   ├── Navbar.tsx               # Top navigation bar
│   ├── PageWrapper.tsx          # Layout wrapper with offline banner
│   ├── OfflineBanner.tsx        # "You're offline" indicator
│   ├── SyncStatusIndicator.tsx  # Sync progress badge
│   ├── DevelopmentToggle.tsx    # Dev mode toggle
│   ├── PrivateRoute.tsx         # Protected route wrapper
│   ├── student/                 # Student-specific components
│   │   ├── CourseCard.tsx       # Course display card
│   │   ├── ModuleAccordion.tsx  # Collapsible module sections
│   │   ├── LessonList.tsx       # Lesson navigation
│   │   ├── VideoPlayer.tsx      # HTML5 video player
│   │   ├── PDFViewer.tsx        # PDF.js viewer
│   │   └── QuizPlayer.tsx       # Quiz interface with scoring
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── etc...
│
├── contexts/                    # React Context providers
│   ├── NetworkContext.tsx       # Online/offline state
│   ├── AuthContext.tsx          # User & JWT state
│   └── SyncContext.tsx          # Sync queue management
│
├── hooks/                       # Custom React hooks
│   ├── useAuth.ts               # Auth context hook
│   ├── useNetworkStatus.ts      # Network status hook
│   └── useSyncStatus.ts         # Sync status hook
│
├── lib/                         # Utilities and services
│   ├── db.ts                    # Dexie database setup
│   ├── api.ts                   # API service with offline support
│   ├── mockDataLoader.ts        # Sample data initialization
│   └── utils.ts                 # Tailwind classname utilities
│
├── mock/                        # Mock data (JSON)
│   ├── courses.json             # Sample courses
│   ├── lessons.json             # Sample lessons
│   └── quizzes.json             # Sample quizzes
│
├── public/                      # Static assets
│   ├── manifest.json            # PWA manifest
│   ├── icon-192x192.png         # App icon
│   ├── icon-512x512.png         # Large app icon
│   ├── screenshot-*.png         # PWA screenshots
│   └── pwacompat.js             # iOS PWA support
│
├── next.config.mjs              # Next.js configuration with PWA
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
└── README.md                    # Documentation
```

---

## Core Architecture

### 1. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interaction                         │
└────────────────────────────┬────────────────────────────────┘
                             │
                ┌────────────▼────────────┐
                │   React Components       │
                │   (Navbar, Dashboard)    │
                └────────────┬────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
    ┌───▼────┐        ┌──────▼──────┐      ┌─────▼────┐
    │ Read   │        │   Write     │      │  Delete  │
    │        │        │             │      │          │
    └───┬────┘        └──────┬──────┘      └─────┬────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                ┌────────────▼────────────────┐
                │  Check Network Status      │
                │  (useNetworkStatus hook)   │
                └────────────┬───────┬───────┘
                             │       │
          ┌──────────────────┘       └──────────────────┐
          │ ONLINE                                      │ OFFLINE
          │                                             │
    ┌─────▼─────────┐                            ┌──────▼──────┐
    │ API Service   │                            │ IndexedDB   │
    │ (lib/api.ts)  │◄──────JWT Token────────►  │ (lib/db.ts) │
    │ - Fetch data  │                            │ - Read data │
    │ - Upload      │  ┌──────────────────────┐  │ - Write     │
    │ - Post changes│  │ Queue in SyncContext  │  │ - Cache     │
    └─────┬─────────┘  │ - Failed requests    │  └─────┬──────┘
          │            │ - Pending changes    │        │
          │            └──────────────────────┘        │
          │                                            │
          └────────────────┬─────────────────────────┬─┘
                           │
                ┌──────────▼──────────┐
                │  SyncContext        │
                │ - Queues changes    │
                │ - Retries on conn.  │
                │ - Updates UI status │
                └─────────────────────┘
```

**Key Principle**: When online, API is source of truth. When offline, IndexedDB is source of truth. Changes are queued and synced when connectivity restored.

---

## 2. Database (Dexie.js + IndexedDB)

**File**: `lib/db.ts`

IndexedDB is browser's persistent local storage. We use Dexie.js as a wrapper for easier queries.

### Database Schema (9 Object Stores)

```typescript
// Object stores (like tables):

1. users
   - userId (primary key)
   - email, name, role (student/teacher)
   - lastLogin timestamp

2. courses
   - courseId
   - title, description, category
   - modules (nested: [{ moduleId, title, lessons }])
   - enrolledAt timestamp

3. modules
   - moduleId
   - courseId, title, order
   - lessons array

4. lessons
   - lessonId
   - moduleId, courseId, title, type (video/pdf/quiz)
   - contentUrl, duration
   - completed boolean

5. quizzes
   - quizId
   - title, description
   - questions array (MCQ format)
   - passingScore (percentage)

6. progress
   - progressId (auto-generated)
   - userId, lessonId, courseId
   - completedAt, watchedDuration
   - status (in-progress/completed)

7. quizResults
   - resultId
   - userId, quizId, lessonId
   - score, answers array
   - submittedAt

8. syncQueue
   - queueId (auto-generated)
   - action (CREATE/UPDATE/DELETE)
   - resource (courses/lessons/progress/quizResults)
   - resourceId, payload, timestamp
   - retries (number of retry attempts)
   - status (pending/failed)

9. sessions
   - sessionId
   - userId
   - token (JWT)
   - expiresAt
```

### Using the Database

```typescript
// In components marked with 'use client':

import { db } from '@/lib/db';

// Read
const courses = await db.courses.toArray();
const course = await db.courses.get(courseId);
const userProgress = await db.progress.where('userId').equals(userId).toArray();

// Create
await db.courses.add({
  courseId: 'course-1',
  title: 'React Basics',
  modules: [...]
});

// Update
await db.courses.update(courseId, { title: 'Updated Title' });

// Delete
await db.courses.delete(courseId);

// Complex queries
const userCourses = await db.courses
  .where('userId').equals(userId)
  .and(course => course.enrolledAt > timestamp)
  .toArray();
```

---

## 3. Context Providers (State Management)

**File**: `app/providers.tsx` wraps all three contexts.

### NetworkContext
**File**: `contexts/NetworkContext.tsx`

Tracks online/offline status and connection quality.

```typescript
// Hook: useNetworkStatus()
const { isOnline, connectionQuality } = useNetworkStatus();

// connectionQuality: 'excellent' | 'good' | 'slow' | 'offline'

// Events fired automatically:
// - Online detected → trigger sync automatically
// - Offline detected → show banner
```

**Usage in components**:
```tsx
'use client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function MyComponent() {
  const { isOnline } = useNetworkStatus();

  return (
    <>
      {!isOnline && <OfflineBanner />}
      {isOnline ? <OnlineFeatures /> : <OfflineFeatures />}
    </>
  );
}
```

### AuthContext
**File**: `contexts/AuthContext.tsx`

Manages user authentication, JWT tokens, and role-based access.

```typescript
// Hook: useAuth()
const { user, isAuthenticated, login, logout, register } = useAuth();

// user object:
interface User {
  userId: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  token: string; // JWT
}

// Login example:
const { token, user } = await login('student@example.com', 'password123');
// Token stored in IndexedDB + memory
// Automatically attached to API requests

// Logout:
await logout(); // Clears token and user data
```

**Token Handling**:
- JWT stored in IndexedDB sessions table
- Automatically attached to all API requests
- Expires when backend-set expiration time reached
- Automatically removed on logout

### SyncContext
**File**: `contexts/SyncContext.tsx`

Manages the sync queue for offline changes.

```typescript
// Hook: useSyncStatus()
const { pendingChanges, isSyncing, syncError } = useSyncStatus();

// pendingChanges: number of items in sync queue
// isSyncing: boolean, true while syncing
// syncError: last error message

// Manual sync trigger:
const { triggerSync } = useSyncContext();
await triggerSync(); // Manually sync now
```

**How Sync Works**:
1. User makes change while offline → added to syncQueue in IndexedDB
2. Change stored locally with status "pending"
3. UI shows sync indicator badge
4. When connectivity restored → sync engine processes queue
5. Each change sent to backend API
6. On success → removed from queue, local data updated
7. On failure → retries up to 3 times with exponential backoff
8. After 3 failures → stored with status "failed", user notified

---

## 4. API Service Layer

**File**: `lib/api.ts`

Handles all communication with backend. Follows offline-first pattern.

```typescript
import { apiService } from '@/lib/api';

// GET - Read data
const courses = await apiService.get('/courses');
// Returns: API data if online, cached IndexedDB data if offline

// POST - Create
const response = await apiService.post('/progress', {
  lessonId: 'lesson-1',
  completedAt: new Date()
});
// If online: sends to API immediately
// If offline: queues change, returns optimistic response

// PUT - Update
const response = await apiService.put('/progress/progress-1', {
  watched: 45 // minutes watched
});
// Same queuing logic

// DELETE
const response = await apiService.delete('/progress/progress-1');
```

**Request Headers**:
```typescript
// Automatically added:
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${jwt_token}` // If logged in
}
```

**Error Handling**:
```typescript
try {
  const data = await apiService.get('/courses');
} catch (error) {
  if (error.code === 401) {
    // Token expired - logout user
  } else if (error.code === 404) {
    // Resource not found
  }
  // Error automatically added to sync queue if offline
}
```

---

## 5. Authentication Flow

### Login Process

**File**: `app/login/page.tsx`

```
1. User enters email + password
   ↓
2. AuthContext.login() called
   ↓
3. API POST /auth/login { email, password }
   ↓
4. Backend returns { token: "jwt...", user: {...} }
   ↓
5. Token stored in:
   - IndexedDB (sessions table)
   - React state (memory)
   ↓
6. Redirect to /dashboard or /teacher/dashboard based on role
```

### Protected Routes

**File**: `components/PrivateRoute.tsx`

Wraps pages that require authentication.

```tsx
<PrivateRoute allowedRoles={['student']}>
  <DashboardContent />
</PrivateRoute>

// Checks:
// - Is user authenticated? (token exists)
// - Does user have correct role?
// - Redirects to /login if not
```

### How JWT is Used

Every API request automatically includes JWT:
```typescript
// In api.ts:
const headers = {
  'Authorization': `Bearer ${token}`
};

// Backend validates token and allows/denies request
```

---

## 6. Component Hierarchy

### Page Components (in `app/`)

All page components are marked with `'use client'` - they're client components that can use React hooks and interact with IndexedDB.

**Student Pages**:
- `/dashboard` - Shows enrolled courses, progress
- `/courses/[courseId]` - Shows course modules and lessons
- `/courses/[courseId]/lessons/[lessonId]` - Lesson player
- `/downloads` - Manage offline content

**Teacher Pages**:
- `/teacher/dashboard` - Course management, analytics

**Auth Pages**:
- `/login` - Login form
- `/register` - Registration form

### Component Composition

```
PageComponent (Client)
  ├── PrivateRoute (Client wrapper)
  ├── PageWrapper (Layout component)
  │   ├── Navbar (Navigation)
  │   ├── OfflineBanner (Offline indicator)
  │   ├── SyncStatusIndicator (Sync badge)
  │   └── Page Content
  │       ├── CourseCard (Student component)
  │       ├── ModuleAccordion (Lesson navigator)
  │       ├── VideoPlayer OR PDFViewer OR QuizPlayer
  │       └── Other components
```

---

## 7. Key Components Explained

### VideoPlayer
**File**: `components/student/VideoPlayer.tsx`

```tsx
<VideoPlayer 
  videoUrl="https://example.com/video.mp4"
  title="Introduction to React"
  onComplete={() => markLessonComplete()}
/>

// Features:
// - HTML5 video element
// - Play/pause, seek, volume controls
// - Progress tracking (sends to IndexedDB)
// - Works offline with cached video blobs
// - Resume from last watched position
```

### PDFViewer
**File**: `components/student/PDFViewer.tsx`

```tsx
<PDFViewer 
  pdfUrl="https://example.com/notes.pdf"
  title="Course Notes"
/>

// Features:
// - PDF.js library for rendering
// - Page navigation
// - Zoom controls
// - Works offline
```

### QuizPlayer
**File**: `components/student/QuizPlayer.tsx`

```tsx
<QuizPlayer 
  quiz={quizData}
  onSubmit={(answers) => submitQuiz(answers)}
/>

// Flow:
// 1. Show one question at a time
// 2. Multiple choice options
// 3. Submit quiz
// 4. Show score and correct answers
// 5. Store result in IndexedDB
// 6. Sync to backend when online
```

---

## 8. Offline-First Pattern in Action

### Example: Student Marks Lesson Complete

```
1. User clicks "Mark Complete" button
   ↓
2. Component calls:
   await apiService.post('/progress', {
     lessonId: 'lesson-1',
     completedAt: new Date()
   })
   ↓
3. API Service checks: isOnline?
   ├─ YES → Send to backend immediately
   │         Backend returns success
   │         Update IndexedDB with response
   │
   └─ NO  → Queue in SyncContext
            Generate optimistic ID
            Update IndexedDB locally
            Show sync badge in navbar
            Return optimistic response
   ↓
4. Component receives response
   ↓
5. UI updates (marks lesson as complete)
   ↓
6. If offline:
   - Change stays in syncQueue
   - When connectivity returns
   - SyncContext automatically processes queue
   - Sends change to backend
   - Updates local data with backend response
   - Clears from queue
   - Hides sync badge
```

---

## 9. How to Add Backend Features

### Step 1: Update API Service

**File**: `lib/api.ts`

Add new API endpoint:

```typescript
// Add to apiService object:
export const apiService = {
  // ... existing methods

  // New: Get user profile
  getUserProfile: async (userId: string) => {
    return await apiCall('GET', `/users/${userId}`);
  },

  // New: Update user settings
  updateSettings: async (settings: UserSettings) => {
    return await apiCall('POST', `/users/settings`, settings);
  },

  // New: Download course content
  downloadCourse: async (courseId: string, onProgress: (percent) => void) => {
    return await apiCall('POST', `/courses/${courseId}/download`, null, { 
      onProgress 
    });
  },
};
```

### Step 2: Add Database Schema

**File**: `lib/db.ts`

```typescript
// In DatabaseSchema class:
settings!: Table<UserSettings>;
courseDownloads!: Table<CourseDownload>;

// In version() method:
version(1).stores({
  // ... existing stores
  settings: '&userId',
  courseDownloads: '++id, courseId, userId'
});
```

### Step 3: Create Hook to Use New Feature

**File**: `hooks/useUserSettings.ts` (new)

```typescript
'use client';

import { useCallback, useState } from 'react';
import { apiService } from '@/lib/api';
import { db } from '@/lib/db';
import { useAuth } from './useAuth';

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user?.userId) return;
    
    setLoading(true);
    try {
      // Try API first
      const data = await apiService.get(`/users/${user.userId}/settings`);
      
      // Cache in IndexedDB
      await db.settings.put(data);
      setSettings(data);
    } catch (error) {
      // Fallback to IndexedDB
      const cached = await db.settings.get(user.userId);
      setSettings(cached);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateSettings = useCallback(async (newSettings) => {
    const response = await apiService.put(
      `/users/${user.userId}/settings`,
      newSettings
    );
    
    await db.settings.put(response);
    setSettings(response);
    return response;
  }, [user]);

  return { settings, loading, fetchSettings, updateSettings };
}
```

### Step 4: Use in Component

```tsx
'use client';

import { useUserSettings } from '@/hooks/useUserSettings';

export function SettingsPage() {
  const { settings, updateSettings } = useUserSettings();

  const handleThemeChange = async (theme) => {
    await updateSettings({ theme });
    // UI updates automatically
  };

  return (
    <div>
      <select onChange={(e) => handleThemeChange(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
```

---

## 10. Backend Integration Checklist

### Required Backend Endpoints

```
Authentication:
POST   /auth/login          - { email, password } → { token, user }
POST   /auth/register       - { email, password, role } → { token, user }
POST   /auth/logout         - {} → { success }

Courses:
GET    /courses             - [] (list of courses)
GET    /courses/:id         - (course details with modules)
GET    /courses/:id/download - (download course content)

Progress:
POST   /progress            - { lessonId, completedAt, ... }
GET    /users/:id/progress  - (list of user progress)

Quizzes:
POST   /quizzes/:id/submit  - { answers, userId, lessonId }
GET    /quizzes/:id         - (quiz questions)

User:
GET    /users/:id           - (user profile)
PUT    /users/:id           - (update profile)
GET    /users/:id/settings  - (user settings)
PUT    /users/:id/settings  - (update settings)

Teacher:
GET    /teacher/courses     - (teacher's courses)
GET    /teacher/analytics   - (student progress analytics)
POST   /teacher/courses     - (create course)
```

### Environment Variables to Add

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=EduLearn
NEXT_PUBLIC_MAX_RETRY_ATTEMPTS=3
```

Then use in code:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const apiCall = async (method, endpoint, data) => {
  const url = `${API_URL}${endpoint}`;
  // ... rest of implementation
};
```

---

## 11. Frontend Modifications Guide

### Add New Student Feature

**Example: Bookmarks (save favorite lessons)**

1. **Update Database** (`lib/db.ts`)
```typescript
bookmarks!: Table<Bookmark>;

version(1).stores({
  // ... existing
  bookmarks: '++id, userId, lessonId'
});
```

2. **Update API Service** (`lib/api.ts`)
```typescript
export const apiService = {
  // ... existing
  addBookmark: async (lessonId: string) => 
    apiCall('POST', '/bookmarks', { lessonId }),
  
  removeBookmark: async (bookmarkId: string) => 
    apiCall('DELETE', `/bookmarks/${bookmarkId}`),
  
  getBookmarks: async () => 
    apiCall('GET', '/bookmarks'),
};
```

3. **Create Hook** (`hooks/useBookmarks.ts`)
```typescript
'use client';

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);

  const addBookmark = async (lessonId) => {
    const response = await apiService.addBookmark(lessonId);
    await db.bookmarks.add(response);
    setBookmarks([...bookmarks, response]);
  };

  // Similar for removeBookmark, getBookmarks
  
  return { bookmarks, addBookmark, removeBookmark };
}
```

4. **Use in Component**
```tsx
export function LessonPlayer({ lessonId }) {
  const { bookmarks, addBookmark } = useBookmarks();
  const isBookmarked = bookmarks.some(b => b.lessonId === lessonId);

  return (
    <>
      <button 
        onClick={() => addBookmark(lessonId)}
        className={isBookmarked ? 'bg-yellow-400' : ''}
      >
        ★ Bookmark
      </button>
    </>
  );
}
```

### Modify Existing Component

**Example: Add search to course list**

1. Find component: `components/student/CourseCard.tsx`
2. Add state for search: `const [search, setSearch] = useState('')`
3. Filter courses: `courses.filter(c => c.title.includes(search))`
4. Add input: `<input value={search} onChange={(e) => setSearch(e.target.value)} />`
5. Pass filtered courses to CourseCard components

---

## 12. Testing Offline Features

### Using Development Toggle

The app includes a `DevelopmentToggle` component (visible in top-right when `NODE_ENV === 'development'`).

```tsx
// Click the "DEV" button to toggle offline mode
// This simulates offline environment for testing
```

### Manual Testing Steps

1. **Test Offline Write**:
   - Open app in browser
   - Click DEV button to go offline
   - Click "Mark Complete" on a lesson
   - See sync badge appear in navbar
   - Click DEV button to go online
   - See badge disappear as sync processes

2. **Test Offline Read**:
   - Load courses while online
   - Go offline (DEV button)
   - Navigate between pages
   - All data should still be readable from IndexedDB

3. **Test Download**:
   - Go to Downloads page
   - Download a course
   - Go offline
   - Lesson video should still play from local blob

---

## 13. Debugging

### Console Logging

Components use `[v0]` prefix for debugging:

```typescript
console.log('[v0] User logged in:', user);
console.log('[v0] Sync triggered, queue length:', queue.length);
console.log('[v0] API Error:', error.message);
```

Filter in DevTools: Type `[v0]` in console filter to see only app logs.

### Check IndexedDB

Browser DevTools → Application → IndexedDB → EduLearn:

- View all stored courses, lessons, progress
- See what's in the sync queue
- Check session token storage

### Check Service Worker

Browser DevTools → Application → Service Workers:

- Verify SW is registered
- Check cache storage (what assets are cached)
- Test offline mode

---

## 14. Performance Tips

### Reduce API Calls

```typescript
// BAD: Loads all user data for every page
const user = await apiService.get(`/users/${userId}`);

// GOOD: Load once in context, reuse everywhere
const { user } = useAuth();
```

### Use IndexedDB for Caching

```typescript
// Always cache API responses
const data = await apiService.get('/courses');
await db.courses.bulkPut(data);

// Next request reads from cache first
const cached = await db.courses.toArray();
```

### Lazy Load Components

```tsx
import dynamic from 'next/dynamic';

// Only load quiz player when needed
const QuizPlayer = dynamic(() => import('@/components/student/QuizPlayer'));
```

### Batch Database Operations

```typescript
// SLOW: 100 individual inserts
for (const lesson of lessons) {
  await db.lessons.add(lesson);
}

// FAST: Single bulk insert
await db.lessons.bulkAdd(lessons);
```

---

## 15. Common Integration Patterns

### Pattern 1: Fetch & Cache

```typescript
async function getCourses(userId) {
  // Check cache first
  const cached = await db.courses.where('userId').equals(userId).toArray();
  if (cached.length > 0) return cached;

  // If not cached, fetch from API
  const fresh = await apiService.get(`/users/${userId}/courses`);
  
  // Cache for next time
  await db.courses.bulkPut(fresh);
  return fresh;
}
```

### Pattern 2: Optimistic Updates

```typescript
async function markComplete(lessonId) {
  // Immediately update UI
  setLessonStatus(lessonId, 'completed');
  
  try {
    // Then sync with backend
    await apiService.post('/progress', { lessonId });
  } catch (error) {
    // Revert if fails
    setLessonStatus(lessonId, 'pending');
    showError('Failed to save progress');
  }
}
```

### Pattern 3: Sync Queue

```typescript
async function triggerSync() {
  const pending = await db.syncQueue.where('status').equals('pending').toArray();
  
  for (const item of pending) {
    try {
      const response = await apiService[item.action.toLowerCase()](
        item.resource,
        item.payload
      );
      await db.syncQueue.delete(item.queueId);
    } catch (error) {
      // Retry up to 3 times
      if (item.retries < 3) {
        await db.syncQueue.update(item.queueId, { retries: item.retries + 1 });
      }
    }
  }
}
```

---

## Summary

**The frontend is fully functional and ready for backend integration**. Key points:

1. **Data flows**: Component → IndexedDB (offline) / API (online) → Backend
2. **Authentication**: JWT tokens stored in IndexedDB, auto-attached to requests
3. **Offline support**: Every API call falls back to cached IndexedDB data
4. **Sync queue**: Offline changes queued and synced automatically
5. **Easy to extend**: Add features by creating new hooks and API endpoints
6. **Type-safe**: Full TypeScript for reliability

Connect your backend by updating `NEXT_PUBLIC_API_URL` and implementing the required endpoints listed in section 10.
