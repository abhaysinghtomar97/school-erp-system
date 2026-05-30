import { useState } from 'react';
import API from '../../services/api'; 

export default function InvoiceManager() {
  const [formData, setFormData] = useState({
    institutionalId: '', // Changed from studentId
    feeTypeId: '1', 
    totalAmount: '',
    dueDate: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // We send the institutionalId to the backend
      await API.post('/fee/invoices', {
        ...formData,
        totalAmount: parseFloat(formData.totalAmount)
      });
      
      setMessage({ type: 'success', text: 'Invoice created successfully!' });
      // Clear the form on success
      setFormData({ ...formData, institutionalId: '', totalAmount: '', dueDate: '' }); 
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to create invoice';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded font-sans">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Generate New Invoice</h2>
      
      {message.text && (
        <div className={`p-3 mb-4 rounded ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleCreateInvoice} className="space-y-4">
        <div>
          {/* Changed the label so the Admin knows what to type */}
          <label className="block text-sm font-medium mb-1">Institutional ID / Roll No.</label>
          <input
            type="text"
            value={formData.institutionalId}
            onChange={(e) => setFormData({...formData, institutionalId: e.target.value})}
            className="w-full border border-gray-300 rounded p-2"
            placeholder="e.g. 26011"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fee Type</label>
          <select
            value={formData.feeTypeId}
            onChange={(e) => setFormData({...formData, feeTypeId: e.target.value})}
            className="w-full border border-gray-300 rounded p-2 bg-white"
          >
            <option value="1">Tuition Fee</option>
            <option value="2">Transport Fee</option>
            <option value="3">Hostel Fee</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total Amount (₹)</label>
          <input
            type="number"
            value={formData.totalAmount}
            onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            className="w-full border border-gray-300 rounded p-2"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 mt-4"
        >
          {loading ? 'Generating...' : 'Create Invoice'}
        </button>
      </form>
    </div>
  );
}