const cloudinary = require('cloudinary').v2;

// Configure Cloudinary (if not already configured)
if (!cloudinary.config().cloud_name) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if not a Cloudinary URL
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Check if it's a Cloudinary URL
  if (!url.includes('cloudinary.com')) return null;
  
  try {
    // Extract public ID from URL
    // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    const afterUpload = parts[1];
    // Remove version prefix if present (v1234567890/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} url - Cloudinary URL
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
const deleteImage = async (url) => {
  const publicId = extractPublicId(url);
  
  if (!publicId) {
    console.warn('Not a Cloudinary URL or invalid URL:', url);
    return { success: false, message: 'Invalid Cloudinary URL' };
  }
  
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return {
      success: result.result === 'ok',
      result: result
    };
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} urls - Array of Cloudinary URLs
 * @returns {Promise<Object>} - Results of deletion attempts
 */
const deleteImages = async (urls) => {
  if (!Array.isArray(urls) || urls.length === 0) {
    return { success: true, deleted: 0, failed: 0 };
  }
  
  const results = await Promise.allSettled(
    urls.map(url => deleteImage(url))
  );
  
  const deleted = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - deleted;
  
  return {
    success: failed === 0,
    deleted,
    failed,
    results
  };
};

module.exports = {
  deleteImage,
  deleteImages,
  extractPublicId
};


