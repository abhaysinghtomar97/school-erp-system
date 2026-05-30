import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const StudentFeeLedger = ({ studentId ,onPayClick ,refreshTrigger}) => {
  const [invoices, setInvoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  // Add these for the Payment Modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // The function that triggers when "Pay Now" is clicked
  const handleOpenPayment = (invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  // Standard Indian Academic Year (April to March)
  const academicMonths = [
    'April', 'May', 'June', 'July', 'August', 'September', 
    'October', 'November', 'December', 'January', 'February', 'March'
  ];

  useEffect(() => {
    if (studentId) fetchLedger();
  }, [studentId,refreshTrigger]);

  const fetchLedger = async () => {
    setIsLoading(true);
    try {
      // You will need to create this backend route to fetch ALL invoices (Paid & Unpaid) for a student
      const response = await API.get(`/fee/student/${studentId}/ledger`);
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error("Failed to load fee ledger", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to find if a specific month has an invoice
  const getInvoiceForMonth = (monthName) => {
    return invoices.find(inv => inv.fee_month === monthName);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500 animate-pulse">Loading Smart Ledger...</div>;
  }

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h3 className="text-xl font-bold text-gray-800">Academic Year Billing</h3>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Paid</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Due</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 border-2 border-dashed border-gray-300 rounded-full"></div> Pending Gen</span>
        </div>
      </div>

      {/* The 12-Month Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {academicMonths.map((month, index) => {
          const invoice = getInvoiceForMonth(month);
          
          // Determine styles based on status
          let cardStyle = "border-2 border-dashed border-gray-200 bg-gray-50 text-gray-400"; // Default: Not Generated
          let statusText = "Not Billed";
          
          if (invoice) {
            if (invoice.status === 'PAID') {
              cardStyle = "border border-green-200 bg-green-50 shadow-sm";
              statusText = "Paid";
            } else if (invoice.status === 'UNPAID') {
              cardStyle = "border border-red-200 bg-red-50 shadow-sm ring-1 ring-red-500";
              statusText = "Due";
            }
          }

          return (
            <div key={index} className={`rounded-xl p-4 flex flex-col justify-between h-32 transition-all ${cardStyle}`}>
              
              <div className="flex justify-between items-start">
                <span className={`font-bold ${invoice ? 'text-gray-800' : 'text-gray-400'}`}>
                  {month}
                </span>
                
                {/* Status Badge */}
                {invoice && (
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                    invoice.status === 'PAID' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}>
                    {statusText}
                  </span>
                )}
              </div>

              {/* Amount & Action Button */}
              <div>
                {invoice ? (
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-xs text-gray-500">Amount</div>
                      <div className={`font-black text-lg ${invoice.status === 'PAID' ? 'text-green-700' : 'text-red-700'}`}>
                        ₹{invoice.total_amount}
                      </div>
                    </div>
                    
                    {/* Show Pay button ONLY if it's unpaid */}
                    {invoice.status === 'UNPAID' && (
  <button 
    onClick={() => onPayClick(invoice)} // <-- ADD THIS LINE
    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-colors"
  >
    Pay Now
  </button>
)}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic text-center mt-4">
                    Invoice not generated
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentFeeLedger;