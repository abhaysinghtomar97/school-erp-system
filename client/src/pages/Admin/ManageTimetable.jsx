import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageTimetable = () => {
    const [classes, setClasses] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [timetable, setTimetable] = useState({});

    // NEW: Add a loading state variable
    const [isLoading, setIsLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ day: '', periodId: '', subjectId: '', teacherId: '' });
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Load initial setup data concurrently
    useEffect(() => {
        const fetchSetupData = async () => {
            try {
                // Fire all three requests at the exact same time
                const [classRes, periodRes, teacherRes] = await Promise.all([
                    axios.get('/api/admin/classes'),
                    axios.get('/api/admin/periods'),
                    axios.get('/api/admin/faculty')
                ]);

                // Extract the arrays safely
                setClasses(classRes.data.classes || classRes.data || []);
                setPeriods(periodRes.data.data || periodRes.data || []);
                setTeachers(teacherRes.data.faculty || teacherRes.data || []);

            } catch (error) {
                console.error("Error fetching setup data:", error);
            } finally {
                setIsLoading(false)
            }
        };
        fetchSetupData();
    }, []);

    const fetchTimetable = async (classId) => {
        // NEW: Start loading before the network request
        setIsLoading(true);

        try {
            const res = await axios.get(`/api/admin/timetable/class/${classId}`);
            setTimetable(res.data.data || {});

            const subRes = await axios.get(`/api/admin/subjects/class/${classId}`);
            setSubjects(subRes.data.data || []);
        } catch (error) {
            console.error("Failed to fetch timetable or subjects:", error);
        } finally {
            // NEW: Stop loading when the request finishes (whether it succeeded or failed)
            setIsLoading(false);
        }
    };

    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        if (classId) {
            fetchTimetable(classId);
        } else {
            // Clear the table if they select the default empty option
            setTimetable({});
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/admin/timetable/assign', {
                ...formData,
                classId: selectedClass
            });
            setShowModal(false);
            fetchTimetable(selectedClass);
        } catch (err) {
            alert(err.response?.data?.message || "Error saving slot");
        }
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        return `${hours}.${minutes}`;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Class Timetable</h2>

            <select
                className="border p-2 mb-6 w-full max-w-xs rounded"
                value={selectedClass}
                onChange={handleClassChange}
                // disabled={isLoading} 
            >
                <option value="">
                    {isLoading ? 'Loading classes...' : 'Select a Class'}
                </option>

                {/* Conditionally render content */}
                {isLoading ? (
                    Array(6).fill(null).map((_, index) => (
                        <option key={`skeleton-${index}`} className="skeleton-option"></option>
                    ))
                ) : (
                    // === The Real State ===
                    Array.isArray(classes) && classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                )}
            </select>

            {/* NEW: Display a loading spinner if data is being fetched */}
            {selectedClass && isLoading && (
                <div className="flex flex-col items-center justify-center p-12 border border-gray-200 rounded-lg bg-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-orange-500 mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading timetable...</p>
                </div>
            )}

            {/* Render the table only if a class is selected AND we are not loading */}
            {selectedClass && !isLoading && (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow">
                    <div className="bg-orange-500 text-white p-3 font-bold text-lg rounded-t-lg flex justify-between items-center">
                        <span>Time Table</span>
                        <div className="flex gap-2 text-xl">
                            <span className="cursor-pointer">◱</span>
                            <span className="cursor-pointer">↻</span>
                            <span className="cursor-pointer">─</span>
                            <span className="cursor-pointer">✖</span>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-gray-200 bg-white">
                        <thead className="bg-gray-100 text-sm">
                            <tr>
                                <th className="border border-gray-200 p-3 bg-teal-700 text-white font-bold align-middle">
                                    Day/ Lecture
                                </th>
                                {Array.isArray(periods) ? periods.map((p) => (
                                    <th key={p.id} className="border border-gray-200 p-3 text-center min-w-40">
                                        <div className="font-bold text-base">{p.period_name}</div>
                                        <div className="text-sm font-normal text-gray-700">
                                            {formatTime(p.start_time)} - {formatTime(p.end_time)}
                                        </div>
                                    </th>
                                )) : null}
                                <th className="border border-gray-200 p-3 h-24"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {days.map(day => (
                                <tr key={day}>
                                    <td className="border border-gray-200 p-3 font-bold bg-gray-50 text-base text-gray-800">
                                        {day}
                                    </td>
                                    {Array.isArray(periods) ? periods.map(p => {
                                        const slot = timetable[day]?.[p.id];
                                        return (
                                            <td key={p.id} className="border border-gray-200 p-3 h-24 align-top">
                                                {slot ? (
                                                    <div className="bg-blue-50 p-3 rounded-md text-sm shadow-sm border border-blue-100 transition-all hover:shadow-md">
                                                        <div className="font-bold text-gray-900">[ {slot.teacher} ]</div>
                                                        <div className="text-gray-700">[ {slot.subject} ]</div>
                                                        <button
                                                            className="text-xs text-blue-600 font-semibold mt-2 hover:text-blue-800"
                                                            onClick={() => { setFormData({ day, periodId: p.id, subjectId: '', teacherId: '' }); setShowModal(true); }}
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-center items-center h-full">
                                                        <button
                                                            className="text-gray-400 hover:text-orange-500 font-bold text-sm transition-colors"
                                                            onClick={() => { setFormData({ day, periodId: p.id, subjectId: '', teacherId: '' }); setShowModal(true); }}
                                                        >
                                                            + Assign
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    }) : null}
                                    <td className="border border-gray-200 p-3 h-24 bg-gray-50"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
                    <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow-xl w-96 transform transition-all">
                        <h3 className="font-bold mb-4 text-lg border-b pb-2">Assign Slot</h3>

                        <label className="block mb-1 text-sm font-semibold text-gray-700">Subject</label>
                        <select required className="w-full border p-2 mb-4 rounded focus:ring focus:ring-blue-200" onChange={e => setFormData({ ...formData, subjectId: e.target.value })}>
                            <option value="">Select Subject</option>
                            {Array.isArray(subjects) ? subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>) : null}
                        </select>

                        <label className="block mb-1 text-sm font-semibold text-gray-700">Teacher</label>
                        <select required className="w-full border p-2 mb-6 rounded focus:ring focus:ring-blue-200" onChange={e => setFormData({ ...formData, teacherId: e.target.value })}>
                            <option value="">Select Teacher</option>
                            {Array.isArray(teachers) ? teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>) : null}
                        </select>

                        <div className="flex justify-end gap-3 mt-2">
                            <button type="button" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors" onClick={() => setShowModal(false)}>Cancel</button>
                            <button type="submit" className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded shadow-sm transition-colors">Save Slot</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ManageTimetable;