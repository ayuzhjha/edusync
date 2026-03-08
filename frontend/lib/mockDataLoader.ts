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
{
  id: 'course-4',
  title: 'Mobile App Dev with React Native',
  description: 'Build cross-platform mobile apps using React Native and Expo.',
  instructor: 'Alex Rivera',
  category: 'Mobile Development',
  level: 'intermediate',
  duration: 1600,
  moduleCount: 4,
  lessonCount: 12,
  createdAt: 1704067200000,
  updatedAt: 1704067200000,
},
];

const mockModules: Module[] = [
  // Course 1: Web Dev (4 Modules)
  { id: 'module-1-1', courseId: 'course-1', title: 'HTML Basics', order: 1, lessonCount: 3, createdAt: 1704067200000 },
  { id: 'module-1-2', courseId: 'course-1', title: 'CSS Styling', order: 2, lessonCount: 2, createdAt: 1704067200000 },
  { id: 'module-1-3', courseId: 'course-1', title: 'JavaScript Essentials', order: 3, lessonCount: 2, createdAt: 1704067200000 },
  { id: 'module-1-4', courseId: 'course-1', title: 'Final Assessment', order: 4, lessonCount: 1, createdAt: 1704067200000 },

  // Course 2: Advanced React (3 Modules)
  { id: 'module-2-1', courseId: 'course-2', title: 'React Hooks', order: 1, lessonCount: 2, createdAt: 1704067200000 },
  { id: 'module-2-2', courseId: 'course-2', title: 'Performance Optimization', order: 2, lessonCount: 2, createdAt: 1704067200000 },
  { id: 'module-2-3', courseId: 'course-2', title: 'Advanced Patterns Quiz', order: 3, lessonCount: 1, createdAt: 1704067200000 },

  // Course 3: Data Science (3 Modules)
  { id: 'module-3-1', courseId: 'course-3', title: 'Data Analysis Basics', order: 1, lessonCount: 2, createdAt: 1704067200000 },
  { id: 'module-3-2', courseId: 'course-3', title: 'Visualization Techniques', order: 2, lessonCount: 2, createdAt: 1704067200000 },
  { id: 'module-3-3', courseId: 'course-3', title: 'Machine Learning Intro', order: 3, lessonCount: 1, createdAt: 1704067200000 },

  // Course 4: Mobile App Dev (3 Modules)
  { id: 'module-4-1', courseId: 'course-4', title: 'React Native Setup', order: 1, lessonCount: 2, createdAt: 1704067200000 },
  { id: 'module-4-2', courseId: 'course-4', title: 'Native Components', order: 2, lessonCount: 2, createdAt: 1704067200000 },
  { id: 'module-4-3', courseId: 'course-4', title: 'Final Quiz', order: 3, lessonCount: 1, createdAt: 1704067200000 },
];

