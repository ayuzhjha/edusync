"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getTeachers = exports.createTeacher = void 0;
const User_1 = __importDefault(require("../models/User"));
const createTeacher = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = new User_1.default({ name, email, password, role: 'teacher' });
        await user.save();
        res.status(201).send({ success: true, data: user });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.createTeacher = createTeacher;
const getTeachers = async (req, res) => {
    try {
        const teachers = await User_1.default.find({ role: 'teacher' });
        res.send({ success: true, data: teachers });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.getTeachers = getTeachers;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user)
            return res.status(404).send({ success: false, error: 'User not found' });
        res.send({ success: true, data: user });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.deleteUser = deleteUser;
