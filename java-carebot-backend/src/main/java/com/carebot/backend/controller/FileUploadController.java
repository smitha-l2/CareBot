package com.carebot.backend.controller;

import com.carebot.backend.entity.Document;
import com.carebot.backend.entity.Patient;
import com.carebot.backend.repository.DocumentRepository;
import com.carebot.backend.repository.PatientRepository;
import com.carebot.backend.service.WhatsAppService;
import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.context.annotation.Profile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * REST Controller for handling file uploads and patient data
 * 
 * This controller provides endpoints for:
 * - Uploading prescription documents
 * - Managing patient information
 * - Document retrieval and management
 */
@RestController
@RequestMapping("")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "http://localhost:3002", "http://127.0.0.1:3002"})
@Profile("!simple")  // Don't load this controller in simple mode
public class FileUploadController {

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private WhatsAppService whatsAppService;

    @Value("${carebot.upload.directory:uploads}")
    private String uploadDirectory;

    @Value("${carebot.upload.max-file-size:10485760}") // 10MB default
    private long maxFileSize;

    /**
     * Handle preflight OPTIONS requests for upload endpoint
     */
    @RequestMapping(value = "/upload-document", method = RequestMethod.OPTIONS)
    public ResponseEntity<Void> handleUploadDocumentOptions() {
        return ResponseEntity.ok().build();
    }

