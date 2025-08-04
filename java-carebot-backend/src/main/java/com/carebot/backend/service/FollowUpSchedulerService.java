package com.carebot.backend.service;

import com.carebot.backend.entity.FollowUpSchedule;
import com.carebot.backend.entity.Patient;
import com.carebot.backend.repository.FollowUpScheduleRepository;
import com.carebot.backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Service for automated patient follow-up scheduling and management
 * Core implementation of proactive patient engagement system
 */
@Service
@Transactional
public class FollowUpSchedulerService {
    
    @Autowired(required = false)
    private FollowUpScheduleRepository followUpRepository;
    
    @Autowired(required = false)
    private PatientRepository patientRepository;
    
    @Autowired
    private WhatsAppService whatsAppService;
    
    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
    
    // Message templates for different visit types
    private final Map<FollowUpSchedule.VisitType, String> messageTemplates = new HashMap<>() {{
        put(FollowUpSchedule.VisitType.ROUTINE_CHECKUP, 
            "Hello {patientName}! 👋\n\nWe hope you're feeling well after your routine checkup yesterday. How are you feeling today? Any concerns or questions about your visit?\n\nReply:\n✅ GOOD - if you're feeling fine\n❓ QUESTIONS - if you have concerns\n\nYour health matters to us! 💙");
            
        put(FollowUpSchedule.VisitType.NEW_MEDICATION,
            "Hi {patientName}! 💊\n\nIt's been 24 hours since you started your new medication. How are you feeling?\n\nPlease let us know:\n✅ GOOD - no side effects\n⚠️ MILD - minor side effects\n🚨 SEVERE - concerning symptoms\n\nYour safety is our priority!");
            
        put(FollowUpSchedule.VisitType.POST_SURGERY,
            "Hello {patientName}! 🏥\n\nWe're checking on your recovery after your procedure. How are you feeling?\n\nPlease update us:\n✅ GOOD - healing well\n😟 PAIN - experiencing discomfort\n🚨 URGENT - need immediate attention\n\nWe're here to support your recovery!");
            
        put(FollowUpSchedule.VisitType.CHRONIC_CARE,
            "Hi {patientName}! 🩺\n\nJust checking in on your ongoing care. How have you been managing your condition?\n\nReply:\n✅ STABLE - feeling well\n📈 WORSE - symptoms increasing\n❓ QUESTIONS - need guidance\n\nStay strong, we're with you!");
            
        put(FollowUpSchedule.VisitType.EMERGENCY_FOLLOWUP,
            "URGENT: Hello {patientName}! 🚨\n\nWe're following up on your emergency visit. This is important - how are you feeling right now?\n\nPlease respond immediately:\n✅ STABLE - feeling better\n⚠️ SAME - no improvement\n🚨 WORSE - condition declining\n\nYour immediate response is needed!");
            
        put(FollowUpSchedule.VisitType.LAB_RESULTS,
            "Hi {patientName}! �\n\nYour lab results are in! We're following up to discuss them with you.\n\nReply:\n✅ READY - ready to discuss results\n� CALL - prefer phone consultation\n❓ QUESTIONS - have specific concerns\n\nYour health insights await!");
            
        put(FollowUpSchedule.VisitType.WELLNESS_CHECK,
            "Hello {patientName}! �\n\nTime for your wellness check! Let's review your health goals and preventive care.\n\nReply:\n✅ READY - ready for check-up\n📞 RESCHEDULE - need different time\n❓ QUESTIONS - have health concerns\n\nStaying healthy together!");
    }};
    
    /**
     * Send immediate follow-up message to patient (for testing/immediate needs)
     */
    public Map<String, Object> sendImmediateFollowUp(Long patientId, FollowUpSchedule.VisitType visitType, String sentBy) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        // Create and save the follow-up record
        FollowUpSchedule schedule = new FollowUpSchedule(patient, visitType, sentBy);
        schedule.setScheduledFollowUpTime(LocalDateTime.now()); // Set to now for immediate sending
        schedule = followUpRepository.save(schedule);
        
        // Send the message immediately
        String template = messageTemplates.get(visitType);
        String personalizedMessage = template.replace("{patientName}", patient.getPatientName());
        
        System.out.println("📤 Sending immediate " + visitType.getDisplayName() + " follow-up to " + patient.getPatientName());
        
        boolean sent = whatsAppService.sendNotification(
            patient.getContactNumber(), 
            patient.getPatientName(),
            personalizedMessage
        );
        
