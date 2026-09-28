'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { StudioUser, UserRole } from '@/lib/auth/auth';

interface AuthContextType {
  user: StudioUser | null;
  permissions: string[];
  isLoading: boolean;
  logout: () => Promise<void>;
  hasPerm: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  permissions: [],
  isLoading: true,
  logout: async () => {},
  hasPerm: () => false
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StudioUser | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setPermissions(data.permissions || []);
        } else {
          setUser(null);
          setPermissions([]);
          if (pathname !== '/admin/login') {
            router.push('/admin/login');
          }
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, [pathname, router]);

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setUser(null);
      setPermissions([]);
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const hasPerm = (perm: string): boolean => {
    if (!user) return false;
    if (permissions.includes('*')) return true;
    return permissions.includes(perm);
  };

  return (
    <AuthContext.Provider value={{ user, permissions, isLoading, logout, hasPerm }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AuthContext);
}
