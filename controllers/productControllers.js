import Category from "../modules/categoriesModules.js";
import Product from "../modules/productModules.js";
import Supplier from "../modules/supplierModule.js";
import { responses } from "../utlies/response.js";


export const getCategory = async (req, res) => {

    try {
        const categoryData = await Category.find()
        if (!categoryData) return responses(res, 404, "Category Not Found");
        return responses(res, 200, "Category fetched", categoryData);

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }

}

export const getSupplier = async (req, res) => {

    try {
        const supplierData = await Supplier.find()
        if (!supplierData) return responses(res, 404, "Supplier Not Found");
        return responses(res, 200, "Supplier fetched", supplierData);

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }

}


export const addProducts = async (req, res) => {

    try {
        const { productId, productName, category, supplier, price, quantity, status, description, supplierId, sellingPrice } = req.body;
        const image = req.file ? req.file.filename : "";

        if (!productName) return responses(res, 400, "Please enter product name")
        if (!category) return responses(res, 400, "Please enter category")
        if (!supplier) return responses(res, 400, "Please enter supplier name")
        if (!price) return responses(res, 400, "Please enter product price")
        if (!Number(price)) return responses(res, 400, "Price only enter number")
        if (!sellingPrice) return responses(res, 400, "Please enter product sellingPrice")
        if (!Number(sellingPrice)) return responses(res, 400, "sellingPrice only enter number")
        if (!status) return responses(res, 400, "Please enter product status ")
        if (!description) return responses(res, 400, "Please enter product description ")

        const existProduct = await Product.findOne({ productId });
        if (existProduct)
            return responses(res, 400, " already exists this product");

        const getSupplier = await Supplier.findOne({ supplierName: supplier });
        if (!getSupplier)
            return responses(res, 400, " Please choose vaild supplier");


        let stockStatus = ""
        if (Number(quantity) === 0) {
            stockStatus = "Out of Stock";
        } else if (Number(quantity) <= 10) {
            stockStatus = "Low Stock";
        } else {
            stockStatus = "In Stock";
        }

        const lastProduct = await Product.findOne().sort({ createdAt: -1 });
        let count = 1;
        if (lastProduct) {
            count = Number(lastProduct.productId.split("-")[1]) + 1;
        }
        const currentProductId = `PRO-${String(count).padStart(6, "0")}`;

        const product = await Product.create({ productId: currentProductId, supplierId: getSupplier.supplierId, productName, category, supplier, price, quantity, status: stockStatus, description, sellingPrice, image });
        return responses(res, 201, "Product created successfully", product);

    } catch (error) {
        console.log(error);
        return responses(res, 500, "Internal Server Error");
    }
}

export const getAllProduct = async (req, res) => {

    try {
        const currentPage = Number(req.query.currentPage) || 1;
        const limit = Number(req.query.limit) || 5;
        const search = req.query.search || "";

        console.log(req.query.search);
        const skip = (currentPage - 1) * limit;

        const filter = {};

        if (search) {
            filter.productId = {
                $regex: search,
                $options: "i",
            };
        }

        const total = await Product.countDocuments(filter);

        const productData = await Product.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: 1 });

        return responses(res, 200, "Product fetched", {
            result: productData,
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


export const getProductCount = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayProducts = await Product.countDocuments({
            createdAt: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
        });

        return responses(res, 200, "Product count fetched successfully", {
            totalProducts,
            todayProducts,
        });

    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
};


export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(req.body);
    

    const { productName, category, supplier, price, sellingPrice, quantity, description, } = req.body;

    const productData = await Product.findById(id);
    if (!productData) return responses(res, 404, "Product not found");
    if (!productName) return responses(res, 400, "Please enter product name");
    if (!category) return responses(res, 400, "Please enter category");
    if (!supplier) return responses(res, 400, "Please enter supplier");
    if (!price || isNaN(price)) return responses(res, 400, "Please enter a valid purchase price");
    if (!sellingPrice || isNaN(sellingPrice)) return responses(res, 400, "Please enter a valid selling price");
    if (quantity === "" || quantity === null || quantity === undefined) return responses(res, 400, "Please enter quantity");
    if (!description) return responses(res, 400, "Please enter description");

    const supplierData = await Supplier.findOne({
      supplierName: supplier,
    });

    if (!supplierData) return responses(res, 400, "Please choose a valid supplier");

    let stockStatus = "";

    if (Number(quantity) === 0) {
      stockStatus = "Out of Stock";
    } else if (Number(quantity) <= 10) {
      stockStatus = "Low Stock";
    } else {
      stockStatus = "In Stock";
    }

    const image = req.file
      ? req.file.filename
      : productData.image;

    const productUpdate = await Product.findByIdAndUpdate( id, { productName, category, supplier, supplierId: supplierData.supplierId, price, sellingPrice, quantity, status: stockStatus, description, image, }, { new: true, runValidators: true, } );

    return responses(
      res,
      200,
      "Product updated successfully",
      productUpdate
    );
  } catch (error) {
    console.log(error);
    return responses(res, 500, "Internal Server Error");
  }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params
    try {
        const productDelete = await Product.findByIdAndDelete(id);
        if (!productDelete) {
            return responses(res, 404, "Product not found");
        }
        return responses(res, 200, "Product deleted successfully", productDelete);
    } catch (error) {
        return responses(res, 500, "Internal Server Error");
    }
}
