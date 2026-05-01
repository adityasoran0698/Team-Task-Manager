const express = require("express");
const User = require("../models/user.js");

const router = express.Router();
const { validateToken } = require("../services/auth.js");
router.post("/register", async (req, res) => {
  const body = req.body;
  try {
    const user = {
      fullname: body.fullname,
      email: body.email,
      password: body.password,
      phoneNumber: body.phoneNumber,
      role: body.role,
    };
    await User.create(user);
    return res.status(200).send("User registered Successfully");
  } catch (error) {
    // 👈 ADD THIS

    return res.status(400).send("Registration Failed!");
  }
});
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token, unauthorized" });
    }

    const user = await validateToken(token);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("Error in /me:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found! Register yourself" });
    }

    let token;
    try {
      token = await User.matchPasswordAndGenerateToken(email, password);
    } catch (err) {
      return res.status(400).json({ message: "Incorrect email or password" });
    }

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return res.status(200).send("Login Successful");
  } catch (error) {
    return res.status(500).send("Login Failed!");
  }
});
router.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res.json({ message: "Logged Out Successfully!" });
  } catch (error) {
    return res.json({ message: "Error in logout" });
  }
});
module.exports = router;
