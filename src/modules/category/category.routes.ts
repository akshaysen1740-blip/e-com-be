import express from "express";
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  softDeleteCategoryController,
  updateCategoryController,
} from "./category.controller";
import { protect } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/", protect, createCategoryController);
router.get("/", protect, getAllCategoriesController);
router.get("/:id", protect, getCategoryByIdController);
router.put("/:id", protect, updateCategoryController);
router.delete("/:id", protect, softDeleteCategoryController);

export default router;
