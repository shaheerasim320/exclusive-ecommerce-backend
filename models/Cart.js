import mongoose from "mongoose";


const cartSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestId: { type: String },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, default: 1, required: true },
        color: { type: String, default: null },
        size: { type: String, default: null },
    }],
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null }
}, { timestamps: true })


const Cart = mongoose.model("Cart", cartSchema)

export default Cart