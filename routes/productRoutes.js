import express from "express";
import {
  addProduct,
  getBestSellingProducts,
  getProductByProductCode,
  getProducts,
  updateProduct,
  deleteProduct,
  getAllProducts,
  searchProducts
} from "../controllers/productController.js";
import { verifyAccessToken, verifyAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/:productSlug/:productCode", getProductByProductCode);
router.get("/best-selling-products", getBestSellingProducts);
router.post("/", verifyAccessToken, verifyAdmin, addProduct);         // /v1/products/
router.get("/", getProducts);                                         // /v1/products/
router.put("/:id", verifyAccessToken, verifyAdmin, updateProduct);    // /v1/products/:id
router.get("/get-all", getAllProducts);                               // /v1/products/get-all
router.delete("/:productID", verifyAccessToken, verifyAdmin, deleteProduct);
router.get("/search", searchProducts);                                // /v1/products/search

export default router;
