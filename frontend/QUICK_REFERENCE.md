# EduSync Frontend - Quick Reference Card

## File Locations Cheat Sheet

| What | Where |
|------|-------|
| User authentication context | `contexts/AuthContext.tsx` |
| Network status tracking | `contexts/NetworkContext.tsx` |
| Sync queue management | `contexts/SyncContext.tsx` |
| API calls & offline logic | `lib/api.ts` |
| Database setup (IndexedDB) | `lib/db.ts` |
| Custom auth hook | `hooks/useAuth.ts` |
| Custom network hook | `hooks/useNetworkStatus.ts` |
| Custom sync hook | `hooks/useSyncStatus.ts` |
| Offline indicator | `components/OfflineBanner.tsx` |
| Sync status badge | `components/SyncStatusIndicator.tsx` |
| Top navigation | `components/Navbar.tsx` |
| Page layout wrapper | `components/PageWrapper.tsx` |
| Dev mode toggle | `components/DevelopmentToggle.tsx` |
| Protected routes | `components/PrivateRoute.tsx` |
| Student dashboard | `app/dashboard/page.tsx` |
| Course view | `app/courses/[courseId]/page.tsx` |
| Lesson player | `app/courses/[courseId]/lessons/[lessonId]/page.tsx` |
| Teacher dashboard | `app/teacher/dashboard/page.tsx` |
| Downloads page | `app/downloads/page.tsx` |
| Login page | `app/login/page.tsx` |
| Register page | `app/register/page.tsx` |
| Video player | `components/student/VideoPlayer.tsx` |
| PDF viewer | `components/student/PDFViewer.tsx` |
| Quiz player | `components/student/QuizPlayer.tsx` |
| Course card | `components/student/CourseCard.tsx` |
| PWA config | `next.config.mjs` |
| Root layout | `app/layout.tsx` |
| All providers | `app/providers.tsx` |

---

## Common Code Snippets

### Get Current User
```typescript
'use client';
import { useAuth } from '@/hooks/useAuth';

const { user, isAuthenticated } = useAuth();
// user: { userId, email, name, role, token }
// isAuthenticated: boolean
```

### Check If Online
```typescript
'use client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const { isOnline, connectionQuality } = useNetworkStatus();
// isOnline: boolean
// connectionQuality: 'excellent' | 'good' | 'slow' | 'offline'
```

### Get Sync Status
```typescript
'use client';
import { useSyncStatus } from '@/hooks/useSyncStatus';

const { pendingChanges, isSyncing, syncError } = useSyncStatus();
// pendingChanges: number
// isSyncing: boolean
// syncError: string | null
```

### Make API Call
```typescript
import { apiService } from '@/lib/api';

// GET
const courses = await apiService.get('/courses');

// POST
const result = await apiService.post('/progress', {
  lessonId: 'lesson-1',
  completedAt: new Date()
});

// PUT
const updated = await apiService.put('/progress/id', { watched: 30 });

// DELETE
await apiService.delete('/progress/id');
```

### Query Database
```typescript
import { db } from '@/lib/db';

// Get all
const courses = await db.courses.toArray();

// Get one
const course = await db.courses.get('course-1');

// Get filtered
const userProgress = await db.progress
  .where('userId').equals('user-1')
  .toArray();

// Add
await db.courses.add({ courseId: 'c1', title: 'React' });

// Update
await db.courses.update('course-1', { title: 'New Title' });

// Delete
await db.courses.delete('course-1');

// Bulk operations
await db.courses.bulkPut(courseArray);
await db.courses.bulkDelete(idArray);
```

### Protect a Route
```typescript
import { PrivateRoute } from '@/components/PrivateRoute';

<PrivateRoute allowedRoles={['student']}>
  <YourComponent />
</PrivateRoute>

// allowedRoles: ['student'] | ['teacher'] | ['student', 'teacher']
// Redirects to /login if not authenticated or wrong role
```

### Handle Offline State
```typescript
'use client';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function MyComponent() {
  const { isOnline } = useNetworkStatus();

  if (!isOnline) {
    return <OfflineMessage />;
  }

  return <OnlineComponent />;
}
```

### Make Optimistic Update
```typescript
const handleMarkComplete = async (lessonId: string) => {
  // Update UI immediately
  setLessonStatus(lessonId, 'completed');

  try {
    // Try to sync to backend
    await apiService.post('/progress', { lessonId });
  } catch (error) {
    // Revert if fails
    setLessonStatus(lessonId, 'pending');
    showError('Failed to save');
  }
};
```

---

## Database Schema Quick Reference

```typescript
users: { userId, email, name, role, lastLogin }
courses: { courseId, title, description, category, modules }
modules: { moduleId, courseId, title, order }
lessons: { lessonId, courseId, moduleId, title, type, contentUrl, completed }
quizzes: { quizId, title, questions, passingScore }
progress: { progressId, userId, lessonId, courseId, completedAt, watchedDuration }
quizResults: { resultId, userId, quizId, lessonId, score, answers }
syncQueue: { queueId, action, resource, resourceId, payload, retries, status }
sessions: { sessionId, userId, token, expiresAt }
```

---

## API Endpoint Quick Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/login` | Login user |
| POST | `/auth/register` | Register user |
| POST | `/auth/logout` | Logout user |
| GET | `/courses` | List courses |
| GET | `/courses/:id` | Get course details |
| POST | `/progress` | Save progress |
| GET | `/users/:id/progress` | Get user progress |
| POST | `/quizzes/:id/submit` | Submit quiz |
| GET | `/quizzes/:id` | Get quiz |
| GET | `/teacher/courses` | Teacher's courses |
| GET | `/teacher/analytics` | Teacher analytics |

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_TIMEOUT=15000
NEXT_PUBLIC_MAX_RETRY_ATTEMPTS=3
```

---

## Demo Credentials

```
Student:
  Email: student@example.com
  Password: password123

