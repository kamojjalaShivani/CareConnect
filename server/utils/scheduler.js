const { Provider, Assignment, CareRequest } = require('../models');
const { Op } = require('sequelize');
const { parseISO, isSameDay } = require('date-fns');

//Get all dates between start_date and end_date in care request
function getDateRange(startDate, endDate) {
  const dates = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates
}

//Function to combine date+time to full datetime
function combineDateTime(date, timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const dt = new Date(date);
  dt.setHours(hours, minutes, 0, 0)
  return dt;
}


//  Helper: Parse time string "HH:mm" to minutes since midnight

function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// 🔹 Helper: Calculate request duration in hours
function getRequestHours(request) {
  const startMins = timeToMinutes(request.start_time);
  const endMins = timeToMinutes(request.end_time);

  // Handle overnight shifts (end time is next day)
  let duration = endMins - startMins;
  if (duration <= 0) {
    duration += 24 * 60; // Add 24 hours in minutes
  }

  return duration / 60; // Convert to hours
}

// Check if provider is available for this request (shift type & hours)
function checkAvailability(provider, request, date) {
  const dayMap = [0, 1, 2, 3, 4, 5, 6]; 
  const reqDay = date.getDay(); // JavaScript getDay() returns 0-6

  return provider.availability.some(slot => {
    if (slot.dayOfWeek !== reqDay) return false;
    if (slot.shiftType !== request.support_type) return false;

    // Special case for 24/7 shifts
    if (slot.shiftType === '24_7') {
      return request.hours_per_day === 24;
    }

    const slotStartMins = timeToMinutes(slot.startTime);
    const slotEndMins = timeToMinutes(slot.endTime);
    const reqStartMins = timeToMinutes(request.start_time);
    const reqEndMins = timeToMinutes(request.end_time);

    // Handle overnight shifts for requests
    let adjustedReqEndMins = reqEndMins;
    if (reqEndMins <= reqStartMins) {
      adjustedReqEndMins += 24 * 60; // Add 24 hours if overnight
    }

    // Handle overnight slots
    let adjustedSlotEndMins = slotEndMins;
    if (slotEndMins <= slotStartMins) {
      adjustedSlotEndMins += 24 * 60; // Add 24 hours if overnight
    }

    return reqStartMins >= slotStartMins && adjustedReqEndMins <= adjustedSlotEndMins;
  });
}

// 🔹 Check provider time offs
function checkTimeOffs(provider, request, date) {
  const reqDate = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format

  return provider.timeOffs.some(to => {
    const offStart = to.startDate;
    const offEnd = to.endDate;
    return reqDate >= offStart && reqDate <= offEnd;
  });
}

// 🔹 Calculate provider's weekly worked hours
async function calculateWeeklyHours(providerId, request) {
  const start = new Date(request.start_date);
  const weekStart = new Date(start);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const assignments = await Assignment.findAll({
    include: [{ model: CareRequest, as: 'careRequest' }],
    where: { provider_id: providerId }
  });

  return assignments.reduce((sum, a) => {
    const r = a.careRequest;
    const assignmentDate = new Date(r.start_date);
    if (assignmentDate >= weekStart && assignmentDate < weekEnd) {
      sum += getRequestHours(r);
    }
    return sum;
  }, 0);
}

// 🔹 Check schedule conflicts
async function checkConflict(provider, request, date) {
  const reqDate = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
  const reqStartMins = timeToMinutes(request.start_time);
  const reqEndMins = timeToMinutes(request.end_time);

  const assignments = await Assignment.findAll({
    include: [{ model: CareRequest, as: 'careRequest' }],
    where: { provider_id: provider.id }
  });

  return assignments.some(a => {
    const r = a.careRequest;
    const assignmentDate = r.start_date;

    // Only check conflicts on the same date
    if (assignmentDate !== reqDate) return false;

    const existingStartMins = timeToMinutes(r.start_time);
    const existingEndMins = timeToMinutes(r.end_time);

    return (
      (reqStartMins >= existingStartMins && reqStartMins < existingEndMins) ||
      (reqEndMins > existingStartMins && reqEndMins <= existingEndMins) ||
      (reqStartMins <= existingStartMins && reqEndMins >= existingEndMins)
    );
  });
}

// 🔹 Main Scheduling Algorithm
// async function scheduleCareRequest(request, family) {
//   const providers = await Provider.findAll({ where: { status: 'active' } });
//   const candidates = [];
//   const requestDate = new Date(request.start_date);

//   for (const provider of providers) {
//     let score = 0;
//     const reasons = [];
//     const warnings = [];

//     // 1. Specialty match
//     if (!provider.specialties.includes(request.care_type)) {
//       warnings.push("Specialty not matched");
//       continue; // skip this provider
//     } else {
//       score += 40;
//       reasons.push("Specialty matched");
//     }

//     // 2. Availability
//     if (!checkAvailability(provider, request, requestDate)) {
//       warnings.push("Not available for requested time");
//       continue; // hard filter
//     } else {
//       score += 20;
//       reasons.push("Available at requested time");
//     }

//     // 3. Time Off
//     if (checkTimeOffs(provider, request, requestDate)) {
//       warnings.push("Provider is on time off");
//       continue; // hard filter
//     }

//     // 4. Weekly Hours
//     const weeklyHours = await calculateWeeklyHours(provider.id, request);
//     const reqHours = getRequestHours(request);
//     if (weeklyHours + reqHours > provider.maxWeeklyHours) {
//       warnings.push("Exceeds weekly max hours");
//       continue; // hard filter
//     } else {
//       score += 15;
//       reasons.push("Within weekly hour limit");
//     }

