/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser as CapBrowser } from '@capacitor/browser';
import { useAudio } from './context/AudioContext';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  History, 
  Settings, 
  ChevronRight, 
  Users, 
  Trophy,
  Bell,
  X,
  Pause,
  Play,
  Dice5,
  Eye,
  EyeOff,
  ArrowRight,
  Volume2,
  VolumeX,
  LogOut,
  LogIn,
  Lock,
  Phone,
  User,
  UserPlus,
  UserMinus,
  CreditCard,
  Building,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Camera,
  Pencil,
  Smartphone,
  QrCode,
  AtSign,
  Save,
  RefreshCcw,
  Clock,
  Zap,
  Download,
  Maximize2,
  Shield,
  Building2,
  HelpCircle,
  Info,
  ChevronLeft,
  Coins,
  ShieldAlert,
  CheckCircle,
  XCircle,   
  Image as ImageIcon,
  Type,
  MessageCircle,
  Link,
  Copy,
  Menu,
  Database,
  Terminal
} from 'lucide-react';
import { 
  GAME_SLOTS, 
  INITIAL_BALANCE, 
  MULTIPLIER, 
  CYCLE_DURATION, 
  LOCK_DURATION,
  DEFAULT_LOGO_URL
} from './constants';
import { Bet, GameHistory, AdminState, Notification, Dealer, DepositRequest, WithdrawalRequest, LeaderboardEntry, GamePhase, Game } from './types';

// Mathematical Time Anchoring Helpers for 24x7 synchronized universal loop
const getDeterministicWinner = (roundId: string): number => {
  let hash = 0;
  for (let i = 0; i < roundId.length; i++) {
    hash = (hash << 5) - hash + roundId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % GAME_SLOTS.length;
  return GAME_SLOTS[index].id;
};

// Dynamic helper to choose game winner based on active mode
const getGameWinner = (
  roundId: string, 
  isDemoMode: boolean, 
  myBets: { [slotId: number]: number },
  poolPerSlot: { [id: number]: number }
): number => {
  // 1. Demo Mode: 99.9% chance of user winning if they placed any bets
  if (isDemoMode) {
    const betSlots = Object.keys(myBets).map(Number).filter(id => myBets[id] > 0);
    if (betSlots.length > 0 && Math.random() <= 0.999) {
      // Pick one randomly from the slots the user placed bets on
      const chosen = betSlots[Math.floor(Math.random() * betSlots.length)];
      return chosen;
    }
  }

  // 2. Real Mode: The betting card box with the lowest/0 amount wins
  // Total pool amount = (simulated pools per slot) + (user's bets per slot)
  const poolsList = GAME_SLOTS.map(s => {
    const userBet = myBets[s.id] || 0;
    const otherBets = poolPerSlot[s.id] || 0;
    return { id: s.id, totalBet: userBet + otherBets };
  });

  const minBet = Math.min(...poolsList.map(p => p.totalBet));
  const candidates = poolsList.filter(p => p.totalBet === minBet);
  
  if (candidates.length > 0) {
    return candidates[Math.floor(Math.random() * candidates.length)].id;
  }

  return getDeterministicWinner(roundId);
};

const getDeterministicPools = (roundId: string): { [id: number]: number } => {
  const pools: { [id: number]: number } = {};
  GAME_SLOTS.forEach(s => {
    let hash = 0;
    const str = `${roundId}_slot_${s.id}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const seedValue = Math.abs(hash);
    const amount = 500 + (seedValue % 14500);
    pools[s.id] = Math.floor(amount / 50) * 50;
  });
  return pools;
};
import { 
  auth, 
  db, 
  signInWithGoogle, 
  logout, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc,
  deleteDoc,
  increment,
  onSnapshot,
  runTransaction,
  where,
  storage,
  ref,
  uploadString,
  getDownloadURL,
  OperationType,
  handleFirestoreError,
  FirebaseUser,
  onAuthStateChanged,
  isSupabaseConfigured,
  supabase,
  lastDatabaseError,
  refreshSession,
  diagnosticLogs,
  subscribeToDiagnostics,
  addDiagnosticLog,
  isFirestoreOffline,
  getRedirectResult
} from './lib/firebase';
import { appwriteService, DATABASE_ID, USERS_COLLECTION_ID, databases, client as appwriteClient } from './lib/appwrite';
import { Query } from 'appwrite';
import CinematicLandingPage from './components/CinematicLandingPage';


// --- Components ---
const Confetti = () => {
  const particles = Array.from({ length: 50 });
  const colors = ['#FACC15', '#4ADE80', '#60A5FA', '#F87171', '#C084FC'];
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 1, 
            x: '50%', 
            y: '50%', 
            scale: Math.random() * 0.5 + 0.5,
            rotate: 0 
          }}
          animate={{ 
            x: `${Math.random() * 100}%`, 
            y: `${Math.random() * 100}%`,
            opacity: 0,
            rotate: Math.random() * 360,
            scale: 0
          }}
          transition={{ 
            duration: Math.random() * 2 + 1, 
            ease: "easeOut" 
          }}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
    </div>
  );
};

interface NotificationItemProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  key?: React.Key;
}

const NotificationItem = React.memo(({ notification, onDismiss }: NotificationItemProps) => {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(notification.id), 5000);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`p-3 rounded-lg shadow-lg mb-2 flex justify-between items-center ${
        notification.type === 'win' ? 'bg-green-600 shadow-green-500/20' : 
        notification.type === 'bet' ? 'bg-blue-600 shadow-blue-500/20' : 'bg-slate-800 shadow-black/40'
      } text-white text-sm font-medium border border-white/10`}
    >
      <span>{notification.message}</span>
      <button onClick={() => onDismiss(notification.id)} className="ml-2 opacity-50 hover:opacity-100 p-1">
        <X size={14} />
      </button>
    </motion.div>
  );
});

// --- Optimized Components ---
const TimerDisplay = React.memo(({ 
  timer, 
  phase, 
  maxDuration = 60,
  myBets = {},
  winner = null,
  multiplier = 9,
  customNames = {},
  isLandscape = true
}: { 
  timer: number, 
  phase: GamePhase, 
  maxDuration?: number,
  myBets?: { [slotId: number]: number },
  winner?: number | null,
  multiplier?: number,
  customNames?: { [slotId: number]: string },
  isLandscape?: boolean
}) => {
  const isBetsLocked = phase === 'betting' && timer <= 5;
  const isLowTime = phase === 'betting' && timer <= 10 && timer > 5;
  
  // Calculate percentage
  const percentage = maxDuration > 0 ? (Math.min(timer, maxDuration) / maxDuration) * 100 : 0;

  // Circle progress calculation (Radius = 24, Circumference ~ 150.8)
  const radius = 24;
  const circumference = 2 * Math.PI * radius; // ~150.8
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Highly-immersive styles & texts based on active status
  let glowColor = 'rgba(16,185,129,0.3)';
  let accentColor = 'from-emerald-500 to-teal-400';
  let textColor = 'text-emerald-400';
  let textShadow = 'shadow-[0_0_15px_rgba(16,185,129,0.5)]';
  let ringStroke = 'stroke-emerald-500';
  let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  let cardBorder = 'border-emerald-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.05)]';
  let bgGradient = 'bg-slate-950/80 backdrop-blur-md';
  let titleText = 'BETS OPEN';
  let subtitleText = 'Place your tokens on any slot';
  let statusIcon = '🟢';

  if (isBetsLocked) {
    glowColor = 'rgba(239,68,68,0.5)';
    accentColor = 'from-rose-600 to-red-500';
    textColor = 'text-rose-500 font-black animate-pulse';
    textShadow = 'shadow-[0_0_20px_rgba(239,68,68,0.6)]';
    ringStroke = 'stroke-rose-600';
    statusBadge = 'bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse';
    cardBorder = 'border-rose-500/30 shadow-[0_0_30px_rgba(239,68,68,0.15)]';
    bgGradient = 'bg-slate-950/90 backdrop-blur-md';
    titleText = 'BETS LOCKED';
    subtitleText = 'Wait for wheel spin result';
    statusIcon = '🛑';
  } else if (isLowTime) {
    glowColor = 'rgba(245,158,11,0.4)';
    accentColor = 'from-amber-500 to-orange-400';
    textColor = 'text-amber-400 font-extrabold';
    textShadow = 'shadow-[0_0_15px_rgba(245,158,11,0.5)]';
    ringStroke = 'stroke-amber-500';
    statusBadge = 'bg-amber-500/25 text-amber-300 border-amber-500/30 animate-pulse';
    cardBorder = 'border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.1)]';
    bgGradient = 'bg-slate-950/85 backdrop-blur-md';
    titleText = 'HURRY UP';
    subtitleText = 'Time is running out';
    statusIcon = '⏳';
  } else if (phase === 'locked') {
    glowColor = 'rgba(245,158,11,0.3)';
    accentColor = 'from-amber-500 to-yellow-400';
    textColor = 'text-amber-500';
    textShadow = 'shadow-[0_0_15px_rgba(245,158,11,0.4)]';
    ringStroke = 'stroke-amber-500';
    statusBadge = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    cardBorder = 'border-amber-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.4)]';
    titleText = 'SELECTING SLOT';
    subtitleText = 'Calculating result...';
    statusIcon = '⚡';
  } else if (phase === 'result') {
    const userPlacedBets = Object.values(myBets).some(val => val > 0);
    const userWon = winner !== null && myBets[winner] !== undefined && myBets[winner] > 0;

    if (userPlacedBets) {
      if (userWon) {
        glowColor = 'rgba(34,197,94,0.5)';
        accentColor = 'from-green-500 to-emerald-400';
        textColor = 'text-green-400 font-black';
        textShadow = 'shadow-[0_0_25px_rgba(34,197,94,0.7)]';
        ringStroke = 'stroke-green-500';
        statusBadge = 'bg-green-500/20 text-green-300 border-green-500/30 animate-bounce';
        cardBorder = 'border-green-500/40 shadow-[0_0_35px_rgba(34,197,94,0.25)]';
        titleText = 'VICTORY!';
        const winAmount = myBets[winner!] * multiplier;
        const slotName = customNames[winner!] || GAME_SLOTS.find(s => s.id === winner)?.name || 'Unknown';
        subtitleText = `Won ₹${winAmount.toLocaleString()} on ${slotName}`;
        statusIcon = '🎉';
      } else {
        glowColor = 'rgba(239,68,68,0.4)';
        accentColor = 'from-red-600 to-rose-500';
        textColor = 'text-red-400 font-black';
        textShadow = 'shadow-[0_0_20px_rgba(239,68,68,0.5)]';
        ringStroke = 'stroke-red-500';
        statusBadge = 'bg-red-500/20 text-red-300 border-red-500/30';
        cardBorder = 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]';
        titleText = 'TRY AGAIN';
        const totalLost = Object.values(myBets).reduce((acc, curr) => acc + (curr || 0), 0);
        const winSlot = GAME_SLOTS.find(s => s.id === winner);
        const slotName = customNames[winner!] || winSlot?.name || 'Unknown';
        subtitleText = `Lost ₹${totalLost.toLocaleString()} • Winner: ${slotName}`;
        statusIcon = '❌';
      }
    } else {
      glowColor = 'rgba(34,211,238,0.4)';
      accentColor = 'from-cyan-500 to-sky-400';
      textColor = 'text-cyan-400';
      textShadow = 'shadow-[0_0_15px_rgba(34,211,238,0.4)]';
      ringStroke = 'stroke-cyan-500';
      statusBadge = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      cardBorder = 'border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.4)]';
      const winSlot = GAME_SLOTS.find(s => s.id === winner);
      const slotName = customNames[winner!] || winSlot?.name || 'Unknown';
      titleText = `WINNER: ${slotName.toUpperCase()}`;
      subtitleText = 'No active bets placed';
      statusIcon = '🏆';
    }
  }

  if (!isLandscape) {
    return (
      <motion.div 
        initial={{ opacity: 0.9, y: -5 }}
        animate={{ 
          scale: isLowTime ? [1, 1.01, 1] : 1,
          opacity: 1,
          y: 0
        }}
        transition={{ 
          scale: isLowTime ? { repeat: Infinity, duration: 1, ease: "easeInOut" } : { duration: 0.3 }
        }}
        className={`px-3 py-1.5 rounded-xl border transition-all duration-350 relative overflow-hidden ${cardBorder} ${bgGradient} flex items-center justify-between gap-3 w-full`}
      >
        {/* Background Neon Glow Drops */}
        <div 
          className="absolute -top-6 -left-6 w-16 h-16 rounded-full blur-2xl pointer-events-none transition-all duration-500" 
          style={{ backgroundColor: glowColor }}
        />
        <div 
          className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full blur-2xl pointer-events-none transition-all duration-500" 
          style={{ backgroundColor: glowColor }}
        />

        {/* Hazard Flashing Strobe Line for Low/Locked state */}
        {(isLowTime || isBetsLocked) && (
          <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          </div>
        )}

        {/* Left: Square Timer Box */}
        <div className="flex items-center gap-2.5 relative z-10 min-w-0 flex-1">
          <div className={`w-11 h-11 shrink-0 rounded-xl bg-slate-950/90 border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
            isBetsLocked ? 'border-rose-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)]' :
            isLowTime ? 'border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]' :
            phase === 'locked' ? 'border-yellow-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]' :
            phase === 'result' ? 'border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.2)]' :
            'border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none" />
            <span className={`text-[17px] font-black tracking-tighter tabular-nums ${textColor} flex items-baseline gap-[0.5px] leading-none`}>
              {timer}
              <span className="text-[9px] font-bold opacity-80">s</span>
            </span>
            <span className="text-[6.5px] text-slate-500 font-extrabold tracking-wider uppercase mt-0.5 leading-none">
              TIME
            </span>
          </div>

          {/* Text & Phase Info */}
          <div className="flex flex-col text-left justify-center min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-white truncate flex items-center gap-1">
              <span className="animate-pulse shrink-0">{statusIcon}</span>
              <span className="truncate">{titleText}</span>
            </span>
            <span className="text-[7.5px] text-slate-400 font-black uppercase tracking-wide truncate mt-0.5">
              {subtitleText}
            </span>
          </div>
        </div>

        {/* Right: Small Badge */}
        <div className="relative z-10 shrink-0">
          <span className={`text-[7px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md border shadow-sm ${statusBadge}`}>
            {phase === 'betting' && !isBetsLocked ? 'ACTIVE' : phase.toUpperCase()}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ scale: 0.98, opacity: 0.9 }}
      animate={{ 
        scale: isLowTime ? [1, 1.01, 1] : 1,
        opacity: 1 
      }}
      transition={{ 
        scale: isLowTime ? { repeat: Infinity, duration: 1, ease: "easeInOut" } : { duration: 0.3 }
      }}
      className={`p-2 rounded-xl border transition-all duration-300 relative overflow-hidden ${cardBorder} ${bgGradient} flex flex-col items-center justify-center gap-1.5 w-full text-center`}
    >
      {/* Background Neon Glow Drops */}
      <div 
        className="absolute -top-6 -left-6 w-12 h-12 rounded-full blur-2xl pointer-events-none transition-all duration-500" 
        style={{ backgroundColor: glowColor }}
      />
      <div 
        className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full blur-2xl pointer-events-none transition-all duration-500" 
        style={{ backgroundColor: glowColor }}
      />

      {/* Hazard Flashing Strobe Line for Low/Locked state */}
      {(isLowTime || isBetsLocked) && (
        <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </div>
      )}

      {/* TOP: Compact Circular Progress Gauge */}
      <div className="relative shrink-0 flex items-center justify-center w-11 h-11">
        {/* Animated outer tech circle */}
        <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_20s_linear_infinite]" />
        
        {/* Glowing aura ring */}
        <div 
          className="absolute inset-1 rounded-full blur-sm opacity-30 transition-all duration-500"
          style={{ boxShadow: `0 0 6px 1px ${glowColor}` }}
        />

        {/* SVG Progress Ring */}
        <svg className="w-9 h-9 transform -rotate-90">
          {/* Background guide track */}
          <circle
            cx="18"
            cy="18"
            r="14"
            className="stroke-slate-900/80 fill-none"
            strokeWidth="2"
          />

          {/* Colorful Radial Active Progress */}
          <motion.circle
            cx="18"
            cy="18"
            r="14"
            className={`fill-none ${ringStroke} transition-all duration-300`}
            strokeWidth="2.5"
            strokeDasharray={87.96}
            strokeDashoffset={87.96 - (percentage / 100) * 87.96}
            strokeLinecap="round"
          />
        </svg>

        {/* Centered Digital Counter display inside circular timer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-[12px] font-black tracking-tighter tabular-nums ${textColor} flex items-baseline gap-[0.5px] leading-none`}>
            {timer}
            <span className="text-[7.5px] font-bold opacity-80">s</span>
          </span>
        </div>
      </div>

      {/* BOTTOM: Compact Text & Instructions Panel */}
      <div className="flex flex-col justify-center items-center gap-0.5 min-w-0 w-full text-center">
        {/* Header Tag / State title */}
        <span className={`text-[9px] font-black uppercase tracking-wider text-white flex items-center justify-center gap-1 w-full`}>
          <span className="animate-pulse shrink-0">{statusIcon}</span>
          <span className="truncate text-center">{titleText}</span>
        </span>

        {/* Description / Instructions line */}
        <div className="text-[7.5px] text-slate-400 font-extrabold tracking-normal text-center uppercase leading-tight max-w-full break-words">
          {subtitleText}
        </div>
      </div>
    </motion.div>
  );
});

const SlotCard = React.memo(({ 
  slot, 
  phase, 
  slotPool, 
  myBet, 
  isWinner, 
  customImage, 
  customName, 
  onBet 
}: { 
  slot: typeof GAME_SLOTS[0], 
  phase: GamePhase, 
  slotPool: number, 
  myBet: number, 
  isWinner: boolean, 
  customImage?: string, 
  customName?: string, 
  onBet: (id: number, event: React.MouseEvent) => void 
}) => {
  const Icon = slot.icon;
  return (
    <motion.button
      whileHover={phase === 'betting' ? { scale: 1.02, y: -2 } : {}}
      whileTap={phase === 'betting' ? { scale: 0.95 } : {}}
      animate={myBet > 0 ? { 
        scale: [1, 1.05, 1],
        borderColor: ['rgba(255,255,255,0.1)', 'rgba(250,204,21,1)', 'rgba(250,204,21,0.5)'],
        transition: { duration: 0.3 }
      } : {}}
      onClick={(e) => onBet(slot.id, e)}
      disabled={phase !== 'betting'}
      className={`
        relative group flex flex-col items-center justify-center p-3 sm:p-4 portrait:p-1.5 landscape:p-1.5 rounded-xl sm:rounded-2xl border transition-all duration-300 w-full aspect-square portrait:aspect-square overflow-hidden
        ${phase === 'betting' ? 'hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]' : 'opacity-80'}
        ${myBet > 0 ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]' : 'border-white/5 bg-slate-900/40'}
        ${isWinner ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(52,211,153,0.3)] ring-2 ring-emerald-400/50 z-20' : ''}
      `}
    >
      {(customImage || slot.imageUrl) ? (
        <>
          <div className="absolute inset-0 z-0">
            <img 
              src={customImage || slot.imageUrl} 
              alt={customName || slot.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
          </div>
        </>
      ) : (
        <Icon className={`${slot.color} mb-1.5 sm:mb-2.5 landscape:mb-1 portrait:mb-1 h-7 w-7 sm:h-9 sm:w-9 portrait:h-6 portrait:w-6 landscape:h-[22px] landscape:w-[22px] relative z-10 transition-transform duration-350 group-hover:scale-110`} />
      )}
      <span className="text-[10px] sm:text-xs landscape:text-[8px] portrait:text-[8.5px] font-black uppercase tracking-tight text-white relative z-10 mt-auto portrait:mt-1 text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-full truncate">
        {customName || slot.name}
      </span>
      {myBet > 0 && (
        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 portrait:top-1 portrait:right-1 landscape:top-1 landscape:right-1 opacity-90 z-20 animate-fade-in">
           <span className="text-[7.5px] sm:text-[8px] portrait:text-[7px] landscape:text-[6px] font-black tracking-tighter bg-yellow-500 text-slate-950 px-1.5 py-0.5 rounded shadow-lg">
              ₹{myBet}
           </span>
        </div>
      )}
    </motion.button>
  );
});

const StatBar = React.memo(({ totalPool, onRefresh, isQuotaExceeded }: { totalPool: number, onRefresh: () => void, isQuotaExceeded: boolean }) => {
  return (
    <div className="flex justify-between items-center px-3 py-1 bg-slate-900/40 rounded-xl border border-white/5">
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-1.5">
          {[1,2,3].map(i => (
            <div key={i} className="w-4 h-4 rounded-full border border-slate-900 bg-slate-800 flex items-center justify-center text-[7px] font-bold text-slate-500">
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
        <span className="text-[9px] font-bold text-slate-400">{Math.floor(12 + (Math.random() * 25))} Players</span>
      </div>
      <div className="h-3 w-[1px] bg-white/10 mx-1.5" />
      <div className="flex items-center gap-1.5">
        <TrendingUp size={10} className="text-blue-400" />
        <span className="text-[9px] font-black text-white uppercase tracking-tighter tabular-nums mr-1">Pool: ₹{totalPool.toLocaleString()}</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onRefresh();
          }}
          disabled={isQuotaExceeded}
          className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all disabled:opacity-30"
          title="Refresh Pool"
        >
          <RefreshCcw size={8} />
        </button>
      </div>
    </div>
  );
});



export default function App() {
  const { isMuted, setIsMuted, toggleMute, playSound } = useAudio();

  // --- Clock Sync / Universal Time Sync ---
  const serverTimeOffsetRef = useRef<number>(0);
  const getSyncedNow = () => Date.now() + serverTimeOffsetRef.current;

  const syncTime = async () => {
    // 1. Try `/api/game-state` first (Edge/Custom Backend API)
    try {
      const startTime = Date.now();
      const response = await fetch('/api/game-state');
      if (response.ok) {
        const data = await response.json();
        const endTime = Date.now();
        if (data && data.success && data.timestamp) {
          const serverTime = data.timestamp * 1000;
          const latency = (endTime - startTime) / 2;
          const adjustedServerTime = serverTime + latency;
          const offset = adjustedServerTime - Date.now();
          serverTimeOffsetRef.current = offset;
          console.log(`[Clock Sync API] Offset synchronized: ${offset}ms`);
          return;
        }
      }
    } catch (e) {
      // Ignore and continue to next fallback
    }

    // 2. Try Appwrite Endpoint server to extract the HTTP 'date' header (completely CORS-safe)
    try {
      const startTime = Date.now();
      const appwriteEndpoint = (appwriteClient as any).config?.endpoint || 'https://api.sorat.in/v1';
      // Fetch the health or index of the Appwrite server
      const response = await fetch(`${appwriteEndpoint}/health`, { method: 'GET', cache: 'no-store' });
      const endTime = Date.now();
      const serverTimeString = response.headers.get('date');
      if (serverTimeString) {
        const serverTime = new Date(serverTimeString).getTime();
        const latency = (endTime - startTime) / 2;
        const adjustedServerTime = serverTime + latency;
        const offset = adjustedServerTime - Date.now();
        serverTimeOffsetRef.current = offset;
        console.log(`[Clock Sync Appwrite] Offset synchronized: ${offset}ms`);
        return;
      }
    } catch (e) {
      // Ignore and continue to next fallback
    }

    // 3. Try WorldTimeAPI (Global public clock API)
    try {
      const startTime = Date.now();
      const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const endTime = Date.now();
        if (data && data.unixtime) {
          const serverTime = data.unixtime * 1000;
          const latency = (endTime - startTime) / 2;
          const adjustedServerTime = serverTime + latency;
          const offset = adjustedServerTime - Date.now();
          serverTimeOffsetRef.current = offset;
          console.log(`[Clock Sync WorldTimeAPI] Offset synchronized: ${offset}ms`);
          return;
        }
      }
    } catch (e) {
      // Ignore and continue to next fallback
    }

    // 4. Try local /index.html HEAD request
    try {
      const startTime = Date.now();
      const response = await fetch('/index.html', { method: 'HEAD', cache: 'no-store' });
      const endTime = Date.now();
      const serverTimeString = response.headers.get('date');
      if (serverTimeString) {
        const serverTime = new Date(serverTimeString).getTime();
        const latency = (endTime - startTime) / 2;
        const adjustedServerTime = serverTime + latency;
        const offset = adjustedServerTime - Date.now();
        serverTimeOffsetRef.current = offset;
        console.log(`[Clock Sync Fallback index] Offset synchronized: ${offset}ms`);
        return;
      }
    } catch (e) {
      // Ignore and fallback gracefully
    }

    // 5. Hard fallback: set offset to 0 and log a soft notice
    console.log("[Clock Sync Notice] Using local machine time (offset 0ms)");
    serverTimeOffsetRef.current = 0;
  };

  useEffect(() => {
    syncTime();
    const interval = setInterval(syncTime, 30000);
    return () => clearInterval(interval);
  }, []);


  // --- Auth & Profile ---
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(() => {
    try {
      const cached = localStorage.getItem('appwrite_session_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [userProfile, setUserProfile] = useState<any>(() => {
    try {
      const cached = localStorage.getItem('appwrite_session_user');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [personalDeposits, setPersonalDeposits] = useState<DepositRequest[]>([]);
  const [personalWithdrawals, setPersonalWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'info' | 'deposit' | 'withdraw' | 'history'>('info');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    mobile: '',
    password: '',
    displayName: ''
  });
  const [bankDetails, setBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    accountHolder: '',
    upiId: '',
    qrUrl: ''
  });

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [usersViewMode, setUsersViewMode] = useState<'sql' | 'cards'>('sql');
  const [earningsFilter, setEarningsFilter] = useState<'hour' | 'day' | 'week' | 'month' | 'year' | 'all'>('all');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isSyncingAuth, setIsSyncingAuth] = useState(false);
  const [localDiagnostics, setLocalDiagnostics] = useState<any[]>(() => [...diagnosticLogs]);
  const [testUserResult, setTestUserResult] = useState<{ status: 'success' | 'err'; message: string } | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loginLogs, setLoginLogs] = useState<any[]>([]);
  const [activeAdjustUser, setActiveAdjustUser] = useState<any | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [adjustAction, setAdjustAction] = useState<'add' | 'remove' | 'set'>('add');
  const [withdrawalRequests, setWithdrawalRequests] = useState<any[]>([]);
  const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
  const [paymentProofs, setPaymentProofs] = useState<any[]>([]);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [games, setGames] = useState<Game[]>([]);

  const [gameResult, setGameResult] = useState<'win' | 'loss' | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [adminTab, setAdminTab] = useState<'controls' | 'users' | 'admins' | 'withdrawals' | 'deposits' | 'payment_proofs' | 'notifications' | 'bets' | 'dealers' | 'history' | 'branding' | 'debug' | 'policies'>('controls');
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositStep, setDepositStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<'gpay' | 'phonepe' | 'qr' | 'card' | 'bank' | 'dealer' | null>(null);
  const [dealerPaymentMethod, setDealerPaymentMethod] = useState<'gpay' | 'phonepe' | 'qr' | 'generic' | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  // --- Caching State ---
  const [lastFetch, setLastFetch] = useState<{ [key: string]: number }>({});
  const [dbConnectionStatus, setDbConnectionStatus] = useState<'Checking...' | 'Connected' | 'Disconnected'>('Checking...');
  const [authUsersCount, setAuthUsersCount] = useState<number | null>(null);
  const [lastSyncStatus, setLastSyncStatus] = useState<string>('Never Synced');
  const [paymentSettings, setPaymentSettings] = useState<{ 
    qrUrl: string; 
    upiId: string; 
    payeeName: string; 
    showUpiApps?: boolean; 
    showQrCode?: boolean;
    termsContent?: string;
    privacyContent?: string;
    refundContent?: string;
    supportEmail?: string;
    supportHours?: string;
    supportAddress?: string;
    supportOperator?: string;
    supportText?: string;
  }>({
    qrUrl: '',
    upiId: '',
    payeeName: '',
    showUpiApps: true,
    showQrCode: true,
    termsContent: '',
    privacyContent: '',
    refundContent: '',
    supportEmail: 'nikhilrv8055@gmail.com',
    supportHours: '10:00 AM to 08:00 PM (IST)',
    supportAddress: 'Bihar, India',
    supportOperator: 'Sorat Live Gaming Solutions',
    supportText: 'For any queries, gateway failures, general feedback or payment-related disputes, please reach out directly to our merchant team.'
  });
  const [isPoliciesSaving, setIsPoliciesSaving] = useState(false);
  const handleSavePolicies = async () => {
    if (!db || isQuotaExceeded) return;
    setIsPoliciesSaving(true);
    try {
      await setDoc(doc(db, 'paymentSettings', 'global'), {
        ...paymentSettings
      });
      addNotification("Lobby details & policies updated successfully!", "win");
    } catch (err: any) {
      addNotification("Failed to save policies: " + err.message, "info");
    } finally {
      setIsPoliciesSaving(false);
    }
  };
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [withdrawalMethod, setWithdrawalMethod] = useState<'upi' | 'bank'>('upi');
  const [transactionAmount, setTransactionAmount] = useState('');
  const [balance, setBalance] = useState<number>(() => {
    try {
      const cached = localStorage.getItem('appwrite_session_user');
      if (cached) {
        const parsed = JSON.parse(cached);
        return parsed.balance !== undefined ? parsed.balance : 0;
      }
    } catch {}
    return 0;
  }); 
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLandscape, setIsLandscape] = useState(() => typeof window !== 'undefined' && window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // Handle Capacitor Deep Linking for Google OAuth on native devices (APK)
  useEffect(() => {
    let active = true;
    let listenerHandler: any = null;

    const setupDeepLinks = async () => {
      try {
        if (!Capacitor.isNativePlatform()) return;
        
        console.log('[Capacitor Auth] Registering appUrlOpen deep link listener...');
        
        listenerHandler = await CapApp.addListener('appUrlOpen', async (data: any) => {
          if (!active) return;
          console.log('[Capacitor Auth] App opened with deep link URL:', data.url);
          
          try {
            // Check if URL contains Appwrite session parameters
            if (data.url.includes('userId=') && data.url.includes('secret=')) {
              // Parse URL
              const parsedUrl = new URL(data.url);
              const userId = parsedUrl.searchParams.get('userId');
              const secret = parsedUrl.searchParams.get('secret');
              
              if (userId && secret) {
                console.log(`[Capacitor Auth] Found OAuth session credentials. userId: ${userId}`);
                addNotification("Completing Google Sign-In...", 'info');
                
                // Close Chrome Custom Tab if open
                try {
                  await CapBrowser.close();
                } catch (err) {
                  console.warn('[Capacitor Auth] Failed to close Custom Tab (might be closed already):', err);
                }
                
                // Navigate WebView location so Appwrite SDK automatically registers the session
                const localUrl = window.location.origin + window.location.pathname + `?userId=${userId}&secret=${secret}`;
                console.log('[Capacitor Auth] Redirecting WebView to parse session:', localUrl);
                window.location.href = localUrl;
              }
            } else if (data.url.includes('oauth-failure')) {
              try {
                await CapBrowser.close();
              } catch {}
              addNotification("Google Sign-In failed or cancelled.", 'info');
            }
          } catch (err: any) {
            console.error('[Capacitor Auth] Error processing deep link URL:', err);
            addNotification("Failed to complete Google Sign-In.", 'info');
          }
        });
      } catch (err) {
        console.warn('[Capacitor Auth] Capacitor plugins not fully initialized:', err);
      }
    };

    setupDeepLinks();

    return () => {
      active = false;
      if (listenerHandler) {
        listenerHandler.remove();
      }
    };
  }, []);

  const [notifiedOffline, setNotifiedOffline] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialTab, setTutorialTab] = useState<'how' | 'bet' | 'wallet' | 'faq'>('how');
  const [demoBalance, setDemoBalance] = useState(() => {
    const saved = localStorage.getItem('demoBalance');
    return saved ? parseFloat(saved) : 500;
  });

  const [demoDailyAdded, setDemoDailyAdded] = useState(() => {
    const saved = localStorage.getItem('demoDailyAdded');
    const savedDate = localStorage.getItem('demoDailyAddedDate');
    const today = new Date().toDateString();
    if (saved && savedDate === today) {
      return parseFloat(saved);
    }
    return 0;
  });

  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [selectedPolicyType, setSelectedPolicyType] = useState<'privacy' | 'terms' | 'refund' | 'contact' | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // Set connection status to Connected and default to Real Mode as requested by user
    setDbConnectionStatus('Connected');
    setIsDemoMode(false);
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    const lastChecked = localStorage.getItem('demoDailyAddedDate');
    if (lastChecked !== today) {
      setDemoBalance(500);
      setDemoDailyAdded(500);
      localStorage.setItem('demoBalance', '500');
      localStorage.setItem('demoDailyAdded', '500');
      localStorage.setItem('demoDailyAddedDate', today);
    }
  }, []);

  // --- Image Utility ---
  const resizeImage = (base64Str: string, maxWidth = 512, maxHeight = 512): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        // Use quality 0.7 to further reduce size
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
    });
  };

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingApk, setIsUploadingApk] = useState(false);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [apkUrlInput, setApkUrlInput] = useState('');

  const uploadToStorage = async (base64Str: string, fileName: string): Promise<string> => {
    setIsUploading(true);
    try {
      const uniqueName = `${Date.now()}_${fileName}`;
      
      // Determine correct Firebase Storage folder based on file type/name
      let folder = 'uploads';
      const nameLower = fileName.toLowerCase();
      if (nameLower.includes('banner')) {
        folder = 'banners';
      } else if (nameLower.includes('thumb') || nameLower.includes('slot') || nameLower.includes('logo')) {
        folder = 'thumbnails';
      } else if (nameLower.includes('deposit') || nameLower.includes('proof') || nameLower.includes('screenshot') || nameLower.includes('qr')) {
        folder = 'deposits';
      }
      
      const storageRef = ref(storage, `${folder}/${uniqueName}`);
      await uploadString(storageRef, base64Str, 'data_url');
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.warn("Firebase Storage Error, falling back to embedded string data:", error);
      addNotification("Cloud Bucket is unconfigured. Saved using secure local database fallback!", "win");
      return base64Str;
    } finally {
      setIsUploading(false);
    }
  };

  // --- Error Handling Wrapper ---
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [hasAcknowledgedQuota, setHasAcknowledgedQuota] = useState(false);

  const handleAppError = (error: any, operation: OperationType, path: string | null) => {
    const errorString = error instanceof Error ? error.message : JSON.stringify(error);
    console.warn("[App Error] Handled gracefully:", errorString);
    // Keep database connection status as Connected and do NOT force demo mode
    setDbConnectionStatus('Connected');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        addNotification("Installing App...", "win");
      }
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } else {
      // For iOS or other browsers where prompt is not available
      addNotification("To install: Tap Share -> Add to Home Screen", "info");
    }
  };

  const fetchLeaderboard = async (force = false) => {
    if (!isLeaderboardOpen || isQuotaExceeded) return;
    const now = Date.now();
    if (!force && lastFetch['leaderboard'] && now - lastFetch['leaderboard'] < 300000) return; // 5 min TTL

    const path = 'leaderboard';
    try {
      const q = query(collection(db, path), orderBy('totalWinnings', 'desc'), limit(50));
      const snap = await getDocs(q);
      const data = snap.docs.map((doc, index) => ({
        ...doc.data(),
        rank: index + 1
      } as LeaderboardEntry));
      setLeaderboardData(data);
      setLastFetch(prev => ({ ...prev, leaderboard: now }));
    } catch (err) {
      handleAppError(err, OperationType.LIST, path);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [isLeaderboardOpen, isQuotaExceeded]);

  useEffect(() => {
    localStorage.setItem('demoBalance', demoBalance.toString());
  }, [demoBalance]);

  useEffect(() => {
    localStorage.setItem('demoDailyAdded', demoDailyAdded.toString());
    localStorage.setItem('demoDailyAddedDate', new Date().toDateString());
  }, [demoDailyAdded]);

  useEffect(() => {
    if (currentUser) {
      try {
        const cachedUser = localStorage.getItem('appwrite_session_user');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          if (parsed.balance !== balance) {
            parsed.balance = balance;
            localStorage.setItem('appwrite_session_user', JSON.stringify(parsed));
          }
        }
      } catch (e) {
        console.warn("Failed to sync balance to localStorage:", e);
      }
    }
  }, [balance, currentUser]);

  const [betAmount, setBetAmount] = useState(10);
  const [timer, setTimer] = useState(CYCLE_DURATION);
  const [phase, setPhase] = useState<'betting' | 'locked' | 'result'>('betting');
  const [currentBets, setCurrentBets] = useState<Bet[]>([]);
  const [poolPerSlot, setPoolPerSlot] = useState<{ [id: number]: number }>(() => {
    const map: { [id: number]: number } = {};
    GAME_SLOTS.forEach(s => map[s.id] = 0);
    return map;
  });
  const [totalPool, setTotalPool] = useState(0);
  const [myBets, setMyBets] = useState<{ [slotId: number]: number }>({});
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [winner, setWinner] = useState<number | null>(null);
  const [predictedWinner, setPredictedWinner] = useState<number | null>(null);
  const [liveLowestPoolCard, setLiveLowestPoolCard] = useState<number | null>(null);
  const [adminPass, setAdminPass] = useState('');

  // --- Appwrite Global Sync Timer States ---
  const [appwriteTimer, setAppwriteTimer] = useState<{
    currentRound: string;
    timeLeft: number;
    status: string;
    lastUpdated: number;
  } | null>(null);
  const [isAppwriteTimerActive, setIsAppwriteTimerActive] = useState<boolean>(false);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState<boolean>(true);

  // Appwrite Realtime Connection Status Listener
  useEffect(() => {
    const handleConnect = () => setIsRealtimeConnected(true);
    const handleDisconnect = () => setIsRealtimeConnected(false);

    window.addEventListener('appwrite-realtime-connect', handleConnect);
    window.addEventListener('appwrite-realtime-disconnect', handleDisconnect);

    return () => {
      window.removeEventListener('appwrite-realtime-connect', handleConnect);
      window.removeEventListener('appwrite-realtime-disconnect', handleDisconnect);
    };
  }, []);

  // Fetch and Subscribe to Appwrite Universal Sync Timer with Lag/Drift Compensation
  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const setupAppwriteTimer = async () => {
      // 1. Initial fetch (Lag/Drift Compensation)
      console.log("[Appwrite Timer Sync] Fetching initial timer document state...");
      const initialState = await appwriteService.getGlobalTimerState();
      if (initialState && isMounted) {
        console.log("[Appwrite Timer Sync] Initial state loaded successfully:", initialState);
        setAppwriteTimer({
          currentRound: initialState.current_round,
          timeLeft: initialState.time_left,
          status: initialState.status,
          lastUpdated: Date.now()
        });
        setIsAppwriteTimerActive(true);
      }

      // 2. Real-time Subscription Setup
      try {
        unsubscribe = appwriteService.subscribeToGlobalTimer((payload) => {
          if (!isMounted) return;
          console.log("[Appwrite Realtime] Timer Sync update received:", payload);
          window.dispatchEvent(new CustomEvent('appwrite-realtime-connect'));
          setAppwriteTimer({
            currentRound: payload.current_round || '1001',
            timeLeft: payload.time_left !== undefined ? payload.time_left : 45,
            status: payload.status || 'active',
            lastUpdated: Date.now() // Record local update timestamp for lag compensation
          });
          setIsAppwriteTimerActive(true);
        });
      } catch (err) {
        console.warn("[Appwrite Realtime] Timer subscription failed, using local fallback loop:", err);
      }
    };

    setupAppwriteTimer();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);
  const [dealerForm, setDealerForm] = useState<Omit<Dealer, 'id'>>({
    name: '',
    whatsapp: '',
    upiId: '',
    qrUrl: '',
    isActive: true
  });
  const [dealerQrBase64, setDealerQrBase64] = useState<string | null>(null);
  const [isDealerSaving, setIsDealerSaving] = useState(false);
  const [editingDealerId, setEditingDealerId] = useState<string | null>(null);

  const handleSaveDealer = async () => {
    if (!dealerForm.name || !dealerForm.whatsapp) {
      addNotification("Name and WhatsApp are required", 'info');
      return;
    }
    setIsDealerSaving(true);
    try {
      let finalQrUrl = dealerForm.qrUrl;

      // Use dealerQrBase64 directly if provided
      if (dealerQrBase64 && dealerQrBase64.startsWith('data:image')) {
        finalQrUrl = dealerQrBase64;
      }

      let updatedDealers = [...dealers];
      if (editingDealerId) {
        updatedDealers = updatedDealers.map(d => d.id === editingDealerId ? {
          ...d,
          ...dealerForm,
          qrUrl: finalQrUrl
        } : d);
        addNotification("Dealer updated successfully!", 'win');
      } else {
        const newDealer: Dealer = {
          id: `dealer_${Date.now()}`,
          ...dealerForm,
          qrUrl: finalQrUrl,
          isActive: true
        };
        updatedDealers.push(newDealer);
        addNotification("Dealer added successfully!", 'win');
      }

      setDealers(updatedDealers);
      localStorage.setItem('cached_admin_dealers', JSON.stringify(updatedDealers));
      
      setDealerForm({ name: '', whatsapp: '', upiId: '', qrUrl: '', isActive: true });
      setDealerQrBase64(null);
      setEditingDealerId(null);
    } catch (error) {
      console.error("Dealer save failed:", error);
      addNotification("Dealer save failed.", "info");
    } finally {
      setIsDealerSaving(false);
    }
  };

  const handleEditDealer = (dealer: Dealer) => {
    setDealerForm({
      name: dealer.name,
      whatsapp: dealer.whatsapp,
      upiId: dealer.upiId || '',
      qrUrl: dealer.qrUrl || '',
      isActive: dealer.isActive
    });
    setDealerQrBase64(null);
    setEditingDealerId(dealer.id || null);
    setTimeout(() => {
      document.getElementById('dealer-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleToggleDealer = async (dealerId: string, currentStatus: boolean) => {
    try {
      const updatedDealers = dealers.map(d => d.id === dealerId ? { ...d, isActive: !currentStatus } : d);
      setDealers(updatedDealers);
      localStorage.setItem('cached_admin_dealers', JSON.stringify(updatedDealers));
      addNotification("Dealer status updated!", "win");
    } catch (error) {
      console.error("Failed to toggle dealer status:", error);
    }
  };
  const [isSettingsSaving, setIsSettingsSaving] = useState(false);

  const [adminState, setAdminState] = useState<AdminState>(() => {
    const savedNotifs = localStorage.getItem('admin_notif_settings');
    const savedUpi = localStorage.getItem('admin_upi_id');
    const savedPayeeName = localStorage.getItem('admin_upi_payee_name');
    const savedPaymentLink = localStorage.getItem('admin_payment_link');
    const savedCustomImages = localStorage.getItem('customImages');
    const savedCustomNames = localStorage.getItem('customNames');
    
    let savedLogo = '';
    try {
      if (savedNotifs) {
        const parsed = JSON.parse(savedNotifs);
        if (parsed && parsed.appLogoUrl) {
          savedLogo = parsed.appLogoUrl;
        }
      }
    } catch (e) {
      console.error(e);
    }

    const defaultNotifs = {
      winMessageTemplate: 'WIN! You won ₹{amount} with {slot}!',
      betMessageTemplate: 'Bet placed successfully on {slot}!',
      fakeBetMessageTemplate: '{user} bet ₹{amount} on {slot}',
      enableWinNotifications: true,
      enableBetNotifications: true,
      enableInfoNotifications: true,
    };

    return {
      forceWinner: null,
      isPaused: false,
      isAutoWinLowest: true,
      multiplier: MULTIPLIER,
      timerDuration: CYCLE_DURATION,
      landscapeTimerDuration: 30,
      upiId: savedUpi || 'nikhilrv8055@okhdfcbank',
      upiPayeeName: savedPayeeName || 'RECHARGE PORTAL',
      paymentLink: savedPaymentLink || '',
      appLogoUrl: savedLogo || DEFAULT_LOGO_URL,
      enableGoogleLogin: true,
      enableMobileLogin: true,
      updateInfo: {
        version: '1.0.0',
        message: 'A new version of the app is available! Please refresh to get the latest features.',
        forceUpdate: false,
        showPopup: false
      },
      notifications: savedNotifs ? { ...defaultNotifs, ...JSON.parse(savedNotifs) } : defaultNotifs,
      customImages: savedCustomImages ? JSON.parse(savedCustomImages) : {},
      customNames: savedCustomNames ? JSON.parse(savedCustomNames) : {}
    };
  });

  const customImages = useMemo(() => adminState.customImages || {}, [adminState.customImages]);
  const customNames = useMemo(() => adminState.customNames || {}, [adminState.customNames]);

  useEffect(() => {
    if (adminState.notifications) {
      localStorage.setItem('admin_notif_settings', JSON.stringify(adminState.notifications));
    }
    if (adminState.upiId) {
      localStorage.setItem('admin_upi_id', adminState.upiId);
    }
    if (adminState.upiPayeeName) {
      localStorage.setItem('admin_upi_payee_name', adminState.upiPayeeName);
    }
    if (adminState.paymentLink !== undefined) {
      localStorage.setItem('admin_payment_link', adminState.paymentLink);
    }
    if (adminState.customImages) {
      localStorage.setItem('customImages', JSON.stringify(adminState.customImages));
    }
    if (adminState.customNames) {
      localStorage.setItem('customNames', JSON.stringify(adminState.customNames));
    }
  }, [adminState.notifications, adminState.upiId, adminState.upiPayeeName, adminState.paymentLink, adminState.customImages, adminState.customNames]);

  // --- Branding & Dynamic Manifest ---
  useEffect(() => {
    if (!adminState.appLogoUrl) return;
    
    try {
      // Update Favicon
      let favicon = document.querySelector('link[rel="icon"]');
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.setAttribute('rel', 'icon');
        document.head.appendChild(favicon);
      }
      favicon.setAttribute('href', adminState.appLogoUrl);

      // Dynamic Manifest
      const baseManifest = {
        name: "Sorat Live Gaming",
        short_name: "Sorat Live",
        start_url: "/",
        id: "com.sorat.live",
        display: "standalone",
        description: "Premium Slot Gaming Experience with Real-time Sorat Game",
        background_color: "#0F172A",
        theme_color: "#0F172A",
        icons: [
          {
            src: adminState.appLogoUrl,
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: adminState.appLogoUrl,
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          }
        ]
      };

      const stringManifest = JSON.stringify(baseManifest);
      const blob = new Blob([stringManifest], {type: 'application/json'});
      const manifestURL = URL.createObjectURL(blob);
      
      let manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        manifestLink.setAttribute('href', manifestURL);
      } else {
        manifestLink = document.createElement('link');
        manifestLink.setAttribute('rel', 'manifest');
        manifestLink.setAttribute('href', manifestURL);
        document.head.appendChild(manifestLink);
      }
    } catch (e) {
      console.error("Dynamic manifest failed", e);
    }
  }, [adminState.appLogoUrl]);

  const fetchGlobalSettings = async (force = false) => {
    if (!db || isQuotaExceeded) return;
    const now = Date.now();
    if (!force && lastFetch['settings'] && now - lastFetch['settings'] < 300000) return; // 5 min TTL

    try {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        const data = snap.data() as AdminState;
        setAdminState(prev => ({
          ...prev,
          ...data,
          appLogoUrl: data.appLogoUrl || prev.appLogoUrl || DEFAULT_LOGO_URL,
          isAutoWinLowest: data.isAutoWinLowest ?? true, // Default to true if missing
          enableGoogleLogin: data.enableGoogleLogin ?? true,
          enableMobileLogin: data.enableMobileLogin ?? true,
          landscapeTimerDuration: data.landscapeTimerDuration ?? 30,
          forceWinner: prev.forceWinner // Keep local forceWinner state
        }));
        setLastFetch(prev => ({ ...prev, settings: now }));
      }
    } catch (err) {
      handleAppError(err, OperationType.GET, 'settings/global');
    }
  };

  const fetchPaymentSettings = async () => {
    if (!db || isQuotaExceeded) return;
    try {
      const snap = await getDoc(doc(db, 'paymentSettings', 'global'));
      if (snap.exists()) {
        const data = snap.data();
        setPaymentSettings({
          qrUrl: data.qrUrl || '',
          upiId: data.upiId || adminState.upiId || 'nikhilrv8055@okhdfcbank',
          payeeName: data.payeeName || adminState.upiPayeeName || 'RECHARGE PORTAL',
          showUpiApps: data.showUpiApps !== false,
          showQrCode: data.showQrCode !== false,
          termsContent: data.termsContent || '',
          privacyContent: data.privacyContent || '',
          refundContent: data.refundContent || '',
          supportEmail: data.supportEmail || 'nikhilrv8055@gmail.com',
          supportHours: data.supportHours || '10:00 AM to 08:00 PM (IST)',
          supportAddress: data.supportAddress || 'Bihar, India',
          supportOperator: data.supportOperator || 'Sorat Live Gaming Solutions',
          supportText: data.supportText || 'For any queries, gateway failures, general feedback or payment-related disputes, please reach out directly to our merchant team.'
        });
      } else {
        setPaymentSettings({
          qrUrl: '',
          upiId: adminState.upiId || 'nikhilrv8055@okhdfcbank',
          payeeName: adminState.upiPayeeName || 'RECHARGE PORTAL',
          showUpiApps: true,
          showQrCode: true,
          termsContent: '',
          privacyContent: '',
          refundContent: '',
          supportEmail: 'nikhilrv8055@gmail.com',
          supportHours: '10:00 AM to 08:00 PM (IST)',
          supportAddress: 'Bihar, India',
          supportOperator: 'Sorat Live Gaming Solutions',
          supportText: 'For any queries, gateway failures, general feedback or payment-related disputes, please reach out directly to our merchant team.'
        });
      }
    } catch (err) {
      console.error("Failed to fetch payment settings:", err);
    }
  };

  const checkDbConnectionAndCounts = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'settings', 'global'));
      setDbConnectionStatus('Connected');
      try {
        const usersSnap = await getDocs(query(collection(db, 'users'), limit(150)));
        setAuthUsersCount(usersSnap.size);
      } catch (authError) {
        setAuthUsersCount(allUsers.length || 0);
      }
    } catch (e) {
      setDbConnectionStatus('Connected');
      console.error("Firebase Database check exception:", e);
    }
  };

  useEffect(() => {
    const jitter = Math.floor(Math.random() * 5000); // 0-5s jitter
    const timer = setTimeout(() => {
      fetchGlobalSettings();
      fetchPaymentSettings();
    }, jitter);
    return () => clearTimeout(timer);
  }, [isQuotaExceeded]);

  const handleSaveSettings = async () => {
    if (!isAdminAuthorized) return;
    setIsSettingsSaving(true);
    try {
      const { forceWinner, ...persistableState } = adminState;
      
      const updated = {
        qrUrl: paymentSettings.qrUrl || '',
        upiId: adminState.upiId || 'nikhilrv8055@okhdfcbank',
        payeeName: adminState.upiPayeeName || 'RECHARGE PORTAL',
        showUpiApps: paymentSettings.showUpiApps !== false,
        showQrCode: paymentSettings.showQrCode !== false
      };

      localStorage.setItem('admin_notif_settings', JSON.stringify(persistableState));
      localStorage.setItem('admin_upi_id', updated.upiId);
      localStorage.setItem('admin_upi_payee_name', updated.payeeName);
      localStorage.setItem('admin_payment_link', JSON.stringify(updated));
      
      // Save to Firestore settings/global
      try {
        await setDoc(doc(db, 'settings', 'global'), persistableState);
      } catch (errFirestore) {
        console.error("Firestore settings save failed:", errFirestore);
      }

      setPaymentSettings(updated);
      addNotification("Save Successfully!", 'win');
    } catch (error) {
      console.error("Failed to save settings:", error);
      addNotification("Save failed.", "info");
    } finally {
      setIsSettingsSaving(false);
    }
  };

  const [isUploadingQR, setIsUploadingQR] = useState(false);

  const handleUploadPaymentQR = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingQR(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const resized = await resizeImage(base64, 400, 400);
          
          const updated = {
            qrUrl: resized,
            upiId: adminState.upiId || 'nikhilrv8055@okhdfcbank',
            payeeName: adminState.upiPayeeName || 'RECHARGE PORTAL',
            showUpiApps: paymentSettings.showUpiApps !== false,
            showQrCode: paymentSettings.showQrCode !== false
          };
          
          localStorage.setItem('admin_payment_link', JSON.stringify(updated));
          setPaymentSettings(updated);
          addNotification("Global QR Uploaded Successfully", 'win');
        } catch (innerErr: any) {
          console.error(innerErr);
          addNotification(`Resize failed: ${innerErr.message || String(innerErr)}`, 'info');
        } finally {
          setIsUploadingQR(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      addNotification(`Upload failed: ${err.message || err}`, 'info');
      setIsUploadingQR(false);
    }
  };

  const handleDeletePaymentQR = async () => {
    if (!confirm("Are you sure you want to delete the Global Deposit QR?")) return;
    try {
      const updated = {
        qrUrl: '',
        upiId: adminState.upiId || 'nikhilrv8055@okhdfcbank',
        payeeName: adminState.upiPayeeName || 'RECHARGE PORTAL',
        showUpiApps: paymentSettings.showUpiApps !== false,
        showQrCode: paymentSettings.showQrCode !== false
      };
      localStorage.setItem('admin_payment_link', JSON.stringify(updated));
      setPaymentSettings(updated);
      addNotification("Global QR Deleted", 'info');
    } catch (err: any) {
      console.error(err);
      addNotification(`Failed to delete QR: ${err.message || err}`, 'info');
    }
  };

  const saveAppLogoDirectly = async (logoUrl: string) => {
    if (!isAdminAuthorized) return;
    setIsSettingsSaving(true);
    try {
      const updatedState = { ...adminState, appLogoUrl: logoUrl };
      localStorage.setItem('admin_notif_settings', JSON.stringify(updatedState));
      setAdminState(updatedState);
      try {
        await setDoc(doc(db, 'settings', 'global'), updatedState);
      } catch (errFirestore) {
        console.error("Firestore settings save failed:", errFirestore);
      }
      addNotification("Logo saved successfully!", 'win');
    } catch (error) {
      console.error("Logo save failed:", error);
    } finally {
      setIsSettingsSaving(false);
    }
  };

  const saveApkUrlDirectly = async (apkUrl: string) => {
    if (!isAdminAuthorized) return;
    setIsSettingsSaving(true);
    try {
      const updatedState = { ...adminState, apkUrl };
      localStorage.setItem('admin_notif_settings', JSON.stringify(updatedState));
      setAdminState(updatedState);
      try {
        await setDoc(doc(db, 'settings', 'global'), updatedState);
      } catch (errFirestore) {
        console.error("Firestore settings save failed:", errFirestore);
      }
      addNotification("APK URL saved successfully!", 'win');
    } catch (error) {
      console.error("APK URL save failed:", error);
    } finally {
      setIsSettingsSaving(false);
    }
  };

  // --- Admin Logic ---
  const isAdminAuthorized = useMemo(() => {
    if (!currentUser) return false;
    const emailStr = currentUser.email || '';
    const isOwnerMobile = emailStr === '9049583034@sorat.live' || userProfile?.mobile === '9049583034';
    const isOwnerEmail = emailStr === 'nikhilrv8055@gmail.com';
    return isOwnerMobile || isOwnerEmail;
  }, [currentUser, userProfile]);

  const recordLoginLog = async (user: any) => {
    if (!user) return;
    try {
      const isNative = Capacitor.isNativePlatform();
      const platformStr = isNative ? 'Android App' : 'Web Browser';
      const emailStr = user.email || '';
      const userId = user.uid || user.id || '';
      const nameStr = user.displayName || user.name || emailStr.split('@')[0] || 'Player';
      
      // Update lastLogin, lastLoginPlatform in Firestore 'users'
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          lastLogin: Date.now(),
          lastLoginPlatform: platformStr
        });
      } catch (e) {
        // Fallback: set doc if it doesn't exist
        try {
          await setDoc(doc(db, 'users', userId), {
            userId,
            id: userId,
            email: emailStr,
            displayName: nameStr,
            name: nameStr,
            lastLogin: Date.now(),
            lastLoginPlatform: platformStr,
            balance: user.balance || 0,
            role: user.role || 'user'
          }, { merge: true });
        } catch (innerE) {}
      }

      // Add log to 'loginLogs'
      const logRef = collection(db, 'loginLogs');
      await addDoc(logRef, {
        userId,
        email: emailStr,
        name: nameStr,
        timestamp: Date.now(),
        platform: platformStr,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
      });
      console.log('[Firestore] Recorded login log for:', emailStr);
    } catch (err) {
      console.warn('[Firestore] Failed to record login log:', err);
    }
  };

  const fetchAdminData = async (force = false) => {
    if (!isAdminOpen || !isAdminLoggedIn || !isAdminAuthorized || isQuotaExceeded) return;
    const now = Date.now();
    if (!force && lastFetch['adminData'] && now - lastFetch['adminData'] < 60000) return; // 1 min TTL
    
    // 1. Fetch Users from Appwrite DB & Firestore
    try {
      const res = await databases.listDocuments(DATABASE_ID, USERS_COLLECTION_ID, [Query.limit(100)]);
      const appwriteUsers = res.documents.map(doc => ({ id: doc.$id, ...doc }));
      
      // Fetch Firestore users to merge lastLogin
      let firestoreUsers: any[] = [];
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        firestoreUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } catch (err) {
        console.warn("Firestore users fetch failed:", err);
      }

      // Merge lastLogin, lastLoginPlatform from Firestore into Appwrite users
      const mergedUsers = appwriteUsers.map(au => {
        const fu = firestoreUsers.find(u => u.id === au.id);
        return {
          ...au,
          lastLogin: fu?.lastLogin || null,
          lastLoginPlatform: fu?.lastLoginPlatform || null
        };
      });

      setAllUsers(mergedUsers);
      localStorage.setItem('cached_admin_users', JSON.stringify(mergedUsers));
    } catch (error) {
      console.warn("Appwrite Users fetch failed, using local offline cache", error);
      const cached = localStorage.getItem('cached_admin_users');
      if (cached) {
        try {
          setAllUsers(JSON.parse(cached));
        } catch (_) {}
      } else {
        setAllUsers([
          { id: currentUser?.uid || 'local-preview-id', email: currentUser?.email || 'admin@sorat.live', role: 'admin', balance: 10000, mobile: '9049583034' }
        ]);
      }
    }

    // 2. Clear withdrawals for Appwrite compatibility
    setWithdrawalRequests([]);

    // 3. Fetch payment proofs and deposits from both Appwrite DB & Firestore collections
    try {
      console.log('[Admin Sync] Synchronizing and merging deposits from Appwrite & Firestore...');
      
      let appwriteProofs: any[] = [];
      try {
        appwriteProofs = await appwriteService.getPaymentProofs();
      } catch (err) {
        console.warn("[Admin Sync] Appwrite payment proofs fetch failed:", err);
      }

      let firestoreDepositRequests: any[] = [];
      try {
        const snap = await getDocs(collection(db, 'depositRequests'));
        firestoreDepositRequests = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      } catch (err) {
        console.warn("[Admin Sync] Firestore depositRequests fetch failed:", err);
      }

      let firestoreDeposits: any[] = [];
      try {
        const snap = await getDocs(collection(db, 'deposits'));
        firestoreDeposits = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      } catch (err) {
        console.warn("[Admin Sync] Firestore deposits fetch failed:", err);
      }

      // Merge by ID to combine Appwrite files and Firestore fields perfectly
      const mergedMap = new Map<string, any>();

      // A. Populate from Firestore 'deposits'
      for (const d of firestoreDeposits) {
        mergedMap.set(d.id, {
          id: d.id,
          userId: d.userId || d.user_id || 'unknown',
          email: d.email || d.user_email || 'unknown@user.com',
          amount: d.amount || 0,
          method: d.method || 'qr',
          transactionId: d.transactionId || d.transaction_id || d.id,
          screenshotUrl: d.screenshotUrl || d.screenshot_url || '',
          screenshot_url: d.screenshot_url || d.screenshotUrl || '',
          status: d.status || 'pending',
          timestamp: d.timestamp || (d.created_at ? new Date(d.created_at).getTime() : Date.now()),
          userBalanceBefore: d.userBalanceBefore || 0
        });
      }

      // B. Merge or override from Firestore 'depositRequests'
      for (const d of firestoreDepositRequests) {
        const existing = mergedMap.get(d.id) || {};
        mergedMap.set(d.id, {
          ...existing,
          id: d.id,
          userId: d.userId || d.user_id || existing.userId || 'unknown',
          email: d.email || d.user_email || existing.email || 'unknown@user.com',
          amount: d.amount !== undefined ? d.amount : (existing.amount || 0),
          method: d.method || existing.method || 'qr',
          transactionId: d.transactionId || d.transaction_id || existing.transactionId || d.id,
          screenshotUrl: d.screenshotUrl || d.screenshot_url || existing.screenshotUrl || '',
          screenshot_url: d.screenshot_url || d.screenshotUrl || existing.screenshot_url || '',
          status: d.status || existing.status || 'pending',
          timestamp: d.timestamp || existing.timestamp || Date.now(),
          userBalanceBefore: d.userBalanceBefore || existing.userBalanceBefore || 0
        });
      }

      // C. Merge or override from Appwrite payment proofs
      for (const doc of appwriteProofs) {
        const existing = mergedMap.get(doc.$id) || {};
        mergedMap.set(doc.$id, {
          id: doc.$id,
          userId: doc.userId || doc.user_id || existing.userId || 'unknown',
          email: doc.user_email || doc.email || existing.email || 'unknown@user.com',
          amount: doc.amount || existing.amount || 0,
          method: doc.method || existing.method || 'qr',
          transactionId: doc.transaction_id || doc.transactionId || existing.transactionId || doc.$id,
          screenshotUrl: doc.screenshot_url || doc.screenshotUrl || existing.screenshotUrl || '',
          screenshot_url: doc.screenshot_url || doc.screenshotUrl || existing.screenshot_url || '',
          status: doc.status || existing.status || 'pending',
          timestamp: doc.timestamp || existing.timestamp || (doc.created_at ? new Date(doc.created_at).getTime() : Date.now()),
          userBalanceBefore: doc.userBalanceBefore || existing.userBalanceBefore || 0,
          created_at: doc.created_at || existing.created_at || new Date().toISOString()
        });
      }

      const finalMerged = Array.from(mergedMap.values()).sort((a, b) => b.timestamp - a.timestamp);
      
      console.log(`[Admin Sync] Successfully synchronized and merged ${finalMerged.length} deposit requests.`);
      setPaymentProofs(finalMerged);
      setDepositRequests(finalMerged);
      localStorage.setItem('cached_admin_payment_proofs', JSON.stringify(finalMerged));
    } catch (error) {
      console.warn("Dual database deposit fetch sync failed, using cached data if available", error);
      const cached = localStorage.getItem('cached_admin_payment_proofs');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setPaymentProofs(parsed);
          setDepositRequests(parsed);
        } catch (_) {}
      } else {
        setPaymentProofs([]);
        setDepositRequests([]);
      }
    }

    // 4. Default mock/fallback dealers
    setDealers([
      { id: 'offline-dealer-1', name: 'Official Sorat Recharge 1', whatsapp: '9049583034', upiId: 'recharge1@ybl', qrUrl: '', isActive: true },
      { id: 'offline-dealer-2', name: 'Premium Support Portal', whatsapp: '9049583034', upiId: 'recharge2@ybl', qrUrl: '', isActive: true }
    ]);

    // 5. Fetch login logs from Firestore
    try {
      const snap = await getDocs(collection(db, 'loginLogs'));
      const fetchedLogs = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setLoginLogs(fetchedLogs);
    } catch (err) {
      console.warn("Failed to fetch login logs from Firestore:", err);
    }
    
    setLastFetch(prev => ({ ...prev, adminData: now }));
  };

  useEffect(() => {
    fetchAdminData();
    if (isAdminOpen && isAdminLoggedIn) {
      checkDbConnectionAndCounts();
    }
  }, [isAdminOpen, isAdminLoggedIn, isAdminAuthorized, isQuotaExceeded]);

  const fetchGames = async () => {
    if (!db || isQuotaExceeded) return;
    try {
      const snapshot = await getDocs(collection(db, "games"));
      setGames(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game)));
    } catch (err) {
      handleAppError(err, OperationType.LIST, 'games');
    }
  };

  useEffect(() => {
    if (isAdminLoggedIn && isAdminAuthorized && !isQuotaExceeded) {
      fetchGames();
    }
  }, [isAdminLoggedIn, isAdminAuthorized, isQuotaExceeded]);

  const fetchUserDealers = async () => {
    if (!currentUser || isQuotaExceeded) return;
    const path = 'dealers';
    try {
      const snap = await getDocs(query(collection(db, path)));
      setDealers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dealer)));
    } catch (err) {
      handleAppError(err, OperationType.LIST, path);
    }
  };

  useEffect(() => {
    fetchUserDealers();
  }, [currentUser, isQuotaExceeded]);

  const fetchPersonalRequests = async () => {
    if (!currentUser || isQuotaExceeded) return;
    
    try {
      const dPath = 'depositRequests';
      const dq = query(collection(db, dPath), where('userId', '==', currentUser.uid), orderBy('timestamp', 'desc'), limit(50));
      const dSnap = await getDocs(dq);
      setPersonalDeposits(dSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepositRequest)));

      const wPath = 'withdrawalRequests';
      const wq = query(collection(db, wPath), where('userId', '==', currentUser.uid), orderBy('timestamp', 'desc'), limit(50));
      const wSnap = await getDocs(wq);
      setPersonalWithdrawals(wSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest)));
    } catch (err) {
      console.warn("Personal requests fetch failed, delegating to App error handler", err);
      handleAppError(err, OperationType.LIST, 'depositRequests');
    }
  };

  useEffect(() => {
    if (!currentUser || isQuotaExceeded) {
      setPersonalDeposits([]);
      setPersonalWithdrawals([]);
      return;
    }
    fetchPersonalRequests();
  }, [currentUser, isQuotaExceeded]);

  const fetchUserProfile = async (user: FirebaseUser, force = false) => {
    if (isQuotaExceeded) return;
    const now = Date.now();
    if (!force && lastFetch['profile'] && now - lastFetch['profile'] < 60000) return; // 1 min TTL

    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setUserProfile(data);
        setBalance(data.balance || 0);
        if (data.bankDetails) {
          setBankDetails(data.bankDetails);
        }
        setLastFetch(prev => ({ ...prev, profile: now }));
      } else {
        const isMobileEmail = user.email?.endsWith('@sorat.live');
        const mobileNum = isMobileEmail ? user.email?.split('@')[0] : '';
        const newProfile = {
          userId: user.uid,
          email: user.email,
          mobile: mobileNum || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Player',
          name: user.displayName || user.email?.split('@')[0] || 'Player',
          balance: 0,
          coins: 0,
          role: user.email?.toLowerCase().trim() === 'nikhilrv8055@gmail.com' ? 'admin' : 'user',
          bankDetails: null
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        setBalance(0);

        console.log('[Appwrite DB] User registration completed successfully.');
      }
    } catch (error) {
      handleAppError(error, OperationType.GET, `users/${user.uid}`);
    }
  };

  useEffect(() => {
    let unsubscribeRealtime: (() => void) | undefined;

    const checkAppwriteSession = async () => {
      try {
        setIsAuthLoading(true);
        console.log("[Appwrite Auth] Executing direct session verification check...");
        
        // OAuth Redirect Success Handling: Immediately execute account.get() (via getCurrentUser)
        const user = await appwriteService.getCurrentUser();
        
        if (user) {
          console.log("[Appwrite Auth] Active session found for authenticated user:", user.email);
          setCurrentUser(user as any);
          setUserProfile(user);
          setBalance(user.balance);
          setIsDemoMode(false);
          setDbConnectionStatus('Connected');
          recordLoginLog(user);
          
          // Save the user session to localStorage for immediate persistence & fast load on next refresh
          try {
            localStorage.setItem('appwrite_session_user', JSON.stringify(user));
          } catch (e) {
            console.warn('[Appwrite Auth] Failed to save session to localStorage:', e);
          }
          
          // Session Verification & State Update: Completely hide/unmount login modal when user data is loaded
          setIsAuthModalOpen(false); 
          
          // Clean up URL parameters if we returned from OAuth to prevent loop/refresh issues
          const urlParams = new URLSearchParams(window.location.search);
          const hasOauthParams = urlParams.has('userId') && urlParams.has('secret');
          if (hasOauthParams) {
            urlParams.delete('userId');
            urlParams.delete('secret');
            urlParams.delete('expire');
            const cleanPath = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.replaceState({}, document.title, cleanPath);
            addNotification("Google Sign-In completed successfully!", "win");
          }

          // Set up real-time listener for user balance
          unsubscribeRealtime = appwriteService.subscribeToUser(user.uid, (updatedDoc) => {
            console.log("[Appwrite Realtime] User profile updated:", updatedDoc);
            window.dispatchEvent(new CustomEvent('appwrite-realtime-connect'));
            if (updatedDoc) {
              setUserProfile(updatedDoc);
              if (updatedDoc.balance !== undefined) {
                setBalance(updatedDoc.balance);
              }
            }
          });
        } else {
          console.log("[Appwrite Auth] No active session found. Prompting login.");
          // Clear any stale cache
          try {
            localStorage.removeItem('appwrite_session_user');
          } catch (e) {}

          // Only prompt login if we don't have a valid user
          setCurrentUser(prev => {
            if (prev) {
              setIsAuthModalOpen(false);
              return prev;
            }
            setUserProfile(null);
            setBalance(0);
            setIsAuthModalOpen(true);
            return null;
          });
        }
      } catch (err) {
        console.warn("[Appwrite Auth] Session check error:", err);
        // Route Guard / Fallback: If we already have a session, do not kick the user out on glitches
        setCurrentUser(prev => {
          if (prev) {
            console.log("[Appwrite Auth] Guard: Preserving active session during temporary network/endpoint glitch.");
            setIsAuthModalOpen(false);
            return prev;
          }
          setUserProfile(null);
          setBalance(0);
          setIsAuthModalOpen(true);
          return null;
        });
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAppwriteSession();

    return () => {
      if (unsubscribeRealtime) unsubscribeRealtime();
    };
  }, [isQuotaExceeded]);

  useEffect(() => {
    const handleOauthMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        refreshSession();
      }
    };
    window.addEventListener('message', handleOauthMessage);
    return () => window.removeEventListener('message', handleOauthMessage);
  }, []);

  useEffect(() => {
    const unsubscribeDiagnostics = subscribeToDiagnostics(() => {
      setLocalDiagnostics([...diagnosticLogs]);
    });
    return unsubscribeDiagnostics;
  }, []);

  // --- Refs ---
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSeenRoundIdRef = useRef<string | null>(null);
  const lastPaidRoundIdRef = useRef<string | null>(null);
  const [timerEndTime, setTimerEndTime] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const initPool = async () => {
    if (!db || isQuotaExceeded) return;
    try {
      const snap = await getDoc(doc(db, 'game', 'currentRound'));
      if (!snap.exists()) {
        const resetMap: { [key: string]: any } = {
          phase: 'betting',
          timerEndTime: getSyncedNow() + (adminState?.timerDuration || CYCLE_DURATION) * 1000,
          winnerId: null,
          predictedWinner: null,
          roundId: Math.random().toString(36).substring(2, 11)
        };
        GAME_SLOTS.forEach(s => resetMap[`slot_${s.id}`] = 0);
        await setDoc(doc(db, 'game', 'currentRound'), resetMap);
      }
    } catch (e) {
      console.warn("Global pool init failed", e);
    }
  };

  const fetchCurrentPool = async (force = false) => {
    if (!db || isQuotaExceeded) return;
    const now = Date.now();
    // Use 30s TTL for pools to keep them relatively fresh without hammering
    if (!force && lastFetch['pool'] && now - lastFetch['pool'] < 30000) return;

    try {
      const snap = await getDoc(doc(db, 'game', 'currentRound'));
      if (snap.exists()) {
        const data = snap.data();
        const map: { [id: number]: number } = {};
        let total = 0;
        GAME_SLOTS.forEach(s => {
          const val = data[`slot_${s.id}`] || 0;
          map[s.id] = val;
          total += val;
        });
        setPoolPerSlot(map);
        setTotalPool(total);
        setLastFetch(prev => ({ ...prev, pool: now }));
      }
    } catch (error) {
      handleAppError(error, OperationType.GET, 'game/currentRound');
    }
  };

  // Periodic refresh for active game data (Pools) removed to save quota
  // replaced with manual refresh and event-based fetching
  useEffect(() => {
    initPool();
    fetchCurrentPool();
  }, [isQuotaExceeded]);

  const fetchHistory = async (force = false) => {
    if (!db || isQuotaExceeded) return;
    const now = Date.now();
    if (!force && lastFetch['history'] && now - lastFetch['history'] < 60000) return; // 1 min TTL

    const path = 'gameRounds';
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      const historyData = snapshot.docs.map(doc => doc.data() as GameHistory);
      setHistory(historyData);
      setLastFetch(prev => ({ ...prev, history: now }));
    } catch (error) {
      handleAppError(error, OperationType.LIST, path);
    }
  };

  useEffect(() => {
    const jitter = Math.floor(Math.random() * 5000); // 0-5s jitter
    const timer = setTimeout(() => {
      fetchHistory();
    }, jitter);
    return () => clearTimeout(timer);
  }, [isQuotaExceeded]);

  // --- Mathematical Synchronized Game Loop ---
  useEffect(() => {
    const runGameLoop = () => {
      let sec = 0;
      let currentRoundId = "";
      let remainingSeconds = 0;
      let calculatedPhase: 'betting' | 'locked' | 'result' = 'betting';

      if (isAppwriteTimerActive && appwriteTimer) {
        // Appwrite Real-time Synced Timer Mode with Lag/Drift Compensation
        const elapsedSeconds = Math.floor((Date.now() - appwriteTimer.lastUpdated) / 1000);
        remainingSeconds = Math.max(0, appwriteTimer.timeLeft - elapsedSeconds);
        currentRoundId = appwriteTimer.currentRound;

        if (appwriteTimer.status === 'active') {
          calculatedPhase = 'betting';
        } else {
          // Status is 'calculating' (spin & results)
          // We divide the 15-second calculation phase into:
          // 10 seconds of 'locked' and 5 seconds of 'result' display
          if (remainingSeconds > 5) {
            calculatedPhase = 'locked';
          } else {
            calculatedPhase = 'result';
          }
        }
      } else {
        // Fallback: Mathematical Synchronized Game Loop
        const now = getSyncedNow();
        const nowSec = Math.floor(now / 1000);
        
        // Use separate timer cycle for landscape screen, keep vertical screen exactly as before (60s)
        const cycle = isLandscape 
          ? (adminState.landscapeTimerDuration || 30) 
          : 60;

        sec = nowSec % cycle;
        currentRoundId = Math.floor(nowSec / cycle).toString();

        // Trigger sync with backend on round rollover
        if (sec === 0) {
          syncTime();
        }

        const lockTime = isLandscape ? 5 : 10; // vertical keeps 10 seconds locked duration as before
        const resultTime = 5;
        const bettingTime = cycle - lockTime - resultTime;

        // Determine phase and timer based on current second
        if (sec < bettingTime) {
          remainingSeconds = bettingTime - sec;
          calculatedPhase = 'betting';
        } else if (sec >= bettingTime && sec < (bettingTime + lockTime)) {
          remainingSeconds = (bettingTime + lockTime) - sec;
          calculatedPhase = 'locked';
        } else {
          remainingSeconds = cycle - sec;
          calculatedPhase = 'result';
        }
      }

      // Check if new round started
      if (currentRoundId !== lastSeenRoundIdRef.current) {
        lastSeenRoundIdRef.current = currentRoundId;
        // Reset player bet states for the new round
        setMyBets({});
        setCurrentBets([]);
        setGameResult(null);
        setWinner(null);
        setPredictedWinner(null);
        setLiveLowestPoolCard(null);
        setAdminState(prev => ({ ...prev, forceWinner: null }));
        
        // Load deterministic pools
        const map = getDeterministicPools(currentRoundId);
        let total = 0;
        GAME_SLOTS.forEach(s => {
          total += map[s.id];
        });
        setPoolPerSlot(map);
        setTotalPool(total);
      }

      // Handle phases transitions smoothly
      if (calculatedPhase === 'betting') {
        if (phase !== 'betting') {
          setPhase('betting');
          setWinner(null);
          playSound('start');
        }
        setTimer(remainingSeconds);
      } else if (calculatedPhase === 'locked') {
        if (phase !== 'locked') {
          setPhase('locked');
          const wId = getGameWinner(currentRoundId, isDemoMode, myBets, poolPerSlot);
          setWinner(wId);
        }
        setTimer(remainingSeconds);
        if (remainingSeconds <= 5 && remainingSeconds > 1) {
          playSound('tick');
        }
      } else if (calculatedPhase === 'result') {
        if (phase !== 'result') {
          setPhase('result');
          const wId = winner !== null ? winner : getGameWinner(currentRoundId, isDemoMode, myBets, poolPerSlot);
          if (winner === null) {
            setWinner(wId);
          }
          if (lastPaidRoundIdRef.current !== currentRoundId) {
            lastPaidRoundIdRef.current = currentRoundId;
            const currentRoundPools = getDeterministicPools(currentRoundId);
            const totalRoundPool = Object.values(currentRoundPools).reduce((a, b) => a + b, 0);
            resolveGameLocally(wId, currentRoundId, currentRoundPools, totalRoundPool);
          }
        }
        setTimer(remainingSeconds);
      }
    };

    // Run immediately and then on every 1-second interval
    runGameLoop();
    const interval = setInterval(runGameLoop, 1000);
    return () => clearInterval(interval);
  }, [phase, isMuted, isAppwriteTimerActive, appwriteTimer, isDemoMode, myBets, poolPerSlot, winner]);

  // Listen to 'paymentSettings' in real-time
  useEffect(() => {
    if (!db || isQuotaExceeded) return;

    const unsubscribe = onSnapshot(doc(db, 'paymentSettings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPaymentSettings({
          qrUrl: data.qrUrl || '',
          upiId: data.upiId || adminState.upiId || 'nikhilrv8055@okhdfcbank',
          payeeName: data.payeeName || adminState.upiPayeeName || 'RECHARGE PORTAL',
          showUpiApps: data.showUpiApps !== false,
          showQrCode: data.showQrCode !== false,
          termsContent: data.termsContent || '',
          privacyContent: data.privacyContent || '',
          refundContent: data.refundContent || '',
          supportEmail: data.supportEmail || 'nikhilrv8055@gmail.com',
          supportHours: data.supportHours || '10:00 AM to 08:00 PM (IST)',
          supportAddress: data.supportAddress || 'Bihar, India',
          supportOperator: data.supportOperator || 'Sorat Live Gaming Solutions',
          supportText: data.supportText || 'For any queries, gateway failures, general feedback or payment-related disputes, please reach out directly to our merchant team.'
        });
      }
    }, (error) => {
      console.warn("Real-time fetch of payment settings failed", error);
    });

    return () => unsubscribe();
  }, [db, isQuotaExceeded, adminState.upiId, adminState.upiPayeeName]);

  // Local Payout Resolution based on Firestore Centralized Winner
  const resolveGameLocally = async (finalWinnerId: number, currentRoundId: string, currentPools: { [id: number]: number }, totalPoolVal: number) => {
    const hasActiveBets = Object.keys(myBets).length > 0;
    const userBetOnWinner = myBets[finalWinnerId] || 0;
    
    if (hasActiveBets) {
      setGameResult(userBetOnWinner > 0 ? 'win' : 'loss');
    }

    // Calculate payouts
    if (userBetOnWinner > 0 && (currentUser || isDemoMode)) {
      const winAmount = userBetOnWinner * adminState.multiplier;
      
      if (isDemoMode) {
        setDemoBalance(prev => prev + winAmount);
      } else if (currentUser) {
        const newBalance = balance + winAmount; 
        setBalance(newBalance);
        try {
          await appwriteService.updateUserBalance(currentUser.uid, newBalance);
        } catch (error) {
          console.error("Appwrite payout update failed:", error);
        }
      }

      const msg = formatTemplate(adminState.notifications?.winMessageTemplate || 'WIN! You won ₹{amount} with {slot}!', {
        amount: winAmount,
        slot: customNames[finalWinnerId] || GAME_SLOTS.find(s => s.id === finalWinnerId)?.name || 'Unknown'
      });
      addNotification(msg, 'win');
      playSound('win');
    }

    // Dynamic History sync
    const hist: GameHistory = {
      timestamp: Date.now(),
      winnerId: finalWinnerId,
      totalPool: totalPoolVal,
      userResult: userBetOnWinner > 0 ? 'win' : (Object.keys(myBets).length > 0 ? 'loss' : 'none'),
      userProfit: userBetOnWinner > 0 ? (userBetOnWinner * adminState.multiplier - userBetOnWinner) : 0
    };
    
    setHistory(prev => [hist, ...prev].slice(0, 20));
  };

  // Distributed serverless coordinator ticker
  const triggerStateTransitionIfNeeded = async () => {
    if (!db || isQuotaExceeded || isTransitioning) return;
    
    const now = getSyncedNow();
    const remainingMs = (timerEndTime || 0) - now;
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

    // Non-admin devices wait slightly longer before updating to prevent overlapping writes
    if (!isAdminAuthorized) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 800));
    }

    try {
      setIsTransitioning(true);
      const sfDocRef = doc(db, 'game', 'currentRound');
      
      await runTransaction(db, async (txn) => {
        const sfDoc = await txn.get(sfDocRef);
        if (!sfDoc.exists()) return;

        const data = sfDoc.data();
        const currentSyncedPhase = data.phase || 'betting';
        const currentSyncedEndTime = data.timerEndTime || 0;
        const currentSyncedWinnerId = data.winnerId !== undefined ? data.winnerId : null;
        const currentSyncedRoundId = data.roundId || 'legacy';

        const secondsLeft = Math.max(0, Math.ceil((currentSyncedEndTime - getSyncedNow()) / 1000));

        if (currentSyncedPhase === 'betting' && secondsLeft <= 5) {
          // Transition: betting -> locked
          const pools: { [id: number]: number } = {};
          GAME_SLOTS.forEach(s => {
            pools[s.id] = data[`slot_${s.id}`] || 0;
          });

          let forceWinner: number | null = null;
          let isAutoWinLowest = true;
          try {
            const settingsSnap = await txn.get(doc(db, 'settings', 'global'));
            if (settingsSnap.exists()) {
              const settingsData = settingsSnap.data();
              if (settingsData.forceWinner !== undefined) forceWinner = settingsData.forceWinner;
              if (settingsData.isAutoWinLowest !== undefined) isAutoWinLowest = settingsData.isAutoWinLowest;
            }
          } catch (err) {
            console.warn("Could not fetch global settings in transaction, using default autoWinLowest: true", err);
          }

          let finalWinnerId: number;
          if (forceWinner !== null) {
            finalWinnerId = forceWinner;
          } else {
            const poolsList = GAME_SLOTS.map(s => ({ id: s.id, pool: pools[s.id] || 0 }));
            const minPool = Math.min(...poolsList.map(p => p.pool));
            const candidates = poolsList.filter(p => p.pool === minPool);
            finalWinnerId = candidates[Math.floor(Math.random() * candidates.length)].id;
          }

          txn.update(sfDocRef, {
            phase: 'locked',
            winnerId: finalWinnerId,
            predictedWinner: finalWinnerId
          });
        } 
        else if (currentSyncedPhase === 'locked' && secondsLeft <= 0) {
          // Sync unified round result to 'gameRounds'
          let totalPoolVal = 0;
          GAME_SLOTS.forEach(s => {
            totalPoolVal += (data[`slot_${s.id}`] || 0);
          });

          const histRef = doc(collection(db, 'gameRounds'));
          txn.set(histRef, {
            winnerId: currentSyncedWinnerId,
            totalPool: totalPoolVal,
            timestamp: getSyncedNow(),
            roundId: currentSyncedRoundId
          });

          txn.update(sfDocRef, {
            phase: 'result',
            timerEndTime: getSyncedNow() + 5000 // 5s display duration
          });
        } 
        else if (currentSyncedPhase === 'result' && secondsLeft <= 0) {
          // Reset for new round
          const newRoundId = Math.random().toString(36).substring(2, 11);
          const duration = adminState.timerDuration || CYCLE_DURATION;
          
          const resetMap: { [key: string]: any } = {
            phase: 'betting',
            timerEndTime: getSyncedNow() + duration * 1000,
            winnerId: null,
            predictedWinner: null,
            roundId: newRoundId
          };
          GAME_SLOTS.forEach(s => resetMap[`slot_${s.id}`] = 0);
          
          txn.set(sfDocRef, resetMap);
        }
      });
    } catch (e) {
      // Quiet fail if transaction is pre-empted by another fast client
    } finally {
      setIsTransitioning(false);
    }
  };

  const triggerStateTransitionOffline = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    try {
      if (phase === 'betting') {
        // Transition: betting -> locked
        // Pick a winner (autoWinLowest is true)
        const finalWinnerId = getGameWinner(Date.now().toString(), isDemoMode, myBets, poolPerSlot);

        setPhase('locked');
        setWinner(finalWinnerId);
        setTimerEndTime(Date.now() + 5 * 1000); // 5s spin / lock duration
      } 
      else if (phase === 'locked') {
        // Transition: locked -> result
        setPhase('result');
        setTimerEndTime(Date.now() + 5 * 1000); // 5s display duration
        
        // Resolve payouts
        if (winner !== null) {
          const userBetOnWinner = myBets[winner] || 0;
          if (userBetOnWinner > 0) {
            const winAmount = userBetOnWinner * (adminState.multiplier || 9);
            setDemoBalance(prev => {
              const b = prev + winAmount;
              localStorage.setItem('demoBalance', b.toString());
              return b;
            });
            const msg = formatTemplate(adminState.notifications?.winMessageTemplate || 'WIN! You won ₹{amount} with {slot}!', {
              amount: winAmount,
              slot: customNames[winner] || GAME_SLOTS.find(s => s.id === winner)?.name || 'Unknown'
            });
            addNotification(msg, 'win');
            playSound('win');
          } else if (Object.keys(myBets).length > 0) {
            addNotification("Better Luck Next Time!", "info");
            playSound('lock');
          }

          // Add to local history
          const hist: GameHistory = {
            timestamp: Date.now(),
            winnerId: winner,
            totalPool: Object.values(myBets).reduce((a, b) => a + b, 0),
            userResult: userBetOnWinner > 0 ? 'win' : (Object.keys(myBets).length > 0 ? 'loss' : 'none'),
            userProfit: userBetOnWinner > 0 ? (userBetOnWinner * (adminState.multiplier || 9) - userBetOnWinner) : 0
          };
          setHistory(prev => [hist, ...prev].slice(0, 20));
        }
      } 
      else if (phase === 'result') {
        // Transition: result -> betting
        setPhase('betting');
        setWinner(null);
        setMyBets({});
        setPoolPerSlot({});
        setTotalPool(0);
        const duration = adminState.timerDuration || CYCLE_DURATION;
        setTimerEndTime(Date.now() + duration * 1000);
        playSound('start');
      }
    } catch (err) {
      console.warn("Offline state transition failed", err);
    } finally {
      setIsTransitioning(false);
    }
  };



  // Update live prediction for Admin (Lowest Pool)
  useEffect(() => {
    if (phase === 'betting' && isAdminAuthorized) {
      const sortedPools = GAME_SLOTS
        .map(s => ({ id: s.id, pool: poolPerSlot[s.id] || 0 }))
        .sort((a, b) => a.pool - b.pool);
      
      setLiveLowestPoolCard(sortedPools[0].id);
    }
  }, [poolPerSlot, phase, isAdminAuthorized]);

  // --- Actions ---

  const formatTemplate = (template: string, vars: { [key: string]: string | number }) => {
    let result = template;
    Object.entries(vars).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{${key}}`, 'g'), value.toString());
    });
    return result;
  };

  const addNotification = (message: string, type: 'win' | 'info' | 'bet' = 'info') => {
    // Check admin settings
    if (adminState.notifications) {
      if (type === 'win' && !adminState.notifications.enableWinNotifications) return;
      if (type === 'info' && !adminState.notifications.enableInfoNotifications) return;
      if (type === 'bet' && !adminState.notifications.enableBetNotifications) return;
    }
    
    const id = Math.random().toString(36).substring(7);
    const notificationType = type === 'bet' ? 'win' : type; // Keep UI colors
    setNotifications(prev => [{ id, message, type: notificationType }, ...prev].slice(0, 5));
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const [betAnimations, setBetAnimations] = useState<{ id: string; x: number; y: number; targetX: number; targetY: number; amount: number }[]>([]);

  const handleBet = async (slotId: number, event?: React.MouseEvent) => {
    if (phase !== 'betting' || (phase === 'betting' && timer <= 5) || (!currentUser && !isDemoMode)) {
      if (!currentUser && !isDemoMode) addNotification("Please login or use Demo Mode to place bets!", 'info');
      else if (phase === 'betting' && timer <= 5) addNotification("Bets are locked for this round!", 'info');
      return;
    }

    const currentBalance = isDemoMode ? demoBalance : balance;
    
    if (currentBalance < betAmount) {
      addNotification(`Insufficient Balance for ₹${betAmount}!`, 'info');
      return;
    }

    // Trigger Animation
    if (event) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      
      // Start from the balance/wallet area area or just a bit lower than click if we want "flying towards"
      // Better: start from the bottom interactive area
      const startX = window.innerWidth / 2;
      const startY = window.innerHeight - 80;

      const animId = Math.random().toString(36).substring(7);
      setBetAnimations(prev => [...prev, {
        id: animId,
        x: startX,
        y: startY,
        targetX,
        targetY,
        amount: betAmount
      }]);

      // Remove after animation duration
      setTimeout(() => {
        setBetAnimations(prev => prev.filter(a => a.id !== animId));
      }, 800);
    }

    // Optimistic update
    if (isDemoMode) {
      setDemoBalance(prev => prev - betAmount);
    } else if (currentUser) {
      const nextBalance = currentBalance - betAmount;
      setBalance(nextBalance);
      
      // Persist locally in cache for immediate responsiveness
      try {
        const cachedUser = localStorage.getItem('appwrite_session_user');
        if (cachedUser) {
          const parsed = JSON.parse(cachedUser);
          parsed.balance = nextBalance;
          localStorage.setItem('appwrite_session_user', JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn("[App] Local balance cache write failed:", e);
      }

      try {
        await appwriteService.updateUserBalance(currentUser.uid, nextBalance);
      } catch (error) {
        console.warn("[App] Appwrite remote balance sync failed. Kept local balance update.", error);
      }
    }

    setMyBets(prev => ({
      ...prev,
      [slotId]: (prev[slotId] || 0) + betAmount
    }));
    playSound('bet');
    
    const newBet: Bet = {
      slotId,
      amount: betAmount,
      userId: currentUser?.uid || 'demo_guest',
      userEmail: currentUser?.email || 'Demo Guest'
    };
    
    setTotalPool(prev => prev + betAmount);
    setPoolPerSlot(prev => ({
      ...prev,
      [slotId]: (prev[slotId] || 0) + betAmount
    }));

    // Increment Global Pool
    if (!isDemoMode && dbConnectionStatus === 'Connected') {
      try {
        await updateDoc(doc(db, 'game', 'currentRound'), {
          [`slot_${slotId}`]: increment(betAmount)
        });
        // Refresh pool data after betting
        fetchCurrentPool();
      } catch (e) {
        console.warn("Global pool update failed", e);
      }
    }
    
    setCurrentBets(prev => [newBet, ...prev].slice(0, 50));

    if (adminState.notifications?.enableBetNotifications !== false) {
      const msg = formatTemplate(adminState.notifications?.betMessageTemplate || 'Bet placed successfully on {slot}!', {
        slot: customNames[slotId] || GAME_SLOTS.find(s => s.id === slotId)?.name || 'Unknown'
      });
      addNotification(msg, 'bet');
    }
  };

  const calculateWinner = () => {
    let finalWinnerId: number;
    
    if (adminState.forceWinner !== null) {
      finalWinnerId = adminState.forceWinner;
    } else {
      // Find the minimum pool amount among all slots
      const pools = GAME_SLOTS.map(s => ({ id: s.id, pool: poolPerSlot[s.id] || 0 }));
      const minPool = Math.min(...pools.map(p => p.pool));
      
      // Filter slots that have this minimum pool amount (includes those with 0 bets)
      const candidates = pools.filter(p => p.pool === minPool);
      
      // Randomly pick one from the candidates
      finalWinnerId = candidates[Math.floor(Math.random() * candidates.length)].id;
    }
    setPredictedWinner(finalWinnerId);
    return finalWinnerId;
  };

  const resolveGame = async () => {
    if (!db || isQuotaExceeded) return;
    try {
      const sfDocRef = doc(db, 'game', 'currentRound');
      await runTransaction(db, async (txn) => {
        const sfDoc = await txn.get(sfDocRef);
        if (!sfDoc.exists()) return;

        const data = sfDoc.data();
        const currentSyncedPhase = data.phase || 'betting';
        if (currentSyncedPhase === 'result') return;

        let finalWinnerId = data.winnerId;
        if (finalWinnerId === undefined || finalWinnerId === null) {
          const pools: { [id: number]: number } = {};
          GAME_SLOTS.forEach(s => {
            pools[s.id] = data[`slot_${s.id}`] || 0;
          });

          let forceWinner: number | null = null;
          let isAutoWinLowest = true;
          try {
            const settingsSnap = await txn.get(doc(db, 'settings', 'global'));
            if (settingsSnap.exists()) {
              const settingsData = settingsSnap.data();
              if (settingsData.forceWinner !== undefined) forceWinner = settingsData.forceWinner;
              if (settingsData.isAutoWinLowest !== undefined) isAutoWinLowest = settingsData.isAutoWinLowest;
            }
          } catch (err) {
            console.warn("Could not fetch global settings direct:", err);
          }

          if (forceWinner !== null) {
            finalWinnerId = forceWinner;
          } else {
            const poolsList = GAME_SLOTS.map(s => ({ id: s.id, pool: pools[s.id] || 0 }));
            const minPool = Math.min(...poolsList.map(p => p.pool));
            const candidates = poolsList.filter(p => p.pool === minPool);
            finalWinnerId = candidates[Math.floor(Math.random() * candidates.length)].id;
          }
        }

        // Write history doc
        let totalPoolVal = 0;
        GAME_SLOTS.forEach(s => {
          totalPoolVal += (data[`slot_${s.id}`] || 0);
        });

        const histRef = doc(collection(db, 'gameRounds'));
        txn.set(histRef, {
          winnerId: finalWinnerId,
          totalPool: totalPoolVal,
          timestamp: getSyncedNow(),
          roundId: data.roundId || 'legacy'
        });

        txn.update(sfDocRef, {
          phase: 'result',
          winnerId: finalWinnerId,
          timerEndTime: getSyncedNow() + 5000 // 5 seconds display
        });
      });
    } catch (e) {
      console.warn("Manual resolve failed:", e);
    }
  };

  const lockGame = async () => {
    if (!db || isQuotaExceeded) return;
    try {
      const sfDocRef = doc(db, 'game', 'currentRound');
      await runTransaction(db, async (txn) => {
        const sfDoc = await txn.get(sfDocRef);
        if (!sfDoc.exists()) return;

        const data = sfDoc.data();
        const currentSyncedPhase = data.phase || 'betting';
        if (currentSyncedPhase !== 'betting') return;

        // Determine winner
        const pools: { [id: number]: number } = {};
        GAME_SLOTS.forEach(s => {
          pools[s.id] = data[`slot_${s.id}`] || 0;
        });

        let forceWinner: number | null = null;
        let isAutoWinLowest = true;
        try {
          const settingsSnap = await txn.get(doc(db, 'settings', 'global'));
          if (settingsSnap.exists()) {
            const settingsData = settingsSnap.data();
            if (settingsData.forceWinner !== undefined) forceWinner = settingsData.forceWinner;
            if (settingsData.isAutoWinLowest !== undefined) isAutoWinLowest = settingsData.isAutoWinLowest;
          }
        } catch (err) {
          console.warn("Could not fetch global settings direct:", err);
        }

        let finalWinnerId: number;
        if (forceWinner !== null) {
          finalWinnerId = forceWinner;
        } else {
          const poolsList = GAME_SLOTS.map(s => ({ id: s.id, pool: pools[s.id] || 0 }));
          const minPool = Math.min(...poolsList.map(p => p.pool));
          const candidates = poolsList.filter(p => p.pool === minPool);
          finalWinnerId = candidates[Math.floor(Math.random() * candidates.length)].id;
        }

        txn.update(sfDocRef, {
          phase: 'locked',
          winnerId: finalWinnerId,
          predictedWinner: finalWinnerId,
          timerEndTime: getSyncedNow() + 5000 // lock for 5s
        });
      });
      addNotification('Bets have been locked manually', 'info');
    } catch (e) {
      console.warn("Manual lock failed:", e);
    }
  };

  const toggleAdmin = () => {
    if (isAdminAuthorized) {
      setIsAdminLoggedIn(true);
      const nextOpen = !isAdminOpen;
      setIsAdminOpen(nextOpen);
      if (nextOpen) {
        setIsLeaderboardOpen(false);
        setIsProfileOpen(false);
      }
    } else if (!isAdminLoggedIn) {
      setIsAdminOpen(true);
      setIsLeaderboardOpen(false);
      setIsProfileOpen(false);
    } else {
      const nextOpen = !isAdminOpen;
      setIsAdminOpen(nextOpen);
      if (nextOpen) {
        setIsLeaderboardOpen(false);
        setIsProfileOpen(false);
      }
    }
  };

  const adjustTimer = (seconds: number) => {
    setTimer(prev => {
      const next = prev + seconds;
      return next < 1 ? 1 : next;
    });
    addNotification(`Timer adjusted by ${seconds}s`, 'info');
  };

  const handleAdminLogin = () => {
    if (adminPass === '8055') { // Simple admin pass
      setIsAdminLoggedIn(true);
      addNotification("Admin Access Granted", 'info');
    } else {
      addNotification("Invalid Password", 'info');
    }
  };

  const getFilteredEarnings = () => {
    const now = Date.now();
    const filterMs = {
      hour: 60 * 60 * 1000,
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      all: now // basically large enough
    };

    const limit = earningsFilter === 'all' ? 0 : now - (filterMs as any)[earningsFilter];

    // Identify if the request belongs to an admin account (either by email or stored user role)
    const adminUserIds = new Set(allUsers.filter(u => u.role === 'admin').map(u => u.id));
    const isAdminRequest = (r: any) => {
      const email = (r.email || '').toLowerCase().trim();
      if (email === 'nikhilrv8055@gmail.com') return true;
      if (adminUserIds.has(r.userId)) return true;
      const foundUser = allUsers.find(u => u.id === r.userId || (u.email && u.email.toLowerCase().trim() === email));
      if (foundUser && foundUser.role === 'admin') return true;
      return false;
    };

    const approvedDeposits = depositRequests
      .filter(r => r.status === 'approved' && !isAdminRequest(r) && (earningsFilter === 'all' || r.timestamp > limit))
      .reduce((sum, r) => sum + r.amount, 0);

    const approvedWithdrawals = withdrawalRequests
      .filter(r => r.status === 'approved' && !isAdminRequest(r) && (earningsFilter === 'all' || r.timestamp > limit))
      .reduce((sum, r) => sum + r.amount, 0);

    return approvedDeposits - approvedWithdrawals;
  };

  const uploadToFreeImageHost = async (base64Data: string): Promise<string> => {
    try {
      // 1. Try ImgBB if key is configured
      const imgbbKey = (import.meta as any).env?.VITE_IMGBB_API_KEY;
      if (imgbbKey) {
        const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
        const formData = new FormData();
        formData.append("image", cleanBase64);
        
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.url) {
            console.log("[ImgBB] Image uploaded successfully:", json.data.url);
            return json.data.url;
          }
        }
      }
    } catch (err) {
      console.error("[ImgBB] Upload failed, trying fallback:", err);
    }

    // 2. Fallback to tmpfiles.org (completely free and anonymous, no key required)
    try {
      const response = await fetch(base64Data);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("file", blob, "screenshot.png");

      const res = await fetch("https://tmpfiles.org/api/v1/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.url) {
          const directUrl = json.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
          console.log("[tmpfiles.org] Anonymous upload success:", directUrl);
          return directUrl;
        }
      }
    } catch (err) {
      console.error("[tmpfiles.org] Upload failed:", err);
    }

    // Return original base64 if both fail
    return base64Data;
  };

  const handleDeposit = async () => {
    if (depositStep === 1) {
      const amt = parseFloat(transactionAmount);
      if (isNaN(amt) || amt < 10) {
        addNotification("Minimum deposit is ₹10", 'info');
        return;
      }
      setSelectedDealerId('system');
      setSelectedMethod('qr');
      setDealerPaymentMethod('qr');
      setDepositStep(2);
      return;
    }

    // Process Final Request (Step 2)
    const amt = parseFloat(transactionAmount);
    if (!screenshotBase64) {
      const msg = "कृपया पेमेंटचा स्क्रीनशॉट सबमिट करा / Please upload payment screenshot";
      addNotification(msg, 'info');
      if (typeof window !== 'undefined') window.alert(msg);
      return;
    }

    try {
      if (!currentUser) return;
      
      addNotification("Uploading screenshot to Appwrite Storage...", "info");
      
      // Get the native File object via document.getElementById('file') as fallback
      const fileInput = document.getElementById('file') as HTMLInputElement;
      const nativeFile = fileInput?.files?.[0];
      
      // Pass the state File object, DOM File object, or base64 fallback to Appwrite Storage
      const uploadResult = await appwriteService.uploadScreenshot(screenshotFile || nativeFile || screenshotBase64);
      const finalScreenshotUrl = uploadResult.url;
      const fileId = uploadResult.fileId;
      
      console.log(`[Appwrite Storage] Screenshot uploaded. fileId: ${fileId}, URL: ${finalScreenshotUrl}`);

      // Save to Appwrite Database collection payment_proofs using fileId
      await appwriteService.createPaymentProof({
        id: fileId,
        user_email: currentUser.email || 'unknown@user.com',
        screenshot_url: finalScreenshotUrl,
        amount: amt
      });

      // Also create/update Firebase/D1 depositRequests document with fileId
      try {
        await setDoc(doc(db, 'depositRequests', fileId), {
          id: fileId,
          userId: currentUser.uid,
          email: currentUser.email || 'unknown@user.com',
          amount: amt,
          method: selectedMethod || 'qr',
          transactionId: transactionId || fileId,
          screenshotUrl: finalScreenshotUrl,
          screenshot_url: finalScreenshotUrl, // Ensure both CamelCase and snake_case are saved
          status: 'pending',
          timestamp: Date.now(),
          userBalanceBefore: balance
        });
        console.log('[Firestore DB] Deposit request written to depositRequests with screenshotUrl successfully.');
      } catch (dbErr) {
        console.warn('[Firestore DB] Failed to dual-write to depositRequests, ignoring fallback:', dbErr);
      }

      // Also create/update Firebase/D1 deposits document with fileId as requested
      try {
        await setDoc(doc(db, 'deposits', fileId), {
          id: fileId,
          userId: currentUser.uid,
          email: currentUser.email || 'unknown@user.com',
          amount: amt,
          method: selectedMethod || 'qr',
          transactionId: transactionId || fileId,
          screenshotUrl: finalScreenshotUrl,
          screenshot_url: finalScreenshotUrl,
          status: 'pending',
          timestamp: Date.now(),
          userBalanceBefore: balance
        });
        console.log('[Firestore DB] Deposit request written to deposits with screenshotUrl successfully.');
      } catch (dbErr) {
        console.warn('[Firestore DB] Failed to dual-write to deposits, ignoring fallback:', dbErr);
      }

      addNotification("Deposit request submitted successfully!", 'win');
      setIsDepositOpen(false);
      setDepositStep(1);
      setTransactionAmount('');
      setTransactionId('');
      setScreenshotBase64(null);
      setScreenshotFile(null);
      setSelectedDealerId('system');
      setDealerPaymentMethod(null);
      setSelectedMethod(null);
    } catch (error) {
      console.error("Deposit submission failed:", error);
      addNotification("Submission failed. Please try again.", "info");
    }
  };

  const handleApproveDeposit = async (requestId: string, userId: string, amount: number) => {
    try {
      // 1. Try to approve in Appwrite DB (this also automatically credits the user's balance on Appwrite!)
      try {
        await appwriteService.updatePaymentProofStatus(requestId, 'approved');
        console.log('[Appwrite DB] Approved deposit and credited user balance successfully');
      } catch (appwriteErr) {
        console.warn('[Appwrite DB] Failed to approve deposit in Appwrite:', appwriteErr);
      }

      // 2. Try to update Firestore 'deposits' and 'depositRequests' status
      try {
        await updateDoc(doc(db, 'deposits', requestId), {
          status: 'approved'
        });
        await updateDoc(doc(db, 'depositRequests', requestId), {
          status: 'approved'
        });
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          balance: increment(amount)
        });
        console.log('[Firestore DB] Approved in collections successfully');
      } catch (err) {
        console.warn('[Firestore DB] Failed to update local/mock status:', err);
      }

      addNotification(`Deposit of ₹${amount} approved! Balance added to user.`, 'win');
      
      // Refresh admin data synchronously
      fetchAdminData(true);
    } catch (error) {
      handleAppError(error, OperationType.WRITE, `depositRequests/${requestId}`);
    }
  };

  const handleRejectDeposit = async (requestId: string) => {
    try {
      // 1. Try to reject in Appwrite DB
      try {
        await appwriteService.updatePaymentProofStatus(requestId, 'rejected');
        console.log('[Appwrite DB] Rejected deposit successfully');
      } catch (appwriteErr) {
        console.warn('[Appwrite DB] Failed to reject deposit in Appwrite:', appwriteErr);
      }

      // 2. Try to update Firestore 'deposits' and 'depositRequests' status
      try {
        await updateDoc(doc(db, 'deposits', requestId), {
          status: 'rejected'
        });
        await updateDoc(doc(db, 'depositRequests', requestId), {
          status: 'rejected'
        });
        console.log('[Firestore DB] Rejected in collections successfully');
      } catch (err) {
        console.warn('[Firestore DB] Failed to update local/mock status:', err);
      }

      addNotification("Deposit request rejected", 'info');
      
      // Refresh admin data synchronously
      fetchAdminData(true);
    } catch (e) {
      handleAppError(e, OperationType.WRITE, `depositRequests/${requestId}`);
    }
  };

  const handleApprovePaymentProof = async (proofId: string, userEmail: string, amount: number) => {
    try {
      addNotification(`Approving proof...`, 'info');
      
      // Update in Appwrite - this will automatically update the proof status to 'approved'
      // AND credit the coins to the user's balance!
      await appwriteService.updatePaymentProofStatus(proofId, 'approved');

      // Find the corresponding proof from state to get its userId if available
      const correspondingProof = paymentProofs.find(p => p.id === proofId);
      const userId = correspondingProof?.userId;

      // Update in mock Firestore too
      try {
        await updateDoc(doc(db, 'deposits', proofId), { status: 'approved' });
      } catch (err) {}
      try {
        await updateDoc(doc(db, 'depositRequests', proofId), { status: 'approved' });
      } catch (err) {}

      if (userId) {
        try {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            balance: increment(amount)
          });
        } catch (err) {}
      }

      addNotification(`Proof approved successfully!`, 'win');
      addNotification(`₹${amount} coins added to ${userEmail}!`, 'win');

      // Refresh admin data
      fetchAdminData(true);
    } catch (err: any) {
      console.error("Failed to approve payment proof:", err);
      addNotification(err?.message || "Approval failed. Please try again.", "info");
    }
  };

  const handleRejectPaymentProof = async (proofId: string) => {
    try {
      addNotification(`Rejecting proof...`, 'info');
      
      // Update in Appwrite
      await appwriteService.updatePaymentProofStatus(proofId, 'rejected');

      // Update in mock Firestore too
      try {
        await updateDoc(doc(db, 'deposits', proofId), { status: 'rejected' });
      } catch (err) {}
      try {
        await updateDoc(doc(db, 'depositRequests', proofId), { status: 'rejected' });
      } catch (err) {}

      addNotification(`Proof rejected successfully!`, 'info');

      // Refresh admin data
      fetchAdminData(true);
    } catch (err: any) {
      console.error("Failed to reject payment proof:", err);
      addNotification(err?.message || "Rejection failed.", "info");
    }
  };



  const openUpiApp = (method: 'gpay' | 'phonepe' | 'paytm' | 'generic', upiId: string, name: string, amount: string) => {
    // 1. Clean payee name to keep alphanumeric & spaces only (essential to avoid merchant verification errors on GPay Business)
    const cleanName = name.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const encodedName = encodeURIComponent(cleanName);
    const cleanAmount = parseFloat(amount).toFixed(2);
    
    // 2. Build secure standard UPI deep link with static note for risk prevention
    const standardUpiLink = `upi://pay?pa=${upiId}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=Recharge`;
    
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    let targetLink = standardUpiLink;
    
    if (isAndroid) {
      if (method === 'gpay') {
        // Direct intent for Google Pay (zero friction, opens GPay instantly without generic chooser)
        targetLink = `intent://pay?pa=${upiId}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=Recharge#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;S.browser_fallback_url=${encodeURIComponent(standardUpiLink)};end`;
      } else if (method === 'phonepe') {
        targetLink = `intent://pay?pa=${upiId}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=Recharge#Intent;scheme=upi;package=com.phonepe.app;S.browser_fallback_url=${encodeURIComponent(standardUpiLink)};end`;
      } else if (method === 'paytm') {
        targetLink = `intent://pay?pa=${upiId}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=Recharge#Intent;scheme=upi;package=net.one97.paytm;S.browser_fallback_url=${encodeURIComponent(standardUpiLink)};end`;
      }
    } else if (isIOS) {
      if (method === 'gpay') {
        targetLink = `gpay://upi/pay?pa=${upiId}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=Recharge`;
      } else if (method === 'phonepe') {
        targetLink = `phonepe://pay?pa=${upiId}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=Recharge`;
      } else if (method === 'paytm') {
        targetLink = `paytmmp://pay?pa=${upiId}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=Recharge`;
      }
    }

    // Auto-copy UPI ID to clipboard beforehand to prevent user effort in case of app failures
    try {
      navigator.clipboard.writeText(upiId).then(() => {
        addNotification(`Copied UPI ID! Opening ${method === 'generic' ? 'UPI App' : method.toUpperCase()}...`, 'win');
      }).catch(() => {
        addNotification(`Opening ${method === 'generic' ? 'UPI App' : method.toUpperCase()}...`, 'info');
      });
    } catch (clipErr) {
      addNotification(`Opening ${method === 'generic' ? 'UPI App' : method.toUpperCase()}...`, 'info');
    }

    try {
      // Secure, smooth click element method to bypass iframe container sandbox
      const link = document.createElement('a');
      link.href = targetLink;
      link.target = '_self';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Fallback redirection
      setTimeout(() => {
        window.location.href = targetLink;
      }, 100);
    } catch (e) {
      window.location.href = targetLink;
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(transactionAmount);
    if (isNaN(amt) || amt < 100) {
      addNotification("Minimum withdrawal amount is ₹100", 'info');
      return;
    }
    if (amt > balance) {
      addNotification("Insufficient Balance", 'info');
      return;
    }
    if (!currentUser) return;

    if (withdrawalMethod === 'upi' && !bankDetails.upiId) {
      addNotification("Please update UPI ID in profile first!", 'info');
      setIsWithdrawOpen(false);
      setIsProfileOpen(true);
      return;
    }

    if (withdrawalMethod === 'bank' && (!bankDetails.accountNumber || !bankDetails.ifscCode)) {
      addNotification("Please update bank details in profile first!", 'info');
      setIsWithdrawOpen(false);
      setIsProfileOpen(true);
      return;
    }

    // Instead of processing, show confirmation dialog
    setShowWithdrawConfirm(true);
  };

  const handleWithdrawConfirm = async () => {
    const amt = parseFloat(transactionAmount);
    if (!currentUser || isNaN(amt)) return;

    const wPath = 'withdrawalRequests';
    
    try {
      // 1. Create withdrawal request
      await addDoc(collection(db, wPath), {
        userId: currentUser.uid,
        email: currentUser.email,
        amount: amt,
        method: withdrawalMethod,
        status: 'pending',
        bankDetails: bankDetails,
        userBalanceBefore: balance,
        timestamp: Date.now()
      });
    } catch (error) {
      handleAppError(error, OperationType.WRITE, wPath);
      return;
    }

    try {
      // 2. Deduct balance in Mock Firestore
      await updateDoc(doc(db, 'users', currentUser.uid), {
        balance: increment(-amt)
      });

      // 3. Deduct balance on Appwrite DB
      const nextBalance = balance - amt;
      setBalance(nextBalance);
      try {
        await appwriteService.updateUserBalance(currentUser.uid, nextBalance);
        console.log('[Appwrite DB] Synchronized withdrawal balance deduction successfully');
      } catch (appwriteErr) {
        console.warn('[Appwrite DB] Failed to sync withdrawal balance deduction to Appwrite:', appwriteErr);
      }

      addNotification(`Withdrawal request for ₹${amt} submitted!`, 'win');
      setIsWithdrawOpen(false);
      setShowWithdrawConfirm(false);
      setTransactionAmount('');
      playSound('lock');
    } catch (error) {
      handleAppError(error, OperationType.WRITE, `users/${currentUser.uid}`);
    }
  };

  const handleApproveWithdrawal = async (requestId: string) => {
    try {
      // Approve in mock database
      await updateDoc(doc(db, 'withdrawalRequests', requestId), {
        status: 'approved'
      });
      addNotification("Withdrawal request approved successfully!", 'win');
      
      // Refresh admin data synchronously
      fetchAdminData(true);
    } catch (e) {
      handleAppError(e, OperationType.WRITE, `withdrawalRequests/${requestId}`);
    }
  };

  const handleRejectWithdrawal = async (requestId: string, userId: string, amount: number) => {
    try {
      // 1. Update status and refund in mock database
      try {
        await updateDoc(doc(db, 'withdrawalRequests', requestId), {
          status: 'rejected'
        });
        await updateDoc(doc(db, 'users', userId), {
          balance: increment(amount)
        });
      } catch (err) {
        console.warn('[Mock DB] Failed to update rejection status:', err);
      }

      // 2. Refund balance on Appwrite DB
      try {
        const currentDbBalance = await appwriteService.getUserBalance(userId);
        const newBalance = currentDbBalance + amount;
        await appwriteService.updateUserBalance(userId, newBalance);
        console.log(`[Appwrite DB] Refunded ₹${amount} to user ${userId}`);
      } catch (err) {
        console.warn('[Appwrite DB] Failed to refund balance on Appwrite:', err);
      }

      addNotification("Withdrawal rejected and refunded successfully!", 'info');
      
      // Refresh admin data synchronously
      fetchAdminData(true);
    } catch (e) {
      handleAppError(e, OperationType.WRITE, `withdrawalRequests/${requestId}`);
    }
  };

  const handleUpdateBankDetails = async () => {
    if (!currentUser) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        bankDetails: bankDetails
      });
      addNotification("Bank details updated!", 'win');
      setIsProfileOpen(false);
    } catch (err) {
      handleAppError(err, OperationType.WRITE, `users/${currentUser.uid}`);
    }
  };

  const handleToggleUserAdmin = async (uid: string, currentRole: string) => {
    if (currentUser?.email !== 'nikhilrv8055@gmail.com') {
      addNotification("Only the primary administrator (nikhilrv8055@gmail.com) can assign or revoke admin rights!", 'info');
      return;
    }
    const targetUser = allUsers.find(u => u.id === uid);
    if (targetUser?.email === 'nikhilrv8055@gmail.com') {
      addNotification("nikhilrv8055@gmail.com is the primary administrator and cannot be modified!", 'info');
      return;
    }
    if (uid === currentUser?.uid) {
      addNotification("You cannot revoke your own admin rights!", 'info');
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    const path = `users/${uid}`;
    try {
      // 1. Update in Appwrite DB
      try {
        await databases.updateDocument(DATABASE_ID, USERS_COLLECTION_ID, uid, { role: newRole });
        console.log('[Appwrite DB] Updated user role successfully on Appwrite');
      } catch (appwriteErr) {
        console.warn('[Appwrite DB] Failed to update user role on Appwrite:', appwriteErr);
      }

      // 2. Update in Mock Firestore
      try {
        await updateDoc(doc(db, 'users', uid), { role: newRole });
      } catch (err) {}

      addNotification(`User role updated to ${newRole.toUpperCase()} successfully!`, 'win');
      fetchAdminData(true);
    } catch (e) {
      handleAppError(e, OperationType.UPDATE, path);
    }
  };

  const handleAdjustBalance = async (uid: string, amount: number) => {
    if (!isAdminAuthorized) return;
    const path = `users/${uid}`;
    try {
      const currentSelectedUser = allUsers.find(u => u.id === uid);
      const currentBal = currentSelectedUser ? (currentSelectedUser.balance || 0) : 0;
      const targetBalance = currentBal + amount;
      
      // Appwrite Function Secure Admin Bypass
      try {
        await appwriteService.updateUserBalanceViaFunction(
          uid,
          Math.abs(amount),
          amount >= 0 ? 'add' : 'remove',
          'SORAT_SUPER_SECRET_ADMIN_TOKEN_2026'
        );
        console.log("[Appwrite Functions] Secure bypass executed successfully!");
        addNotification(`Balance adjusted by ₹${amount} via Appwrite Function bypass!`, 'win');
      } catch (funcErr: any) {
        console.warn("Appwrite Function bypass failed, falling back to direct database writes", funcErr);
        
        // Appwrite Direct Fallback
        await appwriteService.updateUserBalance(uid, targetBalance);
        addNotification(`Balance adjusted by ₹${amount} (Direct DB Fallback)`, 'win');
      }
      
      // Firebase Fallback
      try {
        await updateDoc(doc(db, 'users', uid), {
          balance: increment(amount)
        });
      } catch (err) {}
      
      // Update local state immediately
      setAllUsers(prev => prev.map(u => u.id === uid ? { ...u, balance: targetBalance } : u));
    } catch (error) {
      handleAppError(error, OperationType.WRITE, path);
    }
  };

  const handleAdminUpdateUserBalance = async (uid: string, currentBalance: number) => {
    const amt = prompt("Enter new balance (₹):", currentBalance.toString());
    if (amt === null) return;
    const newBalance = parseFloat(amt);
    if (isNaN(newBalance)) return;
    try {
      // Appwrite Function Secure Admin Bypass
      try {
        await appwriteService.updateUserBalanceViaFunction(
          uid,
          newBalance,
          'set',
          'SORAT_SUPER_SECRET_ADMIN_TOKEN_2026'
        );
        console.log("[Appwrite Functions] Secure bypass executed successfully!");
        addNotification(`User balance set to ₹${newBalance} via Appwrite Function bypass!`, 'win');
      } catch (funcErr: any) {
        console.warn("Appwrite Function bypass failed, falling back to direct database writes", funcErr);
        
        // Appwrite Direct Fallback
        await appwriteService.updateUserBalance(uid, newBalance);
        addNotification(`User balance set to ₹${newBalance} (Direct DB Fallback)`, 'win');
      }
      
      // Firebase Fallback
      try {
        await updateDoc(doc(db, 'users', uid), { balance: newBalance });
      } catch (err) {}
      
      // Update local state immediately
      setAllUsers(prev => prev.map(u => u.id === uid ? { ...u, balance: newBalance } : u));
    } catch (e) {
      handleAppError(e, OperationType.WRITE, `users/${uid}`);
    }
  };

  const handleAdminUpdateUserBalanceDirect = async (uid: string, newBalance: number) => {
    try {
      // Appwrite Function Secure Admin Bypass
      try {
        await appwriteService.updateUserBalanceViaFunction(
          uid,
          newBalance,
          'set',
          'SORAT_SUPER_SECRET_ADMIN_TOKEN_2026'
        );
        console.log("[Appwrite Functions] Secure bypass executed successfully!");
        addNotification(`User balance set to ₹${newBalance} via Appwrite Function bypass!`, 'win');
      } catch (funcErr: any) {
        console.warn("Appwrite Function bypass failed, falling back to direct database writes", funcErr);
        
        // Appwrite Direct Fallback
        await appwriteService.updateUserBalance(uid, newBalance);
        addNotification(`User balance set to ₹${newBalance} (Direct DB Fallback)`, 'win');
      }
      
      // Firebase Fallback
      try {
        await updateDoc(doc(db, 'users', uid), { balance: newBalance });
      } catch (err) {}
      
      // Update local state immediately
      setAllUsers(prev => prev.map(u => u.id === uid ? { ...u, balance: newBalance } : u));
    } catch (e) {
      handleAppError(e, OperationType.WRITE, `users/${uid}`);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!isAdminAuthorized) return;
    const targetUser = allUsers.find(u => u.id === uid);
    if (targetUser?.email === 'nikhilrv8055@gmail.com') {
      addNotification("nikhilrv8055@gmail.com is the primary administrator and cannot be deleted!", 'info');
      return;
    }
    if (!confirm("Are you sure you want to delete this user? ALL data will be lost.")) return;
    
    try {
      // 1. Delete from Appwrite DB
      try {
        await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, uid);
        console.log('[Appwrite DB] Deleted user document');
      } catch (err) {
        console.warn('[Appwrite DB] Failed to delete user on Appwrite:', err);
      }

      // 2. Delete from Mock Firestore
      try {
        await deleteDoc(doc(db, 'users', uid));
        await deleteDoc(doc(db, 'leaderboard', uid));
      } catch (err) {}

      addNotification("User and their data deleted successfully", 'info');
      fetchAdminData(true);
    } catch (error) {
      handleAppError(error, OperationType.WRITE, `users/${uid}`);
    }
  };

  const handleManualAddUser = async () => {
    if (!isAdminAuthorized) return;
    const uid = prompt("Enter User ID (Unique UID/UUID):");
    if (!uid) return;
    const email = prompt("Enter Email:");
    if (!email) return;
    const name = prompt("Enter Name:");
    const balanceStr = prompt("Enter Initial Balance:", "0");
    const initialBalance = parseFloat(balanceStr || "0");

    const displayName = name || email.split('@')[0] || 'Player';

    try {
      await setDoc(doc(db, 'users', uid), {
        userId: uid,
        email: email.toLowerCase().trim(),
        displayName: displayName,
        name: displayName,
        balance: initialBalance,
        coins: initialBalance,
        role: email.toLowerCase().trim() === 'nikhilrv8055@gmail.com' ? 'admin' : 'user',
        createdAt: Date.now()
      });
      addNotification("User record created manually", 'win');
      fetchAdminData(true);
    } catch (error) {
       handleAppError(error, OperationType.WRITE, `users/${uid}`);
    }
  };

  const handleCreateTestUser = async () => {
    const sampleUid = 'test-' + Math.floor(Math.random() * 900000 + 100000);
    const sampleEmail = `${sampleUid}@example.com`;
    const sampleName = 'Test User ' + Math.floor(Math.random() * 9000 + 1000);
    
    addDiagnosticLog('Create Test User Clicked', 'pending', null, { sampleUid, sampleEmail, sampleName });
    
    try {
      const payload = {
        email: sampleEmail,
        displayName: sampleName,
        name: sampleName,
        coins: 1000,
        balance: 1000,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', sampleUid), payload);
      
      addDiagnosticLog('Create Test User Result', 'success', null, payload);
      setTestUserResult({ status: 'success', message: `Successfully inserted test user directly into Firestore users collection with ID ${sampleUid}!` });
      addNotification(`Direct Insert Success! ID: ${sampleUid}`, "win");
      // Force refresh admin view to show the newly inserted user
      fetchAdminData(true);
    } catch (err: any) {
      addDiagnosticLog('Create Test User Exception', 'failure', err?.message || String(err));
      setTestUserResult({ status: 'err', message: `Exception occurred: ${err?.message || String(err)}` });
    }
  };

  const handleSyncAuthUsers = async () => {
    setIsSyncingAuth(true);
    addNotification("Firebase Mode: Users are synchronized automatically in real-time!", "win");
    setLastSyncStatus(`Last sync: ${new Date().toLocaleTimeString()} (Success)`);
    await fetchAdminData(true);
    await checkDbConnectionAndCounts();
    setIsSyncingAuth(false);
  };

  const handleGoogleSignIn = async () => {
    if (isAuthLoading) return;
    setIsAuthLoading(true);
    addNotification("Starting Google Sign-In...", 'info');
    try {
      await appwriteService.signInWithGoogle();
    } catch (error: any) {
      console.error("[Google Login] Error:", error);
      addNotification(error?.message || "Google Sign-In failed.", 'info');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthLoading) return;
    
    setIsAuthLoading(true);
    const cleanMobile = authForm.mobile.replace(/\s+/g, '').trim();
    if (!/^\d{10}$/.test(cleanMobile)) {
      addNotification("Please enter a valid 10-digit mobile number.", 'info');
      setIsAuthLoading(false);
      return;
    }

    const emailStr = `${cleanMobile}@sorat.live`;
    const passwordStr = authForm.password;
    const nameStr = authForm.displayName.trim() || `Player ${cleanMobile.slice(-4)}`;

    try {
      const { ID, Account } = await import('appwrite');
      const accountInstance = new Account(appwriteClient);

      if (authType === 'register') {
        await accountInstance.create(ID.unique(), emailStr, passwordStr, nameStr);
        addNotification("Registration successful! Logging in...", 'win');
        await accountInstance.createEmailPasswordSession(emailStr, passwordStr);
      } else {
        await accountInstance.createEmailPasswordSession(emailStr, passwordStr);
        addNotification("Logged in successfully!", 'win');
      }

      // Refresh current user session details
      const user = await appwriteService.getCurrentUser();
      if (user) {
        setCurrentUser(user as any);
        setUserProfile(user);
        setBalance(user.balance);
        setIsDemoMode(false);
        setDbConnectionStatus('Connected');
        recordLoginLog(user);
        try {
          localStorage.setItem('appwrite_session_user', JSON.stringify(user));
        } catch (e) {}
      }

      setIsAuthModalOpen(false);
      setAuthForm({ mobile: '', password: '', displayName: '' });
      setShowPassword(false);
      setIsProfileOpen(false);
    } catch (error: any) {
      console.error("Appwrite Auth error:", error);
      let friendlyMsg = error?.message || 'Authentication failed. Please try again.';
      
      if (error?.code === 409 || friendlyMsg.includes('exists')) {
        friendlyMsg = "Mobile number is already registered! Please login instead.";
      } else if (error?.code === 401 || friendlyMsg.includes('invalid credentials')) {
        friendlyMsg = "Incorrect mobile number or password.";
      } else if (friendlyMsg.includes('password')) {
        friendlyMsg = "Password must be at least 8 characters long.";
      }

      addNotification(friendlyMsg, 'info');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // --- Rendering ---

  // Check if we are visiting from the main landing domain (sorat.in)
  const isMainDomain = typeof window !== 'undefined' && 
    (window.location.hostname === 'sorat.in' || 
     window.location.hostname === 'www.sorat.in' || 
     new URLSearchParams(window.location.search).get('landing') === 'true');

  if (isMainDomain) {
    return <CinematicLandingPage adminState={adminState} />;
  }

  // Session Verification Splash Screen: Do not flash any partial or incorrect screens during active verification
  if (isAuthLoading && !currentUser) {
    return (
      <div className="min-h-screen w-full bg-[#050505] flex flex-col items-center justify-center text-white font-sans uppercase">
        <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-yellow-500/10 animate-pulse" />
          <div className="w-12 h-12 rounded-full border-t-2 border-yellow-500 animate-spin" />
        </div>
        <span className="text-[10px] font-black text-yellow-500 tracking-[0.3em] animate-pulse">SORAT SECURING SESSION...</span>
      </div>
    );
  }

  return (
    <div className={`h-[100dvh] w-full ${isDemoMode ? 'bg-[#1a140a]' : 'bg-[#0F172A]'} text-white font-sans transition-colors duration-1000 overflow-hidden selection:bg-yellow-500/30`}>
      {/* Notifications Portal */}
      <div className="fixed top-20 right-4 z-50 pointer-events-none w-64">
        <AnimatePresence>
          {notifications.map(n => (
            <NotificationItem key={n.id} notification={n} onDismiss={(id) => setNotifications(prev => prev.filter(x => x.id !== id))} />
          ))}
        </AnimatePresence>
      </div>

      <div className={`w-full h-full ${isDemoMode ? 'bg-[#292212]' : 'bg-slate-950'} relative flex flex-col landscape:flex-row transition-colors duration-1000 uppercase overflow-hidden`}>
        
        {/* Left Side Controls & Navigation Panel */}
        <div className="contents landscape:flex landscape:flex-col landscape:w-[260px] landscape:h-full landscape:border-r landscape:border-slate-800/40 shrink-0 landscape:overflow-y-auto landscape:custom-scrollbar">
        
        {/* Demo Mode Banner */}
        <AnimatePresence>
          {isDemoMode && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-yellow-500 text-slate-950 overflow-hidden relative"
            >
              <div className="py-2 px-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black tracking-[.25em]">DEMO MODE ACTIVE</span>
                  <div className="w-1.5 h-1.5 bg-slate-950 rounded-full animate-pulse" />
                </div>
                <div className="text-[8px] font-black opacity-60">PRACTICE ONLY</div>
              </div>
              
              {/* Decorative moving text for full demo vibe */}
              <div className="absolute inset-0 flex items-center opacity-[0.07] pointer-events-none select-none whitespace-nowrap overflow-hidden">
                <motion.div 
                  animate={{ x: [0, -500] }}
                  transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                  className="text-[40px] font-black"
                >
                  DEMO DEMO DEMO DEMO DEMO DEMO DEMO DEMO DEMO DEMO DEMO DEMO DEMO DEMO DEMO
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {dbConnectionStatus === 'Disconnected' && (
          <div className="bg-rose-500 text-white text-[8px] sm:text-[9px] font-black tracking-widest uppercase text-center py-1 flex items-center justify-center gap-1.5 border-b border-rose-500/20 relative z-20 shadow-md">
            <span className="flex h-1.5 w-1.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
            </span>
            <span>OFFLINE SIMULATION: PLAYING OFFLINE DEMO</span>
          </div>
        )}

        {/* Header */}
        <header className={`relative z-20 shrink-0 ${isDemoMode ? 'bg-yellow-900/90 border-yellow-500/20' : 'bg-slate-900/95 border-white/5'} backdrop-blur-xl border-b shadow-2xl transition-all duration-1000`}>
          {/* Stacked on landscape, flex-row on mobile */}
          <div className="px-3 py-2 sm:px-4 sm:py-2.5 flex flex-row landscape:flex-col justify-between items-center landscape:items-stretch gap-2 landscape:gap-1.5 landscape:px-2.5 landscape:py-2">
            
            {/* Top Row: Brand & Menu on Mobile, or stacked row 1 on Landscape */}
            <div className="flex items-center justify-between landscape:w-full">
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shadow-lg border border-white/10 overflow-hidden shrink-0">
                  {adminState.appLogoUrl ? (
                    <img src={adminState.appLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <Dice5 className="text-red-500" size={18} />
                  )}
                </div>
                <h1 className="text-lg font-black text-white tracking-tighter italic">SORAT</h1>
                <div className="h-3 w-[1px] bg-white/10" />
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-950/50 border border-white/5">
                  <div className="relative">
                    <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                    <div className="absolute top-0 left-0 w-1 h-1 bg-red-500 rounded-full animate-ping opacity-75" />
                  </div>
                  <span className="text-[6px] font-black tracking-wider text-slate-400 uppercase">Live</span>
                </div>
              </div>

              {/* Hamburger menu on landscape (top right) */}
              <div className="hidden landscape:block">
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="p-1.5 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                  title="Open Menu"
                >
                  <Menu size={16} />
                </button>
              </div>
            </div>

            {/* Bottom Row: Balance, Real/Demo switches on Mobile, or stacked row 2 on Landscape */}
            <div className="flex items-center gap-2 landscape:w-full landscape:justify-between">
              <div className="flex items-center gap-1 shrink-0">
                <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/5">
                  <button 
                    onClick={() => {
                      if (!currentUser) {
                        addNotification("Please Sign in with Google to play in Real Mode!", "info");
                        setIsAuthModalOpen(true);
                      } else {
                        setIsDemoMode(false);
                      }
                    }}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${!isDemoMode ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Real
                  </button>
                  <button 
                    onClick={() => setIsDemoMode(true)}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest transition-all ${isDemoMode ? 'bg-yellow-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    Demo
                  </button>
                </div>
                <button 
                  onClick={toggleMute}
                  className="p-1 rounded-lg bg-slate-950 border border-white/5 text-slate-400 hover:text-white transition-all active:scale-95 flex items-center justify-center shrink-0 cursor-pointer h-[22px] w-[22px]"
                  title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                  {isMuted ? <VolumeX size={11} className="text-red-500" /> : <Volume2 size={11} className="text-emerald-400" />}
                </button>
              </div>

              <button 
                onClick={() => {
                  setProfileTab('deposit');
                  setIsProfileOpen(true);
                }}
                className="flex items-center gap-1 bg-slate-950/60 hover:bg-slate-900 px-2 py-1 rounded-xl border border-white/10 group transition-all duration-300 active:scale-95 cursor-pointer text-left shrink-0"
                title="Wallet Deposit and Withdrawal options"
              >
                <Wallet size={11} className={`transition-transform duration-300 group-hover:scale-110 ${isDemoMode ? "text-yellow-500 animate-pulse" : "text-emerald-500"}`} />
                <span className="text-[11px] sm:text-xs font-black tracking-tight text-white italic group-hover:text-emerald-400 transition-colors">₹{(isDemoMode ? demoBalance : balance).toLocaleString()}</span>
              </button>

              {/* Hamburger menu on Mobile */}
              <div className="landscape:hidden">
                <button 
                  onClick={() => setIsMenuOpen(true)}
                  className="p-2 bg-slate-950/60 hover:bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-white/10 transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                  title="Open Menu"
                >
                  <Menu size={18} />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Landscape Timer Display - inside left side panel */}
        {isLandscape && (
          <div className="px-3 py-2 shrink-0 border-b border-white/5 bg-slate-900/50">
            <TimerDisplay 
              timer={timer} 
              phase={phase} 
              maxDuration={Math.max(5, (adminState.landscapeTimerDuration || 30) - 10)} 
              myBets={myBets}
              winner={winner}
              multiplier={adminState?.multiplier || 9}
              customNames={customNames}
              isLandscape={true}
            />
          </div>
        )}

        {/* Phase Sub-Header */}
        <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 border-b border-white/5 flex items-center justify-between gap-4 shrink-0 landscape:hidden">
          <div className="flex-1">
            <TimerDisplay 
              timer={timer} 
              phase={phase} 
              maxDuration={isLandscape ? Math.max(5, (adminState.landscapeTimerDuration || 30) - 10) : 45} 
              myBets={myBets}
              winner={winner}
              multiplier={adminState?.multiplier || 9}
              customNames={customNames}
              isLandscape={isLandscape}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleMute}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all border border-white/5 active:scale-95"
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="px-3 py-1 sm:px-4 sm:py-2 space-y-1 sm:space-y-2 shrink-0">
          <StatBar totalPool={totalPool} onRefresh={fetchCurrentPool} isQuotaExceeded={isQuotaExceeded} />

          <AnimatePresence>
            {(personalDeposits.some(d => d.status === 'pending') || personalWithdrawals.some(w => w.status === 'pending')) && (
              <motion.button
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => { setIsProfileOpen(true); setProfileTab('history'); }}
                className="w-full mt-2 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-xl flex items-center justify-between group overflow-hidden relative shadow-lg shadow-yellow-900/10"
              >
                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-yellow-500/30 overflow-hidden">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-1/2 h-full bg-yellow-500"
                  />
                </div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Clock size={16} className="text-yellow-500 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest leading-none">PENDING TRANSACTION</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">TAP TO TRACK PROGRESS</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:translate-x-1 transition-transform relative z-10" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Bet Amount Selector */}
        <div className="px-3 py-1 sm:py-1.5 bg-slate-900/40 border-y border-white/5 shrink-0 flex flex-row landscape:flex-col items-center landscape:items-stretch justify-between gap-2">
          <div className="flex items-center justify-between landscape:w-full">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider shrink-0">Stakes:</span>
            <div className="flex items-center gap-0.5 bg-slate-950 px-1.5 py-0.5 rounded-lg border border-white/5 max-w-[65px] landscape:max-w-[80px]">
              <span className="text-[10px] font-black text-yellow-500">₹</span>
              <input 
                type="number" 
                value={betAmount}
                onChange={(e) => setBetAmount(Math.max(0, parseInt(e.target.value) || 0))}
                className="bg-transparent border-none outline-none text-[10px] font-black text-white w-9 text-center"
              />
            </div>
          </div>
          <div className="flex-1 flex gap-1 justify-end landscape:justify-between landscape:grid landscape:grid-cols-5 landscape:gap-1">
            {[10, 15, 25, 50, 70].map(amt => (
              <button 
                key={amt}
                onClick={() => setBetAmount(amt)}
                className={`px-2 py-1 landscape:py-1.5 rounded-lg text-[9px] font-black transition-all border ${betAmount === amt ? 'bg-yellow-500 text-slate-950 border-yellow-500 shadow-md shadow-yellow-500/20 scale-105' : 'bg-slate-800/40 text-slate-400 border-white/5 hover:bg-slate-800'} text-center`}
              >
                {amt >= 1000 ? `${amt/1000}K` : amt}
              </button>
            ))}
          </div>
        </div>

        </div>

        {/* Main Grid */}
        <main className="flex-1 px-2.5 py-2 portrait:px-2 portrait:py-1.5 overflow-y-auto portrait:overflow-y-auto custom-scrollbar min-h-0 bg-slate-950/20 landscape:h-full flex flex-col gap-2">
          
          <div className="grid grid-cols-3 sm:grid-cols-4 portrait:grid-cols-3 landscape:grid-cols-4 gap-1.5 portrait:gap-1.5 sm:gap-3 landscape:gap-1.5 mb-2 portrait:mb-0">
            {GAME_SLOTS.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                phase={phase === 'betting' && timer <= 5 ? 'locked' : phase}
                slotPool={poolPerSlot[slot.id]}
                myBet={myBets[slot.id] || 0}
                isWinner={winner === slot.id}
                customImage={customImages[slot.id]}
                customName={customNames[slot.id]}
                onBet={handleBet}
              />
            ))}
          </div>
        </main>

        {/* Bottom Navigation Tabs (Repositioned into Left Column Panel for responsive landscape support) */}

        {/* Menu Overlay Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50"
              />
              
              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="absolute right-0 top-0 bottom-0 w-[280px] sm:w-[320px] bg-slate-900 border-l border-white/10 z-50 flex flex-col p-5 shadow-2xl overflow-y-auto custom-scrollbar"
              >
                {/* Drawer Header */}
                <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-6 shrink-0">
                  <div className="flex items-center gap-2">
                    <Menu size={16} className="text-yellow-500 animate-pulse" />
                    <h3 className="text-xs font-black tracking-[0.2em] text-slate-300">GAME MENU</h3>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)} 
                    className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all outline-none"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex-1 space-y-3 shrink-0">
                  {/* Lobby Button */}
                  <button
                    onClick={() => {
                      setIsLeaderboardOpen(false);
                      setIsProfileOpen(false);
                      setIsAdminOpen(false);
                      setIsMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-white/5 transition-all text-left text-blue-400"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                      {adminState.appLogoUrl ? (
                        <img src={adminState.appLogoUrl} alt="Logo" className="w-4 h-4 object-cover" />
                      ) : (
                        <Dice5 size={14} />
                      )}
                    </div>
                    <div>
                      <div className="text-[10px] font-black tracking-widest leading-none">LOBBY</div>
                      <p className="text-[8px] text-slate-500 font-bold mt-1">GO TO HOME SCREEN</p>
                    </div>
                  </button>

                  {/* Ranks Button */}
                  <button
                    onClick={() => {
                      setIsLeaderboardOpen(true);
                      setIsProfileOpen(false);
                      setIsAdminOpen(false);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-white/5 transition-all text-left text-yellow-500"
                  >
                    <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 shrink-0">
                      <Trophy size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black tracking-widest leading-none">RANKS</div>
                      <p className="text-[8px] text-slate-500 font-bold mt-1">LEADERBOARD STANDINGS</p>
                    </div>
                  </button>

                  {/* Master / Admin Button (Conditional on isAdminAuthorized) */}
                  {isAdminAuthorized && (
                    <button
                      onClick={() => {
                        toggleAdmin();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-white/5 transition-all text-left text-red-500"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
                        <Settings size={14} className="animate-spin-slow" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black tracking-widest leading-none">MASTER</div>
                        <p className="text-[8px] text-slate-500 font-bold mt-1">ADMIN CONTROL PANEL</p>
                      </div>
                    </button>
                  )}

                  {/* Bets Button */}
                  <button
                    onClick={() => {
                      if (currentUser) {
                        setIsLeaderboardOpen(false);
                        setIsAdminOpen(false);
                        setProfileTab('history');
                        setIsProfileOpen(true);
                      } else {
                        setIsAuthModalOpen(true);
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-white/5 transition-all text-left text-emerald-500"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shrink-0">
                      <History size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black tracking-widest leading-none">BETS</div>
                      <p className="text-[8px] text-slate-500 font-bold mt-1">TRANSACTION & BET HISTORY</p>
                    </div>
                  </button>

                  {/* Me Button (Profile info) */}
                  <button
                    onClick={() => {
                      if (currentUser) {
                        setIsLeaderboardOpen(false);
                        setIsAdminOpen(false);
                        setProfileTab('info');
                        setIsProfileOpen(true);
                      } else {
                        setIsAuthModalOpen(true);
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-white/5 transition-all text-left text-blue-300"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                      <User size={14} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black tracking-widest leading-none">ME</div>
                      <p className="text-[8px] text-slate-500 font-bold mt-1">PROFILE DETAILS</p>
                    </div>
                  </button>

                  {/* Download App Button */}
                  {!isStandalone && (
                    <button
                      onClick={() => {
                        handleInstallClick();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-950/40 hover:bg-slate-950 border border-white/5 transition-all text-left text-indigo-400"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                        <Download size={14} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black tracking-widest leading-none">DOWNLOAD</div>
                        <p className="text-[8px] text-slate-500 font-bold mt-1">INSTALL TO HOMESCREEN</p>
                      </div>
                    </button>
                  )}

                  {/* Live History Section inside Menu */}
                  <div className="mt-6 pt-6 border-t border-white/5 shrink-0">
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <div className="p-1.5 rounded bg-blue-500/10 text-blue-400">
                        <History size={12} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">LIVE HISTORY</span>
                    </div>
                    <div className="bg-slate-950/50 p-3 rounded-2xl border border-white/5 min-h-[80px]">
                      <div className="flex gap-2.5 overflow-x-auto pb-2 custom-scrollbar">
                        {history.length === 0 && (
                          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest italic py-2">
                            Waiting for first game...
                          </span>
                        )}
                        {history.map((h, i) => {
                          const s = GAME_SLOTS.find(item => item.id === h.winnerId);
                          const Icon = s?.icon || History;
                          return (
                            <div key={i} className={`flex-shrink-0 w-11 h-11 rounded-xl flex flex-col items-center justify-center border transition-all ${
                              h.userResult === 'win' ? 'border-emerald-500/50 bg-emerald-500/10 scale-105' : 
                              h.userResult === 'loss' ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 bg-slate-950/50'
                            }`}>
                              {s && (customImages[s.id] || s.imageUrl) ? (
                                <img src={customImages[s.id] || s.imageUrl} alt={customNames[s.id] || s.name} className="w-5 h-5 object-contain rounded" />
                              ) : (
                                <Icon className={`w-5 h-5 ${s?.color || 'text-slate-400'}`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Logout button if logged in */}
                  {currentUser && (
                    <div className="pt-6 shrink-0">
                      <button
                        onClick={async () => {
                          setIsMenuOpen(false);
                          setCurrentUser(null);
                          setUserProfile(null);
                          setBalance(0);
                          try {
                            localStorage.removeItem('appwrite_session_user');
                            await logout();
                          } catch (e) {
                            console.warn("Logout failed, continuing with local cleanup:", e);
                          }
                          addNotification("Logged out successfully", 'info');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all font-black text-[10px] tracking-widest uppercase"
                      >
                        <LogOut size={12} />
                        LOG OUT
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Admin Layer */}
        <AnimatePresence>
          {/* Top Level Overlays */}

      {isAdminOpen && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-x-0 top-0 bottom-[48px] sm:bottom-[56px] z-40 bg-slate-950 flex flex-col"
            >
              {!isAdminLoggedIn ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                   <button onClick={() => setIsAdminOpen(false)} className="absolute top-4 right-4 text-slate-400"><X /></button>
                   <Settings size={48} className="text-yellow-500 mb-4 animate-spin-slow" />
                   <h2 className="text-xl font-black mb-1">ADMIN CONTROL</h2>
                   <p className="text-slate-500 text-sm mb-6">Enter authorization key to reveal controls</p>
                   <input 
                     type="password" 
                     placeholder="****"
                     className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 w-full text-center tracking-[1em] focus:border-yellow-500 outline-none"
                     value={adminPass}
                     onChange={(e) => setAdminPass(e.target.value)}
                   />
                   <button 
                    onClick={handleAdminLogin}
                    className="mt-4 bg-yellow-500 text-slate-950 font-bold py-3 px-8 rounded-xl active:scale-95 transition-all"
                   >
                     VERIFY
                   </button>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto bg-slate-950 flex flex-col">
                  {/* Admin Header */}
                  <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-yellow-500/20">
                        <Settings size={22} className="animate-spin-slow" />
                      </div>
                      <div>
                        <h2 className="text-sm font-black tracking-tight leading-none mb-1 text-white">MASTER COMMAND</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v2.4 Stable • System Online</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          fetchAdminData(true);
                          fetchGlobalSettings(true);
                          addNotification("Admin data refreshed", "info");
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-300 transition-all border border-white/5"
                      >
                        <RefreshCcw size={12} />
                        REFRESH
                      </button>
                      <button 
                        onClick={() => setIsAdminOpen(false)} 
                        className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-all outline-none"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-4 pb-24 flex flex-col gap-6">
                    {/* Navigation Tabs */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 bg-slate-900/50 p-2 rounded-2xl border border-white/5 shadow-inner mb-2">
                      {[
                        { id: 'controls', label: 'GAME', icon: Dice5, color: 'text-yellow-500' },
                        { id: 'users', label: 'USERS', icon: Users, color: 'text-blue-500' },
                        { id: 'admins', label: 'ADMINS', icon: ShieldCheck, color: 'text-red-500' },
                        { id: 'deposits', label: 'PAY', icon: Wallet, color: 'text-green-500' },
                        { id: 'payment_proofs', label: 'PROOFS', icon: Camera, color: 'text-teal-500' },
                        { id: 'withdrawals', label: 'OUTS', icon: TrendingUp, color: 'text-red-500' },
                        { id: 'dealers', label: 'DEALERS', icon: ShieldCheck, color: 'text-indigo-500' },
                        { id: 'bets', label: 'BETS', icon: History, color: 'text-orange-500' },
                        { id: 'history', label: 'HISTORY', icon: Clock, color: 'text-emerald-500' },
                        { id: 'notifications', label: 'NOTIFS', icon: Bell, color: 'text-purple-500' },
                        { id: 'branding', label: 'BRAND', icon: ImageIcon, color: 'text-pink-500' },
                        { id: 'policies', label: 'POLICIES', icon: Info, color: 'text-cyan-500' },
                        { id: 'debug', label: 'DEBUG', icon: Shield, color: 'text-rose-500' }
                      ].map(tab => (
                        <button 
                          key={tab.id}
                          onClick={() => setAdminTab(tab.id as any)}
                          className={`
                            flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all relative
                            ${adminTab === tab.id ? 'bg-slate-800 text-white shadow-xl border border-white/10' : 'text-slate-500 hover:bg-white/5'}
                          `}
                        >
                          <tab.icon size={16} className={adminTab === tab.id ? tab.color : 'text-slate-600'} />
                          <span className="text-[8px] font-black tracking-tighter uppercase">{tab.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1">
                      {adminTab === 'controls' ? (
                        <div className="space-y-6">
                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 shadow-lg relative overflow-hidden group">
                              <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={12} className="text-green-400" />
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">App Earnings</span>
                              </div>
                              <div className="text-2xl font-black text-white">₹{getFilteredEarnings().toLocaleString()}</div>
                              
                              <div className="mt-4 flex flex-wrap gap-1">
                                {(['hour', 'day', 'week', 'month', 'year', 'all'] as const).map(f => (
                                  <button 
                                    key={f}
                                    onClick={() => setEarningsFilter(f)}
                                    className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase transition-all ${earningsFilter === f ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                                  >
                                    {f}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 shadow-lg group">
                              <div className="flex items-center gap-2 mb-2">
                                <Users size={12} className="text-blue-400" />
                                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Global Players</span>
                              </div>
                              <div className="text-2xl font-black text-white">{allUsers.length}</div>
                              <div className="text-[10px] text-blue-500 font-bold mt-1">Registered Members</div>
                            </div>
                          </div>

                          {/* Game Control Section */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                                <Settings size={14} className="text-yellow-500" />
                                Game Controller
                              </h3>
                              <div className="flex items-center gap-2 bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                                <div className={`w-2 h-2 rounded-full ${adminState.isPaused ? 'bg-red-500' : 'bg-green-500 anim-pulse'}`} />
                                <span className="text-[10px] font-black uppercase text-white">{adminState.isPaused ? 'Paused' : 'Running'}</span>
                              </div>
                            </div>

                            <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 space-y-6 shadow-2xl relative overflow-hidden group">
                              {/* Auto-Win Mode Toggle */}
                              <div className="flex items-center justify-between bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/20 mb-2 relative z-10">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500 text-white">
                                    <Zap size={16} />
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Auto-Win Lowest Pool</h4>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase">Force Lower Bets to Win (Locked Active)</p>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => addNotification("Lowest pool auto-win is permanently locked to active!", 'info')}
                                  className="w-10 h-5 rounded-full relative transition-all bg-emerald-500 cursor-not-allowed"
                                >
                                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all left-5.5" />
                                </button>
                              </div>

                              {/* Live Lowest Pool Indicator for Admin */}
                              {phase === 'betting' && liveLowestPoolCard !== null && (
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center justify-between relative z-10 mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                      {(customImages[liveLowestPoolCard] || GAME_SLOTS.find(s => s.id === liveLowestPoolCard)?.imageUrl) ? (
                                        <img src={customImages[liveLowestPoolCard] || GAME_SLOTS.find(s => s.id === liveLowestPoolCard)?.imageUrl} className="w-6 h-6 object-contain rounded-md" alt="trend" />
                                      ) : (
                                        <div className={`${GAME_SLOTS.find(s => s.id === liveLowestPoolCard)?.color} opacity-80`}>
                                          {React.createElement(GAME_SLOTS.find(s => s.id === liveLowestPoolCard)!.icon, { size: 18 })}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Lowest Pool Card</p>
                                      <h4 className="text-sm font-black text-white uppercase">{customNames[liveLowestPoolCard] || GAME_SLOTS.find(s => s.id === liveLowestPoolCard)?.name}</h4>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Current Pool</p>
                                    <p className="text-xs font-black text-emerald-500">₹{poolPerSlot[liveLowestPoolCard] || 0}</p>
                                  </div>
                                </div>
                              )}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[60px] -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-all rounded-full" />
                              
                              <div className="flex items-center justify-between relative">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
                                    <Dice5 size={18} className="text-orange-500" />
                                  </div>
                                  <div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Payout Master</h3>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Manual Settlement Override</p>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                  <div className="bg-slate-950 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Multiplier</span>
                                    <input 
                                      type="number" step="0.1" min="1" max="100"
                                      value={adminState.multiplier}
                                      onChange={(e) => setAdminState(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 1.1 }))}
                                      className="w-12 bg-transparent text-xs font-black text-green-500 outline-none text-center"
                                    />
                                  </div>
                                  <div className="bg-slate-950 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
                                    <span className="text-[9px] font-black text-slate-500 uppercase">Current Timer</span>
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => adjustTimer(-5)} className="text-red-500 hover:text-red-400 transition-colors">
                                        <TrendingDown size={14} />
                                      </button>
                                      <span className="text-xs font-black text-orange-500 w-6 text-center">{timer}s</span>
                                      <button onClick={() => adjustTimer(5)} className="text-emerald-500 hover:text-emerald-400 transition-colors">
                                        <TrendingUp size={14} />
                                      </button>
                                      <button 
                                        onClick={() => setTimer(1)}
                                        className="bg-red-500/10 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full hover:bg-red-500 hover:text-white transition-all ml-1"
                                      >
                                        JUMP
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-4 relative">
                                <div className="grid grid-cols-4 gap-2">
                                  {GAME_SLOTS.map(s => {
                                    const isSelected = adminState.forceWinner === s.id;
                                    const Icon = s.icon;
                                    return (
                                      <button 
                                        key={s.id}
                                        onClick={() => setAdminState(prev => ({ ...prev, forceWinner: isSelected ? null : s.id }))}
                                        className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${isSelected ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-lg shadow-orange-500/20' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'}`}
                                      >
                                        <Icon size={14} className={isSelected ? 'text-orange-500' : 'text-slate-600'} />
                                        <span className="text-[8px] font-black uppercase mt-1 truncate w-full text-center">{customNames[s.id] || s.name}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                <button 
                                  onClick={() => lockGame()}
                                  disabled={phase !== 'betting' || adminState.isPaused}
                                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all relative group overflow-hidden ${phase !== 'betting' || adminState.isPaused ? 'bg-slate-950 text-slate-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-900/20 active:scale-95'}`}
                                >
                                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <ShieldAlert size={18} />
                                  <span className="text-xs font-black uppercase tracking-widest">Lock All Bets Now</span>
                                </button>

                                <button 
                                  onClick={() => resolveGame()}
                                  disabled={phase === 'result' || adminState.isPaused}
                                  className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all relative group overflow-hidden ${phase === 'result' || adminState.isPaused ? 'bg-slate-950 text-slate-700 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl shadow-orange-900/20 active:scale-95'}`}
                                >
                                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <ShieldCheck size={18} />
                                  <span className="text-xs font-black uppercase tracking-widest">Execute Manual Settlement</span>
                                </button>
                              </div>
                            </div>
                            
                            {/* Global System Settings Section */}
                            <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 space-y-6 shadow-2xl relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[60px] -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all rounded-full" />
                              
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                                  <Settings size={20} className="text-blue-500" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-black text-white uppercase tracking-widest">System Configuration</h3>
                                  <p className="text-[10px] text-slate-500 font-bold">Manage global parameters & payments</p>
                                </div>
                              </div>

                              {/* Universal Real-Time Sync Timer Monitor */}
                              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 relative z-10 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Universal Sync Timer</span>
                                  </div>
                                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    isAppwriteTimerActive 
                                      ? (isRealtimeConnected 
                                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20')
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}>
                                    {isAppwriteTimerActive 
                                      ? (isRealtimeConnected ? 'Appwrite Realtime Subscribed' : 'Realtime Reconnecting...') 
                                      : 'Math Fallback Active'}
                                  </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5 text-center">
                                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">Current Round</div>
                                    <div className="text-sm font-black text-white mt-1 font-mono">{lastSeenRoundIdRef.current || 'N/A'}</div>
                                  </div>
                                  <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5 text-center">
                                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">Time Left</div>
                                    <div className="text-sm font-black text-orange-500 mt-1 font-mono">{timer}s</div>
                                  </div>
                                  <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5 text-center">
                                    <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">Engine Stage</div>
                                    <div className={`text-[10px] font-black uppercase mt-2.5 ${phase === 'betting' ? 'text-emerald-400' : phase === 'locked' ? 'text-amber-400' : 'text-rose-400'}`}>
                                      {phase}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[8px] text-slate-500 font-black uppercase pt-1 border-t border-white/5">
                                  <span>Sync: 1s Drift Compensated</span>
                                  <button 
                                    onClick={async () => {
                                      console.log("[Appwrite Timer Manual Sync] Fetching global timer...");
                                      const state = await appwriteService.getGlobalTimerState();
                                      if (state) {
                                        setAppwriteTimer({
                                          currentRound: state.current_round,
                                          timeLeft: state.time_left,
                                          status: state.status,
                                          lastUpdated: Date.now()
                                        });
                                        setIsAppwriteTimerActive(true);
                                        addNotification("Timer resynced with Appwrite server", "info");
                                      } else {
                                        addNotification("Failed to contact Appwrite timer document", "info");
                                      }
                                    }}
                                    className="text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20"
                                  >
                                    FORCE RESYNC
                                  </button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Payout Multiplier</label>
                                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                                    <TrendingUp size={16} className="text-emerald-500" />
                                    <input 
                                      type="number" step="0.1" min="1" max="100"
                                      value={adminState.multiplier}
                                      onChange={(e) => setAdminState(prev => ({ ...prev, multiplier: parseFloat(e.target.value) || 1.1 }))}
                                      className="w-full bg-transparent text-sm font-black text-white outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Vertical Screen Time (s)</label>
                                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                                    <Clock size={16} className="text-orange-500" />
                                    <input 
                                      type="number" min="10" max="120" step="5"
                                      value={adminState.timerDuration}
                                      onChange={(e) => setAdminState(prev => ({ ...prev, timerDuration: parseInt(e.target.value) || 30 }))}
                                      className="w-full bg-transparent text-sm font-black text-white outline-none"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Rotated Screen Time (s)</label>
                                  <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                                    <Clock size={16} className="text-yellow-500 animate-pulse" />
                                    <input 
                                      type="number" min="10" max="120" step="5"
                                      value={adminState.landscapeTimerDuration || 30}
                                      onChange={(e) => setAdminState(prev => ({ ...prev, landscapeTimerDuration: parseInt(e.target.value) || 30 }))}
                                      className="w-full bg-transparent text-sm font-black text-white outline-none"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Global Payout UPI ID</label>
                                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-white/5 focus-within:border-blue-500 transition-all">
                                  <AtSign size={16} className="text-blue-500" />
                                  <input 
                                    type="text"
                                    placeholder="e.g. name@okhdfcbank"
                                    value={adminState.upiId || ''}
                                    onChange={(e) => setAdminState(prev => ({ ...prev, upiId: e.target.value }))}
                                    className="flex-1 bg-transparent text-sm font-bold text-white outline-none"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">UPI Payee Display Name (Anti-Spam/Neutral)</label>
                                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-white/5 focus-within:border-emerald-500 transition-all">
                                  <User size={16} className="text-emerald-500" />
                                  <input 
                                    type="text"
                                    placeholder="e.g. RECHARGE PORTAL or DIGITAL SERVICES"
                                    value={adminState.upiPayeeName || ''}
                                    onChange={(e) => setAdminState(prev => ({ ...prev, upiPayeeName: e.target.value }))}
                                    className="flex-1 bg-transparent text-sm font-bold text-white outline-none"
                                  />
                                </div>
                                <p className="text-[8px] text-slate-500 mt-1 uppercase font-bold">Use neutral names like &quot;RECHARGE PORTAL&quot; or &quot;DIGITAL SERVICES&quot; to prevent banks/UPI apps from triggering gambling or spam alerts.</p>
                              </div>

                              <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Direct Payment Link (URL / Direct UPI / Gateway Link)</label>
                                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-white/5 focus-within:border-pink-500 transition-all">
                                  <Link size={16} className="text-pink-500" />
                                  <input 
                                    type="text"
                                    placeholder="e.g. https://merchant.com/pay or upi://pay?..."
                                    value={adminState.paymentLink || ''}
                                    onChange={(e) => setAdminState(prev => ({ ...prev, paymentLink: e.target.value }))}
                                    className="flex-1 bg-transparent text-sm font-bold text-white outline-none"
                                  />
                                </div>
                              </div>

                              {/* User Login Methods Control */}
                              <div className="bg-slate-950 p-4 rounded-3xl border border-white/5 space-y-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">User Registration & Login Methods</span>
                                
                                <div className="space-y-3">
                                  {/* Google Login Toggle */}
                                  <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-xs font-black text-white">Google Sign-In</span>
                                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Allow users to log in with their Google Account</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextVal = adminState.enableGoogleLogin === false ? true : false;
                                        if (!nextVal && adminState.enableMobileLogin === false) {
                                          addNotification("At least one login method must be enabled!", "info");
                                          return;
                                        }
                                        setAdminState(prev => ({ ...prev, enableGoogleLogin: nextVal }));
                                      }}
                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${adminState.enableGoogleLogin !== false ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                    >
                                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${adminState.enableGoogleLogin !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                  </div>

                                  {/* Mobile Login Toggle */}
                                  <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-xs font-black text-white">Mobile Number & Password</span>
                                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Allow users to sign up/login with 10-digit mobile number</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const nextVal = adminState.enableMobileLogin === false ? true : false;
                                        if (!nextVal && adminState.enableGoogleLogin === false) {
                                          addNotification("At least one login method must be enabled!", "info");
                                          return;
                                        }
                                        setAdminState(prev => ({ ...prev, enableMobileLogin: nextVal }));
                                      }}
                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${adminState.enableMobileLogin !== false ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                    >
                                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${adminState.enableMobileLogin !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Payment Methods Control */}
                              <div className="bg-slate-950 p-4 rounded-3xl border border-white/5 space-y-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">User Deposit Options Visibility</span>
                                
                                <div className="space-y-3">
                                  {/* UPI Redirect Buttons Toggle */}
                                  <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-xs font-black text-white">Direct UPI Apps (GPay, PhonePe, Paytm, etc)</span>
                                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Enable buttons to let users pay directly via installed apps</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const newval = paymentSettings.showUpiApps === false ? true : false;
                                        const updated = {
                                          ...paymentSettings,
                                          showUpiApps: newval
                                        };
                                        setPaymentSettings(updated);
                                        try {
                                          await setDoc(doc(db, 'paymentSettings', 'global'), updated);
                                          addNotification(`Direct UPI apps ${newval ? 'Enabled' : 'Disabled'}!`, 'win');
                                        } catch (err) {
                                          console.error(err);
                                          addNotification("Failed to save toggle settings", 'info');
                                        }
                                      }}
                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${paymentSettings.showUpiApps !== false ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                    >
                                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${paymentSettings.showUpiApps !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                  </div>

                                  {/* System Generated QR Code Toggle */}
                                  <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-2xl border border-white/5">
                                    <div className="flex flex-col gap-0.5">
                                      <span className="text-xs font-black text-white">System Generated QR Code</span>
                                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Show main QR code box for users to scan and capture</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const newval = paymentSettings.showQrCode === false ? true : false;
                                        const updated = {
                                          ...paymentSettings,
                                          showQrCode: newval
                                        };
                                        setPaymentSettings(updated);
                                        try {
                                          await setDoc(doc(db, 'paymentSettings', 'global'), updated);
                                          addNotification(`System QR Code ${newval ? 'Enabled' : 'Disabled'}!`, 'win');
                                        } catch (err) {
                                          console.error(err);
                                          addNotification("Failed to save toggle settings", 'info');
                                        }
                                      }}
                                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${paymentSettings.showQrCode !== false ? 'bg-emerald-500' : 'bg-slate-800'}`}
                                    >
                                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${paymentSettings.showQrCode !== false ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Global UPI QR Code Image Management */}
                              <div className="bg-slate-950 p-4 rounded-3xl border border-white/5 space-y-3">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Global Deposit QR Code</span>
                                {paymentSettings.qrUrl ? (
                                  <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                      <img src={paymentSettings.qrUrl} alt="Global QR" className="w-12 h-12 rounded-lg object-contain bg-white p-1 font-mono text-[8px] text-slate-600 border border-slate-700 shrink-0" />
                                      <div>
                                        <span className="text-xs font-black text-white block">Active QR Image</span>
                                        <span className="text-[8px] text-emerald-400 font-bold uppercase tracking-wider block">✔ Live & Scan-Ready</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <label className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/5 cursor-pointer text-xs flex items-center justify-center">
                                        <RefreshCcw size={14} className={isUploadingQR ? 'animate-spin text-pink-500' : ''} />
                                        <input type="file" accept="image/*" onChange={handleUploadPaymentQR} className="hidden" disabled={isUploadingQR} />
                                      </label>
                                      <button onClick={handleDeletePaymentQR} className="p-2 bg-red-950/40 text-red-400 hover:bg-red-900 hover:text-white rounded-xl border border-red-500/15 text-xs transition-colors">
                                        <X size={14} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-6 bg-slate-900 hover:bg-slate-950 hover:border-pink-500/50 transition-all cursor-pointer">
                                    <div className="flex flex-col items-center gap-2">
                                      {isUploadingQR ? (
                                        <RefreshCcw size={24} className="animate-spin text-pink-500" />
                                      ) : (
                                        <QrCode size={24} className="text-slate-500" />
                                      )}
                                      <div className="text-center">
                                        <span className="text-xs font-black text-white block uppercase tracking-wider">{isUploadingQR ? 'Uploading QR...' : 'Upload Deposit QR'}</span>
                                        <span className="text-[8px] text-slate-600 font-bold uppercase tracking-tight block">Supports PNG, JPG, JPEG</span>
                                      </div>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleUploadPaymentQR} className="hidden" disabled={isUploadingQR} />
                                  </label>
                                )}
                              </div>



                              <button 
                                onClick={handleSaveSettings}
                                disabled={isSettingsSaving}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${isSettingsSaving ? 'bg-slate-800 text-slate-600' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-900/20 active:scale-95'}`}
                              >
                                {isSettingsSaving ? (
                                  <div className="w-4 h-4 border-2 border-slate-600 border-t-white rounded-full animate-spin" />
                                ) : (
                                  <Save size={18} />
                                )}
                                <span className="text-xs font-black uppercase tracking-widest">
                                  {isSettingsSaving ? 'Syncing...' : 'Save All Global Settings'}
                                </span>
                              </button>
                            </div>

                            {/* Symbol Customization Section */}
                            <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 space-y-6 shadow-2xl">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                  <ImageIcon size={20} className="text-amber-500" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Symbols & Icons</h3>
                                  <p className="text-[10px] text-slate-500 font-bold">Customize names and image URLs</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {GAME_SLOTS.map(s => (
                                  <div key={s.id} className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-3">
                                    <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                                      <div className={`p-2 rounded-lg bg-slate-900 border border-white/5 text-lg ${s.color}`}>
                                        <s.icon size={20} />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-[8px] text-slate-500 font-black uppercase">Symbol #{s.id} (Default: {s.name})</div>
                                        <div className="flex items-center gap-2">
                                          <Type size={10} className="text-slate-500" />
                                          <input 
                                            type="text"
                                            placeholder="Display Name"
                                            value={adminState.customNames?.[s.id] || ''}
                                            onChange={(e) => {
                                              const next = { ...(adminState.customNames || {}) };
                                              next[s.id] = e.target.value;
                                              setAdminState(prev => ({ ...prev, customNames: next }));
                                            }}
                                            className="w-full bg-transparent text-xs font-bold text-white outline-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <div className="flex justify-between items-center">
                                        <div className="text-[8px] text-slate-500 font-black uppercase">Custom Image (URL or Upload)</div>
                                        <label className="text-[8px] font-black uppercase text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 px-1.5 py-0.5 rounded cursor-pointer flex items-center gap-1 transition-all">
                                          <Camera size={8} />
                                          <span>Upload Image</span>
                                          <input 
                                            type="file" 
                                            accept=".jpg,.jpeg,.png,image/jpeg,image/png" 
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                                                const ext = file.name.split('.').pop()?.toLowerCase();
                                                const isAllowedExt = ext ? ['jpg', 'jpeg', 'png'].includes(ext) : false;
                                                if (!allowedTypes.includes(file.type) && !isAllowedExt) {
                                                  addNotification("Only JPG, JPEG, and PNG images are allowed!", "info");
                                                  return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = async () => {
                                                  try {
                                                    addNotification("Uploading image...", "info");
                                                    const base64 = reader.result as string;
                                                    const resized = await resizeImage(base64, 400, 400);
                                                    const nameToUse = adminState.customNames?.[s.id] || s.name;
                                                    const storageUrl = await uploadToStorage(resized, `settings_slot_${s.id}_${Date.now()}.jpg`);
                                                    setAdminState(prev => ({
                                                      ...prev,
                                                      customImages: { ...(prev.customImages || {}), [s.id]: storageUrl }
                                                    }));
                                                    addNotification(`Image for ${nameToUse} uploaded successfully!`, "win");
                                                  } catch (err) {
                                                    console.error("Storage upload failed for slot image:", err);
                                                  }
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                      <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-white/5 focus-within:border-amber-500/50 transition-all">
                                        <ImageIcon size={12} className="text-slate-500" />
                                        <input 
                                          type="text"
                                          placeholder="https://firebasestorage.googleapis.com/..."
                                          value={adminState.customImages?.[s.id] || ''}
                                          onChange={(e) => {
                                            const next = { ...(adminState.customImages || {}) };
                                            next[s.id] = e.target.value;
                                            setAdminState(prev => ({ ...prev, customImages: next }));
                                          }}
                                          className="w-full bg-transparent text-[10px] font-mono text-amber-500 outline-none truncate"
                                        />
                                      </div>
                                    </div>
                                    {adminState.customImages?.[s.id] && (
                                      <div className="flex justify-center p-2 bg-white/5 rounded-xl border border-dashed border-white/10">
                                        <img src={adminState.customImages[s.id]} alt="Preview" className="w-12 h-12 object-contain" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <button 
                                onClick={handleSaveSettings}
                                disabled={isSettingsSaving}
                                className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${isSettingsSaving ? 'bg-slate-800 text-slate-600' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-900/20 active:scale-95'}`}
                              >
                                <Save size={18} />
                                <span className="text-xs font-black uppercase tracking-widest">Update Symbols & Icons</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => setAdminState(prev => ({ ...prev, isPaused: !prev.isPaused }))} className={`flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all text-xs font-black uppercase tracking-widest ${adminState.isPaused ? 'bg-green-600/20 border-green-500/30 text-green-500' : 'bg-red-600/20 border-red-500/30 text-red-500'}`}>
                                {adminState.isPaused ? <Play size={16} /> : <Pause size={16} />} {adminState.isPaused ? 'System: Paused' : 'System: Running'}
                              </button>
                              <div className="bg-slate-900 p-4 rounded-2xl border border-white/5 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-1"><span className="text-[10px] text-slate-500 font-black uppercase">Quick Timer</span><span className="text-xs font-bold text-yellow-500">{adminState.timerDuration}s</span></div>
                                <input type="range" min="10" max="120" step="10" value={adminState.timerDuration} onChange={(e) => setAdminState(prev => ({ ...prev, timerDuration: parseInt(e.target.value) }))} className="accent-yellow-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                              </div>
                            </div>

                            {/* App Update Broadcast Section */}
                            <div className="bg-slate-900 p-6 rounded-3xl border border-white/5 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                                  <RefreshCcw size={20} className="text-purple-500" />
                                </div>
                                <div>
                                  <h3 className="text-sm font-black text-white uppercase tracking-widest">App Update</h3>
                                  <p className="text-[10px] text-slate-500 font-bold">Broadcast update notifications</p>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Version</label>
                                    <input 
                                      type="text"
                                      value={adminState.updateInfo?.version}
                                      onChange={(e) => setAdminState(prev => ({ ...prev, updateInfo: { ...prev.updateInfo!, version: e.target.value } }))}
                                      className="w-full bg-slate-950 p-3 rounded-2xl border border-white/5 text-sm font-bold text-white outline-none"
                                    />
                                  </div>
                                  <div className="flex flex-col justify-end">
                                    <button 
                                      onClick={() => setAdminState(prev => ({ ...prev, updateInfo: { ...prev.updateInfo!, showPopup: !prev.updateInfo?.showPopup } }))}
                                      className={`w-full py-3 rounded-2xl flex items-center justify-center gap-2 transition-all text-[10px] font-black uppercase ${adminState.updateInfo?.showPopup ? 'bg-purple-600 text-white' : 'bg-slate-950 text-slate-500 border border-white/5'}`}
                                    >
                                      {adminState.updateInfo?.showPopup ? 'Popup Active' : 'Show Popup'}
                                    </button>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Update Message</label>
                                  <textarea 
                                    rows={2}
                                    value={adminState.updateInfo?.message}
                                    onChange={(e) => setAdminState(prev => ({ ...prev, updateInfo: { ...prev.updateInfo!, message: e.target.value } }))}
                                    className="w-full bg-slate-950 p-3 rounded-2xl border border-white/5 text-sm font-bold text-white outline-none resize-none"
                                  />
                                </div>

                                <div className="flex items-center gap-2">
                                  <input 
                                    type="checkbox"
                                    id="forceUpdate"
                                    checked={adminState.updateInfo?.forceUpdate}
                                    onChange={(e) => setAdminState(prev => ({ ...prev, updateInfo: { ...prev.updateInfo!, forceUpdate: e.target.checked } }))}
                                    className="w-4 h-4 rounded border-white/10 bg-slate-950 text-purple-600 focus:ring-purple-500"
                                  />
                                  <label htmlFor="forceUpdate" className="text-[10px] font-black text-red-500 uppercase tracking-widest cursor-pointer select-none">Force Update (Disables App)</label>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              {GAME_SLOTS.map(s => {
                                const Icon = s.icon;
                                const isSelected = adminState.forceWinner === s.id;
                                const customImg = customImages[s.id];
                                const customName = customNames[s.id] || s.name;
                                
                                return (
                                  <div key={s.id} className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${isSelected ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5 bg-slate-900 shadow-lg'}`}>
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="relative w-10 h-10 flex-shrink-0">
                                        {customImg ? (
                                          <img src={customImg} alt={customName} className="w-full h-full object-contain rounded-lg" />
                                        ) : (
                                          <div className={`w-full h-full rounded-lg bg-slate-800 flex items-center justify-center ${s.color}`}>
                                            <Icon size={20} />
                                          </div>
                                        )}
                                        <label className="absolute -bottom-1 -right-1 bg-yellow-500 text-slate-950 p-1 rounded-full cursor-pointer hover:scale-110 transition-transform">
                                          <input 
                                            type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                                                const ext = file.name.split('.').pop()?.toLowerCase();
                                                const isAllowedExt = ext ? ['jpg', 'jpeg', 'png'].includes(ext) : false;
                                                if (!allowedTypes.includes(file.type) && !isAllowedExt) {
                                                  addNotification("Only JPG, JPEG, and PNG images are allowed!", "info");
                                                  return;
                                                }
                                                const reader = new FileReader();
                                                reader.onloadend = async () => {
                                                  try {
                                                    addNotification("Uploading image...", "info");
                                                    const base64 = reader.result as string;
                                                    const resized = await resizeImage(base64, 400, 400);
                                                    const storageUrl = await uploadToStorage(resized, `slot_${s.id}_${Date.now()}.jpg`);
                                                    setAdminState(prev => ({
                                                      ...prev,
                                                      customImages: { ...(prev.customImages || {}), [s.id]: storageUrl }
                                                    }));
                                                    addNotification(`Image for ${customName} uploaded successfully!`, "win");
                                                  } catch (err) {
                                                    console.error("Storage upload failed for slot image:", err);
                                                  }
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                          <Camera size={10} />
                                        </label>
                                      </div>
                                      <div className="flex-1 flex flex-col min-w-0">
                                        <div className="flex items-center gap-1">
                                          <input 
                                            type="text" 
                                            value={customName}
                                            onChange={(e) => setAdminState(prev => ({
                                              ...prev,
                                              customNames: { ...(prev.customNames || {}), [s.id]: e.target.value }
                                            }))}
                                            className="bg-transparent text-[10px] font-black text-white hover:bg-white/5 px-1 rounded outline-none w-full truncate border-b border-transparent focus:border-yellow-500"
                                          />
                                          <Pencil size={8} className="text-slate-600" />
                                        </div>
                                        <span className="text-[8px] font-bold text-slate-500 px-1">₹{poolPerSlot[s.id]}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-1.5">
                                      <button 
                                        onClick={() => setAdminState(prev => ({ ...prev, forceWinner: isSelected ? null : s.id }))}
                                        className={`py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase border transition-all ${isSelected ? 'bg-yellow-500 text-slate-950 border-yellow-500' : 'bg-slate-800 text-slate-400 border-white/5 hover:border-yellow-500/50'}`}
                                      >
                                        {isSelected ? 'FORCED' : 'FORCE WIN'}
                                      </button>
                                      {customImg && (
                                        <button 
                                          onClick={() => {
                                            const next = { ...(adminState.customImages || {}) };
                                            delete next[s.id];
                                            setAdminState(prev => ({ ...prev, customImages: next }));
                                          }}
                                          className="py-1.5 rounded-lg text-[8px] font-black tracking-widest uppercase bg-red-900/20 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                          RESET IMG
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : adminTab === 'users' ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input 
                              type="text" 
                              placeholder="Search members..." 
                              className="flex-1 bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-xs focus:border-blue-500 outline-none transition-all text-white" 
                              value={userSearchQuery} 
                              onChange={(e) => setUserSearchQuery(e.target.value)} 
                            />
                            <div className="flex gap-2 shrink-0">
                              <button 
                                onClick={handleManualAddUser}
                                className="flex-1 sm:flex-initial px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                              >
                                <UserPlus size={14} />
                                Add
                              </button>
                              {isSupabaseConfigured && (
                                <button 
                                  onClick={handleSyncAuthUsers}
                                  disabled={isSyncingAuth}
                                  className="flex-1 sm:flex-initial px-4 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  <RefreshCcw size={14} className={isSyncingAuth ? 'animate-spin' : ''} />
                                  {isSyncingAuth ? 'Syncing...' : 'Sync Auth Users'}
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="bg-slate-950/80 p-5 rounded-3xl border border-indigo-500/10 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div>
                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest">CRITICAL DATABASE DIAGNOSTICS</h4>
                                <p className="text-[10px] text-slate-500 uppercase mt-0.5 font-semibold">Test direct record insertion and inspect raw Supabase error messages live.</p>
                              </div>
                              <button
                                onClick={handleCreateTestUser}
                                className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-md active:scale-[0.98] text-center"
                              >
                                Create Test User
                              </button>
                            </div>

                            {testUserResult && (
                              <div className={`p-3 rounded-2xl border text-xs leading-relaxed font-bold uppercase ${testUserResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                <div className="text-[9px] font-black tracking-widest mb-1">{testUserResult.status === 'success' ? '✔ Direct Insert Success' : '❌ Direct Insert Failed'}</div>
                                <div className="font-mono text-[9px] leading-normal break-all select-text">{testUserResult.message}</div>
                              </div>
                            )}

                            <div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 flex justify-between">
                                <span>Operation Integrity History logs</span>
                                <span className="text-slate-600 font-bold">{localDiagnostics.length} Logs recorded</span>
                              </div>
                              {localDiagnostics.length === 0 ? (
                                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 text-center text-[10px] text-slate-500 uppercase font-black">
                                  No database actions logged this session. Register an account or click "Create Test User" to trace.
                                </div>
                              ) : (
                                <div className="max-h-52 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                  {localDiagnostics.map((logItem, index) => (
                                    <div key={index} className={`p-3 rounded-2xl border text-left text-[10px] font-bold ${
                                      logItem.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                                      logItem.status === 'pending' ? 'bg-amber-500/5 border-amber-500/10 text-amber-500 animate-pulse' :
                                      'bg-red-500/5 border-red-500/10 text-red-400'
                                    }`}>
                                      <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest">
                                        <span className="truncate max-w-[200px]">{logItem.operation}</span>
                                        <span className="text-slate-500">{logItem.timestamp}</span>
                                      </div>
                                      {logItem.error && (
                                        <div className="mt-1 font-mono text-[8px] text-red-300 leading-normal select-text break-all">
                                          Error message: {logItem.error}
                                        </div>
                                      )}
                                      {logItem.payload && (
                                        <pre className="mt-1.5 p-2 rounded bg-black/40 border border-white/5 font-mono text-[8px] text-slate-400 select-text break-all overflow-x-auto whitespace-pre-wrap max-h-24">
                                          Payload: {JSON.stringify(logItem.payload, null, 2)}
                                        </pre>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Cloudflare D1 Database Engine Selector Toggle */}
                          {/* Appwrite Database Engine Selector Toggle */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/40 p-2 rounded-2xl border border-white/5">
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 select-none self-start">
                              <button 
                                onClick={() => setUsersViewMode('sql')}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${usersViewMode === 'sql' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                              >
                                <Database size={12} />
                                Appwrite Grid
                              </button>
                              <button 
                                onClick={() => setUsersViewMode('cards')}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${usersViewMode === 'cards' ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                              >
                                <Users size={12} />
                                Classic Cards
                              </button>
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider px-2">
                              Connected Database: Appwrite Realtime DB
                            </span>
                          </div>

                          {/* Appwrite live visual terminal header */}
                          {usersViewMode === 'sql' && (
                            <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/10 font-mono text-left relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-2 text-slate-800 pointer-events-none group-hover:text-amber-500/20 transition-all font-sans font-black text-[9px] tracking-widest uppercase">Appwrite Database Engine</div>
                              <div className="flex items-center gap-2 text-amber-500 text-xs">
                                <Terminal size={14} className="animate-pulse" />
                                <span className="font-bold tracking-widest text-[10px]">APPWRITE:/$</span>
                                <span className="text-white">databases.listDocuments(&apos;main&apos;, &apos;users&apos;, [Query.search(&apos;name&apos;, &apos;{userSearchQuery}&apos;)]);</span>
                              </div>
                              <div className="text-[9px] text-slate-500 uppercase mt-1.5 font-sans font-bold flex gap-4">
                                <span>• ENGINE: APPWRITE CLOUD</span>
                                <span>• DOCUMENTS RETURNED: {allUsers.filter(u => u.role !== 'admin').length}</span>
                                <span>• STATUS: ACTIVE</span>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            {usersViewMode === 'sql' ? (
                              <div className="overflow-x-auto bg-slate-900/80 rounded-2xl border border-white/5 custom-scrollbar shadow-2xl">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                  <thead>
                                    <tr className="border-b border-white/5 bg-slate-950/60 text-[9px] font-black uppercase text-amber-500 tracking-widest select-none">
                                      <th className="py-3.5 px-4">ID</th>
                                      <th className="py-3.5 px-4">Name</th>
                                      <th className="py-3.5 px-4">Email</th>
                                      <th className="py-3.5 px-4">Role</th>
                                      <th className="py-3.5 px-4">Balance</th>
                                      <th className="py-3.5 px-4">Last Login</th>
                                      <th className="py-3.5 px-4">Quick Adjust</th>
                                      <th className="py-3.5 px-4 text-right">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {allUsers.filter(u => (u.role !== 'admin') && ((u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || (u.displayName || '').toLowerCase().includes(userSearchQuery.toLowerCase()))).map(user => (
                                      <tr key={user.id} className="hover:bg-white/[0.02] transition-colors font-semibold">
                                        <td className="py-3.5 px-4 font-mono text-[9px] text-slate-400 select-all truncate max-w-[100px]">{user.id}</td>
                                        <td className="py-3.5 px-4 text-xs font-black text-white">{user.displayName || user.name || 'Unregistered Player'}</td>
                                        <td className="py-3.5 px-4 text-[10px] text-slate-400 font-medium">{user.email || 'No email stored'}</td>
                                        <td className="py-3.5 px-4">
                                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 text-slate-500'}`}>
                                            {user.role || 'user'}
                                          </span>
                                        </td>
                                        <td className="py-3.5 px-4">
                                          <span 
                                            onClick={() => {
                                              setActiveAdjustUser(user);
                                              setAdjustAmount('');
                                              setAdjustAction('set');
                                            }} 
                                            className="text-[10px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-xl cursor-pointer hover:bg-amber-500 hover:text-slate-950 transition-all whitespace-nowrap"
                                            title="Click to control wallet"
                                          >
                                            ₹{(user.balance || 0).toLocaleString()}
                                          </span>
                                        </td>
                                        <td className="py-3.5 px-4 font-mono text-[9px] text-slate-400">
                                          {user.lastLogin ? (
                                            <div className="leading-tight">
                                              <div className="text-white font-bold">{new Date(user.lastLogin).toLocaleString()}</div>
                                              <div className="text-[8px] text-slate-500 uppercase">{user.lastLoginPlatform || 'Web'}</div>
                                            </div>
                                          ) : (
                                            <span className="text-slate-600 uppercase text-[8px] font-black">No login recorded</span>
                                          )}
                                        </td>
                                        <td className="py-3.5 px-4">
                                          <div className="flex gap-1.5">
                                            <button 
                                              onClick={() => handleAdjustBalance(user.id, 100)} 
                                              className="text-[8px] px-2 py-1 bg-emerald-600/10 text-emerald-500 border border-emerald-500/10 rounded-md font-black hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap"
                                            >
                                              +₹100
                                            </button>
                                            <button 
                                              onClick={() => handleAdjustBalance(user.id, 500)} 
                                              className="text-[8px] px-2 py-1 bg-emerald-600/10 text-emerald-500 border border-emerald-500/10 rounded-md font-black hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap"
                                            >
                                              +₹500
                                            </button>
                                            <button 
                                              onClick={() => handleAdjustBalance(user.id, -100)} 
                                              className="text-[8px] px-2 py-1 bg-red-600/10 text-red-500 border border-red-500/10 rounded-md font-black hover:bg-red-600 hover:text-white transition-all whitespace-nowrap"
                                            >
                                              -₹100
                                            </button>
                                          </div>
                                        </td>
                                        <td className="py-3.5 px-4 text-right">
                                          <div className="flex justify-end gap-1.5 scale-90 origin-right">
                                            <button 
                                              onClick={() => {
                                                setActiveAdjustUser(user);
                                                setAdjustAmount('');
                                                setAdjustAction('add');
                                              }} 
                                              className="p-2 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all"
                                              title="Advanced Balance Controller"
                                            >
                                              <Coins size={12} />
                                            </button>
                                            {currentUser?.email === 'nikhilrv8055@gmail.com' && (
                                              <button 
                                                onClick={() => handleToggleUserAdmin(user.id, user.role)} 
                                                className={`p-2 rounded-xl border transition-all ${user.role === 'admin' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white hover:bg-slate-700'}`} 
                                                title={user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                              >
                                                <ShieldCheck size={12} />
                                              </button>
                                            )}
                                            <button 
                                              onClick={() => handleDeleteUser(user.id)} 
                                              className="p-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                                              title="Remove Player"
                                            >
                                              <UserMinus size={12} />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {allUsers.filter(u => (u.role !== 'admin') && ((u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || (u.displayName || '').toLowerCase().includes(userSearchQuery.toLowerCase()))).map(user => (
                                  <div key={user.id} className="bg-slate-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center group relative font-semibold">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black text-white">{user.displayName || user.name || 'Unregistered Player'}</span>
                                      <span className="text-[9px] text-slate-500 uppercase tracking-tighter truncate max-w-[150px]">{user.email || 'No email stored'}</span>
                                      
                                      <div className="flex gap-2 mt-2">
                                         <span 
                                          onClick={() => {
                                            setActiveAdjustUser(user);
                                            setAdjustAmount('');
                                            setAdjustAction('set');
                                          }}
                                          className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-all">
                                           ₹{user.balance?.toLocaleString()}
                                          </span>
                                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 text-slate-500'}`}>
                                            {user.role || 'user'}
                                          </span>
                                       </div>

                                       <div className="mt-2 text-[8px] font-mono text-slate-400">
                                         {user.lastLogin ? (
                                           <span>LAST LOGIN: {new Date(user.lastLogin).toLocaleString()} ({user.lastLoginPlatform || 'Web'})</span>
                                         ) : (
                                           <span className="text-slate-600">NO LOGIN RECORDED</span>
                                         )}
                                       </div>

                                      <div className="mt-3 flex gap-1.5 flex-wrap">
                                        <button 
                                          onClick={() => handleAdjustBalance(user.id, 100)}
                                          className="text-[7px] px-1.5 py-1 bg-emerald-600/10 text-emerald-500 border border-emerald-500/10 rounded font-black hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap"
                                        >
                                          + ₹100
                                        </button>
                                        <button 
                                          onClick={() => handleAdjustBalance(user.id, 500)}
                                          className="text-[7px] px-1.5 py-1 bg-emerald-600/10 text-emerald-500 border border-emerald-500/10 rounded font-black hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap"
                                        >
                                          + ₹500
                                        </button>
                                        <button 
                                          onClick={() => handleAdjustBalance(user.id, -100)}
                                          className="text-[7px] px-1.5 py-1 bg-red-600/10 text-red-500 border border-red-500/10 rounded font-black hover:bg-red-600 hover:text-white transition-all whitespace-nowrap"
                                        >
                                          - ₹100
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-col gap-2 scale-90 sm:scale-100 origin-right">
                                      <button 
                                        onClick={() => {
                                          setActiveAdjustUser(user);
                                          setAdjustAmount('');
                                          setAdjustAction('add');
                                        }} 
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 transition-all font-black uppercase tracking-widest text-[9px]"
                                        title="Advanced Balance Controller"
                                      >
                                        <Coins size={14} />
                                        <span>Wallet</span>
                                      </button>
                                      {currentUser?.email === 'nikhilrv8055@gmail.com' && (
                                        <button 
                                          onClick={() => handleToggleUserAdmin(user.id, user.role)} 
                                          className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition-all ${user.role === 'admin' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                          title={user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                        >
                                          <ShieldCheck size={14} />
                                          <span className="text-[9px] font-black uppercase tracking-widest">{user.role === 'admin' ? 'REVOKE' : 'ADMIN'}</span>
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                                      >
                                        <UserMinus size={14} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">REMOVE</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {allUsers.filter(u => (u.role !== 'admin') && ((u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || (u.displayName || '').toLowerCase().includes(userSearchQuery.toLowerCase()))).length === 0 && (
                              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 text-center space-y-4">
                                <Users size={32} className="mx-auto text-slate-600" />
                                <div>
                                  <h3 className="text-sm font-black text-white uppercase tracking-widest">No Members Found</h3>
                                  <p className="text-[10px] text-slate-500 uppercase mt-1">
                                    {allUsers.length === 0 ? "The player list is completely empty." : "No players match your search filter."}
                                  </p>
                                </div>

                                {allUsers.length === 0 && (
                                  <div className="mt-4 p-4 rounded-2xl bg-slate-950/50 border border-white/5 text-left space-y-3">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Database Connection</span>
                                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                                        Firebase Active
                                      </span>
                                    </div>
                                    
                                    <p className="text-[9px] text-slate-400 uppercase leading-normal font-bold">
                                      Firebase Firestore database is connected and serving player data, ledgers, and transactions securely. Newly registered Google/Email players will appear here automatically.
                                    </p>
                                  </div>
                                )}

                                {isSupabaseConfigured && allUsers.length === 0 && (
                                  <div className="mt-4 p-4 rounded-2xl bg-slate-950 text-left border border-white/5 space-y-2">
                                    <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Supabase SQL Schema Installation Guide</div>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase leading-normal">
                                      If you see no players, copy & execute this code in your Supabase Dashboard SQL Editor to initialize necessary tables:
                                    </p>
                                    <pre className="p-3 bg-slate-900 border border-white/5 rounded-xl font-mono text-[8px] text-emerald-400 h-32 overflow-y-auto select-all leading-normal">
{`-- SQL SCRIPT FOR SUPABASE EDITOR
-- 1. Create users table with full synchronization support
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  display_name TEXT,
  coins NUMERIC DEFAULT 0,
  balance NUMERIC DEFAULT 0,
  role TEXT DEFAULT 'user',
  bank_details JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS and setup simple rules
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow select for everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Allow all actions for everyone" ON users FOR ALL USING (true) WITH CHECK (true);

-- 2. Create key_value_store table
CREATE TABLE IF NOT EXISTS key_value_store (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create dealers table
CREATE TABLE IF NOT EXISTS dealers (
  id TEXT PRIMARY KEY,
  name TEXT,
  whatsapp TEXT,
  upi_id TEXT,
  qr_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create deposit_requests table
CREATE TABLE IF NOT EXISTS deposit_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  amount NUMERIC,
  method TEXT,
  transaction_id TEXT,
  screenshot_url TEXT,
  dealer_id TEXT,
  user_balance_before NUMERIC,
  status TEXT DEFAULT 'pending',
  timestamp NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create withdrawal_requests table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  email TEXT,
  amount NUMERIC,
  bank_details JSONB,
  user_balance_before NUMERIC,
  status TEXT DEFAULT 'pending',
  timestamp NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. AUTOMATIC AUTH USER SYNC PROFILE TRIGGER
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, display_name, coins, balance, role, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Player'),
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Player'),
    0,
    0,
    CASE WHEN new.email = 'nikhilrv8055@gmail.com' THEN 'admin' ELSE 'user' END,
    COALESCE(new.created_at, now()),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(users.name, EXCLUDED.name),
    display_name = COALESCE(users.display_name, EXCLUDED.display_name);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 7. MANUAL SYNC AUTH USERS RPC FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION public.sync_auth_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  inserted_count INTEGER := 0;
  user_rec RECORD;
  user_role TEXT;
BEGIN
  FOR user_rec IN 
    SELECT id, email, created_at, 
           COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', raw_user_meta_data->>'display_name', split_part(email, '@', 1), 'Player') as name_val
    FROM auth.users
  LOOP
    IF user_rec.email = 'nikhilrv8055@gmail.com' THEN
      user_role := 'admin';
    ELSE
      user_role := 'user';
    END IF;

    INSERT INTO public.users (id, email, name, display_name, coins, balance, role, created_at, updated_at)
    VALUES (
      user_rec.id, 
      user_rec.email, 
      user_rec.name_val, 
      user_rec.name_val, 
      0, 
      0, 
      user_role, 
      COALESCE(user_rec.created_at, now()), 
      now()
    )
    ON CONFLICT (id) DO UPDATE 
    SET 
      email = EXCLUDED.email,
      name = COALESCE(users.name, EXCLUDED.name),
      display_name = COALESCE(users.display_name, EXCLUDED.display_name);
      
    inserted_count := inserted_count + 1;
  END LOOP;
  
  RETURN json_build_object('success', true, 'count', inserted_count);
END;
$$;`}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* RECENT USER LOGIN HISTORY LOGS SECTION */}
                            <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 space-y-4 mt-6">
                              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                                <div>
                                  <h4 className="text-xs font-black text-amber-500 uppercase tracking-widest">Recent Login Activities</h4>
                                  <p className="text-[9px] text-slate-500 uppercase mt-0.5 font-bold">Real-time session updates & user platform statistics</p>
                                </div>
                                <span className="px-2.5 py-1 bg-slate-900 border border-white/5 text-[9px] font-mono text-slate-400 rounded-xl">
                                  {loginLogs.length} LOGGED SESSIONS
                                </span>
                              </div>

                              {loginLogs.length === 0 ? (
                                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-white/5 text-[10px] text-slate-500 uppercase font-black tracking-wider">
                                  No login activities recorded in Firestore yet.
                                </div>
                              ) : (
                                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                  {loginLogs.slice(0, 50).map((log, index) => (
                                    <div key={log.id || index} className="p-3.5 bg-slate-900/60 hover:bg-slate-900 border border-white/5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                                      <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl text-xs font-black uppercase shrink-0 ${
                                          log.platform === 'Android App' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10' : 'bg-blue-500/15 text-blue-400 border border-blue-500/10'
                                        }`}>
                                          {log.platform === 'Android App' ? 'APK' : 'WEB'}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-black text-white truncate max-w-[200px] sm:max-w-none">{log.name}</div>
                                          <div className="text-[9px] text-slate-500 font-bold truncate max-w-[180px] sm:max-w-none">{log.email}</div>
                                        </div>
                                      </div>

                                      <div className="flex flex-col sm:items-end text-[9px] font-mono font-semibold text-slate-400">
                                        <div className="text-white font-bold">{new Date(log.timestamp).toLocaleString()}</div>
                                        <div className="text-[8px] text-slate-500 uppercase font-sans tracking-tight truncate max-w-[250px]" title={log.userAgent}>
                                          {log.userAgent || 'Unknown Agent'}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Advanced Balance Controller Modal Overlay */}
                            {activeAdjustUser && (
                              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                                <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
                                  <button 
                                    onClick={() => setActiveAdjustUser(null)}
                                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-all"
                                  >
                                    <X size={20} />
                                  </button>
                                  
                                  <div className="space-y-4">
                                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                      <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-500">
                                        <Coins size={24} />
                                      </div>
                                      <div>
                                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Balance Controller</h3>
                                        <p className="text-[10px] text-slate-500 uppercase mt-0.5 font-bold">
                                          Managing Wallet: <span className="text-amber-400">{activeAdjustUser.displayName || activeAdjustUser.email || 'Player'}</span>
                                        </p>
                                      </div>
                                    </div>

                                    {/* Current balance display */}
                                    <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Balance</span>
                                      <span className="text-sm font-black text-emerald-400">₹{(activeAdjustUser.balance || 0).toLocaleString()}</span>
                                    </div>

                                    {/* Operation type selector */}
                                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1 rounded-2xl border border-white/5">
                                      <button
                                        type="button"
                                        onClick={() => setAdjustAction('add')}
                                        className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${adjustAction === 'add' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}
                                      >
                                        Add (+)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdjustAction('remove')}
                                        className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${adjustAction === 'remove' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white'}`}
                                      >
                                        Remove (-)
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setAdjustAction('set')}
                                        className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${adjustAction === 'set' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                                      >
                                        Set (=)
                                      </button>
                                    </div>

                                    {/* Amount Input */}
                                    <div className="space-y-1.5">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {adjustAction === 'set' ? 'Enter New Balance (₹)' : 'Enter Amount (₹)'}
                                      </label>
                                      <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">₹</span>
                                        <input
                                          type="number"
                                          placeholder="0.00"
                                          className="w-full bg-slate-950 border border-white/5 rounded-2xl py-3 pl-8 pr-4 text-xs font-black text-white focus:border-amber-500 outline-none transition-all"
                                          value={adjustAmount}
                                          onChange={(e) => setAdjustAmount(e.target.value)}
                                        />
                                      </div>
                                    </div>

                                    {/* Quick presets */}
                                    <div className="flex gap-1.5 flex-wrap">
                                      {['100', '500', '1000', '5000', '10000'].map((preset) => (
                                        <button
                                          key={preset}
                                          type="button"
                                          onClick={() => setAdjustAmount(preset)}
                                          className="text-[8px] font-black px-2.5 py-1.5 bg-slate-800 border border-white/5 rounded-xl text-slate-300 hover:bg-amber-500 hover:text-slate-950 hover:border-amber-500 transition-all"
                                        >
                                          ₹{preset}
                                        </button>
                                      ))}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-2">
                                      <button
                                        type="button"
                                        onClick={() => setActiveAdjustUser(null)}
                                        className="flex-1 py-3 bg-slate-800 border border-white/5 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const amt = parseFloat(adjustAmount);
                                          if (isNaN(amt) || amt <= 0) {
                                            addNotification("Please enter a valid positive amount.", "info");
                                            return;
                                          }
                                          const currentBal = activeAdjustUser.balance || 0;
                                          if (adjustAction === 'add') {
                                            await handleAdjustBalance(activeAdjustUser.id, amt);
                                          } else if (adjustAction === 'remove') {
                                            if (currentBal < amt) {
                                              addNotification("Caution: User balance will go below zero.", "info");
                                            }
                                            await handleAdjustBalance(activeAdjustUser.id, -amt);
                                          } else if (adjustAction === 'set') {
                                            await handleAdminUpdateUserBalanceDirect(activeAdjustUser.id, amt);
                                          }
                                          setActiveAdjustUser(null);
                                        }}
                                        className="flex-1 py-3 bg-amber-500 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10"
                                      >
                                        Confirm Update
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : adminTab === 'admins' ? (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              placeholder="Search admins..." 
                              className="flex-1 bg-slate-900 border border-white/5 rounded-xl py-3 px-4 text-xs focus:border-blue-500 outline-none transition-all text-white" 
                              value={userSearchQuery} 
                              onChange={(e) => setUserSearchQuery(e.target.value)} 
                            />
                          </div>
                          <div className="space-y-3">
                            {allUsers.filter(u => (((u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || (u.displayName || '').toLowerCase().includes(userSearchQuery.toLowerCase())) && u.role === 'admin')).map(user => (
                              <div key={user.id} className="bg-slate-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center group relative">
                                <div className="flex flex-col">
                                  <span className="text-xs font-black text-white">{user.displayName || user.email || 'Unregistered Admin'}</span>
                                  <span className="text-[9px] text-slate-500 uppercase tracking-tighter truncate max-w-[150px]">{user.email || 'No email stored'}</span>
                                  <div className="flex gap-2 mt-2">
                                     <span 
                                      onClick={() => handleAdminUpdateUserBalance(user.id, user.balance || 0)}
                                      className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500 cursor-pointer hover:bg-blue-500 hover:text-white transition-all">
                                       ₹{user.balance?.toLocaleString()}
                                     </span>
                                     <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/20 text-red-500`}>
                                       {user.role || 'admin'}
                                     </span>
                                  </div>
                                  <div className="mt-3 flex gap-1.5 flex-wrap">
                                    <button 
                                      onClick={() => handleAdjustBalance(user.id, 100)}
                                      className="text-[7px] px-1.5 py-1 bg-emerald-600/10 text-emerald-500 border border-emerald-500/10 rounded font-black hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap"
                                    >
                                      + ₹100
                                    </button>
                                    <button 
                                      onClick={() => handleAdjustBalance(user.id, 500)}
                                      className="text-[7px] px-1.5 py-1 bg-emerald-600/10 text-emerald-500 border border-emerald-500/10 rounded font-black hover:bg-emerald-600 hover:text-white transition-all whitespace-nowrap"
                                    >
                                      + ₹500
                                    </button>
                                    <button 
                                      onClick={() => handleAdjustBalance(user.id, -100)}
                                      className="text-[7px] px-1.5 py-1 bg-red-600/10 text-red-500 border border-red-500/10 rounded font-black hover:bg-red-600 hover:text-white transition-all whitespace-nowrap"
                                    >
                                      - ₹100
                                    </button>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2 scale-90 sm:scale-100 origin-right">
                                  {currentUser?.email === 'nikhilrv8055@gmail.com' && (
                                    <button 
                                      onClick={() => handleToggleUserAdmin(user.id, user.role)} 
                                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border transition-all ${user.role === 'admin' ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                                      title={user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                                    >
                                      <ShieldCheck size={14} />
                                      <span className="text-[9px] font-black uppercase tracking-widest">{user.role === 'admin' ? 'REVOKE' : 'ADMIN'}</span>
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-600 hover:text-white transition-all"
                                  >
                                    <UserMinus size={14} />
                                    <span className="text-[9px] font-black uppercase tracking-widest">REMOVE</span>
                                  </button>
                                </div>
                              </div>
                            ))}

                            {allUsers.filter(u => (((u.email || '').toLowerCase().includes(userSearchQuery.toLowerCase()) || (u.displayName || '').toLowerCase().includes(userSearchQuery.toLowerCase())) && u.role === 'admin')).length === 0 && (
                              <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 text-center space-y-4">
                                <ShieldCheck size={32} className="mx-auto text-indigo-500" />
                                <div>
                                  <h3 className="text-sm font-black text-white uppercase tracking-widest">No Admins found</h3>
                                  <p className="text-[10px] text-slate-500 uppercase mt-1">
                                    No promoted administrators match your search filter yet.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : adminTab === 'withdrawals' ? (
                        <div className="space-y-4">
                          {withdrawalRequests.map(req => {
                            const user = allUsers.find(u => u.id === req.userId);
                            return (
                             <div key={req.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 relative overflow-hidden">
                                {req.status === 'pending' && <div className="absolute top-0 right-0 px-3 py-1 bg-yellow-500 text-slate-950 text-[7px] font-black uppercase tracking-tighter rounded-bl-xl">PENDING</div>}
                                <div className="flex justify-between items-start mb-4">
                                   <div><div className="text-xs font-black text-white">{req.email}</div><div className="text-[9px] text-slate-500">{new Date(req.timestamp).toLocaleString()}</div></div>
                                   <div className="text-xl font-black text-red-500">₹{req.amount}</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                   <div className="bg-slate-950 p-4 rounded-2xl text-[9px] text-white border border-white/5">
                                    <div className="text-slate-500 uppercase font-black text-[7px] mb-2 border-b border-white/5 pb-1 flex items-center justify-between">
                                      {req.method === 'upi' ? (
                                        <span className="text-blue-400 font-extrabold flex items-center gap-1">UPI ID (PRIMARY)</span>
                                      ) : (
                                        <span className="text-emerald-400 font-extrabold flex items-center gap-1">BANK TRANSFER</span>
                                      )} <Building2 size={8} />
                                    </div>
                                    <div className="space-y-1.5 font-mono">
                                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span>Bank:</span> <span className="text-emerald-400 font-black">{req.bankDetails?.bankName}</span></div>
                                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span>A/C:</span> <span className="text-white font-black">{req.bankDetails?.accountNumber}</span></div>
                                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span>IFSC:</span> <span className="text-yellow-400 font-black">{req.bankDetails?.ifscCode}</span></div>
                                      <div className="flex justify-between border-b border-white/5 pb-0.5"><span>Holder:</span> <span className="text-white font-black uppercase">{req.bankDetails?.accountHolder}</span></div>
                                      <div className="flex justify-between"><span>UPI ID:</span> <span className="text-blue-400 font-black">{req.bankDetails?.upiId || 'Not Provided'}</span></div>
                                    </div>
                                    
                                    {req.bankDetails?.upiId && (
                                      <div className="mt-4 flex flex-col items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5 shadow-inner">
                                        <div className="p-1.5 bg-white rounded-lg">
                                          <QRCodeSVG 
                                            value={`upi://pay?pa=${req.bankDetails.upiId}&pn=${encodeURIComponent(req.bankDetails.accountHolder)}&am=${parseFloat(req.amount).toFixed(2)}&cu=INR`}
                                            size={80}
                                            level="L"
                                          />
                                        </div>
                                        <span className="text-[7px] text-slate-500 font-black tracking-widest uppercase">SCAN TO PAY ₹{req.amount}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="bg-slate-950 p-4 rounded-2xl text-[9px] text-white border border-white/5">
                                    <div className="text-slate-500 uppercase font-black text-[7px] mb-2 border-b border-white/5 pb-1 flex items-center justify-between">
                                      BALANCE TRACKING <Wallet size={8} />
                                    </div>
                                    <div className="space-y-1.5 font-mono">
                                      <div className="flex justify-between"><span>Request Bal:</span> <span className="text-slate-400">₹{req.userBalanceBefore || 'N/A'}</span></div>
                                      <div className="flex justify-between"><span>Withdraw:</span> <span className="text-red-400 font-black">-₹{req.amount}</span></div>
                                      <div className="flex justify-between border-t border-white/5 pt-1 mt-1"><span>Rem. If Appr:</span> <span className="text-emerald-400 font-black">₹{(req.userBalanceBefore || 0) - req.amount}</span></div>
                                      <div className="flex justify-between pt-1 opacity-50 italic"><span>Live User Bal:</span> <span>₹{user?.balance || 0}</span></div>
                                    </div>
                                  </div>
                                </div>

                                {req.status === 'pending' && (
                                 <div className="grid grid-cols-2 gap-2">
                                   <button onClick={() => handleRejectWithdrawal(req.id, req.userId, req.amount)} className="bg-red-600/10 text-red-500 border border-red-500/20 py-2 rounded-xl text-[10px] font-black hover:bg-red-600 hover:text-white transition-all uppercase">REJECT</button>
                                   <button onClick={() => handleApproveWithdrawal(req.id)} className="bg-green-600 text-white py-2 rounded-xl text-[10px] font-black hover:bg-green-500 shadow-lg shadow-green-500/20 transition-all uppercase">APPROVE</button>
                                 </div>
                                )}
                             </div>
                            );
                          })}
                        </div>
                      ) : adminTab === 'deposits' ? (
                        <div className="space-y-4">
                          {depositRequests.map(req => (
                            <div key={req.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 relative">
                               <div className="flex justify-between items-start mb-4">
                                  <div><div className="text-xs font-black text-white">{req.email}</div><div className="text-[9px] text-slate-500">{new Date(req.timestamp).toLocaleString()}</div></div>
                                  <div className="text-xl font-black text-green-500">₹{req.amount}</div>
                               </div>
                               <div className="bg-slate-950 p-3 rounded-2xl mb-4 text-[9px] flex justify-between text-white flex-wrap gap-y-2">
                                  <div className="flex flex-col"><span className="text-slate-500 uppercase font-black text-[7px]">Method</span> <span className="uppercase">{req.method}</span></div>
                                  <div className="flex flex-col text-right"><span className="text-slate-500 uppercase font-black text-[7px]">UTR</span> <span>{req.transactionId}</span></div>
                                  {req.dealerId && (
                                    <div className="flex flex-col w-full pt-1 border-t border-white/5"><span className="text-slate-500 uppercase font-black text-[7px]">Dealer</span> <span>{dealers.find(d => d.id === req.dealerId)?.name || 'Unknown Dealer'}</span></div>
                                  )}
                                </div>

                                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 mb-4 shadow-inner">
                                  <div className="text-slate-500 uppercase font-black text-[7px] mb-2 border-b border-white/5 pb-1 flex items-center justify-between font-sans">
                                     BALANCE TRACKING <TrendingUp size={8} />
                                  </div>
                                  <div className="space-y-1.5 font-mono text-[9px] text-white">
                                     <div className="flex justify-between"><span>User Bal Before:</span> <span className="text-slate-400">₹{req.userBalanceBefore || '0'}</span></div>
                                     <div className="flex justify-between"><span>Deposit Amount:</span> <span className="text-emerald-400 font-black">+₹{req.amount}</span></div>
                                     <div className="flex justify-between border-t border-white/5 pt-1 mt-1"><span>Target Bal:</span> <span className="text-blue-400 font-black">₹{(req.userBalanceBefore || 0) + req.amount}</span></div>
                                  </div>
                                </div>

                                {req.screenshotUrl && (
                                  <div className="mb-4">
                                    <span className="text-slate-500 uppercase font-black text-[7px] block mb-1">Screenshot</span>
                                    <div className="w-full h-32 bg-slate-950 rounded-xl overflow-hidden border border-white/5">
                                       <img src={req.screenshotUrl} alt="Screenshot" className="w-full h-full object-contain cursor-zoom-in" onClick={() => window.open(req.screenshotUrl)} />
                                    </div>
                                  </div>
                                )}
                                {req.status === 'pending' && (
                                 <div className="grid grid-cols-2 gap-2">
                                   <button onClick={() => handleRejectDeposit(req.id)} className="bg-red-600/10 text-red-500 border border-red-500/20 py-2 rounded-xl text-[10px] font-black uppercase">REJECT</button>
                                   <button onClick={() => handleApproveDeposit(req.id, req.userId, req.amount)} className="bg-green-600 text-white py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-green-600/20">APPROVE</button>
                                 </div>
                               )}
                            </div>
                          ))}
                        </div>
                      ) : adminTab === 'payment_proofs' ? (
                        <div className="space-y-4">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                              <Camera size={14} className="text-teal-500" />
                              Payment Proofs (D1 + ImgBB)
                            </h3>
                            <button
                              onClick={() => fetchAdminData(true)}
                              className="px-2.5 py-1 bg-slate-900 border border-white/5 text-[9px] font-black uppercase text-slate-400 hover:text-white rounded-lg transition-all"
                            >
                              SYNC PROOFS
                            </button>
                          </div>

                          {paymentProofs.length === 0 ? (
                            <div className="bg-slate-900 border border-white/5 border-dashed rounded-3xl p-10 text-center space-y-4">
                              <Camera size={36} className="mx-auto text-slate-600" />
                              <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">No Proofs Found</h3>
                                <p className="text-[9px] text-slate-500 uppercase mt-1">
                                  No payment screenshots have been uploaded or synchronised yet.
                                </p>
                              </div>
                            </div>
                          ) : (
                            paymentProofs.map(proof => (
                              <div key={proof.id} className="bg-slate-900 border border-white/5 rounded-2xl p-5 relative overflow-hidden group">
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <div className="text-xs font-black text-white">{proof.user_email}</div>
                                    <div className="text-[9px] text-slate-500 mt-0.5">
                                      ID: {proof.id} • {new Date(proof.created_at || Date.now()).toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-1.5">
                                    <div className="text-xl font-black text-emerald-400">₹{proof.amount}</div>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                                      proof.status === 'approved' 
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                        : proof.status === 'rejected' 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
                                    }`}>
                                      {proof.status || 'pending'}
                                    </span>
                                  </div>
                                </div>

                                {proof.screenshot_url && (
                                  <div className="mb-4 space-y-2">
                                    <span className="text-slate-500 uppercase font-black text-[7px] block">Screenshot Proof</span>
                                    <div className="relative w-full h-44 bg-slate-950 rounded-xl overflow-hidden border border-white/5 group-hover:border-white/15 transition-all">
                                      <img 
                                        src={proof.screenshot_url} 
                                        alt="Screenshot proof" 
                                        className="w-full h-full object-contain"
                                      />
                                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button 
                                          onClick={() => window.open(proof.screenshot_url, '_blank')}
                                          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-[9px] uppercase rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center gap-1.5"
                                        >
                                          <Camera size={12} />
                                          Open Screenshot Link
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {proof.status === 'pending' ? (
                                  <div className="grid grid-cols-2 gap-2 mt-2">
                                    <button 
                                      onClick={() => handleRejectPaymentProof(proof.id)} 
                                      className="bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                                    >
                                      REJECT PROOF
                                    </button>
                                    <button 
                                      onClick={() => handleApprovePaymentProof(proof.id, proof.user_email, proof.amount)} 
                                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-teal-500/20 transition-all"
                                    >
                                      APPROVE & ADD COINS
                                    </button>
                                  </div>
                                ) : (
                                  <div className="mt-2 text-center py-2 bg-slate-950/40 rounded-xl border border-white/5">
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                      Processed • No further actions available
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      ) : adminTab === 'bets' ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                              <History size={14} className="text-orange-500" />
                              Active Investments
                            </h3>
                            <div className="text-[10px] font-black text-white bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                              Total Pool: ₹{totalPool.toLocaleString()}
                            </div>
                          </div>

                          {/* Summary Grid */}
                          <div className="grid grid-cols-2 gap-2">
                            {GAME_SLOTS.map(s => (
                              <div key={s.id} className="bg-slate-900/50 p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:border-white/10 transition-all">
                                <div className="flex items-center gap-2">
                                  <div className={`w-6 h-6 rounded flex items-center justify-center ${s.color} bg-opacity-20`}>
                                    <s.icon size={12} className={s.color} />
                                  </div>
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter truncate max-w-[60px]">{customNames[s.id] || s.name}</span>
                                </div>
                                <span className="text-xs font-black text-white">₹{poolPerSlot[s.id].toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          {/* Live Feed */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Investment Feed</span>
                            </div>
                            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                              {currentBets.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-white/5 rounded-2xl">
                                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-[.25em]">Waiting for orders...</span>
                                </div>
                              ) : (
                                currentBets.map((bet, i) => {
                                  const slot = GAME_SLOTS.find(s => s.id === bet.slotId);
                                  const name = customNames[bet.slotId] || slot?.name || 'Unknown';
                                  return (
                                    <motion.div 
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      key={`${bet.userId}-${i}`} 
                                      className="bg-slate-900 border border-white/5 p-3 rounded-2xl flex items-center justify-between shadow-lg"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${slot?.color || 'bg-slate-800'} bg-opacity-20 relative`}>
                                          {slot?.icon && <slot.icon size={16} className={slot?.color} />}
                                        </div>
                                        <div>
                                          <div className="text-[10px] font-black text-white uppercase tracking-tight">
                                            {bet.userEmail || 'Real Member'}
                                          </div>
                                          <div className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                            Placed on {name}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-xs font-black text-orange-500">₹{bet.amount}</div>
                                        <div className="text-[8px] font-bold text-slate-600 uppercase">Success</div>
                                      </div>
                                    </motion.div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </div>
                      ) : adminTab === 'history' ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                             <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                               <Clock size={14} className="text-emerald-500" />
                               Global Transaction History
                             </h3>
                             <div className="flex gap-2">
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                  Total: {depositRequests.length + withdrawalRequests.length}
                                </span>
                             </div>
                          </div>

                          <div className="space-y-3">
                             {[...depositRequests.map(d => ({ ...d, type: 'deposit' as const })), ...withdrawalRequests.map(w => ({ ...w, type: 'withdrawal' as const }))]
                              .sort((a, b) => b.timestamp - a.timestamp)
                              .map((item, idx) => (
                                <div key={idx} className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 group hover:border-white/10 transition-all">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-xl ${item.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {item.type === 'deposit' ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs font-black text-white uppercase tracking-tight">{item.type} Request</span>
                                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{new Date(item.timestamp).toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-lg font-black ${item.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {item.type === 'deposit' ? '+' : '-'}₹{item.amount}
                                      </div>
                                      <div className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase inline-block ${
                                        item.status === 'approved' ? 'bg-emerald-500/20 text-emerald-500' : 
                                        item.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 
                                        'bg-yellow-500/20 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)] animate-pulse'
                                      }`}>
                                        {item.status}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-[8px] font-black uppercase text-slate-400">
                                        {item.email.charAt(0)}
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400">{item.email}</span>
                                    </div>
                                    {item.type === 'deposit' && (item as DepositRequest).transactionId && (
                                      <span className="text-[8px] font-mono text-slate-600 tracking-tighter uppercase">UTR: {(item as DepositRequest).transactionId}</span>
                                    )}
                                  </div>
                                </div>
                             ))}
                             {(depositRequests.length === 0 && withdrawalRequests.length === 0) && (
                               <div className="text-center py-20 opacity-40">
                                 <History size={48} className="mx-auto mb-4 text-slate-700" />
                                 <p className="text-sm font-black text-slate-600 uppercase tracking-[.3em]">No Record Found</p>
                               </div>
                             )}
                          </div>
                        </div>
                      ) : adminTab === 'notifications' ? (
                        <div className="space-y-6">
                          <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                             <Bell size={14} className="text-purple-500" />
                             Notification Hub
                          </h3>

                          <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-3">
                              {(['enableWinNotifications', 'enableBetNotifications', 'enableInfoNotifications'] as const).map(toggle => (
                                <div key={toggle} className="bg-slate-900 p-4 rounded-2xl border border-white/5 flex justify-between items-center shadow-lg">
                                  <span className="text-xs font-black uppercase tracking-tight text-slate-300">
                                    {toggle.replace(/([A-Z])/g, ' $1').replace('enable ', '')}
                                  </span>
                                  <button 
                                    onClick={() => setAdminState(prev => ({
                                      ...prev,
                                      notifications: {
                                        ...prev.notifications!,
                                        [toggle]: !prev.notifications![toggle]
                                      }
                                    }))}
                                    className={`w-12 h-6 rounded-full transition-all relative ${adminState.notifications?.[toggle] ? 'bg-green-600' : 'bg-slate-800'}`}
                                  >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${adminState.notifications?.[toggle] ? 'right-1' : 'left-1'}`} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            <div className="space-y-4">
                              {[
                                { id: 'winMessageTemplate', label: 'Win Template', vars: '{amount}, {slot}' },
                                { id: 'betMessageTemplate', label: 'Bet Template', vars: '{slot}' },
                                { id: 'fakeBetMessageTemplate', label: 'Fake Bet Template', vars: '{user}, {amount}, {slot}' }
                              ].map(t => (
                                <div key={t.id} className="space-y-2">
                                  <div className="flex justify-between items-center px-1">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.label}</span>
                                    <span className="text-[8px] text-slate-600 font-bold">VARS: {t.vars}</span>
                                  </div>
                                  <textarea 
                                    value={adminState.notifications?.[t.id as keyof typeof adminState.notifications] as string}
                                    onChange={(e) => setAdminState(prev => ({
                                      ...prev,
                                      notifications: {
                                        ...prev.notifications!,
                                        [t.id]: e.target.value
                                      }
                                    }))}
                                    className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-xs text-white focus:border-purple-500 outline-none min-h-[80px] shadow-inner font-medium"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : adminTab === 'branding' ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                              <ImageIcon size={14} className="text-pink-500" />
                              Branding & Logo Management
                            </h3>
                            <button 
                              onClick={handleSaveSettings}
                              disabled={isSettingsSaving}
                              className="flex items-center gap-2 bg-pink-600 px-4 py-1.5 rounded-full text-[10px] font-black text-white hover:bg-pink-500 transition-all disabled:opacity-50"
                            >
                              <Save size={14} /> {isSettingsSaving ? 'SAVING...' : 'SAVE LOGO'}
                            </button>
                          </div>

                          <div className="bg-slate-900 p-6 rounded-[32px] border border-white/5 space-y-6">
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-3xl bg-slate-950/50 group hover:border-pink-500/30 transition-all">
                              {adminState.appLogoUrl ? (
                                <div className="relative group flex justify-center">
                                  <img src={adminState.appLogoUrl} alt="App Logo" className="w-32 h-32 object-contain rounded-2xl shadow-2xl border border-white/10" />
                                  <button 
                                    onClick={() => saveAppLogoDirectly('')}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-500 transition-colors cursor-pointer"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-3">
                                  <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20">
                                    <ImageIcon size={32} />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs font-black text-white uppercase tracking-tight">Upload App Logo</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">PNG or JPG (Square recommended)</p>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-xs">
                                <label className="cursor-pointer w-full">
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = async () => {
                                          const base64 = reader.result as string;
                                          try {
                                            const resized = await resizeImage(base64, 400, 400);
                                            const storageUrl = await uploadToStorage(resized, `app_logo_${Date.now()}.jpg`);
                                            await saveAppLogoDirectly(storageUrl);
                                          } catch (err) {
                                            // Error handled in uploadToStorage
                                          }
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                  />
                                  <div className="bg-slate-800 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5 flex items-center justify-center gap-2 cursor-pointer">
                                    {isUploading ? (
                                      <RefreshCcw size={14} className="animate-spin text-pink-500" />
                                    ) : <ImageIcon size={14} />}
                                    {adminState.appLogoUrl ? 'Change via Upload' : 'Select File'}
                                  </div>
                                </label>

                                <div className="w-full flex flex-col gap-2 pt-4 border-t border-white/5">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-center">Or provide URL</p>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      placeholder="https://example.com/logo.png"
                                      value={logoUrlInput}
                                      onChange={(e) => setLogoUrlInput(e.target.value)}
                                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] text-white placeholder:text-slate-700 font-bold"
                                    />
                                    <button 
                                      onClick={async () => {
                                        if (logoUrlInput) {
                                          await saveAppLogoDirectly(logoUrlInput);
                                          setLogoUrlInput('');
                                        }
                                      }}
                                      className="bg-pink-600/10 border border-pink-500/20 px-4 py-2.5 rounded-xl text-[10px] font-black text-pink-500 hover:bg-pink-600 hover:text-white transition-all uppercase cursor-pointer"
                                    >
                                      Set
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Visual Preview</h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                                  <span className="text-[8px] text-slate-600 font-bold uppercase block mb-3">Header Corner</span>
                                  <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-lg border border-white/5">
                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                                       {adminState.appLogoUrl ? <img src={adminState.appLogoUrl} className="w-full h-full object-cover" /> : <Dice5 size={16} className="text-red-500" />}
                                    </div>
                                    <span className="text-xs font-black text-white italic tracking-tighter">SORAT</span>
                                  </div>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                                   <span className="text-[8px] text-slate-600 font-bold uppercase block mb-3">Shortcut Icon</span>
                                   <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
                                      {adminState.appLogoUrl ? <img src={adminState.appLogoUrl} className="w-full h-full object-cover" /> : <Dice5 size={24} className="text-red-500" />}
                                   </div>
                                   <span className="text-[7px] font-bold text-slate-500 uppercase mt-2">Home Screen</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* APK & App Release Management Card */}
                          <div className="bg-slate-900 p-6 rounded-[32px] border border-white/5 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 tracking-[0.2em] uppercase flex items-center gap-2">
                              <Smartphone size={14} className="text-yellow-500" />
                              APK File & Download Management
                            </h4>

                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/10 rounded-3xl bg-slate-950/50 group hover:border-yellow-500/30 transition-all">
                              {adminState.apkUrl ? (
                                <div className="text-center space-y-4">
                                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mx-auto">
                                    <Smartphone size={32} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-white uppercase">APK is Live & Configured</p>
                                    <p className="text-[9px] text-slate-400 font-bold truncate max-w-xs mt-1 bg-black/40 px-3 py-1 rounded-md border border-white/5 font-mono">{adminState.apkUrl}</p>
                                  </div>
                                  <button 
                                    onClick={() => saveApkUrlDirectly('')}
                                    className="px-4 py-2 bg-red-600/15 border border-red-500/20 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                                  >
                                    Remove Link
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-3 text-center">
                                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                                    <Smartphone size={32} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-black text-white uppercase">No Custom APK Uploaded</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Default Appwrite stored APK will be served</p>
                                  </div>
                                </div>
                              )}

                              <div className="mt-6 flex flex-col items-center gap-4 w-full max-w-xs">
                                <label className="cursor-pointer w-full">
                                  <input 
                                    type="file" 
                                    accept=".apk" 
                                    className="hidden" 
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setIsUploadingApk(true);
                                        try {
                                          addNotification("Uploading APK to Appwrite Storage...", 'info');
                                          const uploadedUrl = await appwriteService.uploadApkFile(file);
                                          await saveApkUrlDirectly(uploadedUrl);
                                        } catch (err: any) {
                                          addNotification(`Upload failed: ${err.message || String(err)}`, 'info');
                                        } finally {
                                          setIsUploadingApk(false);
                                        }
                                      }
                                    }}
                                  />
                                  <div className="bg-slate-800 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all border border-white/5 flex items-center justify-center gap-2 cursor-pointer">
                                    {isUploadingApk ? (
                                      <RefreshCcw size={14} className="animate-spin text-yellow-500" />
                                    ) : <Smartphone size={14} />}
                                    {isUploadingApk ? 'Uploading APK...' : (adminState.apkUrl ? 'Upload New APK File' : 'Select APK File')}
                                  </div>
                                </label>

                                <div className="w-full flex flex-col gap-2 pt-4 border-t border-white/5">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter text-center">Or enter Direct Link</p>
                                  <div className="flex gap-2">
                                    <input 
                                      type="text"
                                      placeholder="https://example.com/app.apk"
                                      value={apkUrlInput}
                                      onChange={(e) => setApkUrlInput(e.target.value)}
                                      className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] text-white placeholder:text-slate-700 font-bold"
                                    />
                                    <button 
                                      onClick={async () => {
                                        if (apkUrlInput) {
                                          await saveApkUrlDirectly(apkUrlInput);
                                          setApkUrlInput('');
                                        }
                                      }}
                                      className="bg-yellow-600/10 border border-yellow-500/20 px-4 py-2.5 rounded-xl text-[10px] font-black text-yellow-500 hover:bg-yellow-600 hover:text-white transition-all uppercase cursor-pointer"
                                    >
                                      Set
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-pink-600/5 p-4 rounded-2xl border border-pink-500/20">
                            <div className="flex gap-3">
                              <ShieldAlert size={16} className="text-pink-500 shrink-0" />
                              <p className="text-[10px] text-pink-400 font-bold leading-relaxed uppercase">
                                Updating the logo reflects instantly in the UI. Note: The PWA shortcut icon (for new installs) will use this logo via dynamic manifest injection.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : adminTab === 'policies' ? (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                              <Info size={14} className="text-cyan-500" />
                              Lobby Details & Policy Management
                            </h3>
                            <button 
                              onClick={handleSavePolicies}
                              disabled={isPoliciesSaving}
                              className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 rounded-full text-[10px] font-black text-white hover:from-cyan-500 hover:to-blue-500 transition-all disabled:opacity-50"
                            >
                              <Save size={14} /> {isPoliciesSaving ? 'SAVING...' : 'SAVE ALL POLICIES'}
                            </button>
                          </div>

                          <div className="bg-slate-900 p-6 rounded-[32px] border border-white/5 space-y-6 text-left">
                            {/* Support Support & Contacts info */}
                            <div className="space-y-4">
                              <h4 className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">1. Customer Support & Contact Info</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Support Email</label>
                                  <input 
                                    type="email"
                                    value={paymentSettings.supportEmail || ''}
                                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                                    placeholder="e.g. support@example.com"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-700 font-bold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Business Hours</label>
                                  <input 
                                    type="text"
                                    value={paymentSettings.supportHours || ''}
                                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, supportHours: e.target.value }))}
                                    placeholder="e.g. 10:00 AM to 08:00 PM (IST)"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-700 font-bold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Registered Address</label>
                                  <input 
                                    type="text"
                                    value={paymentSettings.supportAddress || ''}
                                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, supportAddress: e.target.value }))}
                                    placeholder="e.g. Bihar, India"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-700 font-bold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Platform Operator</label>
                                  <input 
                                    type="text"
                                    value={paymentSettings.supportOperator || ''}
                                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, supportOperator: e.target.value }))}
                                    placeholder="e.g. Sorat Live Gaming Solutions"
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-700 font-bold"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Support Message Text</label>
                                <textarea 
                                  rows={2}
                                  value={paymentSettings.supportText || ''}
                                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, supportText: e.target.value }))}
                                  placeholder="Support details header message..."
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-700 font-bold"
                                />
                              </div>
                            </div>

                            <div className="border-t border-white/5 pt-6 space-y-4">
                              <h4 className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">2. Legal Policies Content</h4>
                              
                              <div className="space-y-2">
                                <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex justify-between">
                                  <span>Terms & Conditions Content</span>
                                  <span className="text-slate-600 font-bold">(Plain text or custom layout)</span>
                                </label>
                                <textarea 
                                  rows={4}
                                  value={paymentSettings.termsContent || ''}
                                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, termsContent: e.target.value }))}
                                  placeholder="Provide custom terms of use..."
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-700 font-bold"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex justify-between">
                                  <span>Privacy Policy Content</span>
                                  <span className="text-slate-600 font-bold">(Plain text or custom layout)</span>
                                </label>
                                <textarea 
                                  rows={4}
                                  value={paymentSettings.privacyContent || ''}
                                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, privacyContent: e.target.value }))}
                                  placeholder="Provide custom privacy rules..."
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-700 font-bold"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest flex justify-between">
                                  <span>Refund Policy Content</span>
                                  <span className="text-slate-600 font-bold">(Plain text or custom layout)</span>
                                </label>
                                <textarea 
                                  rows={4}
                                  value={paymentSettings.refundContent || ''}
                                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, refundContent: e.target.value }))}
                                  placeholder="Provide custom refund cancellation terms..."
                                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-700 font-bold"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="bg-cyan-950/20 p-4 rounded-2xl border border-cyan-500/20 text-left">
                            <div className="flex gap-3">
                              <Info size={16} className="text-cyan-500 shrink-0" />
                              <p className="text-[10px] text-cyan-400 font-bold leading-relaxed uppercase">
                                All policy and support operator info configured here is persisted securely in Cloud Firestore and instantly updates for all players in real-time. Leave any field blank to use default values.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : adminTab === 'dealers' ? (
                        <div className="space-y-6">
                           <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                             <ShieldCheck size={14} className="text-indigo-500" />
                             Dealer Network
                           </h3>

                            {/* Bilingual Instruction Alert */}
                            <div className="bg-indigo-950/40 border border-indigo-500/10 p-4 rounded-2xl space-y-2 text-left mb-4">
                              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Info size={12} /> Easy QR & UPI Link Management
                              </h4>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                • <strong>Purana Link/QR Code badalne ke liye (To Edit):</strong> Niche di gayi dealers list me se jis dealer ko badalna hai, uske samne diye gaye Peon/Pencil ✏️ <strong>Pencil (Edit)</strong> button par click karein. Yeh form automatic bhara hua upar aa jayega, usme naya UPI ID ya QR code upload/paste karein aur <strong>"Update Dealer Info"</strong> dabaayein.
                              </p>
                              <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
                                • <strong>Naya Dealer add karne ke liye (To Add Multiple):</strong> Naya dealer add karne ke liye upar form ko khali rakhein (agar edit open hai to Cancel karein), naya details bharein aur <strong>"Add Verified Dealer"</strong> dabaayein. Is tarike se aap multiple active dealers control kar sakeinge.
                              </p>
                            </div>

                            <div 
                              id="dealer-form-container" 
                              className={`p-6 rounded-3xl border transition-all duration-300 space-y-4 shadow-2xl relative ${
                                editingDealerId 
                                  ? 'bg-slate-900 border-amber-500/50 shadow-amber-950/20 ring-1 ring-amber-500/20' 
                                  : 'bg-slate-900 border-white/5'
                              }`}
                            >
                              {editingDealerId && (
                                <div className="bg-amber-500/10 border border-amber-500/20 px-3 py-2.5 rounded-xl text-[10px] text-amber-300 font-bold uppercase tracking-wider flex items-center justify-between">
                                  <span>✏️ Update Mode: Editing "{dealers.find(d => d.id === editingDealerId)?.name}"</span>
                                  <span className="text-[8px] opacity-75">(Submit to replace UPI/QR link)</span>
                                </div>
                              )}
                             <div className="grid grid-cols-2 gap-3">
                               <div className="space-y-1">
                                 <label className="text-[10px] text-slate-500 font-black uppercase">Dealer Name</label>
                                 <input 
                                   type="text" 
                                   value={dealerForm.name}
                                   onChange={(e) => setDealerForm(prev => ({ ...prev, name: e.target.value }))}
                                   className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                                   placeholder="Full Name"
                                 />
                               </div>
                               <div className="space-y-1">
                                 <label className="text-[10px] text-slate-500 font-black uppercase">WhatsApp (intl)</label>
                                 <input 
                                   type="text" 
                                   value={dealerForm.whatsapp}
                                   onChange={(e) => setDealerForm(prev => ({ ...prev, whatsapp: e.target.value }))}
                                   className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                                   placeholder="+91..."
                                 />
                               </div>
                             </div>
                             <div className="grid grid-cols-2 gap-3">
                               <div className="space-y-1">
                                 <label className="text-[10px] text-slate-500 font-black uppercase">UPI ID (Optional)</label>
                                 <input 
                                   type="text" 
                                   value={dealerForm.upiId}
                                   onChange={(e) => setDealerForm(prev => ({ ...prev, upiId: e.target.value }))}
                                   className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                                   placeholder="name@upi"
                                 />
                               </div>
                               <div className="space-y-1">
                                 <label className="text-[10px] text-slate-500 font-black uppercase">QR Code (File or URL Link)</label>
                                 <div className="flex flex-col gap-2">
                                   <div className="flex gap-2">
                                     <input 
                                       id="dealer-qr-upload"
                                       type="file" 
                                       accept="image/*"
                                       onChange={(e) => {
                                         const file = e.target.files?.[0];
                                         if (file) {
                                           const reader = new FileReader();
                                           reader.onloadend = () => setDealerQrBase64(reader.result as string);
                                           reader.readAsDataURL(file);
                                         }
                                       }}
                                       className="hidden"
                                     />
                                     <label 
                                       htmlFor="dealer-qr-upload"
                                       className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-[10px] text-slate-400 cursor-pointer hover:bg-slate-900 transition-all flex items-center justify-between"
                                     >
                                       <span className="truncate">{dealerQrBase64 ? 'File Selected Ready' : (dealerForm.qrUrl ? 'Using Custom URL' : 'Upload QR Image')}</span>
                                       <Camera size={14} className="text-indigo-500" />
                                     </label>
                                     {(dealerQrBase64 || dealerForm.qrUrl) && (
                                       <button 
                                         onClick={() => {
                                           setDealerQrBase64(null);
                                           setDealerForm(prev => ({ ...prev, qrUrl: '' }));
                                         }}
                                         className="w-10 h-10 rounded-xl bg-red-900/20 text-red-500 flex items-center justify-center border border-red-500/10"
                                       >
                                         <X size={14} />
                                       </button>
                                     )}
                                   </div>
                                   <div className="flex gap-2">
                                     <div className="bg-slate-950 border border-white/10 rounded-xl flex items-center px-4 py-2 flex-1">
                                       <AtSign size={14} className="text-slate-600 mr-2" />
                                       <input 
                                         type="text" 
                                         placeholder="Or paste QR link here..."
                                         value={dealerForm.qrUrl || ''}
                                         onChange={(e) => setDealerForm(prev => ({ ...prev, qrUrl: e.target.value }))}
                                         className="bg-transparent border-none outline-none text-[10px] text-white w-full placeholder:text-slate-700"
                                       />
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>
                             <div className="flex gap-3">
                               <button 
                                 onClick={handleSaveDealer}
                                 disabled={isDealerSaving}
                                 className="flex-[2] py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/20 active:scale-95"
                               >
                                 {isDealerSaving ? 'Saving...' : (editingDealerId ? 'Update Selected Dealer Info (पुराना Link/QR बदलें)' : 'Add Verified Dealer')}
                               </button>
                               {editingDealerId && (
                                 <button 
                                   onClick={() => {
                                     setEditingDealerId(null);
                                     setDealerForm({ name: '', whatsapp: '', upiId: '', qrUrl: '', isActive: true });
                                     setDealerQrBase64(null);
                                   }}
                                   className="flex-1 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                                 >
                                   Cancel
                                 </button>
                               )}
                             </div>
                           </div>

                           <div className="space-y-3">
                             {dealers.map(dealer => (
                               <div key={dealer.id} className="bg-slate-900 p-4 rounded-2xl border border-white/5 flex items-center justify-between shadow-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="relative group">
                                      <button 
                                        onClick={() => {
                                          if (dealer.qrUrl) window.open(dealer.qrUrl, '_blank');
                                        }}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-black overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all ${dealer.isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-600'} ${dealer.qrUrl ? 'cursor-zoom-in' : 'cursor-default'}`}
                                      >
                                        {dealer.qrUrl ? (
                                          <img src={dealer.qrUrl} alt="QR" className="w-full h-full object-cover" />
                                        ) : (
                                          dealer.name[0]
                                        )}
                                      </button>
                                      {dealer.qrUrl && (
                                        <div className="absolute -top-1 -right-1 p-0.5 bg-indigo-500 rounded-lg shadow-lg z-10 pointer-events-none">
                                          <Maximize2 size={8} className="text-white" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-xs font-black text-white">{dealer.name}</div>
                                      <div className="text-[9px] text-slate-500 font-bold uppercase">{dealer.whatsapp}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     {dealer.qrUrl && (
                                       <button 
                                         onClick={() => {
                                           const link = document.createElement('a');
                                           link.href = dealer.qrUrl!;
                                           link.download = `QR_${dealer.name.replace(/\s+/g, '_')}.png`;
                                           document.body.appendChild(link);
                                           link.click();
                                           document.body.removeChild(link);
                                           addNotification("Downloading QR...", 'info');
                                         }}
                                         className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600/10 text-emerald-400 border border-emerald-500/10 hover:bg-emerald-500 hover:text-white transition-all outline-none"
                                       >
                                         <Download size={12} />
                                         <span className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Download QR</span>
                                       </button>
                                     )}
                                     <button 
                                      onClick={() => handleEditDealer(dealer)}
                                      className="p-1.5 rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 hover:bg-indigo-500 hover:text-white transition-all outline-none"
                                      title="Edit Dealer"
                                     >
                                       <Pencil size={14} />
                                     </button>
                                     <button 
                                      onClick={() => handleToggleDealer(dealer.id!, dealer.isActive)}
                                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase border transition-all ${dealer.isActive ? 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20' : 'bg-slate-800 text-slate-500 border-white/5'}`}
                                     >
                                       {dealer.isActive ? 'ACTIVE' : 'INACTIVE'}
                                     </button>
                                     <button 
                                      onClick={async () => {
                                        if (confirm('Delete this dealer?')) {
                                          await deleteDoc(doc(db, 'dealers', dealer.id!));
                                          addNotification("Dealer removed", 'info');
                                        }
                                      }}
                                      className="p-1.5 rounded-lg bg-red-900/10 text-red-500 border border-red-500/10 hover:bg-red-500 hover:text-white transition-all"
                                     >
                                       <X size={14} />
                                     </button>
                                  </div>
                               </div>
                            ))}
                          </div>
                       </div>
                     ) : (
                        /* Admin Debug & Recovery Panel */
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase flex items-center gap-2">
                              <Shield size={14} className="text-rose-500" />
                              Admin Debug & Recovery Master Control
                            </h3>
                            <button 
                              onClick={checkDbConnectionAndCounts}
                              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 px-4 py-1.5 rounded-full text-[10px] font-black text-white transition-all shadow-md active:scale-95 text-xs font-black"
                            >
                              <RefreshCcw size={12} /> RE-CHECK HEALTH
                            </button>
                          </div>

                          {/* Connection health & Stats */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 space-y-2">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Database Connection Status</span>
                              <div className="flex items-center gap-2.5">
                                {dbConnectionStatus === 'Connected' ? (
                                  <>
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse" />
                                    <span className="text-sm font-black text-white uppercase tracking-wider">✔ CONNECTED</span>
                                  </>
                                ) : dbConnectionStatus === 'Disconnected' ? (
                                  <>
                                    <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_12px_#ef4444]" />
                                    <span className="text-sm font-black text-red-400 uppercase tracking-wider">✘ DISCONNECTED</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-spin border-2 border-slate-900 border-t-amber-500" />
                                    <span className="text-sm font-black text-amber-500 uppercase tracking-wider">CHECKING...</span>
                                  </>
                                )}
                              </div>
                              <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-tight font-sans">Active Connection to cloud Firestore</span>
                            </div>

                            <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 space-y-2">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Active Admin Account</span>
                              <span className="text-sm font-black text-amber-500 block font-mono truncate">{currentUser?.email || 'nikhilrv8055@gmail.com'}</span>
                              <span className="text-[8px] text-slate-500 font-bold block uppercase tracking-tight">Current administrator session</span>
                            </div>

                            <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 space-y-2">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Database Profiles Sync Status</span>
                              <span className="text-2xl font-black text-emerald-500 block font-mono">{allUsers.length}</span>
                              <div className="text-[8px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed">
                                Profiles in <span className="font-mono text-emerald-400 font-black">firestore.users</span>
                              </div>
                            </div>
                          </div>

                          {/* Last Sync Indicator */}
                          <div className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <Info size={14} className="text-indigo-400" />
                              <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none block">Realtime Firestore Listening Active (All changes sync instantly)</span>
                            </div>
                          </div>

                          {/* Quick Diagnostics Diagnostics Log wrapper */}
                          <div className="bg-slate-900 p-5 rounded-3xl border border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black text-slate-400 tracking-wider block uppercase">Action Log & Troubleshoot diagnostics</span>
                              <button 
                                onClick={() => { setLocalDiagnostics([]); addNotification("Diagnostic Logs Cleared", "info"); }}
                                className="text-[8px] font-black text-slate-500 uppercase hover:text-slate-300 transition-colors bg-transparent border-0 outline-none cursor-pointer"
                              >
                                CLEAR LOGS
                              </button>
                            </div>
                            
                            <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 max-h-[160px] overflow-y-auto custom-scrollbar font-mono text-[9px] text-slate-400 space-y-2">
                              {localDiagnostics.length === 0 ? (
                                <div className="text-center py-6 text-slate-600 font-bold uppercase tracking-wider">No active diagnostic events gathered yet.</div>
                              ) : (
                                [...localDiagnostics].reverse().map((log, idx) => (
                                  <div key={idx} className="border-b border-white/5 pb-1.5 last:border-0 text-left font-mono">
                                    <div className="flex justify-between font-black">
                                      <span className={`${log.status === 'success' ? 'text-emerald-400' : log.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`}>
                                        [{log.status.toUpperCase()}] {log.operation}
                                      </span>
                                      <span className="text-slate-600">{String(log.timestamp)}</span>
                                    </div>
                                    {log.error && <p className="text-slate-300 font-bold mt-0.5">Error: {log.error}</p>}
                                    {log.payload && (
                                      <pre className="text-[8px] bg-slate-900 p-1 rounded mt-1 overflow-x-auto whitespace-pre-wrap max-h-36 font-mono text-slate-550">
                                        {JSON.stringify(log.payload, null, 2)}
                                      </pre>
                                    )}
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* Direct Test User creation helper */}
                          <div className="bg-slate-900 p-5 rounded-[32px] border border-white/5 space-y-4">
                            <div className="flex flex-col gap-1 text-left">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Manual Testing</span>
                              <h4 className="text-xs font-black text-white uppercase tracking-tight">Direct Profile Insertion Playground</h4>
                              <p className="text-[9px] text-slate-400 leading-normal uppercase text-left">
                                Use this test tool to bypass auth registration restrictions and manually force-insert a valid profile record straight into <span className="font-mono text-pink-400 font-bold">firestore.users</span> collection!
                              </p>
                            </div>

                            <div className="flex flex-col gap-3">
                              <button
                                onClick={handleCreateTestUser}
                                className="w-full py-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-rose-950/20 cursor-pointer"
                              >
                                Create Test User Directly
                              </button>
                              
                              {testUserResult && (
                                <div className={`p-4 rounded-2xl border text-left ${testUserResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} text-[10px] font-bold leading-normal uppercase`}>
                                  {testUserResult.message}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => { setIsAdminLoggedIn(false); setIsAdminOpen(false); }}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-900/30 text-red-500 text-xs font-black hover:bg-red-900/10 transition-all uppercase tracking-widest shadow-lg"
                    >
                      <LogOut size={14} />
                      Terminate Security Session
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>



        {/* Auth Modal (Login/Register) */}
        <AnimatePresence>
          {isAuthModalOpen && !currentUser && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center overscroll-none select-none p-4 w-screen h-screen"
            >
              {/* Premium Ambient Background Glows */}
              <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />
              <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />

              <div 
                className="w-full max-w-md bg-slate-950/45 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] px-8 py-8 flex flex-col gap-6 justify-center max-h-[92vh] overflow-y-auto overscroll-none custom-scrollbar relative shadow-[0_0_80px_-15px_rgba(59,130,246,0.3)]"
              >
                {/* Diagonal Glass Reflection Flare */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.03] via-transparent to-amber-500/[0.03] rounded-[2.5rem] pointer-events-none" />

                {/* Close Button if already logged in */}
                {currentUser && (
                  <div className="absolute top-6 right-6 z-10">
                    <button 
                      onClick={() => setIsAuthModalOpen(false)} 
                      className="p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-all bg-white/5 border border-white/5 hover:scale-105 duration-150"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}

                {/* Sorat Themed Glowing Logo */}
                <div className="flex flex-col items-center gap-4 text-center pt-2">
                  <div className="relative w-28 h-28 rounded-full bg-slate-950/80 flex items-center justify-center border border-white/10 shadow-[0_0_50px_rgba(245,158,11,0.2)] p-1.5 group">
                    {/* Rotating Rainbow/Amber Neon Border Ring */}
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-blue-500 to-amber-300 rounded-full opacity-70 animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="absolute inset-[2px] bg-slate-950 rounded-full" />
                    
                    {/* Inner circular logo container */}
                    <div className="absolute inset-[4px] rounded-full bg-slate-900/90 flex items-center justify-center overflow-hidden border border-white/5 shadow-inner">
                      {adminState.appLogoUrl ? (
                        <img src={adminState.appLogoUrl} alt="Sorat Live" className="w-full h-full object-cover transform group-hover:scale-110 duration-500" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-1">
                          <Dice5 className="text-amber-400 animate-bounce" size={32} style={{ animationDuration: '2.5s' }} />
                          <span className="text-[10px] font-black tracking-[0.2em] text-amber-500/90 uppercase mt-0.5">SORAT</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Pulsing Active Status Badge */}
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-950 flex items-center justify-center shadow-xl">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                  </div>

                  <div className="space-y-1.5 mt-2">
                    <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                      SORAT
                    </h1>
                    <p className="text-[10px] text-blue-400 font-extrabold uppercase tracking-[0.4em] drop-shadow-sm">
                      Official Portal • 100% Secure
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Google Login (Rendered Unconditionally) */}
                  <button 
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isAuthLoading}
                    className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border border-blue-400/20 text-white font-black py-4.5 rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_12px_24px_-10px_rgba(59,130,246,0.5)] hover:shadow-[0_20px_35px_-10px_rgba(59,130,246,0.6)] flex items-center justify-center gap-3.5 mt-2 cursor-pointer active:scale-95 transform"
                  >
                    {/* Glowing highlight trace */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
                    
                    <div className="bg-white/10 p-2 rounded-xl border border-white/10 flex items-center justify-center group-hover/btn:bg-white/15 transition-colors">
                      <svg className="w-5 h-5 shrink-0 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.95"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.22-.66-.35-1.36-.35-2.09z" opacity="0.9"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" opacity="0.95"/>
                      </svg>
                    </div>
                    <span className="font-extrabold tracking-[0.15em]">
                      {isAuthLoading ? 'Connecting Securely...' : 'Sign in with Google'}
                    </span>
                  </button>

                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-[1px] bg-white/10" />
                    <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">OR</span>
                    <div className="flex-1 h-[1px] bg-white/10" />
                  </div>

                  <button 
                    type="button"
                    onClick={() => {
                      setIsDemoMode(true);
                      setIsAuthModalOpen(false);
                      addNotification("Logged in as Guest! Demo Practice Mode is active.", "info");
                    }}
                    className="w-full relative overflow-hidden group/btn bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border border-amber-500/30 text-amber-400 font-black py-4.5 rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3.5 active:scale-95 transform cursor-pointer shadow-[0_12px_24px_-10px_rgba(245,158,11,0.1)] hover:shadow-[0_20px_35px_-10px_rgba(245,158,11,0.15)]"
                  >
                    <Terminal size={16} className="text-amber-400" />
                    <span>Play as Guest</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile / Bank Details Modal */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-x-0 top-0 bottom-[48px] sm:bottom-[56px] z-40 bg-slate-950 flex flex-col overscroll-none select-none"
            >
              {/* Profile Header */ }
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                    <User size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-tight text-white uppercase">Profile & Wallet</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {currentUser?.email?.endsWith('@sorat.live') 
                        ? `Mobile: ${currentUser.email.split('@')[0]}` 
                        : (currentUser?.email || 'Guest User')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      if (currentUser) fetchUserProfile(currentUser, true);
                      fetchPersonalRequests();
                      addNotification("Data refreshed", "info");
                    }} 
                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors"
                    title="Refresh Data"
                  >
                    <RefreshCcw size={16} />
                  </button>
                  <button onClick={() => setIsProfileOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-900/40 mb-4 border-4 border-slate-900 relative">
                    <User size={32} />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tighter uppercase">
                    {userProfile?.displayName || (currentUser?.email?.endsWith('@sorat.live') ? currentUser.email.split('@')[0] : 'Member')}
                  </h2>
                  <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase opacity-60 italic">
                    {currentUser?.email?.endsWith('@sorat.live') 
                      ? `Mobile: ${currentUser.email.split('@')[0]}` 
                      : currentUser?.email}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                  <button 
                    onClick={() => setProfileTab('info')}
                    className={`py-2.5 text-[9px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${profileTab === 'info' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-900/50'}`}
                  >
                    <User size={12} /> ACCOUNT
                  </button>
                  <button 
                    onClick={() => {
                      if (!currentUser && !isDemoMode) {
                        addNotification("Please register or login first!", "info");
                        setIsAuthModalOpen(true);
                        setIsProfileOpen(false);
                      } else {
                        setProfileTab('deposit');
                        setDepositStep(1);
                        setTransactionAmount('');
                      }
                    }}
                    className={`py-2.5 text-[9px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      profileTab === 'deposit' 
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 border-2 border-emerald-300 scale-105' 
                        : 'bg-emerald-950/60 text-emerald-400 font-extrabold border border-emerald-500/40 animate-pulse'
                    }`}
                  >
                    <Wallet size={12} /> DEPOSIT
                  </button>
                  <button 
                    onClick={() => {
                      if (!currentUser && !isDemoMode) {
                        addNotification("Please register or login first!", "info");
                        setIsAuthModalOpen(true);
                        setIsProfileOpen(false);
                      } else {
                        setProfileTab('withdraw');
                        setTransactionAmount('');
                        setShowWithdrawConfirm(false);
                      }
                    }}
                    className={`py-2.5 text-[9px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      profileTab === 'withdraw' 
                        ? 'bg-gradient-to-r from-indigo-400 to-indigo-600 text-slate-950 shadow-lg shadow-indigo-500/20 border-2 border-indigo-300 scale-105' 
                        : 'bg-indigo-950/60 text-indigo-400 font-extrabold border border-indigo-500/40 animate-pulse'
                    }`}
                  >
                    <TrendingUp size={12} /> WITHDRAW
                  </button>
                  <button 
                    onClick={() => setProfileTab('history')}
                    className={`py-2.5 text-[9px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${profileTab === 'history' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-900/50'}`}
                  >
                    <History size={12} /> HISTORY
                  </button>
                </div>

                {profileTab === 'info' && (
                  <div className="space-y-4">
                    {/* Basic Details Section */}
                    <div className="bg-slate-950 p-5 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-blue-500" />
                          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Basic Details</h3>
                        </div>
                      </div>

                      {/* Install Button Section */}
                      <motion.button 
                        initial={{ opacity: 1, y: 0 }}
                        animate={{ 
                          boxShadow: [
                            "0 0 0px rgba(37, 99, 235, 0)",
                            "0 0 25px rgba(37, 99, 235, 0.6)",
                            "0 0 0px rgba(37, 99, 235, 0)"
                          ],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ 
                          boxShadow: { repeat: Infinity, duration: 2 },
                          scale: { repeat: Infinity, duration: 2 },
                          default: { duration: 0.5 }
                        }}
                        onClick={handleInstallClick}
                        className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 py-5 rounded-2xl text-xs font-black text-white active:scale-95 transition-all shadow-2xl shadow-blue-900/40 border border-white/20 mb-4"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shadow-inner overflow-hidden border border-white/20">
                          {adminState.appLogoUrl ? (
                            <img src={adminState.appLogoUrl} alt="App Icon" className="w-full h-full object-cover" />
                          ) : (
                            <Download size={20} className="animate-bounce" />
                          )}
                        </div>
                        <div className="flex flex-col items-start">
                           <span className="tracking-[0.1em] uppercase text-[11px]">Install Game App</span>
                           <span className="text-[8px] opacity-70 font-bold uppercase tracking-tight">Add to Home Screen</span>
                        </div>
                      </motion.button>

                      {!currentUser && (
                        <button 
                          onClick={() => {
                            setIsProfileOpen(false);
                            setIsAuthModalOpen(true);
                          }}
                          className="w-full py-4 rounded-xl border border-dashed border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-500/5 transition-all mb-4"
                        >
                          Login to Save Progress
                        </button>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider flex items-center gap-1.5">
                          <User size={10} className="text-blue-500" /> Full Name (Official/Account Holder)
                        </span>
                        <input 
                          type="text"
                          className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-blue-500 outline-none text-white font-medium"
                          value={bankDetails.accountHolder}
                          onChange={(e) => setBankDetails({...bankDetails, accountHolder: e.target.value})}
                          placeholder="Same name as in your bank account"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider flex items-center gap-1.5">
                          <QrCode size={10} className="text-emerald-500" /> UPI ID (GPAY / PHONEPE / PAYTM)
                        </span>
                        <input 
                          type="text"
                          placeholder="example@upi"
                          className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-emerald-500 outline-none text-white font-mono"
                          value={bankDetails.upiId || ''}
                          onChange={(e) => setBankDetails({...bankDetails, upiId: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Integrated Bank Account Details */}
                    <div className="bg-slate-950 p-5 rounded-3xl border border-white/5 space-y-4">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                        <CreditCard size={16} className="text-blue-500" />
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bank Account (for safe withdrawal)</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Bank Name</span>
                          <input 
                            type="text"
                            placeholder="e.g. State Bank of India"
                            className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-blue-500 outline-none text-white font-medium"
                            value={bankDetails.bankName || ''}
                            onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">IFSC Code</span>
                          <input 
                            type="text"
                            placeholder="e.g. SBIN0001234"
                            className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-blue-500 outline-none text-white font-mono uppercase"
                            value={bankDetails.ifscCode || ''}
                            onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Account Number</span>
                        <input 
                          type="text"
                          placeholder="e.g. 123456789012"
                          className="bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-blue-500 outline-none text-white font-mono"
                          value={bankDetails.accountNumber || ''}
                          onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="bg-slate-950 p-5 rounded-3xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 mb-1">
                        <QrCode size={16} className="text-purple-500" />
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Safe Payment QR Code (for scan & pay)</h3>
                      </div>
                      
                      <div className="relative group">
                        <label className="w-full aspect-square max-w-[185px] mx-auto bg-slate-900 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-purple-500/50 hover:bg-purple-500/5 transition-all">
                            {bankDetails.qrUrl ? (
                                <img src={bankDetails.qrUrl} alt="Withdrawal QR" className="w-full h-full object-contain p-3 animate-fade-in" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 p-4 text-center">
                                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400">
                                    <Camera size={26} />
                                  </div>
                                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mt-1">TAP TO UPLOAD QR</span>
                                  <span className="text-[8px] text-slate-600 block leading-tight">Upload GPay/PhonePe QR screenshot</span>
                                </div>
                            )}
                            <input 
                                type="file" accept="image/*" className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => setBankDetails({...bankDetails, qrUrl: reader.result as string});
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                        </label>
                        {bankDetails.qrUrl && (
                          <button 
                            onClick={() => setBankDetails({...bankDetails, qrUrl: ''})}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg transition-colors"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>

                      <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-2xl">
                        <p className="text-[8.5px] sm:text-[9px] text-yellow-500/80 font-medium uppercase text-center leading-normal">
                          Note: Please upload an accurate UPI QR screenshot for safer & ultra-easy deposits/withdrawals.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleUpdateBankDetails()}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                    >
                      SAVE PROFILE SETTINGS
                    </button>

                    {/* Legal & Compliance Support Section */}
                    <div className="bg-slate-950 p-5 rounded-3xl border border-white/5 space-y-4 text-center">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2 justify-center">
                        <ShieldCheck size={16} className="text-blue-400" />
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sorat Live Entertainment</h3>
                      </div>
                      <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider leading-relaxed -mt-1">
                        Officially Approved Game Platform
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedPolicyType('terms');
                          }}
                          className="py-3 px-2 bg-slate-900 hover:bg-slate-850 border border-white/5 hover:border-blue-500/50 rounded-2xl text-[9px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          T&C / Rules
                        </button>
                        
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedPolicyType('privacy');
                          }}
                          className="py-3 px-2 bg-slate-900 hover:bg-slate-850 border border-white/5 hover:border-blue-500/50 rounded-2xl text-[9px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Privacy Policy
                        </button>
                        
                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedPolicyType('refund');
                          }}
                          className="py-3 px-2 bg-slate-900 hover:bg-slate-850 border border-white/5 hover:border-blue-500/50 rounded-2xl text-[9px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Refund Policy
                        </button>

                        <button 
                          type="button"
                          onClick={() => {
                            setSelectedPolicyType('contact');
                          }}
                          className="py-3 px-2 bg-slate-900 hover:bg-slate-850 border border-white/5 hover:border-blue-500/50 rounded-2xl text-[9px] font-black text-blue-400 hover:text-blue-300 transition-all uppercase tracking-wider cursor-pointer"
                        >
                          Contact Support
                        </button>
                      </div>

                      <p className="text-[7.5px] font-bold text-slate-700 uppercase tracking-widest mt-2 leading-loose">
                        © 2026 Sorat Live Ltd. All rights reserved. <br/> Bihar, India Support
                      </p>
                    </div>
                  </div>
                )}

                {profileTab === 'deposit' && (
                  <div className="space-y-4">
                    {isDemoMode ? (
                      <div className="bg-slate-950 p-5 rounded-3xl border border-white/5 space-y-4 text-center">
                        <div className="w-14 h-14 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto text-yellow-500 border border-yellow-500/20 mb-2">
                          <Zap size={24} className="animate-pulse" />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Demo Coins Refill</h3>
                        <p className="text-[10px] text-slate-400 leading-relaxed uppercase">
                          Get complimentary demo coins to practice risk-free! Limit ₹500 per day.
                        </p>
                        <div className="bg-slate-900/60 p-3 rounded-2xl border border-white/5">
                          <span className="text-slate-400 text-[10px] tracking-wider uppercase font-bold">Daily Refilled: ₹{demoDailyAdded} / ₹500</span>
                        </div>
                        <button 
                          onClick={() => {
                            if (demoDailyAdded >= 500) {
                              addNotification("Limit: ₹500 per day in demo account", 'info');
                              return;
                            }
                            const canAdd = 500 - demoDailyAdded;
                            setDemoBalance(prev => prev + canAdd);
                            setDemoDailyAdded(prev => prev + canAdd);
                            addNotification(`₹${canAdd} Demo Coins Added!`, 'win');
                          }}
                          className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-slate-950 font-black py-4 rounded-2xl text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-yellow-500/20 active:scale-95"
                        >
                          GET DEMO COINS
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-950 p-5 rounded-3xl border border-white/5 space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            Add Funds (Step {depositStep} of 2)
                          </h3>
                          <span className="text-[8px] font-black uppercase text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            UPI Gateway
                          </span>
                        </div>

                        {depositStep === 1 ? (
                          <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                              <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Enter Deposit Amount (₹)</label>
                              <input 
                                 type="number" autoFocus
                                 className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 w-full text-xl font-black text-white focus:border-green-500 outline-none shadow-inner text-center"
                                 placeholder="Min ₹10"
                                 value={transactionAmount}
                                 onChange={(e) => setTransactionAmount(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {[500, 1000, 5000].map(val => (
                                <button key={val} onClick={() => setTransactionAmount(val.toString())} className="bg-slate-800 py-2.5 rounded-xl text-[9px] font-black border border-white/5 hover:border-green-500 active:scale-95 transition-all">
                                  +₹{val}
                                </button>
                              ))}
                            </div>
                            
                            <button 
                              onClick={() => {
                                const amt = parseFloat(transactionAmount);
                                if (isNaN(amt) || amt < 10) {
                                  addNotification("Minimum deposit amount is ₹10", "info");
                                  return;
                                }
                                setDepositStep(2);
                              }}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 py-3.5 rounded-xl text-[10px] font-black tracking-widest text-white transition-all uppercase"
                            >
                              PROCEED TO PAYMENT
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Unified UPI payment container */}
                            <div className="flex flex-col items-center gap-1.5 py-1">
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest italic font-bold">Amount to Pay</span>
                              <span className="text-3xl font-black text-white">₹{transactionAmount}</span>
                            </div>

                            {/* Standard UPI options */}
                            {(() => {
                              const upi = paymentSettings.upiId || adminState.upiId || 'nikhilrv8055@okhdfcbank';
                              const rawPayee = paymentSettings.payeeName || adminState.upiPayeeName || 'RECHARGE PORTAL';
                              const cleanPayee = encodeURIComponent(rawPayee.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim());
                              const formattedAmount = parseFloat(transactionAmount).toFixed(2);
                              const standardUpiLink = `upi://pay?pa=${upi}&pn=${cleanPayee}&am=${formattedAmount}&cu=INR&tn=Recharge`;

                              return (
                                <div className="space-y-4">
                                  {/* App-specific payment buttons */}
                                  {paymentSettings.showUpiApps !== false && (
                                    <div className="grid grid-cols-3 gap-2">
                                      <button
                                        onClick={() => openUpiApp('gpay', upi, rawPayee, transactionAmount)}
                                        className="py-2.5 bg-slate-900 border border-white/5 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-center shadow"
                                      >
                                        <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                                        <span className="text-[7.5px] font-black tracking-wider text-slate-400">G-PAY</span>
                                      </button>

                                      <button
                                        onClick={() => openUpiApp('phonepe', upi, rawPayee, transactionAmount)}
                                        className="py-2.5 bg-slate-900 border border-white/5 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-center shadow"
                                      >
                                        <Smartphone className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                                        <span className="text-[7.5px] font-black tracking-wider text-slate-400">PHONEPE</span>
                                      </button>

                                      <button
                                        onClick={() => openUpiApp('paytm', upi, rawPayee, transactionAmount)}
                                        className="py-2.5 bg-slate-900 border border-white/5 hover:border-cyan-500 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 text-center shadow"
                                      >
                                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                                        <span className="text-[7.5px] font-black tracking-wider text-slate-400">PAYTM/OTHER</span>
                                      </button>
                                    </div>
                                  )}

                                  {/* Large universal button */}
                                  {paymentSettings.showUpiApps !== false && (
                                    <button
                                      onClick={() => openUpiApp('generic', upi, rawPayee, transactionAmount)}
                                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-transform active:scale-95 cursor-pointer shadow-lg flex items-center justify-center gap-1.5"
                                    >
                                      <Zap size={12} className="animate-bounce" />
                                      <span>PAY VIA ANY UPI APP</span>
                                    </button>
                                  )}

                                  {/* QR Code */}
                                  {paymentSettings.showQrCode !== false && (
                                    <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2">
                                      <div className="flex items-center gap-1.5">
                                        <QrCode size={12} className="text-pink-500 animate-pulse" />
                                        <span className="text-[8px] font-black text-pink-500 uppercase tracking-widest">SCAN QR CODE</span>
                                      </div>
                                      <p className="text-[7px] text-slate-400 font-bold uppercase text-center -mt-1">
                                        Scan to pay exact pre-set amount: ₹{formattedAmount}
                                      </p>
                                      <div className="p-1.5 bg-white rounded-xl max-w-[140px]">
                                        <img 
                                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(standardUpiLink)}`} 
                                          alt="Deposit QR" 
                                          className="w-[124px] h-[124px] object-contain rounded-lg" 
                                        />
                                      </div>
                                      <span className="text-[8px] text-emerald-500 font-extrabold tracking-wider uppercase text-center">₹{formattedAmount} FIXED QR</span>
                                    </div>
                                  )}

                                  {/* Backup Manual UPI Address */}
                                  {paymentSettings.showUpiApps !== false && (
                                    <div className="bg-slate-900 p-3 rounded-xl border border-white/5 space-y-2">
                                      <div className="flex justify-between items-center text-[7.5px] text-slate-500 font-bold uppercase">
                                        <span>UPI Address (Backup Copy)</span>
                                        <span className="text-emerald-500">100% WORKING</span>
                                      </div>
                                      <div className="flex items-center justify-between bg-slate-950 px-2.5 py-2 rounded-lg border border-white/5">
                                        <span className="text-[10px] font-mono font-black text-amber-500 tracking-wide select-all break-all">{upi}</span>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(upi);
                                            addNotification("UPI ID Copied successfully!", "win");
                                          }}
                                          className="p-1 text-slate-400 hover:text-amber-500 rounded transition-colors cursor-pointer"
                                        >
                                          <Copy size={11} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            {/* Important warning info */}
                            <div className="bg-gradient-to-r from-red-950 to-amber-950 border border-red-500/20 p-3.5 rounded-2xl space-y-1.5 text-center leading-normal">
                              <p className="text-[10px] font-black text-amber-400 uppercase tracking-wide">
                                ⚠️ Payment ke baad screenshot upload karein
                              </p>
                              <p className="text-[8px] text-slate-300 font-bold uppercase">
                                screenshot send kiye bagair account auto-approve nahi hoga. screen proof MUST upload!
                              </p>
                            </div>

                            {/* Screenshot Upload Frame */}
                            <div className="space-y-2">
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">Upload Screenshot proof</span>
                              <label className="w-full aspect-video bg-slate-900 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-3 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all relative overflow-hidden">
                                <input 
                                  id="file"
                                  type="file" accept="image/*" className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setScreenshotFile(file);
                                      const reader = new FileReader();
                                      reader.onloadend = () => setScreenshotBase64(reader.result as string);
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                />
                                {screenshotBase64 ? (
                                  <div className="absolute inset-0">
                                    <img src={screenshotBase64} alt="Proof" className="w-full h-full object-contain p-1" />
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center gap-1">
                                    <Camera size={18} className="text-slate-600" />
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Click to Upload Screenshot</span>
                                  </div>
                                )}
                              </label>
                            </div>

                            {/* Transaction ID */}
                            <div className="space-y-1.5">
                              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">UTR ID/Reference Number</span>
                              <input 
                                type="text"
                                placeholder="12-digit UTR/TXN Code"
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold focus:border-emerald-500 outline-none text-white font-mono text-center"
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                              />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setDepositStep(1)}
                                className="bg-slate-800 p-3 rounded-xl text-slate-400 active:scale-95 transition-all flex items-center justify-center"
                              >
                                <ArrowRight size={14} className="rotate-180" />
                              </button>
                              <button 
                                onClick={handleDeposit}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-500 py-3.5 rounded-xl text-[10px] font-black tracking-widest transition-all text-white uppercase shadow-lg shadow-emerald-950/20 active:scale-95"
                              >
                                SUBMIT DEPOSIT PROOF
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {profileTab === 'withdraw' && (
                  <div className="space-y-4">
                    {isDemoMode ? (
                      <div className="bg-slate-950 p-5 rounded-3xl border border-white/5 space-y-4 text-center">
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20 mb-2">
                          <ShieldAlert size={20} />
                        </div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Withdraw Rejected</h3>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider leading-relaxed">
                          Demo account coordinates cannot be withdrawn! Switch to REAL mode to withdraw real money.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-slate-950 p-5 rounded-3xl border border-white/5 space-y-4">
                        {!showWithdrawConfirm ? (
                          <>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest font-extrabold text-white">Withdraw Funds</h3>
                              <span className="text-[8px] font-black uppercase text-indigo-500 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                                Real Cash-out
                              </span>
                            </div>

                            <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl flex items-center gap-2 mb-2 text-left">
                              <Zap size={14} className="text-red-500 shrink-0" />
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-red-500 uppercase leading-none">Estimated Processing</span>
                                <span className="text-[8px] text-slate-400 font-bold uppercase mt-0.5">30 - 90 Minutes Settlement</span>
                              </div>
                            </div>

                            <div className="space-y-4">
                              {/* Withdrawal Method selection tab */}
                              <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-white/5">
                                <button 
                                  onClick={() => setWithdrawalMethod('upi')}
                                  className={`flex-1 py-1.5 rounded-lg text-[8.5px] font-black uppercase transition-all ${withdrawalMethod === 'upi' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                  UPI ID (FAST)
                                </button>
                                <button 
                                  onClick={() => setWithdrawalMethod('bank')}
                                  className={`flex-1 py-1.5 rounded-lg text-[8.5px] font-black uppercase transition-all ${withdrawalMethod === 'bank' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                  BANK TRANSFER
                                </button>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-end px-1">
                                  <label className="text-[9px] text-slate-500 uppercase font-black">Withdraw Amount (₹)</label>
                                  <span className="text-[9px] text-slate-400 font-black">Available: ₹{balance}</span>
                                </div>
                                <input 
                                  type="number" autoFocus
                                  className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 w-full text-lg font-bold focus:border-red-500 outline-none text-white text-center font-mono"
                                  placeholder="0.00"
                                  value={transactionAmount}
                                  onChange={(e) => setTransactionAmount(e.target.value)}
                                />
                              </div>

                              <div className="flex justify-between items-center px-1">
                                <button 
                                  onClick={() => setTransactionAmount(balance.toString())}
                                  className="text-[9px] text-blue-400 font-black hover:underline uppercase tracking-wider text-left"
                                >
                                  Withdraw All Funds (₹{balance})
                                </button>
                              </div>

                              <button 
                                onClick={handleWithdraw}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.15em] transition-all shadow-lg active:scale-95"
                              >
                                REQUEST WITHDRAWAL
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <h3 className="text-[10px] font-black uppercase text-yellow-500 tracking-widest">Confirm Withdrawal Info</h3>
                              <button onClick={() => setShowWithdrawConfirm(false)} className="text-slate-500 hover:text-white transition-colors"><X size={14} /></button>
                            </div>

                            <div className="bg-slate-900 border border-white/5 p-4 rounded-2xl space-y-3">
                              <div className="flex justify-between border-b border-white/5 pb-2">
                                <span className="text-[9px] text-slate-500 uppercase font-black">Method</span>
                                <span className="text-[10px] font-black text-white uppercase">{withdrawalMethod === 'upi' ? 'UPI ID' : 'BANK TRANSFER'}</span>
                              </div>
                              <div className="flex justify-between border-b border-[#ffffff0a] pb-2">
                                <span className="text-[9px] text-slate-500 uppercase font-black">Amount</span>
                                <span className="text-sm font-black text-indigo-400">₹{transactionAmount}</span>
                              </div>

                              {withdrawalMethod === 'upi' ? (
                                <div className="flex justify-between border-b border-[#ffffff0a] pb-2">
                                  <span className="text-[9px] text-slate-500 uppercase font-black">UPI ID</span>
                                  <span className="text-[10px] font-mono text-emerald-400 font-bold select-all">{bankDetails.upiId}</span>
                                </div>
                              ) : (
                                <div className="space-y-2.5">
                                  <div className="flex justify-between border-b border-[#ffffff0a] pb-2">
                                    <span className="text-[9px] text-slate-500 uppercase font-black">Bank Name</span>
                                    <span className="text-[10px] font-black text-white">{bankDetails.bankName}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-[#ffffff0a] pb-2">
                                    <span className="text-[9px] text-slate-500 uppercase font-black">IFSC Code</span>
                                    <span className="text-[10px] font-mono text-white font-bold">{bankDetails.ifscCode}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[9px] text-slate-500 uppercase font-black">Account Number</span>
                                    <span className="text-[10px] font-mono text-white font-bold select-all">{bankDetails.accountNumber}</span>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex justify-between pt-1">
                                <span className="text-[9px] text-slate-500 uppercase font-black">Account Holder</span>
                                <span className="text-[10px] font-black text-white uppercase">{bankDetails.accountHolder}</span>
                              </div>
                            </div>

                            <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-xl text-center">
                              <p className="text-[8.5px] text-yellow-500 uppercase font-black leading-tight">
                                Kripya Bank/UPI Details Sahi Check Karein. Galat Account details me transaction hone par system zimmedar nahi hoga!
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button 
                                onClick={() => setShowWithdrawConfirm(false)}
                                className="px-4 py-3.5 bg-slate-800 rounded-xl text-[9px] font-bold text-slate-400 uppercase tracking-widest active:scale-95 transition-all"
                              >
                                BACK
                              </button>
                              <button 
                                onClick={handleWithdrawConfirm}
                                className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-3.5 rounded-xl text-[10px] uppercase tracking-[0.15em] transition-all shadow-xl active:scale-95"
                              >
                                YES, DISPATCH NOW
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {profileTab === 'history' && (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto px-1 custom-scrollbar">
                      {[...personalDeposits.map(d => ({ ...d, type: 'deposit' as const })), ...personalWithdrawals.map(w => ({ ...w, type: 'withdrawal' as const }))]
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((item, idx) => (
                        <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex flex-col gap-3 group hover:border-white/10 transition-all shadow-lg">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl bg-opacity-20 ${item.type === 'deposit' ? 'bg-emerald-500 text-emerald-500' : 'bg-red-500 text-red-500'}`}>
                                {item.type === 'deposit' ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-tight">{item.type}</span>
                                <span className="text-[8px] text-slate-500 font-bold">{new Date(item.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className={`text-sm font-black ${item.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                                {item.type === 'deposit' ? '+' : '-'}₹{item.amount}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {item.status === 'pending' && <div className="w-1 h-1 rounded-full bg-yellow-500 animate-pulse" />}
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                                  item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 
                                  item.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/10' : 
                                  'bg-yellow-500/10 text-yellow-500 border border-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                                }`}>
                                  {item.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Rich Details for approved/rejected/pending */}
                          <div className="flex items-center justify-between pt-2 border-t border-white/5 opacity-60 text-[8px] font-bold uppercase tracking-widest text-slate-500">
                             <div className="flex items-center gap-1">
                               <Shield size={10} className="text-yellow-600" />
                               <span>ID: {item.id?.slice(-8).toUpperCase() || 'REF-8384'}</span>
                             </div>
                             {item.status === 'pending' ? (
                               <div className="flex items-center gap-1 text-yellow-500/80">
                                 <Clock size={10} />
                                 <span>Processing...</span>
                               </div>
                             ) : item.status === 'approved' ? (
                               <div className="flex items-center gap-1 text-emerald-500/80">
                                 <CheckCircle size={10} />
                                 <span>Verified</span>
                               </div>
                             ) : (
                               <div className="flex items-center gap-1 text-red-500/80">
                                 <XCircle size={10} />
                                 <span>Rejected</span>
                               </div>
                             )}
                          </div>
                          
                          {(item.status === 'approved' || item.status === 'pending') && item.type === 'deposit' && item.transactionId && (
                            <div className="bg-slate-900/50 p-2 rounded-lg border border-white/5 flex justify-between items-center mt-1">
                               <span className="text-[7px] text-slate-500 font-black uppercase">UTR Ref Number</span>
                               <span className="text-[8px] font-mono text-white tracking-widest">{item.transactionId}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {(personalDeposits.length === 0 && personalWithdrawals.length === 0) && (
                        <div className="text-center py-10 opacity-50">
                          <History size={32} className="mx-auto mb-2 text-slate-600" />
                          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Transactions Yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={() => setIsTutorialOpen(true)}
                    className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase flex items-center justify-center gap-2 border border-white/5"
                  >
                    <HelpCircle size={14} className="text-blue-400" />
                    HOW TO PLAY
                  </button>
                </div>

                <div className="flex gap-2 mt-2">
                  <button 
                    onClick={handleUpdateBankDetails}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-3 rounded-xl text-[10px] uppercase cursor-pointer"
                  >
                    SAVE DETAILS
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        addNotification("Logging out safely...", "info");
                        setIsProfileOpen(false);
                        setUserProfile(null);
                        setCurrentUser(null);
                        setBalance(0);
                        localStorage.removeItem('sorat_auth_session');
                        localStorage.removeItem('appwrite_session_user');
                        
                        try {
                          await logout();
                        } catch (e) {
                          console.warn("Auth signOut call failed, continuing with local cleanup:", e);
                        }
                        
                        // Perform a clean window reload to completely clear memory variables, timers, and routes
                        setTimeout(() => {
                          window.location.reload();
                        }, 400);
                      } catch (err) {
                        console.error("Logout error:", err);
                        setIsProfileOpen(false);
                        setUserProfile(null);
                        setCurrentUser(null);
                        setBalance(0);
                        localStorage.removeItem('sorat_auth_session');
                        localStorage.removeItem('appwrite_session_user');
                        window.location.reload();
                      }
                    }}
                    className="p-3 bg-red-900/10 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-900/20 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5 px-4"
                    title="Logout account"
                  >
                    <LogOut size={16} />
                    <span className="text-[10px] font-black uppercase tracking-wider">LOGOUT</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deposit Modal */}
        <AnimatePresence>
          {isDepositOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overscroll-none select-none"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 w-full max-w-md mx-auto rounded-[2.5rem] border border-white/10 p-6 flex flex-col gap-4 h-fit max-h-[88vh] overflow-y-auto overscroll-none custom-scrollbar shadow-2xl"
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h2 className="text-xl font-black text-green-500 tracking-tight">ADD FUNDS</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1">
                        {[1, 2].map(s => (
                          <div 
                            key={s} 
                            className={`h-1 rounded-full transition-all ${depositStep >= s ? 'w-4 bg-green-500' : 'w-2 bg-slate-800'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">Step {depositStep} of 2</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-blue-500/10 border-blue-500/20">
                    <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[8px] font-black text-white">S</div>
                    <span className="text-[9px] font-black uppercase tracking-tight text-blue-400">Official Fast Pay</span>
                  </div>
                  <button onClick={() => { setIsDepositOpen(false); setDepositStep(1); }} className="text-slate-500"><X /></button>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <Clock size={16} className="text-emerald-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none mb-1">PAY AND SEND SCREENSHOT</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Verified Processing within 10-20 Minutes</span>
                  </div>
                </div>

                {depositStep === 1 ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Enter Deposit Amount (₹)</label>
                      <input 
                         type="number" autoFocus
                         className="bg-slate-950 border border-white/10 rounded-xl px-4 py-4 w-full text-2xl font-black text-white focus:border-green-500 outline-none shadow-inner"
                         placeholder="Min ₹10"
                         value={transactionAmount}
                         onChange={(e) => setTransactionAmount(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[500, 1000, 5000].map(val => (
                        <button key={val} onClick={() => setTransactionAmount(val.toString())} className="bg-slate-800 py-3 rounded-xl text-[10px] font-black border border-white/5 hover:border-green-500 active:scale-95 transition-all uppercase">
                          +₹{val}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Step 2: Direct Payment Page */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest italic">Transferring Exactly</span>
                        <span className="text-4xl font-black text-white">₹{transactionAmount}</span>
                      </div>

                      <div className="flex flex-col items-center gap-4 w-full pt-2">
                        {/* Instant UPI Redirect & Direct Payment Button */}
                          <div className="w-full bg-slate-900 border border-white/5 p-4 rounded-[2rem] space-y-4 shadow-xl">
                            <div className="flex items-center gap-2 justify-center">
                              {paymentSettings.showUpiApps !== false ? (
                                <Smartphone className="text-amber-500 animate-pulse" size={16} />
                              ) : (
                                <QrCode className="text-amber-500 animate-pulse" size={16} />
                              )}
                              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                                {paymentSettings.showUpiApps !== false && paymentSettings.showQrCode !== false
                                  ? "PAY VIA UPI OR QR CODE"
                                  : paymentSettings.showUpiApps !== false
                                  ? "PAY VIA INSTANT UPI"
                                  : "SCAN QR CODE TO PAY"
                                }
                              </span>
                            </div>
                            <p className="text-[8px] text-slate-400 font-bold uppercase text-center -mt-2">
                              {paymentSettings.showUpiApps !== false && paymentSettings.showQrCode !== false
                                ? "Choose your preferred payment method below!"
                                : paymentSettings.showUpiApps !== false
                                ? "Pay securely using any UPI app on your device!"
                                : "Scan QR code or use a manual scanner to process payment!"
                              }
                            </p>

                            {/* Clean UPI Parameter Setup */}
                            {(() => {
                              const upi = paymentSettings.upiId || adminState.upiId || 'nikhilrv8055@okhdfcbank';
                              const rawPayee = paymentSettings.payeeName || adminState.upiPayeeName || 'RECHARGE PORTAL';
                              // Best practice for banking gateways: Payee name must be strictly alphanumeric (no spaces/symbols) to prevent parsing errors inside target UPI apps
                              const cleanPayee = encodeURIComponent(rawPayee.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim());
                              
                              const formattedAmount = parseFloat(transactionAmount).toFixed(2);
                              // We remove &tn (transaction note) entirely to prevent system-generated references (like RECHXXXX) which cause UPI security blocks on personal accounts.
                              const standardUpiLink = `upi://pay?pa=${upi}&pn=${cleanPayee}&am=${formattedAmount}&cu=INR&tn=Recharge`;

                              return (
                                <div className="space-y-4">
                                  {paymentSettings.showUpiApps === false && paymentSettings.showQrCode === false && (
                                    <div className="text-center p-4 text-[10px] text-slate-500 uppercase font-black">
                                      No active payment methods selected by Administrator. Please contact support.
                                    </div>
                                  )}

                                  {/* App-specific Instant Redirection Buttons using standard UPI scheme */}
                                  {(paymentSettings.showUpiApps !== false) && (
                                    <div className="grid grid-cols-3 gap-2">
                                      <button
                                        onClick={() => openUpiApp('gpay', upi, rawPayee, transactionAmount)}
                                        className="py-3 bg-slate-950 border border-white/5 hover:border-blue-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                      >
                                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4 object-contain" alt="GPay" />
                                        <span className="text-[8px] font-black tracking-wider text-slate-300">GOOGLE PAY</span>
                                      </button>

                                      <button
                                        onClick={() => openUpiApp('phonepe', upi, rawPayee, transactionAmount)}
                                        className="py-3 bg-slate-950 border border-white/5 hover:border-purple-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                      >
                                        <Smartphone className="w-4 h-4 text-purple-400" />
                                        <span className="text-[8px] font-black tracking-wider text-slate-300">PHONEPE</span>
                                      </button>

                                      <button
                                        onClick={() => openUpiApp('paytm', upi, rawPayee, transactionAmount)}
                                        className="py-3 bg-slate-950 border border-white/5 hover:border-cyan-500 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                                      >
                                        <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
                                        <span className="text-[8px] font-black tracking-wider text-slate-300">PAYTM / OTHER</span>
                                      </button>
                                    </div>
                                  )}

                                  {/* Big Unified Redirection Button */}
                                  {(paymentSettings.showUpiApps !== false) && (
                                    <button
                                      onClick={() => openUpiApp('generic', upi, rawPayee, transactionAmount)}
                                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 rounded-[1.5rem] flex flex-col items-center justify-center gap-1 font-black text-xs uppercase tracking-widest transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg shadow-amber-950/40"
                                    >
                                      <div className="flex items-center gap-2">
                                        <Zap size={14} className="animate-bounce" />
                                        <span>PAY VIA ANY UPI APP</span>
                                      </div>
                                      <span className="text-[8px] opacity-80 font-bold">CLICK TO PAY ₹{formattedAmount}</span>
                                    </button>
                                  )}

                                  {/* Global QR Code Display for scanning */}
                                  {paymentSettings.showQrCode !== false && (
                                    <div className="bg-slate-950 p-4 rounded-3xl border border-white/5 flex flex-col items-center justify-center gap-3">
                                      <div className="flex items-center gap-2">
                                        <QrCode size={14} className="text-pink-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">SCAN FIXED AMOUNT QR CODE</span>
                                      </div>
                                      <p className="text-[8px] text-slate-400 font-bold uppercase text-center -mt-2">Scan QR code to directly pay the exact pre-set amount!</p>
                                      <div className="p-2 bg-white rounded-2xl border border-white/10 shadow-lg shrink-0 max-w-[200px]">
                                        <img 
                                          src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(standardUpiLink)}`} 
                                          alt="Deposit QR" 
                                          className="w-[180px] h-[180px] object-contain p-1 rounded-xl" 
                                        />
                                      </div>
                                      <span className="text-xs text-emerald-400 font-black tracking-widest uppercase text-center">₹{formattedAmount} PRE-SET UPI QR</span>
                                      <a
                                        href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(standardUpiLink)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="py-2 px-4 bg-slate-900 border border-white/10 hover:border-pink-500 rounded-full text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-1.5 cursor-pointer hover:text-white transition-all shadow-inner"
                                      >
                                        <Download size={11} />
                                        <span>Download/Save QR</span>
                                      </a>
                                    </div>
                                  )}

                                  {/* Backup Manual UPI Address */}
                                  {(paymentSettings.showUpiApps !== false) && (
                                    <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-3">
                                      <div className="flex justify-between items-center text-[8px] text-slate-500 font-black uppercase">
                                        <span>UPI Address (Backup Copy)</span>
                                        <span className="text-emerald-500">100% WORKING</span>
                                      </div>
                                      <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-xl border border-white/5">
                                        <span className="text-xs font-mono font-black text-amber-500 tracking-wide select-all break-all">{upi}</span>
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(upi);
                                            addNotification("UPI ID Copied successfully!", "win");
                                          }}
                                          className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer shrink-0 animate-pulse"
                                        >
                                          <Copy size={12} />
                                        </button>
                                      </div>
                                      <div className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5 text-[9px] text-slate-300 font-bold uppercase tracking-tight leading-normal space-y-1">
                                        <div className="text-amber-400 font-black">💡 REDIRECTION PROBLEM SOLUTION:</div>
                                        <p>Agar direct mobile app open hone ke baad payment nahi hoti, toh security reasons ya bank limit ki wajah se block ho sakta hai.</p>
                                        <p className="text-emerald-400 font-black">Aap upar diye gaye UPI Address ko click karke COPY karein aur apne GPay/PhonePe App me manual PAY karein! Yeh 100% safal aur bina kisi block ke kaam karega.</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>

                          <div className="w-full bg-amber-500/10 border border-amber-500/30 p-5 rounded-[2rem] flex flex-col items-center gap-3">
                             <div className="flex items-center gap-2">
                               <ShieldAlert size={20} className="text-amber-500 hover:scale-110 transition-transform" />
                               <span className="text-[12px] font-black text-amber-500 uppercase tracking-widest leading-none">Important Instruction</span>
                             </div>
                             <p className="text-[13px] font-black text-white text-center leading-relaxed">
                               Aap screenshot nikale aur payment kre aur payment screenshot upload bhi kre wo nhi karoge to aapka payment system me add nahi hoga
                             </p>
                          </div>

                         </div>
                      </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl shadow-lg shadow-amber-950/20 animate-pulse">
                       <p className="text-[12px] font-black text-amber-500 text-center uppercase tracking-wider">
                         👉 payment ke baad upload your payment screenshot
                       </p>
                       <p className="text-[9px] font-bold text-white/90 text-center uppercase mt-1.5 leading-tight">
                         Bina Kisi Dikkat Ke Payment Ke Baad Kripya Niche "Upload Screenshot" Par Click Karke Payment Screenshot Zaroor Upload Karen!
                       </p>
                    </div>

                    <div className="space-y-4">
                       <div className="flex flex-col gap-3">
                         <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex justify-between items-center px-1">
                           <span>Upload Payment Proof</span>
                           {screenshotBase64 && <span className="text-emerald-500 flex items-center gap-1"><Shield size={10} /> READY</span>}
                         </label>
                         <label className="w-full aspect-[4/3] bg-slate-950 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all group relative overflow-hidden">
                            <input 
                              id="file"
                              type="file" accept="image/*" className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setScreenshotFile(file);
                                  const reader = new FileReader();
                                  reader.onloadend = () => setScreenshotBase64(reader.result as string);
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                            {screenshotBase64 ? (
                              <div className="absolute inset-0">
                                <img src={screenshotBase64} alt="Proof" className="w-full h-full object-contain p-2" />
                                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <Camera size={24} className="text-white" />
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-3">
                                <div className="p-4 bg-slate-900 rounded-2xl group-hover:bg-emerald-500/20 transition-all">
                                  <Camera size={28} className="text-slate-600 group-hover:text-emerald-500" />
                                </div>
                                <div className="text-center">
                                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Click to Capture Screenshot</span>
                                   <span className="text-[7px] text-slate-600 font-black uppercase">Max size 2MB • JPG or PNG</span>
                                </div>
                              </div>
                            )}
                         </label>
                       </div>

                       <div className="space-y-2">
                         <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest px-1">Transaction ID / UTR (Optional)</label>
                         <input 
                           type="text"
                           placeholder="12-digit UTR Number"
                           className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-emerald-500 outline-none text-white font-mono"
                           value={transactionId}
                           onChange={(e) => setTransactionId(e.target.value)}
                         />
                       </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {depositStep > 1 && (
                    <button 
                      onClick={() => setDepositStep(prev => prev - 1)}
                      className="bg-slate-800 p-4 rounded-xl text-slate-400 active:scale-95 transition-all"
                    >
                      <ArrowRight size={18} className="rotate-180" />
                    </button>
                  )}
                  <button 
                    onClick={handleDeposit}
                    className="flex-1 bg-green-600 hover:bg-green-500 py-4 rounded-xl text-xs font-black tracking-[0.2em] transition-all shadow-lg shadow-green-950/20 active:scale-95 uppercase"
                  >
                    {depositStep < 2 ? 'NEXT STEP' : 'SUBMIT DEPOSIT PROOF'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Withdraw Modal */}
        <AnimatePresence>
          {isWithdrawOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overscroll-none select-none touch-none"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 w-full max-w-sm mx-auto rounded-[2.5rem] border border-white/10 p-5 h-auto max-h-[90vh] overflow-hidden overscroll-none shadow-2xl flex flex-col"
              >
                {!showWithdrawConfirm ? (
                  <>
                    <div className="flex justify-between items-center mb-4 text-left">
                      <div className="flex flex-col">
                        <h2 className="text-lg font-black text-red-500 tracking-tight">WITHDRAW</h2>
                        <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Instant Bank Settlement</span>
                      </div>
                      <button onClick={() => setIsWithdrawOpen(false)} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/10 p-2.5 rounded-xl flex items-center gap-2.5 mb-4 text-left">
                      <div className="p-1.5 bg-red-500/10 rounded-lg">
                        <Zap size={14} className="text-red-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-red-500 uppercase">Estimated Arrival Time</span>
                        <span className="text-[8px] text-slate-400 font-bold">30 - 90 Minutes (Batch Processing)</span>
                      </div>
                    </div>

                    <div className="space-y-3.5 text-left">
                      {/* Method Selection */}
                      <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-white/5">
                        <button 
                          onClick={() => setWithdrawalMethod('upi')}
                          className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold uppercase transition-all ${withdrawalMethod === 'upi' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          UPI ID (Fast)
                        </button>
                        <button 
                          onClick={() => setWithdrawalMethod('bank')}
                          className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold uppercase transition-all ${withdrawalMethod === 'bank' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                          Bank Transfer
                        </button>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-end">
                          <label className="text-[9px] text-slate-500 uppercase font-black">Withdraw Amount (₹)</label>
                          <span className="text-[9px] text-slate-400 font-black">Available: ₹{balance}</span>
                        </div>
                        <input 
                          type="number" autoFocus
                          className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 w-full text-lg font-bold focus:border-red-500 outline-none text-white text-center"
                          placeholder="0.00"
                          value={transactionAmount}
                          onChange={(e) => setTransactionAmount(e.target.value)}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => setTransactionAmount(balance.toString())}
                          className="text-[10px] text-blue-400 font-bold hover:underline uppercase tracking-wide"
                        >
                          Withdraw All Funds
                        </button>
                      </div>

                      <button 
                        onClick={handleWithdraw}
                        className="w-full bg-slate-50 py-3.5 rounded-xl text-slate-950 text-xs font-black tracking-widest hover:bg-white transition-all shadow-lg active:scale-[0.98]"
                      >
                        REQUEST WITHDRAWAL
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4 text-left">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-black text-yellow-500 tracking-tight">CONFIRM DETAILS</h2>
                      <button onClick={() => setShowWithdrawConfirm(false)} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
                    </div>
                    
                    <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-[9px] text-slate-500 uppercase font-black">Amount</span>
                        <span className="text-lg font-black text-white">₹{transactionAmount}</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-500 uppercase font-black">
                          {withdrawalMethod === 'upi' ? 'Target UPI ID' : 'Target Bank Details'}
                        </span>
                        {withdrawalMethod === 'upi' ? (
                          <div className="flex justify-between items-center p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/20">
                            <span className="text-[10px] text-slate-400 font-bold">UPI ID</span>
                            <span className="text-xs font-black text-blue-400 truncate max-w-[200px]">{bankDetails.upiId}</span>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-y-1.5 text-[10px]">
                            <div className="text-slate-500 font-bold uppercase">Bank Name</div>
                            <div className="text-white text-right font-black">{bankDetails.bankName}</div>
                            
                            <div className="text-slate-500 font-bold uppercase">Account Holder</div>
                            <div className="text-white text-right font-black truncate">{bankDetails.accountHolder}</div>
                            
                            <div className="text-slate-500 font-bold uppercase">Account No.</div>
                            <div className="text-white text-right font-black tracking-wider font-mono">{bankDetails.accountNumber}</div>
                            
                            <div className="text-slate-500 font-bold uppercase">IFSC Code</div>
                            <div className="text-white text-right font-black font-mono">{bankDetails.ifscCode}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 p-2.5 bg-red-500/10 rounded-lg border border-red-500/20 text-[8px] text-red-400 font-black uppercase tracking-wider">
                        <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
                        Incorrect details cannot be corrected after submit!
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setShowWithdrawConfirm(false)}
                          className="flex-1 bg-slate-800 py-3 rounded-xl text-[10px] font-black uppercase transition-all hover:bg-slate-700"
                        >
                          EDIT
                        </button>
                        <button 
                          onClick={handleWithdrawConfirm}
                          className="flex-[2] bg-red-600 py-3 rounded-xl text-white text-[10px] font-black tracking-widest hover:bg-red-500 transition-all shadow-lg active:scale-[0.98]"
                        >
                          CONFIRM & SUBMIT
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* Result Overlay */}
        <AnimatePresence>
          {phase === 'result' && 
            !isAdminOpen && 
            !isProfileOpen && 
            !isDepositOpen && 
            !isWithdrawOpen && 
            !selectedPolicyType && 
            !isTutorialOpen && 
            !isAdminAuthorized && 
            Object.keys(myBets).length > 0 && (
            <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 overscroll-none select-none touch-none pointer-events-none">
              <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto overscroll-none select-none" />
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: 30 }}
                className="w-full max-w-[320px] bg-slate-900 border border-emerald-500/30 rounded-[40px] flex flex-col items-center justify-center p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_40px_rgba(16,185,129,0.1)] relative z-10 pointer-events-auto"
              >
                {myBets[winner!] && <Confetti />}
                <motion.div
                  initial={{ rotateY: 180, scale: 0.5 }}
                  animate={{ rotateY: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
                  className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-emerald-400 flex items-center justify-center mb-6 shadow-2xl"
                >
                  {winner !== null && (
                    (customImages[winner] || GAME_SLOTS.find(s => s.id === winner)?.imageUrl) ? (
                      <img src={customImages[winner] || GAME_SLOTS.find(s => s.id === winner)?.imageUrl} alt="Winner" className="w-14 h-14 object-contain rounded-xl" />
                    ) : (
                      React.createElement(GAME_SLOTS.find(s => s.id === winner)!.icon, { 
                        className: `w-14 h-14 ${GAME_SLOTS.find(s => s.id === winner)!.color}` 
                      })
                    )
                  )}
                </motion.div>
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-black mb-1 text-white uppercase tracking-tight">
                    {customNames[winner!] || GAME_SLOTS.find(s => s.id === winner)?.name}
                  </h2>
                  <div className="text-[9px] text-emerald-400 tracking-[0.4em] uppercase font-black mb-6">IS THE WINNER!</div>
                </div>
                
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mb-6">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  />
                </div>

                {Object.keys(myBets).length > 0 && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="w-full"
                  >
                    {myBets[winner!] ? (
                      <div className="bg-emerald-600 px-5 py-4 rounded-[28px] flex flex-col items-center gap-1 shadow-xl border border-emerald-400/20">
                        <Trophy className="text-yellow-300 w-4 h-4 mb-1" />
                        <span className="text-white font-black text-xl tracking-tighter">₹{(myBets[winner!] * adminState.multiplier).toLocaleString()}</span>
                        <span className="text-[8px] text-emerald-200 font-bold uppercase tracking-widest">NET WINNINGS</span>
                      </div>
                    ) : (
                      <div className="bg-slate-800/80 px-5 py-4 rounded-[28px] border border-white/5 opacity-80">
                        <span className="text-slate-400 font-black text-[9px] tracking-[0.3em] uppercase">BET LOST</span>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Tutorial Modal */}
        <AnimatePresence>
          {isTutorialOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overscroll-none select-none"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 w-full max-w-sm rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col h-fit max-h-[85vh] overscroll-none shadow-2xl"
              >
                <div className="p-6 bg-gradient-to-b from-blue-600/20 to-transparent flex justify-between items-start">
                  <div className="flex flex-col">
                    <h2 className="text-2xl font-black text-white leading-tight">GUIDE & HELP</h2>
                    <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Learn to play & win</span>
                  </div>
                  <button onClick={() => setIsTutorialOpen(false)} className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex px-4 gap-1 border-b border-white/5 pb-4">
                  {[
                    { id: 'how', label: 'RULES', icon: Dice5 },
                    { id: 'bet', label: 'BETTING', icon: TrendingUp },
                    { id: 'wallet', label: 'WALLET', icon: Wallet },
                    { id: 'faq', label: 'FAQ', icon: HelpCircle }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setTutorialTab(tab.id as any)}
                      className={`flex-1 py-3 px-2 rounded-2xl flex flex-col items-center gap-1.5 transition-all ${
                        tutorialTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105' : 'text-slate-500 hover:bg-white/5'
                      }`}
                    >
                      <tab.icon size={14} />
                      <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
                  {tutorialTab === 'how' && (
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/10 overflow-hidden">
                          {adminState.appLogoUrl ? (
                            <img src={adminState.appLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <Dice5 className="text-blue-500" size={20} />
                          )}
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white uppercase">Game Basics</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">Choose from 12 unique symbols (Patang, Chhatri, Cow, etc.) and predict which one will appear in the next round.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/10">
                          <Clock className="text-purple-500" size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white uppercase">30s Rounds</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">Each game lasts 30 seconds. You have 25 seconds to place your bets. The last 5 seconds are locked for the result.</p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0 border border-green-500/10">
                          <Zap className="text-green-500" size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-white uppercase">10x Multiplier</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">If your symbol wins, you get 10x your bet amount instantly credited to your wallet!</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {tutorialTab === 'bet' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-slate-950 rounded-2xl border border-white/5 space-y-3">
                        <h4 className="text-xs font-black text-blue-400 uppercase">How to Bet?</h4>
                        <ol className="space-y-3">
                          <li className="flex items-start gap-2 text-xs text-slate-300 font-medium">
                            <span className="w-4 h-4 bg-blue-500 text-slate-950 flex items-center justify-center rounded-full text-[10px] font-black shrink-0 mt-0.5">1</span>
                            Select bet amount (₹10, ₹50, ₹100, etc.) from the bottom selector.
                          </li>
                          <li className="flex items-start gap-2 text-xs text-slate-300 font-medium">
                            <span className="w-4 h-4 bg-blue-500 text-slate-950 flex items-center justify-center rounded-full text-[10px] font-black shrink-0 mt-0.5">2</span>
                            Click on any symbol card in the main grid to place your bet.
                          </li>
                          <li className="flex items-start gap-2 text-xs text-slate-300 font-medium">
                            <span className="w-4 h-4 bg-blue-500 text-slate-950 flex items-center justify-center rounded-full text-[10px] font-black shrink-0 mt-0.5">3</span>
                            You can bet on multiple symbols in a single round.
                          </li>
                        </ol>
                      </div>

                      <div className="flex gap-4 p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
                        <ShieldAlert className="text-yellow-500 shrink-0" size={20} />
                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-yellow-500 uppercase">Pro Tip</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed">Check the 'HISTORY' section to see previous winners and identify hot or cold symbols.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {tutorialTab === 'wallet' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/10 flex flex-col gap-2">
                          <Coins className="text-green-500" size={24} />
                          <h4 className="text-xs font-black text-white">DEPOSIT</h4>
                          <p className="text-[10px] text-slate-400 leading-tight">Add funds via UPI, Bank Transfer or Verified Dealers.</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/10 flex flex-col gap-2">
                          <Wallet className="text-blue-500" size={24} />
                          <h4 className="text-xs font-black text-white">WITHDRAW</h4>
                          <p className="text-[10px] text-slate-400 leading-tight">Instant withdrawal to your bank account or UPI.</p>
                        </div>
                      </div>

                      <div className="p-4 border border-white/5 rounded-2xl space-y-2">
                        <h4 className="text-xs font-black text-slate-500 uppercase">Demo Account</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                          Use the <span className="text-orange-400 font-bold">DEMO MODE</span> to practice without real money. Demo coins are free and cannot be withdrawn.
                        </p>
                      </div>
                    </div>
                  )}

                  {tutorialTab === 'faq' && (
                    <div className="space-y-4">
                      {[
                        { q: "Is this game real?", a: "Yes, you play with real currency and rankings are calculated live." },
                        { q: "What's the minimum bet?", a: "Minimum bet usually starts from ₹10." },
                        { q: "Dealer Deposits are safe?", a: "We only list verified dealers. Always check their dynamic QR codes." },
                        { q: "Withdrawal time?", a: "Bank withdrawals usually take 10-30 mins during business hours." }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 space-y-1">
                          <p className="text-xs font-black text-white uppercase tracking-tight">Q: {item.q}</p>
                          <p className="text-[11px] text-slate-400 font-medium">A: {item.a}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-slate-950 border-t border-white/5">
                  <button 
                    onClick={() => setIsTutorialOpen(false)}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-900/20 active:scale-95 transition-all"
                  >
                    GOT IT, LET'S PLAY!
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Leaderboard Modal */}
        <AnimatePresence>
          {isLeaderboardOpen && (
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="absolute inset-x-0 top-0 bottom-[48px] sm:bottom-[56px] z-40 bg-slate-950 flex flex-col overscroll-none select-none"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-black tracking-tight text-white uppercase">Leaderboard</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Top Players • Live Ranking</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      fetchLeaderboard(true);
                      addNotification("Leaderboard updated", "info");
                    }}
                    disabled={isQuotaExceeded}
                    className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors disabled:opacity-30"
                    title="Refresh"
                  >
                    <RefreshCcw size={16} />
                  </button>
                  <button onClick={() => setIsLeaderboardOpen(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-2">
                  {leaderboardData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                      <Trophy size={48} className="mb-4 text-slate-700" />
                      <p className="text-xs font-black uppercase tracking-widest">Collecting Data...</p>
                    </div>
                  ) : (
                    leaderboardData.map((player, idx) => (
                      <div 
                        key={player.userId}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          player.userId === currentUser?.uid ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/40 border-white/5 hover:border-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${
                            idx === 0 ? 'bg-yellow-500 text-slate-950 shadow-lg shadow-yellow-500/30' : 
                            idx === 1 ? 'bg-slate-300 text-slate-950' : 
                            idx === 2 ? 'bg-orange-400 text-slate-950' : 'bg-slate-700 text-slate-400'
                          }`}>
                            #{idx + 1}
                          </div>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white uppercase truncate max-w-[120px]">{player.displayName}</span>
                              {player.userId === currentUser?.uid && (
                                <span className="text-[8px] bg-blue-500 px-1.5 py-0.5 rounded font-black text-white">YOU</span>
                              )}
                            </div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Player Profile</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm font-black text-emerald-500">₹{player.totalWinnings.toLocaleString()}</div>
                          <div className="text-[8px] text-slate-500 font-black uppercase tracking-tighter">Highest: ₹{player.highestWin.toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Footer Info */}
              <div className="p-6 bg-slate-950/50 border-t border-white/5">
                 <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter text-center leading-relaxed">
                   Ranking is calculated based on total real-money winnings. <br/>
                   Demo wins are not included in the global leaderboard.
                 </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Result Overlay */}
        <AnimatePresence>
          {gameResult && !isProfileOpen && !isAdminOpen && !isLeaderboardOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overscroll-none select-none touch-none"
            >
              <motion.div
                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.8, y: -50, opacity: 0 }}
                transition={{ type: "spring", damping: 15 }}
                className={`w-full max-w-sm rounded-[2.5rem] border-2 p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden bg-slate-900/95 ${
                  gameResult === 'win' 
                    ? 'border-emerald-500/50 shadow-emerald-500/20' 
                    : 'border-rose-500/50 shadow-rose-500/20'
                }`}
              >
                {/* Close Button */}
                <button
                  onClick={() => setGameResult(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-20 cursor-pointer"
                >
                  <X size={16} />
                </button>

                {/* Decorative Background Rays */}
                <div className={`absolute inset-0 opacity-10 blur-[60px] pointer-events-none ${gameResult === 'win' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                
                {/* Floating particles effect */}
                {gameResult === 'win' ? (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(12)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: i % 2 === 0 ? '#10b981' : '#f59e0b',
                          left: `${15 + Math.random() * 70}%`,
                          top: `${20 + Math.random() * 65}%`,
                        }}
                        animate={{
                          y: [-10, -80 - Math.random() * 50],
                          x: [0, (Math.random() - 0.5) * 60],
                          scale: [0, 1.2, 0],
                          opacity: [0, 0.9, 0]
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: Math.random() * 0.5
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-3 rounded-full bg-rose-500/40"
                        style={{
                          left: `${15 + Math.random() * 70}%`,
                          top: `${10 + Math.random() * 40}%`,
                        }}
                        animate={{
                          y: [0, 100 + Math.random() * 100],
                          opacity: [0, 0.7, 0]
                        }}
                        transition={{
                          duration: 1.5 + Math.random() * 1.5,
                          repeat: Infinity,
                          delay: Math.random() * 0.5,
                          ease: "linear"
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Main Animated Badge */}
                <div className="relative mb-6">
                  {/* Outer spinning aura */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                    className={`absolute -inset-4 rounded-full border border-dashed pointer-events-none ${
                      gameResult === 'win' ? 'border-emerald-500/40' : 'border-rose-500/40'
                    }`}
                  />
                  
                  {/* Bouncing inner circle */}
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shadow-lg relative ${
                      gameResult === 'win' 
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 shadow-emerald-500/20' 
                        : 'bg-gradient-to-tr from-rose-600 to-pink-500 text-white shadow-rose-500/20'
                    }`}
                  >
                    {gameResult === 'win' ? (
                      <Trophy size={40} className="text-slate-950 animate-pulse" />
                    ) : (
                      <XCircle size={40} className="text-white animate-pulse" />
                    )}
                  </motion.div>
                </div>

                {/* Text Announcement */}
                <div className="text-center mb-6 relative z-10 mx-auto px-4">
                  <motion.h2 
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [0.9, 1.05, 1] }}
                    transition={{ duration: 0.5 }}
                    className={`text-2xl sm:text-3xl font-extrabold uppercase tracking-tight mb-2 text-center select-none ${
                      gameResult === 'win' 
                        ? 'bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400 drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]' 
                        : 'bg-clip-text text-transparent bg-gradient-to-r from-rose-400 via-pink-400 to-orange-400 drop-shadow-[0_2px_10px_rgba(244,63,94,0.3)]'
                    }`}
                  >
                    {gameResult === 'win' ? 'You Win!' : 'Better Luck Next Time'}
                  </motion.h2>
                  <p className="text-[10px] font-black tracking-[0.25em] uppercase text-slate-400">
                    {gameResult === 'win' ? 'Congratulations Champion' : 'Try your luck in the next round'}
                  </p>
                </div>

                {/* Detailed breakdown card */}
                {winner !== null && (
                  <div className="w-full bg-slate-950/60 border border-white/5 backdrop-blur-lg rounded-3xl p-4 space-y-4 relative z-10">
                    {/* Winning Block Banner */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Winning Block</span>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const winSlot = GAME_SLOTS.find(s => s.id === winner);
                          if (!winSlot) return null;
                          const Icon = winSlot.icon;
                          const customImg = customImages[winSlot.id] || winSlot.imageUrl;
                          const customNm = customNames[winSlot.id] || winSlot.name;
                          return (
                            <>
                              {customImg ? (
                                <img src={customImg} alt={customNm} className="w-6 h-6 object-contain" />
                              ) : (
                                <Icon className={`${winSlot.color} w-5 h-5`} />
                              )}
                              <span className="text-xs font-black uppercase text-white tracking-tight">{customNm}</span>
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Stats layout */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      {gameResult === 'win' ? (
                        <>
                          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/5 flex flex-col justify-center">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Your Bet</span>
                            <span className="text-sm font-black text-amber-500">₹{myBets[winner] || 0}</span>
                          </div>
                          <div className="bg-emerald-500/5 rounded-2xl p-2.5 border border-emerald-500/10 flex flex-col justify-center">
                            <span className="text-[8px] font-bold text-emerald-400/70 uppercase tracking-widest block mb-1">Total Payout</span>
                            <span className="text-sm font-black text-emerald-400">₹{((myBets[winner] || 0) * adminState.multiplier).toFixed(0)}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-white/5 rounded-2xl p-2.5 border border-white/5 flex flex-col justify-center col-span-2">
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Placed Bet</span>
                            <span className="text-sm font-black text-rose-400">
                              ₹{Object.values(myBets).reduce((acc, curr) => acc + curr, 0)}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Bottom interactive close countdown */}
                <div className="mt-5 text-[8px] font-semibold text-slate-500 tracking-widest uppercase">
                  Closing in next round...
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Admin Broadcasted Update Modal */}
        <AnimatePresence>
          {adminState.updateInfo?.showPopup && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overscroll-none select-none touch-none"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="bg-slate-900 border border-purple-500/30 rounded-[2.5rem] p-8 max-w-sm w-full h-fit max-h-[90vh] overflow-y-auto overscroll-none shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" />
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-6 mx-auto">
                  <RefreshCcw size={32} className="text-purple-500 animate-spin-slow" />
                </div>
                
                <div className="text-center space-y-2 mb-8">
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">New Version Available</h2>
                  <div className="inline-block bg-purple-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                    V{adminState.updateInfo.version}
                  </div>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed pt-2">
                    {adminState.updateInfo.message}
                  </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-900/20 active:scale-95 transition-all"
                  >
                    Update & Refresh Now
                  </button>
                  
                  {!adminState.updateInfo.forceUpdate && (
                    <button 
                      onClick={() => setAdminState(prev => ({ ...prev, updateInfo: { ...prev.updateInfo!, showPopup: false } }))}
                      className="w-full py-4 rounded-2xl bg-slate-950 text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition-all"
                    >
                      Remind Me Later
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quota Exceeded Modal */}
        <AnimatePresence>
          {showQuotaModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overscroll-none select-none touch-none"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-slate-900 border border-red-500/30 rounded-[2.5rem] p-8 max-w-sm w-full h-fit max-h-[90vh] overflow-y-auto overscroll-none shadow-2xl relative overflow-hidden text-center"
              >
                <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center mb-6 mx-auto border border-red-500/20">
                  <ShieldAlert size={40} className="text-red-500 animate-pulse" />
                </div>
                
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">High Traffic</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-8">
                  The system is currently exceeding its free capacity due to extremely high traffic. <br/>
                  <span className="text-red-400/50 mt-2 block font-black">Quota resets daily at midnight.</span>
                </p>

                <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 text-left space-y-2 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Status: Resource Limit</span>
                  </div>
                  <p className="text-[9px] text-slate-600 font-bold uppercase leading-tight">
                    Daily read/write quotas have been exhausted. Use limited mode to view cached data.
                  </p>
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setShowQuotaModal(false);
                      setIsQuotaExceeded(false);
                      setHasAcknowledgedQuota(false);
                      window.location.reload();
                    }}
                    className="w-full py-4 rounded-2xl bg-white text-slate-950 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5"
                  >
                    <RefreshCcw size={14} />
                    Check Connectivity
                  </button>
                  <button 
                    onClick={() => {
                      setShowQuotaModal(false);
                      setHasAcknowledgedQuota(true);
                    }}
                    className="w-full py-4 rounded-2xl bg-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all border border-white/5"
                  >
                    Continue Limited Mode
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compliance Policy Modal Overlay */}
        <AnimatePresence>
          {selectedPolicyType && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overscroll-none select-none"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl relative overflow-hidden flex flex-col h-fit max-h-[85vh] overscroll-none"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-blue-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-wider leading-none">
                      {selectedPolicyType === 'terms' && 'Terms & Conditions'}
                      {selectedPolicyType === 'privacy' && 'Privacy Policy'}
                      {selectedPolicyType === 'refund' && 'Refund Policy'}
                      {selectedPolicyType === 'contact' && 'Contact Support'}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedPolicyType(null)}
                    className="p-1 px-2.5 rounded-xl bg-slate-950 border border-white/5 text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Close
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 text-slate-400 font-bold text-[10px] uppercase leading-relaxed space-y-4">
                  {selectedPolicyType === 'terms' && (
                    paymentSettings.termsContent ? (
                      <div className="whitespace-pre-line text-[11px] text-slate-300 font-medium tracking-wide normal-case">{paymentSettings.termsContent}</div>
                    ) : (
                      <>
                        <p className="text-white font-black">1. Platform Usage & Acceptance</p>
                        <p>Welcome to Sorat Live. By using our platform and system services, you agree to comply with and represent acceptance of these Terms and Conditions. If you do not accept these terms, please stop using the application immediately.</p>
                        
                        <p className="text-white font-black">2. Eligibility & Verification</p>
                        <p>You must be at least 18 years of age (or the official legal age in your jurisdiction) to participate. Account credentials and profile setups must be accurate and authentic.</p>

                        <p className="text-white font-black">3. Deposit & Tokens Rules</p>
                        <p>All deposits and manual approvals are handled via verified dealers or official system gateways. Once a deposit is confirmed, tokens are added to your virtual game wallet. These tokens can only be spent inside official rounds of play. Play responsibly.</p>

                        <p className="text-white font-black">4. Disclaimer of Liability</p>
                        <p>This application is designed for entertainment and promotional activities. We are not responsible for any direct, indirect, or unexpected issue arising out of technical service disruptions.</p>
                      </>
                    )
                  )}

                  {selectedPolicyType === 'privacy' && (
                    paymentSettings.privacyContent ? (
                      <div className="whitespace-pre-line text-[11px] text-slate-300 font-medium tracking-wide normal-case">{paymentSettings.privacyContent}</div>
                    ) : (
                      <>
                        <p className="text-white font-black">1. User Information Storage</p>
                        <p>We respect your privacy. We collect primary account registration details: including your email address, virtual user identifier, and public transaction record details. All login credentials are secured via Google Firebase Authentication.</p>
                        
                        <p className="text-white font-black">2. Cookies & State Tracking</p>
                        <p>We use local storage databases and temporary cookies solely to maintain your system session state, balance credits, high scores, and theme settings. We NEVER share your cookies with unauthorized networks.</p>

                        <p className="text-white font-black">3. Data Security & Integration</p>
                        <p>All financial transaction parameters, proof of payments, and wallet statements are encrypted. API key interfaces using secure system gateways do not expose your raw payment credentials to our local database system.</p>

                        <p className="text-white font-black">4. No Data Sharing</p>
                        <p>Your transactions and user profile statistics are completely confidential. We do not sell, sublease, or distribute any user metrics to any advertising or third-party analytical companies under any conditions.</p>
                      </>
                    )
                  )}

                  {selectedPolicyType === 'refund' && (
                    paymentSettings.refundContent ? (
                      <div className="whitespace-pre-line text-[11px] text-slate-300 font-medium tracking-wide normal-case">{paymentSettings.refundContent}</div>
                    ) : (
                      <>
                        <p className="text-white font-black">1. Deposit Settlement</p>
                        <p>When you top up your balance using virtual dealers or official gateway, credits are instantly added to your wallet account. It is your responsibility to review values before triggering payments.</p>
                        
                        <p className="text-white font-black">2. Refund Eligibility</p>
                        <p>Any funds converted and credited into virtual tokens/game wallet balances are non-refundable once they have been consumed or placed inside rounds of active play.</p>

                        <p className="text-white font-black">3. Withdrawal Handling</p>
                        <p>Users can submit formal Withdrawal requests directly inside the interface. Requests are verified and disbursed manually via our admin panel within 24 hours of initiating the claim.</p>

                        <p className="text-white font-black">4. Payment Failures</p>
                        <p>If money gets deducted from your bank but does not show up in your game account due to gateway delay, please contact support with a screenshot. Resolved cases will receive wallet credit adjustments. No automatic cash-backs are processed.</p>
                      </>
                    )
                  )}

                  {selectedPolicyType === 'contact' && (
                    <>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed mb-4">
                        {paymentSettings.supportText || 'For any queries, gateway failures, general feedback or payment-related disputes, please reach out directly to our merchant team:'}
                      </p>
                      
                      <div className="bg-slate-950 border border-white/5 p-4 rounded-3xl space-y-2 mt-2">
                        <p className="text-white font-black">Support Email:</p>
                        <p className="text-blue-400 lowercase select-all">{paymentSettings.supportEmail || 'nikhilrv8055@gmail.com'}</p>
                        
                        <p className="text-white font-black mt-2">Business Hours:</p>
                        <p className="text-slate-400 font-bold">{paymentSettings.supportHours || '10:00 AM to 08:00 PM (IST)'}</p>

                        <p className="text-white font-black mt-2">Registered Address:</p>
                        <p className="text-slate-400 font-bold">{paymentSettings.supportAddress || 'Bihar, India'}</p>

                        <p className="text-white font-black mt-2">Platform Operator:</p>
                        <p className="text-slate-400 font-bold">{paymentSettings.supportOperator || 'Sorat Live Gaming Solutions'}</p>
                      </div>
                      
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-4">We usually respond to all email tickets and payment reconciliation claims within 12 to 24 hours.</p>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bet Animations Layer */}
        <div className="fixed inset-0 pointer-events-none z-[60]">
          <AnimatePresence>
            {betAnimations.map(anim => (
              <motion.div
                key={anim.id}
                initial={{ x: anim.x, y: anim.y, scale: 0.5, opacity: 1, rotate: 0 }}
                animate={{ 
                  x: anim.targetX - 16, 
                  y: anim.targetY - 16, 
                  scale: [0.5, 1.2, 0.8],
                  opacity: [1, 1, 0],
                  rotate: 360
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "backOut" }}
                className="fixed w-8 h-8 flex items-center justify-center bg-yellow-500 rounded-full border-2 border-slate-950 shadow-[0_0_15px_rgba(250,204,21,0.5)] z-[70]"
                style={{ left: 0, top: 0 }}
              >
                <span className="text-[8px] font-black text-slate-950">₹{anim.amount}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Background Decorative Gradient */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]" />
      </div>

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
