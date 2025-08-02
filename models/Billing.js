import mongoose from "mongoose";

const billingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    publicId: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["pending", "completed"], default: "pending" },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true },
            color: { type: String, default: null },
            size: { type: String, default: null }
        }
    ],
    coupon: {
        type: mongoose.Schema.Types.ObjectId, ref: "Coupon", default: null
    },
}, {
    timestamps: true
});

const Billing = mongoose.model("Billing", billingSchema);

export default Billing;
