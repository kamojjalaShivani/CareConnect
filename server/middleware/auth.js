const jwt = require('jsonwebtoken');
const { db } = require('../database/init');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET ;

const authenticateToken = (req, res, next) => {
  // Bypass authentication for development
  req.user = { id: 1, email: 'test@example.com', role: 'admin' }; // Mock user
  next();
};

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  generateToken,
  JWT_SECRET
};
