import express from "express";
import userRoutes from "./modules/user/user.routes";
import useAuth from "./modules/auth/auth.routes";
import categoryRoutes from "./modules/category/category.routes";
import subcategoryRoutes from "./modules/subcategory/subcategory.routes";
import productRoutes from "./modules/product/product.routes";

export const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", useAuth);
router.use("/categories", categoryRoutes);
router.use("/subcategories", subcategoryRoutes);
router.use("/products", productRoutes);
