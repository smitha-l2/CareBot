package com.carebot.backend.service;

import com.carebot.backend.entity.Document;
import com.carebot.backend.entity.Patient;
import com.carebot.backend.service.messaging.FreeWhatsAppService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.annotation.PostConstruct;
import java.time.format.DateTimeFormatter;

/**
 * Service for sending WhatsApp messages via multiple providers
 * Supports Twilio (paid) and Free alternatives
 */
@Service
public class WhatsAppService {

    private static final Logger logger = LoggerFactory.getLogger(WhatsAppService.class);

    @Autowired
    private FreeWhatsAppService freeWhatsAppService;

    @Value("${twilio.account.sid:}")
    private String accountSid;

    @Value("${twilio.auth.token:}")
    private String authToken;

    @Value("${twilio.whatsapp.from:whatsapp:+14155238886}")
    private String fromWhatsAppNumber;

    @Value("${carebot.whatsapp.enabled:false}")
    private boolean whatsAppEnabled;

    @Value("${carebot.whatsapp.free.fallback:true}")
    private boolean useFreeAsFallback;

    @PostConstruct
    public void init() {
        if (whatsAppEnabled && !accountSid.isEmpty() && !authToken.isEmpty()) {
            try {
                Twilio.init(accountSid, authToken);
                logger.info("Twilio WhatsApp service initialized successfully");
            } catch (Exception e) {
                logger.error("Failed to initialize Twilio WhatsApp service: {}", e.getMessage());
                whatsAppEnabled = false;
            }
        } else {
            logger.warn("WhatsApp service is disabled or missing configuration");
        }
    }

    /**
     * Send prescription notification to patient via WhatsApp
     * Falls back to free service if Twilio is not available
     */
    public boolean sendPrescriptionNotification(Patient patient, Document document) {
        // Try Twilio first if enabled
        if (whatsAppEnabled && !accountSid.isEmpty() && !authToken.isEmpty()) {
            try {
                String messageBody = buildPrescriptionMessage(patient, document);
                String toWhatsAppNumber = formatPhoneNumber(patient.getContactNumber());
                
                Message message = Message.creator(
                        new PhoneNumber(toWhatsAppNumber),
                        new PhoneNumber(fromWhatsAppNumber),
                        messageBody
                ).create();

                logger.info("WhatsApp message sent successfully via Twilio to {} with SID: {}", 
                           toWhatsAppNumber, message.getSid());
                return true;

            } catch (Exception e) {
                logger.error("Failed to send WhatsApp message via Twilio to {}: {}", 
                            patient.getContactNumber(), e.getMessage());
                
                // Fall back to free service if enabled
                if (useFreeAsFallback) {
                    logger.info("Falling back to free WhatsApp service...");
                    return freeWhatsAppService.sendPrescriptionNotification(patient, document);
                }
                return false;
            }
        } 
        // Use free service if Twilio is not configured
        else if (useFreeAsFallback) {
            logger.info("Twilio not configured, using free WhatsApp service");
            return freeWhatsAppService.sendPrescriptionNotification(patient, document);
        } 
        else {
            logger.warn("WhatsApp service is disabled - prescription notification not sent");
            return false;
        }
    }

    /**
     * Send general notification to patient
     */
    public boolean sendNotification(String contactNumber, String patientName, String message) {
        if (!whatsAppEnabled) {
            logger.warn("WhatsApp service is disabled - notification not sent");
            return false;
        }

        try {
            String toWhatsAppNumber = formatPhoneNumber(contactNumber);
            String formattedMessage = buildGeneralMessage(patientName, message);
            
            Message twilioMessage = Message.creator(
                    new PhoneNumber(toWhatsAppNumber),
                    new PhoneNumber(fromWhatsAppNumber),
                    formattedMessage
            ).create();

            logger.info("WhatsApp notification sent successfully to {} with SID: {}", 
                       toWhatsAppNumber, twilioMessage.getSid());
            return true;

        } catch (Exception e) {
            logger.error("Failed to send WhatsApp notification to {}: {}", 
                        contactNumber, e.getMessage());
            return false;
        }
    }

