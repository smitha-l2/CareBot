package com.carebot.backend.repository;

import com.carebot.backend.entity.MedicationReminder;
import com.carebot.backend.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for MedicationReminder entity
 * Provides data access methods for medication reminder management
 */
@Repository
public interface MedicationReminderRepository extends JpaRepository<MedicationReminder, Long> {

    // Find reminders by patient
    List<MedicationReminder> findByPatientId(Long patientId);
    
    List<MedicationReminder> findByPatient(Patient patient);

    // Find active reminders
    List<MedicationReminder> findByStatus(MedicationReminder.ReminderStatus status);
    
    List<MedicationReminder> findByReminderEnabledTrue();
    
    @Query("SELECT mr FROM MedicationReminder mr WHERE mr.status = 'ACTIVE' AND mr.reminderEnabled = true")
    List<MedicationReminder> findActiveReminders();

    // Find reminders due for processing
    @Query("SELECT mr FROM MedicationReminder mr WHERE mr.status = 'ACTIVE' AND mr.reminderEnabled = true AND mr.nextReminderDue <= :currentTime")
    List<MedicationReminder> findRemindersDue(@Param("currentTime") LocalDateTime currentTime);

    // Find overdue reminders
    @Query("SELECT mr FROM MedicationReminder mr WHERE mr.status = 'ACTIVE' AND mr.reminderEnabled = true AND mr.nextReminderDue < :currentTime")
    List<MedicationReminder> findOverdueReminders(@Param("currentTime") LocalDateTime currentTime);

    // Find by medication name
    List<MedicationReminder> findByMedicationNameContainingIgnoreCase(String medicationName);

    // Find reminders expiring soon
    @Query("SELECT mr FROM MedicationReminder mr WHERE mr.status = 'ACTIVE' AND mr.endDate BETWEEN :startDate AND :endDate")
    List<MedicationReminder> findRemindersExpiringSoon(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Find by patient and medication
    @Query("SELECT mr FROM MedicationReminder mr WHERE mr.patient.id = :patientId AND mr.medicationName = :medicationName AND mr.status = 'ACTIVE'")
    List<MedicationReminder> findActiveRemindersByPatientAndMedication(@Param("patientId") Long patientId, @Param("medicationName") String medicationName);

    // Adherence statistics
    @Query("SELECT AVG(mr.adherencePercentage) FROM MedicationReminder mr WHERE mr.patient.id = :patientId AND mr.status IN ('ACTIVE', 'COMPLETED')")
    Double calculatePatientAverageAdherence(@Param("patientId") Long patientId);

    @Query("SELECT COUNT(mr) FROM MedicationReminder mr WHERE mr.patient.id = :patientId AND mr.status = 'ACTIVE'")
    Long countActiveRemindersByPatient(@Param("patientId") Long patientId);

    @Query("SELECT COUNT(mr) FROM MedicationReminder mr WHERE mr.adherencePercentage < :threshold AND mr.status IN ('ACTIVE', 'COMPLETED')")
    Long countRemindersWithPoorAdherence(@Param("threshold") Double threshold);

    // Find reminders by frequency
    List<MedicationReminder> findByFrequency(MedicationReminder.Frequency frequency);

    // Find reminders by date range
    @Query("SELECT mr FROM MedicationReminder mr WHERE mr.startDate <= :endDate AND (mr.endDate IS NULL OR mr.endDate >= :startDate)")
    List<MedicationReminder> findRemindersByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Dashboard statistics
    @Query("SELECT COUNT(mr) FROM MedicationReminder mr WHERE mr.status = 'ACTIVE'")
    Long countActiveReminders();

    @Query("SELECT COUNT(mr) FROM MedicationReminder mr WHERE mr.nextReminderDue <= :currentTime AND mr.status = 'ACTIVE' AND mr.reminderEnabled = true")
    Long countRemindersDueNow(@Param("currentTime") LocalDateTime currentTime);

    @Query("SELECT COUNT(mr) FROM MedicationReminder mr WHERE mr.lastReminderSent >= :since")
    Long countRemindersSentSince(@Param("since") LocalDateTime since);

    // Complex adherence queries
    @Query("""
        SELECT mr FROM MedicationReminder mr 
        WHERE mr.patient.id = :patientId 
        AND mr.adherencePercentage < :adherenceThreshold 
        AND mr.status = 'ACTIVE'
        ORDER BY mr.adherencePercentage ASC
    """)
    List<MedicationReminder> findPoorAdherenceReminders(@Param("patientId") Long patientId, @Param("adherenceThreshold") Double adherenceThreshold);

    // Recent activity
    @Query("SELECT mr FROM MedicationReminder mr WHERE mr.lastReminderSent >= :since ORDER BY mr.lastReminderSent DESC")
    List<MedicationReminder> findRecentReminderActivity(@Param("since") LocalDateTime since);

    // Custom search
    @Query("""
        SELECT mr FROM MedicationReminder mr 
        WHERE (LOWER(mr.medicationName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(mr.patient.patientName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        OR LOWER(mr.dosage) LIKE LOWER(CONCAT('%', :searchTerm, '%')))
        AND mr.status = 'ACTIVE'
    """)
    List<MedicationReminder> searchActiveReminders(@Param("searchTerm") String searchTerm);
}
