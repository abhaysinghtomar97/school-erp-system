const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

class MailService {

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

                return {
                    success: false,
                    error: error.message
                };
            }

            console.log("✅ Email sent:", data);

            return {
                success: true,
                data
            };

        } catch (err) {

            console.error("❌ Mail Service Crash:", err);

            return {
                success: false,
                error: err.message
            };
        }
    }
}

module.exports = MailService;