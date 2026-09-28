'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

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
}

const StudioWorkspaceContext = createContext<StudioWorkspaceContextType>({
  clients: [],
  activeClient: null,
  activeSite: null,
  setActiveClientId: () => {},
  setActiveSiteId: () => {},
  refreshClients: async () => {},
  isLoading: true
});

export function StudioWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<WorkspaceClient[]>([]);
  const [activeClientId, setActiveClientIdState] = useState<string>('client_apex_advisory');
  const [activeSiteId, setActiveSiteIdState] = useState<string>('site_apex_strategy');
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
          // Default to Apex Advisory if present, else first client
          const apex = data.clients.find((c: any) => c.id === 'client_apex_advisory');
          const target = apex || data.clients[0];
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
    fetchClients();
  }, []);

  const setActiveClientId = (id: string) => {
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
        isLoading
      }}
    >
      {children}
    </StudioWorkspaceContext.Provider>
  );
}

export function useStudioWorkspace() {
  return useContext(StudioWorkspaceContext);
}
