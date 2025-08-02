import e from "express"
import { getAddressByID, getDefaultBillingAddress, getDefaultShippingAddress, getUserAddresses, saveAddress, setDefaultBillingAddress, setDefaultShippingAddress, updateAddress } from "../controllers/addressController.js"
const router = e.Router()

router.post("/save-address",saveAddress)
router.post("/set-default-shipping-address",setDefaultShippingAddress)
router.post("/set-default-billing-address",setDefaultBillingAddress)
router.get("/get-default-shipping-address",getDefaultShippingAddress)
router.get("/get-default-billing-address",getDefaultBillingAddress)
router.get("/get-user-addresses",getUserAddresses)
router.put("/update-address",updateAddress)
router.get("/get-address-by-id/:addressID",getAddressByID)


export default router