const pool = require('../config/db.js'); // Your pg pool
const MailService = require('../services/MailService.js');

const recordPayment = async (req, res) => {
    const { invoiceId, amountPaid, paymentMethod, transactionReference, studentEmail } = req.body;
   
    
    // Grabbing the admin ID from the authenticated session
    const adminId = req.user.id;
    
    if (!invoiceId || !amountPaid || !paymentMethod) {
        return res.status(400).json({ error: 'Please provide all required transaction fields.' });
    }

    try {
        // 1. Insert the transaction. 
        // Note: The PostgreSQL trigger handles updating the student_invoices table automatically!
        const insertQuery = `
            INSERT INTO fee_transactions 
            (invoice_id, amount_paid, payment_method, transaction_reference, processed_by) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING *;
        `;
        
        const { rows } = await pool.query(insertQuery, [
            invoiceId, 
            amountPaid, 
            paymentMethod, 
            transactionReference, 
            adminId
        ]);

        const newTransaction = rows[0];

        // 2. Dispatch the payment receipt email reliably
        // if (studentEmail) {
        //     await resend.emails.send({
        //         to: studentEmail,
        //         subject: 'Fee Payment Receipt',
        //         html: `
        //             <h2>Payment Received</h2>
        //             <p>We have successfully received your payment of ₹${amountPaid}.</p>
        //             <p>Payment Method: ${paymentMethod}</p>
        //             <p>Transaction ID: ${newTransaction.id}</p>
        //             <br/>
        //             <p>Thank you!</p>
        //         `
        //     });
        // }

        return res.status(201).json({
            message: 'Payment recorded and invoice updated successfully.',
            transaction: newTransaction
        });

    } catch (error) {
        console.error('Error recording payment:', error);
        return res.status(500).json({ error: 'Server error while processing fee transaction.' });
    }
};
// 1. Fetch all students in a class with their total pending fees
const getClassStudentsWithFees = async (req, res) => {
    const { classId } = req.params;

    try {
        // We JOIN users, enrollments, and student_invoices to get a unified dashboard view
        const query = `
    SELECT 
        u.id AS student_id,
        u.institutional_id,
        u.name,
        -- Calculate dues ONLY for unpaid invoices
        COALESCE(SUM(CASE WHEN si.due_date <= CURRENT_DATE AND si.status != 'PAID' THEN si.due_amount ELSE 0 END), 0) AS current_due,
        COALESCE(SUM(CASE WHEN si.due_date > CURRENT_DATE AND si.status != 'PAID' THEN si.due_amount ELSE 0 END), 0) AS upcoming_due,
        
        -- NEW: Fetch the most recent fee month generated for this student based on due date
        (
            SELECT fee_month 
            FROM student_invoices 
            WHERE student_id = u.id 
            ORDER BY due_date DESC 
            LIMIT 1
        ) AS last_billed_month

    FROM users u
    JOIN enrolments e ON u.id = e.student_id
    -- Notice we removed the PAID filter here so we can see all invoices!
    LEFT JOIN student_invoices si ON u.id = si.student_id 
    WHERE e.class_id = $1 AND u.role = 'STUDENT' AND e.is_active = true
    GROUP BY u.id, u.institutional_id, u.name
    ORDER BY u.name ASC;
`;
        
        const { rows } = await pool.query(query, [classId]);
        
        return res.status(200).json({ students: rows });
    } catch (error) {
        console.error('Error fetching class students:', error);
        return res.status(500).json({ error: 'Server error while fetching students.' });
    }
};

