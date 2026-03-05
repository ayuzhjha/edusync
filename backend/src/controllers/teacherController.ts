import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Course from '../models/Course';
import Module from '../models/Module';
import Lesson from '../models/Lesson';

export const createCourse = async (req: AuthRequest, res: Response) => {
    try {
        const course = new Course({
            ...req.body,
            instructor: req.user._id,
        });
        await course.save();
        res.status(201).send({ success: true, data: course });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const getTeacherCourses = async (req: AuthRequest, res: Response) => {
    try {
        const courses = await Course.find({ instructor: req.user._id });
        res.send({ success: true, data: courses });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const createModule = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.body;
        const course = await Course.findOne({ _id: courseId, instructor: req.user._id });
        if (!course) return res.status(404).send({ success: false, error: 'Course not found or not authorized' });

        const module = new Module(req.body);
        await module.save();

        course.modules.push(module._id as any);
        await course.save();

        res.status(201).send({ success: true, data: module });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const createLesson = async (req: AuthRequest, res: Response) => {
    try {
        const { moduleId, courseId } = req.body;
        const module = await Module.findOne({ _id: moduleId, courseId });
        if (!module) return res.status(404).send({ success: false, error: 'Module not found' });

        const lesson = new Lesson(req.body);
        await lesson.save();

        module.lessons.push(lesson._id as any);
        await module.save();

        res.status(201).send({ success: true, data: lesson });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};
