const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User, Provider, Family, CareRequest, Assignment } = require('../models');

async function initDatabase() {
  try {
    console.log('Database: Connecting to SQLite with Sequelize...');
    
    // Test the connection
    await sequelize.authenticate();
    console.log('Database: Connection established successfully');
    
    // Sync all models (create tables if they don't exist)
    await sequelize.sync({ force: false });
    console.log('Database: All models synchronized');
    
    // Insert sample data
    await insertSampleData();
    
    console.log('Database: Initialization complete');
    return sequelize;
  } catch (error) {
    console.error('Database: Initialization error:', error);
    throw error;
  }
}



async function insertSampleData() {
  console.log('Database: Inserting Seattle sample data...');

  try {
    // Families
    const families = [
      {
        id: 'family-sea-1',
        name: 'Johnson Family',
        email: 'johnson@example.com',
        phone: '5551111111',
        address: '123 Pike St, Seattle, WA',
        care_type: ['doula'],
        preferences: {
          consistentProvider: true,
          genderPreference: 'female',
          languagePreference: 'English',
          specialRequests: 'Postpartum doula preferred'
        },
        status: 'active'
      },
      {
        id: 'family-sea-2',
        name: 'Martinez Family',
        email: 'martinez@example.com',
        phone: '5552222222',
        address: '456 Pine St, Seattle, WA',
        care_type: ['lactation'],
        preferences: {
          consistentProvider: false,
          languagePreference: 'English',
          specialRequests: 'Breastfeeding guidance'
        },
        status: 'active'
      },
      {
        id: 'family-sea-3',
        name: 'Nguyen Family',
        email: 'nguyen@example.com',
        phone: '5553333333',
        address: '789 Oak St, Seattle, WA',
        care_type: ['newborn'],
        preferences: {
          consistentProvider: true,
          languagePreference: 'English',
          specialRequests: 'Overnight newborn care'
        },
        status: 'active'
      },
      {
        id: 'family-sea-4',
        name: 'Brown Family',
        email: 'brown@example.com',
        phone: '5554444444',
        address: '321 Cedar St, Seattle, WA',
        care_type: ['nurse'],
        preferences: {
          consistentProvider: false,
          languagePreference: 'English',
          specialRequests: 'Regular medical checks'
        },
        status: 'active'
      }
    ];
    await Family.bulkCreate(families, { ignoreDuplicates: true });

    // Providers
    const providers = [
      // Doulas
      {
        id: 'provider-sea-d1',
        name: 'Doula Anna',
        email: 'anna.doula@example.com',
        phone: '5556100001',
        specialties: ['doula'],
        maxWeeklyHours: 40,
        minWeeklyHours: 10,
        rating: 4.8,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', shiftType: 'daytime' },
          { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', shiftType: 'daytime' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 20 }
      },
      {
        id: 'provider-sea-d2',
        name: 'Doula Maria',
        email: 'maria.doula@example.com',
        phone: '5556100002',
        specialties: ['doula'],
        maxWeeklyHours: 40,
        minWeeklyHours: 10,
        rating: 4.9,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 2, startTime: '20:00', endTime: '06:00', shiftType: 'overnight' },
          { dayOfWeek: 4, startTime: '20:00', endTime: '06:00', shiftType: 'overnight' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 20 }
      },
      {
        id: 'provider-sea-d3',
        name: 'Doula Emily',
        email: 'emily.doula@example.com',
        phone: '5556100003',
        specialties: ['doula'],
        maxWeeklyHours: 30,
        minWeeklyHours: 10,
        rating: 4.7,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 5, startTime: '08:00', endTime: '16:00', shiftType: 'daytime' }
        ],
        timeOffs: [{ startDate: '2025-09-03', endDate: '2025-09-03', reason: 'Personal leave' }],
        preferences: { travelRadius: 15 }
      },
      {
        id: 'provider-sea-d4',
        name: 'Doula Sarah',
        email: 'sarah.doula@example.com',
        phone: '5556100004',
        specialties: ['doula'],
        maxWeeklyHours: 40,
        minWeeklyHours: 20,
        rating: 4.6,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 6, startTime: '20:00', endTime: '06:00', shiftType: 'overnight' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      // Lactation
      {
        id: 'provider-sea-l1',
        name: 'Lactation Kelly',
        email: 'kelly.lact@example.com',
        phone: '5556101001',
        specialties: ['lactation'],
        maxWeeklyHours: 30,
        minWeeklyHours: 10,
        rating: 4.7,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', shiftType: 'daytime' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      {
        id: 'provider-sea-l2',
        name: 'Lactation Amy',
        email: 'amy.lact@example.com',
        phone: '5556101002',
        specialties: ['lactation'],
        maxWeeklyHours: 30,
        minWeeklyHours: 10,
        rating: 4.6,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 2, startTime: '20:00', endTime: '06:00', shiftType: 'overnight' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      {
        id: 'provider-sea-l3',
        name: 'Lactation Laura',
        email: 'laura.lact@example.com',
        phone: '5556101003',
        specialties: ['lactation'],
        maxWeeklyHours: 20,
        minWeeklyHours: 10,
        rating: 4.9,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', shiftType: 'daytime' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      {
        id: 'provider-sea-l4',
        name: 'Lactation Nora',
        email: 'nora.lact@example.com',
        phone: '5556101004',
        specialties: ['lactation'],
        maxWeeklyHours: 25,
        minWeeklyHours: 10,
        rating: 4.5,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 4, startTime: '20:00', endTime: '06:00', shiftType: 'overnight' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      // Newborn
      {
        id: 'provider-sea-n1',
        name: 'Newborn Lisa',
        email: 'lisa.newborn@example.com',
        phone: '5556102001',
        specialties: ['newborn'],
        maxWeeklyHours: 40,
        minWeeklyHours: 20,
        rating: 4.9,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 5, startTime: '08:00', endTime: '16:00', shiftType: 'daytime' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      {
        id: 'provider-sea-n2',
        name: 'Newborn Sarah',
        email: 'sarah.newborn@example.com',
        phone: '5556102002',
        specialties: ['newborn'],
        maxWeeklyHours: 40,
        minWeeklyHours: 20,
        rating: 4.8,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 6, startTime: '20:00', endTime: '06:00', shiftType: 'overnight' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      // Nurses
      {
        id: 'provider-sea-nurse1',
        name: 'Nurse John',
        email: 'john.nurse@example.com',
        phone: '5556103001',
        specialties: ['nurse'],
        maxWeeklyHours: 40,
        minWeeklyHours: 20,
        rating: 4.5,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 0, startTime: '08:00', endTime: '16:00', shiftType: 'daytime' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      {
        id: 'provider-sea-nurse2',
        name: 'Nurse Emily',
        email: 'emily.nurse@example.com',
        phone: '5556103002',
        specialties: ['nurse'],
        maxWeeklyHours: 40,
        minWeeklyHours: 20,
        rating: 4.7,
        status: 'active',
        location: 'Seattle, WA',
        availability: [
          { dayOfWeek: 0, startTime: '20:00', endTime: '06:00', shiftType: 'overnight' }
        ],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      // 24/7
      {
        id: 'provider-sea-247a',
        name: '24/7 Alice',
        email: 'alice.247@example.com',
        phone: '5556104001',
        specialties: ['newborn', 'nurse'],
        maxWeeklyHours: 80,
        minWeeklyHours: 40,
        rating: 4.9,
        status: 'active',
        location: 'Seattle, WA',
        availability: [{ dayOfWeek: 0, startTime: '00:00', endTime: '23:59', shiftType: '24_7' }],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      },
      {
        id: 'provider-sea-247b',
        name: '24/7 Bob',
        email: 'bob.247@example.com',
        phone: '5556104002',
        specialties: ['doula', 'lactation'],
        maxWeeklyHours: 80,
        minWeeklyHours: 40,
        rating: 4.6,
        status: 'active',
        location: 'Seattle, WA',
        availability: [{ dayOfWeek: 0, startTime: '00:00', endTime: '23:59', shiftType: '24_7' }],
        timeOffs: [],
        preferences: { travelRadius: 25 }
      }
    ];
    await Provider.bulkCreate(providers, { ignoreDuplicates: true });

    // Care Requests
    const careRequests = [
      {
        id: 'request-sea-1',
        family_id: 'family-sea-1',
        care_type: 'doula',
        support_type: 'daytime',
        start_date: '2025-09-02',
        end_date: '2025-09-06',
        start_time: '10:00',
        end_time: '14:00',
        hours_per_day: 4,
        status: 'pending',
        priority: 'medium',
        notes: 'Daytime doula care needed',
        requires_consistency: true,
        location: 'Seattle, WA'
      },
      {
        id: 'request-sea-2',
        family_id: 'family-sea-2',
        care_type: 'lactation',
        support_type: 'overnight',
        start_date: '2025-09-03',
        end_date: '2025-09-05',
        start_time: '22:00',
        end_time: '02:00',
        hours_per_day: 4,
        status: 'pending',
        priority: 'high',
        notes: 'Overnight lactation support',
        requires_consistency: false,
        location: 'Seattle, WA'
      },
      {
        id: 'request-sea-3',
        family_id: 'family-sea-3',
        care_type: 'newborn',
        support_type: 'overnight',
        start_date: '2025-09-04',
        end_date: '2025-09-05',
        start_time: '22:00',
        end_time: '06:00',
        hours_per_day: 8,
        status: 'pending',
        priority: 'urgent',
        notes: 'Overnight newborn care',
        requires_consistency: true,
        location: 'Seattle, WA'
      },
      {
        id: 'request-sea-4',
        family_id: 'family-sea-4',
        care_type: 'nurse',
        support_type: '24_7',
        start_date: '2025-09-05',
        end_date: '2025-09-07',
        start_time: '00:00',
        end_time: '23:59',
        hours_per_day: 24,
        status: 'pending',
        priority: 'urgent',
        notes: 'Full-time nurse required',
        requires_consistency: true,
        location: 'Seattle, WA'
      }
    ];
    await CareRequest.bulkCreate(careRequests, { ignoreDuplicates: true });

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: {
        password_hash: await bcrypt.hash('admin123', 10),
        name: 'Admin User',
        phone: '5550000000',
        role: 'admin'
      }
    });
    

    console.log('Database: Admin user created successfully');
    console.log('Database: Seattle sample dataset inserted ✅');
  } catch (error) {
    console.error('Database: Error inserting Seattle sample data:', error);
    throw error;
  }
}


function getDb() {
  return sequelize;
}

module.exports = {
  initDatabase,
  getDb
};