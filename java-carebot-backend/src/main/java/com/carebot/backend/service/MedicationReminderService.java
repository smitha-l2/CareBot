package com.carebot.backend.service;

import com.carebot.backend.entity.*;
import com.carebot.backend.repository.*;
// import com.carebot.backend.repository.PrescriptionRepository; // Temporarily disabled
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * MedicationReminderService - Core service for medication reminder management
 * 
 * This service handles:
 * - Medication reminder creation and management
 * - Automated reminder scheduling and delivery
 * - Adherence tracking and reporting
 * - Patient notification management
 */
@Service
@Transactional
public class MedicationReminderService {

    @Autowired(required = false)
    private MedicationReminderRepository reminderRepository;

    @Autowired(required = false)
    private MedicationReminderLogRepository logRepository;

    @Autowired(required = false)
    private PatientRepository patientRepository;

    // @Autowired(required = false)
    // private PrescriptionRepository prescriptionRepository; // Temporarily disabled

    @Autowired
    private WhatsAppService whatsAppService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");
    // private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy"); // Temporarily disabled

    /**
     * Create a new medication reminder
     */
    public MedicationReminder createMedicationReminder(Long patientId, String medicationName, 
                                                     String dosage, MedicationReminder.Frequency frequency,
                                                     LocalDateTime startDate, LocalDateTime endDate,
                                                     List<LocalTime> reminderTimes, String createdBy) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found"));

        MedicationReminder reminder = new MedicationReminder(patient, medicationName, dosage, frequency, startDate, createdBy);
        reminder.setEndDate(endDate);
        
        // Set reminder times
        if (reminderTimes != null && !reminderTimes.isEmpty()) {
            reminder.setReminderTimes(formatTimesToJson(reminderTimes));
        }

        // Calculate next reminder due
        updateNextReminderDue(reminder);

        // Save reminder
        reminder = reminderRepository.save(reminder);

        // Schedule initial doses
        scheduleInitialDoses(reminder);

        System.out.println("✅ Created medication reminder for " + patient.getPatientName() + 
                         " - " + medicationName + " (" + frequency.getDisplayName() + ")");

