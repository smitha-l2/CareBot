const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 8000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:49326'],
  credentials: true
}));

app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept most common file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Simple in-memory database (H2-like for testing)
let database = {
  patients: [],
  documents: [],
  upload_sessions: []
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    database: 'connected',
    type: 'In-Memory H2-like Database',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: process.uptime(),
    stats: {
      total_patients: database.patients.length,
      total_documents: database.documents.length,
      total_sessions: database.upload_sessions.length
    }
  });
});

// Upload endpoint (with file handling)
app.post('/api/upload-patient-document', upload.single('file'), (req, res) => {
  try {
    const { patientName, contactNumber, uploadedBy, uploadTimestamp } = req.body;
    const uploadedFile = req.file;
    
    if (!patientName || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Patient name and contact number are required'
      });
    }
    
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    // Create patient record
    const patientId = 'patient-' + Date.now();
    const patient = {
      id: patientId,
      name: patientName,
      contactNumber: contactNumber,
      createdAt: new Date().toISOString()
    };
    database.patients.push(patient);
    
    // Create document record
    const documentId = 'doc-' + Date.now();
    const document = {
      id: documentId,
      patientId: patientId,
      originalName: uploadedFile.originalname,
      fileName: uploadedFile.filename,
      filePath: uploadedFile.path,
      fileSize: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      uploadedBy: uploadedBy || 'unknown',
      uploadedAt: uploadTimestamp || new Date().toISOString()
    };
    database.documents.push(document);
    
    // Create upload session record
    const sessionId = 'session-' + Date.now();
    const session = {
      id: sessionId,
      patientId: patientId,
      documentId: documentId,
      status: 'completed',
      createdAt: new Date().toISOString()
    };
    database.upload_sessions.push(session);
    
    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        uploadId: sessionId,
        patient: {
          id: patientId,
          name: patientName,
          contactNumber: contactNumber
        },
        document: {
          id: documentId,
          originalName: uploadedFile.originalname,
          fileSize: uploadedFile.size,
          mimeType: uploadedFile.mimetype
        },
        uploadTimestamp: new Date().toISOString()
      }
    });
    
    console.log(`✅ Upload successful for: ${patientName} (${contactNumber}) - File: ${uploadedFile.originalname}`);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during upload',
      error: error.message
    });
  }
});

// Get documents endpoint
app.get('/api/patient-documents', (req, res) => {
  res.json({
    success: true,
    data: {
      documents: database.documents,
      pagination: {
        page: 1,
        limit: 50,
        total: database.documents.length,
        totalPages: 1
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Carebot Backend Test Server running on port ${PORT}`);
  console.log(`🗄️  Database: In-Memory H2-like Database (testing)`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📤 Upload test: POST http://localhost:${PORT}/api/upload-patient-document`);
  console.log(`📄 Documents: GET http://localhost:${PORT}/api/patient-documents`);
});
