const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

class MailService {
    // Your existing core function
    static async sendEmail({ to, subject, html }) {
        try {
            const { data, error } = await resend.emails.send({
                from: 'Golden Valley ERP <noreply@erp-gvs.in>',
                to,
                subject,
                html,
            });

            if (error) {
                console.error("❌ Resend Error:", error);
                return { success: false, error: error.message };
            }

            console.log("✅ Email sent:", data);
            return { success: true, data };
        } catch (err) {
            console.error("❌ Mail Service Crash:", err);
            return { success: false, error: err.message };
        }
    }

    // --- NEW: Fee Module Email Templates ---

    static async sendDuesNotification(studentEmail, studentName, month, amount, dueDate) {
        const subject = `New Fee Invoice Generated - ${month} Dues`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Hello ${studentName},</h2>
                <p>Your fee invoice for the month of <strong>${month}</strong> has been generated.</p>
                <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #7c3aed; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Amount Due:</strong> ₹${amount}</p>
                    <p style="margin: 5px 0 0 0;"><strong>Due Date:</strong> ${dueDate}</p>
                </div>
                <p>Please log in to your student portal to make the payment.</p>
                <p>Thank you,<br>Golden Valley Administration</p>
            </div>
        `;
        // Call your own core method
        return await this.sendEmail({ to: studentEmail, subject, html });
    }

    static async sendCronFailureAlert(errorMessage) {
        // Make sure ADMIN_ALERT_EMAIL is in your .env file
        const adminEmail = process.env.ADMIN_ALERT_EMAIL; 
        const subject = '🚨 CRITICAL ALERT: Fee Generation Cron Job Failed';
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #dc2626;">Cron Job Failure</h2>
                <p>The automated monthly fee generation script failed to execute. Manual intervention is required.</p>
                <p><strong>Error Details:</strong></p>
                <pre style="background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 5px; overflow-x: auto;">
                    ${errorMessage}
                </pre>
                <p>Please log in to the ERP dashboard and use the <strong>"Manual Fee Generation"</strong> button to generate this month's fees.</p>
            </div>
        `;
        // Call your own core method
        return await this.sendEmail({ to: adminEmail, subject, html });
    }
}

module.exports = MailService;