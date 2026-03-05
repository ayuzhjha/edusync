1. Core Objective
• The platform enables students with unstable internet connectivity to access educational content
continuously using an Offline■First architecture.
• The system prioritizes local data availability, background synchronization, and server
consistency.
• Students download course materials when internet is available and continue learning offline.
• Once connectivity returns, the system synchronizes progress, quizzes, and updates with the
central server.
2. High Level Architecture
• The system consists of multiple layers: Client Layer (Progressive Web App), Service Worker
Layer for caching, Backend API layer for handling requests,
• Application Services for business logic, and a Database plus Storage layer for structured data
and media files.
3. Client Layer (Frontend)
• The frontend is implemented as a Progressive Web Application built using React or Next.js.
• It handles UI rendering, user interaction, offline content access, local storage, network
monitoring, and synchronization logic.
• The application can be installed on mobile devices or desktops just like a native application.
4. Service Worker Layer
• Service workers intercept network requests and manage caching strategies.
• They cache static assets such as HTML, CSS, JavaScript and images, while dynamic requests
fetch fresh data when available.
• This allows the application to function even without network connectivity.
5. Local Storage Layer
• IndexedDB is used as the browser database for storing structured offline data.
• It stores courses, modules, lessons, downloaded media, quiz results and progress information.
• Dexie.js simplifies interaction with IndexedDB and improves development speed.
6. Backend Layer
• The backend is implemented using Node.js and Express.
• It exposes REST APIs for authentication, course management, lesson management, progress
tracking and synchronization logic.
7. Authentication System
• Secure authentication is implemented using JSON Web Tokens (JWT).
• When a user logs in, the server validates credentials and generates a token.
• The client uses this token for authenticated API requests.
8. Course Management System
• Courses are organized hierarchically: Courses contain Modules and Modules contain Lessons.
• Each lesson may include video lectures, notes and quizzes.
• Metadata is stored in the database while media files are stored in cloud storage.
9. Content Delivery System
• Students can download modules for offline access.
• When a module is downloaded the system stores videos, PDFs and quiz data locally using
IndexedDB and the Cache API.
10. Video Storage and Streaming
• Videos are stored in cloud storage such as AWS S3.
• They are converted into adaptive streaming formats like HLS using FFmpeg.
• This allows efficient streaming and downloading depending on network speed.
11. Offline Learning System
• Offline mode allows students to watch videos, read notes, attempt quizzes and track learning
progress without internet connectivity.
• All data interactions occur locally until synchronization occurs.
12. Progress Tracking
• The platform tracks completed lessons, quiz scores and learning history.
• Progress is stored locally when offline and synchronized to the server when connectivity
returns.
13. Synchronization Engine
• The system monitors network status using browser APIs.
• When connectivity is restored the client uploads offline actions such as quiz results and lesson
completion,
• then downloads any updates from the server.
14. Conflict Resolution
• Conflicts occur when both server and local data change simultaneously.
• A timestamp-based strategy is used where the latest update overwrites older versions.
15. Teacher Portal
• Teachers can upload course materials including videos, PDFs and quizzes through an admin
interface.
• Uploaded media is stored in cloud storage and metadata is stored in the database.
16. Smart Download Manager
• Students can selectively download content such as videos, notes or quizzes.
• This helps reduce storage usage and data consumption.

17. Network Awareness
• The system detects connection speed and adjusts content delivery accordingly.
• Slow networks receive compressed resources while fast networks receive high■quality media.
18. Sync Queue System
• Offline actions are stored in a queue.
• Once internet connectivity returns the queue is processed sequentially and synchronized with
the backend.
19. Database Layer
• MongoDB Atlas is used for storing structured application data including users, courses,
modules, lessons, quizzes and progress information.
20. Storage Layer
• Educational media such as videos and PDFs are stored in AWS S3 object storage which
provides scalability and reliability.