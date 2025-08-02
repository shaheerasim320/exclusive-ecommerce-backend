export const enrichItemsWithFlashSale = async (items) => {
  if (!Array.isArray(items)) return [];

  return Promise.all(
    items.map(async (item) => {
      if (!item.product?.getWithFlashSale) {
        return item;
      }

      const enrichedProduct = await item.product.getWithFlashSale();
      return {
        ...item.toObject?.() || item,
        product: enrichedProduct,
      };
    })
  );
};

export const enrichProductsWithFlashSale = async (products) => {
  if (!Array.isArray(products)) return [];

  return Promise.all(
    products.map(async (product) => {
      if (typeof product.getWithFlashSale !== "function") return product;
      return await product.getWithFlashSale();
    })
  );
};
