import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { getSubjectsController, createSubjectController, updateSubjectController, deleteSubjectController } from "../controllers/subjectController";

const router = express.Router();

router.use(protect);

router.get("/", authorizeRoles("admin", "teacher"), getSubjectsController);
router.post("/", authorizeRoles("admin"), createSubjectController);
router.put("/:id", authorizeRoles("admin"), updateSubjectController);
router.delete("/:id", authorizeRoles("admin"), deleteSubjectController);

export default router;
