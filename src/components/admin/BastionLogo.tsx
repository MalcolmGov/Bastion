'use client';

import React from 'react';
import { useDashboardCustomizer } from './DashboardCustomizerProvider';

export interface BastionLogoProps {
  className?: string;
  variant?: 'full' | 'monogram' | 'icon' | '3d' | 'wordmark';
  showCmsBadge?: boolean;
  showGroupBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  height?: number | string;
  width?: number | string;
  animated?: boolean;
}

export function BastionLogo({
  className = '',
  variant = 'full',
  showCmsBadge = false,
  showGroupBadge = true,
  size = 'md',
  color,
  height,
  width,
  animated = true
}: BastionLogoProps) {
  const { primaryColor, accentColor } = useDashboardCustomizer();

  // Determine dimensional scales
  const sizeMap = {
    sm: { icon: 28, text: 'text-sm', badge: 'text-[9px]', group: 'text-[9px]' },
    md: { icon: 36, text: 'text-base sm:text-lg', badge: 'text-[10px]', group: 'text-[10px]' },
    lg: { icon: 44, text: 'text-xl sm:text-2xl', badge: 'text-xs', group: 'text-xs' }
  };

  const currentScale = sizeMap[size] || sizeMap.md;
  const iconPixelSize = height ? Math.max(28, typeof height === 'number' ? height * 1.25 : parseInt(String(height)) || 36) : currentScale.icon;

  // Standalone Monogram / Icon Mode
  if (variant === 'monogram' || variant === 'icon') {
    return (
      <div 
        className={`relative inline-flex items-center justify-center select-none group ${className}`}
        style={{ width: width || iconPixelSize, height: height || iconPixelSize }}
        title="Bastion Group"
      >
        <div 
          style={{
            boxShadow: `0 4px 16px ${primaryColor}30, 0 1px 3px rgba(0,0,0,0.5)`
          }}
          className="w-full h-full rounded-xl overflow-hidden ring-1 ring-white/20 bg-slate-950 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:ring-cyan-400/50"
        >
          <img 
            src="/assets/bastion-3d-emblem.jpg" 
            alt="Bastion 3D Monogram" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      </div>
    );
  }

  // Wordmark only mode
  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
        <span 
          className={`font-black tracking-tight ${color ? '' : 'text-current'} ${currentScale.text}`}
          style={color ? { color } : undefined}
        >
          BASTION
        </span>
        {showGroupBadge && (
          <span 
            style={{ color: primaryColor }}
            className={`font-black uppercase tracking-widest font-mono filter brightness-125 saturate-150 ${currentScale.group}`}
          >
            GROUP
          </span>
        )}
      </div>
    );
  }

  // Full Executive 3D Logo Presentation (Matching Zara CareerOS standard)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* 3D Photorealistic Sculpted "B" Emblem Squircle Tile */}
      <div 
        style={{ 
          width: iconPixelSize, 
          height: iconPixelSize,
          boxShadow: `0 4px 16px ${primaryColor}25, 0 1px 2px rgba(0,0,0,0.4)`
        }}
        className="relative shrink-0 rounded-xl overflow-hidden ring-1 ring-white/20 bg-slate-950 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:ring-cyan-400/50"
      >
        <img 
          src="/assets/bastion-3d-emblem.jpg" 
          alt="Bastion 3D Emblem" 
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="eager"
        />
        {/* Subtle glass reflection highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Pristine Modern Typography */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex flex-col select-none leading-none">
          <div className="flex items-baseline gap-1.5">
            <span 
              className={`font-black tracking-tight ${color ? '' : 'text-current'} ${currentScale.text}`}
              style={color ? { color } : undefined}
            >
              BASTION
            </span>
            {showGroupBadge && (
              <span 
                style={{ color: primaryColor }}
                className={`font-black uppercase tracking-widest font-mono filter brightness-125 saturate-150 ${currentScale.group}`}
              >
                GROUP
              </span>
            )}
          </div>
        </div>

        {/* Executive CMS Live Indicator Badge */}
        {showCmsBadge && (
          <span 
            style={{
              backgroundImage: `linear-gradient(135deg, ${primaryColor}1f, ${accentColor}1f)`,
              borderColor: `${primaryColor}40`,
              color: primaryColor,
              boxShadow: `0 2px 8px ${primaryColor}20`
            }}
            className={`font-black tracking-wider uppercase px-2 py-0.5 rounded-full border shadow-2xs inline-flex items-center gap-1.5 shrink-0 ${currentScale.badge}`}
          >
            <span 
              style={{ backgroundColor: primaryColor }}
              className="w-1.5 h-1.5 rounded-full animate-pulse shadow-sm" 
            />
            <span>CMS</span>
          </span>
        )}
      </div>
    </div>
  );
}
