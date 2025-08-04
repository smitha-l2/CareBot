package com.carebot.backend.repository;

import com.carebot.backend.entity.FollowUpSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Follow-up Schedule management
 * Supports automated follow-up queries and analytics
 */
@Repository
public interface FollowUpScheduleRepository extends JpaRepository<FollowUpSchedule, Long> {
    
    /**
     * Find all pending follow-ups for a specific patient
     */
    List<FollowUpSchedule> findByPatientIdAndFollowUpSentFalse(Long patientId);
    
    /**
     * Find all follow-ups for a patient ordered by creation date
     */
    List<FollowUpSchedule> findByPatientIdOrderByCreatedAtDesc(Long patientId);
    
    /**
     * Find follow-ups that are due (scheduled time has passed and not yet sent)
     */
    @Query("SELECT f FROM FollowUpSchedule f WHERE f.scheduledFollowUpTime <= :currentTime AND f.followUpSent = false")
    List<FollowUpSchedule> findDueFollowUps(@Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find follow-ups that need escalation (sent but no response after specified time)
     */
    @Query("SELECT f FROM FollowUpSchedule f WHERE f.followUpSent = true AND f.patientResponded = false AND f.escalated = false AND f.followUpSentTime <= :cutoffTime")
    List<FollowUpSchedule> findNeedingEscalation(@Param("cutoffTime") LocalDateTime cutoffTime);
    
    /**
     * Find active follow-ups for a patient (sent but not responded)
     */
    List<FollowUpSchedule> findByPatientIdAndFollowUpSentTrueAndPatientRespondedFalse(Long patientId);
    
    /**
     * Count total follow-ups sent today
     */
    @Query("SELECT COUNT(f) FROM FollowUpSchedule f WHERE f.followUpSent = true AND DATE(f.followUpSentTime) = CURRENT_DATE")
    Long countSentToday();
    
    /**
     * Count escalations today
     */
    @Query("SELECT COUNT(f) FROM FollowUpSchedule f WHERE f.escalated = true AND DATE(f.updatedAt) = CURRENT_DATE")
    Long countEscalationsToday();
    
    /**
     * Count pending follow-ups
     */
    @Query("SELECT COUNT(f) FROM FollowUpSchedule f WHERE f.followUpSent = false")
    Long countPendingFollowUps();
    
    /**
     * Calculate response rate (percentage of sent follow-ups that received responses)
     */
    @Query("SELECT CASE WHEN COUNT(f) = 0 THEN 0 ELSE (COUNT(f) * 100.0 / (SELECT COUNT(fs) FROM FollowUpSchedule fs WHERE fs.followUpSent = true)) END FROM FollowUpSchedule f WHERE f.followUpSent = true AND f.patientResponded = true")
    Double calculateResponseRate();
    
    /**
     * Find overdue follow-ups (scheduled time passed but not sent)
     */
    @Query("SELECT f FROM FollowUpSchedule f WHERE f.scheduledFollowUpTime < :currentTime AND f.followUpSent = false")
    List<FollowUpSchedule> findOverdueFollowUps(@Param("currentTime") LocalDateTime currentTime);
    
    /**
     * Find follow-ups by visit type
     */
    List<FollowUpSchedule> findByVisitType(FollowUpSchedule.VisitType visitType);
    
    /**
     * Find follow-ups created by specific user
     */
    List<FollowUpSchedule> findByCreatedByOrderByCreatedAtDesc(String createdBy);
    
    /**
     * Find follow-ups in date range
     */
    @Query("SELECT f FROM FollowUpSchedule f WHERE f.createdAt BETWEEN :startDate AND :endDate ORDER BY f.createdAt DESC")
    List<FollowUpSchedule> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * Get follow-up statistics by visit type
     */
    @Query("SELECT f.visitType, COUNT(f), " +
           "SUM(CASE WHEN f.followUpSent = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN f.patientResponded = true THEN 1 ELSE 0 END), " +
           "SUM(CASE WHEN f.escalated = true THEN 1 ELSE 0 END) " +
           "FROM FollowUpSchedule f GROUP BY f.visitType")
    List<Object[]> getStatsByVisitType();
    
    /**
     * Delete old completed follow-ups (for cleanup)
     */
    @Query("DELETE FROM FollowUpSchedule f WHERE f.patientResponded = true AND f.patientResponseTime < :cutoffDate")
    void deleteOldCompletedFollowUps(@Param("cutoffDate") LocalDateTime cutoffDate);
}
