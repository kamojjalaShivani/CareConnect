const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { scheduleCareRequest } = require('../utils/scheduler');
const { Assignment, CareRequest, Family, Provider } = require('../models');


module.exports = function(db) {
  const router = express.Router();
  

  // Get all care requests with family and provider data
  router.get('/', async (req, res) => {
    try {
      const careRequests = await CareRequest.findAll({
        include: [
          {
            model: Family,
            as: 'family',
            attributes: ['id', 'name', 'email', 'phone', 'address', 'care_type', 'preferences', 'status']
          },
          {
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'email', 'phone', 'specialties', 'rating', 'status', 'location'],
            required: false
          },
          {
            model: Provider,
            as: 'preferredProvider',
            attributes: ['id', 'name', 'email', 'phone', 'specialties', 'rating', 'status', 'location'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Transform the data to match the expected format
      const transformedRequests = careRequests.map(request => {
        const plainRequest = request.get({ plain: true });
        return {
          id: plainRequest.id,
          familyId: plainRequest.family_id,
          providerId: plainRequest.provider_id,
          careType: plainRequest.care_type,
          supportType: plainRequest.support_type,
          preferredProviderId: plainRequest.preferred_provider_id,
          startDate: plainRequest.start_date,
          endDate: plainRequest.end_date,
          startTime: plainRequest.start_time,
          endTime: plainRequest.end_time,
          hoursPerDay: plainRequest.hours_per_day,
          status: plainRequest.status,
          priority: plainRequest.priority,
          notes: plainRequest.notes,
          requiresConsistency: plainRequest.requires_consistency,
          location: plainRequest.location,
          createdAt: plainRequest.createdAt,
          updatedAt: plainRequest.updatedAt,
          family: plainRequest.family,
          provider: plainRequest.provider,
          preferredProvider: plainRequest.preferredProvider,
        };
      });

      res.json(transformedRequests);
    } catch (err) {
      console.error('Error fetching care requests:', err);
      res.status(500).json({ error: 'Failed to fetch care requests' });
    }
  });

  // Get care request by ID
  router.get('/:id', async (req, res) => {
    try {
      const careRequest = await CareRequest.findByPk(req.params.id, {
        include: [
          {
            model: Family,
            as: 'family',
            attributes: ['id', 'name', 'email', 'phone', 'address', 'care_type', 'preferences', 'status']
          },
          {
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'email', 'phone', 'specialties', 'rating', 'status', 'location'],
            required: false
          },
          {
            model: Provider,
            as: 'preferredProvider',
            attributes: ['id', 'name', 'email', 'phone', 'specialties', 'rating', 'status', 'location'],
            required: false
          }
        ]
      });

      if (!careRequest) {
        return res.status(404).json({ error: 'Care request not found' });
      }

      // Transform the data to match the expected format
      const plainRequest = careRequest.get({ plain: true });
      const transformedRequest = {
        id: plainRequest.id,
        familyId: plainRequest.family_id,
        providerId: plainRequest.provider_id,
        careType: plainRequest.care_type,
        supportType: plainRequest.support_type,
        preferredProviderId: plainRequest.preferred_provider_id,
        startDate: plainRequest.start_date,
        endDate: plainRequest.end_date,
        startTime: plainRequest.start_time,
        endTime: plainRequest.end_time,
        hoursPerDay: plainRequest.hours_per_day,
        status: plainRequest.status,
        priority: plainRequest.priority,
        notes: plainRequest.notes,
        requiresConsistency: plainRequest.requires_consistency,
        location: plainRequest.location,
        createdAt: plainRequest.createdAt,
        updatedAt: plainRequest.updatedAt,
        family: plainRequest.family,
        provider: plainRequest.provider,
        preferredProvider: plainRequest.preferredProvider,
      };

      res.json(transformedRequest);
    } catch (err) {
      console.error('Error fetching care request:', err);
      res.status(500).json({ error: 'Failed to fetch care request' });
    }
  });

  // Create new care request
  router.post('/', async (req, res) => {
    const {
      familyId,
      providerId,
      careType,
      supportType,
      preferredProviderId,
      startDate,
      endDate,
      startTime,
      endTime,
      hoursPerDay,
      status = 'pending',
      priority = 'medium',
      notes,
      requiresConsistency = false,
      location
    } = req.body;

    if (!familyId || !careType || !supportType || !startDate || !endDate || !startTime || !endTime || !hoursPerDay || !location) {
      return res.status(400).json({ error: 'Family ID, care type, support type, start date, end date, start time, end time, hours per day, and location are required' });
    }

    const id = uuidv4();

    try {
      const careRequest = await CareRequest.create({
        id,
        family_id: familyId,
        provider_id: providerId,
        care_type: careType,
        support_type: supportType,
        preferred_provider_id: preferredProviderId,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        hours_per_day: hoursPerDay,
        status,
        priority,
        notes,
        requires_consistency: requiresConsistency,
        location
      });

      // Emit real-time update
      req.io.emit('care-request-created', careRequest);

      res.status(201).json(careRequest);
    } catch (err) {
      console.error('Error creating care request:', err);
      res.status(500).json({ error: 'Failed to create care request' });
    }
  });

  // Update care request
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const careRequest = await CareRequest.findByPk(id);

      if (!careRequest) {
        return res.status(404).json({ error: 'Care request not found' });
      }

      // Map frontend field names to database field names
      const dbUpdates = {};
      if (updates.familyId !== undefined) dbUpdates.family_id = updates.familyId;
      if (updates.providerId !== undefined) dbUpdates.provider_id = updates.providerId;
      if (updates.careType !== undefined) dbUpdates.care_type = updates.careType;
      if (updates.supportType !== undefined) dbUpdates.support_type = updates.supportType;
      if (updates.preferredProviderId !== undefined) dbUpdates.preferred_provider_id = updates.preferredProviderId;
      if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
      if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.hoursPerDay !== undefined) dbUpdates.hours_per_day = updates.hoursPerDay;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.requiresConsistency !== undefined) dbUpdates.requires_consistency = updates.requiresConsistency;
      if (updates.location !== undefined) dbUpdates.location = updates.location;

      await careRequest.update(dbUpdates);

      // Fetch updated care request with relations
      const updatedRequest = await CareRequest.findByPk(id, {
        include: [
          {
            model: Family,
            as: 'family',
            attributes: ['id', 'name', 'email', 'phone', 'address', 'care_type', 'preferences', 'status']
          },
          {
            model: Provider,
            as: 'provider',
            attributes: ['id', 'name', 'email', 'phone', 'specialties', 'rating', 'status', 'location'],
            required: false
          },
          {
            model: Provider,
            as: 'preferredProvider',
            attributes: ['id', 'name', 'email', 'phone', 'specialties', 'rating', 'status', 'location'],
            required: false
          }
        ]
      });

      // Transform the data to match the expected format
      const plainRequest = updatedRequest.get({ plain: true });
      const transformedRequest = {
        id: plainRequest.id,
        familyId: plainRequest.family_id,
        providerId: plainRequest.provider_id,
        careType: plainRequest.care_type,
        supportType: plainRequest.support_type,
        preferredProviderId: plainRequest.preferred_provider_id,
        startDate: plainRequest.start_date,
        endDate: plainRequest.end_date,
        startTime: plainRequest.start_time,
        endTime: plainRequest.end_time,
        hoursPerDay: plainRequest.hours_per_day,
        status: plainRequest.status,
        priority: plainRequest.priority,
        notes: plainRequest.notes,
        requiresConsistency: plainRequest.requires_consistency,
        location: plainRequest.location,
        createdAt: plainRequest.createdAt,
        updatedAt: plainRequest.updatedAt,
        family: plainRequest.family,
        provider: plainRequest.provider,
        preferredProvider: plainRequest.preferredProvider,
      };

      // Emit real-time update
      req.io.emit('care-request-updated', transformedRequest);

      res.json(transformedRequest);
    } catch (err) {
      console.error('Error updating care request:', err);
      res.status(500).json({ error: 'Failed to update care request' });
    }
  });

  // Delete care request
  router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
      const careRequest = await CareRequest.findByPk(id);

      if (!careRequest) {
        return res.status(404).json({ error: 'Care request not found' });
      }

      await careRequest.destroy();

      // Emit real-time update
      req.io.emit('care-request-deleted', { id });

      res.status(204).send();
    } catch (err) {
      console.error('Error deleting care request:', err);
      res.status(500).json({ error: 'Failed to delete care request' });
    }
  });

// Get provider matches for a care request
router.get('/:id/match', async (req, res) => {
  try {
    const { id } = req.params;
    

    const request = await CareRequest.findByPk(id, {
      include: [{ model: Family, as: 'family' }]
    });

    if (!request) {
      return res.status(404).json({ error: 'CareRequest not found' });
    }

    // Run the scheduling algorithm
    const result = await scheduleCareRequest(request, request.family);

    res.json(result);
  } catch (err) {
    console.error('Error running scheduler:', err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});


  return router;
};
