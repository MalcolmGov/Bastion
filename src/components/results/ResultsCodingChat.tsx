'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Code2,
  Copy,
  Cpu,
  Key,
  Send,
  Sparkles,
  Trash2,
  Undo2,
  Zap,
} from 'lucide-react';
import { ApiKeysTab, getStoredApiKeys, type StoredApiKeys } from '@/components/studio/ApiKeysTab';

const MODEL_OPTIONS = [
  { id: 'claude-opus-5-5', provider: 'anthropic' as const, name: 'Claude Opus 5.5', tag: 'Highest capability coding', badge: 'Anthropic' },
  { id: 'claude-sonnet-5-5', provider: 'anthropic' as const, name: 'Claude Sonnet 5.5', tag: 'Fast design and code', badge: 'Anthropic' },
  { id: 'claude-sonnet-5', provider: 'anthropic' as const, name: 'Claude Sonnet 5', tag: 'Upgraded frontier intelligence', badge: 'Anthropic' },
  { id: 'claude-3-5-sonnet-20241022', provider: 'anthropic' as const, name: 'Claude 3.5 Sonnet', tag: 'UI and HTML polish', badge: 'Anthropic' },
  { id: 'gpt-6-astra', provider: 'openai' as const, name: 'GPT-6 Astra', tag: 'Flagship engineering', badge: 'OpenAI' },
  { id: 'gpt-6-sol', provider: 'openai' as const, name: 'GPT-6 Sol', tag: 'Multi-step coding', badge: 'OpenAI' },
  { id: 'gpt-4o', provider: 'openai' as const, name: 'GPT-4o', tag: 'Design and code', badge: 'OpenAI' },
  { id: 'gpt-4o-mini', provider: 'openai' as const, name: 'GPT-4o mini', tag: 'Fast edits', badge: 'OpenAI' },
  { id: 'gemini-2.0-flash', provider: 'gemini' as const, name: 'Gemini 2.0 Flash', tag: 'Low latency', badge: 'Google' },
  { id: 'gemini-1.5-pro', provider: 'gemini' as const, name: 'Gemini 1.5 Pro', tag: 'Long document context', badge: 'Google' },
  { id: 'deepseek-reasoner', provider: 'deepseek' as const, name: 'DeepSeek-R1', tag: 'Reasoning coder', badge: 'DeepSeek' },
  { id: 'deepseek-chat', provider: 'deepseek' as const, name: 'DeepSeek-V3', tag: 'Frontier coder', badge: 'DeepSeek' },
  { id: 'qwen-2.5-coder-32b-instruct', provider: 'qwen' as const, name: 'Qwen 2.5 Coder 32B', tag: 'Open code model', badge: 'Qwen' },
  { id: 'qwen-max', provider: 'qwen' as const, name: 'Qwen Max', tag: 'Enterprise coder', badge: 'Qwen' },
];

const QUICK_PROMPTS = [
  { label: 'Dark editorial', prompt: 'Rewrite the page as a dark editorial results report. Keep every financial table. Update the CSS variables, header, and cards.' },
  { label: 'Serif investor', prompt: 'Restyle this HTML as a serif investor publication with more generous type and a quieter header.' },
  { label: 'Compact tables', prompt: 'Tighten the financial tables in CSS so more rows fit on a laptop screen without dropping any lines.' },
  { label: 'Two columns', prompt: 'Change the layout CSS so the introduction sits beside the statements on wide screens.' },
  { label: 'Mobile pass', prompt: 'Adjust the stylesheet so the masthead, metrics, and tables read cleanly on a phone.' },
  { label: 'Print', prompt: 'Add print CSS so each statement stays together and the footer does not consume a page.' },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  summary?: string;
  modelName?: string;
  timestamp: string;
  previousHtml?: string;
  nextHtml?: string;
  applied?: boolean;
}