// 2. Batch Generate Fees for an entire class based on Fee Structures
// 2. Batch Generate Fees (Monthly Cycle Update)
const batchGenerateClassFees = async (req, res) => {
    const { classId, academicYear, feeMonth, dueDate } = req.body;

    // 1. Verify we actually have all 4 variables from the React frontend
    if (!classId || !academicYear || !feeMonth || !dueDate) {
        return res.status(400).json({ error: 'Class ID, Academic Year, Fee Month, and Due Date are required.' });
    }

    try {
        // 2. The SQL Query (Carefully mapped with $1, $2, $3, and $4)
       const query = `
            INSERT INTO student_invoices (student_id, fee_type_id, total_amount, due_date, status, fee_month)
            SELECT e.student_id, fs.fee_type_id, fs.amount, $4, 'UNPAID', $3::VARCHAR
            FROM enrolments e
            JOIN fee_structures fs ON e.class_id = fs.class_id
            JOIN fee_types ft ON fs.fee_type_id = ft.id
            WHERE e.class_id = $1 
              AND fs.academic_year = $2 
              AND e.is_active = true
              
              -- The Magic Fix: Mandatory fees OR student explicitly opted-in
              AND (
                  ft.is_optional = FALSE 
                  OR EXISTS (
                      SELECT 1 FROM student_optional_fees sof 
                      WHERE sof.student_id = e.student_id AND sof.fee_type_id = ft.id
                  )
              )
              
              -- Prevent Double Billing
              AND NOT EXISTS (
                  SELECT 1 FROM student_invoices si 
                  WHERE si.student_id = e.student_id 
                    AND si.fee_type_id = fs.fee_type_id
                    AND si.fee_month = $3::VARCHAR 
              )
            RETURNING *;
        `;
        
        // 3. We pass exactly 4 variables to match the $ placeholders
        const { rows } = await pool.query(query, [classId, academicYear, feeMonth, dueDate]);
        
        if (rows.length === 0) {
           
            return res.status(400).json({ message: `No new invoices generated for ${feeMonth}. Fees were likely already generated for this month.` });
        }

        return res.status(201).json({ 
            message: `Successfully generated ${rows.length} invoices for ${feeMonth}.` 
        });
    } catch (error) {
        console.error('Error in batch generation:', error);
        return res.status(500).json({ error: 'Server error during batch invoice generation.' });
    }
};

// 3. Fetch specific unpaid invoices for a student (For the "Pay" Modal)
const getStudentDueInvoices = async (req, res) => {
    const { studentId } = req.params;

    try {
        const query = `
            SELECT 
                si.id AS invoice_id, 
                ft.name AS fee_type_name, 
                si.total_amount, 
                si.paid_amount, 
                si.due_amount, 
                si.due_date 
            FROM student_invoices si
            JOIN fee_types ft ON si.fee_type_id = ft.id
            WHERE si.student_id = $1 AND si.status != 'PAID'
            ORDER BY si.due_date ASC;
        `;
        
        const { rows } = await pool.query(query, [studentId]);
        return res.status(200).json({ invoices: rows });
    } catch (error) {
        console.error('Error fetching student invoices:', error);
        return res.status(500).json({ error: 'Server error while fetching invoices.' });
    }
};
// --- FEE STRUCTURE MANAGEMENT ---

// Fetch available Fee Types (e.g., Academic, Transport)
const getFeeTypes = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM fee_types ORDER BY id ASC');
        return res.status(200).json({ feeTypes: rows });
    } catch (error) {
        console.error('Error fetching fee types:', error);
        return res.status(500).json({ error: 'Server error fetching fee types.' });
    }
};

// Fetch all existing Fee Structures (Rules)
const getFeeStructures = async (req, res) => {
    try {
        // We JOIN classes and fee_types to get human-readable names instead of UUIDs
        const query = `
            SELECT fs.id, c.name AS class_name, ft.name AS fee_type_name, fs.amount, fs.academic_year
            FROM fee_structures fs
            JOIN classes c ON fs.class_id = c.id
            JOIN fee_types ft ON fs.fee_type_id = ft.id
            ORDER BY fs.academic_year DESC, c.name ASC, ft.name ASC;
        `;
        const { rows } = await pool.query(query);
        return res.status(200).json({ feeStructures: rows });
    } catch (error) {
        console.error('Error fetching fee structures:', error);
        return res.status(500).json({ error: 'Server error fetching fee structures.' });
    }
};

