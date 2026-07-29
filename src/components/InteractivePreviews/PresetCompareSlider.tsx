import React, { useState } from 'react';
import { Sliders, Camera } from 'lucide-react';

interface PresetCompareSliderProps {
  title: string;
  beforeUrl: string;
  afterUrl: string;
}

export const PresetCompareSlider: React.FC<PresetCompareSliderProps> = ({
  title,
  beforeUrl,
  afterUrl,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-400" />
          <div>
            <h4 className="font-semibold text-sm line-clamp-1">{title}</h4>
            <p className="text-xs text-slate-400">Interactive Preset Before / After Comparison</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono">
          Lightroom .XMP
        </span>
      </div>

      <div className="relative w-full h-64 rounded-lg overflow-hidden select-none border border-slate-800">
        {/* After Image (Full Background) */}
        <img
          src={afterUrl}
          alt="After Preset"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[11px] text-amber-400 font-semibold border border-amber-500/30">
          AFTER PRESET
        </div>

        {/* Before Image (Clipped) */}
        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={beforeUrl}
            alt="Before Preset"
            className="absolute top-0 left-0 max-w-none h-full object-cover"
            style={{ width: '100%', height: '100%' }}
          />
          <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur px-2 py-0.5 rounded text-[11px] text-slate-300 font-semibold border border-slate-700">
            RAW BEFORE
          </div>
        </div>

        {/* Slider Line & Handle */}
        <div
          className="absolute inset-y-0 w-1 bg-white cursor-ew-resize flex items-center justify-center shadow-2xl"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg transform -translate-x-1/2 cursor-ew-resize">
            <Sliders className="w-4 h-4 rotate-90" />
          </div>
        </div>

        {/* Hidden Input for Touch & Drag */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>
    </div>
  );
};
