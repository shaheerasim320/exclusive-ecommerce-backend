import e from "express"
import { createSetupIntent, getCardByID, getDefaultCard, getSavedCards, removeCard, saveCard, setDefaultCard } from "../controllers/cardController.js"
const router = e.Router()

router.get("/get-default-card",getDefaultCard)
router.get("/get-saved-cards",getSavedCards)
router.post("/save-card",saveCard)
router.delete("/remove-card",removeCard)
router.post("/set-default-card",setDefaultCard)
router.post("/create-setup-intent",createSetupIntent)
router.get("/get-card-by-id/:cardID",getCardByID)

export default router