const mockLessons: Lesson[] = [
  // --- COURSE 1: Web Development ---
  { id: 'lesson-1-1', courseId: 'course-1', moduleId: 'module-1-1', title: 'What is HTML?', type: 'video', duration: 15, contentUrl: '/storage/html.mp4', order: 1, isDownloaded: false, createdAt: 1704067200000 },
  { id: 'lesson-1-2', courseId: 'course-1', moduleId: 'module-1-1', title: 'HTML Tags', type: 'video', duration: 20, contentUrl: '/storage/html.mp4', order: 2, isDownloaded: false, createdAt: 1704067200000 },
  { id: 'lesson-1-3', courseId: 'course-1', moduleId: 'module-1-2', title: 'CSS Selectors', type: 'video', duration: 25, contentUrl: '/storage/CSS_tut.mp4', order: 1, isDownloaded: false, createdAt: 1704067200000 },
  { id: 'lesson-1-quiz', courseId: 'course-1', moduleId: 'module-1-4', title: 'Web Dev Final Quiz', type: 'quiz', order: 1, isDownloaded: false, createdAt: 1704067200000 },

  // --- COURSE 2: Advanced React ---
  { id: 'lesson-2-1', courseId: 'course-2', moduleId: 'module-2-1', title: 'Hooks Deep Dive', type: 'video', duration: 30, contentUrl: '/storage/hook_tut.mp4', order: 1, isDownloaded: false, createdAt: 1704067200000 },
  { id: 'lesson-2-2', courseId: 'course-2', moduleId: 'module-2-1', title: 'Custom Hooks', type: 'video', duration: 28, contentUrl: '/storage/custom_hooks_tut.mp4', order: 2, isDownloaded: false, createdAt: 1704067200000 },
  { id: 'lesson-2-quiz', courseId: 'course-2', moduleId: 'module-2-3', title: 'React Patterns Quiz', type: 'quiz', order: 1, isDownloaded: false, createdAt: 1704067200000 },

  // --- COURSE 3: Data Science ---
  { id: 'lesson-3-1', courseId: 'course-3', moduleId: 'module-3-1', title: 'Python for DS', type: 'video', duration: 35, contentUrl: '/storage/python_ds_tut.mp4', order: 1, isDownloaded: false, createdAt: 1704067200000 },
  { id: 'lesson-3-2', courseId: 'course-3', moduleId: 'module-3-1', title: 'Pandas Basics', type: 'pdf', pageCount: 45, order: 2, isDownloaded: false, createdAt: 1704067200000 },
  { id: 'lesson-3-quiz', courseId: 'course-3', moduleId: 'module-3-3', title: 'Data Science Quiz', type: 'quiz', order: 1, isDownloaded: false, createdAt: 1704067200000 },

  // --- COURSE 4: Mobile App Dev ---
  { id: 'lesson-4-1', courseId: 'course-4', moduleId: 'module-4-1', title: 'Expo Setup', type: 'video', duration: 15, contentUrl: '/storage/mobile_app_dev.mp4', order: 1, isDownloaded: false, createdAt: 1704067200000 },
  { id: 'lesson-4-2', courseId: 'course-4', moduleId: 'module-4-1', title: 'RN Folder Structure', type: 'pdf', pageCount: 10, order: 2, isDownloaded: false, createdAt: 1704067200000 },
  { id: 'lesson-4-quiz', courseId: 'course-4', moduleId: 'module-4-3', title: 'Mobile Dev Quiz', type: 'quiz', order: 1, isDownloaded: false, createdAt: 1704067200000 },
];
const mockQuizzes: Quiz[] = [
  {
    id: 'quiz-web-dev',
    courseId: 'course-1',
    lessonId: 'lesson-1-quiz',
    title: 'Web Development Certification Quiz',
    passingScore: 70,
    questions: [
      { id: 'q1', text: 'What does HTML stand for?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language'], correctAnswer: 0 },
      { id: 'q2', text: 'Which CSS property controls text size?', options: ['font-style', 'text-size', 'font-size', 'text-style'], correctAnswer: 2 },
      { id: 'q3', text: 'What is the correct HTML for a line break?', options: ['<br>', '<lb>', '<break>', '<line>'], correctAnswer: 0 },
      { id: 'q4', text: 'Which JS keyword is used to declare a constant?', options: ['var', 'let', 'constant', 'const'], correctAnswer: 3 },
      { id: 'q5', text: 'How do you create a function in JavaScript?', options: ['function = myFunction()', 'function:myFunction()', 'function myFunction()', 'def myFunction()'], correctAnswer: 2 },
      { id: 'q6', text: 'Which HTML attribute is used for inline styles?', options: ['font', 'class', 'style', 'styles'], correctAnswer: 2 },
      { id: 'q7', text: 'Which character is used to indicate an end tag?', options: ['<', '/', '*', '^'], correctAnswer: 1 },
      { id: 'q8', text: 'How do you call a function named "myFunction"?', options: ['call myFunction()', 'myFunction()', 'call function myFunction()', 'execute myFunction()'], correctAnswer: 1 },
      {id: 'q9', 
      text: 'How can you add a comment in JS?', 
      options: ['// comment', '/* comment */', '# comment', 'Both A and B'], 
      correctAnswer: 3 
      },
      { id: 'q10', text: 'Which event occurs when a user clicks on an HTML element?', options: ['onmouseclick', 'onchange', 'onclick', 'onmouseover'], correctAnswer: 2 },
    ],
    createdAt: Date.now()
  },
  {
  id: 'quiz-react',
  courseId: 'course-2',
  lessonId: 'lesson-2-quiz',
  title: 'Advanced React Patterns Quiz',
  passingScore: 70,
  questions: [
    { id: '2q1', text: 'What is the primary use of useMemo?', options: ['Side effects', 'Memoizing expensive calculations', 'DOM access', 'State management'], correctAnswer: 1 },
    { id: '2q2', text: 'Which hook is used to handle side effects in functional components?', options: ['useState', 'useContext', 'useEffect', 'useReducer'], correctAnswer: 2 },
    { id: '2q3', text: 'What does "Lifting State Up" mean?', options: ['Moving state to a child', 'Moving state to the closest common ancestor', 'Deleting state', 'Using Redux'], correctAnswer: 1 },
    { id: '2q4', text: 'How do you prevent a functional component from re-rendering if props haven\'t changed?', options: ['useMemo', 'React.memo()', 'shouldComponentUpdate', 'useCallback'], correctAnswer: 1 },
    { id: '2q5', text: 'What is the purpose of "Forwarding Refs"?', options: ['To pass refs to parent', 'To pass refs through a component to a child', 'To avoid using refs', 'To trigger re-renders'], correctAnswer: 1 },
    { id: '2q6', text: 'In useReducer, what is the "dispatch" function used for?', options: ['To fetch data', 'To send an action to the reducer', 'To reset the state', 'To connect to the DOM'], correctAnswer: 1 },
    { id: '2q7', text: 'What is a "Higher-Order Component"?', options: ['A component that returns a hook', 'A function that takes a component and returns a new component', 'The top-most component in the tree', 'A class component'], correctAnswer: 1 },
    { id: '2q8', text: 'Which hook should you use for a mutable value that doesn\'t trigger a re-render?', options: ['useState', 'useRef', 'useMemo', 'useReducer'], correctAnswer: 1 },
    { id: '2q9', text: 'What is "Prop Drilling"?', options: ['A way to optimize props', 'Passing data through many layers of components', 'Using TypeScript with props', 'Removing props'], correctAnswer: 1 },
    { id: '2q10', text: 'What does the "key" prop help React do?', options: ['Style elements', 'Identify which items have changed, been added, or removed', 'Access the database', 'Set the unique ID of a user'], correctAnswer: 1 }
  ],
  createdAt: Date.now()
},
{
  id: 'quiz-ds',
  courseId: 'course-3',
  lessonId: 'lesson-3-quiz',
  title: 'Data Science Fundamentals Quiz',
  passingScore: 70,
  questions: [
    { id: '3q1', text: 'Which library is used for data manipulation?', options: ['Django', 'Pandas', 'Matplotlib', 'Requests'], correctAnswer: 1 },
    { id: '3q2', text: 'What does CSV stand for?', options: ['Common System Values', 'Comma Separated Values', 'Computer Scientific Variable', 'Control Set View'], correctAnswer: 1 },
    { id: '3q3', text: 'In Machine Learning, what is "Supervised Learning"?', options: ['Learning without data', 'Learning from labeled data', 'Learning from unlabelled data', 'A type of hardware'], correctAnswer: 1 },
    { id: '3q4', text: 'Which Python library is primarily used for visualization?', options: ['NumPy', 'Matplotlib', 'Keras', 'Flask'], correctAnswer: 1 },
    { id: '3q5', text: 'What is a "Dataframe"?', options: ['A 1D array', 'A 2D labeled data structure', 'A type of plot', 'A file format'], correctAnswer: 1 },
    { id: '3q6', text: 'What is the purpose of "Mean" in statistics?', options: ['The middle value', 'The most frequent value', 'The average value', 'The highest value'], correctAnswer: 2 },
    { id: '3q7', text: 'Which algorithm is commonly used for Classification?', options: ['Linear Regression', 'Logistic Regression', 'K-Means', 'Mean Shift'], correctAnswer: 1 },
    { id: '3q8', text: 'What is "Overfitting"?', options: ['A model that performs well on new data', 'A model that performs too well on training data but poorly on new data', 'Data that is too large', 'A fast algorithm'], correctAnswer: 1 },
    { id: '3q9', text: 'What does SQL stand for?', options: ['Structured Query Language', 'Standard Quality List', 'Simple Query Logic', 'Sequential Query Line'], correctAnswer: 0 },
    { id: '3q10', text: 'What is the main purpose of "Standardization"?', options: ['Scaling data to have a mean of 0 and SD of 1', 'Deleting data', 'Adding labels', 'Changing file formats'], correctAnswer: 0 }
  ],
  createdAt: Date.now()
},
{
  id: 'quiz-rn',
  courseId: 'course-4',
  lessonId: 'lesson-4-quiz',
  title: 'Mobile App Dev Quiz',
  passingScore: 70,
  questions: [
    { id: '4q1', text: 'Which component is equivalent to <div>?', options: ['<Text>', '<View>', '<Image>', '<Div>'], correctAnswer: 1 },
    { id: '4q2', text: 'Which command is used to start a new React Native project?', options: ['npm start', 'npx react-native init', 'git init', 'expo update'], correctAnswer: 1 },
    { id: '4q3', text: 'How do you handle user text input in React Native?', options: ['<Input>', '<TextInput>', '<Form>', '<Text>'], correctAnswer: 1 },
    { id: '4q4', text: 'Which layout system does React Native use?', options: ['Grid', 'Flexbox', 'Block', 'Inline'], correctAnswer: 1 },
    { id: '4q5', text: 'How do you add styles in React Native?', options: ['CSS files', 'StyleSheet.create()', 'Sass', 'Inline HTML tags'], correctAnswer: 1 },
    { id: '4q6', text: 'What is the purpose of "AsyncStorage"?', options: ['To speed up the app', 'To store small amounts of data locally', 'To fetch APIs', 'To style components'], correctAnswer: 1 },
    { id: '4q7', text: 'Which component is used to display a scrolling list of items?', options: ['<ScrollView>', '<FlatList>', 'Both A and B', '<ListView>'], correctAnswer: 2 },
    { id: '4q8', text: 'What is the default Flex direction in React Native?', options: ['Row', 'Column', 'Center', 'Stretch'], correctAnswer: 1 },
    { id: '4q9', text: 'How do you navigate between screens in React Native?', options: ['React Navigation', 'Standard HTML <a> tags', 'Window.location', 'Native Linker'], correctAnswer: 0 },
    { id: '4q10', text: 'What is the "Platform" module used for?', options: ['To detect the OS (iOS/Android)', 'To publish the app', 'To style the background', 'To connect to the database'], correctAnswer: 0 }
  ],
  createdAt: Date.now()
}
];

export async function loadMockData() {
  try {
    // 1. Always update existing lessons if they miss contentUrl
    // AND repair lessons whose courseId/moduleId were overwritten by MongoDB ObjectIds
    for (const lesson of mockLessons) {
      const existing = await db.lessons.get(lesson.id);
      if (existing) {
        let needsUpdate = false;

        // Repair: replace all video lesson URLs with the local storage one
        if (existing.type === 'video' && existing.contentUrl !== '/storage/html.mp4') {
          console.log(`[v0] Repairing lesson ${lesson.id} contentUrl to /storage/html.mp4`);
          existing.contentUrl = '/storage/html.mp4';
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
