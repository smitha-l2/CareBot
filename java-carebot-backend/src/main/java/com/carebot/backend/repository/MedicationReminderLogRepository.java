package com.carebot.backend.repository;

import com.carebot.backend.entity.MedicationReminderLog;
import com.carebot.backend.entity.MedicationReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for MedicationReminderLog entity
 * Provides data access methods for medication reminder log tracking
 */
@Repository
public interface MedicationReminderLogRepository extends JpaRepository<MedicationReminderLog, Long> {

    // Find logs by medication reminder
    List<MedicationReminderLog> findByMedicationReminderId(Long medicationReminderId);
    
    List<MedicationReminderLog> findByMedicationReminderOrderByScheduledTimeDesc(MedicationReminder medicationReminder);

    // Find logs by status
    List<MedicationReminderLog> findByStatus(MedicationReminderLog.ReminderLogStatus status);

    // Find recent logs for a patient
    @Query("""
        SELECT mrl FROM MedicationReminderLog mrl 
        WHERE mrl.medicationReminder.patient.id = :patientId 
        ORDER BY mrl.scheduledTime DESC
    """)
    List<MedicationReminderLog> findRecentLogsByPatient(@Param("patientId") Long patientId);

    // Find overdue doses
    @Query("""
        SELECT mrl FROM MedicationReminderLog mrl 
        WHERE mrl.status = 'SCHEDULED' 
        AND mrl.scheduledTime < :currentTime
    """)
    List<MedicationReminderLog> findOverdueDoses(@Param("currentTime") LocalDateTime currentTime);

    // Find doses due for reminder
    @Query("""
        SELECT mrl FROM MedicationReminderLog mrl 
        WHERE mrl.status = 'SCHEDULED' 
        AND mrl.scheduledTime <= :reminderTime
    """)
    List<MedicationReminderLog> findDosesForReminder(@Param("reminderTime") LocalDateTime reminderTime);

    // Adherence statistics
    @Query("""
        SELECT COUNT(mrl) FROM MedicationReminderLog mrl 
        WHERE mrl.medicationReminder.patient.id = :patientId 
        AND mrl.status = 'TAKEN'
        AND mrl.scheduledTime BETWEEN :startDate AND :endDate
    """)
    Long countDosesTaken(@Param("patientId") Long patientId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT COUNT(mrl) FROM MedicationReminderLog mrl 
        WHERE mrl.medicationReminder.patient.id = :patientId 
        AND mrl.status = 'MISSED'
        AND mrl.scheduledTime BETWEEN :startDate AND :endDate
    """)
    Long countDosesMissed(@Param("patientId") Long patientId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("""
        SELECT COUNT(mrl) FROM MedicationReminderLog mrl 
        WHERE mrl.medicationReminder.patient.id = :patientId 
        AND mrl.scheduledTime BETWEEN :startDate AND :endDate
    """)
    Long countTotalDoses(@Param("patientId") Long patientId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Find logs by patient response
    @Query("""
        SELECT mrl FROM MedicationReminderLog mrl 
        WHERE mrl.medicationReminder.patient.id = :patientId 
        AND mrl.patientResponse = :response
        AND mrl.scheduledTime BETWEEN :startDate AND :endDate
    """)
    List<MedicationReminderLog> findLogsByPatientResponse(
            @Param("patientId") Long patientId, 
            @Param("response") MedicationReminderLog.PatientResponse response,
            @Param("startDate") LocalDateTime startDate, 
            @Param("endDate") LocalDateTime endDate
    );

    // Find late doses
    @Query("""
        SELECT mrl FROM MedicationReminderLog mrl 
        WHERE mrl.medicationReminder.patient.id = :patientId 
        AND mrl.minutesLate > :minutesThreshold
        ORDER BY mrl.scheduledTime DESC
    """)
    List<MedicationReminderLog> findLateDoses(@Param("patientId") Long patientId, @Param("minutesThreshold") Integer minutesThreshold);

    // Daily adherence for a specific medication reminder
    @Query("""
        SELECT DATE(mrl.scheduledTime) as doseDate,
               COUNT(mrl) as totalDoses,
               SUM(CASE WHEN mrl.status = 'TAKEN' THEN 1 ELSE 0 END) as takenDoses,
               SUM(CASE WHEN mrl.status = 'MISSED' THEN 1 ELSE 0 END) as missedDoses
        FROM MedicationReminderLog mrl 
        WHERE mrl.medicationReminder.id = :reminderId
        AND mrl.scheduledTime BETWEEN :startDate AND :endDate
        GROUP BY DATE(mrl.scheduledTime)
        ORDER BY doseDate DESC
    """)
    List<Object[]> getDailyAdherenceStats(@Param("reminderId") Long reminderId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // Side effects tracking
    @Query("""
        SELECT mrl FROM MedicationReminderLog mrl 
        WHERE mrl.medicationReminder.patient.id = :patientId 
        AND mrl.sideEffectsReported IS NOT NULL 
        AND mrl.sideEffectsReported != ''
        ORDER BY mrl.responseTime DESC
    """)
    List<MedicationReminderLog> findLogsWithSideEffects(@Param("patientId") Long patientId);

    // Recent missed doses for escalation
    @Query("""
        SELECT mrl FROM MedicationReminderLog mrl 
        WHERE mrl.medicationReminder.patient.id = :patientId 
        AND mrl.status = 'MISSED'
        AND mrl.scheduledTime >= :since
        ORDER BY mrl.scheduledTime DESC
    """)
    List<MedicationReminderLog> findRecentMissedDoses(@Param("patientId") Long patientId, @Param("since") LocalDateTime since);

    // Find logs that need retry reminders
    @Query("""
        SELECT mrl FROM MedicationReminderLog mrl 
        WHERE mrl.status = 'SCHEDULED'
        AND mrl.reminderAttempts < mrl.medicationReminder.maxRemindersPerDose
        AND mrl.scheduledTime <= :currentTime
    """)
    List<MedicationReminderLog> findLogsNeedingRetry(@Param("currentTime") LocalDateTime currentTime);

    // Dashboard statistics
    @Query("SELECT COUNT(mrl) FROM MedicationReminderLog mrl WHERE mrl.scheduledTime >= :since AND mrl.status = 'TAKEN'")
    Long countDosesTakenSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(mrl) FROM MedicationReminderLog mrl WHERE mrl.scheduledTime >= :since AND mrl.status = 'MISSED'")
    Long countDosesMissedSince(@Param("since") LocalDateTime since);

    @Query("SELECT COUNT(mrl) FROM MedicationReminderLog mrl WHERE mrl.reminderSentTime >= :since")
    Long countRemindersSentSince(@Param("since") LocalDateTime since);

    // Weekly/Monthly adherence trends
    @Query(value = """
        SELECT 
            WEEK(scheduled_time) as week_number,
            YEAR(scheduled_time) as year,
            COUNT(*) as total_doses,
            SUM(CASE WHEN status = 'TAKEN' THEN 1 ELSE 0 END) as taken_doses,
            (SUM(CASE WHEN status = 'TAKEN' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as adherence_percentage
        FROM medication_reminder_logs mrl
        JOIN medication_reminders mr ON mrl.medication_reminder_id = mr.id
        WHERE mr.patient_id = :patientId
        AND scheduled_time BETWEEN :startDate AND :endDate
        GROUP BY WEEK(scheduled_time), YEAR(scheduled_time)
        ORDER BY year DESC, week_number DESC
    """, nativeQuery = true)
    List<Object[]> getWeeklyAdherenceTrend(@Param("patientId") Long patientId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
