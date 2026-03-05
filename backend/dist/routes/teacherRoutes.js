"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teacherController_1 = require("../controllers/teacherController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.auth);
router.use((0, auth_1.authorize)('teacher', 'admin'));
router.post('/courses', teacherController_1.createCourse);
router.get('/courses', teacherController_1.getTeacherCourses);
router.post('/modules', teacherController_1.createModule);
router.post('/lessons', teacherController_1.createLesson);
exports.default = router;
