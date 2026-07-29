import React, { useState, useRef, useEffect } from 'react';
import { Box, RotateCw, Eye, Maximize2, Layers } from 'lucide-react';

interface ThreeDViewerProps {
  title: string;
  modelType?: string;
}

export const ThreeDViewer: React.FC<ThreeDViewerProps> = ({ title, modelType = 'mech' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wireframe, setWireframe] = useState(false);
  const [isRotating, setIsRotating] = useState(true);
  const [rotation, setRotation] = useState({ x: 0.3, y: 0.5 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let autoRot = rotation.y;

    const render = () => {
      if (isRotating && !isDragging) {
        autoRot += 0.015;
        setRotation((prev) => ({ ...prev, y: autoRot }));
      }

      const width = canvas.width;
      const height = canvas.height;
      const cx = width / 2;
      const cy = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Draw background grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let i = -10; i <= 10; i++) {
        const x = cx + i * 20;
        ctx.beginPath();
        ctx.moveTo(x, cy + 80);
        ctx.lineTo(cx + (i * 35), cy + 160);
        ctx.stroke();
      }

      // Draw 3D Cube / Mech geometry projection
      const size = 65;
      const rotY = rotation.y;
      const rotX = rotation.x;

      // Define vertices of a 3D box
      const vertices = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
        [0, -2, 0],   // Top turret peak
      ];

      // Rotate and project vertices
      const projected = vertices.map(([vx, vy, vz]) => {
        // Rotate around Y
        let x1 = vx * Math.cos(rotY) - vz * Math.sin(rotY);
        let z1 = vx * Math.sin(rotY) + vz * Math.cos(rotY);

        // Rotate around X
        let y2 = vy * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = vy * Math.sin(rotX) + z1 * Math.cos(rotX);

        const fov = 300;
        const scale = fov / (fov + z2 * 50 + 200);
        return {
          x: cx + x1 * size * scale,
          y: cy + y2 * size * scale,
          z: z2,
        };
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0], // Back face
        [4, 5], [5, 6], [6, 7], [7, 4], // Front face
        [0, 4], [1, 5], [2, 6], [3, 7], // Connecting edges
        [0, 8], [1, 8], [4, 8], [5, 8], // Top turret edges
      ];

      // Draw faces or wireframe
      if (!wireframe) {
        ctx.fillStyle = '#0284c722';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 1;
      }

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
        ctx.stroke();
      });

      // Joint nodes
      projected.forEach((p) => {
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [rotation, wireframe, isRotating, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setRotation((prev) => ({
      x: prev.x + dy * 0.01,
      y: prev.y + dx * 0.01,
    }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-white shadow-xl">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Box className="w-5 h-5 text-sky-400" />
          <div>
            <h4 className="font-semibold text-sm line-clamp-1">{title}</h4>
            <p className="text-xs text-slate-400">3D Interactive Inspector (Orbit & Zoom)</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setWireframe(!wireframe)}
            className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 border transition-colors cursor-pointer ${
              wireframe
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {wireframe ? 'Wireframe' : 'PBR Shaded'}
          </button>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded text-xs border transition-colors cursor-pointer ${
              isRotating
                ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Toggle Auto Rotate"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        className="relative w-full h-56 bg-slate-950 rounded-lg border border-slate-800 overflow-hidden cursor-grab active:cursor-grabbing flex items-center justify-center"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} width={500} height={220} className="w-full h-full" />
        <div className="absolute bottom-2 left-3 text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded border border-slate-800">
          Click & Drag to Rotate Mesh
        </div>
      </div>
    </div>
  );
};