export function ResultsCodingChat({
  html,
  documentId,
  onApplyHtml,
}: {
  html: string;
  documentId: string;
  onApplyHtml: (nextHtml: string) => void;
}) {
  const [selectedModelId, setSelectedModelId] = useState('claude-3-5-sonnet-20241022');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [storedKeys, setStoredKeys] = useState<StoredApiKeys>({});
  const [showKeys, setShowKeys] = useState(false);
  const [showSource, setShowSource] = useState(false);
  const [sourceDraft, setSourceDraft] = useState(html);
  const [autoApply, setAutoApply] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const selectedModel = MODEL_OPTIONS.find((model) => model.id === selectedModelId) || MODEL_OPTIONS[0];
  const hasUserKey = Boolean(storedKeys[selectedModel.provider]?.trim());

  useEffect(() => {
    setStoredKeys(getStoredApiKeys());
    const savedAuto = localStorage.getItem('bastion_results_code_auto_apply');
    if (savedAuto !== null) setAutoApply(savedAuto === 'true');
  }, [showKeys]);

  useEffect(() => {
    setSourceDraft(html);
  }, [html]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  async function send(textToSend?: string) {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading || !html) return;
    setErrorMessage(null);
    setInputPrompt('');
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/results/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedModel.provider,
          modelId: selectedModel.id,
          prompt: text,
          html,
          userApiKey: storedKeys[selectedModel.provider] || undefined,
          history: messages.slice(-6).map((message) => ({
            role: message.role,
            content: message.summary || message.content.slice(0, 1200),
          })),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'The coding assistant failed');
      const nextHtml = typeof body.html === 'string' ? body.html : html;
      const changed = nextHtml !== html;
      if (changed && autoApply) onApplyHtml(nextHtml);
      setMessages((current) => [...current, {
        id: `assist_${Date.now()}`,
        role: 'assistant',
        content: String(body.replyText || body.summary || 'Updated the publication source.'),
        summary: body.summary,
        modelName: body.provider === 'local' ? 'Built-in coder' : selectedModel.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        previousHtml: html,
        nextHtml,
        applied: changed && autoApply,
      }]);
      if (changed && autoApply) {
        setAppliedNotice('Applied the HTML update to the preview.');
        setTimeout(() => setAppliedNotice(null), 3500);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'The coding assistant failed');
    } finally {
      setIsLoading(false);
    }
  }

  function applyMessage(index: number) {
    const message = messages[index];
    if (!message?.nextHtml) return;
    onApplyHtml(message.nextHtml);
    setMessages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, applied: true, previousHtml: html } : item));
    setAppliedNotice('Applied that code revision.');
    setTimeout(() => setAppliedNotice(null), 3000);
  }

  function revertMessage(index: number) {
    const message = messages[index];
    if (!message?.previousHtml) return;
    onApplyHtml(message.previousHtml);
    setMessages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, applied: false } : item));
  }

  return (
    <div className="flex h-[760px] max-h-[82vh] flex-col overflow-hidden rounded-2xl border border-[#232F42] bg-[#0A0D14] text-xs text-slate-200">
      <div className="space-y-2 border-b border-[#232F42] bg-[#111726] p-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <Cpu className="h-4 w-4 text-sky-400" />
            AI coding assistant
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const next = !autoApply;
                setAutoApply(next);
                localStorage.setItem('bastion_results_code_auto_apply', String(next));
              }}
              className={`flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] ${autoApply ? 'border-sky-500/40 bg-sky-500/20 text-sky-300' : 'border-slate-700 bg-slate-800 text-slate-400'}`}
            >
              <Zap className="h-3 w-3" />
              Auto-apply {autoApply ? 'on' : 'off'}
            </button>
            <button type="button" onClick={() => setShowKeys((open) => !open)} className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] text-amber-200">
              <Key className="h-3 w-3" />
              {hasUserKey ? 'Key ready' : 'API keys'}
            </button>
            <button type="button" onClick={() => setShowSource((open) => !open)} className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
              <Code2 className="mr-1 inline h-3 w-3" />
              Source
            </button>
            {messages.length > 0 && (
              <button type="button" onClick={() => setMessages([])} className="p-1 text-slate-500 hover:text-rose-300" aria-label="Clear chat">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="relative">
          <select
            value={selectedModelId}
            onChange={(event) => setSelectedModelId(event.target.value)}
            className="w-full appearance-none rounded-xl border border-[#232F42] bg-[#0A0D14] px-3 py-2 pr-8 text-xs font-medium text-white"
          >
            <optgroup label="Anthropic">
              {MODEL_OPTIONS.filter((model) => model.provider === 'anthropic').map((model) => (
                <option key={model.id} value={model.id}>{model.name} — {model.tag}</option>
              ))}
            </optgroup>
            <optgroup label="OpenAI">
              {MODEL_OPTIONS.filter((model) => model.provider === 'openai').map((model) => (
                <option key={model.id} value={model.id}>{model.name} — {model.tag}</option>
              ))}
            </optgroup>
            <optgroup label="Google">
              {MODEL_OPTIONS.filter((model) => model.provider === 'gemini').map((model) => (
                <option key={model.id} value={model.id}>{model.name} — {model.tag}</option>
              ))}
            </optgroup>
            <optgroup label="DeepSeek and Qwen">
              {MODEL_OPTIONS.filter((model) => model.provider === 'deepseek' || model.provider === 'qwen').map((model) => (
                <option key={model.id} value={model.id}>{model.name} — {model.tag}</option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
        </div>
        <p className="px-1 text-[11px] text-slate-500">Editing publication {documentId.slice(0, 8)} as HTML and CSS. Tables stay in the source until you tell the assistant to change them.</p>
      </div>

      {showKeys && (
        <div className="max-h-64 overflow-y-auto border-b border-[#232F42] bg-[#0E1522]">
          <ApiKeysTab />
        </div>
      )}

      {showSource && (
        <div className="border-b border-[#232F42] bg-[#0E1522] p-2">
          <textarea
            value={sourceDraft}
            onChange={(event) => setSourceDraft(event.target.value)}
            spellCheck={false}
            className="h-40 w-full resize-y rounded-lg border border-[#232F42] bg-[#070b12] p-2 font-mono text-[10px] leading-4 text-slate-200"
          />
          <button
            type="button"
            onClick={() => onApplyHtml(sourceDraft)}
            className="mt-2 rounded-lg bg-sky-600 px-3 py-1.5 text-[11px] font-semibold text-white"
          >
            Apply source
          </button>
        </div>
      )}

      <div className="flex gap-1.5 overflow-x-auto border-b border-[#232F42] bg-[#0E1522] p-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            type="button"
            disabled={isLoading}
            onClick={() => send(prompt.prompt)}
            className="shrink-0 rounded-lg border border-[#232F42] bg-[#141C2A] px-2.5 py-1 text-[10px] font-semibold text-slate-300 hover:border-sky-500/50"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      <div ref={chatScrollRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        {appliedNotice && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/80 px-3 py-2 text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            {appliedNotice}
          </div>
        )}
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <Sparkles className="mb-3 h-6 w-6 text-sky-400" />
            <p className="font-semibold text-white">Code the results page in chat</p>
            <p className="mt-2 max-w-xs leading-5 text-slate-400">
              Ask for layout, CSS, type, colour, or copy changes. The assistant rewrites the publication HTML and the preview updates.
            </p>
          </div>
        )}
        {messages.map((message, index) => (
          <div key={message.id} className={message.role === 'user' ? 'text-right' : 'text-left'}>
            <div className="mb-1 flex items-center gap-2 px-1 text-[10px] text-slate-500">
              <span className={message.role === 'assistant' ? 'font-semibold text-sky-400' : 'ml-auto font-semibold text-slate-400'}>
                {message.role === 'assistant' ? message.modelName || 'Assistant' : 'You'}
              </span>
              <span>{message.timestamp}</span>
              {message.role === 'assistant' && (
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(message.content);
                    setCopiedId(message.id);
                    setTimeout(() => setCopiedId(null), 1500);
                  }}
                  className="text-slate-500 hover:text-slate-200"
                >
                  {copiedId === message.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              )}
            </div>
            <div className={`inline-block max-w-[96%] whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-left leading-5 ${message.role === 'user' ? 'bg-sky-600 text-white' : 'border border-[#232F42] bg-[#141C2A]'}`}>
              {message.content.length > 1800 ? `${message.content.slice(0, 1800)}…` : message.content}
            </div>
            {message.role === 'assistant' && message.nextHtml && message.nextHtml !== message.previousHtml && (
              <div className="mt-1 flex gap-2">
                {!message.applied && (
                  <button type="button" onClick={() => applyMessage(index)} className="rounded-lg bg-sky-600 px-2 py-1 text-[10px] font-semibold text-white">
                    Apply code
                  </button>
                )}
                {message.applied && message.previousHtml && (
                  <button type="button" onClick={() => revertMessage(index)} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 text-[10px] text-slate-300">
                    <Undo2 className="h-3 w-3" />
                    Revert
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {isLoading && <p className="text-slate-400">Writing HTML…</p>}
        {errorMessage && <p className="rounded-xl border border-rose-500/40 bg-rose-950/50 px-3 py-2 text-rose-200">{errorMessage}</p>}
      </div>

      <form
        className="flex gap-2 border-t border-[#232F42] p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <textarea
          value={inputPrompt}
          onChange={(event) => setInputPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          rows={2}
          placeholder="Rewrite the header, change the table CSS, move the metrics…"
          className="flex-1 resize-none rounded-xl border border-[#232F42] bg-[#111726] px-3 py-2 text-xs text-white outline-none focus:border-sky-500"
        />
        <button type="submit" disabled={isLoading || !inputPrompt.trim()} className="self-end rounded-xl bg-sky-600 p-2.5 text-white disabled:opacity-40">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
