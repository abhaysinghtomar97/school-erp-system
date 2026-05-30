import React, { useState, useEffect } from 'react';

import API from '../../services/api';
import TransportSummary from './TransportSummary';

const TransportAllocation = () => {
  // State Management
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isToggling, setIsToggling] = useState(null); // Tracks which specific student is currently saving

  // 1. Fetch the list of classes when the component loads
  useEffect(() => {
    fetchClasses();
  }, []);

  // 2. Fetch the students whenever a new class is selected
  useEffect(() => {
    if (selectedClassId) {
      fetchStudents(selectedClassId);
    } else {
      setStudents([]); // Clear table if no class is selected
    }
  }, [selectedClassId]);

  const fetchClasses = async () => {
    try {
      // Assuming you have a standard endpoint to get all classes
      const response = await API.get('/admin/classes'); 
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('Failed to load classes', error);
    }
  };

  const fetchStudents = async (classId) => {
    setIsLoading(true);
    try {
      const response = await API.get(`/transport/allocation/${classId}`);
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Failed to load transport allocation', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. The Toggle Function (Hits the POST API and updates the UI instantly)
  const handleToggle = async (studentId, currentStatus) => {
    setIsToggling(studentId); // Show loading state on just this one switch
    try {
      await API.post('/transport/toggle', {
        studentId: studentId,
        isCurrentlyEnrolled: currentStatus
      });

      // Update the local state instantly so the switch flips on screen
      setStudents((prevStudents) => 
        prevStudents.map((student) => 
          student.student_id === studentId 
            ? { ...student, is_enrolled: !currentStatus } 
            : student
        )
      );
    } catch (error) {
      console.error('Failed to toggle status', error);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsToggling(null);
    }
  };

  return (
    <>
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
     
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Allocation</h2>
          <p className="text-sm text-gray-500">Manage bus riders by class</p>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
          <select 
            className="w-full border border-gray-300 rounded-md p-2 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 outline-none"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">-- Choose a Class --</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* The Data Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-700 text-sm border-b border-gray-200">
              <th className="p-4 font-semibold">Inst. ID</th>
              <th className="p-4 font-semibold">Student Name</th>
              <th className="p-4 font-semibold text-center">Transport Status</th>
              <th className="p-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-gray-400">Loading students...</td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-gray-400">
                  {selectedClassId ? 'No active students found in this class.' : 'Select a class to view students.'}
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.student_id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm text-gray-600 font-mono">{student.institutional_id}</td>
                  <td className="p-4 text-sm font-medium text-gray-800">{student.name}</td>
                  
                  {/* Status Badge */}
                  <td className="p-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                      student.is_enrolled 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {student.is_enrolled ? '✓ Enrolled' : 'Not Enrolled'}
                    </span>
                  </td>

                  {/* Animated Toggle Switch */}
                  <td className="p-4 text-right">
                    <label className="relative inline-flex items-center cursor-pointer justify-end w-full">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={student.is_enrolled}
                        onChange={() => handleToggle(student.student_id, student.is_enrolled)}
                        disabled={isToggling === student.student_id}
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                        peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:right-[22px] 
                        after:bg-white after:border-gray-300 after:border after:rounded-full 
                        after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600
                        ${isToggling === student.student_id ? 'opacity-50 cursor-not-allowed' : ''}
                      `}></div>
                    </label>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


        
    </div>

     
    </>
  );
};

export default TransportAllocation;