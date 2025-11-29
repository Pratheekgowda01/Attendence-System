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
      }
    ];

    const createdEmployees = [];
    for (const emp of employees) {
      const employee = new User(emp);
      await employee.save();
      createdEmployees.push(employee);
      console.log('Created employee:', employee.email);
    }

    // Create sample attendance for the last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateNormalized = normalizeDate(date);

      for (const employee of createdEmployees) {
        // Skip weekends (0 = Sunday, 6 = Saturday)
        const dayOfWeek = dateNormalized.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Sometimes employees work on weekends (10% chance)
          if (Math.random() > 0.1) continue;
        }

        // Skip some days (holidays, leave - 10% chance)
        if (Math.random() < 0.1 && i > 5) continue;

        const isLate = Math.random() < 0.15; // 15% chance of being late
        const isHalfDay = Math.random() < 0.05; // 5% chance of half day

        const checkInHour = isLate ? 9 + Math.floor(Math.random() * 3) : 8 + Math.floor(Math.random() * 2);
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkInTime = new Date(dateNormalized);
        checkInTime.setHours(checkInHour, checkInMinute, 0, 0);

        let checkOutTime = null;
        let totalHours = 0;
        
        if (!isHalfDay) {
          const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-7 PM
          const checkOutMinute = Math.floor(Math.random() * 60);
          checkOutTime = new Date(dateNormalized);
          checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);
          
          totalHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
          totalHours = Math.round(totalHours * 100) / 100;
        } else {
          totalHours = 4; // Half day
          checkOutTime = new Date(checkInTime);
          checkOutTime.setHours(checkInTime.getHours() + 4);
        }

        const attendance = new Attendance({
          userId: employee._id,
          date: dateNormalized,
          checkInTime,
          checkOutTime,
          status: isHalfDay ? 'half-day' : (isLate ? 'late' : 'present'),
          totalHours
        });

        await attendance.save();
      }
    }

    console.log('Created sample attendance data for last 30 days');
    console.log('\n=== Seed Data Summary ===');
    console.log('Manager:', manager.email, '- Password: manager123');
    console.log('Employees created:', createdEmployees.length);
    console.log('Sample attendance data created for last 30 days');
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

