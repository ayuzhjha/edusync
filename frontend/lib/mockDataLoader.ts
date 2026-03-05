import { db, dbUtils, type Course, type Lesson, type Quiz, type Module } from './db';

// Mock data structures
const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites.',
    thumbnail: '/course-1-thumb.png',
    instructor: 'Sarah Johnson',
    category: 'Web Development',
    level: 'beginner',
    duration: 1200,
    moduleCount: 5,
    lessonCount: 15,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'course-2',
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts including hooks, context, and performance optimization.',
    thumbnail: '/course-2-thumb.png',
    instructor: 'Mike Chen',
    category: 'Web Development',
    level: 'advanced',
    duration: 1500,
    moduleCount: 6,
    lessonCount: 18,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
  {
    id: 'course-3',
    title: 'Data Science Fundamentals',
    description: 'Get started with data analysis, visualization, and basic machine learning concepts.',
    thumbnail: '/course-3-thumb.png',
    instructor: 'Dr. Emily Rodriguez',
    category: 'Data Science',
    level: 'intermediate',
    duration: 1800,
    moduleCount: 7,
    lessonCount: 21,
    createdAt: 1704067200000,
    updatedAt: 1704067200000,
  },
];

const mockModules: Module[] = [
  {
    id: 'module-1-1',
    courseId: 'course-1',
    title: 'HTML Basics',
    description: 'Learn the fundamentals of HTML',
    order: 1,
    lessonCount: 3,
    createdAt: 1704067200000,
  },
  {
    id: 'module-1-2',
    courseId: 'course-1',
    title: 'CSS Styling',
    description: 'Master CSS for styling web pages',
    order: 2,
    lessonCount: 2,
    createdAt: 1704067200000,
  },
  {
    id: 'module-2-1',
    courseId: 'course-2',
    title: 'React Hooks',
    description: 'Deep dive into React hooks',
    order: 1,
    lessonCount: 2,
    createdAt: 1704067200000,
  },
  {
    id: 'module-3-1',
    courseId: 'course-3',
    title: 'Data Analysis Basics',
    description: 'Introduction to data analysis',
    order: 1,
    lessonCount: 2,
    createdAt: 1704067200000,
  },
];

const mockLessons: Lesson[] = [
  {
    id: 'lesson-1-1',
    courseId: 'course-1',
    moduleId: 'module-1-1',
    title: 'What is HTML?',
    description: 'Introduction to HTML markup language',
    type: 'video',
    duration: 15,
    contentUrl: '/storage/html.mp4',
    thumbnailUrl: '/lesson-thumb-1.png',
    order: 1,
    isDownloaded: false,
    createdAt: 1704067200000,
  },
  {
    id: 'lesson-1-2',
    courseId: 'course-1',
    moduleId: 'module-1-1',
    title: 'HTML Tags and Attributes',
    description: 'Learn common HTML tags and how to use them',
    type: 'video',
    duration: 20,
    thumbnailUrl: '/lesson-thumb-2.png',
    order: 2,
    isDownloaded: false,
    createdAt: 1704067200000,
  },
  {
    id: 'lesson-1-3',
    courseId: 'course-1',
    moduleId: 'module-1-1',
    title: 'HTML Basics Quiz',
    description: 'Test your knowledge of HTML basics',
    type: 'quiz',
    order: 3,
    isDownloaded: false,
    createdAt: 1704067200000,
  },
  {
    id: 'lesson-1-4',
    courseId: 'course-1',
    moduleId: 'module-1-2',
    title: 'CSS Selectors',
    description: 'Learn different CSS selectors and how to use them',
    type: 'video',
    duration: 25,
    thumbnailUrl: '/lesson-thumb-3.png',
    order: 1,
    isDownloaded: false,
    createdAt: 1704067200000,
  },
  {
    id: 'lesson-1-5',
    courseId: 'course-1',
    moduleId: 'module-1-2',
    title: 'CSS Box Model',
    description: 'Understanding the CSS box model',
    type: 'video',
    duration: 20,
    thumbnailUrl: '/lesson-thumb-4.png',
    order: 2,
    isDownloaded: false,
    createdAt: 1704067200000,
  },
  {
    id: 'lesson-2-1',
    courseId: 'course-2',
    moduleId: 'module-2-1',
    title: 'React Hooks Deep Dive',
    description: 'Understanding React hooks and their lifecycle',
    type: 'video',
    duration: 30,
    thumbnailUrl: '/lesson-thumb-5.png',
    order: 1,
    isDownloaded: false,
    createdAt: 1704067200000,
  },
  {
    id: 'lesson-2-2',
    courseId: 'course-2',
    moduleId: 'module-2-1',
    title: 'Custom Hooks Pattern',
    description: 'Creating and using custom React hooks',
    type: 'video',
    duration: 28,
    thumbnailUrl: '/lesson-thumb-6.png',
    order: 2,
    isDownloaded: false,
    createdAt: 1704067200000,
  },
  {
    id: 'lesson-3-1',
    courseId: 'course-3',
    moduleId: 'module-3-1',
    title: 'Data Analysis with Python',
    description: 'Using pandas and numpy for data analysis',
    type: 'video',
    duration: 35,
    thumbnailUrl: '/lesson-thumb-7.png',
    order: 1,
    isDownloaded: false,
    createdAt: 1704067200000,
  },
  {
    id: 'lesson-3-2',
    courseId: 'course-3',
    moduleId: 'module-3-1',
    title: 'Data Analysis Notes',
    description: 'Complete notes on data analysis techniques',
    type: 'pdf',
    pageCount: 45,
    order: 2,
    isDownloaded: false,
    createdAt: 1704067200000,
  },
];

