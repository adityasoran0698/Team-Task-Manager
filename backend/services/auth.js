const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;
const generateToken = (user) => {
  const payload = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, secret);
};

const validateToken = (token) => {
  if (!token) return null;
  return jwt.verify(token, secret);
};
module.exports = { generateToken, validateToken };
