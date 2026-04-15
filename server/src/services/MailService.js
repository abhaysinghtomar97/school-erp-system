const nodemailer = require('nodemailer');
require('dotenv').config();

class MailService {
    constructor() {
        // Initialize the transporter using generic environment variables
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10),
            secure: process.env.SMTP_SECURE === 'true', 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Auto-verify connection when the service is instantiated
        this.verifyConnection();
    }

    /**
     * Verifies the SMTP connection on server startup
     */
    async verifyConnection() {
        try {
            await this.transporter.verify();
            console.log('✅ [MailService] SMTP connection established successfully.');
        } catch (error) {
            console.error('❌ [MailService] SMTP connection failed:', error.message);
        }
    }

    /**
     * The core sending method
     * @param {Object} options - { to, subject, html, text, attachments }
     */
    async sendEmail({ to, subject, html, text, attachments = [] }) {
        try {
            const mailOptions = {
                from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
                to,
                subject,
                html,
                text, // Fallback for email clients that don't support HTML
                attachments,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`📧 [MailService] Email sent to ${to} (ID: ${info.messageId})`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`🔴 [MailService] Failed to send email to ${to}:`, error.message);
            return { success: false, error: error.message };
        }
    }
}

// Export a single, shared instance (Singleton pattern)
module.exports = new MailService();