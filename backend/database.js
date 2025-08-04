const { Low } = require('lowdb');
const { JSONFileSync } = require('lowdb/node');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Database file path
const dbFile = path.join(__dirname, 'carebot-h2.json');

// Initialize LowDB with JSON file adapter (H2-like functionality)
const adapter = new JSONFileSync(dbFile);
const db = new Low(adapter, {});

// Default database structure (H2-like schema)
const defaultData = {
  patients: [],
  documents: [],
  upload_sessions: [],
  metadata: {
    version: '1.0.0',
    created_at: new Date().toISOString(),
    last_updated: new Date().toISOString()
  }
};

// Patient Model Helper
class Patient {
  static create(data) {
    const patient = {
      id: uuidv4(),
      name: data.name,
      contact_number: data.contactNumber,
      email: data.email || null,
      date_of_birth: data.dateOfBirth || null,
      address: data.address || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.data.patients.push(patient);
    db.data.metadata.last_updated = new Date().toISOString();
    return patient;
  }
  
  static findByContactNumber(contactNumber) {
    return db.data.patients.find(p => p.contact_number === contactNumber);
  }
  
  static findById(id) {
    return db.data.patients.find(p => p.id === id);
  }
  
  static findAll() {
    return db.data.patients.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }
  
  static update(id, updates) {
    const patient = this.findById(id);
    if (patient) {
      Object.assign(patient, updates, { updated_at: new Date().toISOString() });
      db.data.metadata.last_updated = new Date().toISOString();
    }
    return patient;
  }
}

// Document Model Helper
class Document {
  static create(data) {
    const document = {
      id: uuidv4(),
      upload_id: data.uploadId || uuidv4(),
      original_filename: data.originalFilename,
      stored_filename: data.storedFilename,
      file_path: data.filePath,
      file_size: data.fileSize,
      mime_type: data.mimeType,
      uploaded_by: data.uploadedBy,
      upload_timestamp: data.uploadTimestamp || new Date().toISOString(),
      server_timestamp: new Date().toISOString(),
      status: data.status || 'uploaded',
      notes: data.notes || null,
      patient_id: data.patientId,
      session_id: data.sessionId || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.data.documents.push(document);
    db.data.metadata.last_updated = new Date().toISOString();
    return document;
  }
  
  static findByUploadId(uploadId) {
    return db.data.documents.find(d => d.upload_id === uploadId);
  }
  
  static findById(id) {
    return db.data.documents.find(d => d.id === id);
  }
  
  static findByPatientId(patientId) {
    return db.data.documents
      .filter(d => d.patient_id === patientId)
      .sort((a, b) => new Date(b.upload_timestamp) - new Date(a.upload_timestamp));
  }
  
  static findAll(limit = 100, offset = 0) {
    const sorted = db.data.documents.sort((a, b) => new Date(b.upload_timestamp) - new Date(a.upload_timestamp));
    const total = sorted.length;
    const documents = sorted.slice(offset, offset + limit);
    
    return {
      rows: documents,
      count: total
    };
  }
  
  static update(uploadId, updates) {
    const document = this.findByUploadId(uploadId);
    if (document) {
      Object.assign(document, updates, { updated_at: new Date().toISOString() });
      db.data.metadata.last_updated = new Date().toISOString();
    }
    return document;
  }
}

// Upload Session Model Helper
class UploadSession {
  static create(data) {
    const session = {
      id: uuidv4(),
      session_id: data.sessionId || uuidv4(),
      uploaded_by: data.uploadedBy,
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      total_files: data.totalFiles || 0,
      total_size: data.totalSize || 0,
      status: data.status || 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    db.data.upload_sessions.push(session);
    db.data.metadata.last_updated = new Date().toISOString();
    return session;
  }
  
  static findBySessionId(sessionId) {
    return db.data.upload_sessions.find(s => s.session_id === sessionId);
  }
  
  static update(sessionId, updates) {
    const session = this.findBySessionId(sessionId);
    if (session) {
      Object.assign(session, updates, { updated_at: new Date().toISOString() });
      db.data.metadata.last_updated = new Date().toISOString();
    }
    return session;
  }
}

// Database initialization function (H2-like setup)
const initializeDatabase = async () => {
  try {
    // Read existing data or initialize with defaults
    db.read();
    
    // Initialize with default data if file doesn't exist or is empty
    if (!db.data) {
      db.data = defaultData;
      db.write();
      console.log('✅ H2-like JSON database initialized with default structure.');
    } else {
      console.log('✅ H2-like JSON database loaded successfully.');
    }
    
    // Ensure all required tables exist
    if (!db.data.patients) db.data.patients = [];
    if (!db.data.documents) db.data.documents = [];
    if (!db.data.upload_sessions) db.data.upload_sessions = [];
    if (!db.data.metadata) {
      db.data.metadata = {
        version: '1.0.0',
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
    }
    
    db.write();
    
    console.log(`📊 Database Stats: ${db.data.patients.length} patients, ${db.data.documents.length} documents, ${db.data.upload_sessions.length} sessions`);
    
    return true;
  } catch (error) {
    console.error('❌ Unable to initialize H2-like database:', error);
    return false;
  }
};

// Database statistics helper
const getStats = () => {
  return {
    total_patients: db.data.patients.length,
    total_documents: db.data.documents.length,
    pending_documents: db.data.documents.filter(d => d.status === 'uploaded').length,
    total_sessions: db.data.upload_sessions.length,
    total_storage_used: db.data.documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0)
  };
};

// Save data to disk (H2-like commit)
const saveDatabase = async () => {
  try {
    db.data.metadata.last_updated = new Date().toISOString();
    db.write();
    return true;
  } catch (error) {
    console.error('❌ Error saving database:', error);
    return false;
  }
};

// Export models and database functions
module.exports = {
  db,
  Patient,
  Document,
  UploadSession,
  initializeDatabase,
  getStats,
  saveDatabase
};
