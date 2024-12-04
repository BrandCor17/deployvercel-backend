import express from 'express';
import { createCourse, getCourses, enrollInCourse, getUserCourses, deleteCourse, assignInstructorToCourse , getInstructorCoursesAsStudent, assignCatedratico, getCourseById, leaveCourse, addSection} from '../controllers/course.controller.js';
import authMiddleware from '../middleware/auth.middleware.js'; 

const router = express.Router();

router.post('/create', authMiddleware, createCourse);

router.post('/enroll/:courseId',authMiddleware, enrollInCourse);
router.post('/assignToInstructor', authMiddleware, assignInstructorToCourse )
router.patch('/assignCatedratico/:catedraticoId', authMiddleware, assignCatedratico);

router.get('/courses', getCourses);
router.get('/courses/:id', getCourseById);

router.get('/user-courses', authMiddleware, getUserCourses); 
router.get('/InstructorCoursesAsStudent', authMiddleware, getInstructorCoursesAsStudent);
router.delete("/delete/:courseId", authMiddleware, deleteCourse);

router.patch("/assign-instructor/:instructorId", authMiddleware, assignInstructorToCourse);
router.delete('/remove-user/:courseId', authMiddleware, leaveCourse);
router.post("/:courseId/sections", addSection);

export default router;
