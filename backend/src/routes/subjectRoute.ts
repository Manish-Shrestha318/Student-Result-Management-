import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { getSubjectsController, createSubjectController, updateSubjectController, deleteSubjectController } from "../controllers/subjectController";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/", getSubjectsController);
router.post("/", createSubjectController);
router.put("/:id", updateSubjectController);
router.delete("/:id", deleteSubjectController);

export default router;
