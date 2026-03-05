"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const user = new User_1.default({ name, email, password, role });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'secret');
        res.status(201).send({ success: true, data: { user, token } });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'secret');
        res.send({ success: true, data: { user, token } });
    }
    catch (error) {
        res.status(400).send({ success: false, error: error.message });
    }
};
exports.login = login;
const logout = async (req, res) => {
    // Simple logout logic for now (stateless JWT)
    res.send({ success: true });
};
exports.logout = logout;
