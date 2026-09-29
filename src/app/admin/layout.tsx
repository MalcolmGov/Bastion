'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/admin/ThemeProvider';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';
import { StudioWorkspaceProvider } from '@/components/admin/StudioWorkspaceProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <ThemeProvider>
        <AdminAuthProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-[#B48C36] selection:text-white">
            {children}
          </div>
        </AdminAuthProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <StudioWorkspaceProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-[#0A0E17] text-slate-900 dark:text-slate-100 flex font-sans selection:bg-[#B48C36] selection:text-white antialiased transition-colors duration-150">
            {/* Left Sticky Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <AdminHeader />
              <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
                {children}
              </main>
            </div>
          </div>
        </StudioWorkspaceProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

