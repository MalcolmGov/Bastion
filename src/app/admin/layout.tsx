'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/admin/ThemeProvider';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';
import { StudioWorkspaceProvider } from '@/components/admin/StudioWorkspaceProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { MobileStudioNavigation } from '@/components/admin/MobileStudioNavigation';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ClientSandboxBanner } from '@/components/admin/ClientSandboxBanner';
import { DashboardCustomizerProvider } from '@/components/admin/DashboardCustomizerProvider';
import { ZaraVoiceCopilot } from '@/components/copilot/ZaraVoiceCopilot';

function FloatingCopilotButton() {
  return <ZaraVoiceCopilot />;
}



export default function AdminRootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // Embedded previews authenticate on the server and render without studio chrome.
  if (pathname === '/admin/editor/preview' || /^\/admin\/releases\/[^/]+\/preview\/[^/]+$/.test(pathname)) return <>{children}</>;

  if (pathname === '/admin/editor') {
    return <ThemeProvider><AdminAuthProvider><StudioWorkspaceProvider><DashboardCustomizerProvider><div className="h-dvh bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">{children}</div></DashboardCustomizerProvider></StudioWorkspaceProvider></AdminAuthProvider></ThemeProvider>;
  }

  if (isLoginPage) {
    return (
      <ThemeProvider>
        <AdminAuthProvider>
          <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-[#7C3AED] selection:text-white">
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
          <DashboardCustomizerProvider>
            <div className="min-h-screen bg-[#FAFAFE] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex font-sans antialiased tracking-[-0.011em] transition-colors duration-150">
              {/* Left Sticky Sidebar */}
              <div className="hidden md:block"><AdminSidebar /></div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <MobileStudioNavigation />
                <div className="hidden md:block"><AdminHeader /></div>
                <ClientSandboxBanner />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                  {children}
                </main>
              </div>

              {/* Floating Copilot Button & Assistant Drawer */}
              <FloatingCopilotButton />
            </div>
          </DashboardCustomizerProvider>
        </StudioWorkspaceProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}
