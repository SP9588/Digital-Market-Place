import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Music } from 'lucide-react';

interface AudioWaveformPlayerProps {
  title: string;
  creator: string;
  sampleUrl?: string;
}

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({
  title,
  creator,
  sampleUrl,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 145; // 2:25 simulated sample duration
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    setProgress((currentTime / duration) * 100);
  }, [currentTime]);

  // Draw animated audio waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const barWidth = 3;
    const gap = 2;
    const totalBars = Math.floor(width / (barWidth + gap));

    for (let i = 0; i < totalBars; i++) {
      const barProgress = (i / totalBars) * 100;
      const isPlayed = barProgress <= progress;

      // Seeded pseudo-random height or animated wave
      const baseHeight = Math.sin(i * 0.15) * 20 + Math.cos(i * 0.3) * 15 + 25;
      const waveOffset = isPlaying ? Math.sin(Date.now() * 0.005 + i * 0.2) * 8 : 0;
      const finalHeight = Math.max(8, Math.min(height - 10, baseHeight + waveOffset));

      ctx.fillStyle = isPlayed ? '#0284c7' : '#94a3b8'; // Blue active, gray inactive
      const x = i * (barWidth + gap);
      const y = (height - finalHeight) / 2;

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, finalHeight, 2);
      ctx.fill();
    }
  }, [progress, isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-slate-100 line-clamp-1">{title}</h4>
            <p className="text-xs text-slate-400">Audio Preview • {creator}</p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 font-mono">
          24-Bit / 44.1kHz
        </span>
      </div>

      {/* Waveform Canvas */}
      <div className="relative w-full h-20 bg-slate-950/80 rounded-lg border border-slate-800 flex items-center px-3 mb-4 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={70}
          className="w-full h-full cursor-pointer"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newProgress = clickX / rect.width;
            setCurrentTime(newProgress * duration);
          }}
        />
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center justify-center transition-all shadow-lg shadow-sky-500/20 cursor-pointer font-bold"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button
            onClick={() => setCurrentTime(0)}
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <span className="font-mono text-slate-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
