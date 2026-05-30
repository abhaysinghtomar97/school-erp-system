import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const TransportSummary = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await API.get('/transport/summary');
      console.log(response)
      setSummaryData(response.data.summary);
    } catch (err) {
      console.error("Failed to load transport summary", err);
      setError("Failed to load dashboard data.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Hard Data...</div>;
  }

  if (error || !summaryData) {
    return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* 1. TOP KPI CARDS (Hard Numbers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total Enrolled */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Total Bus Riders
          </div>
          <div className="text-4xl font-black text-gray-800">
            {summaryData.totalEnrolled}
          </div>
          <div className="text-xs text-gray-400 mt-2">Active across all classes</div>
        </div>

        {/* Card 2: Expected Revenue */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500">
          <div className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Expected Monthly Revenue
          </div>
          <div className="text-4xl font-black text-green-600">
            ₹{summaryData.expectedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-gray-400 mt-2">
  Calculated dynamically per class structure
</div>
        </div>

        

      </div>

      {/* 2. CLASS BREAKDOWN TABLE (Hard Data) */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-800">Enrollment Breakdown by Class</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Class Name</th>
                <th className="p-4 font-semibold text-center">Total Students</th>
                <th className="p-4 font-semibold text-center">Bus Riders</th>
                <th className="p-4 font-semibold text-right">Participation Rate</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.classBreakdown.map((row, index) => {
                // Calculate percentage of class taking the bus
                const percentage = row.total_students > 0 
                  ? Math.round((row.enrolled_students / row.total_students) * 100) 
                  : 0;

                return (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 text-sm font-bold text-gray-800">{row.class_name}</td>
                    <td className="p-4 text-sm text-center text-gray-500">{row.total_students}</td>
                    <td className="p-4 text-sm text-center font-medium text-blue-600">
                      {row.enrolled_students}
                    </td>
                    <td className="p-4 text-sm text-right font-mono text-gray-600">
                      {percentage}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default TransportSummary;