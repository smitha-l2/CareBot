package com.carebot.backend.service.messaging;

/**
 * Data class representing the result of a messaging operation
 */
public class MessagingResult {
    private boolean success;
    private String messageId;
    private String errorMessage;
    private MessagingProvider provider;
    private String recipientNumber;
    private String status;

    public MessagingResult() {}

    public MessagingResult(boolean success, String messageId, String errorMessage, MessagingProvider provider) {
        this.success = success;
        this.messageId = messageId;
        this.errorMessage = errorMessage;
        this.provider = provider;
    }

    // Static factory methods
    public static MessagingResult success(String messageId, MessagingProvider provider, String recipientNumber) {
        MessagingResult result = new MessagingResult();
        result.setSuccess(true);
        result.setMessageId(messageId);
        result.setProvider(provider);
        result.setRecipientNumber(recipientNumber);
        result.setStatus("sent");
        return result;
    }

    public static MessagingResult failure(String errorMessage, MessagingProvider provider, String recipientNumber) {
        MessagingResult result = new MessagingResult();
        result.setSuccess(false);
        result.setErrorMessage(errorMessage);
        result.setProvider(provider);
        result.setRecipientNumber(recipientNumber);
        result.setStatus("failed");
        return result;
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessageId() {
        return messageId;
    }

    public void setMessageId(String messageId) {
        this.messageId = messageId;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public MessagingProvider getProvider() {
        return provider;
    }

    public void setProvider(MessagingProvider provider) {
        this.provider = provider;
    }

    public String getRecipientNumber() {
        return recipientNumber;
    }

    public void setRecipientNumber(String recipientNumber) {
        this.recipientNumber = recipientNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Override
    public String toString() {
        return "MessagingResult{" +
                "success=" + success +
                ", messageId='" + messageId + '\'' +
                ", errorMessage='" + errorMessage + '\'' +
                ", provider=" + provider +
                ", recipientNumber='" + recipientNumber + '\'' +
                ", status='" + status + '\'' +
                '}';
    }
}
