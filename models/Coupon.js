import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    discountType: { type: String, required: true, enum: ["percentage", "fixed"] },
    discountValue: { type: Number, required: true }, 
    minCartValue: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    applicableProducts: {type:[{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],default:[]},
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Coupon = mongoose.model("Coupon",couponSchema)

export default Coupon