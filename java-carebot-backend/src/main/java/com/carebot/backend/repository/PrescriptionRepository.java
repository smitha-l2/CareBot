package com.carebot.backend.repository;

import com.carebot.backend.entity.Prescription;
import com.carebot.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Prescription entity
 * Provides data access methods for prescription management
 */
@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    // Find prescriptions by patient
    List<Prescription> findByPatientId(Long patientId);
    
    List<Prescription> findByPatient(Patient patient);

    // Find by medication name
    List<Prescription> findByMedicationNameContainingIgnoreCase(String medicationName);

    // Find active prescriptions
    @Query("SELECT p FROM Prescription p WHERE p.status = 'ACTIVE' OR p.status IS NULL")
    List<Prescription> findActivePrescriptions();

    // Find recent prescriptions
    @Query("SELECT p FROM Prescription p WHERE p.createdAt >= :since ORDER BY p.createdAt DESC")
    List<Prescription> findRecentPrescriptions(@Param("since") LocalDateTime since);

    // Find prescriptions by patient and medication
    @Query("SELECT p FROM Prescription p WHERE p.patient.id = :patientId AND p.medicationName = :medicationName")
    List<Prescription> findByPatientAndMedication(@Param("patientId") Long patientId, @Param("medicationName") String medicationName);

    // Search prescriptions
    @Query("""
        SELECT p FROM Prescription p 
        WHERE (LOWER(p.medicationName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(p.patient.patientName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(p.dosage) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
    """)
    List<Prescription> searchPrescriptions(@Param("searchTerm") String searchTerm);

    // Count prescriptions
    @Query("SELECT COUNT(p) FROM Prescription p WHERE p.patient.id = :patientId")
    Long countPrescriptionsByPatient(@Param("patientId") Long patientId);
}
