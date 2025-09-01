const express = require('express');
const { v4: uuidv4 } = require('uuid');

module.exports = function(db, models) {
  const router = express.Router();
  const { Family } = models;

  // Get all families
  router.get('/', async (req, res) => {
    try {
      const families = await Family.findAll({
        order: [['created_at', 'DESC']]
      });

      res.json(families);
    } catch (err) {
      console.error('Error fetching families:', err);
      res.status(500).json({ error: 'Failed to fetch families' });
    }
  });

  // Get family by ID
  router.get('/:id', async (req, res) => {
    try {
      const family = await Family.findByPk(req.params.id);

      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      res.json(family);
    } catch (err) {
      console.error('Error fetching family:', err);
      res.status(500).json({ error: 'Failed to fetch family' });
    }
  });

  // Create new family
  router.post('/', async (req, res) => {
    const {
      name,
      email,
      phone,
      address,
      care_type,
      preferences = {},
      status = 'active'
    } = req.body;

    if (!name || !email || !phone || !address) {
      return res.status(400).json({ error: 'Name, email, phone, and address are required' });
    }

    const id = uuidv4();

    try {
      const family = await Family.create({
        id,
        name,
        email,
        phone,
        address,
        care_type: care_type || [],
        preferences,
        status
      });

      // Emit real-time update
      req.io.emit('family-created', family);

      res.status(201).json(family);
    } catch (err) {
      console.error('Error creating family:', err);
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Family with this email already exists' });
      }
      res.status(500).json({ error: 'Failed to create family' });
    }
  });

  // Update family
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const family = await Family.findByPk(id);

      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      await family.update(updates);

      // Emit real-time update
      req.io.emit('family-updated', family);

      res.json(family);
    } catch (err) {
      console.error('Error updating family:', err);
      res.status(500).json({ error: 'Failed to update family' });
    }
  });

  // Delete family
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const family = await Family.findByPk(id);

      if (!family) {
        return res.status(404).json({ error: 'Family not found' });
      }

      await family.destroy();

      // Emit real-time update
      req.io.emit('family-deleted', { id });

      res.status(204).send();
    } catch (err) {
      console.error('Error deleting family:', err);
      res.status(500).json({ error: 'Failed to delete family' });
    }
  });

  return router;
};
