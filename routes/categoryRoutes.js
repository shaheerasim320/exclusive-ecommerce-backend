import e from "express"
import { addCategory, deleteCategory, getCategoryNameBySlug, getCategoryByID, getDropDownMainCategories, getMainCategories,  getSubCategories, updateCategory, getHirearcialDropDownCategories, getCategoryProducts } from "../controllers/categoryController.js"
import { verifyAccessToken, verifyAdmin } from "../middlewares/authMiddleware.js"

const router = e.Router()

router.post("/add-category", verifyAccessToken, verifyAdmin, addCategory)
router.post("/update-category", verifyAccessToken, verifyAdmin, updateCategory)
router.get("/get-main-categories", getMainCategories)
router.get("/get-sub-categories", getSubCategories)
router.get("/get-drop-down-main-categories", getDropDownMainCategories)
router.get("/get-category-by-id/:categoryID", verifyAccessToken, verifyAdmin, getCategoryByID)
router.delete("/delete-category/:categoryID", verifyAccessToken, verifyAdmin, deleteCategory)
router.get("/get-hirearcial-dropdown-categories", getHirearcialDropDownCategories)
router.get("/get-category-name-by-slug/:slug", getCategoryNameBySlug)
router.get("/get-category-products/:categoryID",getCategoryProducts)


export default router