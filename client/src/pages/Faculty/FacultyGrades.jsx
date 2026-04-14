import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const FacultyGrades = () => {
    // --- State ---
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    
    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    
    const [roster, setRoster] = useState([]);
    const [gradesData, setGradesData] = useState({}); // { studentId: { score: 95, feedback: 'Good' } }
    
    const [subjects, setSubjects] = useState([]);

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showNewModal, setShowNewModal] = useState(false);

    // New Assignment Form State
    const [newAssignment, setNewAssignment] = useState({
        title: '',
        description: '',
        dueDate: '',
        maxScore: 100,
        subjectId: '' // Placeholder: We will need to wire this to actual subjects later!
    });

    // --- 1. Fetch Classes on Load ---
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await API.get('/faculty/my-classes');
                if (response.data.success) {
                    setClasses(response.data.classes);
                    if (response.data.classes.length > 0) {
                        setSelectedClassId(response.data.classes[0].id);
                    }
                }
            } catch (error) {
                console.error("Error fetching classes", error);
            }
        };
        fetchClasses();
    }, []);

    // --- 2. Fetch Assignments & Roster when Class Changes ---
    useEffect(() => {
        if (selectedClassId) {
            fetchAssignments();
            fetchRoster();
            fetchSubjects();
            setSelectedAssignment(null); // Reset selection
            setGradesData({});
        }
    }, [selectedClassId]);

    const fetchSubjects = async () => {
        try {
            const response = await API.get(`/faculty/class/${selectedClassId}/subjects`);
            
            if (response.data.success) {
                setSubjects(response.data.subjects);
                // Auto-select the first subject for the modal
                if (response.data.subjects.length > 0) {
                    setNewAssignment(prev => ({ ...prev, subjectId: response.data.subjects[0].id }));
                }
            }
        } catch (error) {
            console.error("Error fetching subjects", error);
        }
    };

    const fetchAssignments = async () => {
        try {
            const response = await API.get(`/faculty/class/${selectedClassId}/assignments`);
            if (response.data.success) {
                setAssignments(response.data.assignments);
            }
        } catch (error) {
            console.error("Error fetching assignments", error);
            setAssignments([]);
        }
    };

    const fetchRoster = async () => {
        setIsLoading(true);
        try {
            const response = await API.get(`/faculty/class/${selectedClassId}/roster`);
            if (response.data.success) {
                setRoster(response.data.students);
                // Initialize empty grades data for the roster
                const initialGrades = {};
                response.data.students.forEach(student => {
                    initialGrades[student.student_id] = { score: '', feedback: '' };
                });
                setGradesData(initialGrades);
            }
        } catch (error) {
            console.error("Error fetching roster", error);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 3. Handlers ---
    const handleGradeChange = (studentId, field, value) => {
        setGradesData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('/faculty/assignments', {
                classId: selectedClassId,
                ...newAssignment
            });
            if (response.data.success) {
                alert('Assignment Created!');
                setShowNewModal(false);
                setNewAssignment({ title: '', description: '', dueDate: '', maxScore: 100, subjectId: newAssignment.subjectId });
                fetchAssignments(); // Refresh list
            }
        } catch (error) {
            console.error("Error creating assignment", error);
            alert('Failed to create assignment.');
        }
    };

    const handleSaveGrades = async () => {
        if (!selectedAssignment) return;
        setIsSaving(true);

        // Format data for the backend API
        const payload = Object.keys(gradesData).map(studentId => ({
            student_id: studentId,
            score: gradesData[studentId].score,
            feedback: gradesData[studentId].feedback
        }));

        try {
            const response = await API.post('/faculty/grades', {
                assignmentId: selectedAssignment.id,
                gradesData: payload
            });

            if (response.data.success) {
                alert("Grades saved successfully!");
            }
        } catch (error) {
            console.error("Error saving grades", error);
            alert("Failed to save grades.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto font-sans text-gray-800 space-y-6 relative">
            
            {/* Header & Class Selector */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gradebook & Assignments</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage coursework and evaluate student performance.</p>
                </div>

                <div className="flex flex-col gap-1 w-full md:w-64">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Active Class</label>
                    <select 
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50"
                    >
                        <option value="" disabled>Select a class...</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Assignments List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-bold text-gray-700">Assignments</h3>
                        <button 
                            onClick={() => setShowNewModal(true)}
                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded-md text-xs font-bold transition-colors"
                        >
                            + New
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-2">
                        {assignments.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10 text-sm">No assignments found for this class.</div>
                        ) : (
                            assignments.map(task => (
                                <div 
                                    key={task.id} 
                                    onClick={() => setSelectedAssignment(task)}
                                    className={`p-4 mb-2 rounded-lg cursor-pointer border transition-all ${
                                        selectedAssignment?.id === task.id 
                                        ? 'bg-purple-50 border-purple-300 ring-1 ring-purple-300' 
                                        : 'bg-white border-gray-100 hover:border-purple-200 hover:bg-gray-50'
                                    }`}
                                >
                                    
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-gray-800 text-sm">{task.title}</h4>
                                        <span className="text-xs font-mono bg-gray-200 text-gray-600 px-2 py-0.5 rounded">Max: {task.max_score}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{task.description}</p>
                                    <p className="text-xs text-gray-400 mt-2 font-medium flex items-center gap-1">
                                        🗓 Due: {new Date(task.due_date).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Gradebook */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
                    {selectedAssignment ? (
                        <>
                            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-gray-800">Grading: {selectedAssignment.title}</h3>
                                    <p className="text-xs text-gray-500">Enter scores out of {selectedAssignment.max_score}</p>
                                </div>
                                <button 
                                    onClick={handleSaveGrades}
                                    disabled={isSaving}
                                    className={`px-6 py-2 rounded-lg text-sm font-bold text-white transition shadow-sm ${
                                        isSaving ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700 hover:-translate-y-0.5'
                                    }`}
                                >
                                    {isSaving ? 'Saving...' : 'Save Grades'}
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-white border-b sticky top-0 shadow-sm z-10">
                                        <tr>
                                            <th className="px-6 py-4">Student Name</th>
                                            <th className="px-4 py-4 w-32 text-center">Score</th>
                                            <th className="px-6 py-4">Feedback / Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {roster.map((student) => (
                                            <tr key={student.student_id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="font-semibold text-gray-800">{student.name}</div>
                                                    <div className="font-mono text-xs text-gray-500">{student.institutional_id}</div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input 
                                                        type="number" 
                                                        max={selectedAssignment.max_score}
                                                        min="0"
                                                        value={gradesData[student.student_id]?.score || ''}
                                                        onChange={(e) => handleGradeChange(student.student_id, 'score', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-center focus:ring-2 focus:ring-purple-500 outline-none"
                                                        placeholder="-"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input 
                                                        type="text" 
                                                        value={gradesData[student.student_id]?.feedback || ''}
                                                        onChange={(e) => handleGradeChange(student.student_id, 'feedback', e.target.value)}
                                                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                                                        placeholder="Optional remarks..."
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="text-6xl mb-4">📋</div>
                            <p className="font-medium text-gray-600">No Assignment Selected</p>
                            <p className="text-sm mt-1">Select an assignment from the list to start grading.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE ASSIGNMENT MODAL */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-lg">Create Assignment</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>
                        <form onSubmit={handleCreateAssignment} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Subject</label>
                                <select 
                                    required 
                                    value={newAssignment.subjectId} 
                                    onChange={e => setNewAssignment({...newAssignment, subjectId: e.target.value})} 
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                                >
                                    <option value="" disabled>Select a subject...</option>
                                    {subjects.map(sub => (
                                        <option key={sub.id} value={sub.id}>{sub.name} ({sub.code})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Title</label>
                                <input required type="text" value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g. Midterm Essay" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Description</label>
                                <textarea required value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none h-24" placeholder="Instructions for the students..."></textarea>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Due Date</label>
                                    <input required type="date" value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                                <div className="w-32">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">Max Score</label>
                                    <input required type="number" min="1" value={newAssignment.maxScore} onChange={e => setNewAssignment({...newAssignment, maxScore: e.target.value})} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none" />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition">Cancel</button>
                                <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700 transition">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FacultyGrades;