        Map<String, Object> result = new HashMap<>();
        result.put("followUpId", schedule.getId());
        result.put("patientName", patient.getPatientName());
        result.put("visitType", visitType.name());
        result.put("visitTypeDisplay", visitType.getDisplayName());
        result.put("sentTime", LocalDateTime.now().format(DISPLAY_FORMATTER));
        result.put("sentBy", sentBy);
        
        if (sent) {
            schedule.setFollowUpSent(true);
            schedule.setMessageTemplateUsed(visitType.name());
            followUpRepository.save(schedule);
            
            result.put("success", true);
            result.put("method", "WhatsApp Notification Sent");
            result.put("message", "Follow-up sent successfully via WhatsApp");
            
            System.out.println("✅ Immediate follow-up sent successfully to " + patient.getPatientName());
        } else {
            // If WhatsApp fails, try to generate URL for manual sending
            try {
                String whatsappUrl = generateWhatsAppUrl(patient.getContactNumber(), personalizedMessage);
                result.put("success", false);
                result.put("method", "Manual WhatsApp URL");
                result.put("message", "WhatsApp URL generated for manual sending");
                result.put("whatsappUrl", whatsappUrl);
                
                System.out.println("⚠️ WhatsApp auto-send failed, generated URL for manual sending: " + whatsappUrl);
            } catch (Exception e) {
                result.put("success", false);
                result.put("method", "Failed");
                result.put("message", "Failed to send follow-up notification");
                result.put("error", e.getMessage());
                
                System.err.println("❌ Failed to send immediate follow-up to " + patient.getPatientName() + ": " + e.getMessage());
            }
        }
        
