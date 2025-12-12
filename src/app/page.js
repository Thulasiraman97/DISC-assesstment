'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('disc_user_id');
    if (userId) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden bg-gradient-to-b from-white via-green-50 to-green-100">
      {/* Logo - Top Left */}
      <div className="absolute top-8 left-8 z-20">
        <Image
          src="/logo-new.png"
          alt="Inqisity Logo"
          width={200}
          height={60}
          className="object-contain" // Original colors
          priority
        />
      </div>

      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-200/40 blur-[150px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-200/40 blur-[150px] rounded-full mix-blend-multiply" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl glass-panel p-12 md:p-20 rounded-[3rem] border border-green-200 shadow-2xl shadow-green-900/10 backdrop-blur-xl bg-white/90">
        <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-800 via-emerald-700 to-teal-600 mb-6 tracking-tight">
          DISC <span className="text-emerald-500">Futura</span>
        </h1>

        <p className="text-lg md:text-xl text-zinc-600 mb-12 max-w-2xl font-light leading-relaxed">
          Unlock the secrets of your personality with our next-generation assessment engine.
          Discover your behavioral patterns in a purely immersive environment.
        </p>

        <Link
          href="/login"
          className="group relative px-8 py-4 bg-zinc-900 text-white rounded-full font-semibold text-lg hover:px-10 transition-all duration-300 shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300"
        >
          Begin Analysis
          <span className="absolute inset-0 rounded-full border-2 border-green-500/50 scale-110 opacity-0 group-hover:scale-125 group-hover:opacity-100 transition-all duration-500" />
        </Link>

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
    </main>
  );
}
