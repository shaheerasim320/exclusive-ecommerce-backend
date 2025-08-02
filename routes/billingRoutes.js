import e from "express";
import { createBillingRecord, fetchBillingDetailsByID, applyCoupon, getAppliedCoupon, deleteBillingRecordByID, setDefaultCard } from "../controllers/billingController.js";

const router = e.Router()

router.post("/create-billing-record", createBillingRecord)
router.get("/fetchBillingDetailsByID/:billingID", fetchBillingDetailsByID)
router.post("/apply-coupon", applyCoupon)
router.get("/get-applied-coupon/:billingID", getAppliedCoupon)
router.delete("/delete-billing-by-id/:id", deleteBillingRecordByID)
router.post("/set-default-card", setDefaultCard)

export default router