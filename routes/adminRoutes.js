import e from "express"
import { getAdminDashboard } from "../controllers/adminController.js"

const router = e.Router()

router.get("/get-admin-dashboard", getAdminDashboard)

export default router