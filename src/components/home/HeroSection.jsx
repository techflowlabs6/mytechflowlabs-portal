import React from 'react';
import { 
  ArrowRight, 
  Layers, 
  Code, 
  Sparkles, 
  BookOpen, 
  Clock, 
  GraduationCap, 
  DollarSign, 
  ShieldCheck, 
  Wrench, 
  Terminal, 
  Cpu, 
  Globe 
} from 'lucide-react';
import { HIGHLIGHT_STATS } from '../../data/skillsData';

export const HeroSection = ({ onOpenAuthModal }) => {
  return (
    <section className="relative pt-32 pb-16 bg-[#090d16] border-b border-[#1e293b]">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left">
            
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono w-fit mx-auto lg:mx-0">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-bold">MYTECHFLOW LABS • PRODUCTION GATEWAY & TOOLS</span>
            </div>

            {/* Headline */}
            <h1 className="font-extrabold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight">
              Software Applications & <br />
              <span className="text-blue-500">Developer Engineering Hub</span>
            </h1>

            {/* Subtext */}
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              A centralized production portal by <strong>MyTechFlow Labs</strong>. Direct access to our applications—<span className="text-blue-400 font-semibold">French Learner AI</span>, <span className="text-emerald-400 font-semibold">TimeLog Pro</span>, <span className="text-purple-400 font-semibold">TCF Preparation Suite</span>, and <span className="text-amber-400 font-semibold">Driver Earnings Tracker</span>—alongside built-in developer productivity tools.
            </p>

            {/* Direct App Shortcut Pills */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1">
              <a href="#apps" className="px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-blue-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all text-decoration-none">
                <BookOpen className="w-3.5 h-3.5 text-blue-400" /> French Learner
              </a>
              <a href="#apps" className="px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all text-decoration-none">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> TimeLog Pro
              </a>
              <a href="#apps" className="px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-purple-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all text-decoration-none">
                <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> TCF Suite
              </a>
              <a href="#apps" className="px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-amber-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-all text-decoration-none">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Driver Earnings
              </a>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <a 
                href="#apps" 
                className="btn-primary text-sm py-3 px-6 rounded-xl flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                <span>Launch Apps Hub</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a 
                href="#tools" 
                className="btn-secondary text-sm py-3 px-6 rounded-xl flex items-center gap-2"
              >
                <Wrench className="w-4 h-4 text-blue-400" />
                <span>Developer Tools</span>
              </a>

              <a 
                href="#skills" 
                className="btn-secondary text-sm py-3 px-6 rounded-xl flex items-center gap-2"
              >
                <Code className="w-4 h-4 text-purple-400" />
                <span>Skills & Matrix</span>
              </a>
            </div>

          </div>

          {/* Right Column: Clean Visual Hub Showcase */}
          <div className="lg:col-span-5">
            <div className="modern-card p-6 sm:p-8 bg-[#0f172a] border border-[#1e293b] shadow-2xl flex flex-col gap-6">
              
              {/* Header inside card */}
              <div className="flex items-center justify-between pb-4 border-b border-[#1e293b]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Live Apps Gateway</h3>
                    <p className="text-xs text-slate-400 font-mono">mytechflowlabs.com</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> ONLINE
                </span>
              </div>

              {/* Quick App Matrix List */}
              <div className="flex flex-col gap-3">
                {[
                  { name: 'French Learner AI', desc: 'AI speech pronunciation & grammar rules', color: 'text-blue-400', icon: BookOpen, url: 'https://french-learner.mytechflowlabs.com' },
                  { name: 'TimeLog Pro', desc: 'Smart Pomodoro timer & billable analytics', color: 'text-emerald-400', icon: Clock, url: 'https://timelog.mytechflowlabs.com' },
                  { name: 'TCF Preparation Suite', desc: 'Official mock tests & CLB score predictor', color: 'text-purple-400', icon: GraduationCap, url: 'https://tcf.mytechflowlabs.com' },
                  { name: 'Driver Earnings Tracker', desc: 'Shift profit & fuel tax calculator', color: 'text-amber-400', icon: DollarSign, url: 'https://driver-earnings.mytechflowlabs.com' }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="p-3 rounded-xl bg-[#090d16] border border-[#1e293b] flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                        <div>
                          <p className="text-xs font-bold text-white">{item.name}</p>
                          <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                        </div>
                      </div>
                      <a 
                        href="#apps" 
                        className="px-2.5 py-1 rounded-lg bg-[#1e293b] hover:bg-blue-600 text-white text-[11px] font-mono font-semibold transition-colors text-decoration-none"
                      >
                        Open
                      </a>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>

        </div>

        {/* Highlight Stats Row */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-10 border-t border-[#1e293b]">
          {HIGHLIGHT_STATS.map((stat, i) => (
            <div key={i} className="modern-card p-5 bg-[#0f172a] border border-[#1e293b]">
              <span className="font-extrabold text-2xl sm:text-3xl text-white">
                {stat.value}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-1">
                {stat.label}
              </p>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                {stat.sublabel}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
