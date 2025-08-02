import express from "express"
import { addCoupon, updateCoupon, getCouponByID } from "../controllers/couponController.js"

const router = express.Router()

router.post("/coupon",addCoupon)
router.post("/coupon/:id",updateCoupon)
router.get("/coupon/:id",getCouponByID)

export default router