import { enrichProductsWithFlashSale } from "./enrichWithFlashSale.js";

export const enrichCartItems = async (items) => {
    if (!items || items.length === 0) return [];

    const products = items.map(item => item.product);
    const enrichedProducts = await enrichProductsWithFlashSale(products);

    return items.map(item => {
        const enriched = enrichedProducts.find(
            p => p._id === item.product._id
        );
        return {
            ...item,
            product: enriched || item.product
        };
    });
};
