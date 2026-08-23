import React, { createContext, useContext, useState, useEffect } from 'react';
import { SEED_APPS } from '../data/seedApps';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import confetti from 'canvas-confetti';

const AppsContext = createContext();

const LOCAL_STORAGE_KEY = 'mytechflow_apps_data';

export const AppsProvider = ({ children }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load apps on mount
  useEffect(() => {
    const loadApps = async () => {
      setLoading(true);

      if (isSupabaseConfigured && supabase) {
        try {
          const { data, error } = await supabase
            .from('apps')
            .select('*')
            .order('created_at', { ascending: false });

          if (!error && data && data.length > 0) {
            // Map supabase schema fields if needed
            const formatted = data.map(item => ({
              ...item,
              screenshotUrl: item.screenshot_url || item.screenshotUrl,
              accentColor: item.accent_color || item.accentColor
            }));
            setApps(formatted);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('Supabase fetch error, falling back to local store:', err);
        }
      }

      // Local storage fallback
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setApps(parsed);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Error parsing local apps storage', e);
        }
      }

      // Initial Seed fallback
      setApps(SEED_APPS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_APPS));
      setLoading(false);
    };

    loadApps();
  }, []);

  // Save changes to localStorage helper
  const syncLocal = (newApps) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newApps));
  };

  // Add App
  const addApp = async (appData) => {
    const newId = 'app-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newApp = {
      ...appData,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // If Supabase configured
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('apps').insert([{
          id: newApp.id,
          title: newApp.title,
          tagline: newApp.tagline,
          description: newApp.description,
          category: newApp.category,
          url: newApp.url,
          status: newApp.status || 'Live',
          featured: Boolean(newApp.featured),
          accent_color: newApp.accentColor || '#06b6d4',
          gradient: newApp.gradient || 'from-cyan-500 via-blue-600 to-indigo-600',
          icon: newApp.icon || 'AppWindow',
          screenshot_url: newApp.screenshotUrl,
          tags: newApp.tags || [],
          features: newApp.features || [],
          stats: newApp.stats || { users: '1k+', rating: '4.9/5', version: 'v1.0' }
        }]);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase insert failed, keeping in local store:', err);
      }
    }

    setApps(prev => {
      const updated = [newApp, ...prev];
      syncLocal(updated);
      return updated;
    });

    // Trigger celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    showToast(`App "${newApp.title}" created successfully!`, 'success');
    return newApp;
  };

  // Update App
  const updateApp = async (id, updatedData) => {
    const updatedWithTimestamp = {
      ...updatedData,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('apps').update({
          title: updatedWithTimestamp.title,
          tagline: updatedWithTimestamp.tagline,
          description: updatedWithTimestamp.description,
          category: updatedWithTimestamp.category,
          url: updatedWithTimestamp.url,
          status: updatedWithTimestamp.status,
          featured: Boolean(updatedWithTimestamp.featured),
          accent_color: updatedWithTimestamp.accentColor,
          gradient: updatedWithTimestamp.gradient,
          icon: updatedWithTimestamp.icon,
          screenshot_url: updatedWithTimestamp.screenshotUrl,
          tags: updatedWithTimestamp.tags,
          features: updatedWithTimestamp.features,
          stats: updatedWithTimestamp.stats,
          updated_at: updatedWithTimestamp.updated_at
        }).eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase update failed, keeping in local store:', err);
      }
    }

    setApps(prev => {
      const updated = prev.map(app => (app.id === id ? { ...app, ...updatedWithTimestamp } : app));
      syncLocal(updated);
      return updated;
    });

    showToast(`App "${updatedData.title || 'App'}" updated!`, 'success');
  };

  // Delete App
  const deleteApp = async (id) => {
    const target = apps.find(a => a.id === id);

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('apps').delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.warn('Supabase delete failed:', err);
      }
    }

    setApps(prev => {
      const updated = prev.filter(app => app.id !== id);
      syncLocal(updated);
      return updated;
    });

    showToast(`App "${target?.title || id}" deleted`, 'info');
  };

  // Reset to default seed apps
  const resetToDefault = () => {
    setApps(SEED_APPS);
    syncLocal(SEED_APPS);
    showToast('Reset apps list to initial defaults', 'info');
  };

  // Filtered apps based on search & category
  const filteredApps = apps.filter(app => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCategory;

    const matchesSearch =
      app.title?.toLowerCase().includes(q) ||
      app.tagline?.toLowerCase().includes(q) ||
      app.description?.toLowerCase().includes(q) ||
      app.category?.toLowerCase().includes(q) ||
      (app.tags && app.tags.some(tag => tag.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  return (
    <AppsContext.Provider
      value={{
        apps,
        filteredApps,
        loading,
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
        toastMessage,
        showToast
      }}
    >
      {children}
    </AppsContext.Provider>
  );
};

export const useApps = () => useContext(AppsContext);
