import Dexie, { Table } from 'dexie';

// Define types for all database tables
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  moduleCount: number;
  lessonCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface OfflineAsset {
  id: string;
  blob: Blob;
  mimeType: string;
}
export interface Module {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessonCount: number;
  createdAt: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  type: 'video' | 'pdf' | 'quiz';
  duration?: number; // in minutes for video
  pageCount?: number; // for PDF
  contentUrl?: string; // URL to fetch content from
  localBlobUrl?: string; // Blob URL stored locally for offline access
  thumbnailUrl?: string;
  order: number;
  isDownloaded: boolean;
  downloadedAt?: number;
  size?: number; // file size in bytes
  createdAt: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  createdAt: number;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface Progress {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: number;
  lastAccessedAt: number;
  timeSpent: number; // in seconds
  synced: boolean; // whether this entry has been synced to backend
}

export interface QuizResult {
  id: string;
  userId: string;
  courseId: string;
  lessonId: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  answers: number[]; // array of selected option indices
  submittedAt: number;
  synced: boolean;
}

export interface SyncQueueItem {
  id: string;
  userId: string;
  type: 'progress' | 'quiz_result' | 'course_enrollment';
  resourceId: string; // ID of the resource being synced
  payload: any;
  retryCount: number;
  lastRetryAt?: number;
  error?: string;
  createdAt: number;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  createdAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'teacher';
  avatar?: string; // data-URL of profile picture
  createdAt: number;
}

export interface ActivityLog {
  id: string;       // `${userId}-${YYYY-MM-DD}`
  userId: string;
  date: string;     // 'YYYY-MM-DD'
  count: number;    // number of lesson interactions that day
}

export interface UserAvatar {
  userId: string;
  dataUrl: string;  // base64 data-URL
}

// Initialize Dexie database
export class EducationDB extends Dexie {
  courses!: Table<Course>;
  modules!: Table<Module>;
  lessons!: Table<Lesson>;
  quizzes!: Table<Quiz>;
  progress!: Table<Progress>;
  quizResults!: Table<QuizResult>;
  syncQueue!: Table<SyncQueueItem>;
  sessions!: Table<Session>;
  users!: Table<User>;
  assets!: Table<OfflineAsset>;
  activityLog!: Table<ActivityLog>;
  avatars!: Table<UserAvatar>;

