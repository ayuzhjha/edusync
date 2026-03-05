# EduLearn: Offline-First Education PWA - Architecture Documentation

## Project Overview

EduLearn is a comprehensive Progressive Web App (PWA) built with Next.js 16 that enables seamless offline-first education. Users can access courses, lessons, quizzes, and complete their learning journey entirely offline, with automatic synchronization when connectivity returns.

**Key Capabilities:**
- Full offline functionality after initial visit
- Service worker asset caching and intelligent API caching
- IndexedDB persistence for courses, lessons, quizzes, and progress
- Automatic sync engine with retry logic
- Role-based access (student and teacher dashboards)
- Responsive design for mobile, tablet, and desktop

---

## Architecture Layers

### 1. PWA Foundation & Service Workers

**Files:**
- `next.config.mjs` - PWA plugin configuration with cache strategies
- `public/manifest.json` - App metadata, icons, and PWA manifest
- `public/icon-*.png` - App icons in multiple sizes and maskable variants
- `app/layout.tsx` - PWA initialization and meta tags

**Caching Strategy:**
```
- Cache-First: Static assets (JS, CSS, images, fonts)
  └─ Perfect for: Code bundles, stylesheets, icons
  
- Network-First: API calls with fallback
  └─ Perfect for: Course data, lesson content, user data
  └─ Timeout: 15 seconds, then serve from cache
  
- Stale-While-Revalidate: Course content
  └─ Perfect for: Read-heavy content, less critical updates
```

**Service Worker Features:**
- Automatic asset pre-caching
- Runtime caching with TTL management
- Offline fallback support
- Background sync queue support

---

### 2. Core Infrastructure (Contexts & Database)

#### 2a. Dexie.js Database (`lib/db.ts`)

**Object Stores:**
```typescript
- courses        // Course metadata, structure
- modules        // Course modules/sections
- lessons        // Individual lessons (video, PDF, quiz)
- quizzes        // Quiz questions and configurations
- progress       // User progress tracking per lesson
- quizResults    // Quiz attempt results
- syncQueue      // Offline changes pending sync
- sessions       // User JWT tokens
- users          // User profiles (minimal, fetched on login)
```

**Key Indexes:**
- `progress`: `[userId+courseId]`, `[userId+lessonId]`
- `quizResults`: `[userId+quizId]`, `[userId+courseId]`
- `lessons`: `[courseId+id]` (compound key for course-specific queries)
- `syncQueue`: `createdAt` (for chronological processing)

#### 2b. Context Providers (`contexts/`)

**NetworkContext** (`NetworkContext.tsx`)
- Tracks online/offline status via `navigator.onLine`
- Detects connection quality (4g, 3g, 2g, slow-2g)
- Fires `online`/`offline` events for auto-sync triggering
- Accessible via `useNetworkStatus()` hook

**AuthContext** (`AuthContext.tsx`)
- Manages JWT token and user state
- Persists credentials in IndexedDB (session table)
- Auto-rehydrates on app load
- Mock authentication for demo (email/password validation)
- Logout clears stored session

**SyncContext** (`SyncContext.tsx`)
- Maintains sync queue and pending count
- `runSync()` processes offline changes sequentially
- `addToQueue()` adds new items for syncing
- Auto-triggers sync on online event
- Tracks sync status and last sync time

---

### 3. Network & API Layer

**API Service** (`lib/api.ts`)
```typescript
apiService.request(method, endpoint, data)
  ├─ Attaches JWT to headers
  ├─ Handles 401 errors (clears auth)
  ├─ Graceful network error handling
  └─ Detects slow connections

Methods:
  ├─ get<T>(endpoint)
  ├─ post<T>(endpoint, data)
  ├─ put<T>(endpoint, data)
  ├─ delete<T>(endpoint)
  └─ downloadBlob(url, onProgress)  // For media downloads
```

**Offline-First Data Fetching Pattern**
```typescript
fetchOfflineFirst(key, fetchFn, cacheTime)
  1. Try IndexedDB cache first
  2. If online and cache stale, fetch fresh data
  3. Update IndexedDB cache
  4. If offline and cache exists, use stale cache
  5. If offline and no cache, throw error
```

