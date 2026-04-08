// models/UserSettings.js
import mongoose from "mongoose";

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    chatBackground: {
      type: String,       // URL or base64 data URI
      default: "",
    },
    backgroundType: {
      type: String,
      enum: ["none", "color", "gradient", "image"],
      default: "none",
    },
    backgroundValue: {
      type: String,       // CSS color / gradient string / image URL
      default: "",
    },
    opacity: {
      type: Number,
      min: 0,
      max: 100,
      default: 100,
    },
    bubbleColorMe: {
      type: String,
      default: "linear-gradient(135deg,#7c5cfc,#5b3ed4)",
    },
    bubbleColorThem: {
      type: String,
      default: "rgba(255,255,255,0.07)",
    },
    textColorMe: {
      type: String,
      default: "#ffffff",
    },
    textColorThem: {
      type: String,
      default: "rgba(240,232,255,0.9)",
    },
  },
  { timestamps: true }
);

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);
export default UserSettings;