  constructor() {
    super('EducationDB');
    this.version(2).stores({
      courses: 'id, category, level',
      modules: 'id, courseId',
      lessons: 'id, courseId, moduleId, type',
      quizzes: 'id, courseId, lessonId',
      progress: 'id, userId, courseId, lessonId, synced',
      quizResults: 'id, userId, courseId, synced',
      syncQueue: 'id, userId, type, createdAt',
      sessions: 'id, userId',
      users: 'id, email',
      assets: 'id',
      attempts: '++id, quizId, synced'
    });
    // Version 3: add activityLog and avatars tables
    this.version(3).stores({
      courses: 'id, category, level',
      modules: 'id, courseId',
      lessons: 'id, courseId, moduleId, type',
      quizzes: 'id, courseId, lessonId',
      progress: 'id, userId, courseId, lessonId, synced',
      quizResults: 'id, userId, courseId, synced',
      syncQueue: 'id, userId, type, createdAt',
      sessions: 'id, userId',
      users: 'id, email',
      assets: 'id',
      attempts: '++id, quizId, synced',
      activityLog: 'id, userId, date',
      avatars: 'userId',
    });
  }
}

// Create singleton instance
export const db = new EducationDB();

// Utility functions for database operations
export const dbUtils = {
  // Course operations
  // Asset operations for Offline Video
  async saveOfflineAsset(lessonId: string, blob: Blob): Promise<string> {
    // Save the actual file
    await db.assets.put({
      id: lessonId,
      blob: blob,
      mimeType: blob.type
    });

    // Update the lesson status to 'downloaded'
    await db.lessons.update(lessonId, {
      isDownloaded: true,
      downloadedAt: Date.now()
    });

    return lessonId;
  },

  async getOfflineAsset(lessonId: string): Promise<OfflineAsset | undefined> {
    return db.assets.get(lessonId);
  },
  async getCourses(): Promise<Course[]> {
    return db.courses.toArray();
  },

  async getCourse(id: string): Promise<Course | undefined> {
    return db.courses.get(id);
  },

  async saveCourse(course: Course): Promise<string> {
    return db.courses.put(course);
  },

  async saveCourses(courses: Course[]): Promise<void> {
    await db.courses.bulkPut(courses);
  },

  // Module operations
  async getModules(courseId: string): Promise<Module[]> {
    return db.modules.where('courseId').equals(courseId).toArray();
  },

  async saveModule(module: Module): Promise<string> {
    return db.modules.put(module);
  },

  // Lesson operations
  async getLessons(courseId: string, moduleId?: string): Promise<Lesson[]> {
    if (moduleId) {
      return db.lessons.where('moduleId').equals(moduleId).toArray();
    }
    return db.lessons.where('courseId').equals(courseId).toArray();
  },

  async getLesson(id: string): Promise<Lesson | undefined> {
    return db.lessons.get(id);
  },

  async saveLesson(lesson: Lesson): Promise<string> {
    return db.lessons.put(lesson);
  },

  async saveLessons(lessons: Lesson[]): Promise<void> {
    await db.lessons.bulkPut(lessons);
  },

  // Quiz operations
  async getQuiz(id: string): Promise<Quiz | undefined> {
    return db.quizzes.get(id);
  },

  async getQuizByLesson(lessonId: string): Promise<Quiz | undefined> {
    return db.quizzes.where('lessonId').equals(lessonId).first();
  },

  async saveQuiz(quiz: Quiz): Promise<string> {
    return db.quizzes.put(quiz);
  },

  // Progress operations
  async getProgress(userId: string, courseId: string): Promise<Progress[]> {
    return db.progress.where({ userId, courseId }).toArray();
  },

  async getLessonProgress(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<Progress | undefined> {
    return db.progress.where({ userId, courseId, lessonId }).first();
  },

  async saveProgress(progress: Progress): Promise<string> {
    return db.progress.put(progress);
  },

  async markLessonComplete(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<void> {
    const progress = await this.getLessonProgress(userId, courseId, lessonId);
    if (progress) {
      progress.completed = true;
      progress.completedAt = Date.now();
      progress.synced = false;
    } else {
      const newProgress: Progress = {
        id: `${userId}-${courseId}-${lessonId}`,
        userId,
        courseId,
        lessonId,
        completed: true,
        completedAt: Date.now(),
        lastAccessedAt: Date.now(),
        timeSpent: 0,
        synced: false,
      };
      await db.progress.add(newProgress);
      return;
    }
    await db.progress.put(progress);
  },

  // Quiz result operations
  async saveQuizResult(result: QuizResult): Promise<string> {
    return db.quizResults.put(result);
  },

  async getQuizResults(userId: string): Promise<QuizResult[]> {
    return db.quizResults.where('userId').equals(userId).toArray();
  },

  async getQuizResult(userId: string, quizId: string): Promise<QuizResult | undefined> {
    return db.quizResults.where({ userId, quizId }).first();
  },

  // Sync queue operations
  async addToSyncQueue(item: SyncQueueItem): Promise<string> {
    return db.syncQueue.add(item);
  },

  async getSyncQueue(userId: string): Promise<SyncQueueItem[]> {
    return db.syncQueue.where('userId').equals(userId).toArray();
  },

  async getPendingSyncItems(userId: string): Promise<SyncQueueItem[]> {
    return db.syncQueue
      .where('userId')
      .equals(userId)
      .filter((item) => item.retryCount < 3)
      .toArray();
  },

  async updateSyncQueueItem(id: string, updates: Partial<SyncQueueItem>): Promise<void> {
    await db.syncQueue.update(id, updates);
  },

  async removeSyncQueueItem(id: string): Promise<void> {
    await db.syncQueue.delete(id);
  },

  // Session operations
  async getSession(userId: string): Promise<Session | undefined> {
    return db.sessions.where('userId').equals(userId).first();
  },

  async saveSession(session: Session): Promise<string> {
    return db.sessions.put(session);
  },

  async deleteSession(userId: string): Promise<void> {
    const session = await this.getSession(userId);
    if (session) {
      await db.sessions.delete(session.id);
    }
  },

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return db.users.get(id);
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.users.where('email').equals(email).first();
  },

  async saveUser(user: User): Promise<string> {
    return db.users.put(user);
  },

  // Avatar operations
  async getAvatar(userId: string): Promise<string | null> {
    const rec = await db.avatars.get(userId);
    return rec?.dataUrl ?? null;
  },

  async saveAvatar(userId: string, dataUrl: string): Promise<void> {
    await db.avatars.put({ userId, dataUrl });
    // Also persist on user record for convenience
    const user = await db.users.get(userId);
    if (user) await db.users.put({ ...user, avatar: dataUrl });
  },

  async removeAvatar(userId: string): Promise<void> {
    await db.avatars.delete(userId);
    const user = await db.users.get(userId);
    if (user) {
      const { avatar: _, ...rest } = user;
      await db.users.put(rest as User);
    }
  },

  // Activity log operations
  async recordActivity(userId: string): Promise<void> {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const id = `${userId}-${today}`;
    const existing = await db.activityLog.get(id);
    if (existing) {
      await db.activityLog.put({ ...existing, count: existing.count + 1 });
    } else {
      await db.activityLog.put({ id, userId, date: today, count: 1 });
    }
  },

  async getActivityLog(userId: string, days = 365): Promise<ActivityLog[]> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return db.activityLog
      .where('userId').equals(userId)
      .filter(a => a.date >= cutoffStr)
      .toArray();
  },

  // Clear all data (for logout/reset)
  async clearAll(): Promise<void> {
    await db.delete();
    await db.open();
  },

  // Get database statistics
  async getDBStats(): Promise<{
    courseCount: number;
    lessonCount: number;
    progressCount: number;
    syncQueueCount: number;
  }> {
    const courseCount = await db.courses.count();
    const lessonCount = await db.lessons.count();
    const progressCount = await db.progress.count();
    const syncQueueCount = await db.syncQueue.count();

    return {
      courseCount,
      lessonCount,
      progressCount,
      syncQueueCount,
    };
  },
};
