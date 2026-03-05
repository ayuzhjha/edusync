"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitQuizResult = exports.getUserProgress = exports.syncProgress = exports.getCourseDetails = exports.getAllCourses = void 0;
const Course_1 = __importDefault(require("../models/Course"));
const Progress_1 = __importDefault(require("../models/Progress"));
const QuizResult_1 = __importDefault(require("../models/QuizResult"));
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course_1.default.find().populate('instructor', 'name');
        res.send({ success: true, data: courses });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.getAllCourses = getAllCourses;
const getCourseDetails = async (req, res) => {
    try {
        const course = await Course_1.default.findById(req.params.id)
            .populate('instructor', 'name')
            .populate({
            path: 'modules',
            populate: {
                path: 'lessons',
            },
        });
        if (!course)
            return res.status(404).send({ success: false, error: 'Course not found' });
        res.send({ success: true, data: course });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.getCourseDetails = getCourseDetails;
const syncProgress = async (req, res) => {
    try {
        const { lessonId, courseId, status, watchedDuration } = req.body;
        const progress = await Progress_1.default.findOneAndUpdate({ userId: req.user._id, lessonId }, {
            status,
            watchedDuration,
            courseId,
            completedAt: status === 'completed' ? new Date() : undefined
        }, { upsert: true, new: true });
        res.send({ success: true, data: progress });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.syncProgress = syncProgress;
const getUserProgress = async (req, res) => {
    try {
        const progress = await Progress_1.default.find({ userId: req.user._id });
        res.send({ success: true, data: progress });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.getUserProgress = getUserProgress;
const submitQuizResult = async (req, res) => {
    try {
        const result = new QuizResult_1.default({
            ...req.body,
            userId: req.user._id,
        });
        await result.save();
        res.status(201).send({ success: true, data: result });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.submitQuizResult = submitQuizResult;
