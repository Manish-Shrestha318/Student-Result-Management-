import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { getClassesController, createClassController, updateClassController, deleteClassController } from "../controllers/classController";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/", getClassesController);
router.post("/", createClassController);
router.put("/:id", updateClassController);
router.delete("/:id", deleteClassController);

export default router;
