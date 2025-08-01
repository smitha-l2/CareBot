// API Configuration for Carebot
export const API_CONFIG = {
  // Base URL for the backend API
  // In development, you might use: http://localhost:8000/api
  // In production, use your actual server URL
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  
  // API Endpoints
  ENDPOINTS: {
    UPLOAD_DOCUMENT: '/upload-patient-document',
    GET_DOCUMENTS: '/patient-documents',
    DELETE_DOCUMENT: '/delete-document',
    CHAT: '/chat',
    HEALTH_CHECK: '/health'
  },
  
  // Request configuration
  TIMEOUT: 30000, // 30 seconds
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  
  // Supported file types
  SUPPORTED_FILE_TYPES: [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  
  // File extensions for validation
  SUPPORTED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'],
  
  // HTTP Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    // Add any default headers here
  }
};

// Helper function to get full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to validate file type
export const isValidFileType = (file) => {
  return API_CONFIG.SUPPORTED_FILE_TYPES.includes(file.type);
};

// Helper function to validate file size
export const isValidFileSize = (file) => {
  return file.size <= API_CONFIG.MAX_FILE_SIZE;
};

// Helper function to validate file extension
export const isValidFileExtension = (fileName) => {
  const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  return API_CONFIG.SUPPORTED_EXTENSIONS.includes(extension);
};
