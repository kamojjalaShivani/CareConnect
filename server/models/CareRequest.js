const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CareRequest = sequelize.define('CareRequest', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  family_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'families',
      key: 'id'
    }
  },
  provider_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'providers',
      key: 'id'
    }
  },
  care_type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  support_type: {
    type: DataTypes.ENUM('daytime', 'overnight', '24_7'),
    allowNull: false
  },
  preferred_provider_id: {
    type: DataTypes.STRING,
    allowNull: true,
    references: { model: 'providers', key: 'id' }
  },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },  // e.g., "2025-09-01"
  end_date:   { type: DataTypes.DATEONLY, allowNull: false },  // e.g., "2025-09-07"

  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hours_per_day: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isValidHours(value) {
        if (value <= 0) throw new Error("Requested hours must be greater than 0");

        // Enforce rules based on support_type
        if (this.support_type === 'daytime' && value > 8) {
          throw new Error("Daytime requests cannot exceed 8 hours per day");
        }
        if (this.support_type === 'overnight' && value > 8) {
          throw new Error("Overnight requests cannot exceed 8 hours per day");
        }
        if (this.support_type === '24_7' && value !== 24) {
          throw new Error("24/7 requests must be exactly 24 hours");
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'assigned', 'confirmed', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  requires_consistency: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'care_requests',
  timestamps: true
});

module.exports = CareRequest;
