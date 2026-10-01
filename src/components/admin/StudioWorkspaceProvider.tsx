'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAdminAuth } from './AdminAuthProvider';
import { isAgencyUser } from '@/lib/auth/roles';

export interface WorkspaceSite {
  id: string;
  clientId: string;
  name: string;
  slug: string;
  blueprintId: string;
  designCollectionId: string;
  status: string;
  primaryDomain?: string;
  settings?: any;
}

export interface WorkspaceClient {
  id: string;
  name: string;
  slug: string;
  industry: string;
  logoUrl?: string;
  websites: WorkspaceSite[];
}

interface StudioWorkspaceContextType {
  clients: WorkspaceClient[];
  activeClient: WorkspaceClient | null;
  activeSite: WorkspaceSite | null;
  setActiveClientId: (id: string) => void;
  setActiveSiteId: (id: string) => void;
  refreshClients: () => Promise<void>;
  isLoading: boolean;
  portalViewMode: 'client' | 'agency';
  setPortalViewMode: (mode: 'client' | 'agency') => void;
}

const StudioWorkspaceContext = createContext<StudioWorkspaceContextType>({
  clients: [],
  activeClient: null,
  activeSite: null,
  setActiveClientId: () => {},
  setActiveSiteId: () => {},
  refreshClients: async () => {},
  isLoading: true,
  portalViewMode: 'client',
  setPortalViewMode: () => {}
});

export function StudioWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAdminAuth();
  const agency = isAgencyUser(user);
  const [clients, setClients] = useState<WorkspaceClient[]>([]);
  const [activeClientId, setActiveClientIdState] = useState<string>('client_goldfields');
  const [activeSiteId, setActiveSiteIdState] = useState<string>('site_goldfields_flagship');
  const [portalViewMode, setPortalViewModeState] = useState<'client' | 'agency'>('client');
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);

        // Restore saved client from localStorage if available
        const savedClientId = typeof window !== 'undefined' ? localStorage.getItem('move_studio_active_client') : null;
        const savedSiteId = typeof window !== 'undefined' ? localStorage.getItem('move_studio_active_site') : null;
        if (savedClientId && data.clients.some((c: any) => c.id === savedClientId)) {
          setActiveClientIdState(savedClientId);
          if (savedSiteId) setActiveSiteIdState(savedSiteId);
        } else if (data.clients.length > 0) {
          // Default to Gold Fields if present, else first client
          const goldfields = data.clients.find((c: any) => c.id === 'client_goldfields');
          const target = goldfields || data.clients[0];
          setActiveClientIdState(target.id);
          if (target.websites?.[0]) {
            setActiveSiteIdState(target.websites[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to load clients:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('move_studio_portal_mode') as 'client' | 'agency' | null;
      if (savedMode === 'agency' || savedMode === 'client') {
        setPortalViewModeState(savedMode);
      }
    }
    fetchClients();
  }, []);

  useEffect(() => {
    if (user && !agency) {
      setPortalViewModeState('client');
      if (user.client_id) {
        setActiveClientIdState(user.client_id);
        const userClient = clients.find(c => c.id === user.client_id);
        if (userClient?.websites?.[0]) {
          setActiveSiteIdState(userClient.websites[0].id);
        }
      }
    }
  }, [user, agency, clients]);

  const setActiveClientId = (id: string) => {
    // If not agency, forbid switching to another client
    if (!agency && user?.client_id && id !== user.client_id) {
      console.warn('[StudioWorkspace] Non-agency user cannot switch client workspace.');
      return;
    }
    setActiveClientIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('move_studio_active_client', id);
    }
    const found = clients.find(c => c.id === id);
    if (found?.websites?.[0]) {
      setActiveSiteId(found.websites[0].id);
    }
  };

  const setActiveSiteId = (id: string) => {
    setActiveSiteIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('move_studio_active_site', id);
    }
  };

  const setPortalViewMode = (mode: 'client' | 'agency') => {
    if (!agency && mode === 'agency') return;
    setPortalViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('move_studio_portal_mode', mode);
    }
  };

  const activeClient = clients.find(c => c.id === activeClientId) || clients[0] || null;
  const activeSite = activeClient?.websites?.find(w => w.id === activeSiteId) || activeClient?.websites?.[0] || null;

  return (
    <StudioWorkspaceContext.Provider
      value={{
        clients,
        activeClient,
        activeSite,
        setActiveClientId,
        setActiveSiteId,
        refreshClients: fetchClients,
        isLoading,
        portalViewMode,
        setPortalViewMode
      }}
    >
      {children}
    </StudioWorkspaceContext.Provider>
  );
}

export function useStudioWorkspace() {
  return useContext(StudioWorkspaceContext);
}
