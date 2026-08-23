import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Grid3X3, 
  List, 
  Sparkles, 
  Filter, 
  RefreshCw, 
  Layers, 
  ShieldCheck, 
  ExternalLink,
  Info,
  X,
  Lock,
  Cpu
} from 'lucide-react';
import { useApps } from '../../context/AppsContext';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../data/seedApps';
import { AppCard } from './AppCard';
import { AppModal } from './AppModal';
import { AppFormModal } from './AppFormModal';
import { AdminLoginModal } from './AdminLoginModal';

export const AppsDashboard = ({ searchInputRef }) => {
  const { 
    apps, 
    filteredApps, 
    searchQuery, 
    setSearchQuery, 
    selectedCategory, 
    setSelectedCategory,
    viewMode,
    setViewMode,
    addApp, 
    updateApp, 
    deleteApp, 
    resetToDefault,
    toastMessage
  } = useApps();

  const { isAdmin, adminEmail } = useAuth();

  const [selectedAppForModal, setSelectedAppForModal] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Keyboard shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef?.current) {
        e.preventDefault();
        searchInputRef?.current?.focus();
      }
      if (e.key === 'Escape') {
        setSelectedAppForModal(null);
        setIsFormModalOpen(false);
        setIsAuthModalOpen(false);
        setDeleteConfirmId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchInputRef]);

  const handleOpenAddModal = () => {
    setEditingApp(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (app) => {
    setEditingApp(app);
    setIsFormModalOpen(true);
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
    <section id="apps" className="py-20 bg-[#0b0f19] border-b border-[#1f293d] scroll-mt-14">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="p-4 rounded-xl bg-slate-900 border border-blue-500 text-white font-mono text-xs flex items-center gap-3 shadow-2xl">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>{toastMessage.message}</span>
          </div>
        </div>
      )}

      <div className="container-custom">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-mono mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>APPLICATIONS REPOSITORY</span>
            </div>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Apps Ecosystem & <span className="text-blue-500">Live Shortcuts</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mt-1">
              Direct access to our specialized production applications with instant launch shortcuts and full architecture specifications.
            </p>
          </div>

          {/* Admin Action Button */}
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button
                onClick={handleOpenAddModal}
                className="btn-primary py-2.5 px-5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add New App</span>
              </button>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#111827] hover:bg-slate-800 border border-[#1f293d] text-slate-300 hover:text-white text-xs font-mono flex items-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Admin Login ({adminEmail})</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="clean-card p-4 rounded-xl bg-[#111827] border border-[#1f293d] mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps by name, tag, or category... (Press '/' to focus)"
              className="w-full pl-10 pr-10 py-2 rounded-lg bg-[#0b0f19] border border-[#1f293d] text-white text-xs font-sans placeholder-slate-500 focus:border-blue-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              const count = cat === 'All' 
                ? apps.length 
                : apps.filter(a => a.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-[#0b0f19] border border-[#1f293d] text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-white text-black font-bold' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View Toggle */}
          <div className="flex items-center justify-between lg:justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#1f293d]">
            <div className="flex items-center gap-1 bg-[#0b0f19] p-1 rounded-lg border border-[#1f293d]">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={resetToDefault}
                className="p-1.5 rounded-lg bg-[#0b0f19] hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono"
                title="Reset to default seed apps"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-6">
          <span>
            Showing <strong className="text-white">{filteredApps.length}</strong> of {apps.length} applications
          </span>
          {isAdmin && (
            <span className="text-purple-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Full Admin CRUD Enabled
            </span>
          )}
        </div>

        {/* App Cards Display */}
        {filteredApps.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onViewDetails={(a) => setSelectedAppForModal(a)}
                  onEdit={(a) => handleOpenEditModal(a)}
                  onDelete={(id) => setDeleteConfirmId(id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="clean-card p-4 bg-[#111827] border border-[#1f293d] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={app.screenshotUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80'} 
                      alt={app.title}
                      className="w-14 h-14 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-white">
                          {app.title}
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400">
                          {app.category}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">
                        {app.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setSelectedAppForModal(app)}
                      className="px-3 py-1.5 rounded-lg bg-[#1f2937] hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Specs
                    </button>
                    <a
                      href={app.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary text-xs py-1.5 px-4 rounded-lg flex items-center gap-1.5"
                    >
                      <span>Launch</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    {isAdmin && (
                      <div className="flex items-center gap-1 pl-2 border-l border-slate-700">
                        <button
                          onClick={() => handleOpenEditModal(app)}
                          className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                          title="Edit App"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(app.id)}
                          className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                          title="Delete App"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="clean-card p-12 text-center flex flex-col items-center justify-center gap-4 my-8">
            <Search className="w-10 h-10 text-slate-500" />
            <h3 className="font-bold text-lg text-white">No applications found</h3>
            <p className="text-slate-400 text-xs max-w-sm">
              Try adjusting your search query or reset your category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="btn-secondary text-xs py-2 px-4"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* App Details Modal */}
      {selectedAppForModal && (
        <AppModal
          app={selectedAppForModal}
          onClose={() => setSelectedAppForModal(null)}
        />
      )}

      {/* Admin App Add/Edit Modal */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="clean-card p-6 bg-[#111827] border border-rose-500/40 max-w-sm w-full text-center flex flex-col gap-4 shadow-2xl">
            <h3 className="font-bold text-lg text-white">Confirm Deletion</h3>
            <p className="text-xs text-slate-300">
              Are you sure you want to delete this application from the dashboard?
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
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
