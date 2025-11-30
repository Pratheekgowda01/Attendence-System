# Employee Attendance System

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create .env file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in .env:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/attendance_system
   JWT_SECRET=your_jwt_secret_key_change_in_production
   NODE_ENV=development
   ```

5. Make sure MongoDB is running:
   - If using local MongoDB, start the MongoDB service
   - If using MongoDB Atlas, update `MONGODB_URI` with your connection string

6. Seed the database with sample data:
   ```bash
   npm run seed
   ```

   This will create:
   - 1 Manager account: `manager@company.com` / `manager123`
   - 5 Employee accounts: `alice@company.com` / `employee123`, etc.
   - Sample attendance data for the last 30 days

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create .env file (optional, defaults to localhost:5000):
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in .env:
   ```env
   REACT_APP_API_URL=http://localhost:5000
   ```

## How to Run

### Backend
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend
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

## Screenshots

### Login Page
![Login Page](screenshots/login.png)

### Employee Dashboard
![Employee Dashboard](screenshots/employee-dashboard.png)

### Manager Dashboard
![Manager Dashboard](screenshots/manager-dashboard.png)

### Attendance Calendar View
![Attendance Calendar View](screenshots/attendance-calendar.png)

### Reports Page
![Reports Page](screenshots/reports.png)

### Additional Screenshots
![Screenshot 1](screenshots/screenshot1.png)
![Screenshot 2](screenshots/screenshot2.png)
![Screenshot 3](screenshots/screenshot3.png)
![Screenshot 4](screenshots/screenshot4.png)
![Screenshot 5](screenshots/screenshot5.png)
![Screenshot 6](screenshots/screenshot6.png)
![Screenshot 7](screenshots/screenshot7.png)
