const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const { generateToken } = require("../services/auth.js");

const UserSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
});

UserSchema.pre("save", async function () {
  const user = this;

  if (!user.isModified("password")) return;

  user.password = await bcryptjs.hash(user.password, 10);
});

UserSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) throw new Error("User Not Found!");

    const isMatch = bcryptjs.compareSync(password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect email or password");
    }
    return generateToken(user);
  },
);

const User = mongoose.model("user", UserSchema);
module.exports = User;