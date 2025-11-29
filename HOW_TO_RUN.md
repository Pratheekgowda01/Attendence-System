# 🚀 How to Run the Attendance System

## Quick Start Guide

Follow these steps to run the application:

## Prerequisites Checklist

Before starting, ensure you have:
- ✅ Node.js installed (v14 or higher)
- ✅ MongoDB installed and running
- ✅ All dependencies installed (we'll do this)

---

## Step 1: Start MongoDB

**Option A: If MongoDB is installed as a service:**
- MongoDB should already be running
- If not, start it from Windows Services

**Option B: If MongoDB needs to be started manually:**
```powershell
# Navigate to MongoDB bin directory (adjust path as needed)
cd "C:\Program Files\MongoDB\Server\<version>\bin"
mongod
```

**Option C: Check if MongoDB is running:**
```powershell
Get-Service MongoDB
# If it shows "Running", you're good!
```

---

## Step 2: Start Backend Server

Open **Terminal 1** (PowerShell or Command Prompt):

```powershell
# Navigate to backend folder
cd "C:\Users\user\OneDrive\Desktop\Tap Academy\backend"

# Install dependencies (if not done already)
npm install

# Start the backend server
npm run dev
```

**You should see:**
```
Server running on port 5000
MongoDB Connected
```

✅ **Keep this terminal open** - Backend must keep running!

---

## Step 3: Start Frontend Server

Open **Terminal 2** (New PowerShell or Command Prompt window):

```powershell
# Navigate to frontend folder
cd "C:\Users\user\OneDrive\Desktop\Tap Academy\frontend"

# Install dependencies (if not done already)
npm install

# Start the frontend server
npm start
```

**You should see:**
- React compilation messages
- Browser automatically opens to http://localhost:3000
- Wait 30-60 seconds for initial compilation

✅ **Keep this terminal open** - Frontend must keep running!

---

## Step 4: Access the Application

Once both servers are running:

1. **Open your browser** (if it didn't open automatically)
2. **Go to:** `http://localhost:3000`
3. **Login with:**
   - Manager: `manager@company.com` / `manager123`
   - Employee: `alice@company.com` / `employee123`

---

## Quick Command Reference

### Backend Commands
```powershell
cd backend
npm install          # Install dependencies (first time only)
npm run dev         # Start development server
npm run seed        # Seed database with sample data (optional)
```

### Frontend Commands
```powershell
cd frontend
npm install         # Install dependencies (first time only)
npm start           # Start development server
npm run build       # Build for production
```

---

## Troubleshooting

### ❌ MongoDB Connection Error

**Problem:** Backend shows "MongoDB connection error"

**Solutions:**
1. Make sure MongoDB is running:
   ```powershell
   Get-Service MongoDB
   ```

2. Start MongoDB if it's stopped:
   ```powershell
   Start-Service MongoDB
   ```

3. Or start MongoDB manually:
   ```powershell
   mongod
   ```

### ❌ Port Already in Use

**Problem:** "Port 5000 is already in use" or "Port 3000 is already in use"

**Solutions:**

**For Port 5000 (Backend):**
```powershell
# Find and kill process using port 5000
netstat -ano | findstr :5000
# Note the PID number, then:
taskkill /PID <PID_NUMBER> /F
```

**For Port 3000 (Frontend):**
```powershell
# Find and kill process using port 3000
netstat -ano | findstr :3000
# Note the PID number, then:
taskkill /PID <PID_NUMBER> /F
```

### ❌ Module Not Found Errors

**Problem:** "Cannot find module..." errors

**Solution:**
```powershell
# Delete node_modules and reinstall
cd backend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install

# Do the same for frontend
cd ../frontend
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### ❌ Frontend Not Loading

**Problem:** Browser shows errors or blank page

**Solutions:**
1. Check that backend is running on port 5000
2. Check browser console for errors (F12)
3. Verify `.env` file exists in frontend folder with:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```
4. Try clearing browser cache or use incognito mode

---

## Running in Development Mode

### Terminal Layout

**Recommended:** Open 2 terminal windows side by side:

```
┌─────────────────────┬─────────────────────┐
│   Terminal 1        │   Terminal 2        │
│   (Backend)         │   (Frontend)        │
│                     │                     │
│   npm run dev       │   npm start         │
│   Port: 5000        │   Port: 3000        │
└─────────────────────┴─────────────────────┘
```

---

## One-Command Setup (After First Time)

Once everything is set up, you just need:

**Terminal 1:**
```powershell
cd backend
npm run dev
```

**Terminal 2:**
```powershell
cd frontend
npm start
```

---

## Stopping the Servers

To stop the servers:
1. Go to each terminal window
2. Press `Ctrl + C`
3. Confirm if prompted

---

## Fresh Start (If Something Goes Wrong)

If you need to start completely fresh:

```powershell
# 1. Stop all running servers (Ctrl+C)

# 2. Make sure MongoDB is running
Get-Service MongoDB

# 3. Backend
cd backend
npm install
npm run seed    # Optional: reset database
npm run dev

# 4. Frontend (in new terminal)
cd frontend
npm install
npm start
```

---

## Verify Everything is Working

✅ **Backend is running if:**
- Terminal shows "Server running on port 5000"
- Terminal shows "MongoDB Connected"
- No error messages

✅ **Frontend is running if:**
- Browser opens to http://localhost:3000
- Login page appears
- No errors in browser console (F12)

✅ **Application is working if:**
- You can login successfully
- Dashboard loads with data
- You can navigate between pages

---

## Need Help?

Check these files for more information:
- `README.md` - Full documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `TAP_ACADEMY_SUBMISSION.md` - Project overview

---

**Happy Coding! 🎉**

