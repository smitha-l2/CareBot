package com.carebot.backend.service.messaging;

/**
 * Enum representing different messaging service providers
 */
public enum MessagingProvider {
    TWILIO("Twilio WhatsApp Business API"),
    VONAGE("Vonage (Nexmo) Messages API"),
    WHATSAPP_BUSINESS("Official WhatsApp Business API"),
    CHATAPI("ChatAPI Service"),
    MESSAGEBIRD("MessageBird WhatsApp API"),
    
    // Free alternatives (no account required)
    WHATSAPP_WEB("WhatsApp Web Automation (Free)"),
    SIMPLE_HTTP("Simple HTTP API (Free)"),
    EMAIL_FALLBACK("Email Fallback (Free)"),
    BROWSER_LINK("Browser Link Method (Free)"),
    DISABLED("Messaging Disabled");

    private final String displayName;

    MessagingProvider(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
