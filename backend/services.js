const { Patient, Document, UploadSession, getStats, saveDatabase } = require('./database');
const { v4: uuidv4 } = require('uuid');

class PatientService {
  // Find or create patient by name and contact
  static async findOrCreatePatient(patientData) {
    try {
      const { name, contactNumber, email, dateOfBirth, address } = patientData;
      
      // Try to find existing patient by contact number
      let patient = Patient.findByContactNumber(contactNumber);
      
      if (!patient) {
        // Create new patient
        patient = Patient.create({
          name: name.trim(),
          contactNumber: contactNumber.trim(),
          email: email?.trim() || null,
          dateOfBirth: dateOfBirth || null,
          address: address?.trim() || null
        });
        
        await saveDatabase();
        console.log(`✅ Created new patient: ${patient.name} (ID: ${patient.id})`);
      } else {
        // Update existing patient info if needed
        const updates = {};
        if (patient.name !== name.trim()) updates.name = name.trim();
        if (email && patient.email !== email.trim()) updates.email = email.trim();
        if (dateOfBirth && patient.date_of_birth !== dateOfBirth) updates.date_of_birth = dateOfBirth;
        if (address && patient.address !== address.trim()) updates.address = address.trim();
        
        if (Object.keys(updates).length > 0) {
          Patient.update(patient.id, updates);
          await saveDatabase();
          console.log(`✅ Updated patient: ${patient.name} (ID: ${patient.id})`);
        }
      }
      
      return patient;
    } catch (error) {
      console.error('❌ Error in findOrCreatePatient:', error);
      throw error;
    }
  }
  
  // Get all patients with their documents
  static async getAllPatients() {
    try {
      const patients = Patient.findAll();
      
      return patients.map(patient => ({
        ...patient,
        documents: Document.findByPatientId(patient.id).map(doc => ({
          id: doc.id,
          upload_id: doc.upload_id,
          original_filename: doc.original_filename,
          file_size: doc.file_size,
          mime_type: doc.mime_type,
          upload_timestamp: doc.upload_timestamp,
          status: doc.status
        }))
      }));
    } catch (error) {
      console.error('❌ Error in getAllPatients:', error);
      throw error;
    }
  }
  
  // Get patient by ID
  static async getPatientById(patientId) {
    try {
      const patient = Patient.findById(patientId);
      if (!patient) return null;
      
      return {
        ...patient,
        documents: Document.findByPatientId(patientId)
      };
    } catch (error) {
      console.error('❌ Error in getPatientById:', error);
      throw error;
    }
  }
}

class DocumentService {
  // Create new document record
  static async createDocument(documentData, patientId, sessionId = null) {
    try {
      const uploadId = uuidv4();
      
      const document = Document.create({
        uploadId,
        originalFilename: documentData.originalFilename,
        storedFilename: documentData.storedFilename,
        filePath: documentData.filePath,
        fileSize: documentData.fileSize,
        mimeType: documentData.mimeType,
        uploadedBy: documentData.uploadedBy,
        uploadTimestamp: documentData.uploadTimestamp || new Date().toISOString(),
        patientId,
        sessionId,
        notes: documentData.notes || null
      });
      
      await saveDatabase();
      console.log(`✅ Created document record: ${document.original_filename} (Upload ID: ${uploadId})`);
      return document;
    } catch (error) {
      console.error('❌ Error in createDocument:', error);
      throw error;
    }
  }
  
  // Get all documents with patient info
  static async getAllDocuments(limit = 100, offset = 0) {
    try {
      const result = Document.findAll(limit, offset);
      
      // Enrich documents with patient information
      const documentsWithPatients = result.rows.map(doc => {
        const patient = Patient.findById(doc.patient_id);
        return {
          ...doc,
          patient: patient ? {
            id: patient.id,
            name: patient.name,
            contact_number: patient.contact_number
          } : null
        };
      });
      
      return {
        rows: documentsWithPatients,
        count: result.count
      };
    } catch (error) {
      console.error('❌ Error in getAllDocuments:', error);
      throw error;
    }
  }
  
  // Get documents by patient
  static async getDocumentsByPatient(patientId) {
    try {
      return Document.findByPatientId(patientId);
    } catch (error) {
      console.error('❌ Error in getDocumentsByPatient:', error);
      throw error;
    }
  }
  
  // Get document by upload ID
  static async getDocumentByUploadId(uploadId) {
    try {
      const document = Document.findByUploadId(uploadId);
      if (!document) return null;
      
      const patient = Patient.findById(document.patient_id);
      return {
        ...document,
        patient
      };
    } catch (error) {
      console.error('❌ Error in getDocumentByUploadId:', error);
      throw error;
    }
  }
  
  // Update document status
  static async updateDocumentStatus(uploadId, status, notes = null) {
    try {
      const document = Document.findByUploadId(uploadId);
      
      if (!document) {
        throw new Error('Document not found');
      }
      
      const updates = { status };
      if (notes) updates.notes = notes;
      
      const updatedDocument = Document.update(uploadId, updates);
      await saveDatabase();
      
      console.log(`✅ Updated document status: ${uploadId} -> ${status}`);
      return updatedDocument;
    } catch (error) {
      console.error('❌ Error in updateDocumentStatus:', error);
      throw error;
    }
  }
  
  // Delete document (soft delete by updating status)
  static async deleteDocument(uploadId) {
    try {
      return await this.updateDocumentStatus(uploadId, 'deleted');
    } catch (error) {
      console.error('❌ Error in deleteDocument:', error);
      throw error;
    }
  }
}

class UploadSessionService {
  // Create new upload session
  static async createSession(sessionData) {
    try {
      const sessionId = uuidv4();
      
      const session = UploadSession.create({
        sessionId,
        uploadedBy: sessionData.uploadedBy,
        ipAddress: sessionData.ipAddress,
        userAgent: sessionData.userAgent
      });
      
      await saveDatabase();
      console.log(`✅ Created upload session: ${sessionId}`);
      return session;
    } catch (error) {
      console.error('❌ Error in createSession:', error);
      throw error;
    }
  }
  
  // Update session stats
  static async updateSessionStats(sessionId, totalFiles, totalSize) {
    try {
      const session = UploadSession.update(sessionId, {
        total_files: totalFiles,
        total_size: totalSize
      });
      
      if (session) {
        await saveDatabase();
      }
      
      return session;
    } catch (error) {
      console.error('❌ Error in updateSessionStats:', error);
      throw error;
    }
  }
  
  // Complete session
  static async completeSession(sessionId, status = 'completed') {
    try {
      const session = UploadSession.update(sessionId, { status });
      
      if (session) {
        await saveDatabase();
        console.log(`✅ Session ${sessionId} marked as ${status}`);
      }
      
      return session;
    } catch (error) {
      console.error('❌ Error in completeSession:', error);
      throw error;
    }
  }
}

// Database statistics and health check
class DatabaseService {
  static async getStats() {
    try {
      return getStats();
    } catch (error) {
      console.error('❌ Error in getStats:', error);
      throw error;
    }
  }
  
  static async healthCheck() {
    try {
      const stats = await this.getStats();
      
      return {
        status: 'healthy',
        database: 'connected',
        type: 'JSON H2-like Database',
        stats
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message
      };
    }
  }
}

module.exports = {
  PatientService,
  DocumentService,
  UploadSessionService,
  DatabaseService
};
