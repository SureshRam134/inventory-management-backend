import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "LOW_STOCK",
        "OUT_OF_STOCK",
        "NEW_ORDER",
        "STOCK_IN",
        "STOCK_OUT",
        "ORDER_DISPATCHED",
        "ORDER_CANCELLED",
        "ORDER_RETURNED",
        "NEW_USER"
      ],
      required: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "admin",
    },
    
    userId: {
      type: String,
      default: null,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);