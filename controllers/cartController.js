import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";
import { enrichItemsWithFlashSale } from "../utils/enrichWithFlashSale.js";

export const getCartItems = async (req, res) => {
    try {
        const query = req.user?.userId ? { user: req.user.userId } : { guestId: req.guestId };

        const cart = await Cart.findOne(query).populate("items.product");

        if (!cart || !cart.items) {
            return res.status(200).json([]);
        }

        const enrichedItems = await enrichItemsWithFlashSale(cart.items);


        res.status(200).json(enrichedItems);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error, please try again" });
    }
};


export const getGuestCartItems = async (req, res) => {
    const guestId = req.guestId;

    if (!guestId) {
        return res.status(400).json({ message: "Missing guest ID" });
    }

    try {
        const cart = await Cart.findOne({ guestId }).populate("items.product");

        if (!cart || !Array.isArray(cart.items)) {
            return res.status(200).json([]);
        }

        const enrichedItems = await enrichItemsWithFlashSale(cart.items);
        res.status(200).json(enrichedItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error, please try again" });
    }
};


export const addToCart = async (req, res) => {
    const { product, quantity = 1, color, size } = req.body;
    const query = req.user?.userId ? { user: req.user.userId } : { guestId: req.guestId };

    try {
        let result = await Cart.updateOne({ ...query, "items.product": new mongoose.Types.ObjectId(product), "items.color": color, "items.size": size, }, { $inc: { "items.$.quantity": quantity } });

        if (result.matchedCount === 0) {
            await Cart.updateOne(query, { $push: { items: { product, quantity, color, size } } }, { upsert: true });
        }

        const updatedCart = await Cart.findOne(query).populate("items.product");

        const enrichedItems = await enrichItemsWithFlashSale(updatedCart.items);

        res.status(200).json({ items: enrichedItems });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Server error, please try again" });
    }
};

export const removeFromCart = async (req, res) => {
    const { cartItemId } = req.body;
    try {
        const query = req.user?.userId ? { user: req.user.userId } : { guestId: req.guestId };
        await Cart.updateOne(
            query,
            { $pull: { items: { _id: cartItemId } } }
        )
        const cart = await Cart.findOne(query).populate("items.product");

        if (!cart || !cart.items) {
            return res.status(200).json({ items: [] });
        }

        const enrichedItems = await enrichItemsWithFlashSale(cart.items);


        res.status(200).json({ items: enrichedItems });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error, please try again" });
    }
}

export const mergeCart = async (req, res) => {
    const guestId = req.guestId;
    const userId = req.user?.userId
    const { mergeOptions } = req.body;

    try {
        const guestCart = await Cart.findOne({ guestId });
        const userCart = await Cart.findOne({ user: userId });
        if (!guestCart && !userCart) {
            return res.status(404).json({ message: "No cart found for guest or user" });
        }
        if (mergeOptions === "cart") {

            guestCart.items.forEach(guestItem => {
                const existingIndex = userCart.items.findIndex(item =>
                    item.product == guestItem.product &&
                    item.color == guestItem.color &&
                    item.size == guestItem.size
                );

                if (existingIndex > -1) {
                    userCart.items[existingIndex].quantity += guestItem.quantity;
                } else {
                    userCart.items.push(guestItem);
                }
            });

            await userCart.save();

            await Cart.findOneAndDelete({ guestId });

            await userCart.populate("items.product");

            const enrichedItems = await enrichItemsWithFlashSale(userCart.items);

            res.status(200).json({ message: "Cart merged successfully", cart: enrichedItems });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error merging cart data" });
    }
};


export const updateProductQuantity = async (req, res) => {
    const { cartItemId, quantity } = req.body;

    try {
        if (!cartItemId || quantity <= 0) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        const query = req.user?.userId ? { user: req.user.userId } : { guestId: req.guestId };

        const cart = await Cart.findOne(query);
        if (!cart) return res.status(404).json({ message: "Cart not found for this user" });

        const cartItem = cart.items.find(item => item._id.toString() == cartItemId);

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        cartItem.quantity = quantity;
        await cart.populate("items.product");
        await cart.save();

        const enrichedItems = await enrichItemsWithFlashSale(cart.items);


        res.status(200).json({ message: "Cart updated successfully", items: enrichedItems });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error, please try again" });
    }
};


const applyCoupon = async (req, res) => {
    const { couponCode } = req.body;
    const query = req.user?.userId ? { user: req.user.userId } : { guestId: req.guestId };
    try {
        const cart = await Cart.findOne(query);
        if (!cart) {
            return res.status(404).json({ message: "Unable to find cart" });
        }
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true, validUntil: { $gte: new Date() } });
        if (!coupon) {
            return res.status(404).json({ message: "Coupon code invalid or inactive" });
        }
        cart.coupon = coupon._id;
        await cart.save();
        res.status(200).json(coupon);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAppliedCoupon = async (req, res) => {
    const query = req.user?.userId ? { user: req.user.userId } : { guestId: req.guestId };
    try {
        const cart = await Cart.findOne(query).populate("coupon");
        res.status(200).json(cart?.coupon || null)
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const removeCoupon = async (req, res) => {
    const userID = req.user.userId
    try {
        const cart = await Cart.findOne({ user: userID });
        if (!cart) {
            return res.status(404).json({ message: "Unable to find cart" });
        }
        cart.coupon = null;
        await cart.save();
        res.status(200).json({ message: "Coupon removed successfully", cart: cart })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in removing coupon" })
    }
}

export const discardGuestCart = async (req, res) => {
    try {
        const guestId = req.guestId;

        if (!guestId) {
            return res.status(400).json({ message: "Guest ID is required" });
        }

        const guestCart = await Cart.findOne({ guestId });

        if (!guestCart) {
            return res.status(404).json({ message: "Guest cart not found" });
        }

        await Cart.deleteOne({ guestId });

        return res.status(200).json({ message: "Guest cart discarded successfully" });

    } catch (error) {
        console.error("Error discarding guest cart:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export { applyCoupon, getAppliedCoupon, removeCoupon }