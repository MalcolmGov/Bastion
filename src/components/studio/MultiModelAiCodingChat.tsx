'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Check,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronDown,
  Layers,
  ArrowRight,
  RefreshCw,
  Cpu,
  Palette,
  Smartphone,
  Sliders,
  Terminal,
  Zap,
  Key
} from 'lucide-react';
import type { SectionInstance } from '@/lib/studio/types';
import { getStoredApiKeys, StoredApiKeys } from './ApiKeysTab';

export interface MultiModelAiCodingChatProps {
  section: SectionInstance | null | undefined;
  onApplyField: (field: string, newValue: any) => void;
  onApplyMultipleProps?: (newProps: Record<string, any>, newStyles?: Record<string, any>) => void;
  onSwitchToKeysTab?: () => void;
  pageContext?: {
    pageSlug: string;
    siteName?: string;
    totalSections?: number;
  };
  brandKit?: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  modelId?: string;
  provider?: string;
  timestamp: string;
  parsedChanges?: {
    summary?: string;
    props?: Record<string, any>;
    styles?: Record<string, any>;
  };
  applied?: boolean;
}

const MODEL_OPTIONS = [
  // Anthropic Claude (Claude 5.5 / 5.1 & Frontier Series)
  {
    id: 'claude-opus-5-5',
    provider: 'anthropic' as const,
    name: 'Claude Opus 5.5',
    tag: 'Highest Capability, Deep Reasoning & Complex Agentic Coding (Sept 2026 Flagship)',
    badge: 'Anthropic',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  {
    id: 'claude-sonnet-5-5',
    provider: 'anthropic' as const,
    name: 'Claude Sonnet 5.5',
    tag: '30% Faster Agentic Coding & Design Polish (Sept 2026)',
    badge: 'Anthropic',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  {
    id: 'claude-fable-5-1',
    provider: 'anthropic' as const,
    name: 'Claude Fable 5.1',
    tag: 'Long-Horizon Autonomous Agentic Work (Sept 2026)',
    badge: 'Anthropic',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  {
    id: 'claude-3-7-sonnet-20250219',
    provider: 'anthropic' as const,
    name: 'Claude 3.7 Sonnet',
    tag: 'Hybrid Reasoning & Coding',
    badge: 'Anthropic',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    provider: 'anthropic' as const,
    name: 'Claude 3.5 Sonnet v2',
    tag: 'Elite UI/UX & Creative Polish',
    badge: 'Anthropic',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    provider: 'anthropic' as const,
    name: 'Claude 3.5 Haiku',
    tag: 'Ultra-Fast Responsive Polish',
    badge: 'Anthropic',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10'
  },
  // OpenAI (GPT-6 Generational Series & Reasoning)
  {
    id: 'gpt-6-astra',
    provider: 'openai' as const,
    name: 'GPT-6 Astra',
    tag: 'Generational Flagship in Software Engineering & Design (Sept 2026)',
    badge: 'OpenAI',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 'gpt-6-sol',
    provider: 'openai' as const,
    name: 'GPT-6 Sol',
    tag: 'Balanced Agentic Coding & Multi-Step Workflows (Sept 2026)',
    badge: 'OpenAI',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 'gpt-6-luna',
    provider: 'openai' as const,
    name: 'GPT-6 Luna',
    tag: 'Smallest, Ultra-Fast High-Volume Model (Sept 2026)',
    badge: 'OpenAI',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 'o3-mini',
    provider: 'openai' as const,
    name: 'o3-mini',
    tag: 'Latest SOTA Reasoning & Algorithmic Code',
    badge: 'OpenAI',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 'o1',
    provider: 'openai' as const,
    name: 'OpenAI o1',
    tag: 'Frontier Deep Reasoning Coder',
    badge: 'OpenAI',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 'gpt-4o',
    provider: 'openai' as const,
    name: 'GPT-4o',
    tag: 'Flagship Multimodal Design & Code',
    badge: 'OpenAI',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  {
    id: 'gpt-4o-mini',
    provider: 'openai' as const,
    name: 'GPT-4o mini',
    tag: 'Fast Lightweight Micro-Updates',
    badge: 'OpenAI',
    color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
  },
  // Google Gemini
  {
    id: 'gemini-2.0-flash',
    provider: 'gemini' as const,
    name: 'Gemini 2.0 Flash',
    tag: 'Next-Gen Ultra-Low Latency',
    badge: 'Google',
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
  },
  {
    id: 'gemini-1.5-pro',
    provider: 'gemini' as const,
    name: 'Gemini 1.5 Pro',
    tag: 'Deep Context & Architecture',
    badge: 'Google',
    color: 'text-sky-400 border-sky-500/30 bg-sky-500/10'
  },
  // Chinese Models (DeepSeek & Qwen)
  {
    id: 'deepseek-reasoner',
    provider: 'deepseek' as const,
    name: 'DeepSeek-R1',
    tag: 'Frontier Reasoning Coder',
    badge: 'DeepSeek',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  },
  {
    id: 'deepseek-chat',
    provider: 'deepseek' as const,
    name: 'DeepSeek-V3',
    tag: '671B MoE Frontier Coder',
    badge: 'DeepSeek',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10'
  },
  {
    id: 'qwen-2.5-coder-32b-instruct',
    provider: 'qwen' as const,
    name: 'Qwen 2.5 Coder 32B',
    tag: 'Benchmark-Leading Open Code',
    badge: 'Qwen',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  },
  {
    id: 'qwen-max',
    provider: 'qwen' as const,
    name: 'Qwen Max',
    tag: 'Alibaba Cloud Enterprise Frontier',
    badge: 'Qwen',
    color: 'text-amber-400 border-amber-500/30 bg-amber-500/10'
  }
];

const QUICK_PROMPTS = [
  { label: '✨ Polish Copy', prompt: 'Polish the headline, subtitle, and body copy to make it punchy, executive, and investor-ready.' },
  { label: '💎 Glassmorphism & Depth', prompt: 'Upgrade the section styles with a modern dark glassmorphic gradient, sleek border contrast, and luxury gold/sky accent.' },
  { label: '📱 Perfect Mobile Spacing', prompt: 'Optimize the layout hierarchy, padding, and text readability for flawless mobile and tablet viewing.' },
  { label: '🎯 High-Converting CTA', prompt: 'Refine the call-to-action button copy and secondary value proposition to maximize user conversion.' },
  { label: '📊 Corporate Metrics', prompt: 'Enhance this block with prominent numerical statistics and compelling proof points.' }
];

export function MultiModelAiCodingChat({
  section,
  onApplyField,
  onApplyMultipleProps,
  onSwitchToKeysTab,
  pageContext,
  brandKit
}: MultiModelAiCodingChatProps) {
  const [selectedModelId, setSelectedModelId] = useState<string>('claude-opus-5-5');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storedKeys, setStoredKeys] = useState<StoredApiKeys>({});
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Sync stored keys
  useEffect(() => {
    setStoredKeys(getStoredApiKeys());
  }, []);

  const selectedModel = MODEL_OPTIONS.find(m => m.id === selectedModelId) || MODEL_OPTIONS[0];
  const hasUserKey = Boolean(storedKeys[selectedModel.provider]?.trim());

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const activeUserKey = storedKeys[selectedModel.provider];

      const res = await fetch('/api/admin/editor/ai-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedModel.provider,
          modelId: selectedModel.id,
          prompt: text,
          section: section || null,
          pageContext: pageContext || { pageSlug: 'home', siteName: 'Gold Fields' },
          brandKit: brandKit || null,
          userApiKey: activeUserKey || undefined,
          history: messages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.requiresApiKey) {
          setErrorMessage(data.error);
        } else {
          throw new Error(data.error || 'Failed to process AI polish response');
        }
        setIsLoading(false);
        return;
      }

      const assistantMsg: ChatMessage = {
        id: `assist_${Date.now()}`,
        role: 'assistant',
        content: data.replyText,
        modelId: selectedModel.name,
        provider: selectedModel.badge,
        timestamp: new Date().toLocaleTimeString(),
        parsedChanges: data.parsedChanges || undefined,
        applied: false
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with AI model.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyChanges = (msgIndex: number, parsedChanges?: ChatMessage['parsedChanges']) => {
    if (!parsedChanges || !section) return;

    if (onApplyMultipleProps) {
      onApplyMultipleProps(parsedChanges.props || {}, parsedChanges.styles || {});
    } else {
      // Fallback single field application
      if (parsedChanges.props) {
        Object.entries(parsedChanges.props).forEach(([field, val]) => {
          onApplyField(field, val);
        });
      }
    }

    setMessages(prev =>
      prev.map((m, idx) => (idx === msgIndex ? { ...m, applied: true } : m))
    );
  };

  return (
    <div className="flex flex-col h-[750px] max-h-[82vh] text-xs">
      {/* Top Model Selector & Status Bar */}
      <div className="p-3 bg-[#111726] border-b border-[#232F42] rounded-t-xl shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white text-xs">AI Coding & Polish Model</span>
          </div>

          {/* Key Status Indicator */}
          {hasUserKey ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Personal Key Active</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onSwitchToKeysTab}
              className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 flex items-center space-x-1 cursor-pointer"
            >
              <Key className="w-2.5 h-2.5" />
              <span>Configure Key ➔</span>
            </button>
          )}
        </div>

        {/* Custom Select for Frontier LLMs */}
        <div className="relative">
          <select
            value={selectedModelId}
            onChange={e => setSelectedModelId(e.target.value)}
            className="w-full appearance-none px-3 py-2 rounded-xl bg-[#0A0D14] border border-[#232F42] hover:border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-sky-500 pr-8 cursor-pointer"
          >
            <optgroup label="Anthropic Claude">
              {MODEL_OPTIONS.filter(m => m.provider === 'anthropic').map(m => (
                <option key={m.id} value={m.id}>
                  🟣 {m.name} — {m.tag}
                </option>
              ))}
            </optgroup>
            <optgroup label="OpenAI">
              {MODEL_OPTIONS.filter(m => m.provider === 'openai').map(m => (
                <option key={m.id} value={m.id}>
                  🟢 {m.name} — {m.tag}
                </option>
              ))}
            </optgroup>
            <optgroup label="Google Gemini">
              {MODEL_OPTIONS.filter(m => m.provider === 'gemini').map(m => (
                <option key={m.id} value={m.id}>
                  🔵 {m.name} — {m.tag}
                </option>
              ))}
            </optgroup>
            <optgroup label="Chinese Frontier Models (DeepSeek & Qwen)">
              {MODEL_OPTIONS.filter(m => m.provider === 'deepseek' || m.provider === 'qwen').map(m => (
                <option key={m.id} value={m.id}>
                  🇨🇳 {m.name} — {m.tag}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>

        {/* Target Context Pill */}
        <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-[#0A0D14] border border-[#1E293B]">
          <div className="flex items-center space-x-1.5 text-slate-400 truncate">
            <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="text-slate-500">Target:</span>
            <span className="font-semibold text-slate-200 truncate">
              {section ? `${section.componentId.toUpperCase()} (${section.variant || 'default'})` : 'Entire Page Composition'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">
            {pageContext?.pageSlug ? `/${pageContext.pageSlug}` : ''}
          </span>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 bg-[#0E1522] border-b border-[#232F42] overflow-x-auto flex items-center space-x-1.5 shrink-0 scrollbar-none">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(qp.prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-[#141C2A] hover:bg-[#1E293B] border border-[#232F42] hover:border-sky-500/50 text-[10px] font-semibold text-slate-300 hover:text-white shrink-0 transition cursor-pointer disabled:opacity-50"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Message History Thread */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0A0D14]/70"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-white text-sm mb-1">
                AI Coding & Polish Copilot
              </div>
              <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                Choose from <strong className="text-slate-200">Claude Opus/Sonnet 5.5</strong>, <strong className="text-slate-200">GPT-6 Astra/Sol</strong>, <strong className="text-slate-200">Gemini 2.0</strong>, or <strong className="text-slate-200">DeepSeek / Qwen</strong> to finish, polish, and optimize your website build.
              </p>
            </div>
            <div className="text-[11px] text-slate-500">
              Click a quick prompt above or type your design instruction below.
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 px-1">
                {msg.role === 'user' ? (
                  <span className="ml-auto font-semibold text-slate-400">You</span>
                ) : (
                  <div className="flex items-center space-x-1 font-semibold text-sky-400">
                    <Sparkles className="w-3 h-3" />
                    <span>{msg.modelId || 'AI Assistant'}</span>
                  </div>
                )}
                <span>• {msg.timestamp}</span>
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed inline-block max-w-[94%] ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-xs text-left shadow-sm'
                    : 'bg-[#141C2A] text-slate-200 border border-[#232F42] rounded-tl-xs text-left shadow-xs whitespace-pre-wrap'
                }`}
              >
                {/* Clean reply text without raw json block if parsed */}
                {msg.content.replace(/```json[\s\S]*?```/g, '').trim()}

                {/* Structured Diff Card & Apply Button */}
                {msg.parsedChanges && (
                  <div className="mt-3 pt-3 border-t border-[#232F42] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>Proposed Canvas Changes</span>
                      </span>
                      {msg.applied ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Applied to Canvas</span>
                        </span>
                      ) : null}
                    </div>

                    {msg.parsedChanges.summary && (
                      <div className="text-[11px] text-slate-300 italic">
                        "{msg.parsedChanges.summary}"
                      </div>
                    )}

                    {/* Preview of changed fields */}
                    <div className="space-y-1.5 bg-[#0A0D14] p-2.5 rounded-xl border border-[#1E293B] text-[11px]">
                      {msg.parsedChanges.props &&
                        Object.entries(msg.parsedChanges.props).map(([k, v]) => (
                          <div key={k} className="flex items-start space-x-2">
                            <span className="font-mono text-slate-400 shrink-0">{k}:</span>
                            <span className="text-slate-200 truncate">
                              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </span>
                          </div>
                        ))}
                      {msg.parsedChanges.styles && (
                        <div className="pt-1 border-t border-slate-800 text-[10px] text-purple-300 font-mono">
                          Styles: {JSON.stringify(msg.parsedChanges.styles)}
                        </div>
                      )}
                    </div>

                    {/* 1-Click Apply to Canvas Button */}
                    {!msg.applied && (
                      <button
                        type="button"
                        onClick={() => handleApplyChanges(idx, msg.parsedChanges)}
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>✓ Apply Changes to Canvas</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        {/* Loading state indicator */}
        {isLoading && (
          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-[#141C2A] border border-[#232F42] text-xs text-slate-300 max-w-sm">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400 shrink-0" />
            <span>{selectedModel.name} is synthesizing design & code...</span>
          </div>
        )}

        {/* Error alert banner */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 space-y-1 text-xs">
            <div className="flex items-center space-x-1.5 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Model Request Failed</span>
            </div>
            <p className="text-[11px] text-rose-200">{errorMessage}</p>
            {onSwitchToKeysTab && (
              <button
                type="button"
                onClick={onSwitchToKeysTab}
                className="mt-1 text-[11px] underline font-semibold text-rose-100 hover:text-white cursor-pointer"
              >
                Go to API Keys Tab to configure or update credentials ➔
              </button>
            )}
          </div>
        )}
      </div>

      {/* Input Action Bar */}
      <div className="p-3 bg-[#111726] border-t border-[#232F42] rounded-b-xl shrink-0 space-y-2">
        <div className="flex items-center space-x-1.5">
          <textarea
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={`Ask ${selectedModel.name} to refine copy, layout, colors, or responsiveness...`}
            rows={2}
            className="flex-1 px-3 py-2 rounded-xl bg-[#0A0D14] border border-[#232F42] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none"
          />
          <button
            type="button"
            disabled={!inputPrompt.trim() || isLoading}
            onClick={() => handleSendMessage()}
            className="p-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-40 disabled:hover:bg-sky-500 transition shadow-sm cursor-pointer"
            title="Send instruction (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Press Enter to send, Shift+Enter for newline</span>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => setMessages([])}
              className="hover:text-slate-300 underline cursor-pointer"
            >
              Clear Chat
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
