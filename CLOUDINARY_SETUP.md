# Cloudinary Setup Guide

## Overview

The Gate Pass Management System now uses Cloudinary for image storage instead of local file storage. All images (student photos and additional person photos) are uploaded directly to Cloudinary and stored securely in the cloud.

## Prerequisites

1. Create a free Cloudinary account at [https://cloudinary.com](https://cloudinary.com)
2. Get your Cloudinary credentials from the dashboard

## Setup Steps

### 1. Get Cloudinary Credentials

After signing up for Cloudinary:

1. Go to your Dashboard
2. Copy the following values:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 2. Update Backend Environment Variables

Edit `backend/.env` and add your Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Important**: Never commit these credentials to version control!

### 3. Install Dependencies

The required packages are already in `package.json`. Just run:

```bash
cd backend
npm install
```

This will install:
- `cloudinary` - Cloudinary SDK
- `multer-storage-cloudinary` - Multer storage adapter for Cloudinary

### 4. Restart Backend Server

After updating the `.env` file, restart your backend server:

```bash
npm run dev
```

## How It Works

### Image Upload Flow

1. **Student submits gate pass request** with photo(s)
2. **Multer receives the file** and passes it to CloudinaryStorage
3. **Cloudinary uploads the image** to the `gatepass` folder
4. **Cloudinary returns a secure URL** (e.g., `https://res.cloudinary.com/your-cloud/image/upload/v1234567890/gatepass/photo-xyz.jpg`)
5. **URL is saved to database** instead of local file path
6. **Images are served directly from Cloudinary** (no local storage needed)

### Image Storage Structure

All images are stored in Cloudinary under the `gatepass` folder:
- Student photos: `gatepass/photo-[timestamp]-[random].jpg`
- Additional person photos: `gatepass/photo-[timestamp]-[random].jpg`

### Image Format & Size

- **Accepted formats**: JPG, JPEG, PNG only
- **Maximum file size**: 5MB
- **Automatic optimization**: Images are automatically optimized and resized (max 1000x1000px)

## Benefits of Cloudinary

✅ **No local storage needed** - Saves server disk space  
✅ **CDN delivery** - Fast image loading worldwide  
✅ **Automatic optimization** - Images are optimized automatically  
✅ **Secure URLs** - Images are served over HTTPS  
✅ **Scalable** - Handles any number of uploads  
✅ **Backup & recovery** - Images are backed up automatically  

## Troubleshooting

### Error: "Cloudinary configuration error"

**Solution**: Make sure all three Cloudinary environment variables are set correctly in `backend/.env`

### Error: "Invalid API credentials"

**Solution**: 
1. Double-check your Cloudinary credentials
2. Make sure there are no extra spaces in the `.env` file
3. Restart the server after updating `.env`

### Images not displaying

**Solution**: 
- Check if the URL in the database is a full Cloudinary URL (starts with `https://`)
- Verify Cloudinary credentials are correct
- Check browser console for any CORS or loading errors

### File upload fails

**Solution**:
- Check file size (must be under 5MB)
- Verify file format (JPG, JPEG, PNG only)
- Check Cloudinary account limits (free tier has limits)

## Migration from Local Storage

If you were previously using local storage:

1. **Old gate passes** with `/uploads/...` paths will still work (frontend handles both)
2. **New gate passes** will use Cloudinary URLs
3. **No data migration needed** - the system handles both URL types

## Free Tier Limits

Cloudinary free tier includes:
- 25 GB storage
- 25 GB bandwidth per month
- Unlimited transformations

For production with high traffic, consider upgrading to a paid plan.

## Security Notes

- ✅ API Secret is stored in `.env` (not committed to git)
- ✅ Images are stored in a private folder structure
- ✅ URLs are secure (HTTPS)
- ⚠️ Keep your API Secret secure - never expose it in client-side code

