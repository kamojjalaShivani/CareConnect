const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isTenDigits(value) {
        if (!/^\d{10}$/.test(value)) {
          throw new Error("Phone number must be a 10-digit number");
        }
      }
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'coordinator', 'provider'),
    allowNull: false,
    defaultValue: 'coordinator'
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;