'use client';

import React from 'react';
import type { BackgroundPatternType } from '@/lib/studio/types';

interface StudioBackgroundFxProps {
  pattern?: BackgroundPatternType;
  opacity?: number;
  accentColor?: string;
}

export const StudioBackgroundFx: React.FC<StudioBackgroundFxProps> = ({
  pattern = 'none',
  opacity = 0.35,
  accentColor = '#38BDF8'
}) => {
  if (!pattern || pattern === 'none') {
    return null;
  }

  const effectiveOpacity = Math.max(0.05, Math.min(1.0, opacity));

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none"
      aria-hidden="true"
      style={{ opacity: effectiveOpacity }}
    >
      {/* 1. Subtle Cyber Grid */}
      {pattern === 'grid' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 85%)'
          }}
        />
      )}

      {/* 2. Radial Cyber Dots */}
      {pattern === 'dots' && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 80%)'
          }}
        />
      )}

      {/* 3. Ambient Glow Orbs */}
      {pattern === 'glow_orbs' && (
        <>
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`,
              opacity: 0.8
            }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full blur-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle, #6366F1 0%, transparent 70%)`,
              opacity: 0.6
            }}
          />
        </>
      )}

      {/* 4. Conic / Multi-Point Mesh Gradient */}
      {pattern === 'mesh' && (
        <div
          className="absolute inset-0 blur-2xl"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, ${accentColor}40 0%, transparent 55%),
              radial-gradient(circle at 80% 20%, #6366F135 0%, transparent 50%),
              radial-gradient(circle at 50% 80%, #EC489925 0%, transparent 55%),
              radial-gradient(circle at 80% 85%, #F59E0B20 0%, transparent 50%)
            `
          }}
        />
      )}

      {/* 5. Cosmic Galaxy Stars */}
      {pattern === 'galaxy' && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse at 50% 30%, ${accentColor}18 0%, transparent 70%)`
            }}
          />
          {/* Static celestial starlight nodes */}
          {[
            { top: '15%', left: '20%', size: 3, delay: '0s' },
            { top: '25%', left: '80%', size: 2, delay: '1s' },
            { top: '45%', left: '10%', size: 2.5, delay: '2s' },
            { top: '65%', left: '90%', size: 3, delay: '0.5s' },
            { top: '80%', left: '30%', size: 2, delay: '1.5s' },
            { top: '35%', left: '60%', size: 3.5, delay: '2.5s' },
            { top: '75%', left: '70%', size: 2, delay: '0.8s' },
            { top: '10%', left: '50%', size: 2.5, delay: '1.8s' },
          ].map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white shadow-sm"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                boxShadow: `0 0 8px 1px ${accentColor}`,
                opacity: 0.75
              }}
            />
          ))}
        </div>
      )}

      {/* 6. Aurora Waves */}
      {pattern === 'aurora' && (
        <div
          className="absolute inset-0 blur-3xl opacity-80"
          style={{
            background: `linear-gradient(135deg, ${accentColor}30 0%, #6366F125 50%, #EC489920 100%)`,
            transform: 'scale(1.2)'
          }}
        />
      )}
    </div>
  );
};
