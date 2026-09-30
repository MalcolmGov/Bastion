'use client';

import React, { useState, useRef } from 'react';
import { Target, RotateCcw, Monitor, Smartphone, Square, Layers } from 'lucide-react';

interface FocalPointPickerProps {
  imageUrl: string;
  initialX?: number;
  initialY?: number;
  onChange: (focalX: number, focalY: number) => void;
}

export function FocalPointPicker({
  imageUrl,
  initialX = 0.5,
  initialY = 0.5,
  onChange
}: FocalPointPickerProps) {
  const [focalX, setFocalX] = useState(initialX);
  const [focalY, setFocalY] = useState(initialY);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    const roundX = Math.round(x * 100) / 100;
    const roundY = Math.round(y * 100) / 100;

    setFocalX(roundX);
    setFocalY(roundY);
    onChange(roundX, roundY);
  };

  const setPreset = (x: number, y: number) => {
    setFocalX(x);
    setFocalY(y);
    onChange(x, y);
  };

  const xPercent = Math.round(focalX * 100);
  const yPercent = Math.round(focalY * 100);

  return (
    <div className="space-y-4 select-none">
      {/* Interactive Canvas */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-sky-400" />
            <span>Interactive Focal Point &amp; Hotspot</span>
          </span>
          <span className="font-mono text-[11px] text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
            X: {xPercent}% &bull; Y: {yPercent}%
          </span>
        </div>

        <div
          ref={containerRef}
          onClick={handleClick}
          className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 cursor-crosshair group shadow-inner"
        >
          {/* Base image */}
          <img
            src={imageUrl}
            alt="Focal point editor"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Crosshair Target Ring */}
          <div
            className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-sky-400 bg-sky-500/25 pointer-events-none shadow-lg shadow-sky-500/50 flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white ring-1 ring-sky-600 animate-pulse" />
            {/* Crosshair ticks */}
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-sky-300/80 pointer-events-none" />
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-sky-300/80 pointer-events-none" />
          </div>

          {/* Hint Overlay */}
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] text-slate-300 font-mono pointer-events-none backdrop-blur-xs">
            Click to re-target crop
          </div>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[11px] text-slate-400">Quick Focal Presets:</span>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setPreset(0.5, 0.5)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition"
          >
            Center (50/50)
          </button>
          <button
            type="button"
            onClick={() => setPreset(0.5, 0.25)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition"
          >
            Portrait (50/25)
          </button>
          <button
            type="button"
            onClick={() => setPreset(0.5, 0.75)}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-medium transition"
          >
            Ground (50/75)
          </button>
        </div>
      </div>

      {/* 4-Way Responsive Aspect Ratio Simulator */}
      <div className="pt-2 border-t border-slate-800/80 space-y-2">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Live Responsive Framing Simulator</span>
          <span className="text-[10px] text-emerald-400 font-mono">Real-time CSS Object-Position</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* 16:9 Desktop Hero */}
          <div className="space-y-1 text-center">
            <div className="w-full aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-xs relative">
              <img
                src={imageUrl}
                alt="16:9 crop"
                className="w-full h-full object-cover transition-all duration-150"
                style={{ objectPosition: `${xPercent}% ${yPercent}%` }}
              />
              <span className="absolute bottom-1 left-1 px-1 rounded bg-black/70 text-[9px] text-white font-mono">16:9</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Desktop Hero</span>
          </div>

          {/* 4:3 Corporate Card */}
          <div className="space-y-1 text-center">
            <div className="w-full aspect-4/3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-xs relative">
              <img
                src={imageUrl}
                alt="4:3 crop"
                className="w-full h-full object-cover transition-all duration-150"
                style={{ objectPosition: `${xPercent}% ${yPercent}%` }}
              />
              <span className="absolute bottom-1 left-1 px-1 rounded bg-black/70 text-[9px] text-white font-mono">4:3</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Feature Card</span>
          </div>

          {/* 1:1 Executive Profile */}
          <div className="space-y-1 text-center">
            <div className="w-full aspect-square rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-xs relative">
              <img
                src={imageUrl}
                alt="1:1 crop"
                className="w-full h-full object-cover transition-all duration-150"
                style={{ objectPosition: `${xPercent}% ${yPercent}%` }}
              />
              <span className="absolute bottom-1 left-1 px-1 rounded bg-black/70 text-[9px] text-white font-mono">1:1</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Square Avatar</span>
          </div>

          {/* 9:16 Mobile Story */}
          <div className="space-y-1 text-center">
            <div className="w-full aspect-9/16 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-xs relative">
              <img
                src={imageUrl}
                alt="9:16 crop"
                className="w-full h-full object-cover transition-all duration-150"
                style={{ objectPosition: `${xPercent}% ${yPercent}%` }}
              />
              <span className="absolute bottom-1 left-1 px-1 rounded bg-black/70 text-[9px] text-white font-mono">9:16</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Mobile Story</span>
          </div>
        </div>
      </div>
    </div>
  );
}
