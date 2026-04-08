import User from "../models/User.js";

// ─────────────────────────────────────────────────────────────────────────────
// WHY .some() instead of .includes():
// MongoDB stores IDs as ObjectId objects. JavaScript's .includes() uses
// strict equality (===). An ObjectId object is NEVER === a plain string,
// so .includes(someStringId) always returns false — silently breaking
// accept, reject, and duplicate-request checks.
// .some(id => id.toString() === target) converts before comparing. ✅
// ─────────────────────────────────────────────────────────────────────────────
const has = (arr, strId) => arr.some(id => id.toString() === strId);


// ── GET MY FRIENDS ────────────────────────────────────────────────────────────
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "name email profilePic");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.friends);
  } catch (err) {
    console.error("getFriends:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};


// ── ALL OTHER USERS (DISCOVER) ────────────────────────────────────────────────
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select("-password");
    res.json(users);
  } catch (err) {
    console.error("getUsers:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};


// ── INCOMING REQUESTS ─────────────────────────────────────────────────────────
export const getRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friendRequests", "name email profilePic");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.friendRequests);
  } catch (err) {
    console.error("getRequests:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};


// ── REQUESTS I SENT (for frontend Pending badge) ──────────────────────────────
export const getSentRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("sentRequests", "name email profilePic");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user.sentRequests);
  } catch (err) {
    console.error("getSentRequests:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};


// ── SEND FRIEND REQUEST ───────────────────────────────────────────────────────
export const sendRequest = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ msg: "userId is required" });

  try {
    if (req.user._id.toString() === userId)
      return res.status(400).json({ msg: "You cannot add yourself" });

    const sender   = await User.findById(req.user._id);
    const receiver = await User.findById(userId);
    if (!receiver) return res.status(404).json({ msg: "User not found" });

    if (has(sender.friends, userId))
      return res.status(400).json({ msg: "Already friends" });

    if (has(sender.sentRequests, userId))
      return res.status(400).json({ msg: "Request already sent" });

    if (has(sender.friendRequests, userId))
      return res.status(400).json({ msg: "This user already sent you a request — accept it instead" });

    sender.sentRequests.push(userId);
    receiver.friendRequests.push(sender._id);
    await sender.save();
    await receiver.save();

    res.json({ msg: "Request sent" });
  } catch (err) {
    console.error("sendRequest:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};


// ── ACCEPT FRIEND REQUEST ─────────────────────────────────────────────────────
export const acceptRequest = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ msg: "userId is required" });

  try {
    const currentUser = await User.findById(req.user._id);
    const sender      = await User.findById(userId);
    if (!sender) return res.status(404).json({ msg: "User not found" });

    // ✅ was: currentUser.friendRequests.includes(userId) — always false
    if (!has(currentUser.friendRequests, userId))
      return res.status(400).json({ msg: "No friend request from this user" });

    currentUser.friends.push(userId);
    sender.friends.push(currentUser._id);

    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== userId
    );
    sender.sentRequests = sender.sentRequests.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await sender.save();

    res.json({ msg: "Friend added" });
  } catch (err) {
    console.error("acceptRequest:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};


// ── REJECT FRIEND REQUEST ─────────────────────────────────────────────────────
export const rejectRequest = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ msg: "userId is required" });

  try {
    const currentUser = await User.findById(req.user._id);
    const sender      = await User.findById(userId);
    if (!sender) return res.status(404).json({ msg: "User not found" });

    currentUser.friendRequests = currentUser.friendRequests.filter(
      id => id.toString() !== userId
    );
    sender.sentRequests = sender.sentRequests.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await sender.save();

    res.json({ msg: "Request rejected" });
  } catch (err) {
    console.error("rejectRequest:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};


// ── REMOVE FRIEND ─────────────────────────────────────────────────────────────
export const removeFriend = async (req, res) => {
  const friendId = req.params.id;
  if (!friendId) return res.status(400).json({ msg: "Friend ID is required" });

  try {
    const currentUser = await User.findById(req.user._id);
    const friend      = await User.findById(friendId);
    if (!friend) return res.status(404).json({ msg: "User not found" });

    currentUser.friends = currentUser.friends.filter(
      id => id.toString() !== friendId
    );
    friend.friends = friend.friends.filter(
      id => id.toString() !== currentUser._id.toString()
    );

    await currentUser.save();
    await friend.save();

    res.json({ msg: "Friend removed" });
  } catch (err) {
    console.error("removeFriend:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
};