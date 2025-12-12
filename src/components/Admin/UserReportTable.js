'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserReportTable({ users, onExport }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Results Toggle State
    const [resultsEnabled, setResultsEnabled] = useState(true);
    const [toggling, setToggling] = useState(false);

    // Import API
    const { toggleResults, getResultVisibility } = require('../../services/api');
    const { useEffect } = require('react');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getResultVisibility();
                setResultsEnabled(data.enabled);
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    const handleToggleResults = async () => {
        try {
            setToggling(true);
            const userId = localStorage.getItem('disc_user_id');
            const newState = !resultsEnabled;
            await toggleResults(newState, userId);
            setResultsEnabled(newState);
        } catch (err) {
            console.error("Failed to toggle results", err);
            alert("Failed to update settings");
        } finally {
            setToggling(false);
        }
    };

    // Filter and sort users
    const filteredUsers = users
        .filter(user => {
            // Search filter
            const matchesSearch =
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.phone.includes(searchTerm);

            // Status filter
            const matchesStatus =
                filterStatus === 'all' ||
                (filterStatus === 'completed' && user.assessmentCompleted) ||
                (filterStatus === 'pending' && !user.assessmentCompleted);

            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];

            if (sortField === 'createdAt' || sortField === 'completedAt') {
                aVal = aVal ? new Date(aVal) : new Date(0);
                bVal = bVal ? new Date(bVal) : new Date(0);
            }

            if (sortOrder === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
    };

    const formatTime = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    };

    const formatDuration = (seconds) => {
        if (!seconds && seconds !== 0) return '-';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const completedCount = users.filter(u => u.assessmentCompleted).length;
    const pendingCount = users.length - completedCount;

    return (
        <div className="w-full">
            {/* Header with stats and toggle */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex-1 md:flex-none min-w-[250px]">
                        <div className="text-sm text-zinc-500 font-medium">Total Users</div>
                        <div className="text-2xl font-bold text-zinc-900 mt-1">{users.length}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-green-200 shadow-sm flex-1 md:flex-none min-w-[250px]">
                        <div className="text-sm text-green-600 font-medium">Completed</div>
                        <div className="text-2xl font-bold text-green-700 mt-1">{completedCount}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-orange-200 shadow-sm flex-1 md:flex-none min-w-[250px]">
                        <div className="text-sm text-orange-600 font-medium">Pending</div>
                        <div className="text-2xl font-bold text-orange-700 mt-1">{pendingCount}</div>
                    </div>
                </div>

                {/* Result Visibility Toggle */}
                <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-sm flex items-center gap-3">
                    <span className="text-sm font-medium text-zinc-600">
                        Result Visibility:
                        <span className={`ml-1 font-bold ${resultsEnabled ? 'text-green-600' : 'text-zinc-500'}`}>
                            {resultsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                    </span>
                    <button
                        onClick={handleToggleResults}
                        disabled={toggling}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${resultsEnabled ? 'bg-green-600' : 'bg-zinc-200'
                            }`}
                    >
                        <span
                            className={`${resultsEnabled ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </button>
                    {toggling && <span className="text-xs text-zinc-400 animate-pulse">Saving...</span>}
                </div>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="🔍 Search by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white shadow-sm hover:shadow-md"
                />

                {/* Custom Animated Dropdown */}
                <div className="relative min-w-[210px]">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full px-4 py-3 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all shadow-sm hover:shadow-md flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-2">
                            {filterStatus === 'all' && (
                                <>
                                    <span className="text-lg">👥</span>
                                    <span className="font-medium text-zinc-700">All Users</span>
                                    <span className="ml-1 px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold">{users.length}</span>
                                </>
                            )}
                            {filterStatus === 'completed' && (
                                <>
                                    <span className="text-lg">✅</span>
                                    <span className="font-medium text-green-700">Completed</span>
                                    <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">{completedCount}</span>
                                </>
                            )}
                            {filterStatus === 'pending' && (
                                <>
                                    <span className="text-lg">⏳</span>
                                    <span className="font-medium text-orange-700">Pending</span>
                                    <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">{pendingCount}</span>
                                </>
                            )}
                        </div>
                        <motion.svg
                            animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className="w-5 h-5 text-zinc-400 group-hover:text-green-600 transition-colors"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </motion.svg>
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-full mt-2 w-full bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden z-50 backdrop-blur-lg"
                            >
                                <div className="py-2">
                                    <button
                                        onClick={() => {
                                            setFilterStatus('all');
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${filterStatus === 'all'
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold'
                                            : 'hover:bg-zinc-50 text-zinc-700'
                                            }`}
                                    >
                                        <span className="text-xl">👥</span>
                                        <span className="flex-1 text-left">All Users</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filterStatus === 'all' ? 'bg-green-200 text-green-800' : 'bg-zinc-100 text-zinc-600'
                                            }`}>
                                            {users.length}
                                        </span>
                                        {filterStatus === 'all' && (
                                            <motion.svg
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={3}
                                                stroke="currentColor"
                                                className="w-5 h-5 text-green-600"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </motion.svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setFilterStatus('completed');
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${filterStatus === 'completed'
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold'
                                            : 'hover:bg-zinc-50 text-zinc-700'
                                            }`}
                                    >
                                        <span className="text-xl">✅</span>
                                        <span className="flex-1 text-left">Completed</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filterStatus === 'completed' ? 'bg-green-200 text-green-800' : 'bg-green-100 text-green-700'
                                            }`}>
                                            {completedCount}
                                        </span>
                                        {filterStatus === 'completed' && (
                                            <motion.svg
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={3}
                                                stroke="currentColor"
                                                className="w-5 h-5 text-green-600"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </motion.svg>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => {
                                            setFilterStatus('pending');
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${filterStatus === 'pending'
                                            ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 font-bold'
                                            : 'hover:bg-zinc-50 text-zinc-700'
                                            }`}
                                    >
                                        <span className="text-xl">⏳</span>
                                        <span className="flex-1 text-left">Pending</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${filterStatus === 'pending' ? 'bg-green-200 text-green-800' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {pendingCount}
                                        </span>
                                        {filterStatus === 'pending' && (
                                            <motion.svg
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={3}
                                                stroke="currentColor"
                                                className="w-5 h-5 text-green-600"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </motion.svg>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('name')}>
                                    Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Phone
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('assessmentCompleted')}>
                                    Status {sortField === 'assessmentCompleted' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    DISC Scores
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Trait
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('timeTaken')}>
                                    Time Taken {sortField === 'timeTaken' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-zinc-600 uppercase tracking-wider cursor-pointer hover:bg-zinc-100" onClick={() => handleSort('completedAt')}>
                                    Completed {sortField === 'completedAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-zinc-600 uppercase tracking-wider">
                                    Report
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-zinc-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-zinc-50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-medium text-zinc-900">
                                            {user.name}
                                            {user.isAdmin && (
                                                <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">Admin</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-600">{user.email}</td>
                                        <td className="px-4 py-3 text-sm text-zinc-600">{user.phone}</td>
                                        <td className="px-4 py-3 text-sm">
                                            {user.assessmentCompleted ? (
                                                <span className="px-3 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">
                                                    Completed
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs font-bold bg-orange-100 text-orange-700 rounded-full">
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-center whitespace-nowrap">
                                            {user.discScores ? (
                                                <div className="flex gap-2 justify-center">
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-bold ring-1 ring-red-200/50">
                                                        D: {user.discScores.D} ({Math.round(user.percentages?.D || 0)}%)
                                                    </span>
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-bold ring-1 ring-yellow-200/50">
                                                        I: {user.discScores.I} ({Math.round(user.percentages?.I || 0)}%)
                                                    </span>
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-bold ring-1 ring-green-200/50">
                                                        S: {user.discScores.S} ({Math.round(user.percentages?.S || 0)}%)
                                                    </span>
                                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold ring-1 ring-blue-200/50">
                                                        C: {user.discScores.C} ({Math.round(user.percentages?.C || 0)}%)
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium whitespace-nowrap min-w-[200px]">
                                            {user.highestTrait ? (
                                                <div className="flex flex-row items-center gap-1 text-zinc-800">
                                                    <span>{user.highestTrait}</span>
                                                    {user.secondaryTrait && <span className="text-zinc-500">/ {user.secondaryTrait}</span>}
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-600">
                                            {formatDuration(user.timeTaken)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-zinc-600">
                                            {user.completedAt ? (
                                                <div>
                                                    <div className="font-medium">{formatDate(user.completedAt)}</div>
                                                    <div className="text-xs text-zinc-400">{formatTime(user.completedAt)}</div>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {user.assessmentCompleted ? (
                                                <a
                                                    href={`/report/${user.userId || user._id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="View Detailed Report"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </a>
                                            ) : (
                                                <span className="text-zinc-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-zinc-500 text-center">
                Showing {filteredUsers.length} of {users.length} users
            </div>
        </div>
    );
}
