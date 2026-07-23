import mongoose from "mongoose";

const outOfStockSchema = new mongoose.Schema(
  {
    outOfStockId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    productId: {
      type: String,
      required: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    supplierId: {
      type: String,
      required: true,
      trim: true,
    },

    orderQuantity: {
      type: Number,
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
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

const OutOfStock = mongoose.model("OutOfStock", outOfStockSchema)
export default OutOfStock;