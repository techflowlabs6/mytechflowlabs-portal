import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ShieldCheck, 
  Layers, 
  Code2, 
  Sparkles, 
  Terminal, 
  Mail, 
  Globe, 
  Clock, 
  Check, 
  Copy,
  ExternalLink,
  BookOpen,
  DollarSign,
  GraduationCap,
  Activity,
  Cpu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { soundEngine } from '../audio/SoundEngine';

export const LusionSidebar = ({ isOpen, onClose, onOpenAuthModal }) => {
  const { user, isAdmin, logout, adminEmail } = useAuth();
  const [timeStr, setTimeStr] = useState('');
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(adminEmail);
    setCopiedEmail(true);
    soundEngine.playChirp(1200);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const navLinks = [
    { num: '01', title: 'APPLICATIONS ECOSYSTEM', href: '#apps', tag: 'Live Hub' },
    { num: '02', title: 'FRENCH LEARNER AI', href: 'https://french-learner.mytechflowlabs.com', tag: 'App', external: true },
    { num: '03', title: 'TIMELOG PRO', href: 'https://timelog.mytechflowlabs.com', tag: 'App', external: true },
    { num: '04', title: 'TCF PREP SUITE', href: 'https://tcf.mytechflowlabs.com', tag: 'App', external: true },
    { num: '05', title: 'DRIVER EARNINGS TRACKER', href: 'https://driver-earnings.mytechflowlabs.com', tag: 'App', external: true },
    { num: '06', title: 'TECHNICAL DOMAINS & SKILLS', href: '#skills', tag: 'Matrix' },
    { num: '07', title: 'INTERFACE ARCHIVES', href: '#showcase', tag: 'Gallery' },
    { num: '08', title: 'ARCHITECTURE & SUPABASE', href: '#about', tag: 'System' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-2xl transition-all duration-500 animate-fadeIn">
      <div 
        className="w-full max-w-2xl h-full bg-[#030612]/98 border-l border-white/10 p-6 sm:p-10 flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header of Sidebar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white text-black font-black text-xs font-mono flex items-center justify-center">
              MTF
            </div>
            <span className="font-heading font-black text-lg text-white">
              MYTECHFLOW<span className="text-cyan-400">.LABS</span>
            </span>
          </div>

          <button
            onClick={() => {
              onClose();
              soundEngine.playChirp(600);
            }}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation List */}
        <div className="py-8 flex flex-col gap-1">
          <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-3">
            // DIRECTORY NAVIGATION
          </span>

          {navLinks.map((item) => (
            <a
              key={item.num}
              href={item.href}
              target={item.external ? '_blank' : '_self'}
              rel={item.external ? 'noopener noreferrer' : ''}
              onClick={() => {
                soundEngine.playChirp(850);
                if (!item.external) onClose();
              }}
              className="py-3 px-4 rounded-2xl hover:bg-white/5 flex items-center justify-between group text-decoration-none transition-all"
            >
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-slate-500 group-hover:text-cyan-400 font-bold">
                  {item.num}
                </span>
                <span className="font-heading font-bold text-lg sm:text-xl text-white group-hover:text-cyan-300 uppercase tracking-tight transition-colors">
                  {item.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-slate-400 group-hover:bg-cyan-500/20 group-hover:text-cyan-300 transition-colors">
                  {item.tag}
                </span>
                {item.external ? (
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-white" />
                ) : (
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
              </div>
            </a>
          ))}

          {/* Admin Control Link in Sidebar */}
          <div className="mt-4 pt-4 border-t border-white/10">
            {isAdmin ? (
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-purple-300 font-bold uppercase block">
                    SuperAdmin Verified
                  </span>
                  <p className="text-xs font-mono text-white font-bold truncate max-w-[240px]">
                    {user?.email || adminEmail}
                  </p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuthModal();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-purple-950/30 hover:bg-purple-950/50 border border-purple-500/30 text-purple-200 text-xs font-mono font-bold flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Admin Access ({adminEmail})</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Footer Meta & Direct Contact */}
        <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE EDGE STATUS: NORMAL</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{timeStr}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 truncate">
              <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
              <span className="text-xs font-mono text-white truncate">{adminEmail}</span>
            </div>
            <button
              onClick={handleCopyEmail}
              className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-mono flex items-center gap-1 shrink-0"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmail ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
