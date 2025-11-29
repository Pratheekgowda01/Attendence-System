# Employee Attendance System

A full-stack employee attendance tracking system built with React, Node.js, Express, and MongoDB. The system supports two user roles: Employees and Managers, each with their own set of features and dashboards.

## Features

### Employee Features
- ✅ Register/Login
- ✅ Mark attendance (Check In / Check Out)
- ✅ View attendance history (calendar or table view)
- ✅ View monthly summary (Present/Absent/Late days)
- ✅ Dashboard with stats and quick actions

### Manager Features
- ✅ Login
- ✅ View all employees' attendance
- ✅ Filter by employee, date, status
- ✅ View team attendance summary
- ✅ Export attendance reports (CSV)
- ✅ Dashboard with team stats and charts

## Tech Stack

### Frontend
- **React** 18.2.0
- **React Router** 6.20.0
- **Zustand** 4.4.7 (State Management)
- **Axios** 1.6.2 (HTTP Client)
- **React Calendar** 4.7.0 (Calendar component)
- **date-fns** 2.30.0 (Date utilities)

### Backend
- **Node.js**
- **Express** 4.18.2
- **MongoDB** with Mongoose 8.0.3
- **bcryptjs** 2.4.3 (Password hashing)
- **jsonwebtoken** 9.0.2 (JWT authentication)
- **express-validator** 7.0.1 (Input validation)

## Project Structure

```
.
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Attendance.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── attendance.js
│   │   └── dashboard.js
│   ├── middleware/
│   │   └── auth.js
│   ├── scripts/
│   │   └── seedData.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── employee/
│   │   │   └── manager/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/attendance_system
   JWT_SECRET=your_jwt_secret_key_change_in_production
   NODE_ENV=development
   ```

5. **Make sure MongoDB is running:**
   - If using local MongoDB, start the MongoDB service
   - If using MongoDB Atlas, update `MONGODB_URI` with your connection string

6. **Seed the database with sample data:**
   ```bash
   npm run seed
   ```

   This will create:
   - 1 Manager account: `manager@company.com` / `manager123`
   - 5 Employee accounts: `alice@company.com` / `employee123`, etc.
   - Sample attendance data for the last 30 days

7. **Start the backend server:**
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file (optional, defaults to localhost:5000):**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

5. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open in your browser at `http://localhost:3000`

## Environment Variables

### Backend (.env)
- `PORT` - Port number for the backend server (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token signing (change in production!)
- `NODE_ENV` - Environment mode (development/production)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Attendance (Employee)
- `POST /api/attendance/checkin` - Check in (Protected)
- `POST /api/attendance/checkout` - Check out (Protected)
- `GET /api/attendance/my-history` - Get my attendance history (Protected)
- `GET /api/attendance/my-summary` - Get monthly summary (Protected)
- `GET /api/attendance/today` - Get today's status (Protected)

### Attendance (Manager)
- `GET /api/attendance/all` - Get all employees attendance (Protected, Manager only)
- `GET /api/attendance/employee/:id` - Get specific employee attendance (Protected, Manager only)
- `GET /api/attendance/summary` - Get team summary (Protected, Manager only)
- `GET /api/attendance/export` - Export CSV (Protected, Manager only)
- `GET /api/attendance/today-status` - Get today's attendance status (Protected, Manager only)

### Dashboard
- `GET /api/dashboard/employee` - Get employee dashboard stats (Protected)
- `GET /api/dashboard/manager` - Get manager dashboard stats (Protected, Manager only)

## Default Login Credentials

After running the seed script, you can use these credentials:

### Manager
- Email: `manager@company.com`
- Password: `manager123`
- Employee ID: `MGR001`

### Employees
- Email: `alice@company.com`, `bob@company.com`, etc.
- Password: `employee123`
- Employee IDs: `EMP001`, `EMP002`, `EMP003`, `EMP004`, `EMP005`

## Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: 'employee' | 'manager'),
  employeeId: String (unique),
  department: String,
  createdAt: Date
}
```

### Attendance Collection
```javascript
{
  userId: ObjectId (ref: User),
  date: Date,
  checkInTime: Date,
  checkOutTime: Date,
  status: String (enum: 'present' | 'absent' | 'late' | 'half-day'),
  totalHours: Number,
  createdAt: Date
}
```

## Features in Detail

### Employee Dashboard
- Today's attendance status (Checked In/Out, times)
- Monthly summary (Present/Absent/Late days, total hours)
- Recent attendance list (last 7 days)
- Quick action buttons for Check In/Out

### Manager Dashboard
- Total employees count
- Today's attendance overview
- Weekly attendance trend chart
- Department-wise attendance statistics
- Lists of late arrivals and absent employees

### Attendance History (Employee)
- Interactive calendar view with color coding
- Table view with filtering
- Click on dates to see details
- Filter by month and year

### Team Calendar (Manager)
- Visual calendar showing team attendance
- Color-coded dates (Green: All present, Red: All absent, Yellow: Mixed)
- Click dates to see detailed attendance for that day

### Reports (Manager)
- Filter by date range and employee
- View detailed attendance table
- Export to CSV functionality

## Screenshots

*Add screenshots of your application here:*
- Login Page
- Employee Dashboard
- Manager Dashboard
- Attendance Calendar View
- Reports Page

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm start
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The production build will be in the `frontend/build` directory.

## Troubleshooting

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check `MONGODB_URI` in `.env` file
   - Verify MongoDB service is accessible

2. **Port Already in Use:**
   - Change `PORT` in backend `.env`
   - Or kill the process using the port

3. **CORS Errors:**
   - Ensure backend CORS is configured correctly
   - Check `REACT_APP_API_URL` in frontend `.env`

4. **Authentication Issues:**
   - Clear browser localStorage
   - Check JWT_SECRET is set correctly
   - Verify token expiration

## License

This project is open source and available under the MIT License.

## Contributing

Contributions, issues, and feature requests are welcome!

## Contact

For any queries, please open an issue in the repository.

