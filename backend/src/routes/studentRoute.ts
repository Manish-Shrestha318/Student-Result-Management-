import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { 
  getStudentsController, 
  getStudentController, 
  createStudentController, 
  updateStudentController, 
  deleteStudentController 
} from "../controllers/studentController";

const router = express.Router();

router.use(protect); // Only users can access student records
router.use(authorizeRoles("admin", "teacher")); // Only admin/teacher can manage records

router.get("/", getStudentsController);           // Get all students
router.get("/:id", getStudentController);         // Get single student
router.post("/", createStudentController);         // Create student
router.put("/:id", updateStudentController);      // Update student
router.delete("/:id", deleteStudentController);   // Delete student

export default router;
