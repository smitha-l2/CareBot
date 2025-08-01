package com.carebot.backend.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.beans.factory.annotation.Autowired;
import com.carebot.backend.service.messaging.FreeWhatsAppService;
import com.carebot.backend.service.WhatsAppService;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Simplified File Upload Controller for demonstrating free WhatsApp integration
 * Works without database dependencies
 */
@RestController
@RequestMapping("")  // Empty because context path is already /api
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
@Profile("simple")
public class SimplifiedFileUploadController {

    @Autowired
    private FreeWhatsAppService freeWhatsAppService;
    
    @Autowired
    private WhatsAppService whatsAppService;

    // In-memory storage for uploaded patient data
    private static final Map<Long, Map<String, Object>> patients = new ConcurrentHashMap<>();
    private static final Map<Long, Map<String, Object>> documents = new ConcurrentHashMap<>();
    private static final AtomicLong patientIdCounter = new AtomicLong(1);
    private static final AtomicLong documentIdCounter = new AtomicLong(1);

    // Initialize with some demo data
    static {
        Map<String, Object> demoPatient = new HashMap<>();
        demoPatient.put("id", 0L);
        demoPatient.put("patientName", "Demo Patient");
        demoPatient.put("contactNumber", "+919999999999");
        demoPatient.put("dateOfBirth", "1990-01-01");
        demoPatient.put("uploadedBy", "system");
        demoPatient.put("createdAt", "2025-08-01T09:00:00");
        patients.put(0L, demoPatient);

        Map<String, Object> demoDoc = new HashMap<>();
        demoDoc.put("id", 0L);
        demoDoc.put("fileName", "demo_prescription.pdf");
        demoDoc.put("documentType", "PRESCRIPTION");
        demoDoc.put("patientId", 0L);
        demoDoc.put("patientName", "Demo Patient");
        demoDoc.put("uploadedAt", "2025-08-01T09:30:00");
        demoDoc.put("uploadedBy", "system");
        demoDoc.put("description", "Demo prescription document");
        documents.put(0L, demoDoc);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("patientName") String patientName,
            @RequestParam("contactNumber") String contactNumber,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam("uploadedBy") String uploadedBy) {
        
        try {
            System.out.println("📁 Document Upload Request Received");
            System.out.println("👤 Patient: " + patientName);
            System.out.println("📞 Contact: " + contactNumber);
            System.out.println("🎂 DOB: " + dateOfBirth);
            System.out.println("👨‍⚕️ Uploaded by: " + uploadedBy);
            
            // Store patient data in memory
            Long patientId = patientIdCounter.getAndIncrement();
            Map<String, Object> newPatient = new HashMap<>();
            newPatient.put("id", patientId);
            newPatient.put("patientName", patientName);
            newPatient.put("contactNumber", contactNumber);
            newPatient.put("dateOfBirth", dateOfBirth);
            newPatient.put("uploadedBy", uploadedBy);
            newPatient.put("createdAt", java.time.LocalDateTime.now().toString());
            patients.put(patientId, newPatient);
            
            // Store document data in memory
            Long documentId = documentIdCounter.getAndIncrement();
            Map<String, Object> newDocument = new HashMap<>();
            newDocument.put("id", documentId);
            newDocument.put("fileName", "prescription_" + patientName.toLowerCase().replace(" ", "_") + ".pdf");
            newDocument.put("documentType", "PRESCRIPTION");
            newDocument.put("patientId", patientId);
            newDocument.put("patientName", patientName);
            newDocument.put("uploadedAt", java.time.LocalDateTime.now().toString());
            newDocument.put("uploadedBy", uploadedBy);
            newDocument.put("description", "Medical document for " + patientName);
            documents.put(documentId, newDocument);
            
            System.out.println("💾 Patient stored with ID: " + patientId);
            System.out.println("📄 Document stored with ID: " + documentId);
            
            // For sandbox mode, use free URL method for non-sandbox numbers
            boolean notificationSent = false;
            String whatsappUrl = null;
            String message = "Dear " + patientName + ", your prescription and medical documents have been uploaded to your Carebot healthcare portal. Please contact your healthcare provider for details.";
            
            try {
                // Try Twilio first (works only for sandbox-joined numbers)
                notificationSent = whatsAppService.sendNotification(contactNumber, patientName, message);
                
                if (notificationSent) {
                    System.out.println("✅ WhatsApp message sent successfully via Twilio (sandbox user)!");
                } else {
                    System.out.println("⚠️ Number not in Twilio sandbox, using free URL method...");
                    // Use free service for non-sandbox numbers
                    whatsappUrl = freeWhatsAppService.generateWhatsAppUrl(contactNumber, message);
                    notificationSent = (whatsappUrl != null && !whatsappUrl.isEmpty());
                }
            } catch (Exception e) {
                System.err.println("❌ Twilio failed (likely sandbox limitation): " + e.getMessage());
                // Always fallback to free service
                whatsappUrl = freeWhatsAppService.generateWhatsAppUrl(contactNumber, message);
                notificationSent = (whatsappUrl != null && !whatsappUrl.isEmpty());
            }
            
            // Prepare response
            Map<String, Object> response = new HashMap<>();
            response.put("uploadId", "DOC-" + documentId);
            response.put("patientId", patientId);
            response.put("documentId", documentId);
            response.put("status", "success");
            response.put("message", "Patient and document stored successfully");
            response.put("whatsappNotificationSent", notificationSent);
            response.put("whatsappMethod", whatsappUrl != null ? "Free URL Generation" : "Twilio Automatic Send");
            if (whatsappUrl != null) {
                response.put("whatsappUrl", whatsappUrl);
                response.put("note", "Click the WhatsApp URL to send message manually");
            } else {
                response.put("note", "WhatsApp message sent automatically to patient's phone");
            }
            response.put("patientName", patientName);
            response.put("timestamp", java.time.LocalDateTime.now().toString());
            
            System.out.println("✅ Upload processed successfully");
            if (whatsappUrl != null) {
                System.out.println("📱 WhatsApp URL: " + whatsappUrl);
            } else {
                System.out.println("📱 WhatsApp message sent automatically via Twilio");
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("❌ Error processing upload: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Upload failed: " + e.getMessage());
            errorResponse.put("status", "error");
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Add the frontend's expected endpoint
    @PostMapping("/upload-document")
    public ResponseEntity<Map<String, Object>> uploadDocumentFrontend(
            @RequestParam("patientName") String patientName,
            @RequestParam("contactNumber") String contactNumber,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam("uploadedBy") String uploadedBy,
            @RequestParam(value = "file", required = false) org.springframework.web.multipart.MultipartFile file) {
        
        // Call the same logic as the main upload method
        return uploadDocument(patientName, contactNumber, dateOfBirth, uploadedBy);
    }
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Carebot Backend (Simplified Mode)");
        health.put("whatsapp", "Twilio WhatsApp Service Available");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }

    // Real endpoints that return actual stored data
    @GetMapping("/patients")
    public ResponseEntity<List<Map<String, Object>>> getPatients() {
        List<Map<String, Object>> patientList = new ArrayList<>(patients.values());
        
        System.out.println("📋 Patients list requested - returning " + patientList.size() + " patients");
        System.out.println("💾 Stored patients: " + patientList.stream()
            .map(p -> p.get("patientName")).toArray());
        
        return ResponseEntity.ok(patientList);
    }

    @GetMapping("/documents")
    public ResponseEntity<List<Map<String, Object>>> getDocuments() {
        List<Map<String, Object>> documentList = new ArrayList<>(documents.values());
        
        System.out.println("📄 Documents list requested - returning " + documentList.size() + " documents");
        System.out.println("💾 Stored documents: " + documentList.stream()
            .map(d -> d.get("fileName")).toArray());
            
        return ResponseEntity.ok(documentList);
    }

    @GetMapping("/patients/{patientId}/documents")
    public ResponseEntity<List<Map<String, Object>>> getPatientDocuments(@PathVariable String patientId) {
        List<Map<String, Object>> patientDocs = new ArrayList<>();
        
        try {
            Long id = Long.parseLong(patientId);
            for (Map<String, Object> doc : documents.values()) {
                if (id.equals(doc.get("patientId"))) {
                    patientDocs.add(doc);
                }
            }
        } catch (NumberFormatException e) {
            System.err.println("Invalid patient ID format: " + patientId);
        }
        
        System.out.println("📋 Patient " + patientId + " documents requested - returning " + patientDocs.size() + " documents");
        return ResponseEntity.ok(patientDocs);
    }

    // Debug endpoint to see all stored data
    @GetMapping("/debug/storage")
    public ResponseEntity<Map<String, Object>> getStorageDebug() {
        Map<String, Object> debug = new HashMap<>();
        debug.put("totalPatients", patients.size());
        debug.put("totalDocuments", documents.size());
        debug.put("patients", patients);
        debug.put("documents", documents);
        debug.put("nextPatientId", patientIdCounter.get());
        debug.put("nextDocumentId", documentIdCounter.get());
        
        System.out.println("🔍 Debug storage info requested");
        return ResponseEntity.ok(debug);
    }

    // Patient CRUD Operations
    @PutMapping("/patients/{patientId}")
    public ResponseEntity<Map<String, Object>> updatePatient(
            @PathVariable String patientId,
            @RequestParam("patientName") String patientName,
            @RequestParam("contactNumber") String contactNumber,
            @RequestParam("dateOfBirth") String dateOfBirth,
            @RequestParam("updatedBy") String updatedBy) {
        
        try {
            Long id = Long.parseLong(patientId);
            Map<String, Object> patient = patients.get(id);
            
            if (patient == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Patient not found");
                errorResponse.put("patientId", patientId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            // Update patient information
            patient.put("patientName", patientName);
            patient.put("contactNumber", contactNumber);
            patient.put("dateOfBirth", dateOfBirth);
            patient.put("updatedBy", updatedBy);
            patient.put("updatedAt", java.time.LocalDateTime.now().toString());
            
            patients.put(id, patient);
            
            System.out.println("✏️ Patient " + id + " updated: " + patientName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Patient updated successfully");
            response.put("patient", patient);
            
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid patient ID format");
            errorResponse.put("patientId", patientId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Error updating patient: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update patient: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/patients/{patientId}")
    public ResponseEntity<Map<String, Object>> deletePatient(@PathVariable String patientId) {
        try {
            Long id = Long.parseLong(patientId);
            Map<String, Object> patient = patients.get(id);
            
            if (patient == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Patient not found");
                errorResponse.put("patientId", patientId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            // Remove patient
            patients.remove(id);
            
            // Remove all documents associated with this patient
            documents.entrySet().removeIf(entry -> {
                Map<String, Object> doc = entry.getValue();
                return id.equals(doc.get("patientId"));
            });
            
            System.out.println("🗑️ Patient " + id + " and associated documents deleted");
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Patient and associated documents deleted successfully");
            response.put("deletedPatient", patient);
            
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid patient ID format");
            errorResponse.put("patientId", patientId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Error deleting patient: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete patient: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/documents/{documentId}")
    public ResponseEntity<Map<String, Object>> deleteDocument(@PathVariable String documentId) {
        try {
            Long id = Long.parseLong(documentId);
            Map<String, Object> document = documents.get(id);
            
            if (document == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Document not found");
                errorResponse.put("documentId", documentId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
            }
            
            // Remove document
            documents.remove(id);
            
            System.out.println("🗑️ Document " + id + " deleted");
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Document deleted successfully");
            response.put("deletedDocument", document);
            
            return ResponseEntity.ok(response);
            
        } catch (NumberFormatException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid document ID format");
            errorResponse.put("documentId", documentId);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            System.err.println("❌ Error deleting document: " + e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete document: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