// Create a new Fee Structure Rule
const createFeeStructure = async (req, res) => {
    const { classId, feeTypeId, amount, academicYear } = req.body;

    if (!classId || !feeTypeId || !amount || !academicYear) {
        return res.status(400).json({ error: 'All fields are required to create a fee structure.' });
    }

    try {
        const query = `
            INSERT INTO fee_structures (class_id, fee_type_id, amount, academic_year)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const { rows } = await pool.query(query, [classId, feeTypeId, amount, academicYear]);
        
        return res.status(201).json({ message: 'Fee structure created successfully!', feeStructure: rows[0] });
    } catch (error) {
        // 23505 is the PostgreSQL error code for a UNIQUE constraint violation
        if (error.code === '23505') {
            return res.status(400).json({ error: 'A fee structure for this class, fee type, and academic year already exists.' });
        }
        console.error('Error creating fee structure:', error);
        return res.status(500).json({ error: 'Server error creating fee structure.' });
    }
};

// Fetch Admin Fee Payment History
const getFeeHistory = async (req, res) => {
    try {
        const query = `
            SELECT 
                t.id AS transaction_id,
                u.institutional_id,
                u.name AS student_name,
                si.fee_month,
                t.amount_paid,
                t.payment_method,
                t.created_at
            FROM fee_transactions t
            JOIN student_invoices si ON t.invoice_id = si.id
            JOIN users u ON si.student_id = u.id
            ORDER BY t.created_at DESC
            LIMIT 100;
        `;
        
        const { rows } = await pool.query(query);
        
        return res.status(200).json({ 
            success: true, 
            history: rows 
        });
    } catch (error) {
        console.error('Error fetching fee history:', error);
        return res.status(500).json({ error: 'Failed to fetch fee history.' });
    }
};

// Fetch 12-Month Fee Ledger for a specific student
const getStudentFeeLedger = async (req, res) => {
    const { studentId } = req.params;

    try {
        // This query groups all invoices by month. 
        // If they owe Academic + Transport in May, it sums them.
        // If ANY invoice in that month is UNPAID, the whole month glows Red.
        const query = `
            SELECT 
                fee_month,
                SUM(total_amount) AS total_amount,
                CASE 
                    WHEN COUNT(CASE WHEN status = 'UNPAID' THEN 1 END) > 0 THEN 'UNPAID'
                    ELSE 'PAID'
                END AS status
            FROM student_invoices
            WHERE student_id = $1
            GROUP BY fee_month;
        `;
        
        const { rows } = await pool.query(query, [studentId]);
        
        return res.status(200).json({ 
            success: true, 
            invoices: rows 
        });
    } catch (error) {
        console.error('Error fetching student ledger:', error);
        return res.status(500).json({ error: 'Failed to fetch fee ledger.' });
    }
};
const payMonthDues = async (req, res) => {
    const { studentId, feeMonth, amountPaid, paymentMethod } = req.body;

    try {
        // 1. Mark all unpaid invoices for this student in this month as PAID
        const updateQuery = `
            UPDATE student_invoices 
            SET status = 'PAID' 
            WHERE student_id = $1 AND fee_month = $2 AND status = 'UNPAID'
            RETURNING id;
        `;
        const { rows: updatedInvoices } = await pool.query(updateQuery, [studentId, feeMonth]);

        if (updatedInvoices.length === 0) {
            return res.status(400).json({ error: 'No unpaid invoices found for this month.' });
        }

        // 2. Record the master transaction in the history table
        const insertTxn = `
            INSERT INTO transactions (invoice_id, amount, payment_method, payment_date)
            VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        `;
        // We link the transaction to the first invoice updated just for referencing
        await pool.query(insertTxn, [updatedInvoices[0].id, amountPaid, paymentMethod]);

        return res.status(200).json({ success: true, message: 'Payment successful.' });

    } catch (error) {
        console.error('Error processing monthly payment:', error);
        return res.status(500).json({ error: 'Payment processing failed.' });
    }
};




module.exports = {
    recordPayment,
    getClassStudentsWithFees,
    batchGenerateClassFees,
    getStudentDueInvoices,
    getFeeTypes,
    getFeeStructures,
    createFeeStructure,
    getFeeHistory,
    getStudentFeeLedger,
    payMonthDues

    
}