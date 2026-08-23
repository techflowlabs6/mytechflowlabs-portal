import React, { useState } from 'react';
import { 
  Cpu, 
  Mail, 
  Copy, 
  Check, 
  Terminal, 
  Database, 
  Globe, 
  ArrowUpRight,
  ShieldCheck,
  Wrench
} from 'lucide-react';
import { ADMIN_EMAIL } from '../../context/AuthContext';

export const Footer = () => {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ADMIN_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="bg-[#060911] border-t border-[#1e293b] pt-16 pb-12">
      <div className="container-custom">
        
        {/* Main 4-Column Directory */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-[#1e293b]">
          
          {/* Col 1: Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">
                MyTechFlow<span className="text-blue-500">Labs</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Engineering high-utility production web applications, automated developer tools, and scalable cloud systems.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational (99.9% Uptime)</span>
            </div>
          </div>

          {/* Col 2: Applications */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono text-blue-400">
              Applications
            </h4>
            <ul className="flex flex-col gap-2 list-none p-0 text-xs text-slate-400">
              <li>
                <a href="https://french-learner.mytechflowlabs.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-decoration-none flex items-center gap-1">
                  French Learner AI <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://timelog.mytechflowlabs.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-decoration-none flex items-center gap-1">
                  TimeLog Pro <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://tcf.mytechflowlabs.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-decoration-none flex items-center gap-1">
                  TCF Prep Suite <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a href="https://driver-earnings.mytechflowlabs.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-decoration-none flex items-center gap-1">
                  Driver Earnings Tracker <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Developer Tools & Directory */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono text-purple-400">
              Platform & Tools
            </h4>
            <ul className="flex flex-col gap-2 list-none p-0 text-xs text-slate-400">
              <li><a href="#tools" className="hover:text-white transition-colors text-decoration-none">JSON Formatter & Validator</a></li>
              <li><a href="#tools" className="hover:text-white transition-colors text-decoration-none">Base64 & UUID Generator</a></li>
              <li><a href="#tools" className="hover:text-white transition-colors text-decoration-none">Developer Scratchpad</a></li>
              <li><a href="#skills" className="hover:text-white transition-colors text-decoration-none">Skills Matrix</a></li>
              <li><a href="#about" className="hover:text-white transition-colors text-decoration-none">Supabase & Vercel Architecture</a></li>
            </ul>
          </div>

          {/* Col 4: Contact & Inquiries */}
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider font-mono text-emerald-400">
              Direct Contact
            </h4>
            <div className="flex flex-col gap-2 text-xs text-slate-400">
              <a href={`mailto:${ADMIN_EMAIL}`} className="text-white hover:text-blue-400 transition-colors text-decoration-none flex items-center gap-1.5 font-mono">
                <Mail className="w-3.5 h-3.5 text-blue-400" /> {ADMIN_EMAIL}
              </a>
              <div className="pt-2">
                <button
                  onClick={handleCopyEmail}
                  className="px-3 py-1.5 rounded-lg bg-[#0f172a] hover:bg-slate-800 border border-[#1e293b] text-slate-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Email Address'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>© {new Date().getFullYear()} MyTechFlow Labs (mytechflowlabs.com). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase PostgreSQL
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-blue-400" /> Vercel Edge
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
