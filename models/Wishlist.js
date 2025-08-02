import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    guestId: { type: String },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        }
    ]
}, { timestamps: true, });

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

export default Wishlist;