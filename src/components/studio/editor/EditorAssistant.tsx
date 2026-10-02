'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, Send, Check, ArrowRight, RotateCcw } from 'lucide-react';
import {
  getStoredApiKeys,
  type StoredApiKeys,
} from '@/components/studio/ApiKeysTab';
import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';
import type { SectionInstance } from '@/lib/studio/types';
import { validateAiProposal } from '@/lib/studio/editor/aiProposal';

type Proposal = NonNullable<ReturnType<typeof validateAiProposal>>;
type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  proposal?: Proposal;
  base?: string;
  applied?: boolean;
};
const models: Record<string, string> = {
  openai: 'gpt-4o',
  anthropic: 'claude-sonnet-5',
  gemini: 'gemini-2.0-flash',
  deepseek: 'deepseek-chat',
  qwen: 'qwen-max',
};

export function EditorAssistant({
  active,
  siteId,
  pageSlug,
  siteName,
  sections,
  selectedId,
  onSelect,
  onApply,
  brandKit,
  canEdit,
  onSettings,
}: {
  active: boolean;
  siteId: string;
  pageSlug: string;
  siteName: string;
  sections: SectionInstance[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onApply: (
    props: Record<string, any>,
    styles: Record<string, any>,
    id: string,
  ) => void;
  brandKit: any;
  canEdit: boolean;
  onSettings?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<keyof StoredApiKeys | null>(null);
  const [configured, setConfigured] = useState(false);
  const [configurationLoaded, setConfigurationLoaded] = useState(false);
  const request = useRef<AbortController | null>(null);
  const end = useRef<HTMLDivElement | null>(null);
  const section = sections.find((item) => item.id === selectedId);
  useEffect(() => {
    if (!active) return;
    const keys = getStoredApiKeys();
    const stored = Object.keys(models).find(
      (name) => !!keys[name as keyof StoredApiKeys]?.trim(),
    ) as keyof StoredApiKeys | undefined;
    const controller = new AbortController();
    if (stored) {
      setProvider(stored);
      setConfigured(true);
      setConfigurationLoaded(true);
      return;
    }
    fetch('/api/admin/editor/assistant', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok)
          throw new Error('AI configuration could not be loaded.');
        const data = await response.json();
        setProvider(data.providers?.[0] || null);
        setConfigured(!!data.providers?.length);
        setConfigurationLoaded(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setError(error.message);
          setConfigurationLoaded(true);
        }
      });
    return () => controller.abort();
  }, [active]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, busy]);
  async function send() {
    if (!prompt.trim() || !section || !provider || busy || !canEdit) return;
    const text = prompt.trim();
    const base = JSON.stringify(section);
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 90000);
    setMessages((items) => [
      ...items,
      { id: crypto.randomUUID(), role: 'user', text },
    ]);
    setPrompt('');
    setError(null);
    setBusy(true);
    try {
      const response = await fetch('/api/admin/editor/ai-polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          assistantMode: true,
          provider,
          modelId: models[provider],
          userApiKey: getStoredApiKeys()[provider] || undefined,
          prompt: text,
          section,
          allSections: [section],
          targetSectionId: section.id,
          pageContext: { siteId, pageSlug, siteName },
          brandKit,
          history: messages
            .slice(-8)
            .map((message) => ({ role: message.role, content: message.text })),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || 'The assistant could not complete this request.',
        );
      const proposal = validateAiProposal(data.replyText, section);
      const prose = data.replyText.replace(/```json[\s\S]*?```/gi, '').trim();
      setMessages((items) => [
        ...items,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: prose || proposal?.summary || 'No changes suggested.',
          proposal: proposal || undefined,
          base,
        },
      ]);
    } catch (error: any) {
      if (controller.signal.aborted)
        setError(
          'The request was interrupted. Your page has not changed. Please try again.',
        );
      else setError(error.message);
    } finally {
      clearTimeout(timer);
      setBusy(false);
      request.current = null;
    }
  }
  function apply(message: Message) {
    if (!message.proposal || !canEdit) return;
    const target = sections.find(
      (section) => section.id === message.proposal?.targetSectionId,
    );
    if (!target || JSON.stringify(target) !== message.base) {
      setError(
        'This section changed after the suggestion was made. Ask the assistant again so it uses your latest edits.',
      );
      return;
    }
    onApply(message.proposal.props, message.proposal.styles, target.id);
    setMessages((items) =>
      items.map((item) =>
        item.id === message.id ? { ...item, applied: true } : item,
      ),
    );
    setError(null);
  }
  return (
    <div className="flex min-h-[640px] flex-col text-slate-900 dark:text-slate-100">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-4 dark:border-indigo-900 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-900">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-indigo-600 p-2 text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Your website assistant</h3>
            <p className="text-[11px] text-slate-500">
              Clear ideas. Carefully reviewed updates.
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Describe the update you want. I’ll suggest changes to this section for
          you to review and apply.
        </p>
      </div>
      <label className="mt-4 text-xs font-medium text-slate-500">
        Working on
        <select
          aria-label="Assistant section"
          value={selectedId || ''}
          disabled={busy}
          onChange={(event) => onSelect(event.target.value)}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="" disabled>
            Choose a section
          </option>
          {sections.map((section, index) => (
            <option key={section.id} value={section.id}>
              {index + 1}.{' '}
              {COMPONENT_REGISTRY[section.componentId]?.name ||
                section.componentId}
            </option>
          ))}
        </select>
      </label>
      <div
        role="log"
        aria-label="Website assistant conversation"
        aria-live="polite"
        className="my-4 flex-1 space-y-4"
      >
        {!messages.length && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Try a focused request</p>
            {[
              'Make the heading shorter and clearer',
              'Rewrite this description in our brand voice',
              'Change the main button text to “Contact our team”',
            ].map((example) => (
              <button
                type="button"
                key={example}
                disabled={busy || !canEdit}
                onClick={() => setPrompt(example)}
                className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 p-3 text-left text-xs text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:text-slate-300"
              >
                {example}
                <ArrowRight className="h-3 w-3 shrink-0" />
              </button>
            ))}
          </div>
        )}
        {messages.map((message) => (
          <article
            key={message.id}
            className={`rounded-xl p-3 ${message.role === 'user' ? 'ml-5 bg-indigo-50 dark:bg-indigo-950' : 'border border-slate-200 dark:border-slate-700'}`}
          >
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {message.role === 'user' ? 'You' : 'Bastion assistant'}
            </p>
            <p className="whitespace-pre-wrap text-xs leading-relaxed">
              {message.text}
            </p>
            {message.proposal && (
              <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
                <p className="text-xs font-semibold">
                  {message.proposal.summary}
                </p>
                <ul className="mt-2 space-y-2 text-xs text-slate-500">
                  {Object.entries({
                    ...message.proposal.props,
                    ...message.proposal.styles,
                  }).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1')}:{' '}
                      </span>
                      <span className="whitespace-pre-wrap break-words">
                        {typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value)}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={message.applied || !canEdit || busy}
                  onClick={() => apply(message)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {message.applied
                    ? 'Applied to draft'
                    : 'Apply suggested changes'}
                </button>
                {message.applied && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Use Undo to revert. Save your draft when ready.
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
        {busy && (
          <p role="status" className="animate-pulse text-xs text-indigo-600">
            Preparing a careful suggestion…
          </p>
        )}
        <div ref={end} />
      </div>
      {error && (
        <p
          role="alert"
          className="mb-3 rounded-lg bg-rose-50 p-3 text-xs leading-relaxed text-rose-700 dark:bg-rose-950"
        >
          {error}
        </p>
      )}
      {configurationLoaded && !configured && (
        <div className="mb-3 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800">
          The AI service needs to be configured by your Bastion team.
          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              className="mt-2 block font-medium text-indigo-600"
            >
              Open AI settings
            </button>
          )}
        </div>
      )}
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
      >
        <label htmlFor="assistant-prompt" className="sr-only">
          Describe your website update
        </label>
        <textarea
          id="assistant-prompt"
          value={prompt}
          maxLength={4000}
          disabled={!canEdit || busy}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="What would you like to improve?"
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900"
        />
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setMessages([]);
              setError(null);
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New conversation
          </button>
          <button
            type="submit"
            disabled={
              !prompt.trim() || !section || !configured || !canEdit || busy
            }
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Ask assistant
          </button>
        </div>
      </form>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        Suggestions use your current content. Review factual claims before
        applying. Publishing always stays in your control.
      </p>
    </div>
  );
}
