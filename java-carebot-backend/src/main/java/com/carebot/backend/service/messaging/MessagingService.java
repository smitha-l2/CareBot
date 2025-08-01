package com.carebot.backend.service.messaging;

/**
 * Interface for messaging service providers
 */
public interface MessagingService {
    
    /**
     * Send a WhatsApp message to a recipient
     * @param recipientNumber The recipient's phone number (with country code)
     * @param message The message content to send
     * @return MessagingResult containing success status and details
     */
    MessagingResult sendMessage(String recipientNumber, String message);
    
    /**
     * Send a prescription notification via WhatsApp
     * @param patientName The patient's name
     * @param contactNumber The patient's phone number
     * @param fileName The name of the uploaded file
     * @param uploadDate The date of upload
     * @param patientId The patient's ID
     * @return MessagingResult containing success status and details
     */
    MessagingResult sendPrescriptionNotification(
        String patientName, 
        String contactNumber, 
        String fileName, 
        String uploadDate, 
        String patientId
    );
    
    /**
     * Test the connection to the messaging service
     * @return MessagingResult indicating if the service is reachable
     */
    MessagingResult testConnection();
    
    /**
     * Get the provider type for this service
     * @return MessagingProvider enum value
     */
    MessagingProvider getProvider();
    
    /**
     * Check if the service is properly configured and enabled
     * @return true if service is ready to use
     */
    boolean isServiceEnabled();
    
    /**
     * Get service status information
     * @return String describing current service status
     */
    String getServiceStatus();
}
