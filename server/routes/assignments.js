const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { Assignment, CareRequest, Family, Provider } = require('../models');
const { scheduleCareRequest } = require('../utils/scheduler');
const {combineDateTime}=require('../utils/scheduler')


module.exports = function(db) {
  const router = express.Router();

  // Get all assignments
  router.get('/', async (req, res) => {
    try {
      const assignments = await Assignment.findAll({
        include: [
          {
            model: CareRequest,
            as: 'careRequest',
            include: [
              {
                model: Family,
                as: 'family',
                attributes: ['name']
              }
            ]
          },
          {
            model: Provider,
            as: 'provider',
            attributes: ['name']
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Transform the data to match the expected format
      const transformedAssignments = assignments.map(assignment => ({
        id: assignment.id,
        requestId: assignment.request_id,
        providerId: assignment.provider_id,
        assignedAt: assignment.assigned_at,
        confirmedAt: assignment.confirmed_at,
        completedAt: assignment.completed_at,
        feedback: assignment.feedback,
        rating: assignment.rating,
        createdAt: assignment.created_at,
        updatedAt: assignment.updated_at,
        careType: assignment.careRequest?.care_type,
        startTime: assignment.careRequest?.start_time,
        endTime: assignment.careRequest?.end_time,
        location: assignment.careRequest?.location,
        familyName: assignment.careRequest?.family?.name,
        providerName: assignment.provider?.name
      }));

      res.json(transformedAssignments);
    } catch (err) {
      console.error('Error fetching assignments:', err);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  // Create new assignment
  // router.post('/', async (req, res) => {
  //   const {
  //     requestId,
  //     providerId,
  //     confirmedAt,
  //     completedAt,
  //     feedback,
  //     rating
  //   } = req.body;

  //   if (!requestId || !providerId) {
  //     return res.status(400).json({ error: 'Request ID and Provider ID are required' });
  //   }

  //   const id = uuidv4();

  //   try {
  //     const assignment = await Assignment.create({
  //       id,
  //       request_id: requestId,
  //       provider_id: providerId,
  //       assigned_at: new Date(),
  //       confirmed_at: confirmedAt,
  //       completed_at: completedAt,
  //       feedback,
  //       rating
  //     });

  //     // Update care request status to 'assigned'
  //     await CareRequest.update(
  //       { 
  //         status: 'assigned', 
  //         provider_id: providerId 
  //       },
  //       { 
  //         where: { id: requestId } 
  //       }
  //     );

  //     // Emit real-time update
  //     req.io.emit('assignment-created', assignment);

  //     res.status(201).json(assignment);
  //   } catch (err) {
  //     console.error('Error creating assignment:', err);
  //     res.status(500).json({ error: 'Failed to create assignment' });
  //   }
  // });
  router.post('/', async (req, res) => {
    const { requestId, providerId } = req.body;
  
    if (!requestId || !providerId) {
      return res.status(400).json({ error: 'Request ID and Provider ID are required' });
    }
  
    try {
      const request = await CareRequest.findByPk(requestId, { include: [{ model: Family, as: 'family' }] });
      if (!request) return res.status(404).json({ error: 'CareRequest not found' });

      const id = uuidv4();
      const start = combineDateTime(request.start_date, request.start_time);
      const end = combineDateTime(request.end_date, request.end_time);

      const assignment = await Assignment.create({
        id,
        request_id: request.id,
        provider_id: providerId,
        assigned_at: new Date(),
        scheduled_date: request.start_date,
        shift_start: start,
        shift_end: end,
        hours_worked: request.hours_per_day
      });

      // Update care request status
      await request.update({ status: 'assigned', provider_id: providerId });

      // Emit real-time update
      req.io.emit('assignments-created', assignment);

      res.status(201).json({ message: 'Assignment created', assignment });

    } catch (err) {
      console.error('Error creating assignments:', err);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  });

  // Update assignment
  router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      const assignment = await Assignment.findByPk(id);

      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      // Map frontend field names to database field names
      const dbUpdates = {};
      if (updates.confirmedAt !== undefined) dbUpdates.confirmed_at = updates.confirmedAt;
      if (updates.completedAt !== undefined) dbUpdates.completed_at = updates.completedAt;
      if (updates.feedback !== undefined) dbUpdates.feedback = updates.feedback;
      if (updates.rating !== undefined) dbUpdates.rating = updates.rating;

      await assignment.update(dbUpdates);

      // Update care request status if completed
      if (updates.completedAt) {
        await CareRequest.update(
          { status: 'completed' },
          { where: { id: assignment.request_id } }
        );
      }

      // Emit real-time update
      req.io.emit('assignment-updated', assignment);

      res.json(assignment);
    } catch (err) {
      console.error('Error updating assignment:', err);
      res.status(500).json({ error: 'Failed to update assignment' });
    }
  });

  return router;
};