        return reminder;
    }

    /**
     * Create reminder from existing prescription
     * Temporarily disabled due to compilation issues
     */
    /*
    public MedicationReminder createReminderFromPrescription(Long prescriptionId, 
                                                           List<LocalTime> reminderTimes, String createdBy) {
        if (prescriptionRepository == null) {
            throw new RuntimeException("Prescription repository not available");
        }

        Prescription prescription = prescriptionRepository.findById(prescriptionId)
            .orElseThrow(() -> new RuntimeException("Prescription not found"));

        Patient patient = prescription.getPatient();
        
        // Parse frequency from prescription
        MedicationReminder.Frequency frequency = parseFrequencyFromText(prescription.getFrequency());
        
        // Calculate start and end dates
        LocalDateTime startDate = LocalDateTime.now();
        LocalDateTime endDate = null;
        if (prescription.getDuration() != null) {
            endDate = calculateEndDateFromDuration(startDate, prescription.getDuration());
        }

        MedicationReminder reminder = createMedicationReminder(
            patient.getId(),
            prescription.getMedicationName(),
            prescription.getDosage(),
            frequency,
            startDate,
            endDate,
            reminderTimes,
            createdBy
        );

        reminder.setPrescription(prescription);
        return reminderRepository.save(reminder);
    }
    */

    /**
     * Update medication reminder settings
     */
    public MedicationReminder updateMedicationReminder(Long reminderId, List<LocalTime> newReminderTimes,
                                                     Boolean reminderEnabled, String specialInstructions) {
        MedicationReminder reminder = reminderRepository.findById(reminderId)
            .orElseThrow(() -> new RuntimeException("Medication reminder not found"));

        if (newReminderTimes != null) {
            reminder.setReminderTimes(formatTimesToJson(newReminderTimes));
        }

        if (reminderEnabled != null) {
            reminder.setReminderEnabled(reminderEnabled);
        }

        if (specialInstructions != null) {
            reminder.setSpecialInstructions(specialInstructions);
        }

        updateNextReminderDue(reminder);
        return reminderRepository.save(reminder);
    }

    /**
     * Process scheduled medication reminders - runs every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes = 300,000 milliseconds
    public void processScheduledReminders() {
        try {
            LocalDateTime currentTime = LocalDateTime.now();
            
            // Find reminders that are due
            List<MedicationReminder> dueReminders = reminderRepository.findRemindersDue(currentTime);
            
            System.out.println("📋 Processing " + dueReminders.size() + " medication reminders...");
            
            for (MedicationReminder reminder : dueReminders) {
                try {
                    processReminderDue(reminder);
                } catch (Exception e) {
                    System.err.println("❌ Error processing reminder for " + 
                                     reminder.getPatient().getPatientName() + ": " + e.getMessage());
                }
            }
            
            // Also check for overdue doses that need retry reminders
            processRetryReminders();
            
        } catch (Exception e) {
            System.err.println("❌ Error in scheduled reminder processing: " + e.getMessage());
        }
    }

    /**
     * Process a specific reminder that's due
     */
    private void processReminderDue(MedicationReminder reminder) {
        // Patient patient = reminder.getPatient(); // Temporarily unused
        List<LocalTime> reminderTimes = reminder.getParsedReminderTimes();
        LocalDateTime currentTime = LocalDateTime.now();

        // Find which dose is due
        for (LocalTime reminderTime : reminderTimes) {
            LocalDateTime doseTime = currentTime.toLocalDate().atTime(reminderTime);
            
            // Check if this dose is due (within 5 minutes)
            if (Math.abs(java.time.Duration.between(doseTime, currentTime).toMinutes()) <= 5) {
                // Check if we already have a log for this dose today
                LocalDateTime dayStart = currentTime.toLocalDate().atStartOfDay();
                LocalDateTime dayEnd = dayStart.plusDays(1);
                
                boolean alreadyScheduled = logRepository.findByMedicationReminderId(reminder.getId())
                    .stream()
                    .anyMatch(log -> log.getScheduledTime().isAfter(dayStart) && 
                                   log.getScheduledTime().isBefore(dayEnd) &&
                                   Math.abs(java.time.Duration.between(log.getScheduledTime(), doseTime).toMinutes()) <= 5);

                if (!alreadyScheduled) {
                    // Create and send reminder
                    MedicationReminderLog log = new MedicationReminderLog(reminder, doseTime);
                    log = logRepository.save(log);
                    
                    sendMedicationReminder(reminder, log);
                }
            }
        }

        // Update next reminder due time
        updateNextReminderDue(reminder);
        reminderRepository.save(reminder);
    }

    /**
     * Send medication reminder notification
     */
    private void sendMedicationReminder(MedicationReminder reminder, MedicationReminderLog log) {
        Patient patient = reminder.getPatient();
        
        // Create personalized reminder message
        String message = createReminderMessage(reminder, log);
        
        try {
            // Send WhatsApp notification
            boolean sent = whatsAppService.sendNotification(
                patient.getContactNumber(),
                patient.getPatientName(),
                message
            );

            // Update log
            log.setReminderSentTime(LocalDateTime.now());
            log.setReminderAttempts(log.getReminderAttempts() + 1);
            log.setNotificationMethod(MedicationReminder.ReminderMethod.WHATSAPP);
            log.setDeliverySuccessful(sent);
            
            if (sent) {
                log.setStatus(MedicationReminderLog.ReminderLogStatus.SENT);
                
                // Update reminder
                reminder.setLastReminderSent(LocalDateTime.now());
                reminderRepository.save(reminder);
                
                System.out.println("💊 Medication reminder sent to " + patient.getPatientName() + 
                                 " for " + reminder.getMedicationName());
            } else {
                log.setStatus(MedicationReminderLog.ReminderLogStatus.FAILED);
                System.err.println("❌ Failed to send medication reminder to " + patient.getPatientName());
            }
            
            logRepository.save(log);
            
        } catch (Exception e) {
            log.setStatus(MedicationReminderLog.ReminderLogStatus.FAILED);
            log.setNotes("Error: " + e.getMessage());
            logRepository.save(log);
            
            System.err.println("❌ Error sending medication reminder: " + e.getMessage());
        }
    }

    /**
     * Create personalized reminder message
     */
    private String createReminderMessage(MedicationReminder reminder, MedicationReminderLog log) {
        Patient patient = reminder.getPatient();
        String time = log.getScheduledTime().toLocalTime().format(TIME_FORMATTER);
        
        StringBuilder message = new StringBuilder();
        message.append("💊 **MEDICATION REMINDER**\n\n");
        message.append("Hello ").append(patient.getPatientName()).append("!\n\n");
        message.append("⏰ **Time for your medication:**\n");
        message.append("• **Medication:** ").append(reminder.getMedicationName()).append("\n");
        message.append("• **Dosage:** ").append(reminder.getDosage()).append("\n");
        message.append("• **Scheduled Time:** ").append(time).append("\n\n");
        
        if (reminder.getSpecialInstructions() != null && !reminder.getSpecialInstructions().trim().isEmpty()) {
            message.append("📋 **Special Instructions:**\n");
            message.append(reminder.getSpecialInstructions()).append("\n\n");
        }
        
        message.append("📱 **Please reply with:**\n");
        message.append("✅ **TAKEN** - if you've taken your medication\n");
        message.append("⏰ **DELAYED** - if you'll take it later\n");
        message.append("❌ **MISSED** - if you can't take it today\n");
        message.append("🤔 **HELP** - if you have questions\n\n");
        
        message.append("🏥 *Your health matters to us!*\n");
        message.append("*This is an automated reminder from CareBot Healthcare System*");
        
        return message.toString();
    }

    /**
     * Mark dose as taken by patient
     */
    public void markDoseAsTaken(Long patientId, String medicationName, LocalDateTime takenTime) {
        // Find recent scheduled dose for this medication
        List<MedicationReminderLog> recentLogs = findRecentScheduledDoses(patientId, medicationName);
        
        if (!recentLogs.isEmpty()) {
            MedicationReminderLog log = recentLogs.get(0); // Most recent
            
            boolean onTime = Math.abs(java.time.Duration.between(log.getScheduledTime(), takenTime).toMinutes()) <= 15;
            log.markAsTaken(onTime);
            logRepository.save(log);
            
            // Update reminder adherence statistics
            updateAdherenceStatistics(log.getMedicationReminder());
            
            System.out.println("✅ " + log.getMedicationReminder().getPatient().getPatientName() + 
                             " marked " + medicationName + " as taken " + (onTime ? "on time" : "late"));
        }
    }

    /**
     * Mark dose as missed by patient
     */
    public void markDoseAsMissed(Long patientId, String medicationName) {
        List<MedicationReminderLog> recentLogs = findRecentScheduledDoses(patientId, medicationName);
        
        if (!recentLogs.isEmpty()) {
            MedicationReminderLog log = recentLogs.get(0);
            log.markAsMissed();
            logRepository.save(log);
            
            // Update reminder adherence statistics
            updateAdherenceStatistics(log.getMedicationReminder());
            
            System.out.println("❌ " + log.getMedicationReminder().getPatient().getPatientName() + 
                             " marked " + medicationName + " as missed");
        }
    }

    /**
     * Get medication reminders for a patient
     */
    public List<MedicationReminder> getPatientReminders(Long patientId) {
        return reminderRepository.findByPatientId(patientId);
    }

    /**
     * Get adherence report for a patient
     */
    public Map<String, Object> getPatientAdherenceReport(Long patientId, int days) {
        LocalDateTime endDate = LocalDateTime.now();
        LocalDateTime startDate = endDate.minusDays(days);
        
        Map<String, Object> report = new HashMap<>();
        
        // Get patient reminders
        List<MedicationReminder> reminders = reminderRepository.findByPatientId(patientId);
        
        // Calculate overall statistics
        long totalDoses = logRepository.countTotalDoses(patientId, startDate, endDate);
        long takenDoses = logRepository.countDosesTaken(patientId, startDate, endDate);
        long missedDoses = logRepository.countDosesMissed(patientId, startDate, endDate);
        
        double adherencePercentage = totalDoses > 0 ? (takenDoses * 100.0 / totalDoses) : 0.0;
        
        report.put("patientId", patientId);
        report.put("reportPeriodDays", days);
        report.put("totalDoses", totalDoses);
        report.put("takenDoses", takenDoses);
        report.put("missedDoses", missedDoses);
        report.put("adherencePercentage", Math.round(adherencePercentage * 100.0) / 100.0);
        report.put("adherenceLevel", getAdherenceLevel(adherencePercentage));
        report.put("activeReminders", reminders.size());
        
        // Medication-specific adherence
        List<Map<String, Object>> medicationStats = new ArrayList<>();
        for (MedicationReminder reminder : reminders) {
            if (reminder.isActive()) {
                Map<String, Object> medStats = new HashMap<>();
                medStats.put("medicationName", reminder.getMedicationName());
                medStats.put("adherencePercentage", reminder.getAdherencePercentage());
                medStats.put("adherenceLevel", reminder.getAdherenceLevel());
                medicationStats.add(medStats);
            }
        }
        report.put("medicationAdherence", medicationStats);
        
        return report;
    }

    /**
     * Get dashboard statistics
     */
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime todayStart = now.toLocalDate().atStartOfDay();
        
        stats.put("totalActiveReminders", reminderRepository.countActiveReminders());
        stats.put("remindersDueNow", reminderRepository.countRemindersDueNow(now));
        stats.put("remindersSentToday", logRepository.countRemindersSentSince(todayStart));
        stats.put("dosesTakenToday", logRepository.countDosesTakenSince(todayStart));
        stats.put("dosesMissedToday", logRepository.countDosesMissedSince(todayStart));
        
        return stats;
    }

    // Helper methods
    private void scheduleInitialDoses(MedicationReminder reminder) {
        LocalDateTime startDate = reminder.getStartDate();
        List<LocalTime> reminderTimes = reminder.getParsedReminderTimes();
        
        // Schedule doses for the next 7 days
        for (int day = 0; day < 7; day++) {
            LocalDateTime currentDay = startDate.plusDays(day);
            
            for (LocalTime reminderTime : reminderTimes) {
                LocalDateTime doseTime = currentDay.toLocalDate().atTime(reminderTime);
                
                if (doseTime.isAfter(LocalDateTime.now())) {
                    MedicationReminderLog log = new MedicationReminderLog(reminder, doseTime);
                    logRepository.save(log);
                }
            }
        }
        
        // Update scheduled dose count
        reminder.setTotalDosesScheduled(reminder.getTotalDosesScheduled() + (reminderTimes.size() * 7));
        reminderRepository.save(reminder);
    }

    private void updateNextReminderDue(MedicationReminder reminder) {
        List<LocalTime> reminderTimes = reminder.getParsedReminderTimes();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextDue = null;

        // Find next reminder time today
        for (LocalTime time : reminderTimes) {
            LocalDateTime todayAtTime = now.toLocalDate().atTime(time);
            if (todayAtTime.isAfter(now)) {
                if (nextDue == null || todayAtTime.isBefore(nextDue)) {
                    nextDue = todayAtTime;
                }
            }
        }

        // If no reminder today, find first reminder tomorrow
        if (nextDue == null) {
            LocalTime firstTime = reminderTimes.get(0);
            nextDue = now.toLocalDate().plusDays(1).atTime(firstTime);
        }

        reminder.setNextReminderDue(nextDue);
    }

    private String formatTimesToJson(List<LocalTime> times) {
        StringBuilder json = new StringBuilder("[");
        for (int i = 0; i < times.size(); i++) {
            if (i > 0) json.append(",");
            json.append("\"").append(times.get(i).toString()).append("\"");
        }
        json.append("]");
        return json.toString();
    }

    /*
    // Temporarily commented out to fix compilation warnings
    private MedicationReminder.Frequency parseFrequencyFromText(String frequencyText) {
        String lower = frequencyText.toLowerCase();
        if (lower.contains("once") || lower.contains("daily") || lower.contains("1")) {
            return MedicationReminder.Frequency.ONCE_DAILY;
        } else if (lower.contains("twice") || lower.contains("2")) {
            return MedicationReminder.Frequency.TWICE_DAILY;
        } else if (lower.contains("thrice") || lower.contains("3")) {
            return MedicationReminder.Frequency.THRICE_DAILY;
        } else if (lower.contains("four") || lower.contains("4")) {
            return MedicationReminder.Frequency.FOUR_TIMES_DAILY;
        }
        return MedicationReminder.Frequency.ONCE_DAILY; // Default
    }

    private LocalDateTime calculateEndDateFromDuration(LocalDateTime startDate, String duration) {
        String lower = duration.toLowerCase();
        if (lower.contains("day")) {
            int days = extractNumber(duration);
            return startDate.plusDays(days);
        } else if (lower.contains("week")) {
            int weeks = extractNumber(duration);
            return startDate.plusWeeks(weeks);
        } else if (lower.contains("month")) {
            int months = extractNumber(duration);
            return startDate.plusMonths(months);
        }
        return startDate.plusDays(7); // Default to 7 days
    }

    private int extractNumber(String text) {
        try {
            return Integer.parseInt(text.replaceAll("[^0-9]", ""));
        } catch (NumberFormatException e) {
            return 1; // Default
        }
    }
    */

    private List<MedicationReminderLog> findRecentScheduledDoses(Long patientId, String medicationName) {
        LocalDateTime since = LocalDateTime.now().minusHours(4); // Within last 4 hours
        
        return logRepository.findRecentLogsByPatient(patientId)
            .stream()
            .filter(log -> log.getMedicationReminder().getMedicationName().equalsIgnoreCase(medicationName))
            .filter(log -> log.getScheduledTime().isAfter(since))
            .filter(log -> log.getStatus() == MedicationReminderLog.ReminderLogStatus.SCHEDULED ||
                          log.getStatus() == MedicationReminderLog.ReminderLogStatus.SENT)
            .sorted((a, b) -> b.getScheduledTime().compareTo(a.getScheduledTime()))
            .toList();
    }

    private void updateAdherenceStatistics(MedicationReminder reminder) {
        List<MedicationReminderLog> logs = logRepository.findByMedicationReminderId(reminder.getId());
        
        int taken = 0;
        int missed = 0;
        int total = logs.size();
        
        for (MedicationReminderLog log : logs) {
            if (log.isTaken()) {
                taken++;
            } else if (log.isMissed()) {
                missed++;
            }
        }
        
        reminder.setTotalDosesScheduled(total);
        reminder.setTotalDosesTaken(taken);
        reminder.setTotalDosesMissed(missed);
        reminder.calculateAdherence();
        
        reminderRepository.save(reminder);
    }

    private String getAdherenceLevel(double percentage) {
        if (percentage >= 90.0) return "Excellent";
        if (percentage >= 80.0) return "Good";
        if (percentage >= 70.0) return "Fair";
        if (percentage >= 50.0) return "Poor";
        return "Very Poor";
    }

    private void processRetryReminders() {
        List<MedicationReminderLog> retryLogs = logRepository.findLogsNeedingRetry(LocalDateTime.now());
        
        for (MedicationReminderLog log : retryLogs) {
            if (log.getReminderAttempts() < log.getMedicationReminder().getMaxRemindersPerDose()) {
                sendMedicationReminder(log.getMedicationReminder(), log);
            }
        }
    }
}
