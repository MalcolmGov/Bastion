'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
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
      <AdminAuthProvider>
        <div className="min-h-screen bg-[#070b11] text-gray-100 font-sans selection:bg-[#C99700] selection:text-black">
          {children}
        </div>
      </AdminAuthProvider>
    );
  }

  return (
    <AdminAuthProvider>
      <StudioWorkspaceProvider>
        <div className="min-h-screen bg-[#070B12] text-gray-100 flex font-sans selection:bg-[#0284C7] selection:text-white antialiased">
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
  );
}
