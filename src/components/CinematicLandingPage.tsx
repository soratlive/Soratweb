import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Smartphone, Globe, Shield, Zap, Download, X, ArrowRight, CheckCircle2, Award, Star } from 'lucide-react';

export default function CinematicLandingPage() {
  const [showDownloadPopup, setShowDownloadPopup] = useState(false);
  const [downloadStep, setDownloadStep] = useState<'idle' | 'generating' | 'downloading' | 'complete'>('idle');
  const [downloadProgress, setDownloadProgress] = useState(0);

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
            
            // Actually trigger APK download (we use a generic app package structure or a mock trigger)
            const link = document.createElement('a');
            link.href = '/sorat.apk'; // placeholder or fallback URL
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
              <div className="w-full h-full bg-black rounded-[11px] flex items-center justify-center">
                <Sun className="text-yellow-400 animate-spin-slow" size={20} />
              </div>
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
          किस्मत और रफ़्तार का <br className="hidden md:inline" />
          <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-600 bg-clip-text text-transparent font-black drop-shadow-[0_4px_12px_rgba(251,191,36,0.3)]">
            सर्वश्रेष्ठ खेल
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

          {/* Play on Web Secondary Link */}
          <a
            href="https://play.sorat.in"
            className="w-full sm:w-auto px-8 py-5 bg-white/5 hover:bg-white/10 text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10 hover:border-yellow-500/30 cursor-pointer flex items-center justify-center gap-2"
          >
            <Globe size={18} className="text-yellow-400" />
            Play on Web
            <ArrowRight size={14} className="opacity-60" />
          </a>
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

          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <a href="https://play.sorat.in" className="text-slate-400 hover:text-yellow-500 transition-colors">Play Portal</a>
            <span className="text-slate-800">|</span>
            <span className="text-yellow-500">Responsible Gaming</span>
            <span className="text-slate-800">|</span>
            <span className="text-slate-400">Secure 256-Bit SSL</span>
          </div>
        </div>
      </footer>

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
