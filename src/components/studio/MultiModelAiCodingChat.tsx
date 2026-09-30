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
  Key,
  Trash2,
  Undo2,
  Code2,
  CheckCheck
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
  targetSectionTitle?: string;
  parsedChanges?: {
    summary?: string;
    props?: Record<string, any>;
    styles?: Record<string, any>;
  };
  previousSnapshot?: {
    sectionId: string;
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
  const [autoApply, setAutoApply] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const storageKey = `bastion_ai_chat_v2_${pageContext?.pageSlug || 'default'}`;

  // Sync stored keys & auto-apply preference
  useEffect(() => {
    setStoredKeys(getStoredApiKeys());
    try {
      const savedAuto = localStorage.getItem('bastion_ai_auto_apply');
      if (savedAuto !== null) setAutoApply(savedAuto === 'true');

      const savedChat = localStorage.getItem(storageKey);
      if (savedChat) {
        const parsed = JSON.parse(savedChat);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch (e) {
      console.warn('Could not load chat history from localStorage', e);
    }
  }, [storageKey]);

  // Persist messages whenever they change
  useEffect(() => {
    try {
      if (messages.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(messages));
      }
    } catch (e) {
      console.warn('Could not save chat history to localStorage', e);
    }
  }, [messages, storageKey]);

  const selectedModel = MODEL_OPTIONS.find(m => m.id === selectedModelId) || MODEL_OPTIONS[0];
  const hasUserKey = Boolean(storedKeys[selectedModel.provider]?.trim());

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleToggleAutoApply = () => {
    const next = !autoApply;
    setAutoApply(next);
    try {
      localStorage.setItem('bastion_ai_auto_apply', String(next));
    } catch {}
  };

  const handleClearChat = () => {
    if (confirm('Clear chat history for this page?')) {
      setMessages([]);
      try {
        localStorage.removeItem(storageKey);
      } catch {}
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputPrompt('');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const activeUserKey = storedKeys[selectedModel.provider];

      // Prepare conversation history (last 8 turns for high accuracy)
      const recentHistory = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content
      }));

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
          history: recentHistory
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

      let wasAutoApplied = false;
      let snapshot: any = null;

      if (data.parsedChanges && (data.parsedChanges.props || data.parsedChanges.styles) && section) {
        snapshot = {
          sectionId: section.id,
          props: JSON.parse(JSON.stringify(section.props || {})),
          styles: JSON.parse(JSON.stringify(section.styles || {}))
        };

        if (autoApply) {
          if (onApplyMultipleProps) {
            onApplyMultipleProps(data.parsedChanges.props || {}, data.parsedChanges.styles || {});
          } else if (data.parsedChanges.props) {
            Object.entries(data.parsedChanges.props).forEach(([field, val]) => {
              onApplyField(field, val);
            });
          }
          wasAutoApplied = true;
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assist_${Date.now()}`,
        role: 'assistant',
        content: data.replyText,
        modelId: selectedModel.name,
        provider: selectedModel.badge,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        targetSectionTitle: section?.props?.title || section?.componentId,
        parsedChanges: data.parsedChanges || undefined,
        previousSnapshot: snapshot,
        applied: wasAutoApplied
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

    const snapshot = {
      sectionId: section.id,
      props: JSON.parse(JSON.stringify(section.props || {})),
      styles: JSON.parse(JSON.stringify(section.styles || {}))
    };

    if (onApplyMultipleProps) {
      onApplyMultipleProps(parsedChanges.props || {}, parsedChanges.styles || {});
    } else if (parsedChanges.props) {
      Object.entries(parsedChanges.props).forEach(([field, val]) => {
        onApplyField(field, val);
      });
    }

    setMessages(prev =>
      prev.map((m, idx) => (idx === msgIndex ? { ...m, applied: true, previousSnapshot: snapshot } : m))
    );
  };

  const handleRevertChanges = (msgIndex: number) => {
    const msg = messages[msgIndex];
    if (!msg?.previousSnapshot || !section) return;

    if (onApplyMultipleProps) {
      onApplyMultipleProps(msg.previousSnapshot.props || {}, msg.previousSnapshot.styles || {});
    }

    setMessages(prev =>
      prev.map((m, idx) => (idx === msgIndex ? { ...m, applied: false } : m))
    );
  };

  return (
    <div className="flex flex-col h-[780px] max-h-[85vh] text-xs w-full">
      {/* Top Model Selector & Settings Bar */}
      <div className="p-3 bg-[#111726] border-b border-[#232F42] rounded-t-xl shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-white text-xs">AI Coding &amp; Polish Copilot</span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Auto-Apply Toggle */}
            <button
              type="button"
              onClick={handleToggleAutoApply}
              title={autoApply ? 'Auto-apply changes to canvas is enabled' : 'Auto-apply is disabled (manual review)'}
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center space-x-1 transition cursor-pointer ${
                autoApply
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <Zap className={`w-3 h-3 ${autoApply ? 'text-sky-400 fill-sky-400' : 'text-slate-500'}`} />
              <span>Auto-Apply {autoApply ? 'ON' : 'OFF'}</span>
            </button>

            {/* Key Status Indicator */}
            {hasUserKey ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Personal Key</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={onSwitchToKeysTab}
                className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 flex items-center space-x-1 cursor-pointer"
              >
                <Key className="w-2.5 h-2.5" />
                <span>Set Key ➔</span>
              </button>
            )}

            {/* Clear History Button */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation history"
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Custom Select for Frontier LLMs */}
        <div className="relative">
          <select
            value={selectedModelId}
            onChange={e => setSelectedModelId(e.target.value)}
            className="w-full appearance-none px-3 py-2 rounded-xl bg-[#0A0D14] border border-[#232F42] hover:border-slate-700 text-white font-medium text-xs focus:outline-none focus:border-sky-500 pr-8 cursor-pointer shadow-inner"
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
            <optgroup label="Chinese Frontier Models (DeepSeek &amp; Qwen)">
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
                AI Coding &amp; Polish Copilot
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
              className={`space-y-1.5 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
            >
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 px-1">
                {msg.role === 'user' ? (
                  <span className="ml-auto font-semibold text-slate-400">You</span>
                ) : (
                  <div className="flex items-center space-x-1.5 font-semibold text-sky-400">
                    <Sparkles className="w-3 h-3" />
                    <span>{msg.modelId || 'AI Assistant'}</span>
                    {msg.targetSectionTitle && (
                      <span className="text-slate-500 font-normal truncate max-w-[120px]">
                        [{msg.targetSectionTitle}]
                      </span>
                    )}
                  </div>
                )}
                <span>• {msg.timestamp}</span>

                {msg.role === 'assistant' && (
                  <button
                    type="button"
                    onClick={() => handleCopyText(msg.content, msg.id)}
                    title="Copy response"
                    className="p-0.5 text-slate-500 hover:text-slate-300 transition"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed inline-block max-w-[96%] ${
                  msg.role === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-xs text-left shadow-sm'
                    : 'bg-[#141C2A] text-slate-200 border border-[#232F42] rounded-tl-xs text-left shadow-xs'
                }`}
              >
                {/* Clean reply text without raw json block if parsed */}
                <div className="whitespace-pre-wrap">
                  {msg.content.replace(/```(?:json)?[\s\S]*?```/g, '').trim()}
                </div>

                {/* Structured Diff Card & Apply / Revert Actions */}
                {msg.parsedChanges && (
                  <div className="mt-3 pt-3 border-t border-[#232F42] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 flex items-center space-x-1">
                        <Zap className="w-3 h-3" />
                        <span>Proposed Canvas Changes</span>
                      </span>
                      {msg.applied ? (
                        <div className="flex items-center space-x-1.5">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                            <CheckCheck className="w-3 h-3 text-emerald-400" />
                            <span>Applied to Canvas</span>
                          </span>
                          {msg.previousSnapshot && (
                            <button
                              type="button"
                              onClick={() => handleRevertChanges(idx)}
                              title="Revert to prior snapshot"
                              className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center space-x-1 cursor-pointer"
                            >
                              <Undo2 className="w-2.5 h-2.5" />
                              <span>Revert</span>
                            </button>
                          )}
                        </div>
                      ) : null}
                    </div>

                    {msg.parsedChanges.summary && (
                      <div className="text-[11px] text-slate-300 italic bg-[#0A0D14] px-2.5 py-1.5 rounded-lg border border-[#1E293B]">
                        &ldquo;{msg.parsedChanges.summary}&rdquo;
                      </div>
                    )}

                    {/* Preview of changed fields */}
                    <div className="space-y-1.5 bg-[#0A0D14] p-2.5 rounded-xl border border-[#1E293B] text-[11px]">
                      {msg.parsedChanges.props &&
                        Object.entries(msg.parsedChanges.props).map(([k, v]) => (
                          <div key={k} className="flex items-start space-x-2">
                            <span className="font-mono text-sky-400 shrink-0 font-semibold">{k}:</span>
                            <span className="text-slate-200 truncate">
                              {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                            </span>
                          </div>
                        ))}
                      {msg.parsedChanges.styles && (
                        <div className="pt-1.5 border-t border-slate-800 space-y-1">
                          <span className="font-mono text-purple-400 font-semibold block text-[10px]">styles:</span>
                          {Object.entries(msg.parsedChanges.styles).map(([sk, sv]) => (
                            <div key={sk} className="flex items-center space-x-2 text-[10px] font-mono text-purple-300">
                              <span className="text-slate-400">{sk}:</span>
                              <span>{String(sv)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 1-Click Apply to Canvas Button */}
                    {!msg.applied && (
                      <button
                        type="button"
                        onClick={() => handleApplyChanges(idx, msg.parsedChanges)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
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
          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-[#141C2A] border border-[#232F42] text-xs text-slate-300 max-w-sm shadow-md animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400 shrink-0" />
            <span>{selectedModel.name} is synthesizing design &amp; code...</span>
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
            className="flex-1 px-3 py-2 rounded-xl bg-[#0A0D14] border border-[#232F42] text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none shadow-inner"
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
              onClick={handleClearChat}
              className="hover:text-slate-300 underline cursor-pointer"
            >
              Clear Chat ({messages.length})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
