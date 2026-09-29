'use client';

import React from 'react';
import { useDashboardCustomizer } from './DashboardCustomizerProvider';

export interface BastionLogoProps {
  className?: string;
  variant?: 'full' | 'monogram' | 'icon' | 'wordmark';
  showCmsBadge?: boolean;
  showGroupBadge?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'auto' | 'white' | 'navy' | string;
  height?: number | string;
  width?: number | string;
  animated?: boolean;
}

export function BastionLogo({
  className = '',
  variant = 'full',
  showCmsBadge = false,
  showGroupBadge = false,
  size = 'md',
  color = 'auto',
  height,
  width,
  animated = true
}: BastionLogoProps) {
  const { primaryColor, accentColor } = useDashboardCustomizer();

  // Determine standard height based on size or explicit prop
  const standardHeight = height || (size === 'sm' ? 22 : size === 'lg' ? 34 : 26);
  const numericHeight = typeof standardHeight === 'number' ? standardHeight : parseInt(String(standardHeight)) || 26;

  // Standalone Monogram / Icon Mode (for collapsed sidebar or mobile nav)
  if (variant === 'monogram' || variant === 'icon') {
    return (
      <div 
        className={`relative inline-flex items-center justify-center select-none group ${className}`}
        style={{ width: width || numericHeight + 10, height: height || numericHeight + 10 }}
        title="Bastion Group"
      >
        <div 
          style={{
            boxShadow: `0 4px 14px ${primaryColor}25, 0 1px 2px rgba(0,0,0,0.3)`
          }}
          className="w-full h-full rounded-xl overflow-hidden ring-1 ring-slate-800 dark:ring-white/15 bg-slate-900 dark:bg-slate-950 flex items-center justify-center transition-all duration-300 group-hover:scale-105"
        >
          {/* Authentic Bastion Serif 'B' with Signature Architectural Bracket Device */}
          <div className="relative flex items-center justify-center w-full h-full p-1.5">
            <span className="font-serif font-black text-base text-white tracking-tight -ml-0.5">B</span>
            <svg 
              className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] pointer-events-none" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={primaryColor || '#38bdf8'} 
              strokeWidth="2.5"
              strokeLinecap="square"
            >
              <path d="M12 3h9v18h-9" />
              <path d="M12 3v3" />
              <path d="M12 21v-3" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Full Original Bastion Logo with Exact Signature Architectural Bracket Device
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 select-none ${className}`}>
      {/* Authentic Original Bastion Logo (HD Retina Scaled) */}
      <div className="relative flex items-center shrink-0">
        {color === 'white' ? (
          <img 
            src="/assets/bastion-original-white-hd.png" 
            alt="Bastion Group" 
            style={{ 
              height: standardHeight, 
              width: width || 'auto',
              maxHeight: standardHeight
            }}
            className="object-contain transition-opacity duration-200 hover:opacity-95"
            loading="eager"
          />
        ) : color === 'navy' ? (
          <img 
            src="/assets/bastion-original-logo-hd.png" 
            alt="Bastion Group" 
            style={{ 
              height: standardHeight, 
              width: width || 'auto',
              maxHeight: standardHeight
            }}
            className="object-contain transition-opacity duration-200 hover:opacity-95"
            loading="eager"
          />
        ) : (
          /* Auto mode: navy in light mode, pure white in dark mode */
          <>
            <img 
              src="/assets/bastion-original-logo-hd.png" 
              alt="Bastion Group" 
              style={{ 
                height: standardHeight, 
                width: width || 'auto',
                maxHeight: standardHeight
              }}
              className="block dark:hidden object-contain transition-opacity duration-200 hover:opacity-95"
              loading="eager"
            />
            <img 
              src="/assets/bastion-original-white-hd.png" 
              alt="Bastion Group" 
              style={{ 
                height: standardHeight, 
                width: width || 'auto',
                maxHeight: standardHeight
              }}
              className="hidden dark:block object-contain transition-opacity duration-200 hover:opacity-95"
              loading="eager"
            />
          </>
        )}
      </div>

      {/* Optional Group Subtext */}
      {showGroupBadge && (
        <span 
          style={{ color: primaryColor }}
          className="text-[10px] font-black uppercase tracking-widest font-mono filter brightness-110"
        >
          GROUP
        </span>
      )}

      {/* Executive CMS Live Indicator Badge */}
      {showCmsBadge && (
        <span 
          style={{
            backgroundImage: `linear-gradient(135deg, ${primaryColor}22, ${accentColor}22)`,
            borderColor: `${primaryColor}40`,
            color: primaryColor,
            boxShadow: `0 2px 8px ${primaryColor}15`
          }}
          className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full border shadow-2xs inline-flex items-center gap-1.5 shrink-0"
        >
          <span 
            style={{ backgroundColor: primaryColor }}
            className="w-1.5 h-1.5 rounded-full animate-pulse shadow-sm" 
          />
          <span>CMS</span>
        </span>
      )}
    </div>
  );
}
