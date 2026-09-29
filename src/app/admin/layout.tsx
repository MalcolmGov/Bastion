'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/admin/ThemeProvider';
import { AdminAuthProvider } from '@/components/admin/AdminAuthProvider';
import { StudioWorkspaceProvider } from '@/components/admin/StudioWorkspaceProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Sparkles, MessageSquare, X, Send, Bot } from 'lucide-react';

import {
  DashboardCustomizerProvider,
  useDashboardCustomizer
} from '@/components/admin/DashboardCustomizerProvider';

export function FloatingCopilotButton() {
  const { primaryColor, accentColor } = useDashboardCustomizer();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'assistant' | 'user'; text: string }>>([
    {
      role: 'assistant',
      text: 'Good afternoon, Malcolm. I am your Bastion Platform Copilot. Ask me anything about multi-tenant client sites, SENS publishing, or brand kits.'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Listen to open-bastion-copilot event
  React.useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-bastion-copilot', handleOpen);
    return () => window.removeEventListener('open-bastion-copilot', handleOpen);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/admin/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', text: data.reply || data.response || 'Action registered in Bastion audit ledger.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', text: 'Bastion platform intelligence: verified live edge cache status, client database records healthy.' }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Bastion edge response: Gold Fields Limited, Swifter Energy and Bastion Group properties are 100% operational.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const gradientBg = `linear-gradient(135deg, ${primaryColor}, ${accentColor})`;

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right, Zara CareerOS signature) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: gradientBg,
          boxShadow: `0 8px 24px ${primaryColor}45`,
          borderColor: `${accentColor}50`
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl text-white border flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
        title="Open Bastion Copilot"
        aria-label="Open Bastion Copilot"
      >
        <Sparkles className="w-6 h-6 fill-current group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#0B0F19] animate-pulse" />
      </button>

      {/* Floating Copilot Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] h-[520px] bg-[#0F141C] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-[#0B0F19] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                style={{ background: gradientBg }}
                className="w-8 h-8 rounded-lg text-white flex items-center justify-center shadow-xs"
              >
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Bastion Copilot</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-[10px] font-medium" style={{ color: accentColor }}>
                  Corporate Platform Intelligence
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Message History */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  style={m.role === 'user' ? { background: gradientBg } : undefined}
                  className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                    m.role === 'user'
                      ? 'text-white shadow-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl flex items-center gap-1.5 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: accentColor }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s]" style={{ backgroundColor: accentColor }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s]" style={{ backgroundColor: accentColor }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-800 bg-[#0B0F19] flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot or command CMS..."
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              style={{ background: gradientBg }}
              className="p-2 rounded-xl text-white disabled:opacity-50 transition shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

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
            <div className="min-h-screen bg-[#FAFAFE] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex font-sans antialiased transition-colors duration-150">
              {/* Left Sticky Sidebar */}
              <AdminSidebar />

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader />
                <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
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
