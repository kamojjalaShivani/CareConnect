const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(db, models) {
  const router = express.Router();
  const { User } = models;

  // Login endpoint
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      console.log('Auth route: Login attempt for email:', email);
      
      if (!email || !password) {
        console.log('Auth route: Missing email or password');
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await User.findOne({ where: { email } });
      
      console.log('Auth route: User found in database:', user ? 'YES' : 'NO');
      if (user) {
        console.log('Auth route: User details:', {
          id: user.id,
          email: user.email,
          role: user.role,
          hasPasswordHash: !!user.password_hash
        });
      }

      if (!user) {
        console.log('Auth route: No user found with email:', email);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      console.log('Auth route: Comparing passwords...');
      console.log('Auth route: Provided password:', password);
      console.log('Auth route: Stored hash:', user.password_hash);

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        console.log('Auth route: Password comparison failed');
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      console.log('Auth route: Password comparison successful');

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET ,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Auth route: Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get current user
  router.get('/me', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findByPk(decoded.userId, {
        attributes: ['id', 'email', 'name', 'role']
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Auth route: Get user error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  return router;
};
