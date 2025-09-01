const express = require('express');
const { Op } = require('sequelize');

module.exports = function(db, models) {
  const router = express.Router();
  const { CareRequest, Provider, Family } = models;

  // Get dashboard statistics
  router.get('/stats', async (req, res) => {
    try {
      const stats = {};

      // Upcoming appointments
      stats.upcomingAppointments = await CareRequest.count({
        where: {
          status: 'confirmed',
          start_time: {
            [Op.gt]: new Date()
          }
        }
      });

      // Active providers
      stats.activeProviders = await Provider.count({
        where: {
          status: 'active'
        }
      });

      // Active families
      stats.activeFamilies = await Family.count({
        where: {
          status: 'active'
        }
      });

      // Pending requests
      stats.pendingRequests = await CareRequest.count({
        where: {
          status: 'pending'
        }
      });

      // Today's assignments
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      stats.todayAssignments = await CareRequest.count({
        where: {
          start_time: {
            [Op.gte]: startOfDay,
            [Op.lt]: endOfDay
          }
        }
      });

      res.json(stats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  });

  // Get recent care requests
  router.get('/recent-care-requests', async (req, res) => {
    try {
      const recentRequests = await CareRequest.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ model: Family, as: 'family', attributes: ['name'] }]
      });
      res.json(recentRequests);
    } catch (err) {
      console.error('Error fetching recent care requests:', err);
      res.status(500).json({ error: 'Failed to fetch recent care requests' });
    }
  });

  return router;
};
