import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    country: { type: String, required: true },
    defaultShippingAddress: { type: Boolean, default: false },
    defaultBillingAddress: { type: Boolean, default: false }
}, { timestamps: true })

const Address = mongoose.model('Address', addressSchema)

export default Address