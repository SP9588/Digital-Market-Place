import React from 'react';
import { CategoryId } from '../types/marketplace';
import { ALL_CATEGORIES } from '../data/categories';
import {
  BookOpen,
  GraduationCap,
  Music,
  Headphones,
  Video,
  Camera,
  Palette,
  Layout,
  Code,
  Globe,
  Bot,
  Sparkles,
  Briefcase,
  CheckSquare,
  Gamepad2,
  Box,
  Glasses,
  Megaphone,
  Gem,
  Gift,
  Wand2,
  Layers,
  Award,
  FileCheck,
  Grid,
} from 'lucide-react';

interface CategoryNavProps {
  selectedCategory: CategoryId | 'all';
  selectedSubcategory?: string;
  onSelectCategory: (catId: CategoryId | 'all', subcat?: string) => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  GraduationCap,
  Music,
  Headphones,
  Video,
  Camera,
  Palette,
  Layout,
  Code,
  Globe,
  Bot,
  Sparkles,
  Briefcase,
  CheckSquare,
  Gamepad2,
  Box,
  Glasses,
  Megaphone,
  Gem,
  Gift,
  Wand2,
  Layers,
  Award,
  FileCheck,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  selectedSubcategory,
  onSelectCategory,
}) => {
  const currentCategoryInfo = ALL_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
              selectedCategory === 'all'
                ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md shadow-sky-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            All Digital Goods
          </button>

          {ALL_CATEGORIES.map((cat) => {
            const IconComp = CATEGORY_ICON_MAP[cat.iconName] || Grid;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 border-sky-400 font-bold shadow-md shadow-sky-500/20'
                    : 'bg-slate-900/80 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:text-white'
                }`}
              >
                <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-sky-400'}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Subcategories bar if category is selected */}
        {currentCategoryInfo && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap">
              {currentCategoryInfo.name} Subcategories:
            </span>
            <button
              onClick={() => onSelectCategory(currentCategoryInfo.id)}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                !selectedSubcategory
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All {currentCategoryInfo.name}
            </button>
            {currentCategoryInfo.subcategories.map((sub) => (
              <button
                key={sub}
                onClick={() => onSelectCategory(currentCategoryInfo.id, sub)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  selectedSubcategory === sub
                    ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
