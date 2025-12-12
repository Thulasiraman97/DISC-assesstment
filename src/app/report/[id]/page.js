'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getResult, getUserProfile } from '../../../services/api';
import discTemplates from '../../../data/disc-templates.json'; // Content JSON
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LabelList } from 'recharts';
import { toCanvas } from 'html-to-image';
import jsPDF from 'jspdf';

export default function ReportPage({ params }) {
    // Unwrapping params for Next.js 15+ 
    const unwrappedParams = use(params);
    const userId = unwrappedParams.id;

    const [userData, setUserData] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const reportRef = useRef(null);
    const router = useRouter();

    // DISC Traits with colors and full names
    const DISCTraits = discTemplates.traits;

    useEffect(() => {
        if (userId) {
            fetchReportData(userId);
        }
    }, [userId]);

    const fetchReportData = async (id) => {
        try {
            setLoading(true);
            // Fetch both Assessment Result and User Profile
            const [resultData, profileData] = await Promise.all([
                getResult(id),
                getUserProfile(id)
            ]);

            setUserData(resultData);
            setUserProfile(profileData);
        } catch (err) {
            console.error("Error fetching report:", err);
            setError("Failed to load report data.");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        // Try to close the tab/window
        window.close();
        // Fallback if script didn't open the window
        if (!window.closed) {
            if (window.history.length > 1) {
                router.back();
            } else {
                router.push('/dashboard');
            }
        }
    };

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        setDownloading(true);
        try {
            // Wait for images and charts to fully render
            await new Promise(resolve => setTimeout(resolve, 1000));

            const element = reportRef.current;

            // Generate canvas using html-to-image (more reliable than toPng)
            const canvas = await toCanvas(element, {
                quality: 1,
                pixelRatio: 2,
                backgroundColor: '#ffffff',
                cacheBust: true,
                style: {
                    margin: '0',
                    padding: '0',
                    maxWidth: 'none',
                    width: '100%'
                }
            });

            // Convert canvas to data URL
            const imgData = canvas.toDataURL('image/png', 1.0);

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / (imgWidth / 2); // Divide by 2 due to pixelRatio
            const totalHeight = (imgHeight / 2) * ratio;

            // Handle multi-page PDF if report is long
            let heightLeft = totalHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position = heightLeft - totalHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save(`DISC_Report_${userProfile?.name || 'User'}.pdf`);
        } catch (err) {
            console.error("PDF generation failed:", err);
            console.error("Error details:", {
                message: err.message,
                stack: err.stack,
                name: err.name
            });
            alert(`Failed to generate PDF. Error: ${err.message || 'Unknown error'}. Please check the console for details.`);
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-green-600">Generating Report...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
    if (!userData) return null;

    // Prepare Chart Data
    const radarData = [
        { subject: 'Dominance', A: Math.round(userData.percentages?.D || 0), fullMark: 100 },
        { subject: 'Influence', A: Math.round(userData.percentages?.I || 0), fullMark: 100 },
        { subject: 'Steadiness', A: Math.round(userData.percentages?.S || 0), fullMark: 100 },
        { subject: 'Compliance', A: Math.round(userData.percentages?.C || 0), fullMark: 100 },
    ];

    const pieData = [
        { name: 'Dominance', value: Math.round(userData.percentages?.D || 0), color: DISCTraits.D.color },
        { name: 'Influence', value: Math.round(userData.percentages?.I || 0), color: DISCTraits.I.color },
        { name: 'Steadiness', value: Math.round(userData.percentages?.S || 0), color: DISCTraits.S.color },
        { name: 'Conscientiousness', value: Math.round(userData.percentages?.C || 0), color: DISCTraits.C.color },
    ];

    // Helper to get the correct content object (Single or Combo)
    const getContentObject = () => {
        const combinedKey = userData.secondaryTrait ? userData.highestTrait + userData.secondaryTrait : null;
        if (combinedKey && discTemplates[combinedKey]) {
            return discTemplates[combinedKey];
        }
        return discTemplates[userData.highestTrait] || discTemplates['D'];
    };

    const content = getContentObject();

    // Helper to format duration
    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <main className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
            {/* Fixed Action Bar - Close Button Left */}
            <div className="fixed top-4 left-4 z-50">
                <button
                    onClick={handleClose}
                    className="px-4 py-2 bg-white text-zinc-700 rounded-lg shadow hover:bg-zinc-50 border border-zinc-200 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                </button>
            </div>

            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={handleDownloadPDF}
                    disabled={downloading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 font-medium flex items-center gap-2"
                >
                    {downloading ? 'Downloading...' : 'Download PDF'}
                </button>
            </div>

            {/* Configured for PDF Capture */}
            <div ref={reportRef} className="max-w-4xl mx-auto shadow-2xl overflow-hidden print-container relative" style={{ backgroundColor: '#ffffff' }}>

                {/* Watermark - Moved to Top Right as requested */}
                <div className="absolute top-6 right-8 z-20 flex flex-col items-end opacity-90">
                    <span className="text-[10px] uppercase tracking-wider text-green-800/60 font-medium mb-0.5">Powered by</span>
                    <img
                        src="/powered-by.png"
                        alt="Powered By"
                        className="h-6 object-contain"
                    />
                </div>

                {/* 1. Header Section */}
                <div style={{ background: 'linear-gradient(to bottom, #f0fdf4, #dcfce7)', color: '#27272a', borderBottom: '1px solid #bbf7d0' }} className="p-8 relative overflow-hidden">
                    <div className="relative z-10 flex justify-between items-start">
                        <div>
                            <Image src="/logo-new.png" alt="Logo" width={150} height={50} className="mb-4 object-contain" />
                            <h1 className="text-3xl font-bold tracking-wide uppercase" style={{ color: '#166534' }}>DISC Assessment Report</h1>
                            <p className="mt-1 font-medium" style={{ color: '#15803d' }}>Detailed Behavioral Analysis</p>
                        </div>
                        <div className="text-right mt-12 md:mt-12">
                            {/* Margin top added for mobile/watermark clearance if needed, though watermark is absolute */}
                            <h2 className="text-xl font-bold" style={{ color: '#14532d' }}>{userProfile?.name || 'User Name'}</h2>
                            <p className="text-sm" style={{ color: '#166534' }}>{userProfile?.email}</p>
                            <p className="text-xs mt-2 font-medium" style={{ color: '#15803d' }}>
                                Assessment Submitted: {userData.completedAt || userData.createdAt ? new Date(userData.completedAt || userData.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-xs font-medium" style={{ color: '#15803d' }}>
                                Time Taken: {formatDuration(userData.timeTaken)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8 space-y-6">

                    {/* 2. ABOUT DISC Section (New) */}
                    <section className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm">
                        <h3 className="text-xl font-bold mb-3" style={{ color: '#166534' }}>About DISC</h3>
                        <div className="prose text-sm text-zinc-600 max-w-none space-y-3">
                            <p>
                                DISC helps you understand your work style, communication pattern, and natural behavior in professional settings.
                                It explains how you take action, interact with people, handle teamwork, and approach tasks.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-4">
                                <div className="p-3 rounded-lg bg-red-50 border-l-4 border-red-500">
                                    <strong className="text-red-700 block text-base mb-1">D – Dominance</strong>
                                    <span className="text-xs text-red-900/80">How you make decisions and take charge</span>
                                </div>
                                <div className="p-3 rounded-lg bg-yellow-50 border-l-4 border-yellow-500">
                                    <strong className="text-yellow-700 block text-base mb-1">I – Influence</strong>
                                    <span className="text-xs text-yellow-900/80">How you communicate and build relationships</span>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50 border-l-4 border-green-500">
                                    <strong className="text-green-700 block text-base mb-1">S – Steadiness</strong>
                                    <span className="text-xs text-green-900/80">How you support others and maintain stability</span>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                                    <strong className="text-blue-700 block text-base mb-1">C – Conscientiousness</strong>
                                    <span className="text-xs text-blue-900/80">How you plan, analyze, and ensure accuracy</span>
                                </div>
                            </div>
                            <p>
                                Your DISC profile shows your unique combination. Knowing your style helps you collaborate better and grow confidently.
                            </p>
                        </div>
                    </section>

                    {/* Grid Layout: Result Badge (Left) and Graph Analysis (Right) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-6">
                        {/* Left Column: Result Badge */}
                        <div className="flex flex-col items-center justify-center text-center w-full h-full py-4">
                            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center shadow-xl border-4 z-10 mx-auto"
                                style={{ backgroundColor: '#ffffff', borderColor: DISCTraits[userData.highestTrait]?.color || '#16a34a' }}>
                                <div className="absolute inset-0 rounded-full opacity-10 blur-xl" style={{ backgroundColor: DISCTraits[userData.highestTrait]?.color || '#16a34a' }}></div>
                                <span className="text-3xl md:text-4xl font-extrabold tracking-tighter" style={{ color: DISCTraits[userData.highestTrait]?.color || '#16a34a' }}>
                                    {userData.highestTrait}{userData.secondaryTrait || ''}
                                </span>
                            </div>
                            <h2 className="mt-4 text-xl md:text-2xl font-bold text-center" style={{ color: '#14532d' }}>
                                {DISCTraits[userData.highestTrait]?.name} {userData.secondaryTrait ? `& ${DISCTraits[userData.secondaryTrait]?.name}` : ''}
                            </h2>
                            <p className="mt-2 text-center max-w-xs mx-auto text-sm font-medium" style={{ color: '#15803d' }}>
                                "{discTemplates.tagline?.[userData.highestTrait + (userData.secondaryTrait || '')] || discTemplates.tagline?.[userData.highestTrait] || "Your Style Analysis"}"
                            </p>
                        </div>

                        {/* Right Column: Graph Analysis */}
                        <div className="w-full">
                            <h3 className="text-lg font-bold border-b pb-2 mb-3" style={{ color: '#27272a', borderColor: '#e4e4e7' }}>Graph Analysis</h3>
                            <div className="p-4 rounded-xl shadow-sm border border-zinc-100" style={{ backgroundColor: '#fafafa' }}>
                                <div className="h-48 mx-auto">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={pieData} margin={{ top: 15, right: 10, left: 10, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#52525b' }} axisLine={false} tickLine={false} />
                                            <YAxis hide />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                                <LabelList dataKey="value" position="top" fill="#3f3f46" fontSize={11} fontWeight="bold" formatter={(val) => `${val}%`} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Behavioral Overview */}
                    <section>
                        <h3 className="text-xl font-bold border-b-2 border-green-600 pb-1 mb-3 text-zinc-800">
                            Behavioral Overview
                        </h3>
                        <p className="text-sm leading-relaxed text-zinc-700 text-justify">
                            {content.behavioralOverview}
                        </p>
                    </section>

                    {/* Core Strengths & Work Approach */}
                    <section>
                        <h3 className="text-lg font-bold text-green-800 mb-3 bg-green-50 p-2 rounded-lg inline-block">Core Strengths & Work Approach</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {content.coreStrengths?.map((item, i) => (
                                <div key={i} className="mb-1">
                                    <h4 className="font-bold text-zinc-800 text-xs mb-0.5">{item.title}</h4>
                                    <p className="text-xs text-zinc-600 leading-snug">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* 2-Column Grid for Remaining Sections (Compact Layout) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Communication Approach */}
                        <section className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 h-full">
                            <h3 className="text-lg font-bold text-blue-900 mb-3">Communication Approach</h3>
                            <div className="space-y-3">
                                {content.communicationApproach?.map((item, i) => (
                                    <div key={i}>
                                        <h4 className="font-bold text-blue-800 text-xs">{item.title}</h4>
                                        <p className="text-xs text-zinc-700">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Development Opportunities */}
                        <section className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 h-full">
                            <h3 className="text-lg font-bold text-orange-900 mb-3">Development Opportunities</h3>
                            <ul className="space-y-1.5 list-disc pl-4">
                                {content.developmentOpportunities?.map((item, i) => (
                                    <li key={i} className="text-xs text-zinc-700">{item}</li>
                                ))}
                            </ul>
                        </section>

                        {/* Workplace Preferences */}
                        <section>
                            <h3 className="text-lg font-bold text-zinc-800 mb-3">Workplace Preferences</h3>
                            <ul className="space-y-1.5 list-disc pl-4">
                                {content.workplacePreferences?.map((item, i) => (
                                    <li key={i} className="text-xs text-zinc-700">{item}</li>
                                ))}
                            </ul>
                        </section>

                        {/* Team & Collaboration Style */}
                        <section>
                            <h3 className="text-lg font-bold text-zinc-800 mb-3">Team & Collaboration Style</h3>
                            {Array.isArray(content.teamCollaborationStyle) ? (
                                content.teamCollaborationStyle.map((item, i) => (
                                    <div key={i} className="mb-2">
                                        {typeof item === 'object' ? (
                                            <>
                                                <strong className="block text-zinc-900 text-xs">{item.title}</strong>
                                                <span className="text-zinc-700 text-xs">{item.desc}</span>
                                            </>
                                        ) : (
                                            <p className="text-zinc-700 text-xs">{item}</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="mb-2">
                                    <strong className="block text-zinc-900 text-xs">{content.teamCollaborationStyle?.title}</strong>
                                    <p className="text-zinc-700 mt-0.5 text-xs">{content.teamCollaborationStyle?.description}</p>
                                </div>
                            )}
                        </section>

                        {/* Career Alignment */}
                        <section className="bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                            <h3 className="text-lg font-bold text-zinc-800 mb-2">Career Alignment</h3>
                            <p className="text-xs text-zinc-700 whitespace-pre-line">{content.careerAlignment}</p>
                        </section>

                        {/* Adaptability Insight */}
                        <section>
                            <h3 className="text-lg font-bold text-purple-900 mb-2">Adaptability Insight</h3>
                            <p className="text-xs text-zinc-700 italic border-l-4 border-purple-400 pl-3 py-1 bg-purple-50">
                                {content.adaptabilityInsight}
                            </p>
                        </section>
                    </div>

                    {/* Summary Profile - Bottom */}
                    <section className="mt-8 pt-6 border-t border-green-100 text-center">
                        <h3 className="text-xl font-bold text-green-900 mb-4">Your Personality at a Glance</h3>
                        <div className="bg-green-50 inline-block px-6 py-4 rounded-xl border border-green-200 shadow-sm max-w-2xl">
                            <p className="text-base font-bold text-green-900 whitespace-pre-line leading-relaxed">
                                {content.summaryProfile}
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );


}


