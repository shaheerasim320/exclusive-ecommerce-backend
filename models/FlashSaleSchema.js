import mongoose from 'mongoose';

const flashSaleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
      discount: { type: Number, required: true, min: 0, max: 100 },
    },
  ],
  isActive: { type: Boolean, required: true },
}, { timestamps: true });

const FlashSale = mongoose.model('FlashSale', flashSaleSchema);

export default FlashSale;