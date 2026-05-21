import express from "express";
import { protect } from "../../middlewares/auth.middleware";
import { uploadImageController } from "./upload.controller";
import { upload } from "./upload.middleware";

const router = express.Router();

router.post("/", protect, upload.single("image"), uploadImageController);

export default router;
