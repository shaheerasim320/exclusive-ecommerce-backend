import Billing from "../models/Billing.js";
import Product from "../models/Product.js";

export const cleanupExpiredBillings = async () => {
    try {
        console.log("🔍 Checking for expired billings...");

        // Find expired billings that haven't been processed
        const expiredBillings = await Billing.find({ expiresAt: { $lte: new Date() } });

        if (expiredBillings.length === 0) {
            console.log("✅ No expired billings found.");
            return;
        }

        for (const billing of expiredBillings) {
            console.log(`🛑 Restoring stock for Billing ID: ${billing._id}`);

            // Restore stock for each item
            for (const item of billing.items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: item.quantity }
                });
            }

            // Optional: Delete after processing
            await Billing.findByIdAndDelete(billing._id);
        }

        console.log(`✅ Restored stock and removed ${expiredBillings.length} expired billings.`);
    } catch (error) {
        console.error("❌ Error in cleanupExpiredBillings:", error);
    }
};