---

### 4. UI Foundation & Layout

**Navbar** (`components/Navbar.tsx`)
- Logo and app title
- Dynamic navigation (student vs teacher routes)
- Sync status indicator
- User menu with profile/logout
- Responsive mobile/desktop layout

**PageWrapper** (`components/PageWrapper.tsx`)
- Consistent layout wrapper for all pages
- Navbar integration
- OfflineBanner and DevelopmentToggle
- Max-width constraint and padding

**OfflineBanner** (`components/OfflineBanner.tsx`)
- Persistent orange banner when offline
- Message: "You are offline - Changes will sync when back online"
- Fixed bottom position

**SyncStatusIndicator** (`components/SyncStatusIndicator.tsx`)
- Green "All synced" badge when complete
- Blue "Syncing..." with spinner when in progress
- Yellow "X pending" badge when queue has items

---

### 5. Student Features

#### 5a. Dashboard & Course Browsing
- **Dashboard Page** (`app/dashboard/page.tsx`)
  - Welcome message with student name
  - "Continue Learning" section (first 4 courses)
  - All Courses grid
  - Stats: Courses Enrolled, Lessons Completed, Learning Streak

- **CourseCard** (`components/student/CourseCard.tsx`)
  - Course thumbnail (gradient placeholder)
  - Progress bar with percentage
  - Level badge (beginner/intermediate/advanced)
  - Duration display
  - "Start/Continue" button

#### 5b. Course & Lesson Management
- **Course Detail Page** (`app/courses/[courseId]/page.tsx`)
  - Course header with banner, title, description
  - "Download Course" button
  - Progress statistics
  - Module accordion with lessons

- **ModuleAccordion** (`components/student/ModuleAccordion.tsx`)
  - Expandable modules
  - Lesson count per module
  - Integration with LessonList

- **LessonList** (`components/student/LessonList.tsx`)
  - Icon per lesson type (video/PDF/quiz)
  - Duration/page count display
  - Completion checkmark
  - "Saved" badge for downloaded content

#### 5c. Lesson Players
- **Lesson Player Page** (`app/courses/[courseId]/lessons/[lessonId]/page.tsx`)
  - Displays lesson based on type
  - "Mark as Complete" button
  - Sidebar with lesson details
  - Downloaded status indicator

- **VideoPlayer** (`components/student/VideoPlayer.tsx`)
  - HTML5 video element
  - Plays local blob URLs for offline
  - Shows "Download to view offline" if not cached

- **PDFViewer** (`components/student/PDFViewer.tsx`)
  - PDF.js integration for document rendering
  - Local blob URL support

- **QuizPlayer** (`components/student/QuizPlayer.tsx`)
  - MCQ question rendering
  - Radio button selection
  - Submission with score calculation
  - Result display with pass/fail badge
  - Question review with correct answers

#### 5d. Progress Tracking
- **Progress Model** (IndexedDB)
  ```typescript
  {
    id: string,                    // Unique key
    userId: string,
    courseId: string,
    lessonId: string,
    completed: boolean,
    completedAt?: number,
    lastAccessedAt: number,
    timeSpent: number,             // seconds
    synced: boolean                // Sync status
  }
  ```

- **Quiz Results** (IndexedDB)
  ```typescript
  {
    id: string,
    userId: string,
    courseId: string,
    lessonId: string,
    quizId: string,
    score: number,                 // percentage 0-100
    totalQuestions: number,
    answers: number[],             // selected option indices
    submittedAt: number,
    synced: boolean
  }
  ```

---

### 6. Teacher Features

#### 6a. Teacher Dashboard
- **Teacher Dashboard** (`app/teacher/dashboard/page.tsx`)
  - Total courses, lessons, students stats
  - Course management table
  - Edit and View Progress buttons per course

#### 6b. Course Management
- Teacher can view, edit, and manage courses (in frontend)
- Create new courses (modal-based)
- Module builder interface
- Lesson builder with type selection

