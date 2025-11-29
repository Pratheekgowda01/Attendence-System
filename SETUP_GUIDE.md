# Quick Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB installed and running
- npm or yarn

## Step-by-Step Setup

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/attendance_system
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

Start MongoDB, then:
```bash
npm run seed    # Seed database with sample data
npm run dev     # Start development server
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm start
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### 4. Login Credentials (After Seeding)

**Manager:**
- Email: manager@company.com
- Password: manager123

**Employee:**
- Email: alice@company.com (or bob@company.com, etc.)
- Password: employee123

## Troubleshooting

1. **MongoDB not connecting?**
   - Ensure MongoDB is running: `mongod` or start MongoDB service
   - Check MONGODB_URI in backend/.env

2. **Port already in use?**
   - Change PORT in backend/.env
   - Or kill process: `lsof -ti:5000 | xargs kill` (Mac/Linux)

3. **CORS errors?**
   - Ensure backend is running on port 5000
   - Check REACT_APP_API_URL in frontend/.env

4. **Module not found errors?**
   - Delete node_modules and package-lock.json
   - Run `npm install` again

## Project Structure

```
├── backend/          # Node.js + Express API
├── frontend/         # React application
├── README.md         # Full documentation
└── SETUP_GUIDE.md    # This file
```

For detailed documentation, see README.md

