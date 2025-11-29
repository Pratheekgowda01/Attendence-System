# 🚀 Single Command Start Guide

## Quick Start - One Command

You can now start the entire application with a single command!

---

## Windows

### Option 1: PowerShell Script (Recommended)
```powershell
.\start.ps1
```

### Option 2: Batch File (Double-click)
Simply double-click `start.bat` in Windows Explorer

### Option 3: Direct PowerShell Command
```powershell
powershell -ExecutionPolicy Bypass -File start.ps1
```

---

## Linux / Mac

### Step 1: Make script executable (first time only)
```bash
chmod +x start.sh
```

### Step 2: Run the script
```bash
./start.sh
```

---

## What the Script Does

1. ✅ Checks if MongoDB is running
2. ✅ Checks if ports 5000 and 3000 are available
3. ✅ Starts Backend server in a new terminal window
4. ✅ Starts Frontend server in a new terminal window
5. ✅ Opens both servers automatically

---

## What You'll See

When you run the script:

1. **New Terminal Window 1** opens for Backend:
   - Shows backend server logs
   - Port 5000
   - MongoDB connection status

2. **New Terminal Window 2** opens for Frontend:
   - Shows React compilation progress
   - Port 3000
   - Automatically opens browser when ready

3. **Main Script Window** shows:
   - Server startup status
   - Access URLs
   - Login credentials

---

## Manual Alternative

If the script doesn't work, you can still start manually:

### Terminal 1 (Backend):
```powershell
cd backend
npm run dev
```

### Terminal 2 (Frontend):
```powershell
cd frontend
npm start
```

---

## Troubleshooting

### Script Won't Run (Windows)

**Error: "Execution Policy"**
```powershell
# Run this once to allow scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again:
.\start.ps1
```

### Script Won't Run (Linux/Mac)

**Error: "Permission denied"**
```bash
chmod +x start.sh
./start.sh
```

### MongoDB Not Running

The script will warn you, but you need to start MongoDB manually:
```powershell
# Windows (if installed as service)
Start-Service MongoDB

# Or start manually
mongod
```

---

## Stopping Servers

To stop the servers:
1. Go to each terminal window (Backend and Frontend)
2. Press `Ctrl + C`
3. Confirm if prompted

---

## Next Steps

After running the start script:

1. ✅ Wait for "Compiled successfully!" in Frontend terminal
2. ✅ Browser should open automatically
3. ✅ If not, go to http://localhost:3000
4. ✅ Login with:
   - Manager: `manager@company.com` / `manager123`
   - Employee: `alice@company.com` / `employee123`

---

**That's it! One command to rule them all! 🎉**

