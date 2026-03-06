import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import User from './models/User';
import Course from './models/Course';
import Module from './models/Module';
import Lesson from './models/Lesson';
import Quiz from './models/Quiz';

dotenv.config();

const loadMockData = (filename: string) => {
    const filePath = path.join(__dirname, '../../frontend/mock', filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`[v0] Warning: Mock file not found: ${filename}`);
        return [];
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || '');
        console.log('Connected to MongoDB for advanced seeding...');

        const teacher = await User.findOne({ email: 'teacher@example.com' });
        if (!teacher) {
            console.error('Teacher account not found. Please run initial seed first.');
            process.exit(1);
        }

        const mockCourses = loadMockData('courses.json');
        const mockLessons = loadMockData('lessons.json');
        const mockQuizzes = loadMockData('quizzes.json');

        console.log('Clearing existing data...');
        await Course.deleteMany({});
        await Module.deleteMany({});
        await Lesson.deleteMany({});
        await Quiz.deleteMany({});

        for (const c of mockCourses) {
            const course = new Course({
                id: c.id, // Legacy ID
                title: c.title,
                description: c.description,
                instructor: teacher._id,
                category: c.category,
                level: c.level,
                thumbnail: c.thumbnail,
                modules: []
            });

            const courseLessons = mockLessons.filter((l: any) => l.courseId === c.id);
            const moduleIds = [...new Set(courseLessons.map((l: any) => l.moduleId))];

            for (const mId of moduleIds) {
                const moduleIdStr = mId as string;
                // Derive module name from ID if not found
                let moduleTitle = 'Introduction';
                if (moduleIdStr.includes('-1')) moduleTitle = 'Getting Started';
                if (moduleIdStr.includes('-2')) moduleTitle = 'Advanced Concepts';

                const module = new Module({
                    title: moduleTitle,
                    courseId: course._id,
                    order: parseInt(moduleIdStr.split('-').pop() || '0'),
                    lessons: []
                });

                const moduleLessons = courseLessons.filter((l: any) => l.moduleId === mId);
                for (const l of moduleLessons) {
                    let contentUrl = '/placeholder.mp4'; // Fallback

                    if (l.type === 'video') {
                        contentUrl = '/storage/html.mp4';
                    } else if (l.type === 'quiz') {
                        contentUrl = `/quiz/${l.id}`; // Logical URL for quiz
                    } else if (l.type === 'pdf') {
                        contentUrl = '/placeholder.pdf';
                    }

                    const lesson = new Lesson({
                        id: l.id, // Legacy ID
                        title: l.title,
                        description: l.description,
                        type: l.type,
                        moduleId: module._id,
                        courseId: course._id,
                        order: l.order,
                        duration: l.duration || 0,
                        contentUrl: contentUrl
                    });
                    await lesson.save();
                    module.lessons.push(lesson._id as any);

                    // If it's a quiz, seed the questions
                    if (l.type === 'quiz') {
                        const quizData = mockQuizzes.find((q: any) => q.lessonId === l.id);
                        if (quizData) {
                            const quiz = new Quiz({
                                courseId: course._id,
                                lessonId: lesson._id,
                                title: quizData.title,
                                description: quizData.description,
                                passingScore: quizData.passingScore,
                                questions: quizData.questions
                            });
                            await quiz.save();
                        }
                    }
                }
                await module.save();
                course.modules.push(module._id as any);
            }
            await course.save();
            console.log(`Migrated course: ${course.title} with ID: ${course.id}`);
        }

        console.log('Advanced seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDatabase();
