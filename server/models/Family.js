const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Family = sequelize.define('Family', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
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
  address: {
    type: DataTypes.STRING,
    allowNull: false
  },
  care_type: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('care_type');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('care_type', JSON.stringify(value || []));
    }
  },
  preferences: {
    type: DataTypes.TEXT, // JSON: {consistentProvider, genderPreference, languagePreference, specialRequests}
    defaultValue: '{}',
    get() { return JSON.parse(this.getDataValue('preferences') || '{}'); },
    set(v) { this.setDataValue('preferences', JSON.stringify(v || {})); }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'families',
  timestamps: true
});

module.exports = Family;