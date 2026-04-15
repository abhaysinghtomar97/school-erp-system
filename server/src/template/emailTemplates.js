/**
 * Wraps dynamic content in a standard, branded layout.
 */
const baseLayout = (content) => `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #1e3a8a; padding: 24px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-weight: 600; letter-spacing: 0.5px;">Golden Valley ERP</h2>
        </div>
        <div style="padding: 32px;">
            ${content}
        </div>
        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Golden Valley Institutions. All rights reserved.</p>
            <p style="margin: 4px 0 0 0;">This is an automated message, please do not reply.</p>
        </div>
    </div>
`;

/**
 * Template for new user credentials
 */
const newUserCredentialsTemplate = (name, role, institutionalId, tempPassword) => {
    const content = `
        <h3 style="color: #0f172a; margin-top: 0;">Welcome, ${name}!</h3>
        <p style="font-size: 15px; line-height: 1.6;">Your <strong>${role}</strong> account has been provisioned successfully. Please use the credentials below to access the administrative portal.</p>
        
        <div style="background-color: #f1f5f9; padding: 20px; border-radius: 6px; margin: 24px 0; border-left: 4px solid #3b82f6;">
            <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569;"><strong>Institutional ID:</strong> <br/>
                <span style="font-family: ui-monospace, monospace; font-size: 16px; color: #0f172a;">${institutionalId}</span>
            </p>
            <p style="margin: 0; font-size: 14px; color: #475569;"><strong>Temporary Password:</strong> <br/>
                <span style="font-family: ui-monospace, monospace; font-size: 16px; color: #0f172a; background: #e2e8f0; padding: 2px 6px; border-radius: 4px;">${tempPassword}</span>
            </p>
        </div>

        <p style="font-size: 14px; color: #b91c1c; background-color: #fef2f2; padding: 12px; border-radius: 6px; border: 1px solid #fecaca;">
            <strong>⚠️ Security Notice:</strong> You will be required to change this temporary password during your first login.
        </p>
    `;
    return baseLayout(content);
};

module.exports = {
    newUserCredentialsTemplate
};