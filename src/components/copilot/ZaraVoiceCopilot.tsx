'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Radio,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useDashboardCustomizer } from '@/components/admin/DashboardCustomizerProvider';

interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  action?: {
    type: string;
    navigationUrl?: string;
    data?: any;
  };
}

export function ZaraVoiceCopilot() {
  const router = useRouter();
  const { primaryColor, accentColor } = useDashboardCustomizer();

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
      content: 'Good afternoon, Malcolm. Zara Voice Copilot is active. I can inspect SRE health across Move Digital and Gold Fields, deploy remediations, manage invoices, or navigate the platform.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

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

  // Listen to external trigger event
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-bastion-copilot', handleOpen);
    return () => window.removeEventListener('open-bastion-copilot', handleOpen);
  }, []);

  // ─────────────────────────────────────────────────────────
  // 1. TTS & BARGE-IN INTERRUPTION ENGINE
  // ─────────────────────────────────────────────────────────
  const interruptSpeaking = useCallback((reason: string = 'User Interruption') => {
    console.log(`🛑 [BARGE-IN] Interrupting Zara speech: ${reason}`);
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
        const normalizedLevel = Math.min(100, Math.round(rms * 400));
        setAudioLevel(normalizedLevel);

        // Update baseline noise floor when silent
        if (!isSpeaking && rms < 0.04) {
          baselineEnergyRef.current = baselineEnergyRef.current * 0.95 + rms * 0.05;
        }

        const threshold = Math.max(0.045, baselineEnergyRef.current * 2.8);

        // Hardware VAD Barge-In: interrupt bot playback immediately if user speaks
        if (isSpeaking && rms > threshold) {
          sustainedVadCountRef.current++;
          if (sustainedVadCountRef.current >= 3) {
            console.log('⚡ [HARDWARE VAD] Barge-In Triggered! Interrupting bot.');
            interruptSpeaking('Hardware VAD Barge-In');
            sustainedVadCountRef.current = 0;
          }
        } else {
          sustainedVadCountRef.current = 0;
        }

        animFrameRef.current = requestAnimationFrame(vadLoop);
      };

      animFrameRef.current = requestAnimationFrame(vadLoop);
    } catch (err) {
      console.warn('[Copilot VAD] Mic permission or initialization warning:', err);
    }
  }, [isSpeaking, interruptSpeaking]);

  const teardownHardwareVad = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const speakSentence = useCallback(async (sentence: string, currentSpeechId: number): Promise<void> => {
    if (currentSpeechId !== speechIdRef.current) return;

    // ── 1. High-Fidelity ElevenLabs Neural Speech Pipeline ───────────
    try {
      const resp = await fetch('/api/admin/voice-copilot/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sentence,
          model_id: 'eleven_turbo_v2_5'
        })
      });

      if (currentSpeechId !== speechIdRef.current) return;

      const contentType = resp.headers.get('content-type') || '';
      if (resp.ok && contentType.includes('audio')) {
        setVoiceProvider('elevenlabs');
        const blob = await resp.blob();
        if (currentSpeechId !== speechIdRef.current) return;

        return new Promise<void>((resolve) => {
          const audioUrl = URL.createObjectURL(blob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;

          audio.onplay = () => {
            if (currentSpeechId === speechIdRef.current) {
              setIsSpeaking(true);
              setVoiceStatus('speaking');
            }
          };

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            if (currentAudioRef.current === audio) currentAudioRef.current = null;
            resolve();
          };

          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            if (currentAudioRef.current === audio) currentAudioRef.current = null;
            resolve();
          };

          audio.play().catch(() => resolve());
        });
      }
    } catch (err) {
      console.warn('[Voice Copilot] ElevenLabs audio streaming error, falling back:', err);
    }

    // ── 2. Resilient Browser Speech Fallback (Female Natural Voice) ───
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis || currentSpeechId !== speechIdRef.current) {
        return resolve();
      }

      setVoiceProvider('browser');
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(sentence);
      utt.rate = 1.05;
      utt.pitch = 1.02;

      const voices = window.speechSynthesis.getVoices();
      const match = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Google UK English Female') || v.name.includes('Natural'))
      );
      if (match) utt.voice = match;

      utt.onstart = () => {
        if (currentSpeechId === speechIdRef.current) {
          setIsSpeaking(true);
          setVoiceStatus('speaking');
        }
      };

      utt.onend = () => resolve();
      utt.onerror = () => resolve();

      window.speechSynthesis.speak(utt);
    });
  }, []);

  const playSpeechQueue = useCallback(async (text: string) => {
    if (!text || typeof window === 'undefined') return;

    // Record words into echo guard buffer
    const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    lastSpokenWordsRef.current = words.slice(-30);

    const thisSpeechId = ++speechIdRef.current;
    setIsSpeaking(true);
    setVoiceStatus('speaking');

    // Split text into sentences for snappy low-latency playback
    const sentences = text
      .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
      .split('|')
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

    // Clear inputs and interim transcript
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
      const res = await fetch('/api/admin/voice-copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
        })
      });

      if (!res.ok) throw new Error('Copilot response error');

      const data = await res.json();
      const reply = data.reply || data.speechText || 'Action acknowledged in Bastion platform.';

      const assistantMsg: CopilotMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: data.action
      };

      setMessages(prev => [...prev, assistantMsg]);
      setIsProcessing(false);

      // Execute platform navigation action if returned
      if (data.action?.type === 'navigate' && data.action.navigationUrl) {
        setTimeout(() => {
          router.push(data.action.navigationUrl);
        }, 800);
      }

      // Voice playback
      if (isVoiceActive) {
        playSpeechQueue(data.speechText || reply);
      } else {
        setVoiceStatus('idle');
      }

    } catch (err) {
      console.error('Copilot send error:', err);
      const fallbackMsg: CopilotMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: 'Bastion platform intelligence: Edge systems operational. Could not reach cloud LLM service.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, fallbackMsg]);
      setIsProcessing(false);
      setVoiceStatus(isVoiceActive ? 'listening' : 'idle');
    }
  }, [textInput, isProcessing, interruptSpeaking, messages, isVoiceActive, playSpeechQueue, router]);

  // ─────────────────────────────────────────────────────────
  // 4. SPEECH RECOGNITION (Snappy VAD & Duplex Echo Guard)
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
            // Filter speaker loopback echo
            return;
          }

          // Genuine user speech while bot is talking -> Cut off bot immediately!
          interruptSpeaking('User speech barge-in');
        }

        setInterimTranscript(currentHeard);

        // Snappy conversational silence detection (750ms complete, 1100ms conjunction)
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        const endsIncomplete = /\b(and|or|so|but|because|with|to|for|if|that|which)\s*$/i.test(currentHeard) || /,\s*$/.test(currentHeard);
        const pauseDelay = endsIncomplete ? 1100 : 750;

        silenceTimerRef.current = setTimeout(() => {
          if (currentHeard && !isProcessing) {
            handleSendMessage(currentHeard);
          }
        }, pauseDelay);
      };

      rec.onerror = (e: any) => {
        console.warn('Speech recognition error:', e.error);
        if (e.error === 'not-allowed') {
          setIsVoiceActive(false);
          setIsListening(false);
        }
      };

      rec.onend = () => {
        setIsListening(false);
        // Automatically restart listening if voice mode remains enabled
        if (isVoiceActive && isOpen && !isProcessing) {
          setTimeout(() => {
            if (isVoiceActive && isOpen && !recognitionRef.current?.running) {
              try { rec.start(); } catch {}
            }
          }, 300);
        }
      };

      rec.start();
    } catch (err) {
      console.warn('Could not start speech recognition:', err);
    }
  }, [isSpeaking, interruptSpeaking, isProcessing, handleSendMessage, isVoiceActive, isOpen]);

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  // Toggle Voice Mode switch
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

  const gradientBg = `linear-gradient(135deg, ${primaryColor}, ${accentColor})`;

  return (
    <>
      {/* ───────────────────────────────────────────────────────── */}
      {/* FLOATING TRIGGER BUTTON (Bottom-Right Signature)          */}
      {/* ───────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: gradientBg,
          boxShadow: `0 8px 28px ${primaryColor}55`,
          borderColor: `${accentColor}60`
        }}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl text-white border flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
        title="Open Zara Voice Copilot"
        aria-label="Open Zara Voice Copilot"
      >
        <Sparkles className="w-6 h-6 fill-current group-hover:rotate-12 transition-transform" />
        
        {/* Pulsing Status Dot */}
        <span
          className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-[#0B0F19] ${
            isSpeaking
              ? 'bg-purple-400 animate-ping'
              : isListening
              ? 'bg-emerald-400 animate-pulse'
              : 'bg-emerald-500'
          }`}
        />

        {/* Real-time Voice Wave Halo Ring */}
        {isVoiceActive && audioLevel > 5 && (
          <span
            style={{
              borderColor: primaryColor,
              transform: `scale(${1 + audioLevel / 120})`,
              opacity: Math.min(0.8, audioLevel / 60)
            }}
            className="absolute inset-0 rounded-2xl border-2 pointer-events-none transition-transform duration-75"
          />
        )}
      </button>

      {/* ───────────────────────────────────────────────────────── */}
      {/* EXPANDED ZARA VOICE COPILOT DRAWER                        */}
      {/* ───────────────────────────────────────────────────────── */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-2.5rem)] h-[580px] bg-[#0E131F]/95 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-[#0A0D16] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                style={{ background: gradientBg }}
                className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-md relative"
              >
                <Bot className="w-5 h-5" />
                {isSpeaking && (
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-purple-400 ring-2 ring-[#0A0D16] animate-pulse" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Zara Voice Copilot</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-purple-400" /> ElevenLabs HD
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    750ms VAD
                  </span>
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      voiceStatus === 'speaking'
                        ? 'bg-purple-400 animate-pulse'
                        : voiceStatus === 'listening'
                        ? 'bg-emerald-400 animate-ping'
                        : voiceStatus === 'processing'
                        ? 'bg-amber-400 animate-bounce'
                        : 'bg-slate-500'
                    }`}
                  />
                  <span className="capitalize">
                    {voiceStatus === 'speaking'
                      ? (voiceProvider === 'elevenlabs' ? 'Zara Speaking (ElevenLabs HD) · Duplex Active' : 'Zara Speaking… (Duplex Active)')
                      : voiceStatus === 'listening'
                      ? 'Listening with Echo Guard…'
                      : voiceStatus === 'processing'
                      ? 'Executing Platform Action…'
                      : isVoiceActive
                      ? 'ElevenLabs Neural Engine Ready'
                      : 'Voice Muted'}
                  </span>
                </div>
              </div>
            </div>

            {/* Header Controls */}
            <div className="flex items-center gap-1.5">
              {/* Voice Mode Toggle Switch */}
              <button
                type="button"
                onClick={toggleVoiceMode}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${
                  isVoiceActive
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title={isVoiceActive ? 'Disable continuous voice' : 'Enable 750ms voice engine'}
              >
                {isVoiceActive ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5" />}
                <span>{isVoiceActive ? 'Voice ON' : 'Voice OFF'}</span>
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                aria-label="Close Copilot"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Real-time Audio Level Bar (Web Audio VAD) */}
          {isVoiceActive && (
            <div className="h-1 bg-slate-900/80 w-full overflow-hidden flex items-center">
              <div
                style={{
                  width: `${audioLevel}%`,
                  background: isSpeaking
                    ? 'linear-gradient(90deg, #A855F7, #EC4899)'
                    : 'linear-gradient(90deg, #10B981, #06B6D4)'
                }}
                className="h-full transition-all duration-75"
              />
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white rounded-br-xs'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-800/80 rounded-bl-xs'
                  }`}
                >
                  <p>{m.content}</p>

                  {/* Render Execution Action Card */}
                  {m.action && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px]">
                      {m.action.type === 'sre_health' && (
                        <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-2 flex items-center justify-between text-emerald-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            100% Operational (84ms Edge)
                          </span>
                          <button
                            onClick={() => router.push('/status')}
                            className="text-[10px] underline hover:text-white flex items-center gap-0.5"
                          >
                            Status Page <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {m.action.type === 'list_incidents' && (
                        <div className="bg-purple-500/10 border border-purple-500/25 rounded-lg p-2 flex items-center justify-between text-purple-300">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Activity className="w-3.5 h-3.5" />
                            {m.action.data?.openCount > 0 ? `${m.action.data.openCount} Open Incident` : 'Incidents Remediated'}
                          </span>
                          <button
                            onClick={() => router.push('/admin/incidents')}
                            className="text-[10px] underline hover:text-white flex items-center gap-0.5"
                          >
                            Open SRE <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {m.action.type === 'create_invoice' && (
                        <div className="bg-blue-500/10 border border-blue-500/25 rounded-lg p-2 flex items-center justify-between text-blue-300">
                          <span className="flex items-center gap-1.5 font-medium">
                            <CreditCard className="w-3.5 h-3.5" />
                            {m.action.data?.docNumber || 'Invoice Created'}
                          </span>
                          <button
                            onClick={() => router.push('/admin/billing')}
                            className="text-[10px] underline hover:text-white flex items-center gap-0.5"
                          >
                            View Invoice <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      {m.action.type === 'billing_summary' && (
                        <div className="bg-slate-800/80 border border-slate-700/60 rounded-lg p-2 flex items-center justify-between text-slate-300">
                          <span className="font-mono text-emerald-400 font-bold">
                            {m.action.data?.totalInvoicedFmt || 'R0'} Invoiced
                          </span>
                          <button
                            onClick={() => router.push('/admin/billing')}
                            className="text-[10px] underline hover:text-white flex items-center gap-0.5"
                          >
                            Billing Console <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-500 px-1 mt-1">
                  {m.timestamp}
                </span>
              </div>
            ))}

            {/* Interim Real-time Transcript Indicator */}
            {interimTranscript && (
              <div className="flex flex-col items-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-xs px-3.5 py-2 bg-purple-900/40 text-purple-200 border border-purple-500/40 italic animate-pulse">
                  <span>🎙️ {interimTranscript}</span>
                </div>
              </div>
            )}

            {/* Processing Indicator */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-slate-400 italic text-[11px] p-2">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                <span>Zara is executing command across Bastion edge...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Voice Command Chips */}
          <div className="px-3 py-2 bg-[#090C14] border-t border-slate-800/60 overflow-x-auto flex gap-1.5 scrollbar-none text-[11px]">
            <button
              type="button"
              onClick={() => handleSendMessage('Check Move Digital health and SLA uptime')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition border border-slate-700/50 flex items-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              SRE Health
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Are there any active incidents or open PR fixes?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition border border-slate-700/50 flex items-center gap-1"
            >
              <Activity className="w-3 h-3 text-purple-400" />
              Incidents
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('What is our total invoiced revenue and outstanding billing?')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition border border-slate-700/50 flex items-center gap-1"
            >
              <CreditCard className="w-3 h-3 text-blue-400" />
              Commercial MRR
            </button>
            <button
              type="button"
              onClick={() => handleSendMessage('Open the public 90-day status page')}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white whitespace-nowrap transition border border-slate-700/50 flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3 text-cyan-400" />
              Public Status
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#0A0D16] border-t border-slate-800 flex items-center gap-2"
          >
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceMode}
              style={isVoiceActive ? { background: gradientBg } : undefined}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isVoiceActive
                  ? 'text-white border-purple-500 shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
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
              placeholder={isVoiceActive ? 'Listening... or type command' : 'Ask Zara or command platform...'}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!textInput.trim() || isProcessing}
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
