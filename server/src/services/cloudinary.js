const cloudinary = require('cloudinary').v2;

// 配置Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * 上传图片到Cloudinary
 * @param {Buffer} buffer - 图片buffer
 * @returns {Promise<string>} - 返回上传后的URL
 */
const uploadToCloudinary = async (buffer) => {
  try {
    // 将buffer转换为base64
    const b64 = buffer.toString('base64');
    const dataURI = 'data:image/jpeg;base64,' + b64;

    // 上传到Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'educheck/homework',
      resource_type: 'auto'
    });

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary上传失败:', error);
    throw new Error('图片上传失败');
  }
};

module.exports = {
  uploadToCloudinary
};
