'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserProfile } from '../../services/api';
import { User, Mail, Phone, ArrowLeft, LogOut } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        gender: '',
        phone: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userId = localStorage.getItem('disc_user_id');

                if (!userId) {
                    router.push('/login');
                    return;
                }

                // Fetch user profile from backend
                const userData = await getUserProfile(userId);

                setProfileData({
                    name: userData.name || 'Not provided',
                    phone: userData.phone || 'Not provided',
                    email: userData.email || 'Not provided',
                    gender: userData.gender || 'Not provided'
                });
            } catch (error) {
                console.error('Failed to fetch profile:', error);
                // Fallback to localStorage if API fails
                const storedName = localStorage.getItem('disc_user_name') || 'Not provided';
                const storedPhone = localStorage.getItem('disc_user_phone') || 'Not provided';

                setProfileData({
                    name: storedName,
                    phone: storedPhone,
                    email: 'Not provided',
                    gender: 'Not provided'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [router]);

    const handleLogout = () => {
        // Clear specific user data and assessment progress
        localStorage.removeItem('disc_user_id');
        localStorage.removeItem('disc_user_phone');
        localStorage.removeItem('disc_user_name');
        localStorage.removeItem('disc_assessment_state');

        router.push('/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-green-50 to-green-100 text-zinc-900">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-green-600 font-mono">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white via-green-50 to-green-100 relative text-zinc-900">
            {/* Logo - Top Left */}
            <div className="absolute top-8 left-8 z-20">
                <Image
                    src="/logo-new.png"
                    alt="Inqisity Logo"
                    width={120}
                    height={36}
                    className="object-contain"
                />
            </div>

            {/* Top Right Actions: Watermark & Logout */}
            <div className="absolute top-8 right-8 z-20 flex items-center gap-6">
                {/* Powered by Watermark */}
                <div className="flex flex-col items-center opacity-90 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mb-0.5">Powered by</span>
                    <img
                        src="/powered-by.png"
                        alt="Powered By Logo"
                        className="h-5 object-contain animate-pulse"
                    />
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-white/80 hover:bg-red-50 text-zinc-600 hover:text-red-500 border border-green-200 hover:border-red-300 rounded-full transition-all backdrop-blur-sm shadow-sm"
                >
                    <LogOut size={18} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>

            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-green-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-200/20 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-2xl mt-24">
                <button
                    onClick={() => router.back()}
                    className="mb-12 flex items-center gap-2 text-zinc-600 hover:text-green-700 transition-colors font-medium"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>

                <div className="glass-panel p-8 md:p-12 rounded-3xl border border-green-200 bg-white/70 backdrop-blur-xl shadow-xl">
                    <h1 className="text-3xl font-light text-zinc-800 mb-8 border-b border-green-100 pb-4">
                        My Profile
                    </h1>

                    <div className="space-y-6">
                        {/* Phone */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-600 ml-1">Mobile Number</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                    <Phone size={18} />
                                </span>
                                <div className="w-full bg-white border border-zinc-200 rounded-xl px-12 py-3 text-zinc-800 shadow-sm">
                                    {profileData.phone}
                                </div>
                            </div>
                        </div>

                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-600 ml-1">Full Name</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                    <User size={18} />
                                </span>
                                <div className="w-full bg-white border border-zinc-200 rounded-xl px-12 py-3 text-zinc-800 shadow-sm">
                                    {profileData.name}
                                </div>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-600 ml-1">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                    <Mail size={18} />
                                </span>
                                <div className="w-full bg-white border border-zinc-200 rounded-xl px-12 py-3 text-zinc-800 shadow-sm">
                                    {profileData.email}
                                </div>
                            </div>
                        </div>

                        {/* Gender */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-600 ml-1">Gender</label>
                            <div className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-zinc-800 shadow-sm">
                                {profileData.gender}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
