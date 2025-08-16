import express from "express"
import { removeFromWishlist, getWishlistItems, addToWishlist, mergeWishlist, getGuestWishlistItems, discardGuestWishlist } from "../controllers/wishlistController.js"
import { verifyAccessToken, verifyAccessTokenOptional } from "../middlewares/authMiddleware.js"

const router = express.Router()

router.post("/add", verifyAccessTokenOptional, addToWishlist)
router.get("/get-wishlist-items", verifyAccessTokenOptional, getWishlistItems)
router.delete("/remove", verifyAccessTokenOptional, removeFromWishlist)
router.get("/get-guest-wishlist-items", verifyAccessTokenOptional, getGuestWishlistItems);
router.post("/merge-wishlist", verifyAccessToken, mergeWishlist);
router.delete("/delete", verifyAccessToken, discardGuestWishlist);

export default router