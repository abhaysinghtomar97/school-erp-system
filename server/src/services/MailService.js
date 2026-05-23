import dotenv from 'dotenv';
dotenv.config();

class MailService {
    constructor() {
        this.apiKey = process.env.BREVO_API_KEY;
        this.apiUrl = 'https://api.brevo.com/v3/smtp/email';
        
        // Renamed to reflect its actual purpose
        this.verifyConfig();
    }

    /**
     * Verifies if the API Key is loaded correctly in the environment
     */
    verifyConfig() {
        if (this.apiKey) {
            console.log('✅ [MailService] HTTP API Key found. Ready to send emails.');
        } else {
            console.error('❌ [MailService] BREVO_API_KEY is missing in environment variables.');
        }
    }

    /**
     * The core sending method using HTTP POST
     * @param {Object} options - { to, subject, html, text, attachments }
     * @param {number} timeoutMs - Request timeout in milliseconds (default: 10000ms)
     */
    async sendEmail({ to, subject, html, text, attachments = [] }, timeoutMs = 10000) {
        // 1. Input Validation
        if (!to || !subject) {
            return { success: false, error: 'Missing required fields: "to" and "subject" are mandatory.' };
        }
        if (!html && !text) {
            return { success: false, error: 'Message body empty: Must provide either "html" or "text".' };
        }

        try {
            const payload = {
                sender: {
                    name: process.env.MAIL_FROM_NAME,
                    email: process.env.MAIL_FROM_ADDRESS
                },
                to: [{ email: to }],
                subject: subject,
            };

            // 2. Support both htmlContent and textContent
            if (html) payload.htmlContent = html;
            if (text) payload.textContent = text;

            // Handle attachments
            if (attachments && attachments.length > 0) {
                payload.attachment = attachments.map(att => ({
                    name: att.filename,
                    content: Buffer.isBuffer(att.content) 
                        ? att.content.toString('base64') 
                        : Buffer.from(att.content).toString('base64')
                }));
            }

            // 3. Request Timeout Handling via AbortController
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'api-key': this.apiKey,
                    'content-type': 'application/json'
                },
                body: JSON.stringify(payload),
                signal: controller.signal // Bind the abort signal
            });

            clearTimeout(timeout); // Clear the timeout if request completes

            // 4. Better Error Parsing
            if (!response.ok) {
                let errorDetails = `HTTP ${response.status} ${response.statusText}`;
                
                // Defensively parse error body (could be JSON, could be raw text)
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    const errorJson = await response.json();
                    errorDetails = JSON.stringify(errorJson);
                } else {
                    errorDetails = await response.text();
                }
                
                throw new Error(errorDetails);
            }

            const info = await response.json();
            console.log(`📧 [MailService] Email sent to ${to} (Message ID: ${info.messageId})`);
            return { success: true, messageId: info.messageId };

        } catch (error) {
            // Check if the error was triggered by our AbortController
            if (error.name === 'AbortError') {
                console.error(`🔴 [MailService] Request to Brevo timed out after ${timeoutMs}ms.`);
                return { success: false, error: 'Request Timeout' };
            }

            console.error(`🔴 [MailService] Failed to send email to ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

// Export a single, shared instance (Singleton pattern)
export default new MailService();