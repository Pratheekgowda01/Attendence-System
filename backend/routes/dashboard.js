const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { auth, isManager } = require('../middleware/auth');

const router = express.Router();

const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// @route   GET /api/dashboard/employee
// @desc    Get employee dashboard stats
// @access  Private (Employee)
router.get('/employee', auth, async (req, res) => {
  try {
    const today = normalizeDate(new Date());
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Today's status
    const todayAttendance = await Attendance.findOne({
      userId: req.user._id,
      date: today
    });

    // Monthly summary
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const monthlyAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      present: 0,
      absent: 0,
      late: 0,
      halfDay: 0,
      totalHours: 0
    };

    monthlyAttendance.forEach(record => {
      if (record.status === 'present') {
        summary.present++;
      } else if (record.status === 'late') {
        summary.late++;
      } else if (record.status === 'half-day') {
        summary.halfDay++;
      } else if (record.status === 'absent') {
        summary.absent++;
      }
      summary.totalHours += record.totalHours || 0;
    });

    // Recent attendance (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentAttendance = await Attendance.find({
      userId: req.user._id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 }).limit(7);

    res.json({
      todayStatus: {
        checkedIn: !!todayAttendance?.checkInTime,
        checkedOut: !!todayAttendance?.checkOutTime,
        status: todayAttendance?.status || 'absent',
        checkInTime: todayAttendance?.checkInTime,
        checkOutTime: todayAttendance?.checkOutTime
      },
      monthlySummary: summary,
      recentAttendance
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/dashboard/manager
// @desc    Get manager dashboard stats
// @access  Private (Manager)
router.get('/manager', auth, isManager, async (req, res) => {
  try {
    const today = normalizeDate(new Date());
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Total employees
    const totalEmployees = await User.countDocuments({ role: 'employee' });

    // Today's attendance
    const todayAttendance = await Attendance.find({ date: today })
      .populate('userId', 'name employeeId department');

    const todayStats = {
      present: 0,
      absent: 0,
      late: [],
      halfDay: [],
      checkedIn: [],
      checkedOut: []
    };

    const employees = await User.find({ role: 'employee' });
    const attendanceMap = new Map();
    todayAttendance.forEach(record => {
      attendanceMap.set(record.userId._id.toString(), record);
    });

    employees.forEach(employee => {
      const record = attendanceMap.get(employee._id.toString());
      if (record) {
        if (record.status === 'present') todayStats.present++;
        if (record.status === 'late') {
          todayStats.late.push(record);
        }
        if (record.status === 'half-day') {
          todayStats.halfDay.push(record);
        }
        if (record.checkInTime) todayStats.checkedIn.push(record);
        if (record.checkOutTime) todayStats.checkedOut.push(record);
      } else {
        todayStats.absent++;
      }
    });

    // Weekly attendance trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyAttendance = await Attendance.find({
      date: { $gte: sevenDaysAgo }
    }).populate('userId', 'department');

    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = normalizeDate(date);

      const dayAttendance = weeklyAttendance.filter(a =>
        normalizeDate(a.date).getTime() === dateStr.getTime()
      );

      const presentCount = dayAttendance.filter(a => a.status === 'present').length;
      const lateCount = dayAttendance.filter(a => a.status === 'late').length;
      const halfDayCount = dayAttendance.filter(a => a.status === 'half-day').length;
      const totalPresent = presentCount + lateCount + halfDayCount;

      weeklyTrend.push({
        date: dateStr.toISOString().split('T')[0],
        present: presentCount,
        late: lateCount,
        halfDay: halfDayCount,
        absent: totalEmployees - totalPresent
      });
    }

    // Department-wise attendance
    const monthlyStart = new Date(currentYear, currentMonth - 1, 1);
    const monthlyEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);

    const monthlyAttendance = await Attendance.find({
      date: { $gte: monthlyStart, $lte: monthlyEnd }
    }).populate('userId', 'department');

    const departmentStats = {};
    monthlyAttendance.forEach(record => {
      const dept = record.userId?.department || 'No Department';
      if (!departmentStats[dept]) {
        departmentStats[dept] = { present: 0, absent: 0, late: 0 };
      }
      if (record.status === 'present') departmentStats[dept].present++;
      else if (record.status === 'late') departmentStats[dept].late++;
      else departmentStats[dept].absent++;
    });

    // Absent employees today
    const absentToday = [];
    employees.forEach(employee => {
      if (!attendanceMap.has(employee._id.toString())) {
        absentToday.push({
          name: employee.name,
          employeeId: employee.employeeId,
          department: employee.department,
          email: employee.email
        });
      }
    });

    res.json({
      totalEmployees,
      todayStats,
      weeklyTrend,
      departmentStats,
      absentToday
    });
  } catch (error) {
    console.error('Manager dashboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

