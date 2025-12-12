# Quick Setup Guide

## Prerequisites
- Node.js (v14+)
- MongoDB installed and running

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Quick Setup (Recommended):**
```bash
npm run setup-env
```

This will create both `backend/.env` and `frontend/.env` files automatically.

**Manual Setup:**
- Create `backend/.env` with MongoDB URI and JWT_SECRET
- Create `frontend/.env` with API URL

See `ENV_SETUP.md` for detailed instructions.

**Important**: Change `JWT_SECRET` in `backend/.env` to a strong random string!

### 3. Start MongoDB

Make sure MongoDB is running:

```bash
# Windows (if installed as service, it should auto-start)
# Or start manually:
mongod

# Linux/Mac
sudo systemctl start mongod
# or
mongod
```

### 4. Run the Application

**Option A: Run both together (recommended)**
```bash
# From root directory
npm run dev
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Initial Setup (First Time)

1. **Register a Principal Account**
   - Go to http://localhost:3000/register
   - Role: Principal
   - Complete registration

2. **Create Departments**
   - Login as Principal
   - Go to "Manage System"
   - Add departments (e.g., "Computer Science", "Electronics")

3. **Register HOD Accounts**
   - Register HOD users
   - Assign them to departments via Principal panel

4. **Register Students**
   - Students can register themselves
   - Or admin can register them

5. **Register Watchman**
   - Register a watchman account for gate verification

## Testing the System

1. **As a Student:**
   - Register/Login
   - Create a gate pass request
   - Upload photo
   - View status

2. **As HOD:**
   - Login
   - View pending requests from your department
   - Approve/Reject requests

3. **As Principal:**
   - Login
   - View all pending requests
   - Approve/Reject requests
   - Manage departments and HODs

4. **As Watchman:**
   - Login
   - Enter gate pass ID
   - Verify and confirm exit

5. **As Viewer (Public):**
   - Go to /viewer
   - Enter gate pass ID
   - View status without login

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Try: `mongodb://127.0.0.1:27017/gatepass`

### Port Already in Use
- Change PORT in `backend/.env`
- Or kill the process using the port

### Module Not Found
- Delete `node_modules` folders
- Run `npm install` again in each directory

### File Upload Issues
- Ensure `backend/uploads` directory exists
- Check file permissions

## Default Ports

- Frontend: 3000
- Backend: 5000
- MongoDB: 27017

## Next Steps

- Review the main README.md for detailed documentation
- Customize the system as needed
- Deploy to production (update JWT_SECRET and MongoDB URI)

