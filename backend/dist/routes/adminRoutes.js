"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.use(auth_1.auth);
router.use((0, auth_1.authorize)('admin'));
router.post('/teachers', adminController_1.createTeacher);
router.get('/teachers', adminController_1.getTeachers);
router.delete('/users/:id', adminController_1.deleteUser);
exports.default = router;
