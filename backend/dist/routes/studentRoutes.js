"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const studentController_1 = require("../controllers/studentController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/courses', studentController_1.getAllCourses);
router.get('/courses/:id', studentController_1.getCourseDetails);
// Protected routes
router.use(auth_1.auth);
router.post('/progress', studentController_1.syncProgress);
router.get('/progress', studentController_1.getUserProgress);
router.post('/quiz-results', studentController_1.submitQuizResult);
exports.default = router;
