const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User')

const Provider = sequelize.define('Provider', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE' // if user is deleted, provider is deleted too
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
  specialties: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('specialties');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('specialties', JSON.stringify(value || []));
    }
  },
  maxWeeklyHours: 
  { type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 40 
  },
  minWeeklyHours: 
  { type: DataTypes.INTEGER, 
    allowNull: false, 
    defaultValue: 20 
  },
  rating: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 5.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  availability: {
    type: DataTypes.TEXT, 
    defaultValue: '[]',
    get() { return JSON.parse(this.getDataValue('availability') || '[]'); },
    set(v) {
      if (!Array.isArray(v)) throw new Error("Availability must be an array");

      v.forEach(slot => {
        const [sh, sm] = slot.startTime.split(':').map(Number);
        const [eh, em] = slot.endTime.split(':').map(Number);

        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        // Special case: 24/7
        if (slot.shiftType === '24_7') {
          if (!(slot.startTime === '00:00' && slot.endTime === '23:59')) {
            throw new Error("24/7 shift must be exactly 00:00–23:59");
          }
          return;
        }

        // Duration (handle overnight wrap)
        let duration = endMinutes - startMinutes;
        console.log('duration',duration);
        if (duration <= 0) duration += 24 * 60; // Handle overnight shifts that wrap around midnight

        if (slot.shiftType === 'overnight') {
          if (duration < 480 || duration > 720) { // 480 minutes = 8 hrs, 720 minutes = 12 hrs
            throw new Error(`Overnight shift duration must be between 8 and 12 hours. Current duration: ${duration} minutes.`);
          }
        } else if (slot.shiftType === 'daytime') {
          if (duration !== 480) { // Daytime shifts must be exactly 8 hours
            throw new Error(`Daytime shift must be exactly 8 hours. Current duration: ${duration} minutes.`);
          }
        }

        if (slot.shiftType === 'daytime' && (sh < 6 || sh > 12)) {
          throw new Error("Daytime shift must start between 06:00 and 12:00");
        }

        if (slot.shiftType === 'overnight' && (sh >= 6 && sh < 18)) {
          throw new Error("Overnight shift must start between 18:00 and 06:00");
        }
      });

      this.setDataValue('availability', JSON.stringify(v || []));
    }
  },
  timeOffs: {
    type: DataTypes.TEXT, 
    defaultValue: '[]',
    get() { return JSON.parse(this.getDataValue('timeOffs') || '[]'); },
    set(v) { this.setDataValue('timeOffs', JSON.stringify(v || [])); }
  },
  preferences: {
    type: DataTypes.TEXT, 
    defaultValue: JSON.stringify({
      travelRadius: 15,
      support24_7: false,
      maxWeeklyHours24_7: 80
    }),
    get() { return JSON.parse(this.getDataValue('preferences') || '{}'); },
    set(v) { this.setDataValue('preferences', JSON.stringify(v || {})); }
  }

},  {
  tableName: 'providers',
  timestamps: true
});

module.exports = Provider;
