import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  Mail, 
  Copy, 
  Check, 
  Terminal, 
  Database, 
  Globe, 
  Zap,
  Radio
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import { ADMIN_EMAIL } from '../../context/AuthContext';

export const LusionFooter = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ADMIN_EMAIL);
    setCopiedEmail(true);
    soundEngine.playChirp(1200);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <footer className="relative border-t border-white/10 bg-[#02040b] pt-24 pb-16 select-none overflow-hidden">
      
      {/* Background radial aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-48 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      <div className="container-custom relative z-10">
        
        {/* Massive Editorial CTA Header */}
        <div className="pb-16 border-b border-white/10">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-4">
            // 04. COLLABORATION & STUDIO INQUIRIES
          </span>

          <h2 className="font-heading font-black text-4xl sm:text-6xl md:text-8xl text-white tracking-tighter uppercase leading-[0.92] max-w-5xl">
            LET’S BUILD <br />
            <span className="text-gradient-hero">SOMETHING EXTRAORDINARY</span> <br />
            TOGETHER.
          </h2>

          {/* Email Quick Action Pill */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href={`mailto:${ADMIN_EMAIL}`}
              onClick={() => soundEngine.playChirp(900)}
              className="btn-lusion-primary py-4 px-8 text-sm"
            >
              <span>Initiate Contact</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <button
              onClick={handleCopy}
              className="btn-lusion-glass py-4 px-6 text-sm flex items-center gap-2"
            >
              {copiedEmail ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedEmail ? `${ADMIN_EMAIL} Copied!` : 'Copy Direct Email'}</span>
            </button>
          </div>
        </div>

        {/* Multi-Column Directory */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 border-b border-white/10 text-xs font-mono">
          
          {/* Col 1: Studio Identity */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-black font-black text-xs flex items-center justify-center">
                MTF
              </div>
              <span className="font-heading font-black text-base text-white tracking-tight">
                MYTECHFLOW LABS
              </span>
            </div>
            <p className="text-slate-400 font-sans text-xs leading-relaxed font-light">
              Engineering creative technologies, bespoke 3D applications, and intelligence platforms.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>GLOBAL STATUS: ACTIVE</span>
            </div>
          </div>

          {/* Col 2: Applications */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-cyan-400">
              Applications
            </h4>
            <ul className="flex flex-col gap-2 list-none p-0 text-slate-400">
              <li><a href="https://french-learner.mytechflowlabs.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-decoration-none">01. French Learner AI ↗</a></li>
              <li><a href="https://timelog.mytechflowlabs.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-decoration-none">02. TimeLog Pro ↗</a></li>
              <li><a href="https://tcf.mytechflowlabs.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-decoration-none">03. TCF Prep Suite ↗</a></li>
              <li><a href="https://driver-earnings.mytechflowlabs.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-decoration-none">04. Driver Earnings Tracker ↗</a></li>
              <li><a href="https://ai.mytechflowlabs.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-decoration-none">05. TechFlow AI Studio ↗</a></li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-purple-400">
              Directory
            </h4>
            <ul className="flex flex-col gap-2 list-none p-0 text-slate-400">
              <li><a href="#apps" className="hover:text-white transition-colors text-decoration-none">Applications Matrix</a></li>
              <li><a href="#skills" className="hover:text-white transition-colors text-decoration-none">Technical Domains</a></li>
              <li><a href="#showcase" className="hover:text-white transition-colors text-decoration-none">Interface Archives</a></li>
              <li><a href="#about" className="hover:text-white transition-colors text-decoration-none">System Architecture</a></li>
            </ul>
          </div>

          {/* Col 4: Systems & Contact */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold uppercase tracking-widest text-pink-400">
              Direct Contact
            </h4>
            <div className="flex flex-col gap-2 text-slate-400">
              <a href={`mailto:${ADMIN_EMAIL}`} className="text-white hover:text-cyan-400 transition-colors text-decoration-none">
                {ADMIN_EMAIL}
              </a>
              <span className="text-slate-500">mytechflowlabs.com</span>
              <div className="pt-2 flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-cyan-300">
                  EST / UTC-4
                </span>
                <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] text-emerald-300">
                  Supabase RLS
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>© {new Date().getFullYear()} MyTechFlow Labs. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-slate-400">WebGL Three.js Core</span>
            <span>•</span>
            <span className="text-slate-400">Vercel Global Edge</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
