import React, { useState } from 'react';
import { 
  Sparkles, 
  Eye, 
  X, 
  ArrowUpRight, 
  ZoomIn,
  CheckCircle2
} from 'lucide-react';
import { GALLERY_ITEMS } from '../../data/galleryData';
import { soundEngine } from '../audio/SoundEngine';

export const LusionGallery = () => {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <section id="showcase" className="relative py-28 border-t border-white/10 select-none">
      <div className="container-custom relative z-10">
        
        {/* Header */}
        <div className="pb-12 border-b border-white/10 mb-14">
          <span className="text-xs font-mono text-pink-400 uppercase tracking-widest block mb-2">
            // 03. INTERFACE ARCHIVES & SHOWCASE
          </span>
          <h2 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tighter uppercase leading-none">
            PRODUCTION <br />
            <span className="text-gradient-purple">INTERFACES</span>
          </h2>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {GALLERY_ITEMS.map((item, idx) => (
            <div
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                soundEngine.playChirp(1000);
              }}
              className="cyber-card rounded-3xl overflow-hidden cursor-pointer group flex flex-col justify-between border border-white/10 hover:border-pink-500/50 transition-all"
            >
              {/* Image Box */}
              <div className="relative h-64 w-full overflow-hidden bg-slate-900">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060a1e] via-transparent to-transparent" />
                
                <span className="absolute top-4 left-4 text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-pink-300 border border-white/10">
                  {item.category}
                </span>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                  <span className="btn-neon text-xs py-2 px-5 rounded-full font-mono uppercase flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" /> Inspect Image
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="p-6 flex flex-col gap-2">
                <h3 className="font-heading font-bold text-xl text-white group-hover:text-pink-300 transition-colors uppercase">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-300 font-light leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-emerald-400">
                  <span>{item.metrics}</span>
                  <span className="text-slate-400">0{idx + 1} / 06</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Lightbox Fullscreen Modal */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-3xl"
          onClick={() => setSelectedItem(null)}
        >
          <div 
            className="relative w-full max-w-5xl rounded-3xl cyber-glass border border-white/15 overflow-hidden shadow-2xl p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-white hover:text-black flex items-center justify-center transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[60vh] w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center mb-6">
              <img 
                src={selectedItem.imageUrl} 
                alt={selectedItem.title}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-pink-400 uppercase">
                  {selectedItem.category} // Archive
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {selectedItem.metrics}
                </span>
              </div>
              <h3 className="font-heading font-black text-2xl text-white uppercase">
                {selectedItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                {selectedItem.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
