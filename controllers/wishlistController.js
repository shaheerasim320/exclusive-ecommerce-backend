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

        res.status(200).json({ items: wishlist.items });
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


const moveAllItemsToCart = async (req, res) => {
    // const userID = req.user.userId;

    try {
        //     const user = await User.findById(userID);
        //     if (!user) {
        //         return res.status(404).json({ message: "User not found" });
        //     }

        //     let wishlistItems = await WishlistItem.find({ _id: { $in: user.wishlist } }).populate("productID");
        //     if (!wishlistItems.length) {
        //         return res.status(404).json({ message: "No items in wishlist" });
        //     }

        //     // Remove out-of-stock items
        //     wishlistItems = wishlistItems.filter(item => item.productID.stock > 0);
        //     if (!wishlistItems.length) {
        //         return res.status(400).json({ message: "No items in stock" });
        //     }

        //     const wishlistItemIds = wishlistItems.map(item => item._id);

        //     let cart = await Cart.findOne({ user: userID }).populate("items");
        //     if (!cart) {
        //         return res.status(404).json({ message: "Unable to find cart" });
        //     }

        //     const userCartItems = cart.items;

        //     const cartItems = await Promise.all(
        //         wishlistItems.map(async (item) => {
        //             // Find all cart items that match productID, color, and size
        //             const matchingCartItems = userCartItems.filter(cartItem =>
        //                 cartItem.productID.toString() === item.productID._id.toString() &&
        //                 cartItem.color === item.color &&
        //                 cartItem.size === item.size
        //             );

        //             if (matchingCartItems.length > 0) {
        //                 await Promise.all(
        //                     matchingCartItems.map(async (cartItem) => {
        //                         await CartItem.findOneAndUpdate(
        //                             { _id: cartItem._id },
        //                             { $inc: { quantity: item.quantity } },
        //                             { new: true }
        //                         );
        //                     })
        //                 );
        //                 return null; // No need to add new items
        //             } else {
        //                 return new CartItem({
        //                     productID: item.productID._id,
        //                     quantity: item.quantity,
        //                     color: item.color,
        //                     size: item.size
        //                 });
        //             }
        //         })
        //     );

        //     // Filter out nulls (items that were updated)
        //     const newCartItems = cartItems.filter(item => item !== null);

        //     // Insert new cart items
        //     if (newCartItems.length > 0) {
        //         const savedItems = await CartItem.insertMany(newCartItems);
        //         cart.items.push(...savedItems.map(savedItem => savedItem._id));
        //         await cart.save();
        //     }

        //     // Remove moved items from wishlist
        //     await WishlistItem.deleteMany({ _id: { $in: wishlistItemIds } });

        //     // Update user's wishlist
        //     user.wishlist = user.wishlist.filter(itemId => !wishlistItemIds.includes(itemId.toString()));
        //     await user.save();

        res.status(200).json({ message: "All items moved to cart successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        res.status(200).json({ items: enrichedItems });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



const addToCart = async (req, res) => {
    const userID = req.user.userId
    const { itemID } = req.body
    try {
        // const user = await User.findById(userID)
        // if (!user) {
        //     return res.status(404).json({ message: "User not found" })
        // }
        // const cart = await Cart.findOne({ user: userID });
        // if (!cart) {
        //     return res.status(404).json({ message: "Unable to find cart" });
        // }
        // const wishlistItem = await WishlistItem.findById(itemID)
        // if (!wishlistItem) {
        //     return res.status(404).json({ message: "Item not found" })
        // }
        // const item = await CartItem.findOne({ productID: wishlistItem.productID, _id: { $in: cart.items } })
        // if (item) {
        //     await CartItem.findByIdAndUpdate(item._id, { quantity: item.quantity + wishlistItem.quantity }, { new: true })
        // } else {
        //     const cartItem = new CartItem({ productID: wishlistItem.productID, quantity: wishlistItem.quantity, color: wishlistItem.color, size: wishlistItem.size })
        //     const savedItem = await cartItem.save()
        //     cart.items.push(savedItem._id)
        //     await cart.save()
        // }
        // await WishlistItem.findByIdAndDelete(itemID)
        // user.wishlist = user.wishlist.filter(item => item != itemID)
        // await user.save()
        // res.status(200).json({ message: "Item Moved To Cart" })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export { moveAllItemsToCart, addToCart }
