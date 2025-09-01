const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = function(db, models) {
  const router = express.Router();
  const { Provider } = models;

  // Get all providers
  router.get('/', async (req, res) => {
    try {
      const providers = await Provider.findAll({
        order: [['created_at', 'DESC']]
      });

      res.json(providers);
    } catch (err) {
      console.error('Error fetching providers:', err);
      res.status(500).json({ error: 'Failed to fetch providers' });
    }
  });

  // Get provider by ID
  router.get('/:id', async (req, res) => {
    try {
      const provider = await Provider.findByPk(req.params.id);

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      res.json(provider);
    } catch (err) {
      console.error('Error fetching provider:', err);
      res.status(500).json({ error: 'Failed to fetch provider' });
    }
  });

  // Create new provider
  router.post('/', async (req, res) => {
    const {
      user_id,
      name,
      email,
      phone,
      specialties,
      maxWeeklyHours,
      minWeeklyHours,
      rating = 5.0,
      status = 'active',
      location,
      availability = [],
      timeOffs = [],
      preferences = {}
    } = req.body;

    if (!name || !email || !phone || !location || maxWeeklyHours === undefined || minWeeklyHours === undefined) {
      return res.status(400).json({ error: 'Name, email, phone, location, maxWeeklyHours, and minWeeklyHours are required' });
    }

    const id = uuidv4();

    try {
      const provider = await Provider.create({
        id,
        user_id,
        name,
        email,
        phone,
        specialties: specialties || [],
        maxWeeklyHours,
        minWeeklyHours,
        rating,
        status,
        location,
        availability,
        timeOffs,
        preferences
      });

      // Emit real-time update
      req.io.emit('provider-created', provider);

      res.status(201).json(provider);
    } catch (err) {
      console.error('Error creating provider:', err);
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Provider with this email already exists' });
      }
      res.status(500).json({ error: 'Failed to create provider' });
    }
  });

  // Update provider
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const provider = await Provider.findByPk(id);

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      await provider.update(updates);

      // Emit real-time update
      req.io.emit('provider-updated', provider);

      res.json(provider);
    } catch (err) {
      console.error('Error updating provider:', err);
      res.status(500).json({ error: 'Failed to update provider' });
    }
  });

  // Delete provider
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const provider = await Provider.findByPk(id);

      if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
      }

      await provider.destroy();

      // Emit real-time update
      req.io.emit('provider-deleted', { id });

      res.status(204).send();
    } catch (err) {
      console.error('Error deleting provider:', err);
      res.status(500).json({ error: 'Failed to delete provider' });
    }
  });

  return router;
};
