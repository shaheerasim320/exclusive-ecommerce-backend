import express from "express"
import { moveAllItemsToCart, removeFromWishlist, addToCart, getWishlistItems, addToWishlist, mergeWishlist, getGuestWishlistItems, discardGuestWishlist } from "../controllers/wishlistController.js"
import { verifyAccessToken, verifyAccessTokenOptional } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.post("/add", verifyAccessTokenOptional, addToWishlist)
router.post("/move-all-items-to-cart", verifyAccessTokenOptional, moveAllItemsToCart)
router.get("/get-wishlist-items", verifyAccessTokenOptional, getWishlistItems)
router.delete("/remove", verifyAccessTokenOptional, removeFromWishlist)
router.post("/add-to-cart", verifyAccessTokenOptional, addToCart)
router.get("/get-guest-wishlist-items", verifyAccessTokenOptional, getGuestWishlistItems);
router.post("/merge-wishlist", verifyAccessToken, mergeWishlist);
router.delete("/delete", verifyAccessToken, discardGuestWishlist);

export default router