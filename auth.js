const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const USERS_FILE = "./data/users.json";
const JWT_SECRET = "music_app_secret_key";

// Read users
function readUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

// Save users
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// REGISTER
router.post("/register", async (req, res) => {
  const { name, emailOrPhone, password } = req.body;

  if (!name || !emailOrPhone || !password) {
    return res.status(400).json({ msg: "All fields required" });
  }

  const users = readUsers();
  if (users.find(u => u.emailOrPhone === emailOrPhone)) {
    return res.status(400).json({ msg: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: uuidv4(),
    name,
    emailOrPhone,
    password: hashedPassword,
    verified: false,
    favourites: {
      albums: [],
      songs: []
    }
  };

  users.push(newUser);
  saveUsers(users);

  console.log("🔑 OTP (demo): 123456");

  res.json({ msg: "Registered successfully. OTP sent (demo)" });
});

// VERIFY OTP
router.post("/verify", (req, res) => {
  const { emailOrPhone, otp } = req.body;

  if (otp !== "123456") {
    return res.status(400).json({ msg: "Invalid OTP" });
  }

  const users = readUsers();
  const user = users.find(u => u.emailOrPhone === emailOrPhone);

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  user.verified = true;
  saveUsers(users);

  res.json({ msg: "Account verified successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;

  const users = readUsers();
  const user = users.find(u => u.emailOrPhone === emailOrPhone);

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  if (!user.verified) {
    return res.status(401).json({ msg: "Account not verified" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ msg: "Wrong password" });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1d" });

  res.json({
    msg: "Login successful",
    token,
    user: {
      id: user.id,
      name: user.name
    }
  });
});

module.exports = router; // 🔥 THIS LINE IS MUST
