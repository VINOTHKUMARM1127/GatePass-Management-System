const fs = require('fs');
const path = require('path');

// Backend .env content
const backendEnv = `PORT=5000
MONGODB_URI=mongodb://localhost:27017/gatepass
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_use_random_string

# Cloudinary Configuration (Required for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

NODE_ENV=development
`;

// Frontend .env content
const frontendEnv = `REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
`;

// Create backend .env
const backendEnvPath = path.join(__dirname, 'backend', '.env');
if (!fs.existsSync(backendEnvPath)) {
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Created backend/.env');
} else {
  console.log('⚠️  backend/.env already exists, skipping...');
}

// Create frontend .env
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
if (!fs.existsSync(frontendEnvPath)) {
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Created frontend/.env');
} else {
  console.log('⚠️  frontend/.env already exists, skipping...');
}

console.log('\n📝 Please update the following in backend/.env:');
console.log('   - JWT_SECRET: Use a strong random string');
console.log('   - MONGODB_URI: Update if MongoDB is on a different host/port');
console.log('   - CLOUDINARY_*: Add your Cloudinary credentials for image uploads\n');

