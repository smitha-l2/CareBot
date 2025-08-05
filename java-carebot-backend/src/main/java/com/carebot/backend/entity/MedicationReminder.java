package com.carebot.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * MedicationReminder Entity - Represents medication reminder schedules
 * 
 * This entity stores medication reminder information including:
 * - Medication schedule and timing
 * - Patient and prescription references
 * - Reminder preferences and status
 * - Adherence tracking data
 */
@Entity
@Table(name = "medication_reminders")
public class MedicationReminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Reference to patient
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    @NotNull(message = "Patient is required")
    private Patient patient;

    // Reference to prescription (optional - can be standalone reminder)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;

    @NotBlank(message = "Medication name is required")
    @Column(name = "medication_name", nullable = false, length = 200)
    private String medicationName;

    @NotBlank(message = "Dosage is required")
    @Column(name = "dosage", nullable = false, length = 100)
    private String dosage;

    // Frequency: ONCE_DAILY, TWICE_DAILY, THRICE_DAILY, FOUR_TIMES_DAILY, AS_NEEDED, CUSTOM
    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false)
    @NotNull(message = "Frequency is required")
    private Frequency frequency;

    // Reminder times (JSON string storing array of times)
    @Column(name = "reminder_times", columnDefinition = "TEXT")
    private String reminderTimes; // JSON: ["08:00", "14:00", "20:00"]

    // Start and end dates for the medication
    @Column(name = "start_date", nullable = false)
    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    // Reminder preferences
    @Column(name = "reminder_enabled", nullable = false)
    private Boolean reminderEnabled = true;

    @Column(name = "advance_notice_minutes")
    private Integer advanceNoticeMinutes = 0; // 0 = on time, 15 = 15 minutes before

    @Column(name = "max_reminders_per_dose")
    private Integer maxRemindersPerDose = 3; // Maximum reminder attempts per dose

    // Reminder method: WHATSAPP, SMS, EMAIL, IN_APP
    @Enumerated(EnumType.STRING)
    @Column(name = "reminder_method", nullable = false)
    private ReminderMethod reminderMethod = ReminderMethod.WHATSAPP;

    // Special instructions
    @Column(name = "special_instructions", columnDefinition = "TEXT")
    private String specialInstructions; // "Take with food", "Take on empty stomach", etc.

    // Status tracking
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReminderStatus status = ReminderStatus.ACTIVE;

    // Adherence tracking
    @Column(name = "total_doses_scheduled")
    private Integer totalDosesScheduled = 0;

    @Column(name = "total_doses_taken")
    private Integer totalDosesTaken = 0;

    @Column(name = "total_doses_missed")
    private Integer totalDosesMissed = 0;

    @Column(name = "adherence_percentage")
    private Double adherencePercentage = 0.0;

    // Last reminder sent
    @Column(name = "last_reminder_sent")
    private LocalDateTime lastReminderSent;

    @Column(name = "next_reminder_due")
    private LocalDateTime nextReminderDue;

    // Creator information
    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public MedicationReminder() {}

    public MedicationReminder(Patient patient, String medicationName, String dosage, 
                            Frequency frequency, LocalDateTime startDate, String createdBy) {
        this.patient = patient;
        this.medicationName = medicationName;
        this.dosage = dosage;
        this.frequency = frequency;
        this.startDate = startDate;
        this.createdBy = createdBy;
        this.reminderEnabled = true;
        this.status = ReminderStatus.ACTIVE;
    }

    // Enums
    public enum Frequency {
        ONCE_DAILY("Once Daily", 1),
        TWICE_DAILY("Twice Daily", 2),
        THRICE_DAILY("Three Times Daily", 3),
        FOUR_TIMES_DAILY("Four Times Daily", 4),
        FIVE_TIMES_DAILY("Five Times Daily", 5),
        SIX_TIMES_DAILY("Six Times Daily", 6),
        EVERY_OTHER_DAY("Every Other Day", 0.5),
        WEEKLY("Weekly", 0.14),
        AS_NEEDED("As Needed", 0),
        CUSTOM("Custom Schedule", 0);

        private final String displayName;
        private final double dailyDoses;

        Frequency(String displayName, double dailyDoses) {
            this.displayName = displayName;
            this.dailyDoses = dailyDoses;
        }

        public String getDisplayName() { return displayName; }
        public double getDailyDoses() { return dailyDoses; }
    }

    public enum ReminderMethod {
        WHATSAPP("WhatsApp"),
        SMS("SMS"),
        EMAIL("Email"),
        IN_APP("In-App Notification"),
        PHONE_CALL("Phone Call");

        private final String displayName;

        ReminderMethod(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() { return displayName; }
    }

    public enum ReminderStatus {
        ACTIVE("Active"),
        PAUSED("Paused"),
        COMPLETED("Completed"),
        CANCELLED("Cancelled"),
        EXPIRED("Expired");

        private final String displayName;

        ReminderStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() { return displayName; }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }

    public Prescription getPrescription() { return prescription; }
    public void setPrescription(Prescription prescription) { this.prescription = prescription; }

    public String getMedicationName() { return medicationName; }
    public void setMedicationName(String medicationName) { this.medicationName = medicationName; }

    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }

    public Frequency getFrequency() { return frequency; }
    public void setFrequency(Frequency frequency) { this.frequency = frequency; }

    public String getReminderTimes() { return reminderTimes; }
    public void setReminderTimes(String reminderTimes) { this.reminderTimes = reminderTimes; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public Boolean getReminderEnabled() { return reminderEnabled; }
    public void setReminderEnabled(Boolean reminderEnabled) { this.reminderEnabled = reminderEnabled; }

    public Integer getAdvanceNoticeMinutes() { return advanceNoticeMinutes; }
    public void setAdvanceNoticeMinutes(Integer advanceNoticeMinutes) { this.advanceNoticeMinutes = advanceNoticeMinutes; }

    public Integer getMaxRemindersPerDose() { return maxRemindersPerDose; }
    public void setMaxRemindersPerDose(Integer maxRemindersPerDose) { this.maxRemindersPerDose = maxRemindersPerDose; }

    public ReminderMethod getReminderMethod() { return reminderMethod; }
    public void setReminderMethod(ReminderMethod reminderMethod) { this.reminderMethod = reminderMethod; }

    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }

    public ReminderStatus getStatus() { return status; }
    public void setStatus(ReminderStatus status) { this.status = status; }

    public Integer getTotalDosesScheduled() { return totalDosesScheduled; }
    public void setTotalDosesScheduled(Integer totalDosesScheduled) { this.totalDosesScheduled = totalDosesScheduled; }

    public Integer getTotalDosesTaken() { return totalDosesTaken; }
    public void setTotalDosesTaken(Integer totalDosesTaken) { this.totalDosesTaken = totalDosesTaken; }

    public Integer getTotalDosesMissed() { return totalDosesMissed; }
    public void setTotalDosesMissed(Integer totalDosesMissed) { this.totalDosesMissed = totalDosesMissed; }

    public Double getAdherencePercentage() { return adherencePercentage; }
    public void setAdherencePercentage(Double adherencePercentage) { this.adherencePercentage = adherencePercentage; }

    public LocalDateTime getLastReminderSent() { return lastReminderSent; }
    public void setLastReminderSent(LocalDateTime lastReminderSent) { this.lastReminderSent = lastReminderSent; }

    public LocalDateTime getNextReminderDue() { return nextReminderDue; }
    public void setNextReminderDue(LocalDateTime nextReminderDue) { this.nextReminderDue = nextReminderDue; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helper methods
    public boolean isActive() {
        return status == ReminderStatus.ACTIVE && reminderEnabled;
    }

    public boolean isExpired() {
        return endDate != null && LocalDateTime.now().isAfter(endDate);
    }

    public void calculateAdherence() {
        if (totalDosesScheduled > 0) {
            adherencePercentage = (totalDosesTaken.doubleValue() / totalDosesScheduled.doubleValue()) * 100.0;
        } else {
            adherencePercentage = 0.0;
        }
    }

    public String getAdherenceLevel() {
        if (adherencePercentage >= 90.0) return "Excellent";
        if (adherencePercentage >= 80.0) return "Good";
        if (adherencePercentage >= 70.0) return "Fair";
        if (adherencePercentage >= 50.0) return "Poor";
        return "Very Poor";
    }

    public List<LocalTime> getParsedReminderTimes() {
        List<LocalTime> times = new ArrayList<>();
        if (reminderTimes != null && !reminderTimes.trim().isEmpty()) {
            try {
                // Parse JSON array of times: ["08:00", "14:00", "20:00"]
                String cleaned = reminderTimes.replaceAll("[\\[\\]\"]", "");
                String[] timeStrings = cleaned.split(",");
                for (String timeStr : timeStrings) {
                    times.add(LocalTime.parse(timeStr.trim()));
                }
            } catch (Exception e) {
                // Return default times based on frequency
                return getDefaultTimesForFrequency();
            }
        } else {
            return getDefaultTimesForFrequency();
        }
        return times;
    }

    private List<LocalTime> getDefaultTimesForFrequency() {
        List<LocalTime> defaultTimes = new ArrayList<>();
        switch (frequency) {
            case ONCE_DAILY:
                defaultTimes.add(LocalTime.of(8, 0)); // 8:00 AM
                break;
            case TWICE_DAILY:
                defaultTimes.add(LocalTime.of(8, 0)); // 8:00 AM
                defaultTimes.add(LocalTime.of(20, 0)); // 8:00 PM
                break;
            case THRICE_DAILY:
                defaultTimes.add(LocalTime.of(8, 0)); // 8:00 AM
                defaultTimes.add(LocalTime.of(14, 0)); // 2:00 PM
                defaultTimes.add(LocalTime.of(20, 0)); // 8:00 PM
                break;
            case FOUR_TIMES_DAILY:
                defaultTimes.add(LocalTime.of(8, 0)); // 8:00 AM
                defaultTimes.add(LocalTime.of(12, 0)); // 12:00 PM
                defaultTimes.add(LocalTime.of(16, 0)); // 4:00 PM
                defaultTimes.add(LocalTime.of(20, 0)); // 8:00 PM
                break;
            default:
                defaultTimes.add(LocalTime.of(8, 0)); // Default to morning
        }
        return defaultTimes;
    }

    @Override
    public String toString() {
        return "MedicationReminder{" +
                "id=" + id +
                ", medicationName='" + medicationName + '\'' +
                ", dosage='" + dosage + '\'' +
                ", frequency=" + frequency +
                ", status=" + status +
                ", adherencePercentage=" + adherencePercentage +
                '}';
    }
}
