

import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
    {
        supplierId: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        
        supplierName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        phone: {
            type: String,
            required: true,
            unique: true,
        },
        address: {
            type: String,
            trim: true,
            default: "",
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

const Supplier = mongoose.model("Supplier", supplierSchema);

export default Supplier;