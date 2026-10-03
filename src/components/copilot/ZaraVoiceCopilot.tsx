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
  CalendarCheck
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

  const initialWelcomeText = isClient
    ? `Hello ${userFirstName}! I'm **Zara**, your autonomous AI copilot for **${clientName}**. I can guide you through editing corporate pages, checking statutory compliance, reviewing draft releases, and coordinating approvals. What would you like to work on?`
    : `Hello ${userFirstName}! **Zara AI Executive Copilot** is active for **Bastion CMS & ${clientName}**.\n\nI can execute real-time statutory compliance audits (JSE Listings § 8.2 and King IV Principle 5), monitor multi-tenant SRE fleet telemetry, query price-sensitive SENS announcements, or extract client Brand DNA design systems.\n\nWhat command would you like me to run?`;

  const initialSpeechGreeting = isClient
    ? `Hello ${userFirstName}. I am Zara, your autonomous AI copilot for ${clientName}. What would you like to work on?`
    : `Hello ${userFirstName}! Zara AI Executive Copilot is active for Bastion CMS and ${clientName}. I can execute real-time compliance audits, monitor edge fleet health, query SENS announcements, or extract brand design tokens. What command would you like me to run?`;

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
    isClient ? DEFAULT_CLIENT_SUGGESTED_STEPS : [
      { label: 'Run Compliance Audit', query: 'Zara, run a compliance audit on page copy.', icon: 'shield' },
      { label: 'Edge Fleet Health', query: 'Zara, check multi-tenant SRE uptime and edge latency.', icon: 'check' },
      { label: 'JSE SENS Announcements', query: 'Zara, query recent JSE SENS regulatory announcements.', icon: 'file' },
      { label: 'Brand DNA Extraction', query: 'Zara, extract the brand design tokens for Gold Fields.', icon: 'sparkles' }
    ]
  );

  // References
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTranscriptRef = useRef<string>('');
  const wantsToListenRef = useRef<boolean>(false);
  const speechSessionRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  // Listen to external trigger events ('open-bastion-copilot' or 'open-ask-ai')
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-bastion-copilot', handleOpen);
    window.addEventListener('open-ask-ai', handleOpen);
    return () => {
      window.removeEventListener('open-bastion-copilot', handleOpen);
      window.removeEventListener('open-ask-ai', handleOpen);
    };
  }, []);

  // ─────────────────────────────────────────────────────────
  // 1. ELEVENLABS v4 STUDIO AUDIO PLAYBACK ENGINE
  // ─────────────────────────────────────────────────────────
  const stopAudio = useCallback(() => {
    speechSessionRef.current++;
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
    setVoiceStatus(wantsToListenRef.current ? 'listening' : 'idle');
  }, []);

  const speakText = useCallback(async (rawText: string, msgId: string = 'general'): Promise<boolean> => {
    if (!rawText.trim()) return false;

    // Toggle off if clicking the currently playing message
    if (playingAudioId === msgId) {
      stopAudio();
      return true;
    }

    stopAudio();

    const session = ++speechSessionRef.current;
    setPlayingAudioId(msgId);
    setIsSpeaking(true);
    setVoiceStatus('speaking');

    const cleanSpeech = cleanMarkdownForSpeech(rawText);

    // 1. Try ElevenLabs Neural Studio Streaming (/api/zara/speak)
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
            setVoiceStatus('speaking');
          };

          audio.onended = () => {
            URL.revokeObjectURL(url);
            if (audioRef.current === audio) audioRef.current = null;
            setPlayingAudioId(null);
            setIsSpeaking(false);
            setVoiceStatus(wantsToListenRef.current ? 'listening' : 'idle');
            resolve(true);
          };

          audio.onerror = () => {
            URL.revokeObjectURL(url);
            if (audioRef.current === audio) audioRef.current = null;
            setPlayingAudioId(null);
            setIsSpeaking(false);
            setVoiceStatus(wantsToListenRef.current ? 'listening' : 'idle');
            resolve(false);
          };

          audio.play().catch((err) => {
            console.warn('[Zara Voice] Audio play autoplay restricted:', err);
            resolve(false);
          });
        });
      }
    } catch (err) {
      console.warn('[Zara Voice] ElevenLabs request failed, attempting browser fallback:', err);
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
          setVoiceStatus('speaking');
        };
        utter.onend = () => {
          setPlayingAudioId(null);
          setIsSpeaking(false);
          setVoiceStatus(wantsToListenRef.current ? 'listening' : 'idle');
          resolve(true);
        };
        utter.onerror = () => {
          setPlayingAudioId(null);
          setIsSpeaking(false);
          setVoiceStatus(wantsToListenRef.current ? 'listening' : 'idle');
          resolve(false);
        };
        window.speechSynthesis.speak(utter);
      });
    }

    setPlayingAudioId(null);
    setIsSpeaking(false);
    setVoiceStatus(wantsToListenRef.current ? 'listening' : 'idle');
    return false;
  }, [playingAudioId, stopAudio]);

  // ─────────────────────────────────────────────────────────
  // 2. STT (SPEECH RECOGNITION ENGINE)
  // ─────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setIsSpeechSupported(false);
      setMicError('Speech recognition is not supported in this browser. Please use Chrome or Edge for voice input.');
      return;
    }

    wantsToListenRef.current = true;
    setMicError(null);

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    try {
      const recog = new SR();
      recognitionRef.current = recog;
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = 'en-US';

      recog.onstart = () => {
        setIsListening(true);
        pendingTranscriptRef.current = '';
        if (!isSpeaking) setVoiceStatus('listening');
      };

      recog.onresult = (e: any) => {
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) {
            pendingTranscriptRef.current += e.results[i][0].transcript + ' ';
          }
        }

        let interim = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (!e.results[i].isFinal) {
            interim += e.results[i][0].transcript;
          }
        }

        const preview = (pendingTranscriptRef.current + interim).trim();
        if (!preview) return;
        setHeardPreview(preview);

        // Auto submit when speaker pauses (1200ms silence)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          silenceTimerRef.current = null;
          const fullQuery = pendingTranscriptRef.current.trim() || preview;
          if (fullQuery.length > 2) {
            handleSendMessage(fullQuery);
          }
        }, 1200);
      };

      recog.onerror = (e: any) => {
        if (e.error === 'aborted' || e.error === 'no-speech') return;
        console.warn('[Zara STT] Recognition error:', e.error);

        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setMicError('Microphone blocked. Please click the lock or settings icon in your browser address bar to allow microphone access.');
          wantsToListenRef.current = false;
          setIsVoiceActive(false);
          setIsListening(false);
          setVoiceStatus('idle');
        } else if (e.error === 'network') {
          setMicError('Speech recognition network glitch. Retrying connection...');
        }
      };

      recog.onend = () => {
        setIsListening(false);
        const pending = pendingTranscriptRef.current.trim();
        if (pending && !isSpeaking && !isProcessing) {
          handleSendMessage(pending);
          return;
        }

        // Restart listener if voice mode is still enabled
        if (wantsToListenRef.current && !isSpeaking && !isProcessing) {
          setTimeout(() => {
            if (wantsToListenRef.current) {
              try { recog.start(); } catch {}
            }
          }, 250);
        } else if (!isSpeaking) {
          setVoiceStatus('idle');
        }
      };

      recog.start();
    } catch (err) {
      console.warn('[Zara STT] Could not start speech recognition:', err);
    }
  }, [isSpeaking, isProcessing]);

  const stopListening = useCallback(() => {
    wantsToListenRef.current = false;
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    pendingTranscriptRef.current = '';
    setHeardPreview('');
    setIsListening(false);
    if (!isSpeaking) setVoiceStatus('idle');
  }, [isSpeaking]);

  // Voice Mode Toggle (with spoken greeting prompt)
  const toggleVoiceMode = useCallback(() => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      stopListening();
      stopAudio();
      setVoiceStatus('idle');
    } else {
      setIsVoiceActive(true);
      setMicError(null);
      // Play vocal greeting prompt on enabling voice
      speakText(
        `Hello ${userFirstName}! Zara AI Executive Copilot is listening. What command would you like me to run?`,
        'greeting_prompt'
      );
      startListening();
    }
  }, [isVoiceActive, stopListening, stopAudio, speakText, userFirstName, startListening]);

  // Cleanup on unmount or drawer close
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      stopAudio();
    }
  }, [isOpen, stopListening, stopAudio]);

  // ─────────────────────────────────────────────────────────
  // 3. SEND MESSAGE & DISPATCH CMS TOOLS
  // ─────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (contentToSend?: string) => {
    const text = (contentToSend || textInput).trim();
    if (!text || isProcessing) return;

    setTextInput('');
    setHeardPreview('');
    pendingTranscriptRef.current = '';
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    stopAudio();

    const userMsg: CopilotMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
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
      if (isVoiceActive) {
        speakText(speechToPlay, assistantMsg.id);
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
          if (isVoiceActive) {
            speakText(assistantMsg.speechText || assistantMsg.content, assistantMsg.id);
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
      if (isVoiceActive) {
        speakText(fallbackMsg.speechText || fallbackMsg.content, fallbackMsg.id);
      } else {
        setVoiceStatus('idle');
      }
    }
  }, [textInput, isProcessing, stopAudio, clientName, activeClient?.id, portalViewMode, userFirstName, user?.role, messages, isVoiceActive, speakText, router]);

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
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      voiceStatus === 'speaking'
                        ? 'bg-purple-500 animate-pulse'
                        : voiceStatus === 'listening'
                        ? 'bg-emerald-500 animate-ping'
                        : voiceStatus === 'processing'
                        ? 'bg-indigo-500 animate-bounce'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="truncate">
                    {voiceStatus === 'speaking'
                      ? 'Zara Speaking (ElevenLabs v4)…'
                      : voiceStatus === 'listening'
                      ? 'Listening with Echo Guard…'
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
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  isVoiceActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-1 ring-emerald-400/40'
                    : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/80 hover:text-slate-800'
                }`}
                title={isVoiceActive ? 'Voice mode active — click to mute' : 'Click to enable voice conversation'}
              >
                {isVoiceActive ? <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
                <span>{isVoiceActive ? 'Voice ON' : 'Voice OFF'}</span>
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

                  <p className="whitespace-pre-line">{m.content}</p>

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
                          <Link
                            href={c.linkUrl}
                            onClick={() => setIsOpen(false)}
                            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                          >
                            <span>{c.linkText || 'Open'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
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

            {/* Live Hearing Voice Preview */}
            {heardPreview && (
              <div className="flex flex-col items-end animate-in fade-in">
                <div className="max-w-[85%] rounded-2xl rounded-br-xs px-3.5 py-2.5 bg-indigo-50 text-indigo-900 border border-indigo-200/80 italic animate-pulse text-xs">
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

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
          >
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceMode}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isVoiceActive
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-300'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
              }`}
              title={isVoiceActive ? 'Voice mode on — click to mute' : 'Click to enable voice input'}
            >
              {isVoiceActive ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Text Input with Real-time Speech Hint */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={
                isVoiceActive
                  ? (heardPreview ? `Hearing: "${heardPreview}"` : 'Listening… speak your command')
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
