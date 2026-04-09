import React, { useState, useEffect } from 'react';
import API from '../../services/api';

const ManageFaculty = () => {
    // --- Data State ---
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- UI State (For Pagination & Search) ---
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchFaculty();
    }, []);

    // Reset to page 1 whenever the user types a new search or changes the limit
    useEffect(() => {
        setPage(1);
    }, [searchTerm, limit]);

    const fetchFaculty = async () => {
        try {
            const response = await API.get('/admin/faculty');
            const facultyArray = response.data.faculty;

            setFaculty(Array.isArray(facultyArray) ? facultyArray : []);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching faculty:', err);
            setError('Failed to fetch faculty. Please try again later.');
            setLoading(false);
        }
    };

    // --- Client-Side Search & Pagination Logic ---
    const filteredFaculty = faculty.filter(teacher => 
        teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.institutional_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalEntries = filteredFaculty.length;
    const totalPages = Math.ceil(totalEntries / limit) || 1;
    const startEntry = (page - 1) * limit;
    const endEntry = Math.min(page * limit, totalEntries);
    const currentFaculty = filteredFaculty.slice(startEntry, endEntry);

    // --- Export Handlers ---
    const handleCopy = () => {
        const headers = ['Faculty ID', 'Name', 'Email'];
        const rows = filteredFaculty.map(f => `${f.institutional_id}\t${f.name}\t${f.email}`);
        const textToCopy = [headers.join('\t'), ...rows].join('\n');
        
        navigator.clipboard.writeText(textToCopy)
            .then(() => alert("Faculty data copied to clipboard!"))
            .catch(() => alert("Failed to copy data."));
    };

    const handleCSV = () => {
        const headers = ['Faculty ID,Name,Email'];
        const rows = filteredFaculty.map(f => `"${f.institutional_id}","${f.name}","${f.email}"`);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "faculty_directory.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExcel = () => {
        handleCSV(); // CSV is natively read by Excel
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="p-6 font-sans text-gray-700 bg-[#f8f9fa] min-h-screen print:p-0 print:bg-white">
            
            {/* Page Title - HIDDEN ON PRINT */}
            <div className="mb-6 print:hidden">
                <div className="text-sm text-gray-500 mb-1">Home / Manage Faculty</div>
                <h1 className="text-3xl font-bold text-[#2a3f54]">Manage Faculty</h1>
            </div>

            {error && (
                <div className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm print:hidden">
                    {error}
                </div>
            )}

            {/* Main Table Card */}
            <div className="bg-white border border-gray-200 rounded shadow-sm print:border-none print:shadow-none">
                
                {/* Purple Header Card - HIDDEN ON PRINT */}
                <div className="bg-purple-600 text-white px-4 py-3 flex justify-between items-center print:hidden rounded-t">
                    <h3 className="font-semibold text-sm tracking-wide">Faculty Directory Results</h3>
                    <div className="flex space-x-1">
                        <span className="bg-white bg-opacity-20 text-white text-xs font-semibold px-2 py-1 rounded">
                            Total: {faculty.length}
                        </span>
                    </div>
                </div>

                {/* Toolbar: Entries, Exports, Search - HIDDEN ON PRINT */}
                <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 bg-[#fafafa] print:hidden">
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                            <select 
                                value={limit} 
                                onChange={(e) => setLimit(Number(e.target.value))}
                                className="border border-gray-300 p-1.5 rounded outline-none mr-2 bg-white text-gray-700 focus:border-purple-600"
                            >
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

                    {/* Search Input */}
                    <div className="flex items-center text-sm">
                        <label className="mr-2 font-medium text-gray-600">Search:</label>
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 p-1.5 rounded outline-none w-full sm:w-48 bg-white focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
                        />
                    </div>
                </div>

                {/* Print Only Header (Visible only on paper) */}
                <div className="hidden print:block mb-4 text-center">
                    <h2 className="text-2xl font-bold">Golden Valley ERP - Faculty Directory</h2>
                    <p className="text-gray-500">Date: {new Date().toLocaleDateString()}</p>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto print:overflow-visible">
                    <table className="w-full text-left text-sm border-collapse print:text-xs">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 border-b border-gray-300 print:bg-white print:border-b-2 print:border-black">
                                <th className="p-3 border-r border-gray-200 font-semibold w-16 print:border-none">No.</th>
                                <th className="p-3 border-r border-gray-200 font-semibold print:border-none">Faculty ID</th>
                                <th className="p-3 border-r border-gray-200 font-semibold print:border-none">Name</th>
                                <th className="p-3 font-semibold print:border-none">Email Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : currentFaculty.length > 0 ? (
                                currentFaculty.map((teacher, index) => (
                                    <tr key={teacher.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors print:border-b print:border-gray-200">
                                        <td className="p-3 border-r border-gray-200 text-gray-500 print:border-none">{startEntry + index + 1}</td>
                                        <td className="p-3 border-r border-gray-200 font-mono font-medium text-gray-800 print:border-none">{teacher.institutional_id}</td>
                                        <td className="p-3 border-r border-gray-200 font-medium text-[#2a3f54] print:border-none">{teacher.name}</td>
                                        <td className="p-3 text-gray-600 print:border-none">{teacher.email}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 bg-gray-50">
                                        No faculty members found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer: Info & Pagination - HIDDEN ON PRINT */}
                <div className="p-4 flex flex-col md:flex-row justify-between items-center bg-[#fafafa] text-sm text-gray-600 border-t border-gray-200 print:hidden">
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
                        
                        <button className="px-4 py-1.5 bg-purple-600 text-white font-medium border-r border-purple-600">
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

export default ManageFaculty;