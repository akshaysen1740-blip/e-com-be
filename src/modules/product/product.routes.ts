import express from "express";
import { protect } from "../../middlewares/auth.middleware";
import {
  createProductController,
  getProductByIdController,
  getProductsController,
  softDeleteProductController,
  updateProductController,
} from "./product.controller";

const router = express.Router();

router.post("/", protect, createProductController);
router.get("/", protect, getProductsController);
router.get("/:id", protect, getProductByIdController);
router.put("/:id", protect, updateProductController);
router.delete("/:id", protect, softDeleteProductController);

export default router;
