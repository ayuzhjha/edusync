# EduSync PWA - Quick Start Guide

## Getting Started

### Prerequisites
- Node.js 18+ with pnpm
- Modern browser with Service Worker support

### Installation

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Run Development Server**
   ```bash
   pnpm dev
   ```

3. **Open in Browser**
   ```
   http://localhost:3000
   ```

---

## First Time Setup

### Demo Login

The app comes with pre-configured demo credentials for testing:

**Student Account:**
- Email: `student@example.com`
- Password: `password123`

**Teacher Account:**
- Email: `teacher@example.com`
- Password: `password123`

1. Click on login page
2. Enter student email and password
3. Click "Sign In"
4. You'll be redirected to the student dashboard

---

## Key Features to Explore

### Student Dashboard
- View all enrolled courses
- See progress percentages
- Click "Continue Course" or "Start Course"

### Course Browsing
- Expandable modules with lessons
- Video, PDF, and Quiz lessons
- Progress tracking per lesson
- Download entire course for offline use

### Lessons
- **Video Lessons**: HTML5 player (mock videos)
- **PDF Lessons**: PDF viewer for notes
- **Quiz Lessons**: Multiple-choice questions with instant scoring
- "Mark as Complete" button to track progress

### Downloads
- Download individual lessons or entire courses
- Track storage usage
- View all downloaded content
- Delete content to free space

### Teacher Dashboard
- View all courses you've created
- See enrollment and lesson counts
- Edit course content
- View student progress analytics

---

## Testing Offline Features

### Enable Offline Mode

1. **Open DEV Toggle** (bottom-left, development only)
   - Click gray "DEV" button
   - Shows current online/offline status

2. **Toggle Offline**
   - Click the "Online" button to go offline
   - Button changes to orange "Offline"
   - You'll see orange "Offline" banner at bottom

3. **Simulate Connectivity Loss**
   - Open DevTools (F12)
   - Go to Network tab
   - Set throttling to "Offline"
   - Or use the DEV toggle (simpler)

### What Works Offline

✅ View all downloaded courses and lessons
✅ Read course content (videos, PDFs)
✅ Take quizzes and submit answers
✅ Mark lessons as complete
✅ Browse navigation and dashboards
✅ All UI interactions

⏳ Offline actions queue for sync:
- Quiz submissions
- Progress updates
- Any data changes

### Verify Sync Works

1. **Go Offline**
   - Use DEV toggle to go offline
   - Navigate to a lesson
   - Take a quiz and submit

2. **Observe Sync Status**
   - Notice "X pending" badge in navbar
   - Shows unsynchronized changes

3. **Go Back Online**
   - Click DEV toggle to go online
   - Watch sync indicator change to "Syncing..."
   - After 1-2 seconds, shows "All synced"

4. **Verify Persistence**
   - Refresh page (Ctrl+R)
   - All data persists
   - App loads from IndexedDB first

---

## Understanding the Architecture

### Where Data is Stored

**IndexedDB** (`EducationDB`)
- Courses, modules, lessons
- Quizzes and questions
- User progress and quiz results
- Sync queue for offline changes
- Session tokens

**Service Worker Cache**
- Static assets (JS, CSS)
- Images and fonts
- API responses (5 hour TTL)

**Browser Memory**
- Current UI state
- Auth context (user, token)
- Network status

### How Offline Works

1. **First Visit (Online)**
   - Download all static assets
   - Fetch course data
   - Save everything to IndexedDB

2. **Offline Mode**
   - Service worker serves cached assets
   - IndexedDB provides all data
   - UI remains fully functional

3. **Back Online**
   - Auto-detect connection
   - Process sync queue
   - Update server with changes
   - Sync indicator shows progress

---

## Common Tasks

### Download a Course

1. Go to Course Detail page
2. Click "Download Course" button
3. Wait for download to complete
4. See "Saved" badge on course card

### Mark Lesson Complete

1. Open a lesson (video or PDF)
2. Click "Mark as Complete" button
3. Checkmark appears on lesson
4. Progress bar updates

### Take a Quiz

