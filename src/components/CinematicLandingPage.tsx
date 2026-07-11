import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Smartphone, Globe, Shield, Zap, Download, X, ArrowRight, CheckCircle2, Award, Star } from 'lucide-react';
import { AdminState } from '../types';

interface CinematicLandingPageProps {
  adminState?: AdminState;
}

export default function CinematicLandingPage({ adminState }: CinematicLandingPageProps) {
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadStep, setDownloadStep] = useState<'idle' | 'generating' | 'downloading' | 'complete'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [showExporter, setShowExporter] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<string[]>([]);

  const logoUrl = adminState?.appLogoUrl || '';
  const apkUrl = adminState?.apkUrl || 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/SORAT%20(2).apk?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9TT1JBVCAoMikuYXBrIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4Mzc1ODMwOSwiZXhwIjozMTcxNDM3NTgzMDl9.mIqt1dwzG8lDF-3w0mprAJ2ajooRSkw4hg4aNGNdMTw';

  const addNotification = (msg: string, type?: string) => {
    setLocalNotifications(prev => [...prev, msg]);
    setTimeout(() => {
      setLocalNotifications(prev => prev.filter(m => m !== msg));
    }, 4000);
  };

  const getStandaloneHtmlContent = () => {
    const logoUrl = adminState?.appLogoUrl || '';
    const apkUrl = adminState?.apkUrl || 'https://zygfwbbrokqaxdearmpf.supabase.co/storage/v1/object/sign/Sorat/SORAT%20(2).apk?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9iNjFhZWUyZC1lMGU3LTRlMTctOTYwYi04MDk3ZDgxNjgyNzIiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJTb3JhdC9TT1JBVCAoMikuYXBrIiwic2NvcGUiOiJkb3dubG9hZCIsImlhdCI6MTc4Mzc1ODMwOSwiZXhwIjozMTcxNDM3NTgzMDl9.mIqt1dwzG8lDF-3w0mprAJ2ajooRSkw4hg4aNGNdMTw';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SORAT | Official Premium Gaming Portal</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts: Inter & Space Grotesk -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #000000;
        }
        .font-display {
            font-family: 'Space Grotesk', sans-serif;
        }
        @keyframes spin-slow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 15s linear infinite;
        }
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        ::-webkit-scrollbar-track {
            background: #000000;
        }
        ::-webkit-scrollbar-thumb {
            background: #1f2937;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #eab308;
        }
    </style>