    /**
     * Upload prescription document with patient information
     */
    @PostMapping("/upload-document")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientName") String patientName,
            @RequestParam("contactNumber") String contactNumber,
            @RequestParam(value = "dateOfBirth", required = false) String dateOfBirth,
            @RequestParam(value = "uploadedBy", defaultValue = "admin") String uploadedBy,
            @RequestParam(value = "uploadTimestamp", required = false) String uploadTimestamp,
            @RequestParam(value = "documentType", defaultValue = "PRESCRIPTION") String documentType,
            @RequestParam(value = "description", required = false) String description) {

        Map<String, Object> response = new HashMap<>();
        
        try {
            // Validate input
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "Please select a file to upload");
                return ResponseEntity.badRequest().body(response);
            }

            if (patientName == null || patientName.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Patient name is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (contactNumber == null || contactNumber.trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Contact number is required");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file size
            if (file.getSize() > maxFileSize) {
                response.put("success", false);
                response.put("message", "File size exceeds maximum allowed size of " + (maxFileSize / 1024 / 1024) + "MB");
                return ResponseEntity.badRequest().body(response);
            }

            // Validate file type
            String originalFilename = file.getOriginalFilename();
            String fileExtension = FilenameUtils.getExtension(originalFilename).toLowerCase();
            List<String> allowedExtensions = Arrays.asList("pdf", "jpg", "jpeg", "png", "doc", "docx");
            
            if (!allowedExtensions.contains(fileExtension)) {
                response.put("success", false);
                response.put("message", "File type not supported. Allowed types: " + String.join(", ", allowedExtensions));
                return ResponseEntity.badRequest().body(response);
            }

            // Find or create patient
            Patient patient = patientRepository.findByContactNumber(contactNumber)
                    .orElseGet(() -> {
                        Patient newPatient = new Patient();
                        newPatient.setPatientName(patientName.trim());
                        newPatient.setContactNumber(contactNumber.trim());
                        newPatient.setCreatedBy(uploadedBy);
                        newPatient.setStatus("ACTIVE");
                        
                        // Set date of birth if provided
                        if (dateOfBirth != null && !dateOfBirth.trim().isEmpty()) {
                            try {
                                LocalDateTime dob = LocalDateTime.parse(dateOfBirth + "T00:00:00");
                                newPatient.setDateOfBirth(dob);
                            } catch (Exception e) {
                                System.out.println("Warning: Could not parse date of birth: " + dateOfBirth);
                            }
                        }
                        
                        return patientRepository.save(newPatient);
                    });

            // Update patient info if different
            boolean patientUpdated = false;
            if (!patient.getPatientName().equals(patientName.trim())) {
                patient.setPatientName(patientName.trim());
                patientUpdated = true;
            }
            
            // Update date of birth if provided and different
            if (dateOfBirth != null && !dateOfBirth.trim().isEmpty()) {
                try {
                    LocalDateTime dob = LocalDateTime.parse(dateOfBirth + "T00:00:00");
                    if (patient.getDateOfBirth() == null || !patient.getDateOfBirth().equals(dob)) {
                        patient.setDateOfBirth(dob);
                        patientUpdated = true;
                    }
                } catch (Exception e) {
                    System.out.println("Warning: Could not parse date of birth: " + dateOfBirth);
                }
            }
            
            if (patientUpdated) {
                patientRepository.save(patient);
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String uniqueFilename = timestamp + "_" + patient.getId() + "_" + originalFilename;
            Path filePath = uploadPath.resolve(uniqueFilename);

            // Save file to disk
            Files.copy(file.getInputStream(), filePath);

            // Create document record
            Document document = new Document();
            document.setDocumentName(originalFilename);
            document.setOriginalFilename(originalFilename);
            document.setFilePath(filePath.toString());
            document.setFileSize(file.getSize());
            document.setFileType(file.getContentType());
            document.setDocumentType(documentType);
            document.setDescription(description);
            document.setUploadedBy(uploadedBy);
            document.setUploadStatus("UPLOADED");
            document.setUploadSessionId(UUID.randomUUID().toString());
            document.setPatient(patient);

            Document savedDocument = documentRepository.save(document);

            // Send WhatsApp notification to patient
            boolean whatsappSent = false;
            try {
                if (whatsAppService.isWhatsAppEnabled()) {
                    whatsappSent = whatsAppService.sendPrescriptionNotification(patient, savedDocument);
                    if (whatsappSent) {
                        System.out.println("WhatsApp notification sent successfully to " + patient.getContactNumber());
                    } else {
                        System.out.println("Failed to send WhatsApp notification to " + patient.getContactNumber());
                    }
                } else {
                    System.out.println("WhatsApp service is disabled - notification not sent");
                }
            } catch (Exception e) {
                System.out.println("Error sending WhatsApp notification: " + e.getMessage());
                // Don't fail the upload if WhatsApp fails
            }

            // Prepare success response
            response.put("success", true);
            response.put("message", "Document uploaded successfully");
            response.put("uploadId", savedDocument.getId());
            response.put("documentId", savedDocument.getId());
            response.put("patientId", patient.getId());
            response.put("patientName", patient.getPatientName());
            response.put("contactNumber", patient.getContactNumber());
            response.put("fileName", originalFilename);
            response.put("fileSize", file.getSize());
            response.put("uploadTimestamp", savedDocument.getUploadedAt());
            response.put("uploadSessionId", savedDocument.getUploadSessionId());
            response.put("whatsappNotificationSent", whatsappSent);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get all patients
     */
    @GetMapping("/patients")
    public ResponseEntity<List<Patient>> getAllPatients() {
        try {
            List<Patient> patients = patientRepository.findAll();
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get patient by ID
     */
    @GetMapping("/patients/{id}")
    public ResponseEntity<Patient> getPatientById(@PathVariable Long id) {
        try {
            Optional<Patient> patient = patientRepository.findById(id);
            if (patient.isPresent()) {
                return ResponseEntity.ok(patient.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Search patients by name or contact
     */
    @GetMapping("/patients/search")
    public ResponseEntity<List<Patient>> searchPatients(@RequestParam String query) {
        try {
            List<Patient> patients = patientRepository.searchPatients(query);
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get documents by patient ID
     */
    @GetMapping("/patients/{patientId}/documents")
    public ResponseEntity<List<Document>> getPatientDocuments(@PathVariable Long patientId) {
        try {
            List<Document> documents = documentRepository.findByPatientId(patientId);
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get all documents
     */
    @GetMapping("/documents")
    public ResponseEntity<List<Document>> getAllDocuments() {
        try {
            List<Document> documents = documentRepository.findAll();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Get document by ID
     */
    @GetMapping("/documents/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable Long id) {
        try {
            Optional<Document> document = documentRepository.findById(id);
            if (document.isPresent()) {
                return ResponseEntity.ok(document.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "Carebot Backend");
        health.put("version", "1.0.0");
        health.put("database", "H2");
        health.put("uploadDirectory", uploadDirectory);
        
        // Check upload directory
        File uploadDir = new File(uploadDirectory);
        health.put("uploadDirectoryExists", uploadDir.exists());
        health.put("uploadDirectoryWritable", uploadDir.canWrite());
        
        return ResponseEntity.ok(health);
    }

    /**
     * Get system statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            long totalPatients = patientRepository.count();
            long totalDocuments = documentRepository.count();
            long activePatients = patientRepository.findActivePatients().size();
            
            stats.put("totalPatients", totalPatients);
            stats.put("totalDocuments", totalDocuments);
            stats.put("activePatients", activePatients);
            stats.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Test WhatsApp connection
     */
    @PostMapping("/whatsapp/test")
    public ResponseEntity<Map<String, Object>> testWhatsApp() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (!whatsAppService.isWhatsAppEnabled()) {
                response.put("success", false);
                response.put("message", "WhatsApp service is disabled");
                response.put("enabled", false);
                return ResponseEntity.ok(response);
            }
            
            boolean testResult = whatsAppService.testConnection();
            response.put("success", testResult);
            response.put("message", testResult ? "WhatsApp connection test successful" : "WhatsApp connection test failed");
            response.put("enabled", true);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "WhatsApp test failed: " + e.getMessage());
            response.put("enabled", whatsAppService.isWhatsAppEnabled());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Send custom WhatsApp notification
     */
    @PostMapping("/whatsapp/send")
    public ResponseEntity<Map<String, Object>> sendWhatsAppNotification(
            @RequestParam("contactNumber") String contactNumber,
            @RequestParam("patientName") String patientName,
            @RequestParam("message") String message) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            if (!whatsAppService.isWhatsAppEnabled()) {
                response.put("success", false);
                response.put("message", "WhatsApp service is disabled");
                return ResponseEntity.badRequest().body(response);
            }
            
            boolean sent = whatsAppService.sendNotification(contactNumber, patientName, message);
            
            response.put("success", sent);
            response.put("message", sent ? "WhatsApp notification sent successfully" : "Failed to send WhatsApp notification");
            response.put("recipient", contactNumber);
            response.put("timestamp", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error sending WhatsApp notification: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Get WhatsApp service status
     */
    @GetMapping("/whatsapp/status")
    public ResponseEntity<Map<String, Object>> getWhatsAppStatus() {
        Map<String, Object> status = new HashMap<>();
        
        status.put("enabled", whatsAppService.isWhatsAppEnabled());
        status.put("service", "Twilio WhatsApp API");
        status.put("timestamp", LocalDateTime.now());
        
        return ResponseEntity.ok(status);
    }
}