#### 6c. Progress Analytics
- **Progress Page** (`app/teacher/courses/[courseId]/progress/page.tsx`)
  - Summary statistics (total enrolled, avg completion, quizzes submitted)
  - Student progress table
  - Columns for each lesson with completion status
  - Module filter dropdown

---

### 7. Sync & Offline Management

#### 7a. Sync Queue Pattern
```typescript
SyncQueueItem {
  id: string,
  userId: string,
  type: 'progress' | 'quiz_result' | 'course_enrollment',
  resourceId: string,           // ID of affected resource
  payload: any,                 // Full data for the change
  retryCount: number,
  lastRetryAt?: number,
  error?: string,
  createdAt: number
}
```

#### 7b. Sync Engine Flow
```
1. On 'online' event or periodic trigger:
   ├─ Get all pending items from syncQueue
   ├─ Process sequentially (order matters)
   ├─ For each item:
   │  ├─ POST to API endpoint
   │  ├─ On success:
   │  │  ├─ Mark as synced in source table
   │  │  ├─ Remove from syncQueue
   │  │  └─ Update UI
   │  ├─ On failure:
   │  │  ├─ Increment retryCount
   │  │  ├─ Store error message
   │  │  ├─ Retry up to 3 times
   │  │  └─ Keep in queue if max retries
   │  └─ Handle 401: Clear auth, redirect to login
   └─ Update pending count, trigger UI update
```

#### 7c. Download Management
- **Download Manager** (`components/student/DownloadManager.tsx`)
  - Progress tracking with percentage
  - Download individual lessons or entire courses
  - Storage quota warnings
  - Cancel in-progress downloads

- **Storage Manager** (`lib/storageManager.ts`)
  - Calculate IndexedDB storage usage
  - Warn when approaching quota limits
  - Allow selective deletion of content

---

### 8. Authentication & Authorization

#### 8a. Login Flow
1. User enters email/password
2. Client-side validation
3. Mock API call to authenticate
4. JWT token generated (base64 encoded payload)
5. User and session saved to IndexedDB
6. Redirect to appropriate dashboard (student/teacher)

#### 8b. Rehydration
- On app load, auth context checks for stored session
- Verifies token hasn't expired
- Restores user state
- Shows loading spinner during check

#### 8c. Protected Routes
- `PrivateRoute` component wraps authenticated pages
- Checks `isAuthenticated` from AuthContext
- Verifies user role matches allowed roles
- Redirects to login if not authenticated

**Demo Credentials:**
- Student: `student@example.com` / `password123`
- Teacher: `teacher@example.com` / `password123`

---

### 9. Mock Data & Initialization

**Mock Data** (`lib/mockDataLoader.ts`)
```typescript
3 Sample Courses:
├─ Introduction to Web Development (HTML, CSS, JavaScript)
├─ Advanced React Patterns (Hooks, Context, Performance)
└─ Data Science Fundamentals (Python, Analysis, ML)

Each course includes:
├─ 5-7 modules per course
├─ 15-21 lessons total
├─ Video lessons with durations
├─ PDF lessons with page counts
├─ Quiz lessons with 5 questions each
└─ Progress tracking for demo user
```

**Data Loading Strategy:**
- Loads on app init if database is empty
- Checks course count in database
- Populates all tables in order (courses → modules → lessons → quizzes)
- Logs success/errors to console

---

### 10. Development Features

#### 10a. Development Toggle (`components/DevelopmentToggle.tsx`)
- Bottom-left DEV button (development only)
- Click to expand and show Offline/Online toggle
- Simulates network disconnection for testing
- Dispatches custom events for sync testing

#### 10b. Debugging
```typescript
console.log('[v0] Network: going online')
console.log('[v0] Auth: User logged in:', email)
console.log('[v0] Sync: Processing X items')
console.log('[v0] API: GET /api/courses')
```

---

## Technology Stack

### Core Framework
- **Next.js 16** - App Router, Server Components, middleware
- **React 19** - Components, hooks, context API
- **TypeScript** - Type safety throughout

### Styling & UI
- **Tailwind CSS v4** - Utility-first styling
- **Lucide React** - Icons
- **shadcn/ui** - Pre-built components (Button, Card, Input, etc.)

