const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Attendance = require('../models/Attendance');

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance_system');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    // Create Manager
    const manager = new User({
      name: 'Manager John',
      email: 'manager@company.com',
      password: 'manager123',
      role: 'manager',
      employeeId: 'MGR001',
      department: 'Management'
    });
    await manager.save();
    console.log('Created manager:', manager.email);

    // Create Employees
    const employees = [
      {
        name: 'Alice Johnson',
        email: 'alice@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP001',
        department: 'Engineering'
      },
      {
        name: 'Bob Smith',
        email: 'bob@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP002',
        department: 'Engineering'
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP003',
        department: 'Marketing'
      },
      {
        name: 'Diana Prince',
        email: 'diana@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP004',
        department: 'Sales'
      },
      {
        name: 'Edward Norton',
        email: 'edward@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP005',
        department: 'Sales'
      },
      {
        name: 'Frank Miller',
        email: 'frank@company.com',
        password: 'employee123',
        role: 'employee',
        employeeId: 'EMP006',
        department: 'Engineering'
      }
    ];

    const createdEmployees = [];
    for (const emp of employees) {
      const employee = new User(emp);
      await employee.save();
      createdEmployees.push(employee);
      console.log('Created employee:', employee.email);
    }

    // Create sample attendance for the last 60 days with more variety
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateNormalized = normalizeDate(date);

      for (const employee of createdEmployees) {
        // Skip weekends (0 = Sunday, 6 = Saturday)
        const dayOfWeek = dateNormalized.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        if (isWeekend) {
          // Sometimes employees work on weekends (15% chance)
          if (Math.random() > 0.15) continue;
        }

        // Determine attendance status with varied probabilities
        // For recent dates (last 7 days), increase present rate to show more activity
        const daysFromToday = Math.floor((new Date() - dateNormalized) / (1000 * 60 * 60 * 24));
        const isRecentDate = daysFromToday <= 7;

        let attendanceStatus = 'present';
        let isPresent = true;

        // Lower absence chance for recent dates to show more present employees
        const absenceChance = isRecentDate ? (isWeekend ? 0.02 : 0.05) : (isWeekend ? 0.05 : 0.12);
        if (Math.random() < absenceChance) {
          attendanceStatus = 'absent';
          isPresent = false;
        } else {
          // If present, determine if late or half-day
          const isLate = Math.random() < (isRecentDate ? 0.25 : 0.18); // Higher late chance for recent dates
          const isHalfDay = Math.random() < (isRecentDate ? 0.10 : 0.08); // Higher half-day chance for recent dates

          if (isHalfDay) {
            attendanceStatus = 'half-day';
          } else if (isLate) {
            attendanceStatus = 'late';
          } else {
            attendanceStatus = 'present';
          }
        }

        let checkInTime = null;
        let checkOutTime = null;
        let totalHours = 0;

        if (isPresent) {
          // Generate check-in time based on status
          let checkInHour, checkInMinute;

          if (attendanceStatus === 'late') {
            // Late: 9:00 AM to 11:00 AM
            checkInHour = 9 + Math.floor(Math.random() * 3);
            checkInMinute = Math.floor(Math.random() * 60);
          } else {
            // On time: 8:00 AM to 9:30 AM
            checkInHour = 8 + Math.floor(Math.random() * 1.5);
            checkInMinute = Math.floor(Math.random() * 60);
          }

          checkInTime = new Date(dateNormalized);
          checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

          // Generate check-out time
          if (attendanceStatus === 'half-day') {
            // Half day: 4 hours after check-in
            totalHours = 4;
            checkOutTime = new Date(checkInTime);
            checkOutTime.setHours(checkInTime.getHours() + 4);
          } else {
            // Full day: 5-7 PM
            const checkOutHour = 17 + Math.floor(Math.random() * 2);
            const checkOutMinute = Math.floor(Math.random() * 60);
            checkOutTime = new Date(dateNormalized);
            checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);

            totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
            totalHours = Math.round(totalHours * 100) / 100;
          }
        }

        const attendance = new Attendance({
          userId: employee._id,
          date: dateNormalized,
          checkInTime,
          checkOutTime,
          status: attendanceStatus,
          totalHours
        });

        await attendance.save();
      }
    }

    console.log('Created sample attendance data for last 60 days');
    console.log('\n=== Seed Data Summary ===');
    console.log('Manager:', manager.email, '- Password: manager123');
    console.log('Employees created:', createdEmployees.length);
    console.log('Sample attendance data created for last 60 days');
    console.log('Expected attendance patterns:');
    console.log('- Recent dates (last 7 days): Higher attendance rates');
    console.log('  - Present: ~65% (on-time full days)');
    console.log('  - Late: ~25% (arrived after 9:30 AM)');
    console.log('  - Half Day: ~10% (worked 4 hours)');
    console.log('  - Absent: ~5% (no attendance record)');
    console.log('- Older dates: Standard attendance rates');
    console.log('  - Present: ~70% (on-time full days)');
    console.log('  - Late: ~18% (arrived after 9:30 AM)');
    console.log('  - Half Day: ~8% (worked 4 hours)');
    console.log('  - Absent: ~12% (no attendance record)');
    console.log('\nEmployee Login Credentials:');
    createdEmployees.forEach(emp => {
      console.log(`- ${emp.email} / employee123 (${emp.employeeId})`);
    });

    await mongoose.connection.close();
    console.log('\nSeed data completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();

