import { Request, Response } from 'express';
import User from '../models/User';

export const createTeacher = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const user = new User({ name, email, password, role: 'teacher' });
        await user.save();
        res.status(201).send({ success: true, data: user });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const getTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await User.find({ role: 'teacher' });
        res.send({ success: true, data: teachers });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).send({ success: false, error: 'User not found' });
        res.send({ success: true, data: user });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};
