import React, { useState, useMemo } from 'react';
import { DigitalProduct } from '../types/marketplace';
import { TrendingUp, Hash, X, Flame, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface TrendingTagsCloudProps {
  products: DigitalProduct[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TrendingTagsCloud: React.FC<TrendingTagsCloudProps> = ({
  products,
  selectedTag,
  onSelectTag,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Compute tag frequencies from products
  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((rawTag) => {
          const cleanTag = rawTag.trim().toLowerCase();
          if (cleanTag) {
            map[cleanTag] = (map[cleanTag] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(map)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  if (tagCounts.length === 0) return null;

  const displayLimit = isExpanded ? 30 : 10;
  const visibleTags = tagCounts.slice(0, displayLimit);
  const hasMoreTags = tagCounts.length > 10;

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Section Header */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-slate-200 tracking-wide uppercase flex items-center gap-1.5">
              <span>Trending Tags</span>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.2 rounded font-mono font-semibold">
                Popular
              </span>
            </span>
          </div>

          {/* Active Tag Clear Indicator */}
          {selectedTag && (
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400">Filtering by tag:</span>
              <button
                onClick={() => onSelectTag(null)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all cursor-pointer group"
              >
                <Hash className="w-3 h-3 text-sky-400" />
                <span>#{selectedTag}</span>
                <X className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
              </button>
            </div>
          )}
        </div>

        {/* Tags Cloud Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          {visibleTags.map(({ tag, count }) => {
            const isSelected = selectedTag?.toLowerCase() === tag.toLowerCase();

            return (
              <button
                key={tag}
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md shadow-sky-500/20 active:scale-95'
                    : 'bg-slate-900/90 text-slate-300 border-slate-800/90 hover:border-slate-700 hover:text-white hover:bg-slate-800/80 active:scale-95'
                }`}
              >
                <Hash className={`w-3 h-3 ${isSelected ? 'text-slate-950' : 'text-sky-400/80'}`} />
                <span>{tag}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-slate-950/20 text-slate-950'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* Expand/Collapse Toggle Button */}
          {hasMoreTags && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-400 hover:text-sky-300 bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Show Less' : `+${tagCounts.length - 10} More Tags`}</span>
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
