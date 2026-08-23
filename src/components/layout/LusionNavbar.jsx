import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Menu, 
  X, 
  Search, 
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import { useAuth } from '../../context/AuthContext';

export const LusionNavbar = ({ onOpenAuthModal, onFocusSearch, onOpenSidebar }) => {
  const { user, isAdmin, logout, adminEmail } = useAuth();
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const canvasRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mini audio visualizer animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    const renderVis = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 4;
      const width = 2.5;
      const gap = 2;

      for (let i = 0; i < bars; i++) {
        const height = isAudioActive 
          ? Math.sin(Date.now() * 0.008 + i * 1.5) * 6 + 8
          : 3;
        const x = i * (width + gap) + 4;
        const y = (canvas.height - height) / 2;

        ctx.fillStyle = isAudioActive ? '#00f0ff' : '#64748b';
        ctx.fillRect(x, y, width, height);
      }
      animId = requestAnimationFrame(renderVis);
    };

    renderVis();
    return () => cancelAnimationFrame(animId);
  }, [isAudioActive]);

  const handleToggleSound = () => {
    const active = soundEngine.toggle();
    setIsAudioActive(active);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled ? 'py-3.5 lusion-nav shadow-2xl' : 'py-5 bg-transparent'
    }`}>
      <div className="container-custom flex items-center justify-between">
        
        {/* Brand Logo - Lusion Style Minimal Monospace Typography */}
        <a 
          href="#" 
          className="flex items-center gap-3 text-white text-decoration-none group select-none"
          onClick={() => soundEngine.playChirp(600)}
        >
          <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-black text-xs font-mono tracking-tighter group-hover:bg-cyan-400 group-hover:scale-105 transition-all">
            MTF
          </div>
          <div>
            <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
              MYTECHFLOW<span className="text-cyan-400 font-normal">.LABS</span>
            </span>
          </div>
        </a>

        {/* Center Quick Jumps Capsule (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full lusion-glass border border-white/10 shadow-2xl">
          {[
            { name: 'APPLICATIONS', href: '#apps' },
            { name: 'DOMAINS & SKILLS', href: '#skills' },
            { name: 'SHOWCASE', href: '#showcase' },
            { name: 'ARCHITECTURE', href: '#about' }
          ].map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => soundEngine.playChirp(750)}
              className="px-4 py-1.5 rounded-full text-[11px] font-mono font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all text-decoration-none"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Tools: Sound, Search & Lusion Menu Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Lusion Audio Engine Toggle */}
          <button
            onClick={handleToggleSound}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
              isAudioActive 
                ? 'bg-cyan-500/15 border-cyan-400/50 text-cyan-300' 
                : 'bg-black/50 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Ambient Audio"
          >
            <canvas ref={canvasRef} width={24} height={16} className="pointer-events-none" />
            <span className="text-[10px] font-mono font-bold uppercase hidden sm:inline">
              {isAudioActive ? 'Sound ON' : 'Sound OFF'}
            </span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={onFocusSearch}
            className="p-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-cyan-300 transition-all"
            title="Search Applications"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* SuperAdmin Badge / Login */}
          {isAdmin ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <span className="font-bold">Admin</span>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin</span>
            </button>
          )}

          {/* Contact Pill */}
          <a
            href="mailto:nrkb1998@gmail.com"
            className="hidden md:inline-flex btn-lusion-primary text-xs py-2 px-5 rounded-full"
          >
            <span>Let's Talk</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>

          {/* Lusion Menu Button (Opens Fullscreen / Slide Sidebar) */}
          <button
            onClick={() => {
              onOpenSidebar();
              soundEngine.playChirp(950);
            }}
            className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 transition-all shadow-lg"
            title="Open Directory Menu"
          >
            <span>Menu</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
              <span className="w-1.5 h-1.5 rounded-full bg-black" />
            </div>
          </button>

        </div>

      </div>
    </header>
  );
};
