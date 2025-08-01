package com.carebot.backend.repository;

import com.carebot.backend.entity.Document;
import com.carebot.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository interface for Document entity
 * Provides CRUD operations and custom queries for Document management
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    /**
     * Find documents by patient
     */
    List<Document> findByPatient(Patient patient);

    /**
     * Find documents by patient ID
     */
    List<Document> findByPatientId(Long patientId);

    /**
     * Find documents by document type
     */
    List<Document> findByDocumentType(String documentType);

    /**
     * Find documents by upload status
     */
    List<Document> findByUploadStatus(String uploadStatus);

    /**
     * Find documents uploaded by specific user
     */
    List<Document> findByUploadedBy(String uploadedBy);

    /**
     * Find documents by upload session ID
     */
    List<Document> findByUploadSessionId(String uploadSessionId);

    /**
     * Find documents uploaded between dates
     */
    @Query("SELECT d FROM Document d WHERE d.uploadedAt BETWEEN :startDate AND :endDate")
    List<Document> findByUploadedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);

    /**
     * Find documents by file type
     */
    List<Document> findByFileType(String fileType);

    /**
     * Find documents by patient and document type
     */
    List<Document> findByPatientAndDocumentType(Patient patient, String documentType);

    /**
     * Count documents by patient
     */
    long countByPatient(Patient patient);

    /**
     * Count documents by patient ID
     */
    long countByPatientId(Long patientId);

    /**
     * Find recent documents for a patient (limit 10)
     */
    @Query("SELECT d FROM Document d WHERE d.patient.id = :patientId ORDER BY d.uploadedAt DESC")
    List<Document> findRecentDocumentsByPatientId(@Param("patientId") Long patientId);

    /**
     * Search documents by name
     */
    @Query("SELECT d FROM Document d WHERE LOWER(d.documentName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.originalFilename) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Document> searchDocuments(@Param("searchTerm") String searchTerm);
}