//     // 5. Conflict Detection
//     const conflict = await checkConflict(provider, request, requestDate);
//     if (conflict) {
//       warnings.push("Schedule conflict with another assignment");
//       continue; // hard filter
//     }

//     // 6. Consistency bonus
//     if (family.preferences.consistentProvider) {
//       const pastAssignment = await Assignment.findOne({
//         where: { provider_id: provider.id },
//         include: [{ model: CareRequest, as: 'careRequest', where: { family_id: family.id } }]
//       });
//       if (pastAssignment) {
//         score += 25;
//         reasons.push("Previously worked with this family");
//       }
//     }

//     // 7. Rating
//     if (provider.rating >= 4.8) score += 20;
//     else if (provider.rating >= 4.5) score += 15;
//     else if (provider.rating >= 4.0) score += 10;

//     candidates.push({ provider, score, reasons, warnings });
//   }

//   candidates.sort((a, b) => b.score - a.score);

//   return {
//     mode: "consistent", // Always try consistent assignment first
//     suggestions: candidates
//   };
// }

async function scheduleCareRequest(request, family) {
  console.log("Running scheduler for request:", {
    requestId: request.id,
    careType: request.care_type,
    supportType: request.support_type,
    startDate: request.start_date,
    startTime: request.start_time,
    endDate: request.end_date,
    endTime: request.end_time,
    family: family?.name
  });

  const providers = await Provider.findAll({ where: { status: 'active' } });
  console.log(`Found ${providers.length} active providers`);

  const candidates = [];
  const requestDate = new Date(request.start_date);

  for (const provider of providers) {
    let score = 0;
    const reasons = [];
    const warnings = [];

    console.log(` Evaluating provider: ${provider.name} (${provider.specialties.join(", ")})`);

    // 1. Specialty match
    const providerSpecialties = Array.isArray(provider.specialties)
      ? provider.specialties
      : typeof provider.specialties === 'string'
        ? provider.specialties.split(',').map(s => s.trim().toLowerCase())
        : [];

    if (!providerSpecialties.includes(request.care_type.toLowerCase())) {
      warnings.push("Specialty not matched");
      console.log(`Skipped ${provider.name} - Specialty not matched (needed: ${request.care_type})`);
      continue;
    } else {
      score += 40;
      reasons.push("Specialty matched");
      console.log(`Specialty matched (${request.care_type})`);
    }


    // 2. Availability
    if (!checkAvailability(provider, request, requestDate)) {
      warnings.push("Not available for requested time");
      console.log(`Skipped ${provider.name} - Not available at ${request.start_time} to ${request.end_time} on ${requestDate}`);
      continue; // hard filter
    } else {
      score += 20;
      reasons.push("Available at requested time");
      console.log(` Available at requested time`);
    }

    // 3. Time Off
    if (checkTimeOffs(provider, request, requestDate)) {
      warnings.push("Provider is on time off");
      console.log(`Skipped ${provider.name} - On time off for ${requestDate}`);
      continue; // hard filter
    }

    // 4. Weekly Hours
    const weeklyHours = await calculateWeeklyHours(provider.id, request);
    const reqHours = getRequestHours(request);
    console.log(`${provider.name} has ${weeklyHours} hrs already scheduled, request needs ${reqHours} hrs`);

    if (weeklyHours + reqHours > provider.maxWeeklyHours) {
      warnings.push("Exceeds weekly max hours");
      console.log(` Skipped ${provider.name} - Exceeds weekly max (${weeklyHours + reqHours} > ${provider.maxWeeklyHours})`);
      continue; // hard filter
    } else {
      score += 15;
      reasons.push("Within weekly hour limit");
      console.log(`Within weekly hours (total ${weeklyHours + reqHours}/${provider.maxWeeklyHours})`);
    }

    // 5. Conflict Detection
    const conflict = await checkConflict(provider, request, requestDate);
    if (conflict) {
      warnings.push("Schedule conflict with another assignment");
      console.log(`Skipped ${provider.name} - Conflict with another assignment`);
      continue; // hard filter
    }

    // 6. Consistency bonus
    if (family.preferences.consistentProvider) {
      const pastAssignment = await Assignment.findOne({
        where: { provider_id: provider.id },
        include: [{ model: CareRequest, as: 'careRequest', where: { family_id: family.id } }]
      });
      if (pastAssignment) {
        score += 25;
        reasons.push("Previously worked with this family");
        console.log(`✔️ Bonus: Worked with ${family.name} before`);
      }
    }

    // 7. Rating
    if (provider.rating >= 4.8) {
      score += 20;
      console.log(`Rating bonus: Excellent (>=4.8)`);
    } else if (provider.rating >= 4.5) {
      score += 15;
      console.log(`Rating bonus: Good (>=4.5)`);
    } else if (provider.rating >= 4.0) {
      score += 10;
      console.log(`Rating bonus: Fair (>=4.0)`);
    }

    console.log(`Candidate ${provider.name} - Final Score: ${score}`);

    candidates.push({ provider, score, reasons, warnings });
  }

  candidates.sort((a, b) => b.score - a.score);

  console.log(`Scheduling result for request ${request.id}: ${candidates.length} candidates`);
  candidates.forEach(c => {
    console.log(`  -> ${c.provider.name} | Score: ${c.score} | Reasons: ${c.reasons.join(", ")} | Warnings: ${c.warnings.join(", ")}`);
  });

  return {
    mode: "consistent", // Always try consistent assignment first
    suggestions: candidates
  };
}


module.exports = { scheduleCareRequest, getDateRange, combineDateTime };
