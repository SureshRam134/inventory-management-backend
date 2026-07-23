

import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {

    userId: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    userName: {
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

    roleId: {
      type: String,
    },

    role: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    otp: {
      type: String,
      default: null
    },

    otpExpire: {
      type: Date,
      default: null
    },
    password: {
      type: String,
      default: null
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

const register = mongoose.model("registers", registerSchema);

export default register;

