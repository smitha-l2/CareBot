package com.carebot.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a follow-up schedule for patients
 * Implements automated patient engagement as specified in CareBot requirements
 */
@Entity
@Table(name = "follow_up_schedules")
public class FollowUpSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @Column(name = "visit_date", nullable = false)
    private LocalDateTime visitDate;
    
    @Column(name = "visit_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private VisitType visitType;
    
    @Column(name = "scheduled_follow_up_time", nullable = false)
    private LocalDateTime scheduledFollowUpTime;
    
    @Column(name = "follow_up_sent", nullable = false)
    private Boolean followUpSent = false;
    
    @Column(name = "follow_up_sent_time")
    private LocalDateTime followUpSentTime;
    
    @Column(name = "patient_responded", nullable = false)
    private Boolean patientResponded = false;
    
    @Column(name = "patient_response_time")
    private LocalDateTime patientResponseTime;
    
    @Column(name = "escalated", nullable = false)
    private Boolean escalated = false;
    
    @Column(name = "escalation_reason")
    private String escalationReason;
    
    @Column(name = "message_template_used")
    private String messageTemplateUsed;
    
    @Column(name = "created_by", nullable = false)
    private String createdBy;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Visit types for different follow-up strategies
    public enum VisitType {
        ROUTINE_CHECKUP("Routine Checkup", 24), // 24 hours
        NEW_MEDICATION("New Medication", 24), // 24 hours  
        POST_SURGERY("Post Surgery", 12), // 12 hours
        CHRONIC_CARE("Chronic Care", 72), // 3 days
        EMERGENCY_FOLLOWUP("Emergency Follow-up", 6), // 6 hours
        LAB_RESULTS("Lab Results", 48), // 2 days
        WELLNESS_CHECK("Wellness Check", 168); // 1 week
        
        private final String displayName;
        private final int defaultHoursDelay;
        
        VisitType(String displayName, int defaultHoursDelay) {
            this.displayName = displayName;
            this.defaultHoursDelay = defaultHoursDelay;
        }
        
        public String getDisplayName() { return displayName; }
        public int getDefaultHoursDelay() { return defaultHoursDelay; }
    }
    
    // Constructors
    public FollowUpSchedule() {}
    
    public FollowUpSchedule(Patient patient, VisitType visitType, String createdBy) {
        this.patient = patient;
        this.visitType = visitType;
        this.visitDate = LocalDateTime.now();
        this.scheduledFollowUpTime = LocalDateTime.now().plusHours(visitType.getDefaultHoursDelay());
        this.createdBy = createdBy;
        this.createdAt = LocalDateTime.now();
        this.followUpSent = false;
        this.patientResponded = false;
        this.escalated = false;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    
    public LocalDateTime getVisitDate() { return visitDate; }
    public void setVisitDate(LocalDateTime visitDate) { this.visitDate = visitDate; }
    
    public VisitType getVisitType() { return visitType; }
    public void setVisitType(VisitType visitType) { this.visitType = visitType; }
    
    public LocalDateTime getScheduledFollowUpTime() { return scheduledFollowUpTime; }
    public void setScheduledFollowUpTime(LocalDateTime scheduledFollowUpTime) { 
        this.scheduledFollowUpTime = scheduledFollowUpTime; 
    }
    
    public Boolean getFollowUpSent() { return followUpSent; }
    public void setFollowUpSent(Boolean followUpSent) { 
        this.followUpSent = followUpSent;
        if (followUpSent && followUpSentTime == null) {
            this.followUpSentTime = LocalDateTime.now();
        }
    }
    
    public LocalDateTime getFollowUpSentTime() { return followUpSentTime; }
    public void setFollowUpSentTime(LocalDateTime followUpSentTime) { 
        this.followUpSentTime = followUpSentTime; 
    }
    
    public Boolean getPatientResponded() { return patientResponded; }
    public void setPatientResponded(Boolean patientResponded) { 
        this.patientResponded = patientResponded;
        if (patientResponded && patientResponseTime == null) {
            this.patientResponseTime = LocalDateTime.now();
        }
    }
    
    public LocalDateTime getPatientResponseTime() { return patientResponseTime; }
    public void setPatientResponseTime(LocalDateTime patientResponseTime) { 
        this.patientResponseTime = patientResponseTime; 
    }
    
    public Boolean getEscalated() { return escalated; }
    public void setEscalated(Boolean escalated) { this.escalated = escalated; }
    
    public String getEscalationReason() { return escalationReason; }
    public void setEscalationReason(String escalationReason) { this.escalationReason = escalationReason; }
    
    public String getMessageTemplateUsed() { return messageTemplateUsed; }
    public void setMessageTemplateUsed(String messageTemplateUsed) { this.messageTemplateUsed = messageTemplateUsed; }
    
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Utility methods
    public boolean isOverdue() {
        return !followUpSent && LocalDateTime.now().isAfter(scheduledFollowUpTime);
    }
    
    public boolean needsEscalation() {
        // Escalate if follow-up sent but no response after 48 hours
        if (followUpSent && !patientResponded && followUpSentTime != null) {
            return LocalDateTime.now().isAfter(followUpSentTime.plusHours(48));
        }
        return false;
    }
    
    public long getHoursSinceScheduled() {
        return java.time.Duration.between(scheduledFollowUpTime, LocalDateTime.now()).toHours();
    }
    
    @Override
    public String toString() {
        return "FollowUpSchedule{" +
                "id=" + id +
                ", patient=" + (patient != null ? patient.getPatientName() : "null") +
                ", visitType=" + visitType +
                ", scheduledFollowUpTime=" + scheduledFollowUpTime +
                ", followUpSent=" + followUpSent +
                ", patientResponded=" + patientResponded +
                '}';
    }
}
