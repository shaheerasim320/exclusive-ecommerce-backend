import FlashSale from "../models/FlashSaleSchema.js";
import Product from "../models/Product.js";
import slugify from "slugify";
import { enrichProductsWithFlashSale } from '../utils/enrichWithFlashSale.js';


const addProduct = async (req, res) => {
    const product = new Product(req.body)
    try {
        product.productCode = await generateProductCode();
        product.slug = slugify(product.title, { lower: true, strict: true });
        const savedProduct = await product.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Server error, please try again" })
    }
}

const generateProductCode = async () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = Array.from({ length: 6 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
    ).join("");
    const randomNum = Math.floor(100 + Math.random() * 900);
    const productCode = `${code}-${randomNum}`;

    const exists = await Product.findOne({ productCode });
    if (exists) return generateProductCode();
    return productCode;
};



const getBestSellingProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ salesVolume: -1, salesCount: -1 }).limit(10)

        const enriched = await enrichProductsWithFlashSale(products);
        res.json(enriched);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error, please try again" });
    }
};


const getProductByProductCode = async (req, res) => {
    const { productCode } = req.params;

    try {
        const product = await Product.findOne({ productCode }).populate("category flashSaleId")

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const enrichedProduct = await product.getWithFlashSale();

        res.json(enrichedProduct);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error, please try again" });
    }
};

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ onFlashSale: false })
        const enriched = await Promise.all(products.map(p => p.getWithFlashSale()));
        res.json(enriched);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error, please try again" });
    }
};



const updateProduct = async (req, res) => {
    const productID = req.params.id
    const updatedData = req.body
    try {
        const product = await Product.findByIdAndUpdate(productID, updatedData, { new: true })
        if (!product) {
            return res.status(404).json({ message: "Product Not Found" })
        }
        return res.status(200).json(product)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Server error, please try again" })
    }
}

const deleteProduct = async (req, res) => {
    const productID = req.params.productID
    try {
        await Product.findByIdAndDelete(productID)
        return res.status(200).json({ message: "Product deleted successfully" })
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Server error, please try again" })
    }
}

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        const enriched = await Promise.all(products.map(p => p.getWithFlashSale()));
        res.json(enriched);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Server error, please try again" });
    }
};


const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(400).json({ message: 'No search query provided' });

        const products = await Product.find({ $or: [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }] }).populate('category')

        const enrichedProducts = await Promise.all(products.map(product => product.getWithFlashSale()));
        res.json({ products: enrichedProducts });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};


export { addProduct, getBestSellingProducts, getProductByProductCode, getProducts, updateProduct, deleteProduct, getAllProducts, searchProducts };