import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    seq: { type: Number, default: 1000 }
})

const Counter = mongoose.model("Counter",counterSchema)

export default Counter;