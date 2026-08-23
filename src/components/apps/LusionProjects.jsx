import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  ArrowUpRight, 
  ExternalLink, 
  Info, 
  Edit3, 
  Trash2, 
  Sparkles, 
  X, 
  ShieldCheck, 
  PlayCircle, 
  Image as ImageIcon 
} from 'lucide-react';
import { useApps } from '../../context/AppsContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/seedApps';
import { soundEngine } from '../audio/SoundEngine';
import { 
  FrenchLearnerWidget, 
  TimeLogWidget, 
  TCFPrepWidget, 
  DriverEarningsWidget 
} from './LiveAppWidgets';
import { AppModal } from './AppModal';
import { AppFormModal } from './AppFormModal';
import { AdminLoginModal } from './AdminLoginModal';

export const LusionProjects = ({ searchInputRef }) => {
  const { 
    apps, 
    filteredApps, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    addApp, 
    updateApp, 
    deleteApp, 
    toastMessage
  } = useApps();

  const { isAdmin, adminEmail } = useAuth();

  const [selectedAppForModal, setSelectedAppForModal] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Per-app widget toggle
  const [activeWidgets, setActiveWidgets] = useState({
    'app-french-learner': true,
    'app-timelog-pro': true,
    'app-tcf-suite': true,
    'app-driver-earnings': true
  });

  const toggleWidget = (appId) => {
    setActiveWidgets(prev => ({ ...prev, [appId]: !prev[appId] }));
    soundEngine.playChirp(800);
  };

  const handleSaveApp = async (formData) => {
    if (editingApp) {
      await updateApp(editingApp.id, formData);
    } else {
      await addApp(formData);
    }
    setIsFormModalOpen(false);
    setEditingApp(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteApp(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  return (
    <section id="apps" className="relative py-28 scroll-mt-12 select-none">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="p-4 rounded-2xl bg-black/90 border border-cyan-400 text-white font-mono text-xs flex items-center gap-3 shadow-2xl">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      <div className="container-custom relative z-10">
        
        {/* Section Title - Lusion Editorial Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/10 mb-12">
          <div>
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">
              // 01. PRODUCTION REPOSITORY
            </span>
            <h2 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tighter uppercase leading-none">
              APPLICATIONS <br />
              <span className="text-gradient-cyan">& ECOSYSTEM</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {isAdmin ? (
              <button
                onClick={() => {
                  setEditingApp(null);
                  setIsFormModalOpen(true);
                  soundEngine.playChirp(1100);
                }}
                className="btn-lusion-white text-xs py-3 px-6 rounded-full font-mono uppercase flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Application</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  soundEngine.playChirp(700);
                }}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Login ({adminEmail})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Instant Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-14">
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'All' 
                ? apps.length 
                : apps.filter(a => a.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    soundEngine.playChirp(650);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-mono whitespace-nowrap transition-all uppercase ${
                    isSelected
                      ? 'bg-white text-black font-bold shadow-lg'
                      : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps (Press '/' to focus)..."
              className="w-full pl-11 pr-10 py-2.5 rounded-full bg-white/5 border border-white/10 focus:border-cyan-400 focus:outline-none text-white text-xs font-mono placeholder-slate-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Lusion Monumental Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {filteredApps.map((app, index) => {
            const isWidgetActive = activeWidgets[app.id];
            const hasInteractiveWidget = Boolean(
              app.id === 'app-french-learner' || 
              app.id === 'app-timelog-pro' || 
              app.id === 'app-tcf-suite' || 
              app.id === 'app-driver-earnings'
            );

            return (
              <div
                key={app.id}
                className="lusion-project-card p-6 sm:p-8 rounded-[32px] flex flex-col justify-between group border border-white/10 hover:border-white/30 transition-all"
              >
                {/* Header with Number Index & Category */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-4 border-b border-white/10 mb-6">
                    <span className="text-cyan-400 font-bold tracking-widest">
                      // 0{index + 1}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300">
                        {app.category}
                      </span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {app.status || 'Live'}
                      </span>
                    </div>
                  </div>

                  {/* App Title & Tagline */}
                  <h3 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-white uppercase tracking-tight group-hover:text-cyan-300 transition-colors">
                    {app.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed mt-2 line-clamp-2">
                    {app.description}
                  </p>
                </div>

                {/* Center: Live Interactive Sandbox OR High-Res Screenshot */}
                <div className="my-6">
                  {hasInteractiveWidget && isWidgetActive ? (
                    <div className="animate-fadeIn">
                      {app.id === 'app-french-learner' && <FrenchLearnerWidget />}
                      {app.id === 'app-timelog-pro' && <TimeLogWidget />}
                      {app.id === 'app-tcf-suite' && <TCFPrepWidget />}
                      {app.id === 'app-driver-earnings' && <DriverEarningsWidget />}
                    </div>
                  ) : (
                    <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                      <img 
                        src={app.screenshotUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'} 
                        alt={app.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-xs text-slate-200 line-clamp-1 font-mono text-cyan-300">
                          {app.url}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Switcher Button */}
                  {hasInteractiveWidget && (
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => toggleWidget(app.id)}
                        className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1.5"
                      >
                        {isWidgetActive ? (
                          <>
                            <ImageIcon className="w-3.5 h-3.5" /> Switch to Image Preview
                          </>
                        ) : (
                          <>
                            <PlayCircle className="w-3.5 h-3.5 text-cyan-400" /> Switch to Live Interactive Sandbox
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Tech Tags */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {app.tags && app.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-white/5 text-slate-300 border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Footer Action Row */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <button
                    onClick={() => {
                      setSelectedAppForModal(app);
                      soundEngine.playChirp(700);
                    }}
                    className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all"
                  >
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Specifications</span>
                  </button>

                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => soundEngine.playChirp(1200)}
                    className="btn-lusion-white text-xs py-2.5 px-6 rounded-full font-mono uppercase flex items-center gap-2"
                  >
                    <span>Launch Portal</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>

                {/* SuperAdmin Controls (nrkb1998@gmail.com) */}
                {isAdmin && (
                  <div className="mt-4 pt-3 border-t border-purple-500/30 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-purple-300 flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Admin Mode
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingApp(app);
                          setIsFormModalOpen(true);
                        }}
                        className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-mono"
                      >
                        Edit Details
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(app.id)}
                        className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-mono"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* App Details Modal */}
      {selectedAppForModal && (
        <AppModal
          app={selectedAppForModal}
          onClose={() => setSelectedAppForModal(null)}
        />
      )}

      {/* Admin Add/Edit App Modal */}
      {isFormModalOpen && (
        <AppFormModal
          app={editingApp}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingApp(null);
          }}
          onSave={handleSaveApp}
        />
      )}

      {/* Admin Login Modal */}
      {isAuthModalOpen && (
        <AdminLoginModal
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="p-6 rounded-3xl lusion-glass border border-rose-500/40 max-w-sm w-full text-center flex flex-col gap-4 shadow-2xl">
            <h3 className="font-heading font-bold text-xl text-white">Delete Application?</h3>
            <p className="text-xs text-slate-300 font-mono">
              Are you sure you want to remove this application from the portfolio matrix?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-full bg-white/10 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-full bg-rose-600 text-white text-xs font-mono font-bold shadow-lg shadow-rose-600/40"
              >
                Delete App
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
