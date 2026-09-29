'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  DashboardPreferences,
  DEFAULT_DASHBOARD_PREFERENCES,
  DashboardCustomizeModal
} from './DashboardCustomizeModal';

interface DashboardCustomizerContextType {
  preferences: DashboardPreferences;
  setPreferences: (newPrefs: DashboardPreferences) => void;
  isCustomizeOpen: boolean;
  setIsCustomizeOpen: (open: boolean) => void;
  openCustomizer: () => void;
  closeCustomizer: () => void;
  primaryColor: string;
  accentColor: string;
}

const DashboardCustomizerContext = createContext<DashboardCustomizerContextType>({
  preferences: DEFAULT_DASHBOARD_PREFERENCES,
  setPreferences: () => {},
  isCustomizeOpen: false,
  setIsCustomizeOpen: () => {},
  openCustomizer: () => {},
  closeCustomizer: () => {},
  primaryColor: DEFAULT_DASHBOARD_PREFERENCES.primaryColor,
  accentColor: DEFAULT_DASHBOARD_PREFERENCES.accentColor
});

export function applyCustomColorsToDom(primary: string, accent: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  
  root.style.setProperty('--color-brand-primary', primary);
  root.style.setProperty('--color-brand-accent', accent);
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-accent', accent);
  root.style.setProperty('--brand-primary', primary);
  root.style.setProperty('--brand-accent', accent);
  root.style.setProperty('--brand-gradient-from', primary);
  root.style.setProperty('--brand-gradient-to', accent);
  root.style.setProperty('--brand-glow', `${primary}40`);
  root.style.setProperty('--brand-subtle', `${primary}15`);
}

export function DashboardCustomizerProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferencesState] = useState<DashboardPreferences>(DEFAULT_DASHBOARD_PREFERENCES);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bastion_dashboard_prefs');
        if (saved) {
          const parsed = JSON.parse(saved);
          const merged: DashboardPreferences = {
            ...DEFAULT_DASHBOARD_PREFERENCES,
            ...parsed,
            kpis: { ...DEFAULT_DASHBOARD_PREFERENCES.kpis, ...(parsed.kpis || {}) },
            sections: { ...DEFAULT_DASHBOARD_PREFERENCES.sections, ...(parsed.sections || {}) }
          };
          setPreferencesState(merged);
          applyCustomColorsToDom(merged.primaryColor, merged.accentColor);
        } else {
          applyCustomColorsToDom(DEFAULT_DASHBOARD_PREFERENCES.primaryColor, DEFAULT_DASHBOARD_PREFERENCES.accentColor);
        }
      } catch (err) {
        console.warn('Failed to load dashboard preferences:', err);
      } finally {
        setIsLoaded(true);
      }
    }

    const handleOpen = () => setIsCustomizeOpen(true);
    window.addEventListener('open-dashboard-customize', handleOpen);
    return () => window.removeEventListener('open-dashboard-customize', handleOpen);
  }, []);

  const setPreferences = (newPrefs: DashboardPreferences) => {
    setPreferencesState(newPrefs);
    applyCustomColorsToDom(newPrefs.primaryColor, newPrefs.accentColor);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('bastion_dashboard_prefs', JSON.stringify(newPrefs));
      } catch (e) {
        console.warn('Failed to save dashboard preferences:', e);
      }
    }
  };

  const openCustomizer = () => setIsCustomizeOpen(true);
  const closeCustomizer = () => setIsCustomizeOpen(false);

  const value = useMemo(() => ({
    preferences,
    setPreferences,
    isCustomizeOpen,
    setIsCustomizeOpen,
    openCustomizer,
    closeCustomizer,
    primaryColor: preferences.primaryColor || '#7C3AED',
    accentColor: preferences.accentColor || '#9333EA'
  }), [preferences, isCustomizeOpen]);

  return (
    <DashboardCustomizerContext.Provider value={value}>
      {children}
      <DashboardCustomizeModal
        isOpen={isCustomizeOpen}
        onClose={closeCustomizer}
        preferences={preferences}
        onSavePreferences={setPreferences}
      />
    </DashboardCustomizerContext.Provider>
  );
}

export function useDashboardCustomizer() {
  const context = useContext(DashboardCustomizerContext);
  if (!context) {
    throw new Error('useDashboardCustomizer must be used within a DashboardCustomizerProvider');
  }
  return context;
}
