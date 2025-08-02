import e from "express";
import { processPayment } from "../controllers/paymentController.js";

const router = e.Router()
router.post("/process-payment",processPayment)

export default router