import React, { useState, useEffect } from 'react';

import API from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';
import TableSkeleton from '../../components/TableSkeleton';


export default function FeeDashboard() {
  const navigate = useNavigate();
  // lazy loading 
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  // admin help
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  // --- State Management ---
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Payment Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [studentInvoices, setStudentInvoices] = useState([]);
  const [paymentData, setPaymentData] = useState({
    invoiceId: '',
    amountPaid: '',
    paymentMethod: 'CASH',
    transactionReference: ''
  });

  // Batch Generation Modal State
  const [batchModalOpen, setBatchModalOpen] = useState(false);

  const [batchData, setBatchData] = useState({
    academicYear: '2026-2027',
    feeMonth: 'April', // Default to start of Indian academic year
    dueDate: ''
  });

  // --- Initial Data Fetch ---
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Replace with your actual endpoint to fetch available classes
        const res = await API.get('/admin/classes');
        setClasses(res.data.classes);


      } catch (err) {
        console.error("Failed to load classes", err);
      }
    };
    fetchClasses();
  }, []);

  // --- 1. Fetch Students for Selected Class ---
  const fetchClassStudents = async (classId) => {

    if (!classId) {
      setStudents([]);
      return;
    }

    setIsFetchingStudents(true); // 1. Turn on the Skeleton Loader
    // setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await API.get(`/fee/class/${classId}`);
      setStudents(res.data.students);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to fetch students' });
    } finally {
      setIsFetchingStudents(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    fetchClassStudents(classId);
  };

  // --- 2. Confirm Batch Generate Fees (Dynamic) ---
  const handleBatchGenerateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        classId: selectedClass,
        academicYear: batchData.academicYear,
        feeMonth: batchData.feeMonth, // Add this line!
        dueDate: batchData.dueDate
      };

      const res = await API.post('/fee/batch-generate', payload);
      setMessage({ type: 'success', text: res.data.message });
      setBatchModalOpen(false); // Close the modal on success
      fetchClassStudents(selectedClass); // Refresh the table
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.response?.data?.error || 'Failed to generate fees.' });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Open Payment Modal & Fetch Student Dues ---
  const openPaymentModal = async (student) => {
    setActiveStudent(student);
    setModalOpen(true);
    setStudentInvoices([]);
    setMessage({ type: '', text: '' });

    try {
      const res = await API.get(`/fee/student-dues/${student.student_id}`);
      setStudentInvoices(res.data.invoices);

      if (res.data.invoices.length > 0) {
        setPaymentData({
          ...paymentData,
          invoiceId: res.data.invoices[0].invoice_id,
          amountPaid: res.data.invoices[0].due_amount
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to fetch student invoices' });
    }
  };

  // --- 4. Handle Payment Submission ---
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await API.post('/fee/transactions', {
        invoiceId: paymentData.invoiceId,
        amountPaid: parseFloat(paymentData.amountPaid),
        paymentMethod: paymentData.paymentMethod,
        transactionReference: paymentData.transactionReference
      });

      setMessage({ type: 'success', text: 'Payment recorded successfully!' });
      setModalOpen(false);
      fetchClassStudents(selectedClass);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Payment failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">

      {/* Header Area */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">Fee Management</h1>

          {/* NEW HELP BUTTON */}
          <button
            onClick={() => setHelpModalOpen(true)}
            className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1"
          >
            <span>❓</span> How it works
          </button>
        </div>

        {/* Action Buttons Container (Your existing buttons) */}
        <div className="flex gap-4">
          {/* 3. The New Settings Button */}
          <button
            onClick={() => navigate('/admin/fee_settings')}
            className="bg-gray-600 text-white px-5 py-2 rounded shadow hover:bg-gray-700 transition-colors"
          >
            ⚙️ Fee Settings
          </button>

          <button
            onClick={() => navigate('/admin/fee-history')}
            className="bg-gray-800 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 shadow-sm transition-colors flex items-center gap-2"
          >
            📜 Transaction History
          </button>

          {/* Existing Batch Generate Button */}
          {selectedClass && (
            <button
              onClick={() => setBatchModalOpen(true)}
              className="bg-purple-600 text-white px-5 py-2 rounded shadow hover:bg-purple-700 transition-colors"
            >
              ⚡ Manual Fee Generate
            </button>
          )}
        </div>
      </div>


      {message.text && (
        <div className={`p-4 mb-6 rounded shadow-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700 border-l-4 border-red-500' : 'bg-green-100 text-green-700 border-l-4 border-green-500'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white p-5 rounded shadow-sm mb-6 border border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Select Class Dashboard</label>
        <select
          value={selectedClass}
          onChange={handleClassChange}
          className="w-full md:w-1/3 border border-gray-300 rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
        >
          <option value="">-- Choose a Class --</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>{cls.name}</option>
          ))}
        </select>
      </div>

      {selectedClass && (
        <div className="bg-white rounded shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200 text-gray-700">
                <th className="p-4 font-semibold text-sm">Inst. ID</th>
                <th className="p-4 font-semibold text-sm">Student Name</th>
                <th className="p-4 text-left text-sm font-semibold">Billed Up To</th>
                <th className="p-4 font-semibold text-sm">Total Due (₹)</th>
                <th className="p-4 font-semibold text-sm text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isFetchingStudents ? (
                // 1. Shows Skeleton while loading
                <TableSkeleton />
              ) : students.length === 0 ? (
                // 2. Shows Empty State ONLY if done loading and array is empty
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 font-medium">
                    No students found for this class.
                  </td>
                </tr>
              ) : (
                // 3. Shows Real Data
                students.map((student) => (
                  <tr key={student.student_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{student.institutional_id}</td>
                    <td className="p-4 text-sm font-medium relative group">

                      <Link
                        to={`/admin/user/${student.student_id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                      >
                        {student.name}
                      </Link>

                      {/* 2. The Custom Tooltip */}
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-sm whitespace-nowrap z-10">
                        Open Profile
                      </span>

                    </td>
                    <td className="p-4 text-sm font-medium">
                      {student.last_billed_month ? (
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 text-xs">
                          {student.last_billed_month}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic text-xs">Not Billed</span>
                      )}
                    </td>

                    <td className="p-4 text-sm font-bold text-red-600">
                      {parseFloat(student.current_due) > 0 ? student.current_due : '0.00'}
                    </td>
                    <td className="p-4 text-sm text-right">

                      {/* Restored Collect Fee Button */}
                      <button
                        onClick={() => openPaymentModal(student)}
                        // The Fix: Use "|| 0" to catch null/undefined/NaN values safely
                        disabled={!student.current_due || parseFloat(student.current_due) <= 0}
                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                      >
                        Collect Fee
                      </button>

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* --- NEW: Batch Generation Settings Modal --- */}
      {batchModalOpen && (
        <div className="fixed inset-0 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">
            <button onClick={() => setBatchModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Batch Generate Settings</h2>

            {/* Replace your Batch Generate Form with this updated one */}
            <form onSubmit={handleBatchGenerateSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Academic Year</label>
                  <select
                    value={batchData.academicYear}
                    onChange={(e) => setBatchData({ ...batchData, academicYear: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded bg-gray-50 outline-none focus:border-purple-500"
                  >
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                    <option value="2026-2027">2027-2028</option>

                  </select>
                </div>

                <div className="w-1/2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">Billing Month</label>
                  <select
                    value={batchData.feeMonth}
                    onChange={(e) => setBatchData({ ...batchData, feeMonth: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded bg-gray-50 outline-none focus:border-purple-500"
                    required
                  >
                    {['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'].map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Due Date (Usually 1st of the month)</label>
                <input
                  type="date"
                  value={batchData.dueDate}
                  onChange={(e) => setBatchData({ ...batchData, dueDate: e.target.value })}
                  className="w-full border border-gray-300 p-2 rounded bg-gray-50 outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBatchModalOpen(false)}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded shadow-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Processing...' : 'Generate Monthly Fees'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Existing Payment Modal --- */}
      {modalOpen && activeStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md relative">

            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold">
              &times;
            </button>

            <h2 className="text-xl font-bold mb-1 text-gray-800">Collect Payment</h2>
            <p className="text-sm text-gray-500 mb-6">{activeStudent.name}  ({activeStudent.institutional_id})</p>

            {studentInvoices.length === 0 ? (
              <p className="text-green-600 font-medium">No pending invoices found for this student.</p>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-4">

                {/* Select Specific Invoice */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Select Pending Invoice</label>
                  <select
                    value={paymentData.invoiceId}
                    onChange={(e) => {
                      const selectedInv = studentInvoices.find(inv => inv.invoice_id === e.target.value);
                      setPaymentData({
                        ...paymentData,
                        invoiceId: e.target.value,
                        amountPaid: selectedInv ? selectedInv.due_amount : ''
                      });
                    }}
                    className="w-full border border-gray-300 p-2 rounded bg-gray-50 outline-none focus:border-blue-500"
                    required
                  >
                    {studentInvoices.map(inv => (
                      <option key={inv.invoice_id} value={inv.invoice_id}>
                        {inv.fee_type_name} - Due: ₹{inv.due_amount} (By {new Date(inv.due_date).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Amount to Pay (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    max={studentInvoices.find(inv => inv.invoice_id === paymentData.invoiceId)?.due_amount || ''}
                    value={paymentData.amountPaid}
                    onChange={(e) => setPaymentData({ ...paymentData, amountPaid: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded outline-none focus:border-blue-500"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave as is for full payment, or reduce for partial payment.</p>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Payment Method</label>
                  <select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({ ...paymentData, paymentMethod: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded bg-gray-50 outline-none focus:border-blue-500"
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                {/* Transaction Ref */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Transaction Ref (Optional)</label>
                  <input
                    type="text"
                    value={paymentData.transactionReference}
                    onChange={(e) => setPaymentData({ ...paymentData, transactionReference: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded outline-none focus:border-blue-500"
                    placeholder="e.g. UPI Ref / Cheque No."
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                  </button>
                </div>

              </form>
            )}
          </div>
        </div>
      )}
      {/* --- NEW: Help / Admin Manual Modal --- */}
      {helpModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col relative">

            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span>📖</span> Fee Module Admin Guide
              </h2>
              <button
                onClick={() => setHelpModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-8 text-gray-700">

              {/* Point 1 */}
              <section>
                <h3 className="text-lg font-bold text-blue-700 mb-2 border-b pb-1">1. Why & When to use "Fee Settings"</h3>
                <p className="mb-2 text-sm leading-relaxed">
                  <strong>Why:</strong> The system needs a blueprint to know how much to charge each class. The Fee Settings button is where you define these base rules (e.g., "Class 6 pays ₹2200 for Academic Fees").<br />
                  <strong>When:</strong> You only need to use this once at the beginning of the academic year, or whenever you are introducing a brand new fee category to the school (like a new bus route).
                </p>
                <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm mt-2 text-blue-800">
                  <strong>Note:</strong> Even though you set the rule once for the Academic Year, the system will automatically charge the students based on this rule <strong>every single month</strong>.
                </div>
              </section>

              {/* Point 2 */}
              <section>
                <h3 className="text-lg font-bold text-green-700 mb-2 border-b pb-1">2. Why & When to use "Manual Fee Generation"</h3>
                <p className="mb-2 text-sm leading-relaxed">
                  <strong>Why:</strong> The ERP automatically generates regular tuition fees on the 25th of every month. This button exists to handle exceptions that the automated system missed or couldn't predict.<br />
                  <strong>When to use it:</strong>
                </p>
                <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
                  <li><strong>Late Admissions:</strong> A student joins in the middle of the month after the automated cycle has already run.</li>
                  <li><strong>Sudden Fees:</strong> The school announces an ad-hoc charge (like an Exam Fee or Trip Fee) that needs to be billed immediately.</li>
                  <li><strong>Server Outage:</strong> If the automated monthly system fails to run at midnight, you can use this button to safely generate the missing month's fees.</li>
                </ul>
              </section>

              {/* Point 3 */}
              <section>
                <h3 className="text-lg font-bold text-orange-700 mb-2 border-b pb-1">3. Common Errors & What They Mean</h3>
                <ul className="list-disc pl-5 space-y-3 text-sm leading-relaxed">
                  <li>
                    <strong className="text-red-600">"No new invoices generated..."</strong><br />
                    This usually means you are trying to generate fees for a month that has already been generated. The system safely blocks this to prevent double-billing. It can also mean there are zero active students enrolled in the class you selected.
                  </li>
                  <li>
                    <strong className="text-red-600">"Class ID, Academic Year, and Due Date are required"</strong><br />
                    You forgot to select an option in one of the dropdown menus before clicking confirm.
                  </li>
                  <li>
                    <strong className="text-red-600">"CRITICAL ALERT: Cron Job Failed" (Email Alert)</strong><br />
                    The background server experienced an outage at midnight on the 25th. You must log in and use the Manual Fee Generation button for this month.
                  </li>
                  <li>
                    <strong className="text-red-600">Database Errors (e.g., 42P08, 08P01)</strong><br />
                    A severe backend data mismatch has occurred. Do not attempt to fix this yourself.
                  </li>
                </ul>
              </section>

              {/* Point 4 */}
              <section>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="text-lg font-bold text-red-700 mb-2">4. Getting Technical Support</h3>
                  <p className="text-sm leading-relaxed text-red-900">
                    If you encounter an error that you cannot resolve using this guide, or if the system crashes unexpectedly, please stop immediately and contact system administration.
                  </p>
                  <p className="text-sm font-bold text-red-900 mt-3">
                    Email: <a href="mailto:abhaysinghtomar97@gmail.com" className="underline hover:text-red-700">abhaysinghtomar97@gmail.com</a>
                  </p>
                  <p className="text-sm text-red-800 mt-1">
                    * Please ensure you attach a clear screenshot of the error message and the screen you were on when the error occurred.
                  </p>
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end">
              <button
                onClick={() => setHelpModalOpen(false)}
                className="px-5 py-2 bg-gray-600 text-white rounded shadow-sm hover:bg-gray-700 transition-colors"
              >
                Close Manual
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}