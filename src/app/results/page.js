'use client';

import { useState, useEffect } from 'react';
import { getResult } from '../../services/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ResultsPage() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resultsEnabled, setResultsEnabled] = useState(true); // Default to true, will fetch real status
    const router = useRouter();

    // Import API
    const { getResultVisibility } = require('../../services/api');

    useEffect(() => {
        const userId = localStorage.getItem('disc_user_id');
        if (!userId) {
            // Redirect to login if not authenticated
            window.location.href = '/login';
            return;
        }

        const fetchResultAndSettings = async () => {
            try {
                // 1. Fetch Eligibility
                const visibilityData = await getResultVisibility();
                setResultsEnabled(visibilityData.enabled);

                // 2. Fetch Result
                const data = await getResult(userId);
                setResult(data);
            } catch (error) {
                console.error("Failed to fetch result", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResultAndSettings();
    }, []);

    // Prevent back navigation to assessment page - FORCE redirect to dashboard
    useEffect(() => {
        // Immediately replace history to prevent going back to assessment
        if (typeof window !== 'undefined') {
            // Clear forward history and replace with results
            window.history.replaceState(null, '', '/results');

            const handlePopState = (e) => {
                // Prevent default back behavior
                e.preventDefault();
                e.stopPropagation();

                // Force redirect to dashboard - use replace to avoid adding to history
                window.location.replace('/');
            };

            window.addEventListener('popstate', handlePopState, true);

            return () => {
                window.removeEventListener('popstate', handlePopState, true);
            };
        }
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-white text-green-600">Analysis in progress...</div>;

    if (!result) return <div className="min-h-screen flex items-center justify-center bg-white text-red-600">No results found.</div>;

    // --- CHECK VISIBILITY ---
    if (!resultsEnabled) {
        // Redirect to dashboard if not enabled
        if (typeof window !== 'undefined') {
            window.location.replace('/');
        }
        return null;
    }

    // Descriptions for DISCs - Updated colors for light theme visibility
    const traits = {
        D: { name: 'Dominance', color: 'text-red-600', desc: "Assertive, ambitious, and results-oriented.", shadow: 'shadow-red-100' },
        I: { name: 'Influence', color: 'text-yellow-600', desc: "Enthusiastic, persuasive, and optimistic.", shadow: 'shadow-yellow-100' },
        S: { name: 'Steadiness', color: 'text-green-600', desc: "Supportive, patient, and loyal.", shadow: 'shadow-green-100' },
        C: { name: 'Conscientiousness', color: 'text-blue-600', desc: "Analytical, precise, and systematic.", shadow: 'shadow-blue-100' }
    };

    const primaryKey = result.highestTrait || 'D';
    const primary = traits[primaryKey];
    const secondaryKey = result.secondaryTrait;
    const secondary = secondaryKey ? traits[secondaryKey] : null;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white via-green-50 to-green-100 relative overflow-hidden">
            {/* Dashboard Button */}
            <Link href="/dashboard" className="fixed top-8 left-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 hover:bg-white transition-all text-zinc-600 hover:text-green-700 border border-green-200 shadow-sm backdrop-blur-sm group">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Dashboard</span>
            </Link>

            {/* Logo */}
            <div className="fixed top-8 right-8 z-50">
                <Image
                    src="/logo-new.png"
                    alt="Inqisity Logo"
                    width={120}
                    height={36}
                    className="object-contain"
                />
            </div>

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-green-200/40 rounded-full blur-[120px] mix-blend-multiply" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="z-10 text-center space-y-8 max-w-5xl w-full"
            >
                <h1 className="text-3xl font-light text-zinc-500">Your DISC Profile</h1>

                {/* Primary Result Card */}
                <div className="glass-panel p-6 md:p-8 rounded-2xl border border-green-100 bg-white/70 shadow-xl backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                        {/* Primary Trait */}
                        <div className="flex-1">
                            <h2 className={`text-4xl md:text-6xl font-bold ${primary.color} mb-2 leading-tight tracking-tight`}>
                                {primary.name}
                            </h2>
                            <p className="text-base text-zinc-600 font-light">{primary.desc}</p>
                        </div>

                        {/* PLUS Sign if Secondary Exists */}
                        {secondary && (
                            <div className="text-3xl text-zinc-300 font-light">+</div>
                        )}

                        {/* Secondary Trait */}
                        {secondary && (
                            <div className="flex-1">
                                <h2 className={`text-lg md:text-5xl font-bold ${secondary.color} mb-2 leading-tight tracking-tight`}>
                                    {secondary.name}
                                </h2>
                                <p className="text-base text-zinc-600 font-light">{secondary.desc}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Percentages Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                    {Object.entries(result.percentages || { D: 0, I: 0, S: 0, C: 0 }).map(([key, val]) => (
                        <div key={key} className={`flex flex-col items-center p-4 glass-panel rounded-xl bg-white/50 border border-white/50 shadow-sm hover:shadow-md transition-shadow`}>
                            <span className={`text-2xl font-bold ${traits[key].color} mb-1`}>{key}</span>
                            <span className="text-xl font-bold text-zinc-800">{Math.round(val)}%</span>
                        </div>
                    ))}
                </div>
                {/* View Detailed Report Button */}
                <div className="mt-12 flex justify-center">
                    <Link
                        href={`/report/${localStorage.getItem('disc_user_id')}`}
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all font-bold text-lg flex items-center gap-2"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Detailed Report
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
