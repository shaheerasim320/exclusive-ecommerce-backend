import express from "express";
import { registerUser, verifyUser, resendToken, login, logout, refreshUser, updateProfile, getAllCustomers, addCustomer, setPassword, refreshAccessToken, getUser, subscribeToNewsletter, resetPasswordEmail, resetPassword } from "../controllers/userController.js"
import { verifyAccessToken, verifyAdmin } from "../middlewares/authMiddleware.js";
import { googleCallback, googleLogin } from "../controllers/authGoogleController.js";

const router = express.Router()

router.post("/signup", registerUser)
router.post("/verify/:token", verifyUser)
router.post("/resend-token", resendToken)
router.post("/login", login)
router.post("/refresh-access-token", refreshAccessToken)
router.post("/logout", logout)
router.get("/refresh-user", refreshUser)
router.get("/get-all-customers", verifyAccessToken, verifyAdmin, getAllCustomers)
router.put("/update-profile", verifyAccessToken, updateProfile)
router.post("/add-customer", verifyAccessToken, verifyAdmin, addCustomer)
router.post("/set-password", setPassword)
router.get("/google", googleLogin)
router.get("/google/callback", googleCallback)
router.get("/get-user",verifyAccessToken,getUser)
router.post("/subscribe-newsletter", subscribeToNewsletter)
router.post("/password-reset",resetPasswordEmail)
router.post("/reset-password",resetPassword)


export default router