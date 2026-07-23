import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        productId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        productName: {
            type: String,
            required: true,
            trim: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        supplier: {
            type: String,
            required: true,
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },
        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        quantity: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        status: {
            type: String,
            enum: ["In Stock", "Low Stock", "Out of Stock"],
            default: "In Stock",
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        supplierId: {
            type: String,
            required: true,
            trim: true,
        },

        image: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model("Product", productSchema);

export default Product;