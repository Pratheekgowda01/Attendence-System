const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, isManager } = require('../middleware/auth');

const router = express.Router();

// Helper function to normalize date to start of day
const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @route   POST /api/attendance/checkin
// @desc    Check in
// @access  Private (Employee)
router.post('/checkin', auth, async (req, res) => {
  try {
    const today = normalizeDate(new Date());
    const now = new Date();

    // Check if already checked in today
    let attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (attendance && attendance.checkInTime) {
      return res.status(400).json({ message: 'Already checked in today' });
    }

    // Check if it's late (after 9:30 AM)
    const checkInHour = now.getHours();
    const checkInMinute = now.getMinutes();
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 30);
    const status = isLate ? 'late' : 'present';

    console.log('Check-in:', {
      time: now.toISOString(),
      hour: checkInHour,
      minute: checkInMinute,
      isLate,
      status
    });

    if (attendance) {
      attendance.checkInTime = now;
      attendance.status = status;
    } else {
      attendance = new Attendance({
        userId: req.user._id,
        date: today,
        checkInTime: now,
        status: status
      });
    }

    await attendance.save();

    console.log('Saved attendance:', {
      id: attendance._id,
      status: attendance.status,
      checkInTime: attendance.checkInTime
    });

    res.json({
      message: 'Checked in successfully',
      attendance: {
        checkInTime: attendance.checkInTime,
        status: attendance.status
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/attendance/checkout
// @desc    Check out
// @access  Private (Employee)
router.post('/checkout', auth, async (req, res) => {
  try {
    const today = normalizeDate(new Date());
    const now = new Date();

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (!attendance || !attendance.checkInTime) {
      return res.status(400).json({ message: 'Please check in first' });
    }

    if (attendance.checkOutTime) {
      return res.status(400).json({ message: 'Already checked out today' });
    }

    console.log('Check-out - Before:', {
      id: attendance._id,
      status: attendance.status,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime
    });

    attendance.checkOutTime = now;

    // Calculate total hours
    const diffMs = attendance.checkOutTime - attendance.checkInTime;
    const diffHours = diffMs / (1000 * 60 * 60);
    attendance.totalHours = Math.round(diffHours * 100) / 100;

    console.log('Check-out - Calculation:', {
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      diffMs,
      diffHours,
      totalHours: attendance.totalHours,
      currentStatus: attendance.status
    });

    // Only set to half-day if not already present/late and worked less than 4 hours
    const shouldSetHalfDay = attendance.totalHours < 4 && attendance.status !== 'present' && attendance.status !== 'late';
    console.log('Should set half-day?', shouldSetHalfDay, {
      totalHours: attendance.totalHours,
      currentStatus: attendance.status,
      condition1: attendance.totalHours < 4,
      condition2: attendance.status !== 'present',
      condition3: attendance.status !== 'late'
    });

    if (shouldSetHalfDay) {
      console.log('Setting status to half-day');
      attendance.status = 'half-day';
    } else {
      console.log('Keeping current status:', attendance.status);
    }

    await attendance.save();

    console.log('Check-out - After save:', {
      id: attendance._id,
      status: attendance.status,
      totalHours: attendance.totalHours
    });

    res.json({
      message: 'Checked out successfully',
      attendance: {
        checkOutTime: attendance.checkOutTime,
        totalHours: attendance.totalHours,
        status: attendance.status
      }
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/my-history
// @desc    Get my attendance history
// @access  Private (Employee)
router.get('/my-history', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { userId: req.user._id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name employeeId department');

    res.json(attendance);
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/my-summary
// @desc    Get monthly summary
// @access  Private (Employee)
router.get('/my-summary', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0,
      totalDays: attendance.length
    };

    attendance.forEach(record => {
      if (record.status === 'present') summary.present++;
      else if (record.status === 'absent') summary.absent++;
      else if (record.status === 'late') summary.late++;
      else if (record.status === 'half-day') summary.halfDay++;

      summary.totalHours += record.totalHours || 0;
    });

    res.json(summary);
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's attendance status
// @access  Private (Employee)
router.get('/today', auth, async (req, res) => {
  try {
    const today = normalizeDate(new Date());

    const attendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    if (!attendance) {
      return res.json({
        checkedIn: false,
        checkedOut: false,
        attendance: null
      });
    }

    res.json({
      checkedIn: !!attendance.checkInTime,
      checkedOut: !!attendance.checkOutTime,
      attendance
    });
  } catch (error) {
    console.error('Get today error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/all
// @desc    Get all employees attendance
// @access  Private (Manager)
router.get('/all', auth, isManager, async (req, res) => {
  try {
    const { employeeId, startDate, endDate, status } = req.query;
    let query = {};

    // Filter by employee
    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      }
    }

    // Filter by date range
    if (startDate && endDate) {
      query.date = {
        $gte: normalizeDate(new Date(startDate)),
        $lte: normalizeDate(new Date(endDate))
      };
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name employeeId department email');

    res.json(attendance);
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/employee/:id
// @desc    Get specific employee attendance
// @access  Private (Manager)
router.get('/employee/:id', auth, isManager, async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = { userId: req.params.id };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name employeeId department email');

    res.json(attendance);
  } catch (error) {
    console.error('Get employee attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/summary
// @desc    Get team attendance summary
// @access  Private (Manager)
router.get('/summary', auth, isManager, async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('userId', 'name employeeId department');

    const summary = {
      totalEmployees: await User.countDocuments({ role: 'employee' }),
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0,
      byDepartment: {}
    };

    attendance.forEach(record => {
      if (record.status === 'present') summary.present++;
      else if (record.status === 'absent') summary.absent++;
      else if (record.status === 'late') summary.late++;
      else if (record.status === 'half-day') summary.halfDay++;

      summary.totalHours += record.totalHours || 0;

      // Department-wise
      const dept = record.userId?.department || 'No Department';
      if (!summary.byDepartment[dept]) {
        summary.byDepartment[dept] = { present: 0, absent: 0, late: 0, halfDay: 0 };
      }
      if (record.status === 'present') summary.byDepartment[dept].present++;
      else if (record.status === 'absent') summary.byDepartment[dept].absent++;
      else if (record.status === 'late') summary.byDepartment[dept].late++;
      else if (record.status === 'half-day') summary.byDepartment[dept].halfDay++;
    });

    res.json(summary);
  } catch (error) {
    console.error('Get team summary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/today-status
// @desc    Get today's attendance status for all employees
// @access  Private (Manager)
router.get('/today-status', auth, isManager, async (req, res) => {
  try {
    const today = normalizeDate(new Date());

    const attendance = await Attendance.find({ date: today })
      .populate('userId', 'name employeeId department email');

    const employees = await User.find({ role: 'employee' });

    const status = {
      present: [],
      absent: [],
      late: [],
      halfDay: [],
      checkedIn: [],
      checkedOut: []
    };

    const attendanceMap = new Map();
    attendance.forEach(record => {
      attendanceMap.set(record.userId._id.toString(), record);
    });

    employees.forEach(employee => {
      const record = attendanceMap.get(employee._id.toString());
      if (record) {
        if (record.status === 'present') status.present.push(record);
        else if (record.status === 'late') status.late.push(record);
        else if (record.status === 'half-day') status.halfDay.push(record);

        if (record.checkInTime) status.checkedIn.push(record);
        if (record.checkOutTime) status.checkedOut.push(record);
      } else {
        status.absent.push({
          userId: {
            _id: employee._id,
            name: employee.name,
            employeeId: employee.employeeId,
            department: employee.department,
            email: employee.email
          },
          date: today,
          status: 'absent'
        });
      }
    });

    res.json(status);
  } catch (error) {
    console.error('Get today status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/attendance/export
// @desc    Export attendance to CSV
// @access  Private (Manager)
router.get('/export', auth, isManager, async (req, res) => {
  try {
    const { startDate, endDate, employeeId } = req.query;
    let query = {};

    if (employeeId) {
      const user = await User.findOne({ employeeId });
      if (user) {
        query.userId = user._id;
      }
    }

    if (startDate && endDate) {
      query.date = {
        $gte: normalizeDate(new Date(startDate)),
        $lte: normalizeDate(new Date(endDate))
      };
    }

    const attendance = await Attendance.find(query)
      .sort({ date: -1 })
      .populate('userId', 'name employeeId department email');

    // Helper functions for CSV
    const getDisplayStatus = (status) => {
      if (status === 'absent') return 'Absent';
      return 'Present';
    };

    const getRemarks = (status) => {
      if (status === 'late') return 'Late arrival';
      if (status === 'half-day') return 'Half day';
      if (status === 'present') return 'Full day';
      if (status === 'absent') return '-';
      return '-';
    };

    // Generate CSV
    let csv = 'Date,Employee ID,Name,Email,Department,Check In,Check Out,Status,Hours,Remarks\n';
    
    attendance.forEach(record => {
      const date = new Date(record.date).toLocaleDateString('en-GB');
      const checkIn = record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      const checkOut = record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      const displayStatus = getDisplayStatus(record.status);
      const remarks = getRemarks(record.status);
      
      csv += `${date},"${record.userId.employeeId}","${record.userId.name}","${record.userId.email}","${record.userId.department || ''}","${checkIn}","${checkOut}","${displayStatus}","${(record.totalHours || 0).toFixed(2)}h","${remarks}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

