import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;
        const user = new User({ name, email, password, role });
        await user.save();

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'secret');
        res.status(201).send({ success: true, data: { user, token } });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).send({ error: 'Login failed! Check authentication credentials' });
        }

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET || 'secret');
        res.send({ success: true, data: { user, token } });
    } catch (error: any) {
        res.status(400).send({ success: false, error: error.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    // Simple logout logic for now (stateless JWT)
    res.send({ success: true });
};
