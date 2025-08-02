import mongoose from 'mongoose';
import FlashSale from './FlashSaleSchema.js';

const productSchema = new mongoose.Schema({
    storeName: { type: String, required: true },
    slug: { type: String },
    productCode: { type: String },
    title: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    stock: { type: Number, required: true },
    reviews: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    onSale: { type: Boolean, default: false },
    onFlashSale: { type: Boolean, default: false },
    flashSaleId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlashSale', default: null },
    colors: { type: [String], default: null },
    sizes: { type: [String], default: null },
    mainImage: { type: String, required: true },
    image1: { type: String, required: true },
    image2: { type: String, required: true },
    image3: { type: String, required: true },
    image4: { type: String, required: true },
    salesCount: { type: Number, default: 0 },
    salesVolume: { type: Number, default: 0 },
}, { timestamps: true });

productSchema.methods.getWithFlashSale = async function () {
  const now = new Date();

  const flashSale = await FlashSale.findOne({
    startTime: { $lte: now },
    endTime: { $gte: now },
    isActive: true,
    'products.product': this._id
  });

  const saleItem = flashSale?.products.find(p => p.product.toString() === this._id.toString());

  const flashSaleDiscount = saleItem?.discount || null;
  return {
    ...this.toObject(),
    flashSaleDiscount,
  };
};


const Product = mongoose.model('Product', productSchema);

export default Product;