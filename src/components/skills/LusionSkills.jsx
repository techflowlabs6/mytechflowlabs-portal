import React, { useState } from 'react';
import { 
  Code2, 
  ArrowUpRight, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  Database,
  Globe,
  Smartphone,
  Server
} from 'lucide-react';
import { SKILLS_DATA } from '../../data/skillsData';
import { soundEngine } from '../audio/SoundEngine';

export const LusionSkills = () => {
  const [activeDomainIndex, setActiveDomainIndex] = useState(0);

  return (
    <section id="skills" className="relative py-28 border-t border-white/10 select-none">
      <div className="container-custom relative z-10">
        
        {/* Section Header */}
        <div className="pb-12 border-b border-white/10 mb-14">
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block mb-2">
            // 02. CAPABILITIES & ENGINEERING MATRIX
          </span>
          <h2 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tighter uppercase leading-none">
            TECHNICAL <br />
            <span className="text-gradient-purple">SPECIALIZATIONS</span>
          </h2>
        </div>

        {/* Interactive Domains Accordion List */}
        <div className="flex flex-col gap-4">
          {SKILLS_DATA.map((domain, index) => {
            const isActive = activeDomainIndex === index;

            return (
              <div
                key={index}
                onClick={() => {
                  setActiveDomainIndex(index);
                  soundEngine.playChirp(800 + index * 100);
                }}
                className={`p-6 sm:p-8 rounded-3xl cursor-pointer transition-all border ${
                  isActive
                    ? 'cyber-glass border-purple-500/50 shadow-2xl bg-purple-950/20'
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-purple-400 font-bold">
                      0{index + 1}
                    </span>
                    <h3 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                      {domain.category}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 max-w-md font-light leading-relaxed">
                    {domain.description}
                  </p>
                </div>

                {/* Expanded Skill Progress Grid */}
                {isActive && (
                  <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                    {domain.skills.map((skill, sIdx) => (
                      <div 
                        key={sIdx}
                        className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white font-mono uppercase">
                            {skill.name}
                          </span>
                          <span className="text-purple-300 font-mono font-bold">
                            {skill.level}%
                          </span>
                        </div>

                        {/* Progress line */}
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400"
                            style={{ width: `${skill.level}%` }}
                          />
                        </div>

                        <span className="text-[11px] text-slate-400 font-mono">
                          // {skill.highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
