'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  portalViewMode: 'agency',
  setPortalViewMode: () => {}
});

export function StudioWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAdminAuth();
  const agency = isAgencyUser(user);
  const [clients, setClients] = useState<WorkspaceClient[]>([]);
  const [activeClientId, setActiveClientIdState] = useState<string>('client_goldfields');
  const [activeSiteId, setActiveSiteIdState] = useState<string>('site_goldfields_flagship');
  const [portalViewMode, setPortalViewModeState] = useState<'client' | 'agency'>('agency');
  const [isLoading, setIsLoading] = useState(true);
  const prevUserIdRef = useRef<string | null>(null);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);

        // Check cookie first, then localStorage
        let savedClientId: string | null = null;
        if (typeof document !== 'undefined') {
          const cookieMatch = document.cookie.match(/(?:^|;\s*)bastion_active_client_id=([^;]+)/);
          if (cookieMatch) {
            savedClientId = decodeURIComponent(cookieMatch[1]);
          }
        }
        if (!savedClientId && typeof window !== 'undefined') {
          savedClientId = localStorage.getItem('bastion_active_client_id') || localStorage.getItem('move_studio_active_client');
        }

        const savedSiteId = typeof window !== 'undefined' ? localStorage.getItem('move_studio_active_site') : null;
        if (savedClientId && data.clients.some((c: any) => c.id === savedClientId)) {
          setActiveClientIdState(savedClientId);
          if (typeof window !== 'undefined') {
            document.cookie = `bastion_active_client_id=${encodeURIComponent(savedClientId)}; path=/; max-age=31536000; SameSite=Lax`;
            localStorage.setItem('bastion_active_client_id', savedClientId);
            localStorage.setItem('move_studio_active_client', savedClientId);
          }
          const matchedClient = data.clients.find((c: any) => c.id === savedClientId);
          if (savedSiteId && matchedClient?.websites?.some((w: any) => w.id === savedSiteId)) {
            setActiveSiteIdState(savedSiteId);
          } else if (matchedClient?.websites?.[0]) {
            setActiveSiteIdState(matchedClient.websites[0].id);
          }
        } else if (data.clients.length > 0) {
          // Default to Gold Fields if present, else first client
          const goldfields = data.clients.find((c: any) => c.id === 'client_goldfields');
          const target = goldfields || data.clients[0];
          setActiveClientIdState(target.id);
          if (typeof window !== 'undefined') {
            document.cookie = `bastion_active_client_id=${encodeURIComponent(target.id)}; path=/; max-age=31536000; SameSite=Lax`;
            localStorage.setItem('bastion_active_client_id', target.id);
            localStorage.setItem('move_studio_active_client', target.id);
          }
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
    fetchClients();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userSwitched = prevUserIdRef.current !== user.id;
    prevUserIdRef.current = user.id;

    if (agency) {
      // Bastion Agency User: ALWAYS default to agency operations mode on login or user switch
      if (userSwitched) {
        setPortalViewModeState('agency');
        if (typeof window !== 'undefined') {
          localStorage.setItem('move_studio_portal_mode', 'agency');
        }
      } else {
        const savedMode = typeof window !== 'undefined' ? (localStorage.getItem('move_studio_portal_mode') as 'client' | 'agency' | null) : null;
        if (savedMode === 'client' || savedMode === 'agency') {
          setPortalViewModeState(savedMode);
        } else {
          setPortalViewModeState('agency');
        }
      }
    } else {
      // Corporate client user: ALWAYS locked to client mode and their assigned client workspace
      setPortalViewModeState('client');
      if (typeof window !== 'undefined') {
        localStorage.setItem('move_studio_portal_mode', 'client');
      }
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
      document.cookie = `bastion_active_client_id=${encodeURIComponent(id)}; path=/; max-age=31536000; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent('studio-active-client-changed', { detail: { clientId: id } }));
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
