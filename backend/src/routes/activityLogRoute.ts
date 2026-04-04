import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware";
import { getActivitiesController } from "../controllers/activityLogController";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/", getActivitiesController);

export default router;