### PWA & Offline
- **next-pwa** - Service worker generation and caching
- **Dexie.js** - IndexedDB wrapper with type safety
- **pwacompat** - iOS PWA support

### Storage & Media
- **pdfjs-dist** - PDF rendering
- **HTML5 Video** - Native video player
- **Blob URLs** - Offline media playback

### State & Data
- **React Context** - Global state (Auth, Network, Sync)
- **Custom Hooks** - useAuth, useNetworkStatus, useSyncStatus
- **IndexedDB** - Persistent local storage

### Utilities
- **React Hook Form** - Form validation
- **Zod** - Schema validation
- **sonner** - Toast notifications
- **date-fns** - Date formatting

---

## File Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx              # Root layout with PWA meta tags
│   ├── providers.tsx           # Context providers
│   ├── page.tsx                # Home (redirects to dashboard)
│   ├── login/page.tsx          # Login page
│   ├── register/page.tsx       # Registration page
│   ├── dashboard/page.tsx      # Student dashboard
│   ├── courses/
│   │   ├── [courseId]/
│   │   │   ├── page.tsx        # Course detail
│   │   │   └── lessons/
│   │   │       └── [lessonId]/
│   │   │           └── page.tsx # Lesson player
│   ├── downloads/page.tsx      # Download management
│   └── teacher/
│       ├── dashboard/page.tsx  # Teacher dashboard
│       └── courses/
│           └── [courseId]/
│               ├── edit/page.tsx
│               └── progress/page.tsx
│
├── components/
│   ├── Navbar.tsx              # Top navigation
│   ├── PageWrapper.tsx         # Layout wrapper
│   ├── PrivateRoute.tsx        # Auth guard
│   ├── OfflineBanner.tsx       # Offline indicator
│   ├── SyncStatusIndicator.tsx # Sync status badge
│   ├── DevelopmentToggle.tsx   # Dev offline simulator
│   ├── student/
│   │   ├── CourseCard.tsx
│   │   ├── ModuleAccordion.tsx
│   │   ├── LessonList.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── PDFViewer.tsx
│   │   ├── QuizPlayer.tsx
│   │   └── DownloadManager.tsx
│   ├── teacher/
│   │   ├── CourseForm.tsx
│   │   ├── ModuleBuilder.tsx
│   │   ├── ProgressTable.tsx
│   │   └── SummaryCards.tsx
│   └── ui/                     # shadcn components
│
├── contexts/
│   ├── AuthContext.tsx         # Auth state & logic
│   ├── NetworkContext.tsx      # Network detection
│   └── SyncContext.tsx         # Sync queue & engine
│
├── hooks/
│   ├── useAuth.ts              # useAuth hook
│   ├── useNetworkStatus.ts     # useNetworkStatus hook
│   └── useSyncStatus.ts        # useSyncStatus hook
│
├── lib/
│   ├── db.ts                   # Dexie database setup
│   ├── api.ts                  # API service layer
│   ├── mockDataLoader.ts       # Mock data initialization
│   ├── utils.ts                # Utility functions
│   └── auth.ts                 # JWT utilities
│
├── mock/
│   ├── courses.json            # Mock course data
│   ├── lessons.json            # Mock lessons
│   ├── quizzes.json            # Mock quizzes
│   └── progress.json           # Mock progress
│
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── icon-192x192.png        # App icon
│   ├── icon-512x512.png        # App icon (large)
│   ├── icon-*-maskable.png     # Maskable icons
│   └── screenshot-*.png        # PWA screenshots
│
├── app/globals.css             # Global styles & theme
├── next.config.mjs             # Next.js config with PWA
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

---

## Data Flow Diagrams

### Offline-First Read Flow
```
Component
  ↓
IndexedDB (try local cache)
  ├─ Cache hit → Use cached data
  └─ Cache miss → Fetch from API (if online)
       ↓
   API Response
       ↓
   Update IndexedDB
       ↓
   Update component state
```

