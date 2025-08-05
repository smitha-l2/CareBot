package com.carebot.backend.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * MedicationReminderLog Entity - Tracks individual medication reminder events
 * 
 * This entity logs each medication reminder attempt and patient response:
 * - Reminder delivery status
 * - Patient response (taken, missed, delayed)
 * - Notification method used
 * - Timing and adherence data
 */
@Entity
@Table(name = "medication_reminder_logs")
public class MedicationReminderLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to the medication reminder
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_reminder_id", nullable = false)
    private MedicationReminder medicationReminder;

    // Scheduled time for this specific dose
    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    // When the reminder was actually sent
    @Column(name = "reminder_sent_time")
    private LocalDateTime reminderSentTime;

    // Patient response time (when they marked as taken/missed)
    @Column(name = "response_time")
    private LocalDateTime responseTime;

    // Status of this specific reminder
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReminderLogStatus status = ReminderLogStatus.SCHEDULED;

    // How patient responded to this dose
    @Enumerated(EnumType.STRING)
    @Column(name = "patient_response")
    private PatientResponse patientResponse;

    // Method used to send reminder
    @Enumerated(EnumType.STRING)
    @Column(name = "notification_method")
    private MedicationReminder.ReminderMethod notificationMethod;

    // Number of reminder attempts for this dose
    @Column(name = "reminder_attempts")
    private Integer reminderAttempts = 0;

    // Whether reminder was successfully delivered
    @Column(name = "delivery_successful")
    private Boolean deliverySuccessful = false;

    // Any notes about this reminder/dose
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Delay information
    @Column(name = "minutes_late")
    private Integer minutesLate = 0; // How many minutes late the dose was taken

    // Side effects reported for this dose
    @Column(name = "side_effects_reported")
    private String sideEffectsReported;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Constructors
    public MedicationReminderLog() {}

    public MedicationReminderLog(MedicationReminder medicationReminder, LocalDateTime scheduledTime) {
        this.medicationReminder = medicationReminder;
        this.scheduledTime = scheduledTime;
        this.status = ReminderLogStatus.SCHEDULED;
    }

    // Enums
    public enum ReminderLogStatus {
        SCHEDULED("Scheduled"),
        SENT("Reminder Sent"),
        DELIVERED("Delivered"),
        FAILED("Failed to Send"),
        TAKEN("Dose Taken"),
        MISSED("Dose Missed"),
        DELAYED("Dose Delayed"),
        SKIPPED("Dose Skipped"),
        CANCELLED("Cancelled");

        private final String displayName;

        ReminderLogStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() { return displayName; }
    }

    public enum PatientResponse {
        TAKEN_ON_TIME("Taken on Time"),
        TAKEN_LATE("Taken Late"),
        MISSED("Missed"),
        SKIPPED_INTENTIONALLY("Skipped Intentionally"),
        DELAYED("Delayed"),
        DOUBLE_DOSE("Double Dose Taken"),
        NO_RESPONSE("No Response");

        private final String displayName;

        PatientResponse(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() { return displayName; }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public MedicationReminder getMedicationReminder() { return medicationReminder; }
    public void setMedicationReminder(MedicationReminder medicationReminder) { this.medicationReminder = medicationReminder; }

    public LocalDateTime getScheduledTime() { return scheduledTime; }
    public void setScheduledTime(LocalDateTime scheduledTime) { this.scheduledTime = scheduledTime; }

    public LocalDateTime getReminderSentTime() { return reminderSentTime; }
    public void setReminderSentTime(LocalDateTime reminderSentTime) { this.reminderSentTime = reminderSentTime; }

    public LocalDateTime getResponseTime() { return responseTime; }
    public void setResponseTime(LocalDateTime responseTime) { this.responseTime = responseTime; }

    public ReminderLogStatus getStatus() { return status; }
    public void setStatus(ReminderLogStatus status) { this.status = status; }

    public PatientResponse getPatientResponse() { return patientResponse; }
    public void setPatientResponse(PatientResponse patientResponse) { this.patientResponse = patientResponse; }

    public MedicationReminder.ReminderMethod getNotificationMethod() { return notificationMethod; }
    public void setNotificationMethod(MedicationReminder.ReminderMethod notificationMethod) { this.notificationMethod = notificationMethod; }

    public Integer getReminderAttempts() { return reminderAttempts; }
    public void setReminderAttempts(Integer reminderAttempts) { this.reminderAttempts = reminderAttempts; }

    public Boolean getDeliverySuccessful() { return deliverySuccessful; }
    public void setDeliverySuccessful(Boolean deliverySuccessful) { this.deliverySuccessful = deliverySuccessful; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public Integer getMinutesLate() { return minutesLate; }
    public void setMinutesLate(Integer minutesLate) { this.minutesLate = minutesLate; }

    public String getSideEffectsReported() { return sideEffectsReported; }
    public void setSideEffectsReported(String sideEffectsReported) { this.sideEffectsReported = sideEffectsReported; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Helper methods
    public boolean isOverdue() {
        return status == ReminderLogStatus.SCHEDULED && 
               LocalDateTime.now().isAfter(scheduledTime.plusMinutes(30));
    }

    public boolean isTaken() {
        return status == ReminderLogStatus.TAKEN || 
               patientResponse == PatientResponse.TAKEN_ON_TIME ||
               patientResponse == PatientResponse.TAKEN_LATE;
    }

    public boolean isMissed() {
        return status == ReminderLogStatus.MISSED || 
               patientResponse == PatientResponse.MISSED;
    }

    public void markAsTaken(boolean onTime) {
        this.status = ReminderLogStatus.TAKEN;
        this.responseTime = LocalDateTime.now();
        
        if (onTime) {
            this.patientResponse = PatientResponse.TAKEN_ON_TIME;
            this.minutesLate = 0;
        } else {
            this.patientResponse = PatientResponse.TAKEN_LATE;
            this.minutesLate = (int) java.time.Duration.between(scheduledTime, responseTime).toMinutes();
        }
    }

    public void markAsMissed() {
        this.status = ReminderLogStatus.MISSED;
        this.patientResponse = PatientResponse.MISSED;
        this.responseTime = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "MedicationReminderLog{" +
                "id=" + id +
                ", scheduledTime=" + scheduledTime +
                ", status=" + status +
                ", patientResponse=" + patientResponse +
                ", minutesLate=" + minutesLate +
                '}';
    }
}
