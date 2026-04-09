import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageStudents = () => {
    // --- Data State (From your original code) ---
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- UI State (For Pagination & Search) ---
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch students exactly as you wrote it
    useEffect(() => {
        fetchStudents();
    }, []);

    // Reset to page 1 whenever the user types a new search or changes the limit
    useEffect(() => {
        setPage(1);
    }, [searchTerm, limit]);

    const fetchStudents = async () => {
        try {
            const response = await API.get('/admin/students');
            const actualArrayOfStudents = response.data.Students;

            if (Array.isArray(actualArrayOfStudents)) {
                setStudents(actualArrayOfStudents);
            } else {
                setStudents([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError('Failed to fetch students. Please try again later.');
            setLoading(false);
        }
    };

    // Toggle status exactly as you wrote it
    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await API.put(`/admin/users/${userId}/status`, {
                is_active: !currentStatus
            });
            // Instantly update the React UI
            setStudents(students.map(student =>
                student.id === userId ? { ...student, is_active: !currentStatus } : student
            ));
        } catch (err) {
            console.error(err);
            alert("Failed to update status.");
        }
    };



    // --- Client-Side Search & Pagination Logic ---
    // 1. Filter the raw data based on the search term
    const filteredStudents = students.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.institutional_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. Calculate pagination details
    const totalEntries = filteredStudents.length;
    const totalPages = Math.ceil(totalEntries / limit) || 1;
    const startEntry = (page - 1) * limit;
    const endEntry = Math.min(page * limit, totalEntries);

    // 3. Slice the array to only show the current page's students
    const currentStudents = filteredStudents.slice(startEntry, endEntry);

    // --- Export Handlers (Basic Implementations) ---
    const handlePrint = () => window.print();
    // --- Export Handlers ---

    // 1. COPY: Copies tab-separated data to clipboard
    const handleCopy = () => {
        const headers = ['Institutional ID', 'Student Name', 'Email', 'Status'];
        const rows = filteredStudents.map(s =>
            `${s.institutional_id}\t${s.name}\t${s.email}\t${s.is_active ? 'Active' : 'Inactive'}`
        );
        const textToCopy = [headers.join('\t'), ...rows].join('\n');

        navigator.clipboard.writeText(textToCopy)
            .then(() => alert("Table data copied to clipboard!"))
            .catch(() => alert("Failed to copy data."));
    };

    // 2. CSV: Generates and downloads a .csv file
    const handleCSV = () => {
        const headers = ['Institutional ID,Student Name,Email Address,Status'];
        const rows = filteredStudents.map(s =>
            `"${s.institutional_id}","${s.name}","${s.email}","${s.is_active ? 'Active' : 'Inactive'}"`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_directory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // 3. EXCEL: Generates a CSV formatted for Excel
    const handleExcel = () => {
        // Without heavy libraries like 'xlsx', Excel perfectly reads CSVs.
        // We trigger the exact same logic as CSV, but you could name it .xls if preferred.
        handleCSV();
    };

    return (
        <div className="p-6 font-sans text-gray-700 bg-[#f8f9fa] min-h-screen">

            {/* Page Title */}
            <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Home / Manage Students</div>
                <h1 className="text-3xl font-bold text-[#2a3f54]">Manage Students</h1>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
                    {error}
                </div>
            )}

            {/* Main Table Card */}
            <div className="bg-white border border-gray-200 rounded shadow-sm">

                {/* Orange Header Card */}
                <div className="bg-[#f07b00] text-white px-4 py-3 flex justify-between items-center">
                    <h3 className="font-semibold text-sm tracking-wide">Student Directory Results</h3>
                    <div className="flex space-x-1">
                        <span className="bg-white bg-opacity-20 text-white text-xs font-semibold px-2 py-1 rounded">
                            Total: {students.length}
                        </span>
                    </div>
                </div>

                {/* Toolbar: Entries, Exports, Search */}
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 bg-[#fafafa]">

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        {/* Entries Dropdown */}
                        <div className="flex items-center text-sm text-gray-600">
                            <select
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="border border-gray-300 p-1.5 rounded outline-none mr-2 bg-white text-gray-700 focus:border-[#f07b00]"
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                            <span>entries per page</span>
                        </div>

                        {/* Export Button Group */}
                        <div className="inline-flex rounded shadow-sm">
                            <button onClick={handleCopy} className="px-3 py-1.5 text-xs font-medium text-white bg-[#6c8b9d] hover:bg-[#5a7687] border-r border-[#5a7687] rounded-l">Copy</button>
                            <button onClick={handleCSV} className="px-3 py-1.5 text-xs font-medium text-white bg-[#6c8b9d] hover:bg-[#5a7687] border-r border-[#5a7687]">CSV</button>
                            <button onClick={handleExcel} className="px-3 py-1.5 text-xs font-medium text-white bg-[#6c8b9d] hover:bg-[#5a7687] border-r border-[#5a7687]">Excel</button>
                            <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-medium text-white bg-[#6c8b9d] hover:bg-[#5a7687] rounded-r">Print</button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="flex items-center text-sm">
                        <label className="mr-2 font-medium text-gray-600">Search:</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 p-1.5 rounded outline-none w-full sm:w-48 bg-white focus:border-[#f07b00] focus:ring-1 focus:ring-[#f07b00]"
                        />
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 border-b border-gray-300">
                                <th className="p-3 border-r border-gray-200 font-semibold w-16">No.</th>
                                <th className="p-3 border-r border-gray-200 font-semibold">Institutional ID</th>
                                <th className="p-3 border-r border-gray-200 font-semibold">Student Name</th>
                                <th className="p-3 border-r border-gray-200 font-semibold">Email Address</th>
                                <th className="p-3 border-r border-gray-200 font-semibold print:border-none">Classes</th>
                                <th className="p-3 border-r border-gray-200 font-semibold print:border-none">Status</th>
                                <th className="p-3 font-semibold text-center w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f07b00]"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentStudents.length > 0 ? (
                                currentStudents.map((student, index) => (
                                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        {/* Serial Number calculation based on current page */}
                                        <td className="p-3 border-r border-gray-200 text-gray-500">{startEntry + index + 1}</td>
                                        <td className="p-3 border-r border-gray-200 font-mono font-medium text-gray-800">{student.institutional_id}</td>
                                        <td className="p-3 border-r border-gray-200 font-medium text-[#2a3f54]">{student.name}</td>
                                        <td className="p-3 border-r border-gray-200 text-gray-600">{student.email}</td>
                                        <td className="p-3 border-r border-gray-200 print:border-none">
                                            {student.enrolled_classes ? (
                                                <span className="text-gray-700 text-xs">{student.enrolled_classes}</span>
                                            ) : (
                                                <span className="text-gray-400 italic text-xs">Unassigned</span>
                                            )}
                                        </td>
                                        <td className="p-3 border-r border-gray-200">
                                            {student.is_active ? (
                                                <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded">Active</span>
                                            ) : (
                                                <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded">Inactive</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            {/* Your exact toggle button logic styled to fit the table */}
                                            <button
                                                onClick={() => handleToggleStatus(student.id, student.is_active)}
                                                className={`px-3 py-1.5 text-xs font-medium rounded shadow-sm transition-colors ${student.is_active
                                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                                    : 'bg-[#2eb3e7] hover:bg-[#1fa0d4] text-white'
                                                    }`}
                                            >
                                                {student.is_active ? 'Deactivate' : 'Reactivate'}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500 bg-gray-50">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer: Info & Pagination */}
                <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-[#fafafa] text-sm text-gray-600 border-t border-gray-200">
                    <div className="mb-4 md:mb-0">
                        Showing {totalEntries === 0 ? 0 : startEntry + 1} to {endEntry} of {totalEntries} entries
                    </div>

                    {/* Standard DataTables Pagination */}
                    <div className="flex border border-gray-300 rounded overflow-hidden shadow-sm">
                        <button
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                            className="px-3 py-1.5 bg-white hover:bg-gray-50 border-r border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >«</button>
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-3 py-1.5 bg-white hover:bg-gray-50 border-r border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >‹</button>

                        <button className="px-4 py-1.5 bg-[#2eb3e7] text-white font-medium border-r border-[#2eb3e7]">
                            {page}
                        </button>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-3 py-1.5 bg-white hover:bg-gray-50 border-r border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >›</button>
                        <button
                            onClick={() => setPage(totalPages)}
                            disabled={page === totalPages || totalPages === 0}
                            className="px-3 py-1.5 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >»</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManageStudents;