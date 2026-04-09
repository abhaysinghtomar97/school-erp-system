import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageClasses = () => {
    // --- Data State ---
    const [classes, setClasses] = useState([]);
    const [faculty, setFaculty] = useState([]);
    
    // --- UI State ---
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [creating, setCreating] = useState(false);
    
    // --- Form State ---
    const [formData, setFormData] = useState({ name: '', room_number: '', homeroom_teacher_id: '' });

    // --- Pagination & Search State ---
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []); 

    // Reset to page 1 whenever search or limit changes
    useEffect(() => {
        setPage(1);
    }, [searchTerm, limit]);

    const fetchData = async () => {
        try {
            const [classesRes, facultyRes] = await Promise.all([
                API.get('/admin/classes'),
                API.get('/admin/faculty')
            ]);
            
            setClasses(Array.isArray(classesRes.data.classes) ? classesRes.data.classes : []);
            setFaculty(Array.isArray(facultyRes.data.faculty) ? facultyRes.data.faculty : []);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError('Failed to load dashboard data.');
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await API.post('/admin/classes', formData);
            setFormData({ name: '', room_number: '', homeroom_teacher_id: '' });
            fetchData(); 
        } catch (err) {
            alert('Failed to create class.');
        } finally {
            setCreating(false);
        }
    };

    // --- Client-Side Search & Pagination Logic ---
    const filteredClasses = classes.filter(cls => 
        cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalEntries = filteredClasses.length;
    const totalPages = Math.ceil(totalEntries / limit) || 1;
    const startEntry = (page - 1) * limit;
    const endEntry = Math.min(page * limit, totalEntries);
    const currentClasses = filteredClasses.slice(startEntry, endEntry);

    // --- Export Handlers ---
    const handleCopy = () => {
        const headers = ['Class Name', 'Room', 'Homeroom Teacher'];
        const rows = filteredClasses.map(c => `${c.name}\t${c.room_number || '-'}\t${c.teacher_name || 'Unassigned'}`);
        const textToCopy = [headers.join('\t'), ...rows].join('\n');
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert("Class data copied to clipboard!"))
            .catch(() => alert("Failed to copy data."));
    };

    const handleCSV = () => {
        const headers = ['Class Name,Room,Homeroom Teacher'];
        const rows = filteredClasses.map(c => `"${c.name}","${c.room_number || '-'}","${c.teacher_name || 'Unassigned'}"`);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "class_directory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExcel = () => handleCSV();

    const handlePrint = () => window.print();

    return (
        <div className="p-6 font-sans text-gray-700 bg-[#f8f9fa] min-h-screen print:p-0 print:bg-white">
            
            {/* Page Title - HIDDEN ON PRINT */}
            <div className="mb-6 print:hidden">
                <div className="text-sm text-gray-500 mb-1">Home / Manage Classes</div>
                <h1 className="text-3xl font-bold text-[#2a3f54]">Manage Classes</h1>
            </div>

            {error && <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm print:hidden">{error}</div>}

            {/* Top Form Card - HIDDEN ON PRINT */}
            <div className="bg-white p-5 rounded shadow-sm border border-gray-200 mb-8 print:hidden">
                <h3 className="text-lg font-semibold text-teal-800 mb-4 border-b border-gray-100 pb-2">Create New Class</h3>
                <form onSubmit={handleCreateClass} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Class Name *</label>
                        <input type="text" name="name" placeholder="e.g., 10th Grade Sci" value={formData.name} onChange={handleChange} required 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 outline-none text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Room Number</label>
                        <input type="text" name="room_number" placeholder="Optional" value={formData.room_number} onChange={handleChange} 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 outline-none text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Homeroom Teacher</label>
                        <select name="homeroom_teacher_id" value={formData.homeroom_teacher_id} onChange={handleChange} 
                            className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-teal-500 outline-none bg-white text-sm">
                            <option value="">-- Unassigned --</option>
                            {faculty.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} ({teacher.institutional_id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <button type="submit" disabled={creating} className="w-full p-2 text-white font-semibold rounded bg-teal-600 hover:bg-teal-700 transition text-sm">
                            {creating ? 'Creating...' : '+ Create Class'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Main Table Card */}
            <div className="bg-white border border-gray-200 rounded shadow-sm print:border-none print:shadow-none">
                
                {/* Teal Header Card - HIDDEN ON PRINT */}
                <div className="bg-teal-600 text-white px-4 py-3 flex justify-between items-center print:hidden rounded-t">
                    <h3 className="font-semibold text-sm tracking-wide">Class Directory Results</h3>
                    <div className="flex space-x-1">
                        <span className="bg-white bg-opacity-20 text-white text-xs font-semibold px-2 py-1 rounded">
                            Total: {classes.length}
                        </span>
                    </div>
                </div>

                {/* Toolbar: Entries, Exports, Search - HIDDEN ON PRINT */}
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 bg-[#fafafa] print:hidden">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} className="border border-gray-300 p-1.5 rounded outline-none mr-2 bg-white focus:border-teal-600">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="1000">All</option>
                            </select>
                            <span>entries per page</span>
                        </div>

                        {/* Export Button Group */}
                        <div className="inline-flex rounded shadow-sm">
                            <button onClick={handleCopy} className="px-3 py-1.5 text-xs font-medium text-white bg-[#6c8b9d] hover:bg-[#5a7687] border-r border-[#5a7687] rounded-l transition-colors">Copy</button>
                            <button onClick={handleCSV} className="px-3 py-1.5 text-xs font-medium text-white bg-[#6c8b9d] hover:bg-[#5a7687] border-r border-[#5a7687] transition-colors">CSV</button>
                            <button onClick={handleExcel} className="px-3 py-1.5 text-xs font-medium text-white bg-[#6c8b9d] hover:bg-[#5a7687] border-r border-[#5a7687] transition-colors">Excel</button>
                            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-medium text-white bg-[#6c8b9d] hover:bg-[#5a7687] border-r border-[#5a7687] transition-colors">PDF</button>
                            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-medium text-white bg-[#6c8b9d] hover:bg-[#5a7687] rounded-r transition-colors">Print</button>
                        </div>
                    </div>

                    <div className="flex items-center text-sm">
                        <label className="mr-2 font-medium text-gray-600">Search:</label>
                        <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                            className="border border-gray-300 p-1.5 rounded outline-none w-full sm:w-48 bg-white focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all" />
                    </div>
                </div>

                {/* Print Only Header */}
                <div className="hidden print:block mb-4 text-center">
                    <h2 className="text-2xl font-bold">Golden Valley ERP - Class Directory</h2>
                    <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full text-left text-sm border-collapse print:text-xs">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 border-b border-gray-300 print:bg-white print:border-b-2 print:border-black">
                                <th className="p-3 border-r border-gray-200 font-semibold w-16 print:border-none">No.</th>
                                <th className="p-3 border-r border-gray-200 font-semibold print:border-none">Class Name</th>
                                <th className="p-3 border-r border-gray-200 font-semibold print:border-none">Room</th>
                                <th className="p-3 font-semibold print:border-none">Homeroom Teacher</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="4" className="p-8 text-center"><div className="flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div></td></tr>
                            ) : currentClasses.length > 0 ? (
                                currentClasses.map((cls, index) => (
                                    <tr key={cls.id} className="border-b border-gray-100 hover:bg-teal-50 transition-colors print:border-b print:border-gray-200">
                                        <td className="p-3 border-r border-gray-200 text-gray-500 print:border-none">{startEntry + index + 1}</td>
                                        <td className="p-3 border-r border-gray-200 font-bold text-[#2a3f54] print:border-none">{cls.name}</td>
                                        <td className="p-3 border-r border-gray-200 print:border-none">{cls.room_number || '-'}</td>
                                        <td className="p-3 text-gray-600 print:border-none">
                                            {cls.teacher_name ? <span className="font-medium">{cls.teacher_name}</span> : <span className="text-gray-400 italic">Unassigned</span>}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="p-8 text-center text-gray-500 bg-gray-50">No classes found matching your search.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer: Pagination - HIDDEN ON PRINT */}
                <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-[#fafafa] text-sm text-gray-600 border-t border-gray-200 print:hidden">
                    <div className="mb-4 md:mb-0">
                        Showing {totalEntries === 0 ? 0 : startEntry + 1} to {endEntry} of {totalEntries} entries
                    </div>
                    <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm">
                        <button onClick={() => setPage(1)} disabled={page === 1} className="px-3 py-1.5 bg-white hover:bg-gray-50 border-r border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">«</button>
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-white hover:bg-gray-50 border-r border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">‹</button>
                        <button className="px-4 py-1.5 bg-teal-600 text-white font-medium border-r border-teal-600">{page}</button>
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0} className="px-3 py-1.5 bg-white hover:bg-gray-50 border-r border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">›</button>
                        <button onClick={() => setPage(totalPages)} disabled={page === totalPages || totalPages === 0} className="px-3 py-1.5 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">»</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManageClasses;