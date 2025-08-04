package com.carebot.backend.repository;

import com.carebot.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Patient entity
 * Provides CRUD operations and custom queries for Patient management
 */
@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    /**
     * Find patient by contact number
     */
    Optional<Patient> findByContactNumber(String contactNumber);

    /**
     * Find patients by name (case-insensitive partial match)
     */
    @Query("SELECT p FROM Patient p WHERE LOWER(p.patientName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Patient> findByPatientNameContainingIgnoreCase(@Param("name") String name);

    /**
     * Find patients by status
     */
    List<Patient> findByStatus(String status);

    /**
     * Find patients by email
     */
    Optional<Patient> findByEmail(String email);

    /**
     * Check if patient exists by contact number
     */
    boolean existsByContactNumber(String contactNumber);

    /**
     * Check if patient exists by email
     */
    boolean existsByEmail(String email);

    /**
     * Find active patients
     */
    @Query("SELECT p FROM Patient p WHERE p.status = 'ACTIVE'")
    List<Patient> findActivePatients();

    /**
     * Search patients by name or contact number
     */
    @Query("SELECT p FROM Patient p WHERE " +
           "LOWER(p.patientName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "p.contactNumber LIKE CONCAT('%', :searchTerm, '%')")
    List<Patient> searchPatients(@Param("searchTerm") String searchTerm);
}
