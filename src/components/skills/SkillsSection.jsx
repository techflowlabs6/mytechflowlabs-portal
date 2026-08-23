import React, { useState } from 'react';
import { 
  Code2, 
  Layout, 
  Server, 
  Sparkles, 
  Smartphone, 
  CheckCircle2, 
  Cpu, 
  Database
} from 'lucide-react';
import { SKILLS_DATA } from '../../data/skillsData';

const ICON_MAP = {
  Layout,
  Server,
  Sparkles,
  Smartphone
};

export const SkillsSection = () => {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <section id="skills" className="py-20 bg-[#0b0f19] border-b border-[#1f293d] scroll-mt-14">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>ENGINEERING CAPABILITIES</span>
          </div>
          <h2 className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            Technical Domains & <span className="text-blue-500">Skills Matrix</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
            Full-stack engineering expertise across scalable architectures, database systems, AI pipelines, and mobile applications.
          </p>
        </div>

        {/* Domain Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {SKILLS_DATA.map((domain, idx) => {
            const Icon = ICON_MAP[domain.icon] || Code2;
            const isActive = activeCategory === idx;
            return (
              <button
                key={idx}
                onClick={() => setActiveCategory(idx)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-[#111827] border border-[#1f293d] text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{domain.category}</span>
              </button>
            );
          })}
        </div>

        {/* Active Domain Skills Panel */}
        <div className="clean-card p-6 sm:p-8 bg-[#111827] border border-[#1f293d] mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-6 border-b border-[#1f293d] mb-6">
            <div>
              <span className="text-xs font-mono text-blue-400 uppercase font-semibold">
                Focused Domain
              </span>
              <h3 className="font-bold text-xl sm:text-2xl text-white mt-0.5">
                {SKILLS_DATA[activeCategory].category}
              </h3>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm max-w-md">
              {SKILLS_DATA[activeCategory].description}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {SKILLS_DATA[activeCategory].skills.map((skill, sIdx) => (
              <div key={sIdx} className="p-4 rounded-xl bg-[#0b0f19] border border-[#1f293d]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-white">{skill.name}</span>
                  <span className="font-mono text-blue-400 font-bold">{skill.level}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-2">
                  <div 
                    className="h-full rounded-full bg-blue-500" 
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {skill.highlight}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 4 Domains Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {SKILLS_DATA.map((domain, idx) => {
            const Icon = ICON_MAP[domain.icon] || Code2;
            return (
              <div key={idx} className="clean-card p-5 bg-[#111827] border border-[#1f293d] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-base text-white">
                    {domain.category}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    {domain.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#1f293d] flex flex-wrap gap-1">
                  {domain.skills.slice(0, 3).map((s, sIdx) => (
                    <span key={sIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