</head>
<body class="text-white relative overflow-x-hidden selection:bg-yellow-500 selection:text-black">

    <!-- Ambient glows -->
    <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[150px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[150px] pointer-events-none"></div>
    
    <!-- Grid overlay -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>

    <!-- Header -->
    <header class="relative z-10 border-b border-yellow-500/10 bg-black/60 backdrop-blur-md">
        <div class="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 p-[1px] flex items-center justify-center shadow-lg shadow-yellow-500/20">
                    ${logoUrl ? `
                        <img src="${logoUrl}" alt="SORAT Logo" class="w-full h-full object-cover rounded-[11px]" referrerPolicy="no-referrer">
                    ` : `
                        <div class="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
                            <svg class="text-yellow-400 w-5 h-5 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path>
                            </svg>
                        </div>
                    `}
                </div>
                <div>
                    <span class="text-2xl font-black tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent font-display">SORAT</span>
                    <span class="text-[9px] block text-yellow-500/60 font-bold tracking-[0.3em] uppercase leading-none">OFFICIAL PORTAL</span>
                </div>
            </div>

            <div class="flex items-center gap-4">
                <span class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Servers Active
                </span>
                <button onclick="openDownloadModal()" class="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-yellow-500/10">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    GET APP
                </button>
            </div>
        </div>
    </header>

    <!-- Main -->
    <main class="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 flex flex-col items-center text-center">
        <!-- Logo -->
        ${logoUrl ? `
            <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-[1.5px] flex items-center justify-center shadow-2xl shadow-yellow-500/20 mb-6 mx-auto">
                <img src="${logoUrl}" alt="SORAT Logo" class="w-full h-full object-cover rounded-[22px]" referrerPolicy="no-referrer">
            </div>
        ` : `
            <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-[1.5px] flex items-center justify-center shadow-2xl shadow-yellow-500/20 mb-6 mx-auto">
                <div class="w-full h-full bg-black rounded-[22px] flex items-center justify-center relative overflow-hidden">
                    <svg class="text-yellow-400 w-12 h-12 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"></path>
                    </svg>
                </div>
            </div>
        `}

        <!-- Elite Badge -->
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            PREMIUM GAMING PORTAL
        </div>

        <!-- Title -->
        <h1 class="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-none text-white max-w-5xl uppercase font-display">
            THE ULTIMATE GAME OF <br class="hidden md:inline">
            <span class="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600 bg-clip-text text-transparent font-black drop-shadow-[0_4px_12px_rgba(251,191,36,0.3)]">
                LUCK & SPEED
            </span>
        </h1>

        <!-- Subtitle -->
        <p class="mt-8 text-slate-400 text-sm sm:text-lg md:text-xl max-w-2xl leading-relaxed uppercase tracking-wider">
            Welcome to the elite SORAT gaming platform. Enjoy direct secure access, lightning fast deposits, automatic 24/7 instant withdrawals, and real-time live results.
        </p>

        <!-- CTA Buttons -->
        <div class="mt-12 flex flex-col sm:flex-row items-center gap-5 w-full max-w-md justify-center">
            <button onclick="openDownloadModal()" class="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-yellow-500/10 flex items-center justify-center gap-2.5 active:scale-[0.98]">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                Download Android App
            </button>
        </div>

        <!-- Stats -->
        <div class="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
            <div class="bg-zinc-950/50 p-6 rounded-2xl border border-yellow-500/5 hover:border-yellow-500/20 transition-all text-center">
                <span class="text-2xl sm:text-3xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent block font-display">50K+</span>
                <span class="text-[9px] font-black text-yellow-500 tracking-widest uppercase block mt-1">ACTIVE PLAYERS</span>
            </div>
            <div class="bg-zinc-950/50 p-6 rounded-2xl border border-yellow-500/5 hover:border-yellow-500/20 transition-all text-center">
                <span class="text-2xl sm:text-3xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent block font-display">₹25L+</span>
                <span class="text-[9px] font-black text-yellow-500 tracking-widest uppercase block mt-1">DAILY PAYOUTS</span>
            </div>
            <div class="bg-zinc-950/50 p-6 rounded-2xl border border-yellow-500/5 hover:border-yellow-500/20 transition-all text-center">
                <span class="text-2xl sm:text-3xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent block font-display">2 MINS</span>
                <span class="text-[9px] font-black text-yellow-500 tracking-widest uppercase block mt-1">WITHDRAW TIME</span>
            </div>
            <div class="bg-zinc-950/50 p-6 rounded-2xl border border-yellow-500/5 hover:border-yellow-500/20 transition-all text-center">
                <span class="text-2xl sm:text-3xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent block font-display">256-BIT</span>
                <span class="text-[9px] font-black text-yellow-500 tracking-widest uppercase block mt-1">SECURE ENCRYPTION</span>
            </div>
        </div>

        <!-- Features -->
        <section class="mt-32 w-full max-w-6xl text-center">
            <div class="text-center space-y-2 mb-16">
                <h2 class="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider font-display">PLATFORM STANDARDS</h2>
                <p class="text-xs text-yellow-500/60 font-bold uppercase tracking-[0.25em]">WHY SORAT IS PREFERRED BY MILLIONS</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div class="bg-zinc-950 p-8 rounded-3xl border border-yellow-500/5 hover:border-yellow-500/10 transition-all flex flex-col gap-4 relative group">
                    <div class="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    </div>
                    <h3 class="text-sm font-black text-white tracking-widest uppercase mt-2 font-display">FULLY CERTIFIED SECURITY</h3>
                    <p class="text-xs text-slate-400 leading-relaxed uppercase">Integrated with enterprise-grade SSL, private servers, and native database protection to safeguard your gameplay, transactions, and information details.</p>
                </div>

                <div class="bg-zinc-950 p-8 rounded-3xl border border-yellow-500/5 hover:border-yellow-500/10 transition-all flex flex-col gap-4 relative group">
                    <div class="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h3 class="text-sm font-black text-white tracking-widest uppercase mt-2 font-display">INSTANT CREDIT & DEPOSIT</h3>
                    <p class="text-xs text-slate-400 leading-relaxed uppercase">Support for rapid automatic payments, real-time balance updates, and simple payment screenshot confirmations that are verified within seconds.</p>
                </div>

                <div class="bg-zinc-950 p-8 rounded-3xl border border-yellow-500/5 hover:border-yellow-500/10 transition-all flex flex-col gap-4 relative group">
                    <div class="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                    </div>
                    <h3 class="text-sm font-black text-white tracking-widest uppercase mt-2 font-display">OPTIMIZED MOBILE CLIENT</h3>
                    <p class="text-xs text-slate-400 leading-relaxed uppercase">Our native Android APK is fine-tuned to load on any mobile hardware without delays, saving battery and data while offering high-fidelity animations.</p>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 border-t border-yellow-500/10 bg-black/80 py-12 text-slate-500">
        <div class="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="text-center md:text-left">
                <span class="text-lg font-black tracking-widest text-white block font-display">SORAT</span>
                <span class="text-[10px] uppercase tracking-wider block mt-1">© 2026 SORAT Gaming Corporation. All rights reserved.</span>
            </div>

            <div class="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                <span class="text-yellow-500">Responsible Gaming</span>
                <span class="text-slate-800">|</span>
                <span class="text-slate-400">Secure 256-Bit SSL</span>
            </div>
        </div>
    </footer>

    <!-- App Download Modal -->
    <div id="downloadModal" class="fixed inset-0 z-[100] hidden items-center justify-center p-4">
        <div onclick="closeDownloadModal()" class="absolute inset-0 bg-black/95 backdrop-blur-md"></div>

        <div class="bg-zinc-950 border border-yellow-500/20 rounded-[32px] w-full max-w-md p-8 relative z-10 overflow-hidden shadow-2xl">
            <!-- Gold Top Bar -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500"></div>

            <button onclick="closeDownloadModal()" class="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <!-- Step 1: Idle -->
            <div id="dl-step-idle" class="text-center space-y-6 pt-4">
                <div class="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto">
                    <svg class="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                </div>
                <div class="space-y-2">
                    <h3 class="text-xl font-black text-white uppercase tracking-tight font-display">GET SORAT OFFICIAL APK</h3>
                    <p class="text-xs text-slate-400 uppercase tracking-wider leading-relaxed">
                        Download our lightweight certified mobile app direct on your Android device. Full experience, secure, and lag-free.
                    </p>
                </div>

                <button onclick="startDownloadSequence()" class="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/10">
                    START SECURE DOWNLOAD
                </button>

                <div class="flex justify-center items-center gap-2 text-[10px] font-bold text-yellow-500 uppercase tracking-widest pt-2">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Google Play Protect Certified
                </div>
            </div>

            <!-- Step 2: Progress -->
            <div id="dl-step-progress" class="text-center space-y-6 pt-4 hidden">
                <div class="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                </div>
                <div class="space-y-3">
                    <span class="text-[9px] font-black tracking-widest uppercase text-yellow-500/60">DOWNLOADING IN PROGRESS</span>
                    <h3 id="progress-title" class="text-base font-black text-white uppercase font-display">SORAT_V2.0.APK (0%)</h3>
                    
                    <!-- Progress Bar -->
                    <div class="w-full h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                        <div id="progress-bar" class="h-full bg-gradient-to-r from-yellow-400 to-amber-500" style="width: 0%"></div>
                    </div>
                </div>
            </div>

            <!-- Step 3: Complete -->
            <div id="dl-step-complete" class="text-center space-y-6 pt-4 hidden">
                <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <div class="space-y-2">
                    <h3 class="text-xl font-black text-white uppercase tracking-tight font-display">DOWNLOAD STARTED!</h3>
                    <p class="text-xs text-slate-400 uppercase tracking-wider leading-relaxed">
                        If the download did not start automatically, please click below to retry the download.
                    </p>
                </div>

                <div class="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10 text-left space-y-2">
                    <span class="text-[9px] font-black text-yellow-500 uppercase tracking-widest block">HOW TO INSTALL:</span>
                    <ol class="text-[9px] text-slate-400 uppercase tracking-wider space-y-1.5 list-decimal list-inside font-bold">
                        <li>Open the downloaded <span class="text-white">Sorat_v2.0.apk</span></li>
                        <li>Allow "Install from Unknown Sources" if prompted</li>
                        <li>Launch Sorat from home screen & sign in!</li>
                    </ol>
                </div>

                <div class="flex gap-4">
                    <button onclick="startDownloadSequence()" class="flex-1 py-3 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                        RETRY DOWNLOAD
                    </button>
                    <button onclick="closeDownloadModal()" class="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all">
                        DONE
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Script triggers -->
    <script>
        function openDownloadModal() {
            const modal = document.getElementById('downloadModal');
            modal.style.display = 'flex';
            resetSteps();
        }

        function closeDownloadModal() {
            const modal = document.getElementById('downloadModal');
            modal.style.display = 'none';
        }

        function resetSteps() {
            document.getElementById('dl-step-idle').classList.remove('hidden');
            document.getElementById('dl-step-progress').classList.add('hidden');
            document.getElementById('dl-step-complete').classList.add('hidden');
        }

        function startDownloadSequence() {
            document.getElementById('dl-step-idle').classList.add('hidden');
            document.getElementById('dl-step-progress').classList.remove('hidden');
            document.getElementById('dl-step-complete').classList.add('hidden');

            let progress = 0;
            const bar = document.getElementById('progress-bar');
            const title = document.getElementById('progress-title');

            const interval = setInterval(() => {
                progress += 5;
                if (progress > 100) {
                    clearInterval(interval);
                    triggerApkDownload();
                    showCompleteStep();
                } else {
                    bar.style.width = progress + '%';
                    title.innerText = 'SORAT_V2.0.APK (' + progress + '%)';
                }
            }, 100);
        }

        function showCompleteStep() {
            document.getElementById('dl-step-idle').classList.add('hidden');
            document.getElementById('dl-step-progress').classList.add('hidden');
            document.getElementById('dl-step-complete').classList.remove('hidden');
        }

        function triggerApkDownload() {
            const link = document.createElement('a');
            link.href = '${apkUrl}';
            link.download = 'Sorat_v2.0.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    </script>
</body>
</html>`;
  };

  const downloadStandaloneHtml = () => {
    const htmlContent = getStandaloneHtmlContent();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addNotification("Downloaded index.html successfully! Deploy on Appwrite now.", "success");
  };

  const startDownload = () => {
    setDownloadStep('generating');
    setDownloadProgress(0);
    
    // Simulate link generation
    setTimeout(() => {
      setDownloadStep('downloading');
      
      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setDownloadStep('complete');
            
            // Actually trigger APK download (we use the configured APK link)
            const link = document.createElement('a');
            link.href = apkUrl;
            link.download = 'Sorat_v2.0.apk';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }, 1200);
  };

  const handleOpenDownload = () => {
    setShowDownloadPopup(true);
    setDownloadStep('idle');
    setDownloadProgress(0);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans selection:bg-yellow-500 selection:text-black">
      {/* Decorative Cinematic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-yellow-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-yellow-600/[0.05] blur-[120px] pointer-events-none" />

      {/* Grid Pattern Background Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      {/* Header */}
      <header className="relative z-10 border-b border-yellow-500/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 p-[1px] flex items-center justify-center shadow-lg shadow-yellow-500/20">
              {logoUrl ? (
                <img src={logoUrl} alt="SORAT Logo" className="w-full h-full object-cover rounded-[11px]" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
                  <Sun className="text-yellow-400 animate-spin-slow" size={20} />
                </div>
              )}
            </div>
            <div>
              <span className="text-2xl font-black tracking-widest bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">SORAT</span>
              <span className="text-[9px] block text-yellow-500/60 font-bold tracking-[0.3em] uppercase leading-none">OFFICIAL PORTAL</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Servers Active
            </span>
            <button
              onClick={handleOpenDownload}
              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 active:scale-95 text-black text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-yellow-500/10"
            >
              <Smartphone size={14} />
              GET APP
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-20 flex flex-col items-center text-center">
        {/* Large Central Logo */}
        {logoUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-[1.5px] flex items-center justify-center shadow-2xl shadow-yellow-500/20 mb-6"
          >
            <img src={logoUrl} alt="SORAT Logo" className="w-full h-full object-cover rounded-[22px]" referrerPolicy="no-referrer" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 p-[1.5px] flex items-center justify-center shadow-2xl shadow-yellow-500/20 mb-6"
          >
            <div className="w-full h-full bg-black rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <Sun className="text-yellow-400 animate-spin-slow" size={48} />
            </div>
          </motion.div>
        )}

        {/* Elite Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-black uppercase tracking-[0.2em] mb-8"
        >
          <Award size={14} />
          PREMIUM GAMING PORTAL
        </motion.div>

        {/* Cinematic Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-none text-white max-w-5xl uppercase"
        >
          THE ULTIMATE GAME OF <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600 bg-clip-text text-transparent font-black drop-shadow-[0_4px_12px_rgba(251,191,36,0.3)]">
            LUCK & SPEED
          </span>
        </motion.h1>

        {/* Subtitle / Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-8 text-slate-400 text-sm sm:text-lg md:text-xl max-w-2xl leading-relaxed uppercase tracking-wider"
        >
          Welcome to the elite SORAT gaming platform. Enjoy direct secure access, lightning fast deposits, automatic 24/7 instant withdrawals, and real-time live results.
        </motion.p>

        {/* Primary Call To Actions (CTAs) */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-5 w-full max-w-md justify-center"
        >
          {/* Main Download Button */}
          <button
            onClick={handleOpenDownload}
            className="w-full sm:w-auto px-8 py-5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black text-sm font-black uppercase tracking-widest rounded-2xl transition-all duration-300 shadow-xl shadow-yellow-500/10 cursor-pointer flex items-center justify-center gap-2.5 group active:scale-[0.98]"
          >
            <Smartphone size={18} className="group-hover:scale-110 transition-transform" />
            Download Android App
          </button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl"
        >
          {[
            { label: 'ACTIVE PLAYERS', value: '50K+' },
            { label: 'DAILY PAYOUTS', value: '₹25L+' },
            { label: 'WITHDRAW TIME', value: '2 MINS' },
            { label: 'SECURE ENCRYPTION', value: '256-BIT' },
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-950/50 p-6 rounded-2xl border border-yellow-500/5 hover:border-yellow-500/20 transition-all text-center">
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent block">
                {stat.value}
              </span>
              <span className="text-[9px] font-black text-yellow-500 tracking-widest uppercase block mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Feature Grid Section */}
        <section className="mt-32 w-full max-w-6xl">
          <div className="text-center space-y-2 mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">PLATFORM STANDARDS</h2>
            <p className="text-xs text-yellow-500/60 font-bold uppercase tracking-[0.25em]">WHY SORAT IS PREFERRED BY MILLIONS</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              {
                icon: Shield,
                title: 'FULLY CERTIFIED SECURITY',
                desc: 'Integrated with enterprise-grade SSL, private servers, and native database protection to safeguard your gameplay, transactions, and information details.',
              },
              {
                icon: Zap,
                title: 'INSTANT CREDIT & DEPOSIT',
                desc: 'Support for rapid automatic payments, real-time balance updates, and simple payment screenshot confirmations that are verified within seconds.',
              },
              {
                icon: Smartphone,
                title: 'OPTIMIZED MOBILE CLIENT',
                desc: 'Our native Android APK is fine-tuned to load on any mobile hardware without delays, saving battery and data while offering high-fidelity animations.',
              },
            ].map((feat, i) => (
              <div key={i} className="bg-zinc-950 p-8 rounded-3xl border border-yellow-500/5 hover:border-yellow-500/10 transition-all flex flex-col gap-4 relative group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                  <feat.icon size={120} className="text-yellow-500" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                  <feat.icon size={22} />
                </div>
                <h3 className="text-sm font-black text-white tracking-widest uppercase mt-2">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed uppercase">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-yellow-500/10 bg-black/80 py-12 text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <span className="text-lg font-black tracking-widest text-white block">SORAT</span>
            <span className="text-[10px] uppercase tracking-wider block mt-1">© 2026 SORAT Gaming Corporation. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap gap-4 items-center justify-center text-[10px] font-black uppercase tracking-widest">
            <a href="https://play.sorat.in" className="text-slate-400 hover:text-yellow-500 transition-colors">Play Portal</a>
            <span className="text-slate-800">|</span>
            <span className="text-yellow-500">Responsible Gaming</span>
            <span className="text-slate-800">|</span>
            <button 
              onClick={() => setShowExporter(true)}
              className="px-3 py-1 bg-yellow-500/10 hover:bg-yellow-500 hover:text-black border border-yellow-500/20 rounded-full text-yellow-400 font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Download size={10} />
              EXPORT HTML CODE FOR SORAT.IN
            </button>
          </div>
        </div>
      </footer>

      {/* Exporter / Deployment Modal */}
      <AnimatePresence>
        {showExporter && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExporter(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-yellow-500/20 rounded-[32px] w-full max-w-2xl p-8 relative z-10 overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Gold Top Light Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500" />

              <button
                onClick={() => setShowExporter(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">Appwrite Sites / Git Deployment</h3>
                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">Connect and host sorat.in in 3 simple steps</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                    <span className="text-xs font-black text-white uppercase block">Deployment Instructions:</span>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3.5 rounded-xl bg-black border border-white/5 space-y-1.5">
                        <span className="text-yellow-500 text-xs font-black">1. DOWNLOAD CODE</span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-relaxed">
                          Click the download button below to get the fully complete, single-file optimized <span className="text-white">index.html</span> file.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black border border-white/5 space-y-1.5">
                        <span className="text-yellow-500 text-xs font-black">2. PUSH TO REPO</span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-relaxed">
                          Create a new Git repository, add this <span className="text-white">index.html</span> file inside the root folder, and push the repository to GitHub.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-black border border-white/5 space-y-1.5">
                        <span className="text-yellow-500 text-xs font-black">3. CONNECT DOMAIN</span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-relaxed">
                          Connect this GitHub repo to Appwrite Sites or static hosting and point it directly to your main domain <span className="text-white">sorat.in</span>!
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-400 uppercase block">Landing Page Features Pre-bundled:</span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400 uppercase tracking-wide font-bold">
                      <li className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 size={12} /> Yellow & Black Cinematic Design
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 size={12} /> Play on Web (Points to play.sorat.in)
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 size={12} /> Download APK Simulator and Fallback
                      </li>
                      <li className="flex items-center gap-1.5 text-emerald-400">
                        <CheckCircle2 size={12} /> Mobile Adaptive & Touch Targets
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={downloadStandaloneHtml}
                      className="flex-1 py-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download size={16} />
                      Download index.html File
                    </button>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getStandaloneHtmlContent());
                        addNotification?.("HTML Source Code copied to clipboard!", "success");
                      }}
                      className="py-4 px-6 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      Copy Source Code
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* App Download Popup/Modal */}
      <AnimatePresence>
        {showDownloadPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDownloadPopup(false)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 border border-yellow-500/20 rounded-[32px] w-full max-w-md p-8 relative z-10 overflow-hidden shadow-2xl"
            >
              {/* Gold Top Light Bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500" />

              <button
                onClick={() => setShowDownloadPopup(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              {downloadStep === 'idle' && (
                <div className="text-center space-y-6 pt-4">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto">
                    <Download size={32} className="animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">GET SORAT OFFICIAL APK</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider leading-relaxed">
                      Download our lightweight certified mobile app direct on your Android device. Full experience, secure, and lag-free.
                    </p>
                  </div>

                  <button
                    onClick={startDownload}
                    className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest rounded-xl hover:from-yellow-300 hover:to-amber-400 active:scale-95 transition-all cursor-pointer shadow-lg shadow-yellow-500/10"
                  >
                    START SECURE DOWNLOAD
                  </button>

                  <div className="flex justify-center items-center gap-2 text-[10px] font-bold text-yellow-500 uppercase tracking-widest pt-2">
                    <Shield size={12} />
                    Google Play Protect Certified
                  </div>
                </div>
              )}

              {downloadStep === 'generating' && (
                <div className="text-center space-y-6 py-10">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-yellow-500/10 animate-pulse" />
                    <div className="w-12 h-12 rounded-full border-t-2 border-yellow-500 animate-spin" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[9px] font-black tracking-widest uppercase text-yellow-500/60">ESTABLISHING TUNNEL</span>
                    <h3 className="text-base font-black text-white uppercase">GENERATING SECURE LINK...</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      Verifying host & signing credentials. Please wait.
                    </p>
                  </div>
                </div>
              )}

              {downloadStep === 'downloading' && (
                <div className="text-center space-y-6 pt-4">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto">
                    <Smartphone size={32} />
                  </div>
                  <div className="space-y-3">
                    <span className="text-[9px] font-black tracking-widest uppercase text-yellow-500/60">DOWNLOADING IN PROGRESS</span>
                    <h3 className="text-base font-black text-white uppercase">SORAT_V2.0.APK ({downloadProgress}%)</h3>
                    
                    {/* Progress Bar Container */}
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                        initial={{ width: '0%' }}
                        animate={{ width: `${downloadProgress}%` }}
                        transition={{ ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {downloadStep === 'complete' && (
                <div className="text-center space-y-6 pt-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">DOWNLOAD STARTED!</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider leading-relaxed">
                      If the download did not start automatically, please click below to retry the download.
                    </p>
                  </div>

                  <div className="bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/10 text-left space-y-2">
                    <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest block">HOW TO INSTALL:</span>
                    <ol className="text-[9px] text-slate-400 uppercase tracking-wider space-y-1.5 list-decimal list-inside font-bold">
                      <li>Open the downloaded <span className="text-white">Sorat_v2.0.apk</span></li>
                      <li>Allow "Install from Unknown Sources" if prompted</li>
                      <li>Launch Sorat from home screen & sign in!</li>
                    </ol>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={startDownload}
                      className="flex-1 py-3 bg-zinc-900 border border-white/5 hover:bg-zinc-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      RETRY DOWNLOAD
                    </button>
                    <button
                      onClick={() => setShowDownloadPopup(false)}
                      className="flex-1 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                    >
                      DONE
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
