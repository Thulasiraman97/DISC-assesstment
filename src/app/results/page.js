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
    const router = useRouter();

    useEffect(() => {
        const userId = localStorage.getItem('disc_user_id');
        if (!userId) {
            // Redirect to login if not authenticated
            window.location.href = '/login';
            return;
        }

        const fetchResult = async () => {
            try {
                const data = await getResult(userId);
                setResult(data);
            } catch (error) {
                console.error("Failed to fetch result", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResult();
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

    // Descriptions for DISCs - Updated colors for light theme visibility
    const traits = {
        D: { name: 'Dominance', color: 'text-red-600', desc: "Assertive, ambitious, and results-oriented." },
        I: { name: 'Influence', color: 'text-yellow-600', desc: "Enthusiastic, persuasive, and optimistic." },
        S: { name: 'Steadiness', color: 'text-green-600', desc: "Supportive, patient, and loyal." },
        C: { name: 'Conscientiousness', color: 'text-blue-600', desc: "Analytical, precise, and systematic." }
    };

    const highest = traits[result.highestTrait] || {};

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white via-green-50 to-green-100 relative overflow-hidden">
            {/* Dashboard Button - Top Left */}
            <Link href="/" className="fixed top-8 left-8 z-50 flex items-center gap-2 px-6 py-3 rounded-full bg-white/80 hover:bg-white transition-all text-zinc-600 hover:text-green-700 border border-green-200 shadow-sm backdrop-blur-sm group">
                <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="font-medium">Dashboard</span>
            </Link>

            {/* Logo - Top Right */}
            <div className="fixed top-8 right-8 z-50">
                <Image
                    src="/logo-new.png"
                    alt="Inqisity Logo"
                    width={180}
                    height={54}
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
                className="z-10 text-center space-y-8 max-w-4xl"
            >
                <h1 className="text-4xl font-light text-zinc-500">Your Primary Trait is</h1>

                <div className="glass-panel p-12 rounded-3xl border border-green-100 bg-white/70 shadow-xl backdrop-blur-xl">
                    <h2 className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold ${highest.color} mb-6 break-words leading-tight tracking-tight`}>
                        {highest.name || result.highestTrait}
                    </h2>
                    <p className="text-xl md:text-2xl text-zinc-600 mt-4 font-light max-w-2xl mx-auto">
                        {highest.desc}
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                    {Object.entries(result.score).map(([key, val]) => (
                        <div key={key} className="flex flex-col items-center p-6 glass-panel rounded-2xl bg-white/50 border border-white/50 shadow-sm">
                            <span className={`text-3xl font-bold ${traits[key].color} mb-2`}>{key}</span>
                            <span className="text-zinc-800 text-xl font-medium">{val}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </main>
    );
}
