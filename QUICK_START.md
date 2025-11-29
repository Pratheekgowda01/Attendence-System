# 🚀 Quick Start Guide

## Setup Complete! ✅

Your Employee Attendance System is now set up and running!

## Access the Application

🌐 **Frontend (React App):** http://localhost:3000  
🔧 **Backend API:** http://localhost:5000

## Login Credentials

After seeding, you can use these accounts:

### Manager Account
- **Email:** `manager@company.com`
- **Password:** `manager123`
- **Employee ID:** `MGR001`

### Employee Accounts
- **Email:** `alice@company.com` (or bob@company.com, charlie@company.com, etc.)
- **Password:** `employee123`
- **Employee IDs:** `EMP001`, `EMP002`, `EMP003`, `EMP004`, `EMP005`

## What's Running

1. ✅ **Backend Server** - Node.js + Express on port 5000
   - MongoDB connected
   - API endpoints ready
   - Sample data seeded

2. ✅ **Frontend Server** - React app on port 3000
   - Development server running
   - Connected to backend API

## First Steps

1. Open your browser and go to: **http://localhost:3000**
2. You'll see the Login page
3. Login with either:
   - Manager account to see manager dashboard
   - Employee account to see employee dashboard

## Features Available

### As Employee:
- View dashboard with today's status
- Check In / Check Out
- View attendance history (calendar view)
- View monthly summary
- View profile

### As Manager:
- View team dashboard with statistics
- View all employees' attendance
- Filter attendance by date, employee, status
- View team calendar
- Generate and export reports (CSV)
- See department-wise statistics

## Troubleshooting

### If servers didn't start:
1. **Check if ports are in use:**
   ```powershell
   # Check port 5000 (backend)
   netstat -ano | findstr :5000
   
   # Check port 3000 (frontend)
   netstat -ano | findstr :3000
   ```

2. **Manually start servers:**
   ```powershell
   # Backend (in one terminal)
   cd backend
   npm run dev
   
   # Frontend (in another terminal)
   cd frontend
   npm start
   ```

### If MongoDB connection fails:
- Make sure MongoDB is running
- Check MongoDB service: `Get-Service MongoDB` (if installed as service)
- Or start MongoDB manually: `mongod`

### If you see CORS errors:
- Ensure backend is running on port 5000
- Check that frontend `.env` has: `REACT_APP_API_URL=http://localhost:5000`

## Stop Servers

To stop the servers:
1. Press `Ctrl + C` in the terminal windows where they're running
2. Or close the terminal windows

## Reset Database

To reseed the database with fresh sample data:
```powershell
cd backend
npm run seed
```

## Need Help?

- Check `README.md` for detailed documentation
- Check `SETUP_GUIDE.md` for setup instructions
- Check `VERIFICATION_CHECKLIST.md` for troubleshooting

---

**Enjoy your Attendance System! 🎉**

