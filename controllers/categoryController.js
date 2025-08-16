import Category from "../models/Category.js"
import Product from "../models/Product.js"
import { enrichItemsWithFlashSale } from "../utils/enrichWithFlashSale.js";

const addCategory = async (req, res) => {
    try {
        const { name, parentCategory, slug, description, icon } = req.body;
        if (!name || !slug || !icon) {
            return res.status(400).json({ message: "Name, Slug and Icon are required!" });
        }
        const newCategory = new Category({ name, parentCategory, slug, description, icon });
        await newCategory.save();

        res.status(201).json({ message: "Category created successfully!" });
    } catch (error) {
        console.log(error.message)
        res.status(400).json({ message: "Unable to add category" })
    }
}

const getMainCategories = async (req, res) => {
    try {
        const categories = await Category.find({ parentCategory: null });
        const mainCategories = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ category: category._id });

                const subCategories = await Category.find({ parentCategory: category._id });
                let count = productCount

                const subCategoriesWithProductCount = await Promise.all(
                    subCategories.map(async (subCategory) => {
                        const subCategoryProductCount = await Product.countDocuments({ category: subCategory._id });
                        count += subCategoryProductCount
                        return {
                            id: subCategory._id,
                            name: subCategory.name,
                            products: subCategoryProductCount,
                        };
                    })
                );

                return {
                    id: category._id,
                    name: category.name,
                    subCategories: subCategoriesWithProductCount,
                    products: count,
                    icon: category.icon,
                    slug: category.slug,
                };
            })
        );

        res.status(200).json(mainCategories);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "Error in fetching main categories" });
    }
};


const getSubCategories = async (req, res) => {
    try {
        const categories = await Category.find({ parentCategory: { $ne: null } }).populate("parentCategory");
        const subCategories = await Promise.all(
            categories.map(async (category) => {
                const productCount = await Product.countDocuments({ category: category._id })
                return {
                    id: category._id,
                    name: category.name,
                    mainCategories: category.parentCategory.name,
                    products: productCount,
                    icon: category.icon,
                    slug: category.slug,
                }

            })
        )
        res.status(200).json(subCategories)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in fetching sub categories" })
    }
}

const getDropDownMainCategories = async (req, res) => {
    try {
        let mainCategories = []
        const categories = await Category.find({ parentCategory: null })
        categories.map(category => {
            const mainCategory = {
                value: category.slug,
                name: category.name,
                id: category._id
            }
            mainCategories.push(mainCategory)
        })
        res.status(200).json(mainCategories)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in fetching drop down categories" })
    }
}

const getCategoryByID = async (req, res) => {
    try {
        const { categoryID } = req.params
        if (!categoryID) {
            return res.status(400).json({ message: "CategoryID is missing" })
        }
        const category = await Category.findById(categoryID)
        if (!category) {
            return res.status(404).json({ message: "Requested resource not found" })
        }
        res.status(200).json(category)
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Error in fetching requested category" })
    }
};

const updateCategory = async (req, res) => {
    try {
        const { categoryID, name, parentCategory, slug, description, icon } = req.body;
        if (!categoryID) {
            return res.status(400).json({ message: "Category ID is required!" });
        }
        if (!name || !slug || !icon) {
            return res.status(400).json({ message: "Name, Slug and Icon are required!" });
        }
        const updatedCategory = await Category.findByIdAndUpdate(categoryID, { name, parentCategory, slug, description, icon }, { new: true })

        if (!updatedCategory) {
            return res.status(404).json({ message: "Category not found!" });
        }

        res.status(200).json({ message: "Category updated successfully!" });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Unable to update category" })
    }
}

const deleteCategory = async (req, res) => {
    const { categoryID } = req.params
    try {
        if (!categoryID) {
            return res.status(400).json({ message: "Category ID is required!" });
        }
        await Category.findByIdAndDelete(categoryID)
        res.status(200).json({ message: "Category deleted successfully!" });
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: "Unable to delete requested category" })
    }
}

const getHirearcialDropDownCategories = async (req, res) => {
    try {
        const mainCategories = await Category.find({ parentCategory: null });

        const categories = await Promise.all(
            mainCategories.map(async (category) => {
                const subCategories = await Category.find({ parentCategory: category._id });

                return {
                    name: category.name,
                    id: category._id,
                    slug: category.slug,
                    subCategories: subCategories.map((sub) => ({
                        name: sub.name,
                        id: sub._id,
                        slug: sub.slug,
                    }))
                };
            })
        );
        res.status(200).json(categories);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Unable to fetch product form categories" });
    }
};

const getCategoryNameBySlug = async (req, res) => {
    const slug = req.params.slug;
    try {
        if (!slug) {
            return res.status(400).json({ message: "Slug required" });
        }

        const category = await Category.findOne({ slug: slug }).populate("parentCategory");

        if (!category) {
            return res.status(404).json({ message: "Unable to find category with given slug" });
        }

        res.status(200).json({ name: category.name, id: category._id, parent: category.parentCategory.name });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Unable to fetch name for the requested slug" });
    }
};

const getCategoryProducts = async (req, res) => {
    const categoryID = req.params.categoryID
    try {
        if (!categoryID) {
            return res.status(400).json({ message: "CategoryID required" })
        }
        const products = await Product.find({ category: categoryID })

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "Unable to find the requested products for given category" })
        }
        const enrichedProducts = await enrichItemsWithFlashSale(products);
        console.log(enrichedProducts)
        return res.status(200).json(enrichedProducts);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: "Unable to find the requested products for given category" });
    }
}




export { addCategory, getMainCategories, getDropDownMainCategories, getCategoryByID, updateCategory, getSubCategories, deleteCategory, getHirearcialDropDownCategories, getCategoryNameBySlug, getCategoryProducts }