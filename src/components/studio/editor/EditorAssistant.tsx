'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Sparkles, Send, Check, ArrowRight, RotateCcw } from 'lucide-react';
import {
  ApiKeysTab,
  getStoredApiKeys,
  type StoredApiKeys,
} from '@/components/studio/ApiKeysTab';
import { EditorDialog } from './EditorDialog';
import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';
import type { SectionInstance } from '@/lib/studio/types';
import type { WebsiteProposal } from '@/lib/studio/editor/websiteProposal';

type Proposal = WebsiteProposal;
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
  onApplyWebsite,
  version,
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
  version: number;
  onApplyWebsite: (proposal: WebsiteProposal) => Promise<boolean>;
  brandKit: any;
  canEdit: boolean;
  onSettings?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [scope, setScope] = useState<'website' | 'page' | 'section'>('website');
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<keyof StoredApiKeys | null>(null);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [connectionVersion, setConnectionVersion] = useState(0);
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
    setError(null);
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
  }, [active, connectionVersion]);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => {
    end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, busy]);
  async function send() {
    if (!prompt.trim() || busy || !canEdit) return;
    if (!provider) {
      setError(
        'Connect your AI provider using Connect AI below, then resend your request. Your website has not changed.',
      );
      return;
    }
    if (scope === 'section' && !section) {
      setError(
        'Choose a section for focused editing, or switch the scope to Entire website.',
      );
      return;
    }
    const text = prompt.trim();
    const base = JSON.stringify(sections);
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
          websiteMode: true,
          scope,
          expectedVersion: version,
          provider,
          modelId: models[provider],
          userApiKey: getStoredApiKeys()[provider] || undefined,
          prompt: text,
          section,
          allSections: sections,
          targetSectionId: scope === 'section' ? section?.id : undefined,
          pageContext: { siteId, pageSlug, siteName },
          brandKit,
          history: messages
            .slice(-8)
            .map((message) => ({ role: message.role, content: message.text })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(
            'Your Bastion session has expired or requires authentication. Please log in or refresh your browser to continue using the assistant.',
          );
        }
        throw new Error(
          data.error || 'The assistant could not complete this request.',
        );
      }
      const proposal = data.parsedChanges as WebsiteProposal | null;
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
      setPrompt(text);
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
  async function apply(message: Message) {
    if (!message.proposal || !canEdit || busy) return;
    const current = message.proposal.pages.find(
      (page) => page.pageSlug === pageSlug,
    );
    if (
      current &&
      JSON.stringify(sections) !== JSON.stringify(current.baseSections)
    ) {
      setError(
        'This page changed after the plan was made. Ask the assistant again so it uses your latest edits.',
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (await onApplyWebsite(message.proposal))
        setMessages((items) =>
          items.map((item) =>
            item.id === message.id ? { ...item, applied: true } : item,
          ),
        );
    } catch (error: any) {
      setError(
        error.message ||
          'The plan could not be applied. Your website has not changed.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="flex min-h-[640px] flex-col text-slate-900 dark:text-slate-100">
      <EditorDialog
        open={connectionOpen}
        title="Connect your AI assistant"
        onClose={() => {
          setConnectionOpen(false);
          setConnectionVersion((value) => value + 1);
        }}
      >
        <p className="mb-4 mt-2 text-xs leading-relaxed text-slate-500">
          Use the provider key already configured in Bastion. This reconnects
          this browser address. Your Bastion team can configure a server
          connection for all client editors.
        </p>
        <div className="max-h-[65vh] overflow-y-auto rounded-xl bg-slate-950 p-4 text-white">
          <ApiKeysTab
            onSaved={() => {
              setConnectionOpen(false);
              setConnectionVersion((value) => value + 1);
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setConnectionOpen(false);
            setConnectionVersion((value) => value + 1);
          }}
          className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          Close connection settings
        </button>
      </EditorDialog>
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
          Ask for anything you want to enhance, fix, or polish. I’ll find the
          relevant pages and propose a website update for you to review.
        </p>
      </div>
      <label className="mt-4 text-xs font-medium text-slate-500">
        Scope
        <select
          aria-label="Assistant scope"
          value={scope}
          disabled={busy}
          onChange={(event) => setScope(event.target.value as typeof scope)}
          className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        >
          <option value="website">
            Entire website · choose targets automatically
          </option>
          <option value="page">Current page</option>
          <option value="section" disabled={!section}>
            Selected section
          </option>
        </select>
      </label>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
        Viewing {pageSlug === 'home' ? 'Home' : pageSlug}. Section requests use
        this page automatically; name another page or ask for website-wide
        changes to work elsewhere.
      </p>
      {scope === 'section' && (
        <label className="mt-3 text-xs text-slate-500">
          Section
          <select
            aria-label="Assistant section"
            value={selectedId || ''}
            onChange={(event) => onSelect(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 p-2 dark:bg-slate-900"
          >
            {sections.map((section) => (
              <option key={section.id} value={section.id}>
                {COMPONENT_REGISTRY[section.componentId]?.name ||
                  section.componentId}
              </option>
            ))}
          </select>
        </label>
      )}
      <div
        role="log"
        aria-label="Website assistant conversation"
        aria-live="polite"
        className="my-4 flex-1 space-y-4"
      >
        {!messages.length && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Start with an idea</p>
            {[
              'Create a consistent dark theme across the website',
              'Review the website and suggest improvements',
              'Make the navigation and calls to action clearer',
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
                <ul className="mt-2 space-y-3 text-xs text-slate-500">
                  {message.proposal.pages.map((page) => (
                    <li key={page.pageSlug}>
                      <strong className="block text-slate-700 dark:text-slate-200">
                        {page.title} · {page.pageSlug}
                      </strong>
                      <ul className="mt-1 list-disc space-y-1 pl-4">
                        {page.changes.map((change, index) => (
                          <li key={index}>{change}</li>
                        ))}
                      </ul>
                      {page.sections
                        .filter(
                          (section) =>
                            typeof section.props.bgImage === 'string' &&
                            section.props.bgImage !==
                              page.baseSections.find(
                                (base) => base.id === section.id,
                              )?.props.bgImage,
                        )
                        .map((section) => {
                          const previous = page.baseSections.find(
                            (base) => base.id === section.id,
                          )?.props.bgImage;
                          return (
                            <div
                              key={section.id}
                              className="mt-3 grid grid-cols-2 gap-2"
                            >
                              <div>
                                <p className="mb-1 text-[10px] font-medium">
                                  Current image
                                </p>
                                {typeof previous === 'string' && previous ? (
                                  <Image
                                    unoptimized
                                    src={previous}
                                    alt="Current hero image"
                                    width={240}
                                    height={140}
                                    className="h-24 w-full rounded-lg object-cover"
                                  />
                                ) : (
                                  <p className="rounded-lg bg-slate-100 p-4 text-xs">
                                    No image
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="mb-1 text-[10px] font-medium">
                                  Proposed image
                                </p>
                                <Image
                                  unoptimized
                                  src={String(section.props.bgImage)}
                                  alt="Proposed hero image"
                                  width={240}
                                  height={140}
                                  className="h-24 w-full rounded-lg object-cover"
                                />
                              </div>
                            </div>
                          );
                        })}
                      <details className="mt-2">
                        <summary className="cursor-pointer text-indigo-600">
                          Review exact changes
                        </summary>
                        <div className="mt-2 space-y-2">
                          {page.sections
                            .filter(
                              (section) =>
                                JSON.stringify(section) !==
                                JSON.stringify(
                                  page.baseSections.find(
                                    (base) => base.id === section.id,
                                  ),
                                ),
                            )
                            .map((section) => (
                              <div
                                key={section.id}
                                className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
                              >
                                <p className="font-semibold">
                                  {COMPONENT_REGISTRY[section.componentId]
                                    ?.name || section.componentId}
                                </p>
                                {Object.entries({
                                  ...section.props,
                                  ...section.styles,
                                })
                                  .filter(
                                    ([key, value]) =>
                                      JSON.stringify(value) !==
                                      JSON.stringify(
                                        (
                                          {
                                            ...page.baseSections.find(
                                              (base) => base.id === section.id,
                                            )?.props,
                                            ...page.baseSections.find(
                                              (base) => base.id === section.id,
                                            )?.styles,
                                          } as any
                                        )[key],
                                      ),
                                  )
                                  .map(([key, value]) => (
                                    <p key={key} className="mt-1 break-words">
                                      <span className="font-medium">
                                        {key}:{' '}
                                      </span>
                                      {typeof value === 'object'
                                        ? JSON.stringify(value)
                                        : String(value)}
                                    </p>
                                  ))}
                                {section.variant !==
                                  page.baseSections.find(
                                    (base) => base.id === section.id,
                                  )?.variant && (
                                  <p>Layout: {section.variant}</p>
                                )}
                                {section.visible !==
                                  page.baseSections.find(
                                    (base) => base.id === section.id,
                                  )?.visible && (
                                  <p>
                                    {section.visible
                                      ? 'Show section'
                                      : 'Hide section'}
                                  </p>
                                )}
                              </div>
                            ))}
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={message.applied || !canEdit || busy}
                  onClick={() => void apply(message)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-xs font-medium text-white disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {message.applied
                    ? 'Saved to drafts'
                    : `Apply plan to ${message.proposal.pages.length} ${message.proposal.pages.length === 1 ? 'page' : 'pages'}`}
                </button>
                {message.applied && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    Saved as drafts. The live website stays unchanged until you
                    publish. Use Version history to restore earlier content.
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
        {busy && (
          <p role="status" className="animate-pulse text-xs text-indigo-600">
            Working on your website…
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
      {configurationLoaded && (
        <div className="mb-3 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-800">
          <div className="flex items-center justify-between gap-3">
            <span>
              {configured
                ? 'AI provider connected'
                : 'Connect AI to start chatting'}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => setConnectionOpen(true)}
              className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white"
            >
              {configured ? 'AI connection' : 'Connect AI'}
            </button>
          </div>
          {!configured && (
            <p className="mt-2">
              Reuse your existing provider key. This preview has a separate
              browser connection.
            </p>
          )}
          {onSettings && (
            <button
              type="button"
              onClick={onSettings}
              className="mt-2 text-xs text-indigo-600"
            >
              Advanced AI settings
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
            disabled={!prompt.trim() || !canEdit || busy}
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
