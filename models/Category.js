import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    slug: { type: String, unique: true, required: true },
    description: { type: String, default: "" },
    icon: { type: String, required: true },
}, { timestamps: true })

const Category = mongoose.model("Category", categorySchema)

export default Category;