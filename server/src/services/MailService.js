import dotenv from 'dotenv';
dotenv.config();

class MailService {
    constructor() {
        // Initialize Brevo API configuration
        this.apiKey = process.env.BREVO_API_KEY;
        this.apiUrl = 'https://api.brevo.com/v3/smtp/email';

        // Auto-verify API key presence on server startup
        this.verifyConnection();
    }

    /**
     * Verifies if the API Key is loaded correctly
     */
    verifyConnection() {
        if (this.apiKey) {
            console.log('✅ [MailService] HTTP API Key found. Ready to send emails.');
        } else {
            console.error('❌ [MailService] BREVO_API_KEY is missing in environment variables.');
        }
    }

    /**
     * The core sending method using HTTP POST
     * @param {Object} options - { to, subject, html, text, attachments }
     */
    async sendEmail({ to, subject, html, text, attachments = [] }) {
        try {
            // Format the payload according to Brevo's REST API requirements
            const payload = {
                sender: {
                    name: process.env.MAIL_FROM_NAME,
                    email: process.env.MAIL_FROM_ADDRESS
                },
                to: [{ email: to }],
                subject: subject,
                htmlContent: html || text, // Brevo prefers HTML content
            };

            // Handle attachments if they exist
            if (attachments && attachments.length > 0) {
                payload.attachment = attachments.map(att => ({
                    name: att.filename,
                    // Brevo requires attachments to be base64 encoded strings
                    content: Buffer.isBuffer(att.content) 
                        ? att.content.toString('base64') 
                        : Buffer.from(att.content).toString('base64')
                }));
            }

            // Send HTTP request to Brevo using native fetch
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            const info = await response.json();
            console.log(`📧 [MailService] Email sent to ${to} (Message ID: ${info.messageId})`);
            return { success: true, messageId: info.messageId };

        } catch (error) {
            console.error(`🔴 [MailService] Failed to send email to ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

// Export a single, shared instance (Singleton pattern)
export default new MailService();