'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  ShieldCheck,
  ArrowRight,
  FileText,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Edit3,
  Users,
  FolderOpen,
  RotateCcw,
  CalendarCheck,
  Copy,
  Code
} from 'lucide-react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import { useDashboardCustomizer } from '@/components/admin/DashboardCustomizerProvider';
import {
  SuggestedNextStep,
  DEFAULT_CLIENT_SUGGESTED_STEPS,
  DEFAULT_AGENCY_SUGGESTED_STEPS
} from '@/lib/copilot/cmsKnowledge';

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  speechText?: string;
  timestamp: string;
  toolsExecuted?: Array<{
    toolName: string;
    summaryText: string;
    result?: any;
  }>;
  actionCards?: Array<{
    type: string;
    title: string;
    description: string;
    linkUrl: string;
    linkText: string;
  }>;
  action?: {
    type: string;
    navigationUrl?: string;
    label?: string;
    data?: any;
  };
}

function cleanMarkdownForSpeech(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`([^`]+)`/g, '$1')     // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // markdown links
    .replace(/[*_#~]/g, '')         // bold/italic/headings
    .replace(/•/g, ', ')
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function FormattedInlineText({ text }: { text: string }) {
  const tokens: React.ReactNode[] = [];
  const tokenRegex = /(\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIdx = 0;
  let match;
  let key = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      tokens.push(<span key={key++}>{text.slice(lastIdx, match.index)}</span>);
    }
    if (match[2]) {
      tokens.push(<strong key={key++} className="font-semibold text-slate-900">{match[2]}</strong>);
    } else if (match[3]) {
      tokens.push(
        <code key={key++} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-amber-700 font-medium">
          {match[3]}
        </code>
      );
    } else if (match[4] && match[5]) {
      tokens.push(
        <a key={key++} href={match[5]} target="_blank" rel="noreferrer" className="text-indigo-600 underline font-medium hover:text-indigo-700">
          {match[4]}
        </a>
      );
    }
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    tokens.push(<span key={key++}>{text.slice(lastIdx)}</span>);
  }

  return <>{tokens}</>;
}

function MessageContent({ content }: { content: string }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = (code: string, idx: number) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const codeBlockRegex = /```([a-zA-Z0-9_\-]*)\n([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'code'; language?: string; code?: string; text?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', text: content.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      language: match[1] || 'code',
      code: match[2].trim()
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', text: content.slice(lastIndex) });
  }

  return (
    <div className="space-y-2 text-xs leading-relaxed">
      {parts.map((part, idx) => {
        if (part.type === 'code' && part.code) {
          const isCopied = copiedIndex === idx;
          const langDisplay = part.language ? part.language.toUpperCase() : 'CODE';
          return (
            <div key={idx} className="my-2.5 overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-3 py-1.5 text-[11px] font-mono">
                <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ⚡ {langDisplay} COMPONENT
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(part.code!, idx)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-95 cursor-pointer shadow-xs"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="max-h-80 overflow-x-auto p-3 text-[11px] font-mono leading-relaxed text-emerald-300/90 selection:bg-amber-500/30">
                <code>{part.code}</code>
              </pre>
            </div>
          );
        }

        const lines = (part.text || '').split('\n');
        return (
          <div key={idx} className="space-y-1">
            {lines.map((line, lIdx) => {
              if (line.startsWith('### ')) {
                return (
                  <div key={lIdx} className="font-bold text-slate-950 text-sm mt-2 mb-0.5">
                    <FormattedInlineText text={line.slice(4)} />
                  </div>
                );
              }
              if (line.startsWith('• ') || line.startsWith('- ')) {
                return (
                  <div key={lIdx} className="flex items-start gap-1.5 text-slate-700 pl-1">
                    <span className="text-indigo-600 font-bold select-none">•</span>
                    <div><FormattedInlineText text={line.slice(2)} /></div>
                  </div>
                );
              }
              if (/^[0-9]+\.\s/.test(line)) {
                const numMatch = line.match(/^([0-9]+\.)\s(.*)/);
                return (
                  <div key={lIdx} className="flex items-start gap-1.5 text-slate-700 pl-1">
                    <span className="text-indigo-600 font-bold select-none">{numMatch?.[1]}</span>
                    <div><FormattedInlineText text={numMatch?.[2] || ''} /></div>
                  </div>
                );
              }
              if (line.trim() === '') {
                return <div key={lIdx} className="h-1" />;
              }
              return (
                <div key={lIdx} className="text-slate-700">
                  <FormattedInlineText text={line} />
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function ZaraVoiceCopilot() {
  const router = useRouter();
  const { user } = useAdminAuth();
  const { activeClient, portalViewMode } = useStudioWorkspace();
  const { primaryColor, accentColor } = useDashboardCustomizer();

  const isClient = portalViewMode === 'client';
  const clientName = activeClient?.name || 'Gold Fields Limited';
  const rawFirstName = user?.name ? user.name.trim().split(' ')[0] : 'Malcolm';
  const userFirstName = (rawFirstName === 'M' || rawFirstName === 'M.' || !rawFirstName) ? 'Malcolm' : rawFirstName;

  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [heardPreview, setHeardPreview] = useState('');
  const [textInput, setTextInput] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  // Synchronized Mutable Refs for race-condition prevention & turn-taking
  const wantsToListenRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const isStartingRef = useRef<boolean>(false);
  const isAbortingRef = useRef<boolean>(false);
  const speechSessionRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTranscriptRef = useRef<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Keep refs in sync with state
  useEffect(() => { wantsToListenRef.current = isVoiceActive; }, [isVoiceActive]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);
  useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  const initialWelcomeText = isClient
    ? `Hello ${userFirstName}! I'm **Zara**, your autonomous AI copilot for **${clientName}**.\n\nI can assist you across our full enterprise suite:\n• **AI Website & Component Code Generation** (HTML5, Tailwind, React)\n• **PDF-to-HTML Portal Ingestion** (Annual Reports & ESG documents)\n• **Statutory Compliance Audits** (JSE Listings § 8.2 & King IV)\n• **Live SRE Edge Health** (Multi-PoP latency & 99.98% SLA)\n• **SENS Regulatory Disclosures** & **Corporate Mining Intelligence**\n\nWhat would you like to work on?`
    : `Hello ${userFirstName}! **Zara AI Executive Copilot** is active for **Bastion CMS & ${clientName}**.\n\nI provide autonomous enterprise intelligence across 8 core pillars:\n• ⚡ **AI Website Copilot & Code Generation** (HTML5, Tailwind, React)\n• 📄 **Comprehensive PDF-to-HTML Ingestion** (Annual Reports to interactive portals)\n• 🛡️ **Statutory Compliance Guardian** (JSE Listings § 8.2 & King IV)\n• 🌐 **Live SRE Fleet Health & Telemetry** (Edge PoP latency & 99.98% SLA)\n• 📊 **Price-Sensitive SENS Announcements** (JSE filings & dividend declarations)\n• 🏛️ **Corporate Disclosures & Mining Intelligence** (Mines, AISC, carbon targets)\n• 🎨 **Brand DNA & Token Extraction** (Live URL palettes & typography)\n• 🚀 **Multi-Tenant Release & Publishing** (Approvals queue & edge deployment)\n\nWhat command would you like me to run?`;

  const initialSpeechGreeting = isClient
    ? `Hello ${userFirstName}. I am Zara, your autonomous AI copilot for ${clientName}. I can generate page code, convert PDF reports, run statutory audits, or check edge health. What would you like to work on?`
    : `Hello ${userFirstName}! Zara AI Executive Copilot is active for Bastion CMS and ${clientName}. I can generate website code, convert PDF annual reports, audit statutory compliance, or monitor edge fleet health. What command would you like me to run?`;

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: initialWelcomeText,
      speechText: initialSpeechGreeting,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [suggestedSteps, setSuggestedSteps] = useState<SuggestedNextStep[]>(
    isClient ? [
      { label: 'Code Hero Section', query: 'Zara, generate an executive hero section with Tailwind CSS.', icon: 'sparkles' },
      { label: 'Convert PDF Report', query: 'Zara, convert the annual report PDF into an HTML portal.', icon: 'file' },
      { label: 'Run Compliance Audit', query: 'Zara, run a compliance audit on page copy.', icon: 'shield' },
      { label: 'Check Fleet Telemetry', query: 'Zara, check multi-tenant SRE uptime and edge latency.', icon: 'check' }
    ] : [
      { label: 'Code Hero Section', query: 'Zara, generate an executive hero section with Tailwind CSS.', icon: 'sparkles' },
      { label: 'Convert PDF Report', query: 'Zara, convert the annual report PDF into an HTML portal.', icon: 'file' },
      { label: 'Run Compliance Audit', query: 'Zara, run a compliance audit on page copy.', icon: 'shield' },
      { label: 'Edge Fleet Health', query: 'Zara, check multi-tenant SRE uptime and edge latency.', icon: 'check' },
      { label: 'JSE SENS Announcements', query: 'Zara, query recent JSE SENS regulatory announcements.', icon: 'file' },
      { label: 'Brand DNA Extraction', query: 'Zara, extract the brand design tokens for Gold Fields.', icon: 'sparkles' },
      { label: 'Publishing Queue', query: 'Zara, check staged releases and deployment readiness.', icon: 'check' }
    ]
  );

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, heardPreview]);

  // Check speech recognition support on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      setIsSpeechSupported(!!SR);
    }
  }, []);




  // Forward declaration refs to break cyclic dependencies
  const startListeningRef = useRef<() => void>(() => {});
  const handleSendMessageRef = useRef<(text?: string) => Promise<void>>(() => Promise.resolve());

  // ─────────────────────────────────────────────────────────
  // 1. ELEVENLABS v4 STUDIO AUDIO ENGINE (PROMISE-DRIVEN)
  // ─────────────────────────────────────────────────────────
  const cleanupRecognition = useCallback(() => {
    isAbortingRef.current = true;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        const r = recognitionRef.current;
        r.onstart = null;
        r.onaudiostart = null;
        r.onsoundstart = null;
        r.onspeechstart = null;
        r.onresult = null;
        r.onerror = null;
        r.onend = null;
        r.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    isListeningRef.current = false;
    isStartingRef.current = false;
  }, []);

  const stopAudio = useCallback(() => {
    speechSessionRef.current++;
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlayingAudioId(null);
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setVoiceStatus(wantsToListenRef.current ? 'listening' : 'idle');
  }, []);

  const speakText = useCallback(async (rawText: string, msgId: string = 'general'): Promise<boolean> => {
    if (!rawText.trim()) return false;

    // Toggle off if currently playing
    if (playingAudioId === msgId) {
      stopAudio();
      if (wantsToListenRef.current) {
        startListeningRef.current();
      }
      return true;
    }

    stopAudio();

    // Cleanly pause STT during Zara's turn to prevent speaker acoustic loop
    cleanupRecognition();

    const session = ++speechSessionRef.current;
    setPlayingAudioId(msgId);
    setIsSpeaking(true);
    isSpeakingRef.current = true;
    setVoiceStatus('speaking');

    const cleanSpeech = cleanMarkdownForSpeech(rawText);

    const onPlaybackComplete = () => {
      if (speechSessionRef.current !== session) return;
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
      setPlayingAudioId(null);
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setVoiceStatus(wantsToListenRef.current ? 'listening' : 'idle');

      // Seamlessly restart STT for the next conversational turn
      if (wantsToListenRef.current && !isProcessingRef.current) {
        setTimeout(() => {
          if (wantsToListenRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
            startListeningRef.current();
          }
        }, 200);
      }
    };

    // Safety timeout: calculated duration + 2s buffer to guarantee STT resume even if browser onended stalls
    const words = cleanSpeech.split(/\s+/).length;
    const estDurationMs = Math.max(2500, (words / 2.6) * 1000 + 2000);
    safetyTimeoutRef.current = setTimeout(() => {
      console.log('[Zara Voice] Safety timeout reached, triggering playback completion.');
      onPlaybackComplete();
    }, estDurationMs);

    // 1. ElevenLabs Neural Studio Streaming (/api/zara/speak)
    try {
      const res = await fetch('/api/zara/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanSpeech })
      });

      if (res.ok) {
        if (speechSessionRef.current !== session) return true;
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audioRef.current = audio;

        return new Promise<boolean>((resolve) => {
          audio.onplay = () => {
            if (speechSessionRef.current !== session) {
              audio.pause();
              URL.revokeObjectURL(url);
              resolve(true);
              return;
            }
            setIsSpeaking(true);
            isSpeakingRef.current = true;
            setVoiceStatus('speaking');
          };

          audio.onended = () => {
            URL.revokeObjectURL(url);
            if (audioRef.current === audio) audioRef.current = null;
            onPlaybackComplete();
            resolve(true);
          };

          audio.onerror = () => {
            URL.revokeObjectURL(url);
            if (audioRef.current === audio) audioRef.current = null;
            onPlaybackComplete();
            resolve(false);
          };

          audio.play().catch((err) => {
            console.warn('[Zara Voice] Audio play restriction:', err);
            onPlaybackComplete();
            resolve(false);
          });
        });
      }
    } catch (err) {
      console.warn('[Zara Voice] ElevenLabs fetch failed, trying browser TTS:', err);
    }

    // 2. Browser SpeechSynthesis Fallback
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      return new Promise<boolean>((resolve) => {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(cleanSpeech);
        utter.rate = 1.02;
        utter.pitch = 1.0;
        utter.onstart = () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          setVoiceStatus('speaking');
        };
        utter.onend = () => {
          onPlaybackComplete();
          resolve(true);
        };
        utter.onerror = () => {
          onPlaybackComplete();
          resolve(false);
        };
        window.speechSynthesis.speak(utter);
      });
    }

    onPlaybackComplete();
    return false;
  }, [playingAudioId, stopAudio, cleanupRecognition]);

  // ─────────────────────────────────────────────────────────
  // 2. STT (SPEECH-TO-TEXT ENGINE WITH WATCHDOG & AUTO-RETRY)
  // ─────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Do NOT listen while Zara is actively speaking, executing tools, or already starting
    if (isSpeakingRef.current || isProcessingRef.current || isStartingRef.current) {
      console.debug('[Zara STT] Deferred: system currently speaking, processing, or starting.');
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setIsSpeechSupported(false);
      setMicError('Speech recognition is not supported in this browser. Please use Chrome or Edge for voice input.');
      return;
    }

    cleanupRecognition();
    isAbortingRef.current = false;
    isStartingRef.current = true;
    wantsToListenRef.current = true;
    setMicError(null);

    try {
      const recog = new SR();
      recognitionRef.current = recog;
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onstart = () => {
        isStartingRef.current = false;
        setIsListening(true);
        isListeningRef.current = true;
        pendingTranscriptRef.current = '';
        if (!isSpeakingRef.current) setVoiceStatus('listening');
      };

      recog.onaudiostart = () => {
        setIsListening(true);
        isListeningRef.current = true;
      };

      recog.onresult = (e: any) => {
        if (isSpeakingRef.current || isProcessingRef.current) return;

        let fullFinal = '';
        let interim = '';
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            fullFinal += e.results[i][0].transcript + ' ';
          } else {
            interim += e.results[i][0].transcript;
          }
        }

        const transcript = (fullFinal + interim).trim();
        if (!transcript) return;

        pendingTranscriptRef.current = transcript;
        setHeardPreview(transcript);
        setTextInput(transcript); // Live synchronization into input box

        // Auto submit when speaker pauses (1100ms silence)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null;
          const query = pendingTranscriptRef.current.trim();
          if (query.length > 1 && !isSpeakingRef.current && !isProcessingRef.current) {
            handleSendMessageRef.current(query);
          }
        }, 1100);
      };

      recog.onerror = (e: any) => {
        isStartingRef.current = false;
        if (isAbortingRef.current || e.error === 'aborted' || e.error === 'no-speech') return;
        console.warn('[Zara STT] Recognition error:', e.error);

        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setMicError('Microphone access is blocked in your browser. Click the lock/settings icon in the address bar and set Microphone to "Allow".');
          wantsToListenRef.current = false;
          setIsVoiceActive(false);
          setIsListening(false);
          isListeningRef.current = false;
          setVoiceStatus('idle');
        } else if (e.error === 'network') {
          setMicError('Speech recognition network glitch. Retrying...');
        }
      };

      recog.onend = () => {
        isStartingRef.current = false;
        if (isAbortingRef.current || recognitionRef.current !== recog) {
          return;
        }

        setIsListening(false);
        isListeningRef.current = false;

        const pending = pendingTranscriptRef.current.trim();
        if (pending && !isSpeakingRef.current && !isProcessingRef.current) {
          handleSendMessageRef.current(pending);
          return;
        }

        // Auto restart after natural browser timeout
        if (wantsToListenRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
          restartTimerRef.current = setTimeout(() => {
            if (wantsToListenRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
              startListeningRef.current();
            }
          }, 350);
        } else if (!isSpeakingRef.current) {
          setVoiceStatus('idle');
        }
      };

      recog.start();
    } catch (err: any) {
      isStartingRef.current = false;
      console.warn('[Zara STT] Failed to start:', err);
    }
  }, [cleanupRecognition]);

  startListeningRef.current = startListening;

  const stopListening = useCallback(() => {
    wantsToListenRef.current = false;
    cleanupRecognition();
    pendingTranscriptRef.current = '';
    setHeardPreview('');
    if (!isSpeakingRef.current) setVoiceStatus('idle');
  }, [cleanupRecognition]);

  // Continuous watchdog: ensure listening stays alive when voice mode is on and Zara is idle
  useEffect(() => {
    if (!isVoiceActive) return;
    const interval = setInterval(() => {
      if (
        wantsToListenRef.current &&
        !isSpeakingRef.current &&
        !isProcessingRef.current &&
        !isListeningRef.current &&
        !isStartingRef.current
      ) {
        console.debug('[Zara Voice Watchdog] Restarting idle listening session...');
        startListeningRef.current();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [isVoiceActive]);

  // Voice Mode Toggle (with crisp greeting and seamless turn transition)
  const toggleVoiceMode = useCallback(async () => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      wantsToListenRef.current = false;
      stopListening();
      stopAudio();
      setVoiceStatus('idle');
    } else {
      setIsVoiceActive(true);
      wantsToListenRef.current = true;
      setMicError(null);

      // Pre-check microphone access via getUserMedia to trigger native browser prompt if needed
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          testStream.getTracks().forEach(t => t.stop()); // Free hardware immediately
        } catch (err: any) {
          console.warn('[Zara Voice] Mic permission probe failed:', err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setMicError('Microphone blocked. Please click the lock or settings icon in your browser address bar and set Microphone to "Allow".');
            setIsVoiceActive(false);
            wantsToListenRef.current = false;
            return;
          }
        }
      }

      // 1. Play crisp, natural greeting prompt.
      // onPlaybackComplete inside speakText will automatically & seamlessly invoke startListeningRef.current()!
      await speakText(
        `Hello ${userFirstName}! I'm listening.`,
        'greeting_prompt'
      );
    }
  }, [isVoiceActive, stopListening, stopAudio, speakText, userFirstName]);

  // Cleanup on unmount or drawer close
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopAudio();
    }
  }, [isOpen, stopListening, stopAudio]);

  // External trigger listeners (Toolbar, Header, and Voice Coding triggers)
  useEffect(() => {
    const handleOpen = async (e?: any) => {
      setIsOpen(true);
      if (e?.detail?.openVoice) {
        setIsVoiceActive(true);
        wantsToListenRef.current = true;
        setMicError(null);
        await speakText(
          `Hello ${userFirstName}! Voice coding active. What component would you like me to build and apply to your page?`,
          'editor_voice_prompt'
        );
      }
    };

    const handleClose = () => {
      setIsOpen(false);
      setIsVoiceActive(false);
      wantsToListenRef.current = false;
      stopListening();
      stopAudio();
      setVoiceStatus('idle');
    };

    window.addEventListener('open-bastion-copilot', handleOpen);
    window.addEventListener('open-ask-ai', handleOpen);
    window.addEventListener('open-zara-copilot', handleOpen);
    window.addEventListener('close-zara-copilot', handleClose);

    return () => {
      window.removeEventListener('open-bastion-copilot', handleOpen);
      window.removeEventListener('open-ask-ai', handleOpen);
      window.removeEventListener('open-zara-copilot', handleOpen);
      window.removeEventListener('close-zara-copilot', handleClose);
    };
  }, [userFirstName, speakText, stopListening, stopAudio]);

  // ─────────────────────────────────────────────────────────
  // 3. SEND MESSAGE & DISPATCH CMS TOOLS
  // ─────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (contentToSend?: string) => {
    const text = (contentToSend || textInput).trim();
    if (!text || isProcessingRef.current) return;

    setTextInput('');
    setHeardPreview('');
    pendingTranscriptRef.current = '';
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    // Cleanly stop STT while processing tool execution
    cleanupRecognition();
    stopAudio();

    const userMsg: CopilotMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    isProcessingRef.current = true;
    setVoiceStatus('processing');

    try {
      const res = await fetch('/api/admin/zara/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          clientContext: clientName,
          clientId: activeClient?.id || 'client_goldfields',
          portalViewMode,
          userName: userFirstName,
          userRole: user?.role || 'platform_admin',
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);

      const data = await res.json();
      const reply = data.reply || data.speechText || 'Action executed successfully in platform.';
      const speechToPlay = data.speechText || reply;

      const assistantMsg: CopilotMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: reply,
        speechText: speechToPlay,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action,
        toolsExecuted: data.toolsExecuted || [],
        actionCards: data.actionCards || []
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);
      isProcessingRef.current = false;

      // Real-Time Voice Coding: Auto-dispatch to canvas if code generated and on editor or requested
      const codeTool = (data.toolsExecuted || []).find((t: any) => t.toolName === 'generateWebsiteCode');
      if (codeTool && codeTool.result && typeof window !== 'undefined') {
        const lowerText = text.toLowerCase();
        const isOnEditor = window.location.pathname.includes('/admin/editor');
        const wantsApply = lowerText.includes('canvas') || lowerText.includes('page') || lowerText.includes('apply') || lowerText.includes('add') || lowerText.includes('insert');
        if (isOnEditor || wantsApply) {
          window.dispatchEvent(new CustomEvent('zara-apply-section-to-canvas', {
            detail: {
              componentType: codeTool.result.componentType || 'hero',
              title: codeTool.result.title,
              code: codeTool.result.code,
              html: codeTool.result.code
            }
          }));
        }
      }

      // Real-Time Canvas Manipulation: Auto-dispatch to editor canvas
      const canvasTool = (data.toolsExecuted || []).find((t: any) => t.toolName === 'canvasManipulate');
      if (canvasTool && canvasTool.result && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zara-canvas-action', {
          detail: canvasTool.result
        }));
      }

      // Real-Time Compliance Remediation: Auto-dispatch to editor canvas
      const remTool = (data.toolsExecuted || []).find((t: any) => t.toolName === 'remediateCanvasCompliance');
      if (remTool && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zara-canvas-action', {
          detail: { action: 'fix-compliance' }
        }));
      }

      // Real-Time Compliance Audit: Trigger inspection on live editor
      const auditTool = (data.toolsExecuted || []).find((t: any) => t.toolName === 'runComplianceAudit');
      if (auditTool && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('zara-canvas-action', {
          detail: { action: 'audit-compliance' }
        }));
      }

      if (data.suggestedNextSteps && Array.isArray(data.suggestedNextSteps) && data.suggestedNextSteps.length > 0) {
        setSuggestedSteps(data.suggestedNextSteps);
      }

      if (data.action?.type === 'navigate' && data.action.navigationUrl) {
        setTimeout(() => {
          setIsOpen(false);
          router.push(data.action.navigationUrl);
        }, 1400);
      }

      // Automatically speak the response if voice mode is on
      if (wantsToListenRef.current) {
        await speakText(speechToPlay, assistantMsg.id);
        // speakText will auto-start listening when done
      } else {
        setVoiceStatus('idle');
      }

    } catch (err: any) {
      console.warn('Zara Agent API error, trying fallback:', err);
      try {
        const fbRes = await fetch('/api/admin/voice-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            clientContext: clientName,
            portalViewMode,
            userName: userFirstName,
            userRole: user?.role || 'platform_admin',
            history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
          })
        });

        if (fbRes.ok) {
          const fbData = await fbRes.json();
          const assistantMsg: CopilotMessage = {
            id: `msg_a_${Date.now()}`,
            role: 'assistant',
            content: fbData.reply || fbData.speechText,
            speechText: fbData.speechText || fbData.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: fbData.action
          };
          setMessages(prev => [...prev, assistantMsg]);
          setIsProcessing(false);
          isProcessingRef.current = false;

          if (wantsToListenRef.current) {
            await speakText(assistantMsg.speechText || assistantMsg.content, assistantMsg.id);
          } else {
            setVoiceStatus('idle');
          }
          return;
        }
      } catch {}

      const fallbackMsg: CopilotMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: `I'm standing by to help with ${clientName}. You can run a statutory compliance audit, check edge fleet telemetry, or inspect brand design tokens.`,
        speechText: `I am standing by to help with ${clientName}. What command would you like me to run?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setIsProcessing(false);
      isProcessingRef.current = false;

      if (wantsToListenRef.current) {
        await speakText(fallbackMsg.speechText || fallbackMsg.content, fallbackMsg.id);
      } else {
        setVoiceStatus('idle');
      }
    }
  }, [textInput, stopAudio, cleanupRecognition, clientName, activeClient?.id, portalViewMode, userFirstName, user?.role, messages, speakText, router]);

  handleSendMessageRef.current = handleSendMessage;

  // Clear chat conversation
  const handleClearChat = useCallback(() => {
    stopAudio();
    setTextInput('');
    setHeardPreview('');
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: initialWelcomeText,
        speechText: initialSpeechGreeting,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSuggestedSteps(isClient ? DEFAULT_CLIENT_SUGGESTED_STEPS : [
      { label: 'Run Compliance Audit', query: 'Zara, run a compliance audit on page copy.', icon: 'shield' },
      { label: 'Edge Fleet Health', query: 'Zara, check multi-tenant SRE uptime and edge latency.', icon: 'check' },
      { label: 'JSE SENS Announcements', query: 'Zara, query recent JSE SENS regulatory announcements.', icon: 'file' },
      { label: 'Brand DNA Extraction', query: 'Zara, extract the brand design tokens for Gold Fields.', icon: 'sparkles' }
    ]);
  }, [stopAudio, initialWelcomeText, initialSpeechGreeting, isClient]);

  function renderStepIcon(icon?: string) {
    switch (icon) {
      case 'edit': return <Edit3 className="w-3 h-3 text-amber-500 shrink-0" />;
      case 'sparkles': return <Sparkles className="w-3 h-3 text-purple-500 shrink-0" />;
      case 'users': return <Users className="w-3 h-3 text-indigo-500 shrink-0" />;
      case 'check': return <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />;
      case 'folder': return <FolderOpen className="w-3 h-3 text-blue-500 shrink-0" />;
      case 'book': return <BookOpen className="w-3 h-3 text-teal-500 shrink-0" />;
      case 'shield': return <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />;
      case 'file': return <FileText className="w-3 h-3 text-sky-500 shrink-0" />;
      case 'calendar': return <CalendarCheck className="w-3 h-3 text-amber-500 shrink-0" />;
      default: return <Sparkles className="w-3 h-3 text-slate-400 shrink-0" />;
    }
  }

  return (
    <>
      {/* ───────────────────────────────────────────────────────── */}
      {/* FLOATING TRIGGER BUTTON                                   */}
      {/* ───────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 h-12 px-4 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:from-slate-800 hover:to-indigo-900 text-white border border-indigo-500/40 shadow-xl flex items-center gap-2.5 transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer"
        title="Zara AI Executive Copilot"
        aria-label="Zara AI Executive Copilot"
      >
        <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300/30 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold tracking-wide">Zara AI</span>
        
        {/* Pulsing Status Dot */}
        <span
          className={`w-2 h-2 rounded-full ${
            isSpeaking
              ? 'bg-purple-400 animate-ping'
              : isListening
              ? 'bg-emerald-400 animate-pulse'
              : 'bg-emerald-400'
          }`}
        />
      </button>

      {/* ───────────────────────────────────────────────────────── */}
      {/* CLEAN, WHITE, PREMIUM ZARA COPILOT DRAWER                 */}
      {/* ───────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[440px] max-w-[calc(100vw-2rem)] h-[620px] bg-white border border-slate-200/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] ring-1 ring-slate-900/5 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-indigo-900 text-white flex items-center justify-center shadow-md relative shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300" />
                {isSpeaking && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-white animate-pulse" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 truncate">
                  <span>Zara AI</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 truncate">
                    Executive Copilot
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                  {/* Dynamic Voice Status Icon */}
                  {voiceStatus === 'listening' ? (
                    <div className="flex items-center gap-0.5 mr-0.5">
                      <span className="w-1 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="w-1 h-3.5 rounded-full bg-emerald-500 animate-pulse delay-75" />
                      <span className="w-1 h-2 rounded-full bg-emerald-500 animate-pulse delay-150" />
                    </div>
                  ) : (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        voiceStatus === 'speaking'
                          ? 'bg-purple-500 animate-pulse'
                          : voiceStatus === 'processing'
                          ? 'bg-indigo-500 animate-bounce'
                          : 'bg-emerald-500'
                      }`}
                    />
                  )}
                  <span className="truncate">
                    {voiceStatus === 'speaking'
                      ? 'Zara Speaking (ElevenLabs v4)…'
                      : voiceStatus === 'listening'
                      ? 'Listening for your command…'
                      : voiceStatus === 'processing'
                      ? 'Executing CMS Tools…'
                      : isVoiceActive
                      ? 'ElevenLabs Neural Ready'
                      : 'Autonomous Agent Ready'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Clear Chat Button */}
              <button
                type="button"
                onClick={handleClearChat}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/80 border border-slate-200/80 transition-all cursor-pointer group"
                title="Clear conversation and reset"
                aria-label="Clear chat"
              >
                <RotateCcw className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform duration-300" />
                <span>Clear</span>
              </button>

              {/* Voice Mode Toggle Switch */}
              <button
                type="button"
                onClick={toggleVoiceMode}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isVoiceActive
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-400/40'
                    : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/80 hover:text-slate-800'
                }`}
                title={isVoiceActive ? 'Voice mode active — click to mute' : 'Click to enable voice conversation'}
              >
                {isVoiceActive ? (
                  <>
                    <Mic className="w-3.5 h-3.5 text-white animate-pulse" />
                    <span>Voice ON</span>
                  </>
                ) : (
                  <>
                    <MicOff className="w-3.5 h-3.5 text-slate-400" />
                    <span>Voice OFF</span>
                  </>
                )}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close Assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Microphone Permission Warning / Notice */}
          {micError && (
            <div className="px-3.5 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="leading-snug">{micError}</span>
              </div>
              <button
                type="button"
                onClick={() => setMicError(null)}
                className="text-amber-700 hover:text-amber-900 font-bold px-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3.5 text-xs bg-[#FBFBFC] custom-scrollbar">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 leading-relaxed text-[13px] shadow-xs select-text ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  {/* Assistant Header with Quick Listen Audio Button */}
                  {m.role === 'assistant' && (
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-slate-900">Zara AI</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          Copilot
                        </span>
                      </div>
                      
                      {/* Audio Playback Button */}
                      <button
                        type="button"
                        onClick={() => speakText(m.speechText || m.content, m.id)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition cursor-pointer ${
                          playingAudioId === m.id
                            ? 'bg-purple-100 text-purple-700 border border-purple-300 ring-1 ring-purple-400/40 animate-pulse'
                            : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80'
                        }`}
                        title={playingAudioId === m.id ? 'Stop audio' : 'Listen with Zara (ElevenLabs v4 Studio)'}
                      >
                        {playingAudioId === m.id ? (
                          <>
                            <VolumeX className="w-3 h-3 text-purple-600" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3 text-indigo-600" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <MessageContent content={m.content} />

                  {/* Welcome Message Callout for Spoken Greeting */}
                  {m.id === 'welcome' && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">Hear spoken greeting:</span>
                      <button
                        type="button"
                        onClick={() => speakText(m.speechText || m.content, 'welcome')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 ${
                          playingAudioId === 'welcome'
                            ? 'bg-purple-600 text-white animate-pulse'
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80'
                        }`}
                      >
                        {playingAudioId === 'welcome' ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-white" />
                            <span>Stop Greeting</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>🔊 Listen to Greeting (ElevenLabs)</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Render Executed CMS Tools Badges */}
                  {m.toolsExecuted && m.toolsExecuted.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                      {m.toolsExecuted.map((t, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50/90 text-indigo-900 border border-indigo-100 text-[11px] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                          <span className="font-mono text-[10px] text-indigo-700">⚡ {t.toolName}</span>
                          <span className="text-slate-400">•</span>
                          <span className="truncate">{t.summaryText}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Action Cards */}
                  {m.actionCards && m.actionCards.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-2">
                      {m.actionCards.map((c, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                          <div className="font-bold text-xs text-slate-900">{c.title}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{c.description}</div>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Link
                              href={c.linkUrl}
                              onClick={() => setIsOpen(false)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                            >
                              <span>{c.linkText || 'Open'}</span>
                              <ArrowRight className="w-3 h-3" />
                            </Link>
                            {c.type === 'code' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const codeTool = m.toolsExecuted?.find((t: any) => t.toolName === 'generateWebsiteCode');
                                  window.dispatchEvent(new CustomEvent('zara-apply-section-to-canvas', {
                                    detail: {
                                      componentType: codeTool?.result?.componentType || 'hero',
                                      title: codeTool?.result?.title || c.title,
                                      code: codeTool?.result?.code,
                                      html: codeTool?.result?.code
                                    }
                                  }));
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer active:scale-95"
                              >
                                <span>⚡ Apply to Canvas</span>
                                <CheckCircle2 className="w-3 h-3 text-slate-950" />
                              </button>
                            )}
                            {c.type === 'compliance' && (
                              <button
                                type="button"
                                onClick={() => {
                                  window.dispatchEvent(new CustomEvent('zara-canvas-action', {
                                    detail: { action: 'fix-compliance' }
                                  }));
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition cursor-pointer active:scale-95"
                              >
                                <span>🛡️ Auto-Remediate Violations</span>
                                <ShieldCheck className="w-3 h-3 text-white" />
                              </button>
                            )}
                            {c.type === 'canvas_action' && (
                              <button
                                type="button"
                                onClick={() => {
                                  window.dispatchEvent(new CustomEvent('zara-canvas-action', {
                                    detail: { action: 'undo' }
                                  }));
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs shadow-xs transition cursor-pointer active:scale-95"
                              >
                                <span>↩️ Undo Change</span>
                                <RotateCcw className="w-3 h-3 text-slate-700" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render Execution Action Quick Link */}
                  {m.action && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      {m.action.navigationUrl && (
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <span className="text-[11px] text-slate-500 font-medium">Quick link:</span>
                          <Link
                            href={m.action.navigationUrl}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer active:scale-95 group"
                          >
                            <span>{m.action.label || 'Open Section'}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 px-1 mt-1 font-medium">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {/* Live Real-time Hearing Indicator */}
            {heardPreview && (
              <div className="flex flex-col items-end animate-in fade-in">
                <div className="max-w-[85%] rounded-2xl rounded-br-xs px-3.5 py-2.5 bg-emerald-50 text-emerald-900 border border-emerald-300 italic animate-pulse text-xs shadow-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span>🎙️ Zara is hearing: &quot;{heardPreview}&quot;…</span>
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-slate-500 italic text-[11px] p-2 bg-white rounded-xl border border-slate-100 shadow-2xs w-fit">
                <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping" />
                <span>Zara AI is executing CMS tools…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Guided Next Steps */}
          {suggestedSteps.length > 0 && (
            <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100/90">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Recommended Next Steps
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Click to ask</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-[76px] overflow-y-auto custom-scrollbar">
                {suggestedSteps.map((step, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(step.query)}
                    className="px-2.5 py-1 rounded-full bg-white hover:bg-slate-100 hover:border-slate-300 text-slate-700 hover:text-slate-900 border border-slate-200/90 shadow-2xs text-[11px] font-medium flex items-center gap-1.5 transition-all duration-150 cursor-pointer active:scale-95 text-left"
                  >
                    {renderStepIcon(step.icon)}
                    <span className="truncate max-w-[200px]">{step.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Speaking / Listening Status Banners */}
          {isSpeaking && (
            <div className="mx-4 my-2 px-3.5 py-2 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex items-center justify-between text-xs animate-in fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-600 animate-pulse shrink-0" />
                <span className="font-semibold text-purple-950">Zara is speaking (ElevenLabs v4)…</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopAudio();
                  if (wantsToListenRef.current) startListeningRef.current();
                }}
                className="px-2.5 py-1 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition shadow-xs cursor-pointer active:scale-95"
              >
                Interrupt & Speak
              </button>
            </div>
          )}

          {isListening && (
            <div className="mx-4 my-2 px-3.5 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs animate-in fade-in shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="w-1 h-5 rounded-full bg-emerald-600 animate-pulse delay-75" />
                  <span className="w-1 h-3 rounded-full bg-emerald-500 animate-pulse delay-150" />
                </div>
                <div>
                  <div className="font-bold text-[12px] text-emerald-950">Listening for your command…</div>
                  <div className="text-[10px] text-emerald-700">Speak now, or tap Send when done</div>
                </div>
              </div>
              {heardPreview ? (
                <button
                  type="button"
                  onClick={() => handleSendMessage(heardPreview)}
                  className="px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer active:scale-95 flex items-center gap-1"
                >
                  <span>Send</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                  Mic Live
                </span>
              )}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            {/* Mic Button: Toggles Voice or interrupts Zara */}
            <button
              type="button"
              onClick={() => {
                if (isSpeaking) {
                  stopAudio();
                  if (wantsToListenRef.current) startListeningRef.current();
                } else {
                  toggleVoiceMode();
                }
              }}
              className={`p-2.5 rounded-xl border transition cursor-pointer relative ${
                isVoiceActive
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
              }`}
              title={
                isSpeaking
                  ? 'Zara is speaking — click to interrupt and speak'
                  : isVoiceActive
                  ? 'Voice mode active (click to mute)'
                  : 'Click to enable voice conversation'
              }
            >
              {isVoiceActive ? (
                <>
                  <Mic className="w-4 h-4 animate-pulse" />
                  {isListening && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-emerald-500 animate-ping" />
                  )}
                </>
              ) : (
                <MicOff className="w-4 h-4" />
              )}
            </button>

            {/* Text Input with Real-time Speech Sync */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                isVoiceActive
                  ? (isListening ? (heardPreview ? `Hearing: "${heardPreview}"` : 'Listening… speak your command now') : 'Zara is ready…')
                  : `Ask Zara AI anything about ${clientName} CMS…`
              }
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200/90 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 focus:ring-2 focus:ring-slate-900/5 font-medium transition-all"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white disabled:opacity-30 disabled:hover:bg-slate-900 transition shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
