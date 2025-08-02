import FlashSale from "../models/FlashSaleSchema.js";
import Product from "../models/Product.js";

async function extendOrRecycleFlashSales() {
  try {
    const currentDate = new Date();

    const expiredFlashSales = await FlashSale.find({
      isActive: true,
      endTime: { $lte: currentDate },
    });

    for (const flashSale of expiredFlashSales) {
      const newStart = new Date(currentDate);
      const newEnd = new Date(currentDate.getTime() + 6 * 24 * 60 * 60 * 1000);

      flashSale.startTime = newStart;
      flashSale.endTime = newEnd;
      flashSale.isActive = true;
      await flashSale.save();

      const productIds = flashSale.products.map(p => p.product);
      await Product.updateMany(
        { _id: { $in: productIds } },
        {
          $set: {
            onFlashSale: true,
            flashSaleId: flashSale._id,
          },
        }
      );
    }

    console.log(`Extended ${expiredFlashSales.length} flash sales by 6 days`);
  } catch (error) {
    console.error("Error extending flash sales:", error);
  }
}

export default extendOrRecycleFlashSales;
