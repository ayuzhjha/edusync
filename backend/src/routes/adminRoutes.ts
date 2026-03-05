import express from 'express';
import { createTeacher, getTeachers, deleteUser } from '../controllers/adminController';
import { auth, authorize } from '../middleware/auth';

const router = express.Router();

router.use(auth);
router.use(authorize('admin'));

router.post('/teachers', createTeacher);
router.get('/teachers', getTeachers);
router.delete('/users/:id', deleteUser);

export default router;