        return result;
    }
    
    /**
     * Generate WhatsApp URL for manual sending (fallback method)
     */
    private String generateWhatsAppUrl(String phoneNumber, String message) {
        try {
            // Clean phone number
            String cleanPhone = phoneNumber.replaceAll("[^0-9+]", "");
            if (!cleanPhone.startsWith("+")) {
                cleanPhone = "+91" + cleanPhone; // Default to India
            }
            
            // Encode message for URL
            String encodedMessage = java.net.URLEncoder.encode(message, java.nio.charset.StandardCharsets.UTF_8);
            
            // Generate WhatsApp URL
            return String.format("https://wa.me/%s?text=%s", 
                cleanPhone.replace("+", ""), encodedMessage);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate WhatsApp URL: " + e.getMessage());
        }
    }

    /**
     * Schedule a follow-up for a patient based on visit type
     */
    public FollowUpSchedule scheduleFollowUp(Long patientId, FollowUpSchedule.VisitType visitType, String createdBy) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        FollowUpSchedule schedule = new FollowUpSchedule(patient, visitType, createdBy);
        return followUpRepository.save(schedule);
    }
    
    /**
     * Schedule a follow-up with custom timing
     */
    public FollowUpSchedule scheduleFollowUp(Long patientId, FollowUpSchedule.VisitType visitType, 
                                           LocalDateTime customFollowUpTime, String createdBy) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        FollowUpSchedule schedule = new FollowUpSchedule(patient, visitType, createdBy);
        schedule.setScheduledFollowUpTime(customFollowUpTime);
        return followUpRepository.save(schedule);
    }
    
    /**
     * Get all pending follow-ups for a patient
     */
    public List<FollowUpSchedule> getPendingFollowUps(Long patientId) {
        return followUpRepository.findByPatientIdAndFollowUpSentFalse(patientId);
    }
    
    /**
     * Get all follow-ups for a patient (for analytics)
     */
    public List<FollowUpSchedule> getAllFollowUps(Long patientId) {
        return followUpRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }
    
    /**
     * Automated scheduler - runs every 15 minutes to check for due follow-ups
     */
    @Scheduled(fixedRate = 900000) // 15 minutes = 900,000 milliseconds
    public void processScheduledFollowUps() {
        System.out.println("🤖 CareBot: Processing scheduled follow-ups at " + LocalDateTime.now().format(DISPLAY_FORMATTER));
        
        List<FollowUpSchedule> dueFollowUps = followUpRepository.findDueFollowUps(LocalDateTime.now());
        
        System.out.println("📋 Found " + dueFollowUps.size() + " due follow-ups");
        
        for (FollowUpSchedule followUp : dueFollowUps) {
            try {
                sendFollowUpMessage(followUp);
            } catch (Exception e) {
                System.err.println("❌ Error sending follow-up for patient " + followUp.getPatient().getPatientName() + ": " + e.getMessage());
            }
        }
    }
    
    /**
     * Check for escalations - runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour = 3,600,000 milliseconds
    public void checkForEscalations() {
        System.out.println("🚨 CareBot: Checking for escalations at " + LocalDateTime.now().format(DISPLAY_FORMATTER));
        
        List<FollowUpSchedule> needingEscalation = followUpRepository.findNeedingEscalation(LocalDateTime.now().minusHours(48));
        
        for (FollowUpSchedule followUp : needingEscalation) {
            escalateFollowUp(followUp);
        }
    }
    
    /**
     * Send follow-up message to patient
     */
    private void sendFollowUpMessage(FollowUpSchedule followUp) {
        Patient patient = followUp.getPatient();
        String template = messageTemplates.get(followUp.getVisitType());
        String personalizedMessage = template.replace("{patientName}", patient.getPatientName());
        
        System.out.println("📤 Sending " + followUp.getVisitType().getDisplayName() + " follow-up to " + patient.getPatientName());
        
        boolean sent = whatsAppService.sendNotification(
            patient.getContactNumber(), 
            patient.getPatientName(),
            personalizedMessage
        );
        
        if (sent) {
            followUp.setFollowUpSent(true);
            followUp.setMessageTemplateUsed(followUp.getVisitType().name());
            followUpRepository.save(followUp);
            
            System.out.println("✅ Follow-up sent successfully to " + patient.getPatientName());
        } else {
            System.err.println("❌ Failed to send follow-up to " + patient.getPatientName());
        }
    }
    
    /**
     * Escalate follow-up when patient doesn't respond
     */
    private void escalateFollowUp(FollowUpSchedule followUp) {
        Patient patient = followUp.getPatient();
        
        // Send escalation message to patient
        String escalationMessage = "🚨 IMPORTANT: Hello " + patient.getPatientName() + "!\n\n" +
            "We sent you a health follow-up message 48 hours ago but haven't heard back. " +
            "Your health and well-being are important to us.\n\n" +
            "Please respond with:\n" +
            "✅ OK - if you're fine\n" +
            "📞 CALL - if you need to speak with us\n" +
            "🚨 URGENT - if you need immediate help\n\n" +
            "We care about you and want to ensure you're okay.";
        
        whatsAppService.sendNotification(patient.getContactNumber(), patient.getPatientName(), escalationMessage);
        
        // Mark as escalated
        followUp.setEscalated(true);
        followUp.setEscalationReason("No response after 48 hours");
        followUpRepository.save(followUp);
        
        System.out.println("🚨 Escalated follow-up for " + patient.getPatientName());
        
        // TODO: Send notification to healthcare provider dashboard
        // This will be implemented in the dashboard enhancement phase
    }
    
    /**
     * Mark patient as responded (to be called when patient replies)
     */
    public void markPatientResponded(Long patientId, String response) {
        List<FollowUpSchedule> activeFollowUps = followUpRepository
            .findByPatientIdAndFollowUpSentTrueAndPatientRespondedFalse(patientId);
        
        for (FollowUpSchedule followUp : activeFollowUps) {
            followUp.setPatientResponded(true);
            followUpRepository.save(followUp);
        }
        
        System.out.println("✅ Patient " + patientId + " responded: " + response);
    }
    
    /**
     * Get follow-up statistics for analytics
     */
    public Map<String, Object> getFollowUpStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalScheduled", followUpRepository.count());
        stats.put("sentToday", followUpRepository.countSentToday());
        stats.put("responseRate", followUpRepository.calculateResponseRate());
        stats.put("escalationsToday", followUpRepository.countEscalationsToday());
        stats.put("pendingFollowUps", followUpRepository.countPendingFollowUps());
        
        return stats;
    }
    
    /**
     * Cancel a scheduled follow-up
     */
    public void cancelFollowUp(Long followUpId) {
        followUpRepository.deleteById(followUpId);
    }
    
    /**
     * Reschedule a follow-up
     */
    public FollowUpSchedule rescheduleFollowUp(Long followUpId, LocalDateTime newTime) {
        FollowUpSchedule followUp = followUpRepository.findById(followUpId)
            .orElseThrow(() -> new RuntimeException("Follow-up not found"));
        
        followUp.setScheduledFollowUpTime(newTime);
        followUp.setFollowUpSent(false); // Reset if it was already sent
        
        return followUpRepository.save(followUp);
    }
}
