const sequelize = require('../config/database');
const User = require('./User');
const Provider = require('./Provider');
const Family = require('./Family');
const CareRequest = require('./CareRequest');
const Assignment = require('./Assignment');

// Define associations
CareRequest.belongsTo(Family, { foreignKey: 'family_id', as: 'family' });
CareRequest.belongsTo(Provider, { foreignKey: 'provider_id', as: 'provider' });
CareRequest.belongsTo(Provider, { foreignKey: 'preferred_provider_id', as: 'preferredProvider' });
Family.hasMany(CareRequest, { foreignKey: 'family_id', as: 'careRequests' });
Provider.hasMany(CareRequest, { foreignKey: 'provider_id', as: 'careRequests' });

Assignment.belongsTo(CareRequest, { foreignKey: 'request_id', as: 'careRequest' });
Assignment.belongsTo(Provider, { foreignKey: 'provider_id', as: 'provider' });
CareRequest.hasMany(Assignment, { foreignKey: 'request_id', as: 'assignments' });
Provider.hasMany(Assignment, { foreignKey: 'provider_id', as: 'assignments' });

User.hasOne(Provider, { foreignKey: 'user_id', as: 'providerProfile' });
Provider.belongsTo(User, { foreignKey: 'user_id', as: 'userAccount' });


module.exports = {
  sequelize,
  User,
  Provider,
  Family,
  CareRequest,
  Assignment
};
