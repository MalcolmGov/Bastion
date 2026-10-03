'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Shield } from 'lucide-react';
import type { DesignCollectionId, SectionStyles } from '@/lib/studio/types';
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
import { StudioBackgroundFx } from './StudioBackgroundFx';

interface ContactFormProps {
  props: {
    title: string;
    description?: string;
    submitButtonText?: string;
  };
  styles?: SectionStyles;
  collection?: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export function StudioContactForm({ props, styles, collection = 'contemporary', variant = 'split_layout', isEditor }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  const isDarkMode = Boolean(
    styles?.theme === 'dark' ||
    styles?.backgroundColor?.includes('5, 8, 15') ||
    styles?.backgroundColor === '#0A0D14' ||
    styles?.backgroundColor === '#09090B' ||
    styles?.backgroundColor === '#070B12' ||
    styles?.backgroundColor === '#05080F'
  );

  const effectiveBg = styles?.backgroundColor || (isDarkMode ? '#070B12' : undefined);
  const effectiveTextColor = styles?.textColor || (isDarkMode ? '#F8FAFC' : undefined);
  const defaultFont = isEditorial || isImmersive ? 'font-serif' : 'font-sans';

  const fontFamilyClass = getFontFamilyClass(styles?.fontFamily, defaultFont);
  const headingScaleClass = getHeadingScaleClass(styles?.headingScale, 'text-3xl sm:text-4xl');
  const trackingClass = getTrackingClass(styles?.letterSpacing, 'tracking-tight');
  const alignClass = getAlignmentClasses(styles?.alignment, 'center');
  const containerWidthClass = getContainerWidthClass(styles?.containerWidth, 'max-w-4xl');
  const borderRadiusClass = getBorderRadiusClass(styles?.borderRadius, isEditorial ? 'rounded-none' : 'rounded-2xl');
  const inputBorderRadiusClass = getBorderRadiusClass(styles?.borderRadius, 'rounded-lg');
  const glowStyle = getGlowEffectStyles(styles?.glowEffect);
  const frostedGlassStyle = getFrostedGlassStyle(styles);

  const sectionStyle: React.CSSProperties = {
    ...(effectiveBg ? { backgroundColor: effectiveBg } : {}),
    ...(styles?.backgroundType === 'gradient' && styles.gradient ? { background: styles.gradient } : {}),
    ...(effectiveTextColor ? { color: effectiveTextColor } : {}),
    ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
    ...(styles?.borderTop ? { borderTopWidth: '1px', borderTopStyle: 'solid' } : {}),
    ...(styles?.borderBottom ? { borderBottomWidth: '1px', borderBottomStyle: 'solid' } : {}),
    ...glowStyle,
    ...frostedGlassStyle,
  };

  const hasCustomBg = Boolean(effectiveBg || styles?.backgroundType === 'gradient');
  const paddingClass = styles?.paddingY || 'py-20 md:py-28';

  const defaultBgClass = isDarkMode
    ? 'bg-[#090D16] text-[#F8FAFC] border-b border-white/10'
    : isImmersive
    ? 'bg-[#09090B] text-white border-b border-[#27272A]'
    : isEditorial
    ? 'bg-[#F7F6F2] text-[#172C3D] border-b border-[#E2E7EA]'
    : 'bg-white text-slate-900 border-b border-slate-200';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditor) return;
    setSubmitted(true);
  };

  return (
    <section
      style={sectionStyle}
      className={`relative overflow-hidden ${paddingClass} px-6 transition-colors ${!hasCustomBg ? defaultBgClass : (isDarkMode ? 'border-b border-white/10' : 'border-b border-slate-200')}`}
    >
      <StudioBackgroundFx
        pattern={styles?.backgroundPattern}
        opacity={styles?.patternOpacity}
        accentColor={styles?.accentColor}
      />
      <div className={`${containerWidthClass} mx-auto space-y-10 relative z-10`}>
        <div className={`space-y-3 ${alignClass.container}`}>
          <h2
            style={styles?.headingColor ? { color: styles.headingColor } : undefined}
            className={`${fontFamilyClass} ${headingScaleClass} font-bold ${trackingClass} ${alignClass.text}`}
          >
            {props.title}
          </h2>
          {props.description && (
            <p
              style={styles?.textColor ? { color: styles.textColor } : undefined}
              className={`text-base max-w-xl mx-auto ${alignClass.text} ${isImmersive ? 'text-zinc-400' : 'text-slate-600 dark:text-slate-300'}`}
            >
              {props.description}
            </p>
          )}
        </div>

        <div
          className={`p-8 md:p-10 ${borderRadiusClass} transition ${
            isImmersive
              ? 'bg-[#141416] border border-[#27272A]'
              : isEditorial
              ? 'bg-white border border-[#E2E7EA] shadow-sm'
              : 'bg-slate-50 border border-slate-200 shadow-sm'
          }`}
          style={{
            ...(styles?.borderColor ? { borderColor: styles.borderColor } : {}),
            ...frostedGlassStyle,
          }}
        >
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-2xl font-bold">Mandate Received</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Thank you for your submission. Our senior partners review all inquiries under strict NDA and will respond within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-sky-600 underline"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className={`w-full px-4 py-3 ${inputBorderRadiusClass} border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-500">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. e.vance@enterprise.com"
                    className={`w-full px-4 py-3 ${inputBorderRadiusClass} border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-500">
                  Telephone (Direct)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 20 7000 0000"
                  className={`w-full px-4 py-3 ${inputBorderRadiusClass} border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-500">
                  Transaction / Mandate Summary
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline key objectives, estimated deal volume or requirements, and preferred timeline..."
                  className={`w-full px-4 py-3 ${inputBorderRadiusClass} border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500`}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Confidentiality & Non-Disclosure Bound</span>
                </div>
                <button
                  type="submit"
                  style={styles?.accentColor ? { backgroundColor: styles.accentColor } : undefined}
                  className={`px-6 py-3 ${inputBorderRadiusClass} bg-slate-900 text-white font-semibold hover:opacity-90 transition text-sm shadow-sm flex items-center space-x-2`}
                >
                  <span>{props.submitButtonText || 'Submit Mandate'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
