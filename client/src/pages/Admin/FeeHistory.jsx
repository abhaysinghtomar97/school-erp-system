import React, { useState, useEffect } from 'react';
import  API from '../../services/api';
import { useNavigate } from 'react-router-dom';



const HistorySkeleton = ({ rows }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index} className="border-b border-gray-200 animate-pulse bg-gray-50/50">
          <td className="p-3 border-r border-gray-200"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
          <td className="p-3 border-r border-gray-200"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
          <td className="p-3 border-r border-gray-200"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
          <td className="p-3 border-r border-gray-200"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
          <td className="p-3 border-r border-gray-200"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
          <td className="p-3 border-r border-gray-200"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
          <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
        </tr>
      ))}
    </>
  );
};

const FeeHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(null);
  // DataTable Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      // Assuming you added the route we discussed earlier
      const response = await API.get('/fee/history');
      setHistory(response.data.history || []);
    } catch (error) {
      console.error("Failed to fetch fee history", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Search & Pagination Logic ---
  const filteredHistory = history.filter((txn) => {
    const term = searchTerm.toLowerCase();
    return (
      (txn.student_name && txn.student_name.toLowerCase().includes(term)) ||
      (txn.institutional_id && txn.institutional_id.toLowerCase().includes(term)) ||
      (txn.amount_paid && txn.amount_paid.toLowerCase().includes(term)) ||
      (txn.created_at && txn.created_at.toLowerCase().includes(term)) ||
      (txn.transaction_id && txn.transaction_id.toString().includes(term)) ||
      (txn.payment_method && txn.payment_method.toLowerCase().includes(term))
    );
  });

  const totalEntries = filteredHistory.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  
  // Get current page data
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = filteredHistory.slice(indexOfFirstEntry, indexOfLastEntry);

  // Handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  const handleEntriesChange = (e) => {
    setEntriesPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Fee Transaction History</h1>
        <button onClick={() => navigate('/admin/fee_module')}> Back </button>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        
        {/* Header Bar (Styled like image_5bf85f.png) */}
        <div className="bg-orange-500 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-semibold">Fee Payment Results</h2>
          <div className="flex gap-2">
             {/* Placeholder for future Export buttons */}
             <button className="bg-white/20 hover:bg-white/30 p-1 rounded text-sm px-2 transition-colors">Copy</button>
             <button className="bg-white/20 hover:bg-white/30 p-1 rounded text-sm px-2 transition-colors">CSV</button>
             <button className="bg-white/20 hover:bg-white/30 p-1 rounded text-sm px-2 transition-colors">Excel</button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <select 
              value={entriesPerPage} 
              onChange={handleEntriesChange}
              className="border border-gray-300 rounded p-1 outline-none focus:border-orange-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries per page</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <label className="text-gray-600">Search:</label>
            <input 
              type="text" 
              value={searchTerm}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded px-2 py-1 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              placeholder="Name, ID, or Method..."
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 font-medium">
              <tr>
                <th className="p-3 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-200">Txn ID ↕</th>
                <th className="p-3 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-200">Student ID ↕</th>
                <th className="p-3 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-200">Name ↕</th>
                <th className="p-3 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-200">Fee Month ↕</th>
                <th className="p-3 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-200">amount_paid (₹) ↕</th>
                <th className="p-3 border-b border-r border-gray-200 cursor-pointer hover:bg-gray-200">Method ↕</th>
                <th className="p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-200">Date ↕</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <HistorySkeleton rows={entriesPerPage} />
              ) : currentEntries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No transactions found matching your search.
                  </td>
                </tr>
              ) : (
                currentEntries.map((txn) => (
                  <tr key={txn.transaction_id} className="border-b border-gray-200 hover:bg-orange-50/50 transition-colors">
                    <td className="p-3 border-r border-gray-200">#{txn.transaction_id}</td>
                    <td className="p-3 border-r border-gray-200">{txn.institutional_id}</td>
                    <td className="p-3 border-r border-gray-200 font-medium">{txn.student_name}</td>
                    <td className="p-3 border-r border-gray-200">{txn.fee_month}</td>
                    <td className="p-3 border-r border-gray-200 text-green-600 font-semibold">{txn.amount_paid}</td>
                    <td className="p-3 border-r border-gray-200">
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs border border-gray-200">
                        {txn.payment_method}
                      </span>
                    </td>
                    <td className="p-3">{new Date(txn.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
          <div>
            Showing {totalEntries === 0 ? 0 : indexOfFirstEntry + 1} to {Math.min(indexOfLastEntry, totalEntries)} of {totalEntries} entries
          </div>
          
          <div className="flex gap-1">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Simple page numbers */}
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === idx + 1 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'border-gray-300 hover:bg-gray-200'
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FeeHistory;