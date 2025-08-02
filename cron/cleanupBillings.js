import Billing from "../models/Billing.js";
import Product from "../models/Product.js";


export default async function cleanupBillings() {
  try {
    const expiryDate = new Date(Date.now() - 1 * 60 * 60 * 1000); 

    const expiredBillings = await Billing.find({
      status: 'pending',
      createdAt: { $lt: expiryDate },
    });

    for (const billing of expiredBillings) {
      for (const item of billing.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }

      await Billing.findByIdAndDelete(billing._id);
    }

    console.log(`[Cron] Cleaned up ${expiredBillings.length} expired billings and restored stock.`);
  } catch (error) {
    console.error('[Cron] Error cleaning up billings:', error);
  }
}
