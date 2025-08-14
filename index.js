import express from "express"
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
import paymentRoutes from "./routes/paymentRoutes.js"
import orderRoutes from "./routes/orderRoutes.js"
import cardRoutes from "./routes/cardRoutes.js"
import addressRoutes from "./routes/addressRoutes.js"
import categoryRoutes from "./routes/categoryRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import flashSaleRoutes from "./routes/flashSaleRoutes.js"
import { assignGuestId } from "./middlewares/assignGuestID.js";
import { dbConnectMiddleware } from "./middlewares/dbConnectMiddleware.js";
import cleanGuestData from "./cron/cleanGuestData.js";
import cleanupBillings from "./cron/cleanupBillings.js";
import extendOrRecycleFlashSales from "./cron/extendFlashSales.js";

dotenv.config();
const PORT = process.env.PORT || 8080
const app = express()

app.use(express.json());

app.use(cookieParser())

app.use(cors({
    origin: "https://exclusive-ecommerce-lac.vercel.app",
    credentials: true
}))

app.use(dbConnectMiddleware);

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

app.get("/api/cron/guestCleanup", async (req, res) => {
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).end('Unauthorized');
    }
    await cleanGuestData();
    res.status(200).json({ message: "Guest cleanup complete" });
});

app.get("/api/cron/billingCleanup", async (req, res) => {
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).end('Unauthorized');
    }
    await cleanupBillings();
    res.status(200).json({ message: "Billing cleanup complete" });
});

app.get("/api/cron/flashSale", async (req, res) => {
    if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).end('Unauthorized');
    }
    await extendOrRecycleFlashSales();
    res.status(200).json({ message: "Flash sale cron complete" });
});


app.get("/", (req, res) => {
    return res.send("Backend Is Running")
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})



