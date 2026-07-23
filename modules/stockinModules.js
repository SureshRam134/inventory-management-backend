import mongoose from "mongoose";

const stockInSchema = new mongoose.Schema(
  {
    stockInId: {
      type: String,
      required: true,
      unique: true,
    },
    productId: {
      type: String,
      required: true,
    },

    product: {
      type: String,
      required: true,
    },

    supplier: {
      type: String,
      required: true,
    },
    supplierId: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    receivedDate: {
      type: Date,
      default: Date.now,
    },

    invoiceNo: {
      type: String,
      default: "",
    },

    receivedBy: {
      type: String,
      default: "null",
    },

    role: {
      type: String,
      default: "null",
    },

    remarks: {
      type: String,
      default: "",
      default: "null",
    },

    status: {
      type: String,
      enum: ["Pending", "Received", "Return"],
      default: "Received",
    },

    description: {
      type: String,
      default: "null",
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

export default mongoose.model("stockIn", stockInSchema);