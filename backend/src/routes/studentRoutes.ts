import express from 'express';
import { getAllCourses, getCourseDetails, syncProgress, getUserProgress, submitQuizResult, getLessonDetails } from '../controllers/studentController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseDetails);
router.get('/lessons/:id', getLessonDetails);

// Protected routes
router.use(auth);
router.post('/progress', syncProgress);
router.get('/progress', getUserProgress);
router.post('/quiz-results', submitQuizResult);

export default router;