const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-1-3',
    courseId: 'course-1',
    lessonId: 'lesson-1-3',
    title: 'HTML Basics Quiz',
    description: 'Test your knowledge of HTML basics',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        text: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlinks and Text Markup Language',
        ],
        correctAnswer: 0,
        explanation: 'HTML stands for HyperText Markup Language, the standard markup language for creating web pages.',
      },
      // ... same as before
    ],
    createdAt: 1704067200000,
  },
  // ... other quizzes
];

export async function loadMockData() {
  try {
    // 1. Always update existing lessons if they miss contentUrl
    // AND repair lessons whose courseId/moduleId were overwritten by MongoDB ObjectIds
    for (const lesson of mockLessons) {
      const existing = await db.lessons.get(lesson.id);
      if (existing) {
        let needsUpdate = false;

        if (!existing.contentUrl && lesson.contentUrl) {
          console.log(`[v0] Updating lesson ${lesson.id} with contentUrl`);
          existing.contentUrl = lesson.contentUrl;
          needsUpdate = true;
        }

        // Repair: backend API returns courseId/moduleId as MongoDB ObjectIds,
        // which breaks Dexie queries that use string IDs like "course-1"
        if (existing.courseId !== lesson.courseId) {
          console.log(`[v0] Repairing lesson ${lesson.id} courseId: ${existing.courseId} → ${lesson.courseId}`);
          existing.courseId = lesson.courseId;
          needsUpdate = true;
        }
        if (existing.moduleId !== lesson.moduleId) {
          console.log(`[v0] Repairing lesson ${lesson.id} moduleId: ${existing.moduleId} → ${lesson.moduleId}`);
          existing.moduleId = lesson.moduleId;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await dbUtils.saveLesson(existing);
        }
      }
    }

    // 2. Check if data already exists for courses
    const existingCourses = await db.courses.count();
    if (existingCourses > 0) {
      console.log('[v0] Mock data already loaded');

      // Reconcile courses that may have been overwritten by backend sync
      // Backend Course model doesn't have lessonCount, duration, moduleCount, level
      const allCourses = await dbUtils.getCourses();
      for (const course of allCourses) {
        let needsUpdate = false;
        const updates: Partial<Course> = {};

        if (!course.lessonCount || course.lessonCount === 0) {
          const lessons = await dbUtils.getLessons(course.id);
          if (lessons.length > 0) {
            updates.lessonCount = lessons.length;
            needsUpdate = true;
          } else {
            // Check if a mock course has the info
            const mock = mockCourses.find(m => m.id === course.id);
            if (mock) {
              updates.lessonCount = mock.lessonCount;
              needsUpdate = true;
            }
          }
        }

        if (!course.moduleCount || course.moduleCount === 0) {
          const modules = await dbUtils.getModules(course.id);
          if (modules.length > 0) {
            updates.moduleCount = modules.length;
            needsUpdate = true;
          } else {
            const mock = mockCourses.find(m => m.id === course.id);
            if (mock) {
              updates.moduleCount = mock.moduleCount;
              needsUpdate = true;
            }
          }
        }

        if (!course.duration || course.duration === 0) {
          const mock = mockCourses.find(m => m.id === course.id);
          if (mock) {
            updates.duration = mock.duration;
            needsUpdate = true;
          }
        }

        if (!course.level) {
          const mock = mockCourses.find(m => m.id === course.id);
          if (mock) {
            updates.level = mock.level;
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          console.log(`[v0] Reconciling course ${course.id} with missing fields`, updates);
          await dbUtils.saveCourse({ ...course, ...updates } as Course);
        }
      }

      return;
    }

    console.log('[v0] Loading initial mock data...');

    // Load courses
    await dbUtils.saveCourses(mockCourses);
    console.log('[v0] Loaded', mockCourses.length, 'courses');

    // Load modules
    for (const module of mockModules) {
      await dbUtils.saveModule(module);
    }
    console.log('[v0] Loaded', mockModules.length, 'modules');

    // Load lessons
    await dbUtils.saveLessons(mockLessons);
    console.log('[v0] Loaded', mockLessons.length, 'lessons');

    // Load quizzes
    for (const quiz of mockQuizzes) {
      await dbUtils.saveQuiz(quiz);
    }
    console.log('[v0] Loaded', mockQuizzes.length, 'quizzes');

    console.log('[v0] Mock data loaded successfully');
  } catch (error) {
    console.error('[v0] Error loading mock data:', error);
  }
}
