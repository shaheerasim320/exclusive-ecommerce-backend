import e from "express";
import { getOrderByID, getPlacedOrders, getRecentOrders, getReturnedOrders, placeOrder, getCancelledOrders, cancelOrder, getAllOrders } from "../controllers/orderController.js";
import { verifyAccessToken, verifyAdmin } from "../middlewares/authMiddleware.js";
const router = e.Router()

router.post("/place-order", placeOrder)
router.get("/get-placed-orders", getPlacedOrders)
router.get("/get-recent-orders", getRecentOrders)
router.get("/get-order-by-id/:orderID", getOrderByID)
router.get("/get-returned-orders", getReturnedOrders)
router.get("/get-cancelled-orders", getCancelledOrders)
router.post("/cancel-order",cancelOrder)
router.get("/get-all-orders",verifyAccessToken,verifyAdmin,getAllOrders)

export default router