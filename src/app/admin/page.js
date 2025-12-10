'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllUsersReport, exportToPDF, exportToXLSX } from '../../services/api';
import UserReportTable from '../../components/Admin/UserReportTable';
import Image from 'next/image';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('disc_user_id');
        if (!userId) {
            router.push('/login');
            return;
        }

        fetchUserReports(userId);
    }, [router]);

    const fetchUserReports = async (userId) => {
        try {
            setLoading(true);
            const response = await getAllUsersReport(userId);
            setUsers(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching user reports:', err);
            if (err.response?.status === 403) {
                setError('Access denied. Admin privileges required.');
            } else {
                setError('Failed to load user reports. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExportPDF = async () => {
        try {
            setExporting(true);
            const userId = localStorage.getItem('disc_user_id');
            const blob = await exportToPDF(userId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `user-reports-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting PDF:', err);
            alert('Failed to export PDF. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    const handleExportXLSX = async () => {
        try {
            setExporting(true);
            const userId = localStorage.getItem('disc_user_id');
            const blob = await exportToXLSX(userId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `user-reports-${Date.now()}.xlsx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error exporting XLSX:', err);
            alert('Failed to export Excel file. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50 to-green-100">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-green-600 font-mono">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50 to-green-100">
                <div className="bg-white p-8 rounded-2xl border border-red-200 shadow-lg max-w-md">
                    <div className="text-red-600 text-6xl mb-4 text-center">⚠️</div>
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2 text-center">Access Denied</h2>
                    <p className="text-zinc-600 mb-6 text-center">{error}</p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-b from-white via-green-50 to-green-100 p-4 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-green-100 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                        {/* LEFT: Logo & Back Button */}
                        <div className="flex items-center gap-4 justify-start">
                            <Image
                                src="/logo-new.png"
                                alt="Inqisity Logo"
                                width={100}
                                height={30}
                                className="object-contain"
                            />
                            <div className="h-8 w-px bg-zinc-200"></div>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                Back
                            </button>
                        </div>

                        {/* CENTER: Title */}
                        <div className="flex flex-col items-center justify-center">
                            <h1 className="text-2xl font-bold text-green-800 text-center">Admin Dashboard</h1>
                            <p className="text-sm text-zinc-500 text-center">User Reports & Analytics</p>
                        </div>

                        {/* RIGHT: Powered By Watermark */}
                        <div className="flex justify-end pr-4">
                            <div className="flex flex-col items-center opacity-90 hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mb-0.5">Powered by</span>
                                <img
                                    src="/powered-by.png"
                                    alt="Powered By Logo"
                                    className="h-5 object-contain animate-pulse"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Buttons */}
            <div className="max-w-7xl mx-auto mb-6">
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={handleExportPDF}
                        disabled={exporting}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        {exporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                    <button
                        onClick={handleExportXLSX}
                        disabled={exporting}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                        {exporting ? 'Exporting...' : 'Export Excel'}
                    </button>
                </div>
            </div>

            {/* User Report Table */}
            <div className="max-w-7xl mx-auto">
                <UserReportTable users={users} />
            </div>
        </main>
    );
}
