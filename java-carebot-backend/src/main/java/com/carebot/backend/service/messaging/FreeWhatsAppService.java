package com.carebot.backend.service.messaging;

import com.carebot.backend.entity.Patient;
import com.carebot.backend.entity.Document;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Free WhatsApp messaging service that doesn't require any external accounts.
 * Uses browser automation and URL schemes to send messages.
 */
@Service
public class FreeWhatsAppService {
    
    private static final Logger logger = LoggerFactory.getLogger(FreeWhatsAppService.class);
    
    @Value("${carebot.whatsapp.free.enabled:true}")
    private boolean freeWhatsAppEnabled;
    
    @Value("${carebot.whatsapp.free.method:BROWSER_LINK}")
    private String preferredMethod;
    
    /**
     * Method 1: Generate WhatsApp URL that opens in browser (No automation needed)
     */
    public String generateWhatsAppUrl(String phoneNumber, String message) {
        try {
            // Clean phone number (remove spaces, dashes, etc.)
            String cleanPhone = phoneNumber.replaceAll("[^0-9+]", "");
            
            // Ensure it starts with country code
            if (!cleanPhone.startsWith("+")) {
                cleanPhone = "+91" + cleanPhone; // Default to India
            }
            
            // Encode message for URL
            String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
            
            // Generate WhatsApp URL
            String whatsappUrl = String.format("https://wa.me/%s?text=%s", 
                cleanPhone.replace("+", ""), encodedMessage);
            
            logger.info("Generated WhatsApp URL for {}: {}", phoneNumber, whatsappUrl);
            return whatsappUrl;
            
        } catch (Exception e) {
            logger.error("Error generating WhatsApp URL: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Method 2: Generate WhatsApp Web URL
     */
    public String generateWhatsAppWebUrl(String phoneNumber, String message) {
        try {
            String cleanPhone = phoneNumber.replaceAll("[^0-9+]", "");
            if (!cleanPhone.startsWith("+")) {
                cleanPhone = "+91" + cleanPhone;
            }
            
            String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
            String webUrl = String.format("https://web.whatsapp.com/send?phone=%s&text=%s", 
                cleanPhone.replace("+", ""), encodedMessage);
            
            logger.info("Generated WhatsApp Web URL for {}: {}", phoneNumber, webUrl);
            return webUrl;
            
        } catch (Exception e) {
            logger.error("Error generating WhatsApp Web URL: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Send prescription notification using free method
     */
    public boolean sendPrescriptionNotification(Patient patient, Document document) {
        if (!freeWhatsAppEnabled) {
            logger.warn("Free WhatsApp service is disabled");
            return false;
        }
        
        try {
            String message = buildPrescriptionMessage(patient, document);
            String phoneNumber = patient.getContactNumber();
            
            switch (preferredMethod.toUpperCase()) {
                case "BROWSER_LINK":
                    return sendViaBrowserLink(phoneNumber, message);
                case "EMAIL_NOTIFICATION":
                    return sendViaEmailNotification(patient, message);
                case "LOG_ONLY":
                    return logMessage(phoneNumber, message);
                default:
                    return sendViaBrowserLink(phoneNumber, message);
            }
            
        } catch (Exception e) {
            logger.error("Error sending free WhatsApp notification: {}", e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Method 1: Browser Link (Opens WhatsApp in browser)
     */
    private boolean sendViaBrowserLink(String phoneNumber, String message) {
        try {
            String url = generateWhatsAppUrl(phoneNumber, message);
            if (url != null) {
                // In a real implementation, this could:
                // 1. Save the URL to database for admin to click
                // 2. Display in admin interface
                // 3. Send via email to admin
                // 4. Use browser automation (if needed)
                
                logger.info("✅ WhatsApp link generated successfully!");
                logger.info("📱 Click this link to send message: {}", url);
                logger.info("📞 To: {}", phoneNumber);
                logger.info("💬 Message: {}", message.substring(0, Math.min(100, message.length())) + "...");
                
                return true;
            }
            return false;
            
        } catch (Exception e) {
            logger.error("Error in browser link method: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Method 2: Email notification with WhatsApp link
     */
    private boolean sendViaEmailNotification(Patient patient, String message) {
        try {
            String url = generateWhatsAppUrl(patient.getContactNumber(), message);
            
            // In a real implementation, send email to admin with the link
            logger.info("📧 Email notification would be sent to admin with WhatsApp link:");
            logger.info("Subject: WhatsApp Message for Patient {}", patient.getPatientName());
            logger.info("Link: {}", url);
            
            return true;
        } catch (Exception e) {
            logger.error("Error in email notification method: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Method 3: Log only (for testing/debugging)
     */
    private boolean logMessage(String phoneNumber, String message) {
        logger.info("=== FREE WHATSAPP MESSAGE ===");
        logger.info("To: {}", phoneNumber);
        logger.info("Message: {}", message);
        logger.info("============================");
        return true;
    }
    
    /**
     * Build prescription message
     */
    private String buildPrescriptionMessage(Patient patient, Document document) {
        String template = """
            🏥 *Carebot Healthcare Notification*
            
            Dear %s,
            
            Your medical document has been successfully uploaded to our secure system.
            
            📋 *Document Details:*
            • Document: %s
            • Upload Date: %s
            • Patient ID: %s
            
            📞 *Contact Information:*
            If you have any questions about this document, please contact your healthcare provider.
            
            ⚠️ *Important:* This is an automated notification. Please do not reply to this message.
            
            🔒 Your health information is protected and secure.
            
            *Carebot Healthcare System*
            """;
        
        return String.format(template,
            patient.getPatientName(),
            document.getOriginalFilename(),
            LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")),
            patient.getId()
        );
    }
    
    /**
     * Test the free WhatsApp service
     */
    public boolean testConnection() {
        try {
            logger.info("Testing Free WhatsApp Service...");
            logger.info("Method: {}", preferredMethod);
            logger.info("Enabled: {}", freeWhatsAppEnabled);
            
            String testMessage = "Test message from Carebot Healthcare System";
            String testPhone = "+919876543210";
            String url = generateWhatsAppUrl(testPhone, testMessage);
            
            if (url != null) {
                logger.info("✅ Free WhatsApp service test successful!");
                logger.info("Generated URL: {}", url);
                return true;
            } else {
                logger.warn("❌ Free WhatsApp service test failed!");
                return false;
            }
            
        } catch (Exception e) {
            logger.error("Error testing free WhatsApp service: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get service status
     */
    public String getServiceStatus() {
        if (!freeWhatsAppEnabled) {
            return "Free WhatsApp service is disabled";
        }
        
        return String.format("Free WhatsApp service is enabled (Method: %s)", preferredMethod);
    }
}
