const pool = require('../config/db.js');

// 1. GET: Fetch all students in a class and their transport status
const getClassTransportAllocation = async (req, res) => {
    const { classId } = req.params;

    try {
        // We use LEFT JOIN so we get ALL students in the class, 
        // even if they don't have the optional fee yet.
        const query = `
            SELECT 
                u.id AS student_id,
                u.institutional_id,
                u.name,
                CASE 
                    WHEN sof.fee_type_id IS NOT NULL THEN true 
                    ELSE false 
                END AS is_enrolled
            FROM enrolments e
            JOIN users u ON e.student_id = u.id
            -- Find the specific ID for the Transport Fee dynamically
            LEFT JOIN fee_types ft ON ft.name = 'Transport Fee' AND ft.is_optional = true
            -- Check if the student is assigned this specific fee
            LEFT JOIN student_optional_fees sof ON sof.student_id = u.id AND sof.fee_type_id = ft.id
            WHERE e.class_id = $1 AND e.is_active = true
            ORDER BY u.name ASC;
        `;

        const { rows } = await pool.query(query, [classId]);
        
        return res.status(200).json({ success: true, students: rows });

    } catch (error) {
        console.error('Error fetching transport allocation:', error);
        return res.status(500).json({ error: 'Failed to fetch transport data.' });
    }
};

// 2. POST: Toggle a student's transport status (ON/OFF)
const toggleTransportStatus = async (req, res) => {
    const { studentId, isCurrentlyEnrolled } = req.body;

    try {
        // First, get the ID of the Transport Fee from your database
        const feeTypeQuery = `SELECT id FROM fee_types WHERE name = 'Transport Fee' AND is_optional = true LIMIT 1;`;
        const { rows: feeTypeRows } = await pool.query(feeTypeQuery);
        
        if (feeTypeRows.length === 0) {
            return res.status(404).json({ error: 'Transport Fee type not found in database.' });
        }
        
        const transportFeeId = feeTypeRows[0].id;

        // If they are currently enrolled, we REMOVE them (Toggle OFF)
        if (isCurrentlyEnrolled) {
            await pool.query(
                `DELETE FROM student_optional_fees WHERE student_id = $1 AND fee_type_id = $2`,
                [studentId, transportFeeId]
            );
            return res.status(200).json({ success: true, message: 'Transport cancelled.', is_enrolled: false });
        } 
        
        // If they are NOT enrolled, we ADD them (Toggle ON)
        else {
            await pool.query(
                `INSERT INTO student_optional_fees (student_id, fee_type_id) VALUES ($1, $2)`,
                [studentId, transportFeeId]
            );
            return res.status(200).json({ success: true, message: 'Transport assigned.', is_enrolled: true });
        }

    } catch (error) {
        console.error('Error toggling transport status:', error);
        return res.status(500).json({ error: 'Failed to update transport status.' });
    }
};
// 3. GET: Fetch Dashboard Summary (No Charts, strictly Data)
const getTransportSummary = async (req, res) => {
    try {
        // 1. Get ONLY the ID of the Transport Fee (Amount doesn't live here!)
        const feeQuery = `SELECT id FROM fee_types WHERE name = 'Transport Fee' AND is_optional = true LIMIT 1;`;
        const { rows: feeRows } = await pool.query(feeQuery);
        
        if (feeRows.length === 0) {
            return res.status(404).json({ error: 'Transport Fee type not found.' });
        }
        const transportFeeId = feeRows[0].id;

        // 2. The Master Query: Breakdown by Class, including their specific fee amount
        const breakdownQuery = `
            SELECT 
                c.name,
                COALESCE(fs.amount, 0) AS class_fee_amount, -- Pulls the specific amount for this class
                COUNT(DISTINCT e.student_id) AS total_students,
                SUM(CASE WHEN sof.fee_type_id IS NOT NULL THEN 1 ELSE 0 END) AS enrolled_students
            FROM classes c
            JOIN enrolments e ON c.id = e.class_id AND e.is_active = true
            -- Join fee_structures to find out how much transport costs for THIS specific class
            LEFT JOIN fee_structures fs ON c.id = fs.class_id AND fs.fee_type_id = $1
            -- Join optional fees to count the actual riders
            LEFT JOIN student_optional_fees sof ON e.student_id = sof.student_id AND sof.fee_type_id = $1
            GROUP BY c.id, c.name, fs.amount
            ORDER BY c.name ASC;
        `;
        
        const { rows: breakdownRows } = await pool.query(breakdownQuery, [transportFeeId]);

        // 3. Dynamically calculate the totals in Node.js
        let totalEnrolled = 0;
        let expectedRevenue = 0;

        const formattedBreakdown = breakdownRows.map(row => {
            const enrolled = parseInt(row.enrolled_students) || 0;
            const feeAmount = parseFloat(row.class_fee_amount) || 0;
            const classRevenue = enrolled * feeAmount;

            // Add this class's totals to the grand totals
            totalEnrolled += enrolled;
            expectedRevenue += classRevenue;

            return {
                className: row.class_name,
                totalStudents: parseInt(row.total_students) || 0,
                enrolledStudents: enrolled,
                feeAmount: feeAmount, // Now we know exactly what this class is charged
                expectedClassRevenue: classRevenue
            };
        });

        return res.status(200).json({
            success: true,
            summary: {
                totalEnrolled,
                expectedRevenue,
                classBreakdown: formattedBreakdown
            }
        });

    } catch (error) {
        console.error('Error fetching transport summary:', error);
        return res.status(500).json({ error: 'Failed to fetch transport summary.' });
    }
};
module.exports = {
    getClassTransportAllocation,
    toggleTransportStatus,
    getTransportSummary // <--- Export the new function
};
