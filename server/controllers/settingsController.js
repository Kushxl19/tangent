// controllers/settingsController.js
import UserSettings from "../models/UserSettings.js";

/**
 * GET /api/settings
 * Returns the current user's chat settings (or defaults if none saved yet).
 */
export const getSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ userId: req.user._id });
    if (!settings) {
      // Return default values without persisting yet
      settings = {
        userId: req.user._id,
        chatBackground: "",
        backgroundType: "none",
        backgroundValue: "",
        opacity: 100,
        bubbleColorMe: "linear-gradient(135deg,#7c5cfc,#5b3ed4)",
        bubbleColorThem: "rgba(255,255,255,0.07)",
        textColorMe: "#ffffff",
        textColorThem: "rgba(240,232,255,0.9)",
      };
    }
    res.json(settings);
  } catch (err) {
    console.error("getSettings:", err);
    res.status(500).json({ message: "Server error fetching settings" });
  }
};

/**
 * PUT /api/settings
 * Upserts the current user's chat settings.
 * Body: { chatBackground, backgroundType, backgroundValue, opacity,
 *         bubbleColorMe, bubbleColorThem, textColorMe, textColorThem }
 */
export const updateSettings = async (req, res) => {
  try {
    const {
      chatBackground,
      backgroundType,
      backgroundValue,
      opacity,
      bubbleColorMe,
      bubbleColorThem,
      textColorMe,
      textColorThem,
    } = req.body;

    const settings = await UserSettings.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: {
          chatBackground,
          backgroundType,
          backgroundValue,
          opacity,
          bubbleColorMe,
          bubbleColorThem,
          textColorMe,
          textColorThem,
        },
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json(settings);
  } catch (err) {
    console.error("updateSettings:", err);
    res.status(500).json({ message: "Server error saving settings" });
  }
};