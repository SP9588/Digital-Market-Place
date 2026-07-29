import React, { useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, FileText, Lock } from 'lucide-react';

interface PdfPreviewerProps {
  title: string;
  samplePages?: string[];
}

export const PdfPreviewer: React.FC<PdfPreviewerProps> = ({
  title,
  samplePages = ['Chapter 1: Overview', 'Chapter 2: Architecture', 'Chapter 3: Monetization'],
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <div>
            <h4 className="font-semibold text-sm line-clamp-1">{title}</h4>
            <p className="text-xs text-slate-400">eBook & Publication Sample Reader</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-mono">
          PDF Sample
        </span>
      </div>

      {/* Book Reader Viewport */}
      <div className="relative w-full h-56 bg-slate-950 rounded-lg border border-slate-800 p-6 flex flex-col justify-between overflow-hidden shadow-inner">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400 pointer-events-none select-none">
          <FileText className="w-48 h-48" />
        </div>

        <div>
          <div className="text-[11px] font-semibold text-indigo-400 uppercase tracking-widest mb-1">
            OPEN OCEAN SAMPLE PREVIEW — PAGE {currentPage + 1} OF {samplePages.length}
          </div>
          <h3 className="text-lg font-serif font-bold text-slate-100 mb-2">
            {samplePages[currentPage]}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-lg">
            This excerpt is watermarked and published under Open Ocean Legal Content Guidelines. Purchase
            the full digital edition to unlock all chapters, downloadable source code archives, and high-resolution diagrams.
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Remaining 290 pages locked until checkout</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-300">
              {currentPage + 1} / {samplePages.length}
            </span>
            <button
              disabled={currentPage === samplePages.length - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
