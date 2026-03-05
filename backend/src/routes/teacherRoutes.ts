import express from 'express';
import { createCourse, getTeacherCourses, createModule, createLesson } from '../controllers/teacherController';
import { auth, authorize } from '../middleware/auth';

const router = express.Router();

router.use(auth);
router.use(authorize('teacher', 'admin'));

router.post('/courses', createCourse);
router.get('/courses', getTeacherCourses);
router.post('/modules', createModule);
router.post('/lessons', createLesson);

export default router;
