import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  Image as ImageIcon, 
  Globe, 
  Tag, 
  Layers,
  ShieldCheck,
  Check
} from 'lucide-react';
import { CATEGORIES } from '../../data/seedApps';

const PRESET_SCREENSHOTS = [
  { label: 'Language & Education', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Productivity & Time', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Exam & Certification', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Finance & Earnings', url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'AI & Machine Learning', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cloud & Telemetry', url: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Cyber Tech Code', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' }
];

export const AppFormModal = ({ app, onClose, onSave }) => {
  const isEditing = Boolean(app?.id);

  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'Productivity',
    url: 'https://',
    status: 'Live',
    featured: false,
    accentColor: '#06b6d4',
    icon: 'AppWindow',
    screenshotUrl: PRESET_SCREENSHOTS[0].url,
    tags: ['React', 'Tailwind', 'Supabase'],
    features: ['Responsive UI', 'Instant real-time sync', 'Cloud backup'],
    stats: { users: '1k+', rating: '4.9/5', version: 'v1.0' }
  });

  const [tagInput, setTagInput] = useState('');
  const [featureInput, setFeatureInput] = useState('');

  useEffect(() => {
    if (app) {
      setFormData({
        title: app.title || '',
        tagline: app.tagline || '',
        description: app.description || '',
        category: app.category || 'Productivity',
        url: app.url || 'https://',
        status: app.status || 'Live',
        featured: Boolean(app.featured),
        accentColor: app.accentColor || '#06b6d4',
        icon: app.icon || 'AppWindow',
        screenshotUrl: app.screenshotUrl || PRESET_SCREENSHOTS[0].url,
        tags: app.tags || ['React', 'Supabase'],
        features: app.features || ['High performance interface'],
        stats: app.stats || { users: '1k+', rating: '4.9/5', version: 'v1.0' }
      });
    }
  }, [app]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.url.trim()) {
      alert('Please enter both App Name and App Address URL.');
      return;
    }
    onSave(formData);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }));
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-float">
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto glass-panel border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl bg-[#0a0f26]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-white">
                {isEditing ? `Edit "${app.title}"` : 'Add New Application'}
              </h2>
              <p className="text-xs font-mono text-purple-300">
                Admin Panel (nrkb1998@gmail.com)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                App Name / Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. French Learner AI"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#111733] border border-white/15 text-white text-sm focus:border-cyan-400 focus:outline-none"
              >
                {CATEGORIES.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Tagline */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
              Tagline (One-line punchline)
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Smart Multi-Platform Rideshare & Delivery Revenue Intelligence"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Row 3: Target App URL */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
              App Address / Web URL *
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-cyan-400 absolute left-3.5 top-3" />
              <input
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://yourapp.mytechflowlabs.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-cyan-300 placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the application purpose, architecture, and user workflow..."
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:border-cyan-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Row 5: Screenshot Image Selection */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
              Screenshot Image URL
            </label>
            <input
              type="text"
              value={formData.screenshotUrl}
              onChange={(e) => setFormData({ ...formData, screenshotUrl: e.target.value })}
              placeholder="https://..."
              className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-white text-xs font-mono mb-2"
            />
            
            {/* Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                Presets:
              </span>
              {PRESET_SCREENSHOTS.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setFormData({ ...formData, screenshotUrl: preset.url })}
                  className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all ${
                    formData.screenshotUrl === preset.url
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 6: Status & Featured */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
                App Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#111733] border border-white/15 text-white text-xs"
              >
                <option value="Live">🟢 Live Production</option>
                <option value="Beta">🟡 Beta Access</option>
                <option value="In Dev">🟣 In Development</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
                <span className="font-semibold">Feature on Hero Hub</span>
              </label>
            </div>
          </div>

          {/* Row 7: Tech Stack Tags */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
              Tech Stack Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="e.g. Supabase, WebGL, Next.js..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-bold"
              >
                + Add Tag
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="badge-tag flex items-center gap-1">
                  #{tag}
                  <button type="button" onClick={() => handleRemoveTag(idx)} className="text-slate-400 hover:text-rose-400">
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Row 8: Key Features List */}
          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5 uppercase">
              Key Features
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                placeholder="e.g. Automated CLB score converter..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/15 text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-xs font-bold"
              >
                + Add Feature
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              {formData.features.map((feat, idx) => (
                <div key={idx} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/5 text-xs text-slate-300">
                  <span>• {feat}</span>
                  <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-rose-400 hover:text-rose-300">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-cyber-primary py-2.5 px-6 rounded-xl flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Publish App'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
