# 🚪 Gate Pass Management System

A comprehensive web-based application designed to digitalize and simplify the process of issuing gate passes in colleges. This system replaces slow manual procedures with a fast, secure, and trackable online workflow.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [User Roles](#user-roles)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)

## ✨ Features

### 👩‍🎓 Student Panel
- Submit gate pass requests with photo upload
- Track request status in real-time
- View approval history
- Support for group passes (additional person)

### 🧑‍🏫 HOD Admin Panel
- View pending requests from department students
- Approve or reject requests
- View all department requests
- Department-specific access control

### 👩‍💼 Principal Panel (Super Admin)
- Final approval authority
- View all gate pass requests
- Manage departments and HOD assignments
- System statistics and analytics
- Department-wise tracking

### 🛡️ Watchman Panel
- Verify gate pass by ID
- View student photo for verification
- Confirm student exit
- Prevent duplicate exits

### 🔍 Viewer Panel (Public)
- Check gate pass status without login
- View approval timeline
- Transparent status tracking

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with Cloudinary (cloud storage)

## 👥 User Roles

1. **Student**: Can create gate pass requests and view their status
2. **HOD (Head of Department)**: Can approve/reject requests from their department
3. **Principal**: Final approval authority, can manage system settings
4. **Watchman**: Verifies and confirms student exits
5. **Viewer**: Public access to check gate pass status

## 📁 Project Structure

```
gate-pass-management-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── GatePass.js
│   │   └── Department.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── gatepass.js
│   │   ├── admin.js
│   │   ├── watchman.js
│   │   └── viewer.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── upload.js
│   ├── uploads/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   │   ├── Student/
│   │   │   ├── HOD/
│   │   │   ├── Principal/
│   │   │   ├── Watchman/
│   │   │   └── Viewer/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd "Gate Pass"
```

### Step 2: Install Dependencies

Install all dependencies for both frontend and backend:

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Set Up MongoDB

Make sure MongoDB is running on your system. You can either:

- Use local MongoDB: `mongod`
- Use MongoDB Atlas: Update the connection string in `.env`

### Step 4: Configure Environment Variables

**Option 1: Automatic Setup (Recommended)**
```bash
npm run setup-env
```

**Option 2: Manual Setup**

Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gatepass
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Cloudinary Configuration (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
```

Create `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

**Important**: 
- Change `JWT_SECRET` to a strong, random string in production!
- **Get Cloudinary credentials** from [cloudinary.com](https://cloudinary.com) (free account available)
- See `ENV_SETUP.md` for detailed environment variable documentation
- See `CLOUDINARY_SETUP.md` for Cloudinary setup guide

## 🎯 Usage

### Development Mode

Run both frontend and backend concurrently:

```bash
# From root directory
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

- Backend will run on: `http://localhost:5000`
- Frontend will run on: `http://localhost:3000`

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Start backend
cd ../backend
npm start
```

## 📝 Initial Setup

### 1. Create a Principal Account

Register a Principal account through the registration page:
- Role: Principal
- This account will have full system access

### 2. Set Up Cloudinary (Required for Image Uploads)

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from the Dashboard
3. Add them to `backend/.env`
4. See `CLOUDINARY_SETUP.md` for detailed instructions

### 3. Create Departments

1. Login as Principal
2. Go to "Manage System"
3. Create departments (e.g., "Computer Science", "Electronics")

### 4. Create HOD Accounts

1. Register HOD accounts
2. Assign them to departments via Principal panel

### 5. Create Watchman Account

Register a Watchman account for gate verification.

## 🔐 Gate Pass Workflow

1. **Student** submits a gate pass request with:
   - Department
   - Reason for leaving
   - Photo upload
   - Optional: Additional person details

2. **HOD** reviews and:
   - Approves → Moves to Principal
   - Rejects → Process stops, student notified

3. **Principal** reviews and:
   - Approves → Gate pass ready for exit
   - Rejects → Process stops, student notified

4. **Watchman** verifies:
   - Checks gate pass ID
   - Verifies student photo
   - Confirms exit (only if fully approved)

5. **Viewer** can check status:
   - Enter gate pass ID
   - View current status and approval timeline

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Gate Pass (Student)
- `POST /api/gatepass/create` - Create gate pass request
- `GET /api/gatepass/my-requests` - Get student's requests
- `GET /api/gatepass/:id` - Get specific gate pass

### Admin (HOD)
- `GET /api/admin/hod/pending` - Get pending requests
- `GET /api/admin/hod/all` - Get all department requests
- `PUT /api/admin/hod/approve/:id` - Approve/reject request

### Admin (Principal)
- `GET /api/admin/principal/pending` - Get pending requests
- `GET /api/admin/principal/all` - Get all requests
- `GET /api/admin/principal/stats` - Get statistics
- `PUT /api/admin/principal/approve/:id` - Approve/reject request
- `GET /api/admin/principal/departments` - Get departments
- `POST /api/admin/principal/departments` - Create department
- `GET /api/admin/principal/hods` - Get all HODs
- `PUT /api/admin/principal/departments/:id/assign-hod` - Assign HOD

### Watchman
- `GET /api/watchman/verify/:gatePassId` - Verify gate pass
- `PUT /api/watchman/confirm-exit/:id` - Confirm exit
- `GET /api/watchman/recent` - Get recent exits

### Viewer (Public)
- `GET /api/viewer/:gatePassId` - Get gate pass status

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- File upload validation
- Input validation and sanitization

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change `PORT` in backend `.env`
- Update frontend proxy in `package.json` if needed

### File Upload Issues
- **Cloudinary not configured**: Make sure all Cloudinary credentials are set in `backend/.env`
- Check file size limits (5MB default)
- Verify file type (JPG, JPEG, PNG only)
- See `CLOUDINARY_SETUP.md` for troubleshooting

## 📄 License

This project is open source and available for educational purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue in the repository.

---

**Note**: This is a development version. For production deployment, ensure:
- Strong JWT_SECRET
- Secure MongoDB connection (use MongoDB Atlas)
- Cloudinary credentials configured
- Environment variables properly configured
- HTTPS enabled

