import Category from "../modules/categoriesModules.js";
import { responses } from "../utlies/response.js";




export const addCategory = async (req, res) => {
    try {
        const { categoryName, description, status } = req.body;

        if (!categoryName)
            return responses(res, 400, "Category name is required");
        if (!description)
            return responses(res, 400, "description is required");

        const existCategory = await Category.findOne({
            categoryName: categoryName.trim(),
        });

        if (existCategory)
            return responses(res, 400, "Category already exists");

        const category = await Category.create({
            categoryName: categoryName.trim(),
            description,
            status,
        });

        return responses(res, 201, "Category created successfully", category);
    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
}


export const getAllCategory = async (req, res) => {

    try {
        const currentPage = Number(req.query.currentPage) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";

        console.log(req.query.search);
        const skip = (currentPage - 1) * limit;

        const filter = {};

        if (search) {
            filter.categoryName = {
                $regex: search,
                $options: "i",
            };
        }

        const total = await Category.countDocuments(filter);

        const categoryData = await Category.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 });

        return responses(res, 200, "Category fetched", {
            result: categoryData,
            total,
            currentPage,
            totalPages: Math.ceil(total / limit),
            limit,
        });

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
};

export const getCategoryCount = async (req, res) => {
    try {
        const totalCategory = await Category.countDocuments();
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayCategory = await Category.countDocuments({
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        return responses(res, 200, "Category count fetched successfully", {
            totalCategory,
            todayCategory,
        });

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}

export const updateCategory = async (req, res) => {
    const { categoryName, description, status } = req.body
    const { id } = req.params
    const categoryData = await Category.findById(id);
    if (!categoryData) return responses(res, 400, "No categories found");
    try {
        const categoryUpdate = await Category.findByIdAndUpdate(id, { categoryName, description, status }, { new: true, runValidators: true, });
        if (!categoryUpdate) {
            return responses(res, 404, "Category not found", []);
        }
        return responses(res, 200, "Category update successfully", categoryUpdate);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}

export const deleteCategory = async (req, res) => {
    const { id } = req.params
    try {
        const categoryDelete = await Category.findByIdAndDelete(id);
        if (!categoryDelete) {
            return responses(res, 404, "Category not found");
        }
        return responses(res, 200, "Category deleted successfully", categoryDelete);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}

export const softUpdateCategory = async (req, res) => {
    console.log(req.body);
    const { status } = req.body
    const { id } = req.params
    const categoryData = await Category.findById(id);
    try {
        const categorySoftUpdate = await Category.findByIdAndUpdate(id, { status }, { new: true, runValidators: true, });
        if (!categorySoftUpdate) {
            return responses(res, 404, "Category not found");
        }
        return responses(res, 200, "Category status updated successfully", categorySoftUpdate);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}