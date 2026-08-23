import React from 'react';
import { 
  ExternalLink, 
  Info, 
  Edit3, 
  Trash2, 
  Star, 
  BookOpen, 
  Clock, 
  GraduationCap, 
  DollarSign, 
  Cpu, 
  Activity, 
  AppWindow
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ICON_MAP = {
  BookOpen,
  Clock,
  GraduationCap,
  DollarSign,
  Cpu,
  Activity,
  AppWindow
};

export const AppCard = ({ app, onViewDetails, onEdit, onDelete }) => {
  const { isAdmin } = useAuth();
  const IconComponent = ICON_MAP[app.icon] || AppWindow;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Live':
        return (
          <span className="badge-live text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
          </span>
        );
      case 'Beta':
        return (
          <span className="badge-beta text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
            BETA
          </span>
        );
      default:
        return (
          <span className="badge-dev text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
            IN DEV
          </span>
        );
    }
  };

  return (
    <div className="clean-card flex flex-col justify-between overflow-hidden shadow-lg group">
      
      {/* Top Media Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img 
          src={app.screenshotUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'} 
          alt={app.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-[#111827]/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-cyan-300 text-xs font-mono font-medium">
            {app.category}
          </span>
          <div className="flex items-center gap-2">
            {app.featured && (
              <span className="p-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300" title="Featured App">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
              </span>
            )}
            {getStatusBadge(app.status)}
          </div>
        </div>

        {/* Icon & Title Overlay */}
        <div className="absolute bottom-3 left-4 flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center backdrop-blur-md text-white"
          >
            <IconComponent className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
              {app.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <p className="text-slate-300 text-xs font-medium text-blue-400 font-mono line-clamp-1">
            {app.tagline}
          </p>
          <p className="text-slate-400 text-xs leading-relaxed mt-2 line-clamp-2 font-normal">
            {app.description}
          </p>
        </div>

        {/* Tech Stack Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {app.tags && app.tags.map((tag, idx) => (
            <span key={idx} className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1f2937] text-slate-300 border border-slate-700">
              #{tag}
            </span>
          ))}
        </div>

        {/* Action Row */}
        <div className="pt-3 border-t border-[#1f293d] flex items-center justify-between gap-2">
          <button
            onClick={() => onViewDetails(app)}
            className="px-3 py-1.5 rounded-lg bg-[#1f2937] hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Specs</span>
          </button>

          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs py-1.5 px-4 rounded-lg flex items-center gap-1.5"
          >
            <span>Launch App</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Admin Management Controls (Visible only for nrkb1998@gmail.com) */}
        {isAdmin && (
          <div className="pt-2 mt-1 border-t border-purple-500/20 bg-purple-950/30 -mx-5 -mb-5 px-4 py-2.5 flex items-center justify-between">
            <span className="text-[11px] font-mono text-purple-300 font-bold">
              Admin Controls
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(app)}
                className="px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-semibold flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => onDelete(app.id)}
                className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
