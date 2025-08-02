import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import couponRoutes from "./routes/couponRoutes.js"
import wishlistRoutes from "./routes/wishlistRoutes.js"
import imageRoutes from "./routes/imageRoutes.js";
import { verifyAccessToken, verifyAdmin } from "./middlewares/authMiddleware.js"
import billingRoutes from "./routes/billingRoutes.js"
import { cleanupExpiredBillings } from "./utils/billingCleanup.js";
import paymentRoutes from "./routes/paymentRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import cardRoutes from "./routes/cardRoutes.js"
import addressRoutes from "./routes/addressRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import flashSaleRoutes from "./routes/flashSaleRoutes.js"
import { assignGuestId } from "./middlewares/assignGuestID.js";
import cron from "node-cron"
import cleanGuestData from "./cron/cleanGuestData.js";
import cleanupBillings from "./cron/cleanupBillings.js";
import serverless from "serverless-http"
import extendOrRecycleFlashSales from "./cron/extendFlashSales.js";

dotenv.config();
const PORT = process.env.PORT || 8080
const app = express()

app.use(express.json());

app.use(cookieParser())

app.use(cors({
    origin: true,
    credentials: true
}))

// app.get("/api/cron/guest-cleanup", async (req, res) => {
//     try {
//         await cleanGuestData();
//         res.status(200).json({ message: "Guest data cleanup complete" });
//     } catch (error) {
//         console.error("Guest cleanup error:", error);
//         res.status(500).json({ error: "Guest cleanup failed" });
//     }
// });

// app.get("/api/cron/billing-cleanup", async (req, res) => {
//     try {
//         await cleanupBillings();
//         res.status(200).json({ message: "Billing cleanup complete" });
//     } catch (error) {
//         console.error("Billing cleanup error:", error);
//         res.status(500).json({ error: "Billing cleanup failed" });
//     }
// });

// app.get("/api/cron/extend-flash-sales", async (req, res) => {
//     try {
//         await extendOrRecycleFlashSales();
//         res.status(200).json({ message: "Extend flash sales cron job complete" });
//     } catch (error) {
//         console.error("Flash sales extension error:", error);
//         res.status(500).json({ error: "Flash sales extension failed" });

//     }
// });

mongoose.connect(process.env.MONGODB_URI, { dbName: "exclusive-ecommerce" })
    .then(conn => console.log(`MongoDB Connected With Server: ${conn.connection.host}`))
    .catch(err => console.log(`Error Occured: ${err}`))

app.use("/api/v1/products", productRoutes)

app.use("/api/v1/users", userRoutes)

app.use("/api/v1/cart", assignGuestId, cartRoutes)

app.use("/api/v1/coupons", couponRoutes)

app.use("/api/v1/wishlist", assignGuestId, wishlistRoutes)

app.use("/api/v1/image", imageRoutes);

app.use("/api/v1/billing", verifyAccessToken, billingRoutes)

app.use("/api/v1/payment", verifyAccessToken, paymentRoutes)

app.use("/api/v1/orders", verifyAccessToken, orderRoutes)

app.use("/api/v1/card", verifyAccessToken, cardRoutes)

app.use("/api/v1/address", verifyAccessToken, addressRoutes)

app.use("/api/v1/category", categoryRoutes)

app.use("/api/v1/admin", verifyAccessToken, verifyAdmin, adminRoutes)

app.use("/api/v1/flashSale", flashSaleRoutes)

app.get("/", (req, res) => {
    return res.send("Backend Is Running")
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})



