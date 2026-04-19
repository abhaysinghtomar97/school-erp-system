import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // 'ALL', 'PENDING', 'GRADED'

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                // Fetching from the student API endpoint we created
                const response = await API.get('/student/assignments');
                console.log(response)
                if (response.data.success) {
                    setAssignments(response.data.assignments);
                }
            } catch (error) {
                console.error("Error fetching assignments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    // Filter logic
    const filteredAssignments = assignments.filter(task => {
        if (filter === 'GRADED') return task.score !== null;
        if (filter === 'PENDING') return task.score === null;
        return true;
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500 font-medium">Loading Assignments...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto font-sans text-gray-800 space-y-6">
            
            {/* Page Header */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Assignments & Grades</h2>
                    <p className="text-gray-500 text-sm mt-1">Track your upcoming tasks and recent academic performance.</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                            filter === 'ALL' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        All Tasks
                    </button>
                    <button 
                        onClick={() => setFilter('PENDING')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                            filter === 'PENDING' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Pending
                    </button>
                    <button 
                        onClick={() => setFilter('GRADED')}
                        className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                            filter === 'GRADED' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Graded
                    </button>
                </div>
            </div>

            {/* Assignments Grid */}
            {filteredAssignments.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-bold text-gray-700">No Assignments Found</h3>
                    <p className="text-gray-500 mt-2">You don't have any tasks in this category right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssignments.map((task) => {
                        const isGraded = task.score !== null;
                        const dueDateObj = new Date(task.due_date);
                        const isOverdue = !isGraded && dueDateObj < new Date();

                        return (
                            <div key={task.assignment_id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden hover:shadow-md transition-shadow">
                                
                                {/* Card Header (Subject & Teacher) */}
                                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{task.subject_name}</span>
                                    <span className="text-xs text-gray-400 font-medium">{task.teacher_name}</span>
                                </div>

                                {/* Card Body (Task Details) */}
                                <div className="p-5 flex-1">
                                    <h3 className="text-lg font-bold text-gray-800 leading-tight mb-2">{task.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">{task.description}</p>
                                    
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <span className="text-gray-400">📅 Due:</span>
                                        <span className={`${isOverdue ? 'text-red-500 font-bold' : 'text-gray-700'}`}>
                                            {dueDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                </div>

                                {/* Card Footer (Grades or Status) */}
                                <div className={`px-5 py-4 border-t ${isGraded ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}>
                                    {isGraded ? (
                                        <div>
                                            <div className="flex justify-between items-end mb-1">
                                                <span className="text-xs font-bold text-green-700 uppercase">Score</span>
                                                <div className="text-xl font-black text-green-700">
                                                    {task.score} <span className="text-sm text-green-500 font-bold">/ {task.max_score}</span>
                                                </div>
                                            </div>
                                            {task.feedback && (
                                                <div className="mt-2 text-sm text-green-800 bg-green-100/50 p-2 rounded italic">
                                                    "{task.feedback}"
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-bold text-gray-500">Status</span>
                                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                                                Pending Evaluation
                                            </span>
                                        </div>
                                    )}
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StudentAssignments;