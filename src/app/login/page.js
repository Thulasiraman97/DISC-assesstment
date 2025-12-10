'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendOtp, verifyOtp, retryOtp } from '../../services/api';
import Modal from '../../components/ui/Modal';
import { Phone, KeyRound, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
    const router = useRouter();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [otpSent, setOtpSent] = useState(false);
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });

    // Timer countdown effect
    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Redirect if already logged in
    useEffect(() => {
        const userId = localStorage.getItem('disc_user_id');
        if (userId) {
            router.push('/dashboard');
        }
    }, [router]);

    const validatePhone = (number) => {
        const indianPhoneRegex = /^[6-9]\d{9}$/;
        return indianPhoneRegex.test(number);
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!validatePhone(phone)) {
            setModal({
                isOpen: true,
                title: 'Invalid Number',
                message: 'Please enter a valid 10-digit Indian mobile number (starting with 6-9).'
            });
            return;
        }

        setLoading(true);

        try {
            await sendOtp(phone);
            setOtpSent(true);
            setTimer(30); // 30 seconds cooldown
            setModal({
                isOpen: true,
                title: 'OTP Sent',
                message: `An OTP has been sent to +91-${phone}.`
            });
        } catch (error) {
            console.error('Send OTP failed', error);

            // Handle User Not Found (404)
            if (error.response && error.response.status === 404) {
                setModal({
                    isOpen: true,
                    title: 'Access Denied',
                    message: 'You are not a registered user. Please contact support to create an account.'
                });
            } else {
                setModal({
                    isOpen: true,
                    title: 'Error',
                    message: 'Failed to send OTP. Please try again.'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();

        const otpString = otp.join('');
        if (otpString.length < 4) { // Msg91 OTPs are usually 4 or 6 digits
            setModal({
                isOpen: true,
                title: 'Invalid OTP',
                message: 'Please enter a valid OTP.'
            });
            return;
        }

        setLoading(true);

        try {
            const data = await verifyOtp(phone, otpString);

            if (data && data.user) {
                // Store user info
                localStorage.setItem('disc_user_id', data.user._id);
                localStorage.setItem('disc_user_phone', data.user.phone);
                localStorage.setItem('disc_user_name', data.user.name || '');
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Verify OTP failed', error);
            setModal({
                isOpen: true,
                title: 'Verification Failed',
                message: 'Invalid OTP. Please check and try again.'
            });
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;

        setLoading(true);
        try {
            await retryOtp(phone);
            setTimer(30);
            setModal({
                isOpen: true,
                title: 'OTP Resent',
                message: 'A new OTP has been sent to your mobile number.'
            });
        } catch (error) {
            setModal({
                isOpen: true,
                title: 'Error',
                message: 'Failed to resend OTP.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white via-green-50 to-green-100 relative overflow-hidden text-zinc-900">
            {/* Logo - Top Left */}
            <div className="absolute top-8 left-8 z-20">
                <Image
                    src="/logo-new.png"
                    alt="Inqisity Logo"
                    width={200}
                    height={60}
                    className="object-contain"
                    priority
                />
            </div>

            {/* Background Ambience */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-200/40 blur-[120px] rounded-full mix-blend-multiply" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-200/40 blur-[120px] rounded-full mix-blend-multiply" />
            </div>

            <Modal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                title={modal.title}
                message={modal.message}
            />

            <div className="z-10 w-full max-w-md">
                <div className="glass-panel p-8 md:p-12 rounded-3xl border border-green-200 shadow-xl backdrop-blur-xl bg-white/70">
                    <div className="text-center mb-10">
                        {/* Powered by Watermark */}
                        <div className="mb-6 flex flex-col items-center justify-center opacity-90 hover:opacity-100 transition-opacity">
                            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mb-0.5">Powered by</span>
                            <img
                                src="/powered-by.png"
                                alt="Powered By Logo"
                                className="h-5 object-contain animate-pulse"
                            />
                        </div>

                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-800 to-teal-600 mb-2">
                            {otpSent ? 'Verify OTP' : 'Welcome Back'}
                        </h1>
                        <p className="text-zinc-500 font-light">
                            {otpSent ? `Enter the OTP sent to +91 ${phone}` : 'Enter your mobile number to continue'}
                        </p>
                    </div>

                    {!otpSent ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                                    <Phone size={20} />
                                </span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 10) setPhone(val);
                                    }}
                                    placeholder="Mobile Number"
                                    maxLength={10}
                                    className="w-full bg-white border border-zinc-200 rounded-xl px-12 py-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-mono text-lg shadow-sm"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || phone.length < 10}
                                className="w-full bg-zinc-900 text-white font-bold text-lg py-4 rounded-xl hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100 shadow-lg flex items-center justify-center gap-2 group hover:shadow-xl hover:bg-black"
                            >
                                {loading ? 'Sending...' : 'Get OTP'}
                                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-8">
                            <div className="flex justify-center gap-4">
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (!/^\d*$/.test(val)) return;

                                            const newOtp = [...otp];
                                            newOtp[index] = val;
                                            setOtp(newOtp);

                                            // Auto-focus next input
                                            if (val && index < 3) {
                                                document.getElementById(`otp-${index + 1}`).focus();
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                const newOtp = [...otp];
                                                newOtp[index - 1] = '';
                                                setOtp(newOtp);
                                                document.getElementById(`otp-${index - 1}`).focus();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            e.preventDefault();
                                            const pastedData = e.clipboardData.getData('text').slice(0, 4).split('');
                                            if (pastedData.length > 0) {
                                                const newOtp = [...otp];
                                                pastedData.forEach((val, i) => {
                                                    if (index + i < 4 && /^\d$/.test(val)) {
                                                        newOtp[index + i] = val;
                                                    }
                                                });
                                                setOtp(newOtp);
                                                // Focus the last filled input or the next empty one
                                                const nextIndex = Math.min(index + pastedData.length, 3);
                                                document.getElementById(`otp-${nextIndex}`).focus();
                                            }
                                        }}
                                        className="w-16 h-16 text-center bg-white border border-zinc-200 rounded-xl text-2xl text-zinc-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all font-mono shadow-sm"
                                        autoFocus={index === 0}
                                    />
                                ))}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.join('').length < 4}
                                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg py-4 rounded-xl hover:scale-[1.02] transition-transform disabled:opacity-70 disabled:hover:scale-100 shadow-lg hover:shadow-green-200"
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={timer > 0 || loading}
                                    className="text-zinc-500 hover:text-green-600 transition-colors text-sm disabled:opacity-50 disabled:hover:text-zinc-500 font-medium"
                                >
                                    {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
