import React, { useRef } from 'react';
import { FeaturedCollection, FEATURED_COLLECTIONS } from '../data/mockCollections';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, CheckCircle2, Layers } from 'lucide-react';

interface FeaturedCollectionsCarouselProps {
  activeCollectionId: string | null;
  onSelectCollection: (collection: FeaturedCollection | null) => void;
}

export const FeaturedCollectionsCarousel: React.FC<FeaturedCollectionsCarouselProps> = ({
  activeCollectionId,
  onSelectCollection,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
              <span>Featured Curated Collections</span>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/20">
                Handpicked Sets
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Browse themed digital asset bundles and specialized creative toolkits
            </p>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flex items-center gap-2">
          {activeCollectionId && (
            <button
              onClick={() => onSelectCollection(null)}
              className="text-xs font-mono font-bold text-sky-400 hover:text-sky-300 bg-sky-500/10 hover:bg-sky-500/20 px-2.5 py-1 rounded-lg border border-sky-500/30 transition-colors cursor-pointer mr-2"
            >
              Reset Collection Filter
            </button>
          )}

          <button
            onClick={() => handleScroll('left')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer active:scale-95"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors cursor-pointer active:scale-95"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Carousel Track */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-4 overflow-x-auto pb-2 custom-scrollbar scroll-smooth no-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {FEATURED_COLLECTIONS.map((col) => {
          const isActive = activeCollectionId === col.id;

          return (
            <div
              key={col.id}
              onClick={() => onSelectCollection(isActive ? null : col)}
              className={`shrink-0 w-80 sm:w-96 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden relative group flex flex-col justify-between ${
                isActive
                  ? 'border-sky-400 ring-2 ring-sky-500/40 shadow-xl shadow-sky-500/20 scale-[1.01]'
                  : 'border-slate-800/90 hover:border-slate-700 bg-slate-950 hover:shadow-xl hover:shadow-slate-950/50'
              }`}
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Background Image with Gradient Overlay */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={col.bannerImage}
                  alt={col.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-30 group-hover:opacity-40"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${col.gradient}`} />
              </div>

              {/* Top Badge & Status */}
              <div className="relative z-10 p-4 flex items-start justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold bg-slate-950/80 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-sm">
                  {col.badge}
                </span>

                {isActive && (
                  <span className="flex items-center gap-1 text-xs font-bold text-sky-400 bg-sky-950/90 border border-sky-400/50 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Collection</span>
                  </span>
                )}
              </div>

              {/* Main Content */}
              <div className="relative z-10 p-4 space-y-2 mt-auto">
                <h3 className="text-base font-extrabold text-white group-hover:text-sky-300 transition-colors leading-snug">
                  {col.title}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {col.subtitle}
                </p>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {col.itemCount}+ Assets Included
                  </span>

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                      isActive
                        ? 'bg-sky-400 text-slate-950'
                        : 'bg-slate-900/90 text-white group-hover:bg-sky-500 group-hover:text-slate-950 border border-slate-700/80 group-hover:border-sky-400'
                    }`}
                  >
                    <span>{isActive ? 'Filtered' : 'Explore'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
