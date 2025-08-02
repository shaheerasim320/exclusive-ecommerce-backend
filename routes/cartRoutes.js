import express from "express"
import { applyCoupon, getCartItemByProductID, getAppliedCoupon, removeCoupon, addToCart, getCartItems, removeFromCart, updateProductQuantity, getGuestCartItems, mergeCart, discardGuestCart } from "../controllers/cartController.js"
import { verifyAccessToken, verifyAccessTokenOptional } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.post("/add", verifyAccessTokenOptional, addToCart)
router.get("/get-cart-items", verifyAccessTokenOptional, getCartItems)
router.post("/update-product-quantity", verifyAccessTokenOptional, updateProductQuantity)
router.post("/apply-coupon", verifyAccessTokenOptional, applyCoupon)
router.get("/cartItem", verifyAccessTokenOptional, getCartItemByProductID)
router.delete("/remove", verifyAccessTokenOptional, removeFromCart);
router.get("/get-applied-coupon", verifyAccessTokenOptional, getAppliedCoupon)
router.delete("/remove-coupon", verifyAccessTokenOptional, removeCoupon)
router.get("/get-guest-cart-items", verifyAccessTokenOptional, getGuestCartItems);
router.post("/merge-cart", verifyAccessToken, mergeCart);
router.delete("/guest", verifyAccessToken, discardGuestCart)


export default router