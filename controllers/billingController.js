import Billing from "../models/Billing.js";
import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { v4 as uuidv4 } from 'uuid';

const createBillingRecord = async (req, res) => {
    const userID = req.user.userId
    const { items, couponID } = req.body
    try {
        const coupon = couponID != null ? await Coupon.findById(couponID) : null
        const billing = new Billing({ user: userID, items: items, coupon: coupon != null ? coupon._id : coupon, publicId: uuidv4() })
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            })
        }
        await billing.save()

        res.status(201).json({
            message: "Billing record created successfully",
            billingId: billing.publicId
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const fetchBillingDetailsByID = async (req, res) => {

    const billingPublicID = req.params.billingID;
    const userID = req.user.userId;

    try {
        if (!billingPublicID) {
            return res.status(400).json({ message: "Billing ID is required." });
        }

        let billing = await Billing.findOne({ publicId: billingPublicID }).populate("items.product").populate("coupon");

        if (!billing) {
            return res.status(404).json({ message: "Requested billing resource not found." });
        }

        if (billing.user != userID) {
            return res.status(403).json({ message: "You do not have permission to access this billing resource." })
        }
        const enrichedItems = await Promise.all(
            billing.items.map(async (item) => {
                const enrichedProduct = await item.product.getWithFlashSale();
                return {
                    ...item.toObject(),
                    product: enrichedProduct,
                };
            })
        );
        const enrichedBilling = {
            ...billing.toObject(),   
            items: enrichedItems     
        };
        res.status(200).json(enrichedBilling);
    } catch (error) {
        console.error("Error fetching billing details:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};


const applyCoupon = async (req, res) => {
    const { billingID, couponCode } = req.body;
    try {
        const billing = await Billing.findOne({ publicId: billingID });
        if (!billing) {
            return res.status(404).json({ message: "Billing ID expired or invalid" });
        }
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true, validUntil: { $gte: new Date() } });
        if (!coupon) {
            return res.status(404).json({ message: "Coupon code invalid or inactive" });
        }
        billing.coupon = coupon._id;
        await billing.save();
        res.status(200).json({ message: "Coupon code applied successfully", coupon: coupon });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const getAppliedCoupon = async (req, res) => {
    const billingID = req.params.billingID
    try {
        const billing = await Billing.findById(billingID).populate("coupon");
        if (!billing) {
            return res.status(404).json({ message: "Billing ID expired or invalid" });
        }
        res.status(200).json(billing.coupon)
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const deleteBillingRecordByID = async (req, res) => {
    const billingID = req.params.id;
    try {
        await Billing.findOne({ publicId: billingID });
        res.status(200).json({ messgae: "Deleted Successfully" })
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const setDefaultCard = async (req, res) => {
    const userID = req.user.userId
    const { paymentMethodId } = req.body;
    try {
        await User.findByIdAndUpdate(userID, { defaultCard: paymentMethodId }, { new: true });
        res.status(200).json({ message: "Default card set successfully!" });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export { createBillingRecord, fetchBillingDetailsByID, applyCoupon, getAppliedCoupon, deleteBillingRecordByID, setDefaultCard }