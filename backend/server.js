const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import database and services
const { initializeDatabase } = require('./database');
const {
  PatientService,
  DocumentService,
  UploadSessionService,
  DatabaseService
} = require('./services');

const app = express();
const PORT = process.env.PORT || 8000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024; // 10MB

// Create uploads directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename to avoid conflicts
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `${uniqueId}${extension}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Define allowed file types
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
    cb(new Error('Unsupported file type'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE
  },
  fileFilter: fileFilter
});

// API Routes

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const healthData = await DatabaseService.healthCheck();
    res.json({
      ...healthData,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Upload patient document endpoint
app.post('/api/upload-patient-document', upload.single('file'), async (req, res) => {
  let uploadSession = null;
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Extract patient information from request body
    const { patientName, contactNumber, uploadedBy, uploadTimestamp } = req.body;

    // Validate required fields
    if (!patientName || !contactNumber) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Patient name and contact number are required'
      });
    }

    // Create upload session
    uploadSession = await UploadSessionService.createSession({
      uploadedBy: uploadedBy || 'unknown',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    // Find or create patient
    const patient = await PatientService.findOrCreatePatient({
      name: patientName,
      contactNumber: contactNumber
    });

    // Create document record in database
    const document = await DocumentService.createDocument({
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: uploadedBy || 'unknown',
      uploadTimestamp: uploadTimestamp || new Date().toISOString()
    }, patient.id, uploadSession.session_id);

    // Update session stats
    await UploadSessionService.updateSessionStats(
      uploadSession.session_id,
      1,
      req.file.size
    );

    // Complete session
    await UploadSessionService.completeSession(uploadSession.session_id, 'completed');

    // Log upload for debugging
    console.log('📄 Document uploaded and saved to database:', {
      uploadId: document.upload_id,
      patient: patient.name,
      filename: req.file.originalname,
      size: req.file.size,
      patientId: patient.id,
      sessionId: uploadSession.session_id
    });

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Document uploaded and saved successfully',
      data: {
        uploadId: document.upload_id,
        filename: req.file.originalname,
        patient: {
          id: patient.id,
          name: patient.name,
          contactNumber: patient.contact_number
        },
        document: {
          id: document.id,
          size: req.file.size,
          mimeType: req.file.mimetype,
          uploadTimestamp: document.upload_timestamp
        },
        session: {
          id: uploadSession.session_id,
          status: 'completed'
        }
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Mark session as failed if it exists
    if (uploadSession) {
      try {
        await UploadSessionService.completeSession(uploadSession.session_id, 'failed');
      } catch (sessionError) {
        console.error('❌ Error updating session status:', sessionError);
      }
    }
    
    // Delete uploaded file if processing fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    // Send error response based on error type
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.errors.map(e => e.message).join(', ')
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate record: This file may have already been uploaded'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during upload and database save'
    });
  }
});

// Get all uploaded documents (for admin viewing)
app.get('/api/patient-documents', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const result = await DocumentService.getAllDocuments(limit, offset);
    
    // Format response
    const documentsWithPatients = result.rows.map(doc => ({
      uploadId: doc.upload_id,
      originalFilename: doc.original_filename,
      fileSize: doc.file_size,
      mimeType: doc.mime_type,
      uploadTimestamp: doc.upload_timestamp,
      status: doc.status,
      uploadedBy: doc.uploaded_by,
      patient: {
        id: doc.patient.id,
        name: doc.patient.name,
        contactNumber: doc.patient.contact_number
      }
    }));
    
    res.json({
      success: true,
      data: {
        documents: documentsWithPatients,
        pagination: {
          page,
          limit,
          total: result.count,
          totalPages: Math.ceil(result.count / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error retrieving documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving documents from database'
    });
  }
});

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await PatientService.getAllPatients();
    
    const patientsWithDocumentCount = patients.map(patient => ({
      id: patient.id,
      name: patient.name,
      contactNumber: patient.contact_number,
      email: patient.email,
      dateOfBirth: patient.date_of_birth,
      address: patient.address,
      createdAt: patient.created_at,
      documentCount: patient.documents.length,
      recentDocuments: patient.documents.slice(0, 3).map(doc => ({
        uploadId: doc.upload_id,
        filename: doc.original_filename,
        uploadDate: doc.upload_timestamp,
        status: doc.status
      }))
    }));
    
    res.json({
      success: true,
      data: {
        patients: patientsWithDocumentCount,
        total: patients.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error retrieving patients:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patients from database'
    });
  }
});

// Get patient by ID with all documents
app.get('/api/patients/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await PatientService.getPatientById(patientId);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          name: patient.name,
          contactNumber: patient.contact_number,
          email: patient.email,
          dateOfBirth: patient.date_of_birth,
          address: patient.address,
          createdAt: patient.created_at,
          documents: patient.documents.map(doc => ({
            uploadId: doc.upload_id,
            originalFilename: doc.original_filename,
            fileSize: doc.file_size,
            mimeType: doc.mime_type,
            uploadTimestamp: doc.upload_timestamp,
            status: doc.status,
            uploadedBy: doc.uploaded_by,
            notes: doc.notes
          }))
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error retrieving patient:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving patient from database'
    });
  }
});

// Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await DatabaseService.getStats();
    
    res.json({
      success: true,
      data: {
        statistics: {
          totalPatients: parseInt(stats.total_patients),
          totalDocuments: parseInt(stats.total_documents),
          pendingDocuments: parseInt(stats.pending_documents),
          totalSessions: parseInt(stats.total_sessions),
          totalStorageUsed: parseInt(stats.total_storage_used || 0),
          storageUsedMB: Math.round((parseInt(stats.total_storage_used || 0)) / (1024 * 1024) * 100) / 100
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error retrieving statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving database statistics'
    });
  }
});

// Update document status
app.patch('/api/documents/:uploadId/status', async (req, res) => {
  try {
    const { uploadId } = req.params;
    const { status, notes } = req.body;
    
    const validStatuses = ['uploaded', 'processed', 'archived', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }
    
    const document = await DocumentService.updateDocumentStatus(uploadId, status, notes);
    
    res.json({
      success: true,
      message: 'Document status updated successfully',
      data: {
        uploadId: document.upload_id,
        status: document.status,
        notes: document.notes
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating document status:', error);
    
    if (error.message === 'Document not found') {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating document status'
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
      });
    }
  }
  
  if (error.message === 'Unsupported file type') {
    return res.status(415).json({
      success: false,
      message: 'Unsupported file type. Please upload PDF, JPG, PNG, or DOC files only.'
    });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
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
const startServer = async () => {
  try {
    // Initialize database first
    const dbInitialized = await initializeDatabase();
    
    if (!dbInitialized) {
      console.error('❌ Failed to initialize database. Exiting...');
      process.exit(1);
    }
    
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`🚀 Carebot Backend Server running on port ${PORT}`);
      console.log(`📁 Upload directory: ${path.resolve(UPLOAD_DIR)}`);
      console.log(`📏 Max file size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      console.log(`🗄️  Database: JSON H2-like Database initialized`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📊 Statistics: http://localhost:${PORT}/api/stats`);
      console.log(`👥 Patients API: http://localhost:${PORT}/api/patients`);
      console.log(`📄 Documents API: http://localhost:${PORT}/api/patient-documents`);
    });
    
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
// Start the server
startServer();
