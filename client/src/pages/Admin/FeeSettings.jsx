import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import TableSkeleton from '../../components/TableSkeleton';

export default function FeeSettings() {
  const [classes, setClasses] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [isFetchingFeeStructures, setIsFetchingFeeStructures] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    classId: '',
    feeTypeId: '',
    amount: '',
    academicYear: '2026-2027'
  });

  // Fetch initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsFetchingFeeStructures(true); // 1. Start loading
    try {
      const classRes = await API.get('/admin/classes');
      setClasses(classRes.data.classes);

      const typeRes = await API.get('/fee/types');
      setFeeTypes(typeRes.data.feeTypes);

      const structRes = await API.get('/fee/structures');
      setFeeStructures(structRes.data.feeStructures);
    } catch (err) {
      console.error('Failed to load settings data', err);
    } finally {
      setIsFetchingFeeStructures(false); // 2. Stop loading safely
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await API.post('/fee/structures', {
        ...formData,
        amount: parseFloat(formData.amount)
      });

      setMessage({ type: 'success', text: 'Fee structure mapped successfully!' });
      setFormData({ ...formData, amount: '' }); // Reset amount field
      fetchInitialData(); // Refresh the table
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to map fee structure' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Fee Master Settings</h1>

      {message.text && (
        <div className={`p-4 mb-6 rounded shadow-sm font-medium ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left Column: Create Form */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded shadow-sm border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Fee Rule</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Academic Year</label>
              <select
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded bg-gray-50 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Class</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded bg-gray-50 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Fee Type</label>
              <select
                value={formData.feeTypeId}
                onChange={(e) => setFormData({ ...formData, feeTypeId: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded bg-gray-50 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">-- Select Fee Type --</option>
                {feeTypes.map(ft => (
                  <option key={ft.id} value={ft.id}>{ft.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Amount (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
                placeholder="e.g. 5000"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors mt-2"
            >
              {loading ? 'Saving...' : 'Save Fee Rule'}
            </button>
          </form>
        </div>

        {/* Right Column: Existing Rules Table */}
        <div className="w-full lg:w-2/3 bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700">Existing Fee Structures</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-gray-600">
                  <th className="p-4 text-sm font-semibold">Academic Year</th>
                  <th className="p-4 text-sm font-semibold">Class</th>
                  <th className="p-4 text-sm font-semibold">Fee Type</th>
                  <th className="p-4 text-sm font-semibold">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {isFetchingFeeStructures ? (
                  // 1. Show loading skeleton
                  <TableSkeleton />
                ) : feeStructures.length === 0 ? (
                  // 2. Show empty state if no rules exist yet
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      No fee structures found. Create your first rule above.
                    </td>
                  </tr>
                ) : (
                  // 3. Render actual data
                  feeStructures.map((rule) => (
                    <tr key={rule.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-700">{rule.academic_year}</td>
                      <td className="p-4 text-sm font-bold text-gray-800">{rule.class_name}</td>
                      <td className="p-4 text-sm text-gray-700">{rule.fee_type_name}</td>
                      <td className="p-4 text-sm font-bold text-gray-900">₹{parseFloat(rule.amount).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}