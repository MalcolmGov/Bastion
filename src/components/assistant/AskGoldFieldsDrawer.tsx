'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { AssistantMessage } from '@/lib/types';
import { DemoAssistantProvider } from '@/lib/adapters/DemoAssistantProvider';

interface AskGoldFieldsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
  initialContext?: string;
}

export const AskGoldFieldsDrawer: React.FC<AskGoldFieldsDrawerProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  initialContext,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    DemoAssistantProvider.getInitialGreeting(),
  ]);
  const [inputText, setInputText] = useState('');
  const [activeContext, setActiveContext] = useState<string | undefined>(initialContext);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialContext) {
      setActiveContext(initialContext);
    }
  }, [initialContext]);

  const handleSend = React.useCallback((textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMessage: AssistantMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    // Simulate clean brief response delay
    setTimeout(() => {
      const response = DemoAssistantProvider.processQuery(query, activeContext);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 450);
  }, [inputText, activeContext]);

  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen, handleSend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Global event listener so buttons anywhere on the site can trigger specific questions
  useEffect(() => {
    const handleCustomTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string; context?: string }>;
      if (customEvent.detail) {
        if (customEvent.detail.context) {
          setActiveContext(customEvent.detail.context);
        }
        if (customEvent.detail.prompt) {
          handleSend(customEvent.detail.prompt);
        }
      }
    };

    window.addEventListener('open-assistant', handleCustomTrigger);
    return () => window.removeEventListener('open-assistant', handleCustomTrigger);
  }, [handleSend]);

  const resetChat = () => {
    setMessages([DemoAssistantProvider.getInitialGreeting()]);
    setActiveContext(undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-dark/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-[500px] h-full bg-white shadow-elevated flex flex-col z-10 border-l border-mist animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 bg-navy text-white flex items-center justify-between border-b border-navy-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gold-mineral/20 border border-gold-mineral/40 flex items-center justify-center text-gold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-wide">Ask Gold Fields</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-gold-dark text-white px-1.5 py-0.2 rounded">
                  Concept AI
                </span>
              </div>
              <p className="text-[11px] text-mist/70">
                Corporate guidance & verified disclosures
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={resetChat}
              className="p-1.5 rounded text-mist/70 hover:text-white hover:bg-navy-surface transition-colors"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-mist/70 hover:text-white hover:bg-navy-surface transition-colors"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Persistent Demo Notice Banner */}
        <div className="bg-gold-light/40 border-b border-gold-mineral/30 px-4 py-2 flex items-center justify-between text-[11px] text-gold-dark font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-dark shrink-0" />
            Demo assistant — source-backed deterministic responses
          </span>
          {activeContext && (
            <button
              onClick={() => setActiveContext(undefined)}
              className="text-[10px] text-ink-muted hover:text-ink underline ml-2 shrink-0"
            >
              Clear context
            </button>
          )}
        </div>

        {/* Active Context Chip */}
        {activeContext && (
          <div className="bg-editorial px-4 py-1.5 border-b border-mist flex items-center justify-between text-xs">
            <span className="text-ink-muted text-[11px] flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-forest inline-block" />
              Active Context: <strong className="text-navy">{activeContext}</strong>
            </span>
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-xl p-3.5 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-navy text-white rounded-br-none'
                    : 'bg-editorial text-ink border border-mist rounded-bl-none shadow-subtle'
                }`}
              >
                {/* Context Badge if attached */}
                {msg.contextBadge && (
                  <div className="mb-2 pb-1.5 border-b border-mist/80 flex items-center gap-1 text-[10px] font-semibold text-gold-dark uppercase tracking-wider">
                    <span>{msg.contextBadge}</span>
                  </div>
                )}

                {/* Message Body */}
                <div className="whitespace-pre-line space-y-1.5 font-sans">
                  {msg.content}
                </div>

                {/* Action Card if provided */}
                {msg.actionCard && (
                  <div className="mt-3 p-3 rounded-lg bg-white border border-mist shadow-subtle">
                    <p className="font-bold text-navy text-xs mb-0.5">
                      {msg.actionCard.title}
                    </p>
                    <p className="text-[11px] text-ink-muted mb-2">
                      {msg.actionCard.description}
                    </p>
                    <a
                      href={msg.actionCard.linkUrl}
                      onClick={onClose}
                      className="inline-flex items-center text-xs font-semibold text-gold-dark hover:text-navy transition-colors"
                    >
                      {msg.actionCard.linkText} →
                    </a>
                  </div>
                )}

                {/* Citations / Sources */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-mist/60 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                      Verified Sources:
                    </p>
                    <div className="space-y-1">
                      {msg.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between text-[11px] text-navy font-medium hover:text-gold-dark transition-colors bg-white px-2 py-1 rounded border border-mist"
                        >
                          <span className="truncate pr-2">
                            {src.title} {src.section ? `(${src.section})` : ''}
                          </span>
                          <ExternalLink className="w-3 h-3 text-ink-muted shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-ink-muted mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-ink-muted bg-editorial p-3 rounded-xl max-w-[120px] border border-mist">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-dark animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-dark animate-pulse delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-gold-dark animate-pulse delay-150" />
              <span className="text-[11px] font-medium ml-1">Analyzing...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Carousel */}
        <div className="p-3 bg-editorial/80 border-t border-mist">
          <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-2">
            Suggested Demonstration Inquiries:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DemoAssistantProvider.getSuggestedPrompts().map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-[11px] text-left px-2.5 py-1 rounded-full bg-white hover:bg-mist text-ink border border-mist transition-colors shadow-subtle truncate max-w-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-mist">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about operations, reports, ESG targets, careers..."
              className="flex-1 bg-mist-light/60 border border-mist rounded-lg px-3 py-2 text-xs text-ink placeholder-ink-subtle focus:outline-none focus:border-gold-mineral"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 rounded-lg bg-navy hover:bg-navy-light text-white disabled:opacity-40 transition-colors"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-[10px] text-center text-ink-muted mt-2">
            Ask Gold Fields answers using verified public disclosures.
          </p>
        </div>
      </div>
    </div>
  );
};