Teacher:
  Email: teacher@example.com
  Password: password123
```

---

## Development Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Run production build
pnpm tsc --noEmit # Type check
pnpm format       # Format code
```

---

## Debugging Tips

| Problem | Solution |
|---------|----------|
| API calls failing | Check `NEXT_PUBLIC_API_URL` environment variable |
| Offline not working | Click DEV toggle to simulate offline |
| Data not persisting | Check IndexedDB in DevTools |
| Token expires | Check token in IndexedDB sessions table |
| Sync not working | Check syncQueue in IndexedDB |
| Service worker not caching | Check Cache Storage in DevTools |
| CORS errors | Verify backend allows requests from frontend |

---

## Page Route Structure

```
/                      → Redirect to /dashboard or /login
/login                 → Login page
/register              → Registration page
/dashboard             → Student course list
/courses/:courseId     → Course details with modules
/courses/:courseId/lessons/:lessonId → Lesson player
/teacher/dashboard     → Teacher course management
/downloads             → Download management
/not-found             → 404 page
```

---

## Component Props Quick Reference

### CourseCard
```typescript
<CourseCard
  course={courseObj}
  onEnroll={() => handleEnroll()}
  isEnrolled={boolean}
/>
```

### VideoPlayer
```typescript
<VideoPlayer
  videoUrl="https://..."
  title="Lesson Title"
  onComplete={() => markComplete()}
/>
```

### QuizPlayer
```typescript
<QuizPlayer
  quiz={quizData}
  onSubmit={(answers) => submitQuiz(answers)}
/>
```

### PrivateRoute
```typescript
<PrivateRoute allowedRoles={['student']}>
  <ProtectedComponent />
</PrivateRoute>
```

---

## Common Patterns

### Fetch and Cache
```typescript
const data = await apiService.get('/endpoint');
await db.tableName.bulkPut(data);
setData(data);
```

### Update with Sync
```typescript
await apiService.post('/endpoint', payload);
// Automatically queues if offline
```

### Check Network Before Action
```typescript
const { isOnline } = useNetworkStatus();
if (!isOnline) {
  showMessage('Offline - changes will sync when online');
}
```

### Show Pending Changes
```typescript
const { pendingChanges } = useSyncStatus();
{pendingChanges > 0 && <SyncBadge count={pendingChanges} />}
```

---

## Key Hooks to Know

```typescript
useAuth()          → { user, isAuthenticated, login, logout, register }
useNetworkStatus() → { isOnline, connectionQuality }
useSyncStatus()    → { pendingChanges, isSyncing, syncError }
useRouter()        → Next.js router (navigation)
useEffect()        → Side effects
useState()         → Local state
useCallback()      → Memoized functions
```

---

## Important File Details

### lib/api.ts
- Handles all HTTP requests
- Implements offline-first pattern
- Attaches JWT tokens automatically
- Queues failed requests to sync queue
- Returns cached data if offline

### lib/db.ts
- Creates IndexedDB database with Dexie
- Defines 9 data tables/stores
- Provides type-safe queries
- Auto-initializes with mock data on first run

### contexts/AuthContext.tsx
- Manages user login/logout
- Stores JWT token in IndexedDB
- Provides useAuth hook
- Handles role-based access

### contexts/NetworkContext.tsx
- Detects online/offline status
- Monitors connection quality
- Triggers sync on connectivity restore
- Provides useNetworkStatus hook

### contexts/SyncContext.tsx
- Manages offline change queue
- Retries failed requests
- Updates UI with sync status
- Clears queue on successful sync

---

## Testing Checklist

```
□ Login with demo credentials
□ See courses in dashboard
□ Click into course and view lessons
□ Watch video lesson
□ Submit quiz and see score
□ Click DEV button (simulate offline)
□ Make a change (mark complete)
□ See sync badge appear
□ Click DEV again (simulate online)
□ Changes sync automatically
□ Sync badge disappears
□ Navigate while offline (data still loads)
□ Check IndexedDB contains data
```

---

## Directory Navigation

```
Need to...          | Go to...
Add new page        | app/page-name/page.tsx
Add new component   | components/ComponentName.tsx
Add new hook        | hooks/useHookName.ts
Add database table  | lib/db.ts
Add API endpoint    | lib/api.ts
Handle auth         | contexts/AuthContext.tsx
Handle network      | contexts/NetworkContext.tsx
Handle sync         | contexts/SyncContext.tsx
Add styles          | app/globals.css
Add UI components   | components/ui/
Add student feature | components/student/
```

---

## Quick Deployment Checklist

```
□ Set NEXT_PUBLIC_API_URL to production backend
□ Verify all endpoints implemented
□ Test offline functionality
□ Test sync queue with slow connection
□ Check CORS configuration
□ Enable HTTPS
□ Build and test: pnpm build && pnpm start
□ Deploy to Vercel
□ Test on mobile device
□ Check PWA installation works
□ Monitor error logs
```

---

## Performance Metrics

- First page load: ~2-3 seconds
- Offline data read: <100ms
- API call: 2-5 seconds
- Bundle size: ~150KB gzipped
- IndexedDB query: ~50ms

---

## Useful Resources

- React docs: https://react.dev
- Next.js docs: https://nextjs.org/docs
- TypeScript docs: https://www.typescriptlang.org/docs
- Dexie docs: https://dexie.org
- Tailwind docs: https://tailwindcss.com
- shadcn/ui: https://ui.shadcn.com

---

This quick reference should help you navigate the codebase and complete common tasks quickly. For detailed explanations, refer to FRONTEND_GUIDE.md, BACKEND_INTEGRATION.md, and ARCHITECTURE.md.
