import Wishlist from "../models/Wishlist.js";
import { enrichItemsWithFlashSale } from "../utils/enrichWithFlashSale.js";

export const addToWishlist = async (req, res) => {
    const { product } = req.body;

    try {
        const query = req.user?.userId ? { user: req.user.userId } : { guestId: req.guestId };
        let wishlist = await Wishlist.findOne(query);

        if (!wishlist) {
            wishlist = await Wishlist.create(query);
        }

        const alreadyExists = wishlist.items.some(item =>
            item.product == product
        );

        if (!alreadyExists) {
            wishlist.items.push({ product });
            await wishlist.save();
        }

        await wishlist.populate("items.product");

        const enrichedItems = await enrichItemsWithFlashSale(wishlist.items);
        res.status(200).json({ items: enrichedItems });

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const removeFromWishlist = async (req, res) => {
    const { wishlistItemId } = req.body;

    try {
        const query = req.user?.userId ? { user: req.user.userId } : { guestId: req.guestId };

        await Wishlist.updateOne(query, { $pull: { items: { _id: wishlistItemId } } });

        const wishlist = await Wishlist.findOne(query).populate("items.product");

        res.status(200).json({ items: wishlist?.items || [] });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const mergeWishlist = async (req, res) => {
    const guestId = req.guestId;
    const userId = req.user?.userId

    try {
        const guestWishlist = await Wishlist.findOne({ guestId });
        const userWishlist = await Wishlist.findOne({ user: userId });

        if (!guestWishlist && !userWishlist) {
            return res.status(404).json({ message: "No wishlist found for guest or user" });
        }


        guestWishlist.items.forEach(guestItem => {
            const existingIndex = userWishlist.items.findIndex(item =>
                item.product == guestItem.product
            );

            if (existingIndex === -1) {
                userWishlist.items.push(guestItem);
            }
        });

        await userWishlist.save();

        await Wishlist.findOneAndDelete({ guestId });

        const updatedWishlist = await userWishlist.populate("items.product");
        console.log(updatedWishlist);
        res.status(200).json({ message: "Wishlist merged successfully", wishlist: updatedWishlist.items });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const discardGuestWishlist = async (req, res) => {
    try {
        const guestId = req.guestId;

        if (!guestId) {
            return res.status(400).json({ message: "Guest ID is required" });
        }

        const guestWishlist = await Wishlist.findOne({ guestId });

        if (!guestWishlist) {
            return res.status(404).json({ message: "Guest wishlist not found" });
        }

        await Wishlist.deleteOne({ guestId });

        return res.status(200).json({ message: "Guest wishlist discarded successfully" });

    } catch (error) {
        console.error("Error discarding guest wishlist:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const getWishlistItems = async (req, res) => {
    try {
        const query = req.user?.userId ? { user: req.user.userId } : { guestId: req.guestId };
        const wishlist = await Wishlist.findOne(query).populate("items.product");
        if (!wishlist || !wishlist.items) {
            return res.status(200).json({ items: [] });
        }

        const enrichedItems = await enrichItemsWithFlashSale(wishlist.items);

        console.log(enrichedItems);

        res.status(200).json({ items: enrichedItems });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const getGuestWishlistItems = async (req, res) => {
    const guestId = req.guestId;

    if (!guestId) {
        return res.status(400).json({ message: "Missing guest ID" });
    }

    try {
        const wishlist = await Wishlist.findOne({ guestId }).populate("items.product");

        if (!wishlist) {
            return res.status(200).json({ items: [] });
        }

        const enrichedItems = await enrichItemsWithFlashSale(wishlist.items);
        console.log(enrichedItems);
        res.status(200).json({ items: enrichedItems });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

