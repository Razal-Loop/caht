import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const uploadFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error('Failed to upload file');
  }
};

export const getFileType = (file) => {
  const type = file.type.toLowerCase();
  
  if (type.startsWith('image/')) {
    return 'image';
  } else if (type.startsWith('audio/')) {
    return 'audio';
  } else if (type.startsWith('video/')) {
    return 'video';
  }
  
  return 'unknown';
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg',
    'video/mp4', 'video/webm', 'video/ogg'
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return { valid: false, error: 'File type not supported' };
  }

  return { valid: true };
};