### Offline-First Write Flow
```
Component (e.g., mark lesson complete)
  ↓
Update IndexedDB immediately
  ↓
If online: POST to API
  ├─ Success → Mark as synced, remove from queue
  └─ Failure → Add to syncQueue for retry
  ↓
If offline: Add to syncQueue
  ↓
When online: runSync() processes queue
  ├─ Retry up to 3 times
  ├─ On success → Update synced flag
  └─ On final failure → Keep in queue
```

### Video/PDF Download Flow
```
User clicks "Download"
  ↓
API fetch media as ArrayBuffer/Blob
  ├─ Show progress bar
  └─ Update onProgress callback
  ↓
Store Blob in IndexedDB (lesson.localBlobUrl)
  ↓
Mark lesson as downloaded (isDownloaded = true)
  ↓
Create object URL from Blob
  ↓
Pass to VideoPlayer/PDFViewer
  ↓
Player renders from local Blob URL
```

---

## Performance Considerations

### Service Worker Caching
- Static assets cached for 30 days
- Images cached for 1 year
- API responses cached for 5 hours
- Cache-first strategy for assets (instant load)
- Network-first for API (fresh data when possible)

### IndexedDB Optimization
- Compound indexes for multi-field queries
- Lazy loading of course content
- Progress batching for sync (multiple items at once)
- Automatic cleanup of old sync queue items

### Network Optimization
- Connection quality detection
- Warns before downloading on slow connections
- Automatic retry with exponential backoff
- Minimal JWT payload size

---

## Security Considerations

### Token Management
- JWT tokens stored in IndexedDB (not localStorage)
- Auto-expiry after 24 hours
- Session cleared on logout
- Token attached to all API requests

### CORS & API Calls
- All API calls go through `apiService`
- JWT attached to Authorization header
- 401 errors trigger logout
- Network errors handled gracefully

### Input Validation
- Client-side validation on all forms
- Email format validation
- Password length requirements
- Zod schema validation for API responses

---

## Offline Capabilities Checklist

✅ App loads and navigates offline
✅ Courses and lessons persist offline
✅ Quiz submission queues for later sync
✅ Progress updates work offline
✅ Downloads managed offline
✅ Service worker caches assets
✅ Automatic sync on reconnection
✅ Offline/online indicators visible
✅ PWA installable on mobile
✅ Blob URLs for media playback
✅ Mock data for testing

---

## Future Enhancements

1. **Backend Integration**
   - Replace mock API with real endpoints
   - Real user authentication with bcrypt
   - Database persistence server-side

2. **Advanced Features**
   - Video streaming with HLS/DASH
   - Real-time progress analytics
   - Discussion forums
   - Certificates/achievements

3. **Performance**
   - Service worker optimization
   - Image lazy loading
   - Code splitting per route
   - Compression for media

4. **User Experience**
   - Dark mode support
   - Localization/i18n
   - Accessibility improvements
   - Push notifications for updates

---

## Testing the Offline-First Features

### Manual Testing Steps

1. **Initial Load (Online)**
   - Visit `http://localhost:3000`
   - Login with demo credentials
   - Navigate to a course
   - Open DevTools, verify SW registered

2. **Download Content**
   - Click "Download Course"
   - Observe progress bar
   - Verify lesson shows "Saved" badge

3. **Test Offline Mode**
   - Click DEV button (bottom-left, dev only)
   - Toggle to "Offline"
   - Navigate pages (should work)
   - Try updating progress (should queue)

4. **Verify Sync**
   - Watch sync indicator change to "X pending"
   - Toggle back to "Online"
   - Observe sync indicator show "Syncing..."
   - Verify updates applied

5. **Quiz Offline**
   - Submit quiz while offline
   - Observe "pending" badge
   - Go online, verify sync occurs

---

## Deployment

### Vercel Deployment
```bash
git push origin main
```

Vercel automatically:
- Builds Next.js project
- Deploys service worker
- Optimizes assets
- Enables PWA manifest

### PWA Installation
- Desktop (Chrome): Install button in address bar
- Mobile (Android): "Install app" menu
- Mobile (iOS): Share → Add to Home Screen

---

## Support & Resources

- [Next.js Documentation](https://nextjs.org)
- [next-pwa Documentation](https://www.npmjs.com/package/next-pwa)
- [Dexie.js Documentation](https://dexie.org)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

