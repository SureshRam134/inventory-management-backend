import mongoose from "mongoose";

const stockOutSchema = new mongoose.Schema(
  {
    stockOutId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    orderId: {
      type: String,
      required: true,
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

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    supplierId: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["Dispatch", "Pending", "Return", "Cancelled"],
      default: "Dispatch",
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

const StockOut = mongoose.model("StockOut", stockOutSchema);

export default StockOut;