    /**
     * Build prescription notification message
     */
    private String buildPrescriptionMessage(Patient patient, Document document) {
        StringBuilder message = new StringBuilder();
        
        message.append("🏥 *CAREBOT HEALTH NOTIFICATION*\n\n");
        message.append("Dear ").append(patient.getPatientName()).append(",\n\n");
        message.append("✅ Thank you for visiting us today!\n\n");
        message.append("Your prescription and medical documents have been successfully uploaded to your Carebot healthcare portal.\n\n");
        
        message.append("📄 *Document Details:*\n");
        message.append("• File: ").append(document.getOriginalFilename()).append("\n");
        message.append("• Type: ").append(document.getDocumentType()).append("\n");
        message.append("• Uploaded: ").append(
            document.getUploadedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
        ).append("\n");
        
        if (document.getDescription() != null && !document.getDescription().trim().isEmpty()) {
            message.append("• Notes: ").append(document.getDescription()).append("\n");
        }
        
        message.append("\n� *Important Reminders:*\n");
        message.append("• Follow your prescribed medication schedule\n");
        message.append("• Contact your healthcare provider for any questions\n");
        message.append("• Keep this document for your records\n");
        
        message.append("\n📞 For any concerns, contact your healthcare provider\n");
        message.append("🚨 Emergency? Call your local emergency number\n\n");
        message.append("*This is an automated message from Carebot Healthcare System*");
        
        return message.toString();
    }

    /**
     * Build general notification message
     */
    private String buildGeneralMessage(String patientName, String customMessage) {
        StringBuilder message = new StringBuilder();
        
        message.append("🏥 *CAREBOT HEALTH NOTIFICATION*\n\n");
        message.append("Dear ").append(patientName).append(",\n\n");
        message.append(customMessage).append("\n\n");
        message.append("📞 For questions, contact your healthcare provider\n");
        message.append("*This is an automated message from Carebot Healthcare System*");
        
        return message.toString();
    }

    /**
     * Format phone number for WhatsApp (ensure it starts with whatsapp: and has country code)
     */
    private String formatPhoneNumber(String phoneNumber) {
        // Remove any existing whatsapp: prefix
        String cleanNumber = phoneNumber.replace("whatsapp:", "").trim();
        
        // Remove any non-digit characters except +
        cleanNumber = cleanNumber.replaceAll("[^+\\d]", "");
        
        // Add country code if missing (assuming +1 for US/Canada, adjust as needed)
        if (!cleanNumber.startsWith("+")) {
            // For Indian numbers (most common), add +91
            if (cleanNumber.length() == 10) {
                cleanNumber = "+91" + cleanNumber;
            }
            // For US numbers, add +1
            else if (cleanNumber.length() == 10 || cleanNumber.length() == 11) {
                cleanNumber = "+1" + cleanNumber;
            }
            // If already has country code without +, add it
            else if (cleanNumber.length() > 10) {
                cleanNumber = "+" + cleanNumber;
            }
        }
        
        return "whatsapp:" + cleanNumber;
    }

    /**
     * Test WhatsApp connection
     */
    public boolean testConnection() {
        if (!whatsAppEnabled) {
            return false;
        }

        try {
            // Send a test message to Twilio's test number
            Message message = Message.creator(
                    new PhoneNumber("whatsapp:+15005550006"), // Twilio test number
                    new PhoneNumber(fromWhatsAppNumber),
                    "Test message from Carebot - WhatsApp integration working!"
            ).create();
            
            logger.info("WhatsApp test message sent with SID: {}", message.getSid());
            return true;
        } catch (Exception e) {
            logger.error("WhatsApp connection test failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if WhatsApp service is enabled and properly configured
     */
    public boolean isWhatsAppEnabled() {
        return whatsAppEnabled;
    }

    /**
     * Send appointment reminder
     */
    public boolean sendAppointmentReminder(String contactNumber, String patientName, 
                                         String appointmentDate, String doctorName) {
        if (!whatsAppEnabled) {
            return false;
        }

        String message = String.format(
            "📅 *APPOINTMENT REMINDER*\n\n" +
            "You have an upcoming appointment:\n" +
            "• Date: %s\n" +
            "• Doctor: %s\n\n" +
            "Please arrive 15 minutes early.\n" +
            "Bring your ID and insurance card.",
            appointmentDate, doctorName
        );

        return sendNotification(contactNumber, patientName, message);
    }
}
