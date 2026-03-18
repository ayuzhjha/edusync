<div align="center">
  <h1>🚀 EduSync</h1>
  <p><strong>The Offline-First Educational Platform for Uninterrupted Learning</strong></p>

  <p>
    <a href="#features"><img src="https://img.shields.io/badge/Features-Extensive-blue?style=for-the-badge&logoColor=white" alt="Features"></a>
    <a href="#tech-stack"><img src="https://img.shields.io/badge/Tech_Stack-Modern-success?style=for-the-badge&logoColor=white" alt="Tech Stack"></a>
    <a href="#architecture"><img src="https://img.shields.io/badge/Architecture-Offline_First-orange?style=for-the-badge&logoColor=white" alt="Architecture"></a>
    <a href="#getting-started"><img src="https://img.shields.io/badge/Install-Quick-green?style=for-the-badge&logoColor=white" alt="Install"></a>
  </p>
</div>

---

## 📖 About EduSync

**EduSync** is a comprehensive Progressive Web App (PWA) built to empower students in areas with unstable or limited internet connectivity. By fully leveraging an **Offline-First architecture**, EduSync ensures that continuous learning is a reality. Students can download course materials while connected, digest the content completely offline, and automatically synchronize their progress once internet connectivity is restored.

Whether you're exploring training modules, taking quizzes, or tracking your continuous learning streaks, EduSync delivers a seamless, native-like experience directly within the browser.

---

## ✨ Key Features

### 🔌 True Offline-First Experience
*   **Service Worker Magic:** Fully installable PWA equipped with smart background sync and aggressive caching strategies (using `next-pwa`).
*   **Local Database Integration:** Employs **IndexedDB** (via `Dexie.js`) to cache and persist courses, lessons, quizzes, and user progress natively on the user's device.
*   **Media Caching:** Securely stores instructional videos and PDFs locally as binary Blobs for immediate, buffer-free offline playback.
*   **Smart Sync Engine:** Background synchronization safely queues your offline actions (like quiz submissions, course enrollments, and lesson completions). It intelligently syncs them with the backend when network conditions allow, retaining retries for failure safety.

### 🎓 Unmatched Student Experience
*   **Interactive Dashboard:** A centralized place to view enrolled courses, monitor learning streaks, and track all-time progress.
*   **Rich Media Players:** Native HTML5 video players and responsive embedded PDF viewers perfectly tuned for offline delivery.
*   **Interactive Quizzes:** Challenge yourself with module quizzes while entirely offline, get instant local grading, and see your score automatically synchronized later.
*   **Download Manager:** Actively track local storage utilization so you effectively manage space by selectively downloading or removing completed courses.

### 👨‍🏫 Powerful Teacher Features
*   **Dynamic Course Builder:** Easily create modules, upload diverse lessons, and structure challenging quizzes.
*   **Analytics Dashboard:** Stay on top of student engagement, completion metrics, and test scores in a granular overview.
*   **Role-Based Security:** Dedicated isolated layouts distinguishing students, instructors, and system administrators perfectly.

---

## 🛠 Tech Stack

EduSync brings together a modern, robust, and highly scalable set of technologies:

