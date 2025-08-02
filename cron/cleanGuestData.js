import Cart from '../models/Cart.js';
import Wishlist from "../models/Wishlist.js"

export default async function cleanGuestData() {
  try {

    const expiryDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); 

    const cartResult = await Cart.deleteMany({
      user: { $exists: false },
      guestId: { $exists: true },
      createdAt: { $lt: expiryDate },
    });

    const wishlistResult = await Wishlist.deleteMany({
      user: { $exists: false },
      guestId: { $exists: true },
      createdAt: { $lt: expiryDate },
    });

    console.log(`[Cron] Deleted ${cartResult.deletedCount} guest carts and ${wishlistResult.deletedCount} guest wishlists older than 7 days.`);
  } catch (error) {
    console.error('[Cron] Error cleaning guest data:', error);
  }
}
