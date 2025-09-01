const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assignment = sequelize.define('Assignment', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  request_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'care_requests',
      key: 'id'
    }
  },
  provider_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'providers',
      key: 'id'
    }
  },
  scheduled_date: {
    type: DataTypes.DATEONLY, 
    allowNull: false
  },
  shift_start: {
    type: DataTypes.TIME,
    allowNull: false
  },
  shift_end: {
    type: DataTypes.TIME,
    allowNull: false
  },
  hours_worked: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  assigned_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  confirmed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: 0,
      max: 5
    }
  }
}, {
  tableName: 'assignments',
  timestamps: true
});

module.exports = Assignment;