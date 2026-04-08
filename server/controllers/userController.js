import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ── PUT /api/users/me ─────────────────────────────────────────────────────────
// Accepts JSON body: { name, username, bio, dob, gender, presetAvatarId? }
// No file upload / no Cloudinary needed — avatars are preset SVG IDs stored as strings.
export const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, username, bio, dob, gender, presetAvatarId } = req.body;

    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Name cannot be empty" });
      if (name.trim().length < 2) return res.status(400).json({ message: "Name is too short" });
      user.name = name.trim();
    }

    if (username !== undefined) {
      const clean = username.trim().toLowerCase();
      if (clean) {
        const taken = await User.findOne({ username: clean, _id: { $ne: user._id } });
        if (taken) return res.status(400).json({ message: "Username already taken" });
        user.username = clean;
      }
    }

    if (bio !== undefined) user.bio = bio.trim().slice(0, 160);
    if (dob !== undefined) {
      user.dob = dob ? new Date(dob) : null;
    }
    if (gender !== undefined) user.gender = gender || "";

    // Store the preset avatar ID — frontend uses it to look up the SVG locally
    if (presetAvatarId && typeof presetAvatarId === "string") {
      user.profilePic = presetAvatarId;
    }

    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      bio: user.bio,
      dob: user.dob,
      gender: user.gender,

      // ✅ IMPORTANT
      presetAvatarId: user.profilePic,
      profilePic: user.profilePic,
    });
  } catch (err) {
    console.error("updateMe:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/users/me/password ────────────────────────────────────────────────
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords are required" });

    if (newPassword.length < 8)
      return res.status(400).json({ message: "New password must be at least 8 characters" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.password === "google-oauth")
      return res.status(400).json({ message: "Google accounts cannot change password here" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Current password is incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("updatePassword:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/users/me/privacy ─────────────────────────────────────────────────
export const updatePrivacy = async (req, res) => {
  try {
    const { twoFA, loginAlerts, showEmail, showPhone, readReceipts } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (twoFA !== undefined) user.twoFA = Boolean(twoFA);
    if (loginAlerts !== undefined) user.loginAlerts = Boolean(loginAlerts);
    if (showEmail !== undefined) user.showEmail = Boolean(showEmail);
    if (showPhone !== undefined) user.showPhone = Boolean(showPhone);
    if (readReceipts !== undefined) user.readReceipts = Boolean(readReceipts);

    await user.save();
    res.json({ message: "Privacy settings saved" });
  } catch (err) {
    console.error("updatePrivacy:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/users/me/disable ─────────────────────────────────────────────────
export const disableAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isActive = false;
    await user.save();
    res.json({ message: "Account disabled" });
  } catch (err) {
    console.error("disableAccount:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/users/me ──────────────────────────────────────────────────────
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Clean up this user from everyone else's lists
    await User.updateMany({}, {
      $pull: {
        friends: user._id,
        friendRequests: user._id,
        sentRequests: user._id,
      },
    });

    await User.findByIdAndDelete(req.user._id);
    res.json({ message: "Account deleted" });
  } catch (err) {
    console.error("deleteAccount:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};