import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  X, 
  ZoomIn, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { GALLERY_ITEMS } from '../../data/galleryData';

export const WorkGallery = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');

  const categories = ['All', 'Education', 'Productivity', 'Finance', 'AI & Tools', 'DevOps'];

  const filteredItems = filterCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === filterCategory);

  return (
    <section id="showcase" className="py-20 bg-[#0b0f19] border-b border-[#1f293d] scroll-mt-14">
      <div className="container-custom">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PRODUCTION INTERFACES</span>
            </div>
            <h2 className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
              Work & Screenshot <span className="text-purple-400">Gallery</span>
            </h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mt-1">
              Visual previews and workflows from our deployed production applications.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  filterCategory === cat
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-[#111827] border border-[#1f293d] text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="clean-card overflow-hidden cursor-pointer group flex flex-col justify-between"
            >
              {/* Image Banner */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-900">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm border border-white/10 text-purple-300 text-xs font-mono">
                  {item.category}
                </span>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <span className="px-3.5 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                    <ZoomIn className="w-4 h-4" /> Inspect
                  </span>
                </div>
              </div>

              {/* Text Body */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1f293d] flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">{item.metrics}</span>
                  <span className="text-slate-400 flex items-center gap-1">
                    Inspect <Eye className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative w-full max-w-4xl rounded-2xl bg-[#111827] border border-slate-700 overflow-hidden shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white hover:bg-white hover:text-black flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="max-h-[60vh] w-full rounded-xl overflow-hidden bg-black flex items-center justify-center mb-4">
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-400 font-bold uppercase">
                  {selectedItem.category} Showcase
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {selectedItem.metrics}
                </span>
              </div>
              <h3 className="font-bold text-xl text-white">
                {selectedItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
