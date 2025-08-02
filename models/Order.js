import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderId: { type: String, unique: true, required: true },

    products: {
        type: [{
            productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            name: { type: String, required: true }, 
            image: { type: String, required: true },
            quantity: { type: Number, required: true },
            color: { type: String, default: null },
            size: { type: String, default: null },
            price: { type: Number, required: true },
            discount: { type: Number, required: true }
        }],
        required: true
    },

    orderDate: { type: Date, default: Date.now, required: true },
    cancelledDate: { type: Date, default: null },
    returnedDate: { type: Date, default: null },

    orderStatus: {
        type: String,
        default: "pending",
        required: true,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled", "completed", "returned", "refunded", "failed", "under-review"]
    },

    // Coupon Information
    couponCode: { type: String, default: null }, // e.g., "SUMMER20"
    couponDiscountAmount: { type: Number, default: 0 }, // total discount amount in currency
    // (We remove coupon object reference to prevent inconsistency if coupon is deleted later)

    // Payment and Billing
    subtotal: { type: Number, required: true }, // products total without discount/shipping
    shippingFee: { type: Number, default: 0 }, // shipping cost
    totalAmount: { type: Number, required: true }, // subtotal - coupon + shipping

    paymentMethod: { type: String, enum: ["card", "cod"], required: true },
    paymentStatus: {
        type: String,
        default: "pending",
        enum: ["pending", "paid", "failed", "cancelled", "refunded", "in-progress", "declined", "under-review"]
    },
    transactionId: { type: String, default: null },
    paymentDate: { type: Date, default: null },

    shippingAddress: { type: mongoose.Schema.Types.Mixed, required: true } // shipping snapshot
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
