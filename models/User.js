import mongoose from "mongoose";
import Counter from "./Counter.js";

const userSchema = new mongoose.Schema({
    custID: { type: Number, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, default: "user" },
    phoneNumber: { type: String, default: null },
    gender: { type: String, default: "Not Specified" },
    status: { type: String, default: "unverified", enum: ["unverified", "verified", "blocked"] },
    defaultShippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", default: null },
    defaultBillingAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", default: null },
    paymentOptions: [{ type: String, default: [] }],
    stripeCustomerID: { type: String, default: null },
    defaultCard: { type: String, default: null },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order", default: [] }],
}, { timestamps: true });


const User = mongoose.model("User", userSchema);
export default User;