### **Frontend (Client PWA)**
*   **Framework:** [Next.js 16+](https://nextjs.org/) (App Router, Server Actions)
*   **Library:** [React 19+](https://react.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling & UI:** [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **State & Offline Storage:** React Context API + **Dexie.js** (IndexedDB wrapper)
*   **PWA Enabler:** `next-pwa`

### **Backend (API)**
*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Express.js](https://expressjs.com/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Authentication:** JWT (JSON Web Tokens)
*   **Storage Handling:** Local static storage mapping (Extensible to AWS S3 & CDN integrations)

### **Database (Persistence)**
*   **Production / Cloud Database:** MongoDB Atlas (Planned schema alignment)
*   **Client / Target Sync Database:** IndexedDB

---

## 🏗 System Architecture & Data Flow

EduSync utilizes an ambitious dual-layer synchronization model ensuring rock-solid availability:

1.  **Read Flow (Stale-While-Revalidate):** 
    UI components instantly query IndexedDB showing data essentially without delay. In the background (when online), the client requests fresh data from the Express backend, silently updating the local cache and dynamically refreshing the interface without intrusive loading spinners.
2.  **Write Flow (Optimistic UI):** 
    User interactions (like marking a lesson complete) update the local database instantly granting a rapid response visual confirmation. Behind the scenes, the event metadata is injected into a persistent **Sync Queue**. 
3.  **Resilient Sync Engine:** 
    A background loop watches connection lifecycle events. When online, it systematically processes pending queue entries sending robust payloads securely back to the API—with built-in exponential backoff in case of backend flakiness.

---

## 🚀 Getting Started

Follow these step-by-step instructions to get the EduSync suite running on your local machine.

### Prerequisites
*   **Node.js** (v18.x or higher)
*   **pnpm** (preferred) or npm/yarn

### Bootstrapping the Project

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/edusync.git
    cd edusync
    ```

2.  **Initialize & Run the Backend API**
    ```bash
    cd backend
    npm install
    # Execute the backend local development server (Express)
    npm run dev
    ```
    *The API will usually default to spinning up on port `5000` or `8080` check terminal logs for details.*

3.  **Initialize & Run the Frontend Client**
    ```bash
    # From the project root, move to the frontend
    cd ../frontend
    
    # Using pnpm is highly recommended for faster installations
    pnpm install
    
    # Run the Next.js development server
    pnpm run dev
    ```

4.  **Explore the Application**
    *   Navigate your updated, modern browser to **[http://localhost:3000](http://localhost:3000)**.
    *   *Pro-tip:* To rigorously test offline flow, toggle "Offline" natively within the Chrome/Edge DevTools (Network tab), or utilize EduSync's bottom-left DEV corner debug toggle!

---

## 🔐 Demonstration Credentials

To rapidly experience the role-based functionality, you can log in natively with the following seeded credentials:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Student** | `student@example.com` | `password123` |
| **Teacher** | `teacher@example.com` | `password123` |

---

## 📁 Repository Structure

```text
edusync/
├── backend/                  # Node.js/Express System API
│   ├── src/
│   │   ├── controllers/      # Route logic (Users, Progressive Sync, Validations)
│   │   ├── models/           # Schemas & Types
│   │   ├── routes/           # Express Mapping definitions
│   │   └── index.ts          # Backend Bootstrap Configuration
│   └── package.json          # Backend Dependencies
│
├── frontend/                 # Next.js Full PWA Client
│   ├── app/                  # App Router Core Layouts, Providers, Routes
│   ├── components/           # UI Component Sandbox (shadcn, Student/Teacher Views)
│   ├── contexts/             # Real-time Contexts (Engineers: Auth, Net, Sync)
│   ├── lib/                  # Fundamental Utils (IndexedDB Dexie schema wrappers)
│   ├── public/               # Root static PWA elements (Manifest, Icons)
│   └── package.json          # Frontend Dependencies
│
└── storage/                  # Common mounted point for dev environment media
```

---

## 🔮 Future Roadmap

We are constantly polishing EduSync to ensure it meets enterprise educational needs:

*   [ ] **Cloud Integration:** Migrate local media storage purely to AWS S3 & integrate HLS video adaptive streaming.
*   [ ] **Advanced Telemetry:** Present detailed timeline views, deep engagement analysis, and module bottlenecks inside teacher dashboards.
*   [ ] **Collaboration Layer:** Introduce peer messaging and robust community feedback forums mapped natively per course.
*   [ ] **Automated Notifications:** Utilize Web Push interfaces for reminding students of impending sync payloads or daily learning targets.

---

## 🤝 Contributing

Contributions to push the boundaries of offline accessibility are immensely welcome! Please refer to standard fork-and-PR patterns. Make sure backend API changes gracefully handle legacy frontend synchronization states.

## 📝 License

This project is generously distributed under the MIT License. Feel free to use, enhance, or dissect it for personal learning. Let's make continuous learning ubiquitous.
