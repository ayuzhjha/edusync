import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import Progress from '../models/Progress';
import QuizResult from '../models/QuizResult';

export const getAllCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.find().populate('instructor', 'name');
        res.send({ success: true, data: courses });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const getCourseDetails = async (req: Request, res: Response) => {
    try {
        const course = await Course.findOne({ id: req.params.id })
            .populate('instructor', 'name')
            .populate({
                path: 'modules',
                populate: {
                    path: 'lessons',
                },
            });
        if (!course) return res.status(404).send({ success: false, error: 'Course not found' });
        res.send({ success: true, data: course });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const syncProgress = async (req: AuthRequest, res: Response) => {
    try {
        const { lessonId, courseId, status, watchedDuration } = req.body;
        const progress = await Progress.findOneAndUpdate(
            { userId: req.user._id, lessonId },
            {
                status,
                watchedDuration,
                courseId,
                completedAt: status === 'completed' ? new Date() : undefined
            },
            { upsert: true, new: true }
        );
        res.send({ success: true, data: progress });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const getUserProgress = async (req: AuthRequest, res: Response) => {
    try {
        const progress = await Progress.find({ userId: req.user._id });
        res.send({ success: true, data: progress });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const submitQuizResult = async (req: AuthRequest, res: Response) => {
    try {
        const { score, totalQuestions, quizId } = req.body;

        // Calculate passed if not provided
        let passed = req.body.passed;
        if (passed === undefined) {
            // Default passing score is 70% if we can't find the quiz easily
            passed = score >= 70;
        }

        const result = new QuizResult({
            ...req.body,
            userId: req.user._id,
            passed
        });
        await result.save();
        res.status(201).send({ success: true, data: result });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const getLessonDetails = async (req: Request, res: Response) => {
    try {
        // Use findOne with the 'id' field to support custom string IDs from migration/mock
        const lesson = await Lesson.findOne({ id: req.params.id });
        if (!lesson) return res.status(404).send({ success: false, error: 'Lesson not found' });
        res.send({ success: true, data: lesson });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};
