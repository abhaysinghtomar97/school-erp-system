import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import StudentFeeLedger from './StudentFeeLedger';
import EditableField from '../../components/EditableField';

// Update path if necessary

// --- Skeleton Loader for the Profile ---
const ProfileSkeleton = () => (
    <div className="animate-pulse space-y-6">
        {/* Header Skeleton */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex items-center gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
            <div className="space-y-3 flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
            </div>
        </div>
        {/* Content Skeleton */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-64">
            <div className="flex gap-4 mb-6 border-b pb-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    </div>
);

const UserProfile = () => {
    const { id } = useParams(); // Gets the ID from the URL
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'academic', 'fees'

    // ==========================================
    // 2. NEW PAYMENT MODAL STATE & FUNCTION HERE
    // ==========================================
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const handleOpenPayment = (invoice) => {

        setSelectedInvoice(invoice);
        setIsPaymentModalOpen(true);
    };


    // 1. Add these two new states
    const [isProcessing, setIsProcessing] = useState(false);
    const [refreshLedger, setRefreshLedger] = useState(0); // This will trigger the ledger to reload!

    // 2. Add the actual payment function
    const handleConfirmPayment = async () => {
        if (!selectedInvoice) return;

        setIsProcessing(true);
        try {
            // We pass the student ID, the month (e.g. "June"), and the amount
            await API.post('/fee/pay-month', {
                studentId: id, // The ID from your URL params
                feeMonth: selectedInvoice.fee_month,
                amountPaid: selectedInvoice.total_amount,
                paymentMethod: 'CASH'
            });

            // Success! Close the modal and reset
            setIsPaymentModalOpen(false);
            setSelectedInvoice(null);

            // Update the toggle to force the Ledger to re-fetch the new Green boxes
            setRefreshLedger(prev => prev + 1);

        } catch (err) {
            console.error("Payment failed:", err);
            alert("Failed to process payment. Please try again.");
        } finally {
            setIsProcessing(false);
        }
    };

    // The master update function
    const handleUpdateField = async (fieldKey, newValue) => {
        try {
            // Send the specific field and value to your backend
            await API.patch(`/users/${id}/profile`, {
                field: fieldKey,
                value: newValue
            });


            // Update the local React state so the UI instantly reflects the change
            setProfile((prev) => ({
                ...prev,
                [fieldKey]: newValue
            }));

        } catch (error) {
            alert("Failed to update field. Please try again.");
            throw error; // Throwing ensures the EditableField component knows it failed
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        setIsLoading(true);
        try {
            const response = await API.get(`/users/${id}/profile`);
            setProfile(response.data.profile);
        } catch (err) {
            console.error("Failed to load profile", err);
            setError("Could not load user profile. They might not exist.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <div className="p-6 max-w-5xl mx-auto"><ProfileSkeleton /></div>;
    if (error) return <div className="p-6 text-center text-red-600 font-bold">{error}</div>;
    if (!profile) return null;

    return (
        <div className="p-6 max-w-5xl mx-auto">

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="mb-4 text-gray-500 hover:text-gray-800 text-sm font-medium flex items-center gap-1"
            >
                ← Back
            </button>

            {/* --- TOP HEADER CARD --- */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col md:flex-row items-center md:items-start gap-6 mb-6 relative overflow-hidden">
                {/* Role Badge (Top Right) */}
                <div className={`absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-lg text-white ${profile.role === 'STUDENT' ? 'bg-blue-500' : profile.role === 'TEACHER' ? 'bg-purple-500' : 'bg-gray-800'}`}>
                    {profile.role}
                </div>

                {/* Avatar Placeholder */}
                <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-gray-400">
                    {profile.name.charAt(0).toUpperCase()}
                </div>

                {/* Core Info */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                    <div className="text-gray-500 font-medium mt-1">ID: {profile.institutional_id}</div>

                    <div className="mt-3 flex flex-wrap justify-center md:justify-start gap-3 text-sm">
                        <span className="flex items-center gap-1 bg-gray-50 border px-2 py-1 rounded text-gray-600">
                            📧 {profile.email}
                        </span>
                        <span className={`flex items-center gap-1 border px-2 py-1 rounded font-medium ${profile.is_active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            {profile.is_active ? 'Active Account' : 'Inactive Account'}
                        </span>
                    </div>
                </div>
            </div>

            {/* --- TAB NAVIGATION --- */}
            <div className="flex border-b border-gray-200 mb-6 space-x-6">
                <button
                    onClick={() => setActiveTab('personal')}
                    className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'personal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Overview & Personal
                </button>

                {/* Only show Academic & Fees tabs if they are a student */}
                {profile.role === 'STUDENT' && (
                    <>
                        <button
                            onClick={() => setActiveTab('academic')}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'academic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Academic Record
                        </button>
                        <button
                            onClick={() => setActiveTab('fees')}
                            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'fees' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Fee Ledger
                        </button>
                    </>
                )}
            </div>

            {/* --- TAB CONTENT --- */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[300px]">

                {activeTab === 'personal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Contact Details</h3>
                            <ul className="space-y-4">
                                <EditableField
                                    label="Parent/Guardian Name"
                                    value={profile.parent_name}
                                    fieldKey="parent_name"
                                    onSave={handleUpdateField}
                                />
                                <EditableField
                                    label="Phone Number"
                                    value={profile.mobile_number}
                                    fieldKey="mobile_number"
                                    onSave={handleUpdateField}
                                />
                                <EditableField
                                    label="Address"
                                    value={profile.address}
                                    fieldKey="address"
                                    onSave={handleUpdateField}
                                />

                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Profile Data</h3>
                            <ul>
                                <EditableField
                                    label="Emergency Contact"
                                    value={profile.emergency_contact}
                                    fieldKey="emergency_contact"
                                    onSave={handleUpdateField}
                                />
                                <EditableField
                                    label="Date of Birth"
                                    value={profile.date_of_birth ? new Date(profile.date_of_birth).toISOString().split('T')[0] : ''}
                                    fieldKey="date_of_birth"
                                    type="date"
                                    onSave={handleUpdateField}
                                />
                                <EditableField
                                    label="Blood Group"
                                    value={profile.blood_group}
                                    fieldKey="blood_group"
                                    onSave={handleUpdateField}
                                />
                            </ul>

                            <ul className="space-y-4">
                                {profile.role === 'TEACHER' && (
                                    <>
                                        <EditableField
                                            label="Department"
                                            value={profile.department}
                                            fieldKey="department"
                                            onSave={handleUpdateField}
                                        />
                                        <EditableField
                                            label="Designation"
                                            value={profile.designation}
                                            fieldKey="designation"
                                            onSave={handleUpdateField}
                                        />
                                        <EditableField
                                            label="Hire Date"
                                            value={profile.hire_date ? new Date(profile.hire_date).toISOString().split('T')[0] : ''}
                                            fieldKey="hire_date"
                                            type="date"
                                            onSave={handleUpdateField}
                                        />
                                    </>
                                )}
                            </ul>
                        </div>
                    </div>
                )}

                {activeTab === 'academic' && profile.role === 'STUDENT' && (
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Current Enrollment</h3>
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 inline-block">
                            <div className="text-sm text-blue-600 font-bold mb-1">Academic Year: {profile.academic_year || 'Not Assigned'}</div>
                            <div className="text-2xl font-black text-gray-800">Class: {profile.class_name || 'Not Assigned'}</div>
                        </div>
                        {/* Later you can add Attendance % or Grades here */}
                    </div>
                )}

                {activeTab === 'fees' && profile.role === 'STUDENT' && (
                    <div>
                        <StudentFeeLedger
                            studentId={id}
                            onPayClick={handleOpenPayment} // <-- PASS THE FUNCTION HERE
                            refreshTrigger={refreshLedger}
                        />
                    </div>
                )}

            </div>
            {isPaymentModalOpen && selectedInvoice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full relative">

                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Collect Payment: {selectedInvoice.fee_month}
                        </h2>

                        <div className="bg-red-50 text-red-700 p-4 rounded mb-6 font-mono text-lg font-bold text-center border border-red-200">
                            Amount Due: ₹{selectedInvoice.total_amount}
                        </div>

                        <button
                            onClick={handleConfirmPayment}
                            disabled={isProcessing}
                            className="w-full bg-green-600 text-white font-bold py-3 rounded shadow hover:bg-green-700 transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        >
                            {isProcessing ? 'Processing...' : 'Confirm Cash Payment'}
                        </button>

                        <button
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="w-full bg-gray-100 text-gray-600 font-bold py-2 rounded hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;