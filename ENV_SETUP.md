# Environment Variables Setup

## Quick Setup

Run the setup script to create `.env` files automatically:

```bash
npm run setup-env
```

Or manually create the files as described below.

## Backend .env File

Create `backend/.env` with the following content:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gatepass
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_use_random_string
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NODE_ENV=development
```

### Backend Variables Explained:

- **PORT**: Backend server port (default: 5000)
- **MONGODB_URI**: MongoDB connection string
  - Local: `mongodb://localhost:27017/gatepass`
  - Atlas: `mongodb+srv://username:password@cluster.mongodb.net/gatepass`
- **JWT_SECRET**: Secret key for JWT tokens (⚠️ **CHANGE THIS** in production!)
  - Generate a strong random string
  - Example: `openssl rand -base64 32`
- **CLOUDINARY_CLOUD_NAME**: Your Cloudinary cloud name (required for image uploads)
- **CLOUDINARY_API_KEY**: Your Cloudinary API key (required for image uploads)
- **CLOUDINARY_API_SECRET**: Your Cloudinary API secret (required for image uploads)
- **NODE_ENV**: Environment mode (`development` or `production`)

## Frontend .env File

Create `frontend/.env` with the following content:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

### Frontend Variables Explained:

- **REACT_APP_API_URL**: Backend API URL
  - Development: `http://localhost:5000`
  - Production: Your deployed backend URL (e.g., `https://api.yourdomain.com`)
- **REACT_APP_ENV**: Environment mode

## Important Notes

1. **Never commit `.env` files** - They are already in `.gitignore`
2. **Change JWT_SECRET** - Use a strong, random string in production
3. **Update MONGODB_URI** - Use your actual MongoDB connection string
4. **Frontend env variables** - Must start with `REACT_APP_` to be accessible in React

## Production Setup

For production deployment:

### Backend .env (Production)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gatepass
JWT_SECRET=very_strong_random_secret_key_here
NODE_ENV=production
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend .env (Production)
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_ENV=production
```

## Generating a Strong JWT Secret

### Using OpenSSL (Linux/Mac):
```bash
openssl rand -base64 32
```

### Using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Using Online Generator:
Visit: https://randomkeygen.com/ and use a "CodeIgniter Encryption Keys"

## Verification

After creating the `.env` files:

1. **Backend**: Restart the server - it should connect to MongoDB
2. **Frontend**: Restart the dev server - API calls should work

If you see connection errors, double-check:
- MongoDB is running
- MONGODB_URI is correct
- Ports are not in use by other applications

