import React, { useState } from 'react';
import { 
  Terminal, 
  Database, 
  ShieldCheck, 
  Cloud, 
  Cpu, 
  Copy, 
  Check, 
  Code,
  ArrowRight,
  ExternalLink,
  Zap,
  Lock
} from 'lucide-react';
import { SUPERADMIN_EMAIL } from '../../lib/supabase';

export const AboutSection = () => {
  const [copiedSql, setCopiedSql] = useState(false);

  const sampleSqlSnippet = `-- Supabase RLS Policy for MyTechFlow Labs
CREATE POLICY "Allow public read-only access to apps"
ON public.apps FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin full access"
ON public.apps FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = '${SUPERADMIN_EMAIL}');`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sampleSqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <section id="about" className="relative py-24 scroll-mt-20 border-t border-white/5 bg-[#070a18]">
      <div className="container-custom relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3">
            <Terminal className="w-3.5 h-3.5" />
            <span>ARCHITECTURE & INFRASTRUCTURE</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white tracking-tight">
            Engineered for <span className="gradient-text-cyan">Speed, Security & Scale</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed">
            The technical backbone of MyTechFlow Labs combines modern reactive frontends, resilient edge caching, and PostgreSQL database security.
          </p>
        </div>

        {/* Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          {/* Card 1: 3D Graphics Engine */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between group hover:border-cyan-500/30 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                3D WebGL & Interactive FX
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Powered by Three.js and custom GLSL vertex animation shaders. Renders 60 FPS particle fields, holographic core wireframes, and responsive 3D card tilt physics.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-cyan-400">
              <Zap className="w-3.5 h-3.5" />
              <span>Hardware-Accelerated</span>
            </div>
          </div>

          {/* Card 2: Supabase DB & Security */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between group hover:border-purple-500/30 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                Supabase & PostgreSQL RLS
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Row-Level Security enforces public read-only access for visitors, with verified cryptographic write privileges granted exclusively to <code className="text-purple-300 font-mono">{SUPERADMIN_EMAIL}</code>.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-purple-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Trust Database Security</span>
            </div>
          </div>

          {/* Card 3: Vercel Global Edge */}
          <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col justify-between group hover:border-emerald-500/30 transition-all">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                Vercel Edge & Multi-Device
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Automated continuous deployment via GitHub to Vercel global edge network. Fully optimized responsive typography and layouts for mobile phones, tablets, and 4K desktops.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-xs font-mono text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sub-20ms Global Latency</span>
            </div>
          </div>

        </div>

        {/* SQL & Security Policy Code Preview Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-[#060a1e] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-300">
                supabase/schema.sql • Row Level Security Rules
              </span>
            </div>
            <button
              onClick={handleCopySql}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied to Clipboard' : 'Copy SQL snippet'}</span>
            </button>
          </div>

          <pre className="text-xs sm:text-sm font-mono text-cyan-300 overflow-x-auto p-4 rounded-2xl bg-black/60 border border-white/5 leading-relaxed">
            <code>{sampleSqlSnippet}</code>
          </pre>
        </div>

      </div>
    </section>
  );
};
