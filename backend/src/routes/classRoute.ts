import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { getClassesController, createClassController, updateClassController, deleteClassController } from "../controllers/classController";

const router = express.Router();

router.use(protect);

router.get("/", authorizeRoles("admin", "teacher"), getClassesController);
router.post("/", authorizeRoles("admin"), createClassController);
router.put("/:id", authorizeRoles("admin"), updateClassController);
router.delete("/:id", authorizeRoles("admin"), deleteClassController);

export default router;
