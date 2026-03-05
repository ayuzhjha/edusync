"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLesson = exports.createModule = exports.getTeacherCourses = exports.createCourse = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Module_1 = __importDefault(require("../models/Module"));
const Lesson_1 = __importDefault(require("../models/Lesson"));
const createCourse = async (req, res) => {
    try {
        const course = new Course_1.default({
            ...req.body,
            instructor: req.user._id,
        });
        await course.save();
        res.status(201).send({ success: true, data: course });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.createCourse = createCourse;
const getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course_1.default.find({ instructor: req.user._id });
        res.send({ success: true, data: courses });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.getTeacherCourses = getTeacherCourses;
const createModule = async (req, res) => {
    try {
        const { courseId } = req.body;
        const course = await Course_1.default.findOne({ _id: courseId, instructor: req.user._id });
        if (!course)
            return res.status(404).send({ success: false, error: 'Course not found or not authorized' });
        const module = new Module_1.default(req.body);
        await module.save();
        course.modules.push(module._id);
        await course.save();
        res.status(201).send({ success: true, data: module });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.createModule = createModule;
const createLesson = async (req, res) => {
    try {
        const { moduleId, courseId } = req.body;
        const module = await Module_1.default.findOne({ _id: moduleId, courseId });
        if (!module)
            return res.status(404).send({ success: false, error: 'Module not found' });
        const lesson = new Lesson_1.default(req.body);
        await lesson.save();
        module.lessons.push(lesson._id);
        await module.save();
        res.status(201).send({ success: true, data: lesson });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.createLesson = createLesson;
