import React from 'react';
import { 
  ArrowDownRight, 
  Sparkles, 
  Layers, 
  Terminal, 
  Zap, 
  ExternalLink,
  Code2,
  Globe,
  Radio,
  Play
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export const LusionHero = () => {
  return (
    <section className="relative min-h-[92vh] flex flex-col justify-between pt-36 pb-12 select-none overflow-hidden">
      
      <div className="container-custom relative z-10 flex-1 flex flex-col justify-center">
        
        {/* Top Studio Metadata Badges */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              REAL-TIME 3D ECOSYSTEM
            </span>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              // ARCHITECT: NAVEEN REDDY
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>GLOBAL EDGE RUNTIME • 60 FPS</span>
          </div>
        </div>

        {/* Monumental Editorial Headline - Lusion Studio Style */}
        <div className="max-w-5xl">
          <h1 className="font-heading font-black text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-tighter leading-[0.92] uppercase">
            WE ENGINEER <br />
            <span className="text-gradient-hero">
              DIGITAL LABS
            </span> <br />
            & 3D REALITIES.
          </h1>
        </div>

        {/* Subtitle & Studio Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-10 items-end">
          <div className="md:col-span-7">
            <p className="text-slate-300 text-base sm:text-xl font-light leading-relaxed max-w-xl">
              <strong>MyTechFlow Labs</strong> is a high-performance software ecosystem delivering bespoke applications across AI language learning, temporal analytics, and real-time utilities.
            </p>
          </div>

          {/* Interactive Action Portal */}
          <div className="md:col-span-5 flex flex-col sm:flex-row items-start sm:items-center justify-start md:justify-end gap-4">
            <a
              href="#apps"
              onClick={() => soundEngine.playChirp(1000)}
              className="btn-neon text-xs sm:text-sm py-4 px-8 rounded-full font-mono uppercase tracking-wider flex items-center gap-2"
            >
              <span>Explore Applications</span>
              <ArrowDownRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>

      {/* Bottom Interactive Prompt Bar */}
      <div className="container-custom relative z-10 pt-12 border-t border-white/10 mt-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="text-cyan-400 font-bold uppercase tracking-wider">
            [ 3D PHYSICS CANVAS ACTIVE ]
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="hidden sm:inline">Move cursor to deform liquid chrome • Click to disperse</span>
        </div>

        <div className="flex items-center gap-6">
          <span>01. FRENCH LEARNER</span>
          <span>02. TIMELOG PRO</span>
          <span>03. TCF SUITE</span>
          <span>04. DRIVER EARNINGS</span>
        </div>
      </div>

    </section>
  );
};
