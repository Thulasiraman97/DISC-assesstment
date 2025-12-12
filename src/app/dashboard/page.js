'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Play, Sparkles, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [resultsEnabled, setResultsEnabled] = useState(true);

    useEffect(() => {
        const userId = localStorage.getItem('disc_user_id');
        if (!userId) {
            router.push('/login');
            return;
        }

        const storedName = localStorage.getItem('disc_user_name');
        const storedPhone = localStorage.getItem('disc_user_phone');
        if (storedName) setName(storedName);
        if (storedPhone) setPhone(storedPhone);

        // Check if user is admin and assessment status
        const fetchUserData = async () => {
            try {
                const { getUserProfile, checkAssessmentStatus, getResultVisibility } = await import('../../services/api');
                const profile = await getUserProfile(userId);
                setIsAdmin(profile.isAdmin || false);

                // Check assessment completion status
                const statusData = await checkAssessmentStatus(userId);
                setHasCompletedAssessment(statusData.hasCompleted);

                // Check results visibility settings
                const settingsData = await getResultVisibility();
                setResultsEnabled(settingsData.enabled);

            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [router]);

    const handleLogout = () => {
        // Clear specific user data and assessment progress
        localStorage.removeItem('disc_user_id');
        localStorage.removeItem('disc_user_phone');
        localStorage.removeItem('disc_user_name');
        localStorage.removeItem('disc_assessment_state');

        router.push('/login');
    };

    return (
        <main className="min-h-screen flex flex-col items-center p-8 bg-gradient-to-b from-white via-green-50 to-green-100 relative text-zinc-900 overflow-hidden">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-green-200/40 blur-[150px] rounded-full mix-blend-multiply animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-emerald-200/40 blur-[150px] rounded-full mix-blend-multiply animate-pulse" />
            </div>

            <nav className="w-full max-w-5xl flex justify-between items-center mb-16 z-10 glass-panel p-4 rounded-full border border-green-200 bg-white/70 shadow-sm backdrop-blur-md">
                <div className="px-4">
                    <Image
                        src="/logo-new.png"
                        alt="Inqisity Logo"
                        width={150}
                        height={45}
                        className="object-contain"
                    />
                </div>
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-full transition-colors text-purple-700 hover:text-purple-900 font-bold">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                            </svg>
                            <span className="text-sm">Admin Dashboard</span>
                        </Link>
                    )}
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-green-100 rounded-full transition-colors text-zinc-600 hover:text-green-800 font-medium">
                        <User size={20} />
                        <span className="text-sm">My Profile</span>
                    </Link>
                    <button onClick={handleLogout} className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-full transition-colors" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </nav>

            <div className="z-10 w-full max-w-4xl text-center mb-12">
                <h1 className="text-4xl md:text-6xl font-light mb-4 text-zinc-800">
                    Hello, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-700 to-emerald-600 capitalize">{name || 'Explorer'}</span>
                </h1>
                <p className="text-zinc-500 text-lg md:text-xl font-light">
                    Ready to discover your true potential?
                </p>
            </div>

            <div className="z-10 w-full max-w-2xl flex justify-center">
                {isLoading ? (
                    // Loading state
                    <div className="w-full p-1 rounded-[2.5rem] bg-gradient-to-r from-green-400 via-emerald-400 to-green-400">
                        <div className="bg-white h-full rounded-[2.3rem] p-10 md:p-14 flex flex-col items-center justify-center text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
                            <p className="mt-4 text-zinc-500">Loading...</p>
                        </div>
                    </div>
                ) : hasCompletedAssessment ? (
                    // Assessment Completed Card
                    <div className="group relative w-full p-1 rounded-[2.5rem] bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 bg-[length:200%_auto] animate-gradient-xy hover:shadow-2xl hover:shadow-emerald-200 transition-all duration-500">
                        <div className="bg-white h-full rounded-[2.3rem] p-10 md:p-14 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-xl">

                            {/* Decorative background icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none scale-150 group-hover:scale-[1.7] transition-transform duration-700 text-emerald-500">
                                <Sparkles size={400} />
                            </div>

                            {/* Success Badge */}
                            <div className="mb-6 px-6 py-2 bg-emerald-100 rounded-full">
                                <span className="text-emerald-700 font-bold text-sm uppercase tracking-wider">✓ Assessment Completed</span>
                            </div>

                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-500 flex items-center justify-center text-white mb-8 shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform duration-300">
                                <Sparkles size={36} fill="currentColor" />
                            </div>

                            {/* Result Visibility Logic */}
                            {resultsEnabled ? (
                                <>
                                    <h2 className="text-4xl font-bold mb-4 text-zinc-900 tracking-tight">Your Results Are Ready!</h2>
                                    <p className="text-zinc-500 leading-relaxed font-light text-lg max-w-md mb-10">
                                        You've completed your DISC assessment. View your personalized behavioral profile and insights.
                                    </p>

                                    <Link
                                        href="/results"
                                        className="group/btn relative px-10 py-5 bg-zinc-900 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-transform shadow-xl hover:shadow-2xl"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            View Results
                                            <Sparkles size={18} className="text-yellow-300" />
                                        </span>
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -z-0" />
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <h2 className="text-3xl font-bold mb-4 text-zinc-800 tracking-tight">Assessment Completed!</h2>
                                    <p className="text-zinc-500 leading-relaxed font-light text-lg max-w-md mb-6">
                                        Thank you for completing the assessment. Your results have been securely recorded.
                                    </p>
                                    <div className="p-4 bg-green-50 text-green-800 rounded-xl border border-green-100 font-medium max-w-md mx-auto">
                                        Results will be released soon. Please check back later.
                                    </div>
                                </>
                            )}

                            {/* Powered by Watermark */}
                            <div className="mt-8 flex flex-col items-center opacity-90 hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mb-0.5">Powered by</span>
                                <img
                                    src="/powered-by.png"
                                    alt="Powered By Logo"
                                    className="h-5 object-contain animate-pulse"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    // Start Assessment Card
                    <div className="group relative w-full p-1 rounded-[2.5rem] bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-[length:200%_auto] animate-gradient-xy hover:shadow-2xl hover:shadow-green-200 transition-all duration-500">
                        <div className="bg-white h-full rounded-[2.3rem] p-10 md:p-14 flex flex-col items-center justify-center text-center relative overflow-hidden backdrop-blur-xl">

                            {/* Decorative background icon */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none scale-150 group-hover:scale-[1.7] transition-transform duration-700 text-green-500">
                                <Sparkles size={400} />
                            </div>

                            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center text-white mb-8 shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-300">
                                <Play size={36} fill="currentColor" className="ml-1" />
                            </div>

                            <h2 className="text-4xl font-bold mb-4 text-zinc-900 tracking-tight">Begin Analysis</h2>
                            <p className="text-zinc-500 leading-relaxed font-light text-lg max-w-2xl mb-10">
                                Complete 40 questions in 45 minutes.<br />
                                For each question, select two options that are Most Like Me 👍 and Least Like Me 👎 to discover your behavioral profile.
                            </p>

                            <Link
                                href="/assessment"
                                className="group/btn relative px-10 py-5 bg-zinc-900 text-white font-bold text-xl rounded-2xl hover:scale-105 transition-transform shadow-xl hover:shadow-2xl"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Assessment
                                    <Sparkles size={18} className="text-yellow-300" />
                                </span>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 -z-0" />
                            </Link>

                            {/* Powered by Watermark */}
                            <div className="mt-8 flex flex-col items-center opacity-90 hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mb-0.5">Powered by</span>
                                <img
                                    src="/powered-by.png"
                                    alt="Powered By Logo"
                                    className="h-8 object-contain animate-pulse"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
