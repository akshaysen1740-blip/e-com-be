import express from "express";
import { getCurrentUser, login, logout, refreshToken } from "./auth.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/login", login);
router.post("/refresh", refreshToken);
router.post("/logout",protect, logout);
router.get("/me", protect, getCurrentUser);

export default router;