1. Navigate to quiz lesson
2. Answer all questions (radio buttons)
3. Click "Submit Quiz"
4. See results immediately
5. Review answers
6. Changes sync automatically when online

### View Progress

**As Student:**
- Dashboard shows overall stats
- Course cards show progress bars
- Lesson completion checkmarks

**As Teacher:**
- Course progress page shows:
  - Student list
  - Completion status per lesson
  - Module filter
  - Detailed analytics

---

## Troubleshooting

### Service Worker Not Registering

1. Check DevTools → Application → Service Workers
2. Verify `localhost:3000` shows registered
3. Check browser console for errors
4. Try hard refresh (Ctrl+Shift+R)

### Offline Mode Not Working

1. Verify DEV toggle shows correct status
2. Check DevTools → Application → IndexedDB
3. Open `EducationDB` and verify tables have data
4. Try loading a page you've visited before

### Quiz Results Not Syncing

1. Go offline and submit quiz
2. Check sync indicator in navbar
3. Should show "X pending"
4. Go online and watch it sync
5. Check DevTools Console for sync logs

### Lost Course Progress

1. Open DevTools → Application → IndexedDB
2. Check `EducationDB` → `progress` table
3. Should see entries for each lesson
4. If empty, data wasn't saved (bug or refresh before save)

---

## File Structure Overview

```
Key Files for Understanding:

Frontend Entry:
└─ app/page.tsx              → Redirects to dashboard

Authentication:
└─ contexts/AuthContext.tsx  → Login, logout, token management

Offline Detection:
├─ contexts/NetworkContext.tsx
└─ components/DevelopmentToggle.tsx

Data Storage:
└─ lib/db.ts                → Dexie database setup

Course Content:
├─ app/courses/page.tsx     → Browse courses
└─ app/dashboard/page.tsx   → Student home

Lessons:
├─ components/student/VideoPlayer.tsx
├─ components/student/PDFViewer.tsx
└─ components/student/QuizPlayer.tsx

Sync Engine:
├─ contexts/SyncContext.tsx → Sync queue management
└─ lib/api.ts               → API service layer

Mock Data:
└─ lib/mockDataLoader.ts    → Loads sample courses
```

---

## Performance Tips

### Optimize Local Storage
- IndexedDB can hold ~50MB per domain
- Downloaded videos count toward quota
- Delete old courses to free space
- Check "Downloads" page for usage

### Improve Sync Performance
- Keep sync queue small
- Complete quizzes while online when possible
- Offline changes only sync on reconnection

### Better UX
- Use DEV toggle to test offline before deployment
- Verify sync completes before visiting next page
- Check sync status badge before assuming changes saved

---

## Development Features

### Debug Logging

All logs prefixed with `[v0]`:
```
[v0] Network: going online
[v0] Auth: User logged in
[v0] Sync: Processing 3 items
[v0] API: GET /api/courses
```

### Mock API

Currently uses mock data from `lib/mockDataLoader.ts`:
- 3 sample courses
- 15+ lessons
- 2+ quizzes
- Pre-populated student data

To integrate real backend:
1. Replace mock data with API calls
2. Update `apiService` endpoints
3. Implement real authentication
4. Configure environment variables

---

## Next Steps

### Customization

1. **Add Your Own Courses**
   - Edit `lib/mockDataLoader.ts`
   - Add course metadata
   - Create lesson content

2. **Customize Branding**
   - Update `public/manifest.json`
   - Replace app icons
   - Modify colors in `globals.css`

3. **Connect Backend**
   - Update API endpoints in `lib/api.ts`
   - Implement real authentication
   - Database integration

### Deployment

1. **To Vercel**
   ```bash
   vercel deploy
   ```

2. **Self-Hosted**
   ```bash
   pnpm build
   pnpm start
   ```

3. **Test PWA Installation**
   - Android: Menu → Install app
   - iOS: Share → Add to Home Screen
   - Desktop: Install button in address bar

---

## Support

For detailed architecture information, see `ARCHITECTURE.md`

Common issues and solutions available in troubleshooting section above.

Happy learning!
