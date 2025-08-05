package com.carebot.backend.controller;

import com.carebot.backend.entity.MedicationReminder;
// import com.carebot.backend.entity.MedicationReminderLog; // Temporarily unused
import com.carebot.backend.service.MedicationReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for Medication Reminder Management
 * 
 * Provides API endpoints for:
 * - Creating and managing medication reminders
 * - Tracking patient adherence
 * - Managing reminder schedules
 * - Reporting and analytics
 */
@RestController
@RequestMapping("/api/medication-reminders")
@CrossOrigin(origins = "*")
public class MedicationReminderController {

    @Autowired
    private MedicationReminderService medicationReminderService;

    /**
     * Create a new medication reminder
     */
    @PostMapping
    public ResponseEntity<?> createMedicationReminder(@RequestBody Map<String, Object> request) {
        try {
            Long patientId = Long.valueOf(request.get("patientId").toString());
            String medicationName = request.get("medicationName").toString();
            String dosage = request.get("dosage").toString();
            String frequencyStr = request.get("frequency").toString();
            String startDateStr = request.get("startDate").toString();
            String createdBy = request.getOrDefault("createdBy", "admin").toString();

            // Parse frequency
            MedicationReminder.Frequency frequency = MedicationReminder.Frequency.valueOf(frequencyStr);

            // Parse dates
            LocalDateTime startDate = LocalDateTime.parse(startDateStr);
            LocalDateTime endDate = null;
            if (request.containsKey("endDate") && request.get("endDate") != null) {
                endDate = LocalDateTime.parse(request.get("endDate").toString());
            }

            // Parse reminder times
            List<LocalTime> reminderTimes = null;
            if (request.containsKey("reminderTimes")) {
                @SuppressWarnings("unchecked")
                List<String> timeStrings = (List<String>) request.get("reminderTimes");
                reminderTimes = timeStrings.stream()
                    .map(LocalTime::parse)
                    .collect(Collectors.toList());
            }

            MedicationReminder reminder = medicationReminderService.createMedicationReminder(
                patientId, medicationName, dosage, frequency, startDate, endDate, reminderTimes, createdBy
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Medication reminder created successfully",
                "reminderId", reminder.getId(),
                "medicationName", reminder.getMedicationName(),
                "frequency", reminder.getFrequency().getDisplayName(),
                "nextReminderDue", reminder.getNextReminderDue()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to create medication reminder: " + e.getMessage()
            ));
        }
    }

    /**
     * Create reminder from existing prescription
     * Temporarily disabled due to prescription integration issues
     */
    /*
    @PostMapping("/from-prescription/{prescriptionId}")
    public ResponseEntity<?> createReminderFromPrescription(
            @PathVariable Long prescriptionId,
            @RequestBody Map<String, Object> request) {
        try {
            String createdBy = request.getOrDefault("createdBy", "admin").toString();

            // Parse reminder times
            List<LocalTime> reminderTimes = null;
            if (request.containsKey("reminderTimes")) {
                @SuppressWarnings("unchecked")
                List<String> timeStrings = (List<String>) request.get("reminderTimes");
                reminderTimes = timeStrings.stream()
                    .map(LocalTime::parse)
                    .collect(Collectors.toList());
            }

            MedicationReminder reminder = medicationReminderService.createReminderFromPrescription(
                prescriptionId, reminderTimes, createdBy
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Medication reminder created from prescription",
                "reminderId", reminder.getId(),
                "medicationName", reminder.getMedicationName(),
                "prescriptionId", prescriptionId
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to create reminder from prescription: " + e.getMessage()
            ));
        }
    }
    */

    /**
     * Get medication reminders for a patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getPatientReminders(@PathVariable Long patientId) {
        try {
            List<MedicationReminder> reminders = medicationReminderService.getPatientReminders(patientId);
            
            List<Map<String, Object>> reminderData = reminders.stream()
                .map(this::mapReminderToResponse)
                .collect(Collectors.toList());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "patientId", patientId,
                "totalReminders", reminders.size(),
                "reminders", reminderData
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to get patient reminders: " + e.getMessage()
            ));
        }
    }

    /**
     * Update medication reminder settings
     */
    @PutMapping("/{reminderId}")
    public ResponseEntity<?> updateMedicationReminder(
            @PathVariable Long reminderId,
            @RequestBody Map<String, Object> request) {
        try {
            // Parse reminder times
            List<LocalTime> reminderTimes = null;
            if (request.containsKey("reminderTimes")) {
                @SuppressWarnings("unchecked")
                List<String> timeStrings = (List<String>) request.get("reminderTimes");
                reminderTimes = timeStrings.stream()
                    .map(LocalTime::parse)
                    .collect(Collectors.toList());
            }

            Boolean reminderEnabled = null;
            if (request.containsKey("reminderEnabled")) {
                reminderEnabled = Boolean.valueOf(request.get("reminderEnabled").toString());
            }

            String specialInstructions = null;
            if (request.containsKey("specialInstructions")) {
                specialInstructions = request.get("specialInstructions").toString();
            }

            MedicationReminder reminder = medicationReminderService.updateMedicationReminder(
                reminderId, reminderTimes, reminderEnabled, specialInstructions
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Medication reminder updated successfully",
                "reminder", mapReminderToResponse(reminder)
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to update medication reminder: " + e.getMessage()
            ));
        }
    }

    /**
     * Mark dose as taken
     */
    @PostMapping("/dose-taken")
    public ResponseEntity<?> markDoseAsTaken(@RequestBody Map<String, Object> request) {
        try {
            Long patientId = Long.valueOf(request.get("patientId").toString());
            String medicationName = request.get("medicationName").toString();
            
            LocalDateTime takenTime = LocalDateTime.now();
            if (request.containsKey("takenTime")) {
                takenTime = LocalDateTime.parse(request.get("takenTime").toString());
            }

            medicationReminderService.markDoseAsTaken(patientId, medicationName, takenTime);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Dose marked as taken successfully",
                "patientId", patientId,
                "medicationName", medicationName,
                "takenTime", takenTime
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to mark dose as taken: " + e.getMessage()
            ));
        }
    }

    /**
     * Mark dose as missed
     */
    @PostMapping("/dose-missed")
    public ResponseEntity<?> markDoseAsMissed(@RequestBody Map<String, Object> request) {
        try {
            Long patientId = Long.valueOf(request.get("patientId").toString());
            String medicationName = request.get("medicationName").toString();

            medicationReminderService.markDoseAsMissed(patientId, medicationName);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Dose marked as missed",
                "patientId", patientId,
                "medicationName", medicationName
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to mark dose as missed: " + e.getMessage()
            ));
        }
    }

    /**
     * Get patient adherence report
     */
    @GetMapping("/adherence-report/{patientId}")
    public ResponseEntity<?> getAdherenceReport(
            @PathVariable Long patientId,
            @RequestParam(defaultValue = "30") int days) {
        try {
            Map<String, Object> report = medicationReminderService.getPatientAdherenceReport(patientId, days);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "adherenceReport", report
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to generate adherence report: " + e.getMessage()
            ));
        }
    }

    /**
     * Get dashboard statistics
     */
    @GetMapping("/dashboard-stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            Map<String, Object> stats = medicationReminderService.getDashboardStats();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "stats", stats
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to get dashboard stats: " + e.getMessage()
            ));
        }
    }

    /**
     * Get available frequencies
     */
    @GetMapping("/frequencies")
    public ResponseEntity<?> getAvailableFrequencies() {
        try {
            List<Map<String, Object>> frequencies = List.of(
                Map.of("value", "ONCE_DAILY", "display", "Once Daily", "dailyDoses", 1),
                Map.of("value", "TWICE_DAILY", "display", "Twice Daily", "dailyDoses", 2),
                Map.of("value", "THRICE_DAILY", "display", "Three Times Daily", "dailyDoses", 3),
                Map.of("value", "FOUR_TIMES_DAILY", "display", "Four Times Daily", "dailyDoses", 4),
                Map.of("value", "FIVE_TIMES_DAILY", "display", "Five Times Daily", "dailyDoses", 5),
                Map.of("value", "SIX_TIMES_DAILY", "display", "Six Times Daily", "dailyDoses", 6),
                Map.of("value", "EVERY_OTHER_DAY", "display", "Every Other Day", "dailyDoses", 0.5),
                Map.of("value", "WEEKLY", "display", "Weekly", "dailyDoses", 0.14),
                Map.of("value", "AS_NEEDED", "display", "As Needed", "dailyDoses", 0),
                Map.of("value", "CUSTOM", "display", "Custom Schedule", "dailyDoses", 0)
            );

            return ResponseEntity.ok(Map.of(
                "success", true,
                "frequencies", frequencies
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to get frequencies: " + e.getMessage()
            ));
        }
    }

    /**
     * Process manual reminder trigger (for testing)
     */
    @PostMapping("/trigger-reminders")
    public ResponseEntity<?> triggerReminders() {
        try {
            medicationReminderService.processScheduledReminders();

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Reminder processing triggered successfully"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", "Failed to trigger reminders: " + e.getMessage()
            ));
        }
    }

    // Helper method to map reminder to response
    private Map<String, Object> mapReminderToResponse(MedicationReminder reminder) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", reminder.getId());
        response.put("medicationName", reminder.getMedicationName());
        response.put("dosage", reminder.getDosage());
        response.put("frequency", reminder.getFrequency().getDisplayName());
        response.put("frequencyValue", reminder.getFrequency().name());
        response.put("startDate", reminder.getStartDate().format(formatter));
        response.put("endDate", reminder.getEndDate() != null ? reminder.getEndDate().format(formatter) : null);
        response.put("reminderEnabled", reminder.getReminderEnabled());
        response.put("status", reminder.getStatus().getDisplayName());
        response.put("adherencePercentage", reminder.getAdherencePercentage());
        response.put("adherenceLevel", reminder.getAdherenceLevel());
        response.put("totalDosesScheduled", reminder.getTotalDosesScheduled());
        response.put("totalDosesTaken", reminder.getTotalDosesTaken());
        response.put("totalDosesMissed", reminder.getTotalDosesMissed());
        response.put("nextReminderDue", reminder.getNextReminderDue() != null ? reminder.getNextReminderDue().format(formatter) : null);
        response.put("specialInstructions", reminder.getSpecialInstructions());
        response.put("reminderTimes", reminder.getParsedReminderTimes().stream()
            .map(time -> time.format(DateTimeFormatter.ofPattern("HH:mm")))
            .collect(Collectors.toList()));
        
        return response;
    }
}
