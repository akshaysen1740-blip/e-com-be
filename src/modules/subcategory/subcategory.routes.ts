import express from "express";
import { protect } from "../../middlewares/auth.middleware";
import {
  createSubcategoryController,
  getSubcategoriesController,
  getSubcategoryByIdController,
  softDeleteSubcategoryController,
  updateSubcategoryController,
} from "./subcategory.controller";

const router = express.Router();

router.post("/", protect, createSubcategoryController);
router.get("/", protect, getSubcategoriesController);
router.get("/:id", protect, getSubcategoryByIdController);
router.put("/:id", protect, updateSubcategoryController);
router.delete("/:id", protect, softDeleteSubcategoryController);

export default router;
