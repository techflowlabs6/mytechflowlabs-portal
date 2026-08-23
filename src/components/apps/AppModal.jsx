import React from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  Calendar, 
  Star, 
  ShieldCheck,
  Globe,
  Layers,
  Sparkles
} from 'lucide-react';

export const AppModal = ({ app, onClose, onLaunch }) => {
  const [copied, setCopied] = React.useState(false);

  if (!app) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(app.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-float">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl bg-[#080d22]/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Screenshot Preview */}
        <div className="relative h-56 sm:h-72 w-full rounded-2xl overflow-hidden mb-6 bg-slate-900 border border-white/10">
          <img 
            src={app.screenshotUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'} 
            alt={app.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080d22] via-transparent to-black/30" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <span className="px-3 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-semibold backdrop-blur-md">
                {app.category}
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-2 drop-shadow">
                {app.title}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
              STATUS: {app.status || 'Live'}
            </span>
          </div>
        </div>

        {/* Tagline & URL Bar */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 text-slate-300 text-sm font-mono truncate">
            <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="truncate text-cyan-300">{app.url}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy URL'}</span>
            </button>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-cyber-primary text-xs py-1.5 px-4 rounded-lg flex items-center gap-1.5"
            >
              <span>Launch App</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Detailed Overview */}
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider font-mono text-cyan-400 mb-2">
              Application Overview
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {app.description}
            </p>
          </div>

          {/* Key Features List */}
          {app.features && app.features.length > 0 && (
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider font-mono text-purple-400 mb-3">
                Core Capabilities & Architecture
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {app.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-xs leading-normal">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack Pills */}
          {app.tags && app.tags.length > 0 && (
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider font-mono text-emerald-400 mb-2">
                Engineered With
              </h4>
              <div className="flex flex-wrap gap-2">
                {app.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-xs font-mono">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Performance & Meta Stats */}
          {app.stats && (
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div>
                <span className="text-slate-400 text-xs font-mono">Audience</span>
                <p className="text-white font-bold text-base mt-0.5">{app.stats.users || 'Active'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs font-mono">Rating</span>
                <p className="text-amber-400 font-bold text-base mt-0.5">{app.stats.rating || '5.0/5'}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs font-mono">Release</span>
                <p className="text-cyan-400 font-bold text-base mt-0.5">{app.stats.version || 'v1.0'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-sm font-semibold transition-colors"
          >
            Close Details
          </button>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cyber-primary py-2.5 px-6 rounded-xl flex items-center gap-2"
          >
            <span>Open Application</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
