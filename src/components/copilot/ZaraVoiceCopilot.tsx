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
  Bot,
  Activity,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Radio,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Minimize2,
  Maximize2,
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
  const [interimTranscript, setInterimTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100 for visualizer
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'listening' | 'speaking' | 'processing'>('idle');

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: isClient
        ? `Hello ${userFirstName}! I'm **Zara**, your autonomous AI copilot for **${clientName}**. I can guide you through editing corporate pages, checking statutory compliance, reviewing draft releases, and coordinating approvals. What would you like to work on?`
        : `Hello ${userFirstName}! **Zara AI Executive Copilot** is active for **Bastion CMS & ${clientName}**.\n\nI can execute real-time statutory compliance audits (JSE Listings § 8.2 and King IV Principle 5), monitor multi-tenant SRE fleet telemetry, query price-sensitive SENS announcements, or extract client Brand DNA design systems.\n\nWhat command would you like me to run?`,
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

  // Keep welcome message & suggested steps updated if client changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'welcome') {
        return [
          {
            id: 'welcome',
            role: 'assistant',
            content: isClient
              ? `Hello ${userFirstName}! I'm **Zara**, your autonomous AI copilot for **${clientName}**. I can guide you through editing corporate pages, checking statutory compliance, reviewing draft releases, and coordinating approvals. What would you like to work on?`
              : `Hello ${userFirstName}! **Zara AI Executive Copilot** is active for **Bastion CMS & ${clientName}**.\n\nI can execute real-time statutory compliance audits (JSE Listings § 8.2 and King IV Principle 5), monitor multi-tenant SRE fleet telemetry, query price-sensitive SENS announcements, or extract client Brand DNA design systems.\n\nWhat command would you like me to run?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ];
      }
      return prev;
    });
    setSuggestedSteps(isClient ? DEFAULT_CLIENT_SUGGESTED_STEPS : [
      { label: 'Run Compliance Audit', query: 'Zara, run a compliance audit on page copy.', icon: 'shield' },
      { label: 'Edge Fleet Health', query: 'Zara, check multi-tenant SRE uptime and edge latency.', icon: 'check' },
      { label: 'JSE SENS Announcements', query: 'Zara, query recent JSE SENS regulatory announcements.', icon: 'file' },
      { label: 'Brand DNA Extraction', query: 'Zara, extract the brand design tokens for Gold Fields.', icon: 'sparkles' }
    ]);
  }, [clientName, userFirstName, isClient]);

  // Audio & Speech References
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechQueueRef = useRef<string[]>([]);
  const speechIdRef = useRef<number>(0);
  const lastSpokenWordsRef = useRef<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const baselineEnergyRef = useRef<number>(0.02);
  const sustainedVadCountRef = useRef<number>(0);

  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const [voiceProvider, setVoiceProvider] = useState<'elevenlabs' | 'browser'>('elevenlabs');

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

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
  // 1. TTS & BARGE-IN INTERRUPTION ENGINE
  // ─────────────────────────────────────────────────────────
  const interruptSpeaking = useCallback((reason: string = 'User Interruption') => {
    console.log(`🛑 [BARGE-IN] Interrupting AI speech: ${reason}`);
    speechIdRef.current++;
    speechQueueRef.current = [];
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.src = '';
      currentAudioRef.current = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setVoiceStatus(isVoiceActive ? 'listening' : 'idle');
  }, [isVoiceActive]);

  // ─────────────────────────────────────────────────────────
  // 2. HARDWARE WEB AUDIO API VAD (Voice Activity Detection)
  // ─────────────────────────────────────────────────────────
  const initHardwareVad = useCallback(async () => {
    if (audioContextRef.current || !navigator.mediaDevices?.getUserMedia) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      mediaStreamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      analyserRef.current = analyser;

      const buf = new Float32Array(analyser.fftSize);

      const vadLoop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(buf);

        let sum = 0;
        for (let i = 0; i < buf.length; i++) {
          sum += buf[i] * buf[i];
        }
        const rms = Math.sqrt(sum / buf.length);

        if (!isSpeaking) {
          baselineEnergyRef.current = baselineEnergyRef.current * 0.95 + rms * 0.05;
        }

        const normalizedLevel = Math.min(100, Math.round(rms * 450));
        setAudioLevel(normalizedLevel);

        const speechThreshold = Math.max(0.045, baselineEnergyRef.current * 2.4);

        if (isSpeaking && rms > speechThreshold) {
          sustainedVadCountRef.current++;
          if (sustainedVadCountRef.current >= 3) {
            interruptSpeaking('Acoustic VAD threshold breach');
            sustainedVadCountRef.current = 0;
          }
        } else {
          sustainedVadCountRef.current = Math.max(0, sustainedVadCountRef.current - 1);
        }

        animFrameRef.current = requestAnimationFrame(vadLoop);
      };

      animFrameRef.current = requestAnimationFrame(vadLoop);
    } catch (e) {
      console.warn('Hardware VAD initialization skipped:', e);
    }
  }, [interruptSpeaking, isSpeaking]);

  const teardownHardwareVad = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  // Browser TTS fallback
  const speakBrowserFallback = useCallback((text: string, currentId: number): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.05;
      utter.pitch = 1.0;
      utter.onstart = () => {
        if (currentId !== speechIdRef.current) {
          window.speechSynthesis.cancel();
          resolve();
          return;
        }
        setIsSpeaking(true);
        setVoiceStatus('speaking');
      };
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.speak(utter);
    });
  }, []);

  // Neural Cloud ElevenLabs Voice Output
  const speakElevenLabs = useCallback(async (text: string, currentId: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/voice-copilot/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      if (!res.ok) {
        setVoiceProvider('browser');
        return false;
      }

      if (currentId !== speechIdRef.current) return true;

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      currentAudioRef.current = audio;

      return new Promise<boolean>((resolve) => {
        audio.onplay = () => {
          if (currentId !== speechIdRef.current) {
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
          currentAudioRef.current = null;
          resolve(true);
        };

        audio.onerror = () => {
          URL.revokeObjectURL(url);
          currentAudioRef.current = null;
          setVoiceProvider('browser');
          resolve(false);
        };

        audio.play().catch(() => {
          resolve(false);
        });
      });
    } catch {
      setVoiceProvider('browser');
      return false;
    }
  }, []);

  // High-level speak sentence router
  const speakSentence = useCallback(async (sentence: string, currentId: number) => {
    if (currentId !== speechIdRef.current || !sentence.trim()) return;

    lastSpokenWordsRef.current = sentence.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);

    let success = false;
    if (voiceProvider === 'elevenlabs') {
      success = await speakElevenLabs(sentence, currentId);
    }

    if (!success && currentId === speechIdRef.current) {
      await speakBrowserFallback(sentence, currentId);
    }
  }, [speakElevenLabs, speakBrowserFallback, voiceProvider]);

  // Process speech sentence queue
  const playSpeechQueue = useCallback(async (fullText: string) => {
    const thisSpeechId = ++speechIdRef.current;
    setIsSpeaking(true);
    setVoiceStatus('speaking');

    const sentences = fullText
      .split(/(?<=[.?!])\s+/)
      .map(s => s.trim())
      .filter(Boolean);

    for (const sentence of sentences) {
      if (thisSpeechId !== speechIdRef.current) break;
      await speakSentence(sentence, thisSpeechId);
    }

    if (thisSpeechId === speechIdRef.current) {
      setIsSpeaking(false);
      setVoiceStatus(isVoiceActive ? 'listening' : 'idle');
    }
  }, [isVoiceActive, speakSentence]);

  // ─────────────────────────────────────────────────────────
  // 3. SEND MESSAGE & DISPATCH PLATFORM ACTIONS
  // ─────────────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (contentToSend?: string) => {
    const text = (contentToSend || textInput).trim();
    if (!text || isProcessing) return;

    setTextInput('');
    setInterimTranscript('');
    interruptSpeaking('New query submitted');

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
          userName: user?.name ? user.name.split(' ')[0] : 'Malcolm',
          userRole: user?.role || 'platform_admin',
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error('Zara Agent response error');

      const data = await res.json();
      const reply = data.reply || data.speechText || 'Action acknowledged in platform.';

      const assistantMsg: CopilotMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action,
        toolsExecuted: data.toolsExecuted || [],
        actionCards: data.actionCards || []
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);

      // Update guided next steps pills based on response
      if (data.suggestedNextSteps && Array.isArray(data.suggestedNextSteps) && data.suggestedNextSteps.length > 0) {
        setSuggestedSteps(data.suggestedNextSteps);
      }

      // Execute platform navigation action if returned
      if (data.action?.type === 'navigate' && data.action.navigationUrl) {
        setTimeout(() => {
          setIsOpen(false);
          router.push(data.action.navigationUrl);
        }, 1400);
      }

      // Voice playback using latest quality ElevenLabs audio stream
      if (isVoiceActive) {
        playSpeechQueue(data.speechText || reply);
      } else {
        setVoiceStatus('idle');
      }

    } catch (err) {
      console.warn('Zara Agent API error, trying fallback:', err);
      try {
        const fbRes = await fetch('/api/admin/voice-copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            clientContext: clientName,
            portalViewMode,
            userName: user?.name ? user.name.split(' ')[0] : 'Malcolm',
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
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            action: fbData.action
          };
          setMessages(prev => [...prev, assistantMsg]);
          setIsProcessing(false);
          if (isVoiceActive) playSpeechQueue(fbData.speechText || fbData.reply);
          return;
        }
      } catch {}
      const fallbackMsg: CopilotMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: `I'm standing by to help with ${clientName}. You can explore the Visual Live Editor (/admin/editor), check statutory compliance, or open the Platform Learning Hub (/admin/learn).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: {
          type: 'navigate',
          navigationUrl: '/admin/editor',
          label: 'Open Visual Live Editor'
        }
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setIsProcessing(false);
      setVoiceStatus(isVoiceActive ? 'listening' : 'idle');
    }
  }, [textInput, isProcessing, interruptSpeaking, clientName, activeClient?.id, portalViewMode, user, messages, isVoiceActive, playSpeechQueue, router]);

  // ─────────────────────────────────────────────────────────
  // 4. CLEAR CHAT CONVERSATION
  // ─────────────────────────────────────────────────────────
  const handleClearChat = useCallback(() => {
    interruptSpeaking('Chat cleared by user');
    setTextInput('');
    setInterimTranscript('');
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: isClient
          ? `Hello ${userFirstName}! I'm Ask AI, your platform assistant for ${clientName}. I'm here to guide you through editing pages, using the Visual Live Editor, uploading media, inviting team members, or reviewing publication drafts. How can I help you today?`
          : `Hello ${userFirstName}! Ask AI is active. I can guide you through managing client properties, visual editing, releases, team governance, or platform operations.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setSuggestedSteps(isClient ? DEFAULT_CLIENT_SUGGESTED_STEPS : DEFAULT_AGENCY_SUGGESTED_STEPS);
  }, [interruptSpeaking, isClient, userFirstName, clientName]);

  // ─────────────────────────────────────────────────────────
  // 5. SPEECH RECOGNITION (Snappy VAD & Duplex Echo Guard)
  // ─────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      console.warn('Speech recognition not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
    }

    try {
      const rec = new SpeechRec();
      recognitionRef.current = rec;
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        if (!isSpeaking) setVoiceStatus('listening');
      };

      rec.onresult = (e: any) => {
        let transcript = '';
        for (let i = 0; i < e.results.length; ++i) {
          transcript += e.results[i][0].transcript;
        }

        const currentHeard = transcript.trim();
        if (!currentHeard) return;

        // 🛑 BARGE-IN & ACOUSTIC ECHO GUARD
        if (isSpeaking) {
          const heardWords = currentHeard.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean);
          const overlap = heardWords.filter(w => w.length > 3 && lastSpokenWordsRef.current.includes(w)).length;
          const isEcho = heardWords.length > 0 && (overlap / heardWords.length) > 0.6;

          if (isEcho) {
            return;
          }

          interruptSpeaking('User speech barge-in');
        }

        setInterimTranscript(currentHeard);

        // Snappy conversational silence detection (750ms complete, 1100ms conjunction)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        const endsIncomplete = /\b(and|or|so|but|because|with|to|for|if|that|which)\s*$/i.test(currentHeard) || /,\s*$/.test(currentHeard);
        const pauseDelay = endsIncomplete ? 1100 : 750;

        silenceTimerRef.current = setTimeout(() => {
          if (currentHeard.length > 2) {
            console.log('⚡ VAD Silence Expired -> Auto-submitting prompt:', currentHeard);
            handleSendMessage(currentHeard);
          }
        }, pauseDelay);
      };

      rec.onerror = (e: any) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.warn('Speech recognition error:', e.error);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        if (isVoiceActive && isOpen) {
          try { rec.start(); } catch {}
        }
      };

      rec.start();
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
    }
  }, [handleSendMessage, interruptSpeaking, isOpen, isSpeaking, isVoiceActive]);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleVoiceMode = useCallback(() => {
    if (isVoiceActive) {
      setIsVoiceActive(false);
      stopListening();
      teardownHardwareVad();
      interruptSpeaking('Voice mode toggled off');
      setVoiceStatus('idle');
    } else {
      setIsVoiceActive(true);
      initHardwareVad();
      startListening();
      setVoiceStatus('listening');
    }
  }, [isVoiceActive, stopListening, teardownHardwareVad, interruptSpeaking, initHardwareVad, startListening]);

  // Clean up on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      teardownHardwareVad();
      interruptSpeaking('Copilot closed');
    } else if (isVoiceActive) {
      initHardwareVad();
      startListening();
    }
  }, [isOpen, isVoiceActive, stopListening, teardownHardwareVad, interruptSpeaking, initHardwareVad, startListening]);

  // Helper icon renderer for pills
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
      {/* FLOATING TRIGGER BUTTON (Hidden in client CMS mode for clean canvas) */}
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
      {/* CLEAN, WHITE, PREMIUM ASK AI DRAWER                       */}
      {/* ───────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[440px] max-w-[calc(100vw-2rem)] h-[620px] bg-white border border-slate-200/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18)] ring-1 ring-slate-900/5 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header (Clean, White with Clear Chat Action) */}
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
                      ? 'Zara Speaking (ElevenLabs)…'
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
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/80 hover:text-slate-800'
                }`}
                title={isVoiceActive ? 'Mute continuous voice' : 'Enable duplex voice assistant'}
              >
                {isVoiceActive ? <Mic className="w-3.5 h-3.5 text-emerald-600" /> : <MicOff className="w-3.5 h-3.5 text-slate-400" />}
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

          {/* Real-time Audio Level Bar (VAD) */}
          {isVoiceActive && (
            <div className="h-1 bg-slate-100 w-full overflow-hidden flex items-center">
              <div
                style={{
                  width: `${audioLevel}%`,
                  background: isSpeaking
                    ? 'linear-gradient(90deg, #A855F7, #EC4899)'
                    : 'linear-gradient(90deg, #6366F1, #06B6D4)'
                }}
                className="h-full transition-all duration-75"
              />
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
                  className={`max-w-[88%] rounded-2xl px-4 py-3 leading-relaxed text-[13px] shadow-xs select-text ${
                    m.role === 'user'
                      ? 'bg-slate-900 text-white rounded-br-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>

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
                            onClick={() => {
                              setIsOpen(false);
                            }}
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

            {/* Interim Real-time Transcript Indicator */}
            {interimTranscript && (
              <div className="flex flex-col items-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-xs px-3.5 py-2.5 bg-amber-50 text-amber-900 border border-amber-200/80 italic animate-pulse text-xs">
                  <span>🎙️ {interimTranscript}</span>
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-slate-500 italic text-[11px] p-2 bg-white rounded-xl border border-slate-100 shadow-2xs w-fit">
                <span className="w-2 h-2 rounded-full bg-slate-900 animate-ping" />
                <span>Ask AI is checking platform knowledge…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Guided Next Steps (Wrapped Stacked Pills, No Horizontal Scrollbar) */}
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

          {/* Input Bar (Clean White) */}
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
                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'
              }`}
              title={isVoiceActive ? 'Voice mode on' : 'Click to enable voice'}
            >
              {isVoiceActive ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={isVoiceActive ? 'Listening… or ask a question' : `Ask AI anything about ${clientName} CMS…`}
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
