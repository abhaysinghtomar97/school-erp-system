const cron = require('node-cron');
const pool = require('../config/db.js');
const MailService = require('./MailService.js');

//  "Run at 00:00 (midnight) on the 25th day of every month"
cron.schedule('0 0 25 * *', async () => {
    console.log('🤖 CRON JOB STARTED: Auto-generating upcoming monthly fees...');

    try {
        // 1. Calculate what the NEXT month is
        const nextMonthDate = new Date();
        nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
        const feeMonth = nextMonthDate.toLocaleString('default', { month: 'long' }); // e.g., "June"
        
        // Due date is the 1st of that next month
        const dueDate = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), 1)
            .toISOString().split('T')[0];
        
        // Academic year logic (Simplified: assumes year starts in April)
        const year = nextMonthDate.getFullYear();
        const academicYear = nextMonthDate.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

        // 2. The Auto-Generate SQL Query 
        // (Similar to our batch generator, but it loops through ALL classes that have rules)
        const query = `
            INSERT INTO student_invoices (student_id, fee_type_id, total_amount, due_date, status, fee_month)
            SELECT e.student_id, fs.fee_type_id, fs.amount, $2, 'UNPAID', $1::VARCHAR
            FROM enrolments e
            JOIN fee_structures fs ON e.class_id = fs.class_id
            WHERE fs.academic_year = $3 
              AND e.is_active = true
              AND NOT EXISTS (
                  SELECT 1 FROM student_invoices si 
                  WHERE si.student_id = e.student_id 
                    AND si.fee_type_id = fs.fee_type_id
                    AND si.fee_month = $1::VARCHAR 
              )
            RETURNING id;
        `;

        const { rows: newInvoices } = await pool.query(query, [feeMonth, dueDate, academicYear]);

        if (newInvoices.length > 0) {
            const invoiceIds = newInvoices.map(inv => inv.id);
            const emailQuery = `
                SELECT u.email, u.name, si.total_amount 
                FROM student_invoices si
                JOIN users u ON si.student_id = u.id
                WHERE si.id = ANY($1) AND u.email IS NOT NULL;
            `;
            const { rows: studentData } = await pool.query(emailQuery, [invoiceIds]);

            // Loop and send using the class method
            for (const student of studentData) {
                await MailService.sendDuesNotification(
                    student.email, 
                    student.name, 
                    feeMonth, 
                    student.total_amount, 
                    dueDate
                );
            }
            
            console.log(`✅ CRON SUCCESS: Auto-generated and emailed ${studentData.length} invoices.`);
        }

    } catch (error) {
        console.error('❌ CRON ERROR:', error);
        // Send alert using the class method
        await MailService.sendCronFailureAlert(error.message || JSON.stringify(error));
    }
});

module.exports = cron;