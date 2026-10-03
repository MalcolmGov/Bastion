'use client';

import React from 'react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
import { MapPin, Clock, Phone, Mail, Navigation, Calendar } from 'lucide-react';
import { StudioBackgroundFx } from './StudioBackgroundFx';
import {
  getFontFamilyClass,
  getHeadingScaleClass,
  getTrackingClass,
  getAlignmentClasses,
  getContainerWidthClass,
  getBorderRadiusClass,
  getGlowEffectStyles,
  getFrostedGlassStyle,
} from '@/lib/studio/styleResolver';

interface ScheduleHour {
  day: string;
  time: string;
}

interface StudioMapProps {
  props: {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    city?: string;
    address?: string;
    phone?: string;
    email?: string;
    hours?: ScheduleHour[];
  };
  styles?: SectionStyles;
  collection: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export const StudioMap: React.FC<StudioMapProps> = ({
  props,
  styles,
  collection,
  variant = 'split_interactive_card',
  isEditor = false
}) => {
  const eyebrow = props.eyebrow || 'Global Presence';
  const title = props.title || 'Institutional Presence & Global Advisory Desks';
  const subtitle = props.subtitle || 'Visit our physical advisory desk or coordinate with our partners across international financial hubs.';
  const city = props.city || 'Johannesburg, South Africa';
  const address = props.address || 'Sandton City Executive Tower, 5th Street, Sandton, 2196';
  const phone = props.phone || '+27 11 946 8820';
  const email = props.email || 'partners@movestudio.agency';
  const hours = props.hours || [
    { day: 'Monday – Friday', time: '08:00 – 18:00 SAST' },
    { day: 'Saturday', time: '09:00 – 13:00 SAST' },
    { day: 'Sunday & Public Holidays', time: 'By Partner Appointment' }
  ];

  const defaultFont = collection === 'editorial' ? 'font-serif' : 'font-sans';
  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-3xl sm:text-4xl lg:text-5xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-tight');
  const alignClass = getAlignmentClasses(styles?.alignment, 'center');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-7xl');
  const cardRadiusClass = getBorderRadiusClass(styles?.borderRadius, 'rounded-3xl');
  const subRadiusClass = getBorderRadiusClass(styles?.borderRadius, 'rounded-xl');
  const glowStyle = getGlowEffectStyles(styles?.glowEffect);
  const frostedGlassStyle = getFrostedGlassStyle(styles);

  // Compute section style wrapper
  const paddingClass = styles?.paddingY || 'py-24';
  const inlineStyle: React.CSSProperties = {
    ...glowStyle,
    ...frostedGlassStyle,
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
    ...(styles?.borderTop ? { borderTopWidth: '1px', borderTopStyle: 'solid' } : {}),
    ...(styles?.borderBottom ? { borderBottomWidth: '1px', borderBottomStyle: 'solid' } : {}),
  };

  if (styles?.backgroundType === 'solid' && styles.backgroundColor) {
    inlineStyle.backgroundColor = styles.backgroundColor;
  } else if (styles?.backgroundType === 'gradient' && styles.gradient) {
    inlineStyle.background = styles.gradient;
  } else {
    inlineStyle.backgroundColor = collection === 'editorial' ? '#090D17' : '#080A12';
  }

  const headingStyle: React.CSSProperties = styles?.headingColor ? { color: styles.headingColor } : {};
  const textStyle: React.CSSProperties = styles?.textColor ? { color: styles.textColor } : {};
  const accentColor = styles?.accentColor || '#38BDF8';

  return (
    <section className={`relative overflow-hidden ${paddingClass}`} style={inlineStyle}>
      <StudioBackgroundFx
        pattern={styles?.backgroundPattern}
        opacity={styles?.patternOpacity}
        accentColor={accentColor}
      />
      <div className={`${containerWidthClass} mx-auto px-6 sm:px-8 lg:px-12 relative z-10`}>
        {/* Header */}
        <div className={`max-w-3xl space-y-4 mb-16 ${alignClass.container}`}>
          {eyebrow && (
            <div
              className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-sky-400/30 bg-sky-500/10 text-xs font-semibold tracking-wide uppercase"
              style={{ color: accentColor }}
            >
              <span>{eyebrow}</span>
            </div>
          )}
          <h2
            className={`${fontFamilyClass} ${headingScaleClass} font-extrabold ${trackingClass} text-white ${alignClass.text}`}
            style={headingStyle}
          >
            {title}
          </h2>
          {subtitle && (
            <p className={`text-base sm:text-lg text-slate-300 leading-relaxed font-light ${alignClass.text}`} style={textStyle}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left: Stylized Map Card */}
          <div
            className={`lg:col-span-6 ${cardRadiusClass} bg-slate-900/80 border border-slate-800 p-8 flex flex-col justify-between relative overflow-hidden min-h-[380px] shadow-2xl`}
            style={{
              ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
              ...frostedGlassStyle,
            }}
          >
            {/* Visual Grid Backdrop */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, ${accentColor} 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />

            {/* Glowing Accent Orb */}
            <div
              className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: accentColor }}
            />

            <div className="relative z-10">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-semibold text-slate-300 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Headquarters & Advisory Desk</span>
              </div>
              <h3 className={`text-2xl font-bold text-white mb-2 ${fontFamilyClass}`}>{city}</h3>
              <p className="text-sm text-slate-400 font-light flex items-start space-x-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} />
                <span>{address}</span>
              </p>
            </div>

            {/* Location Pin Badge Center */}
            <div className="relative z-10 my-8 py-10 flex flex-col items-center justify-center">
              <div
                className={`w-16 h-16 ${subRadiusClass} flex items-center justify-center shadow-xl border border-white/20 animate-bounce duration-1000`}
                style={{ backgroundColor: accentColor, color: '#090D16' }}
              >
                <Navigation className="w-8 h-8 rotate-45" />
              </div>
              <span className="text-xs font-mono text-slate-400 mt-3 uppercase tracking-wider">
                Latitude: 26.1076° S • Longitude: 28.0567° E
              </span>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Secure Executive Parking Available</span>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center space-x-1"
                style={{ color: accentColor }}
              >
                <span>Google Maps</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          {/* Right: Hours & Contact Information */}
          <div
            className={`lg:col-span-6 ${cardRadiusClass} bg-slate-900/60 border border-slate-800/80 p-8 flex flex-col justify-between`}
            style={{
              ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
              ...frostedGlassStyle,
            }}
          >
            <div>
              {/* Working Hours */}
              <div className="flex items-center space-x-2 text-sm font-bold text-white mb-6 uppercase tracking-wider text-xs">
                <Clock className="w-4 h-4" style={{ color: accentColor }} />
                <span>Operating Schedule & SLA Hours</span>
              </div>

              <div className="space-y-3 mb-8">
                {hours.map((h, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 ${subRadiusClass} bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs`}
                  >
                    <span className="font-medium text-slate-300">{h.day}</span>
                    <span className="font-semibold text-white font-mono" style={{ color: accentColor }}>
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Direct Communications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className={`p-4 ${subRadiusClass} bg-slate-950/40 border border-slate-800`}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>Telephone</span>
                  </div>
                  <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-xs font-mono font-medium text-white hover:text-sky-400 transition">
                    {phone}
                  </a>
                </div>

                <div className={`p-4 ${subRadiusClass} bg-slate-950/40 border border-slate-800`}>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5" style={{ color: accentColor }} />
                    <span>Direct Email</span>
                  </div>
                  <a href={`mailto:${email}`} className="text-xs font-mono font-medium text-white hover:text-sky-400 transition truncate block">
                    {email}
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Schedule Button */}
            <div className="pt-8 mt-6">
              <a
                href="/contact"
                className={`w-full py-3 px-4 ${subRadiusClass} text-xs font-bold text-slate-950 tracking-wide transition flex items-center justify-center space-x-2 shadow-lg hover:brightness-110`}
                style={{ backgroundColor: accentColor }}
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule In-Person Consultation</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
