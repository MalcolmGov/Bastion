'use client';

import React from 'react';
import Link from 'next/link';
import {
  Key,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Lock,
  Cpu,
  ArrowRight,
  Code2,
  Zap,
  Bot,
  Layers,
  CheckCircle2,
  Globe2,
  SlidersHorizontal
} from 'lucide-react';
import { ApiKeysTab } from '@/components/studio/ApiKeysTab';

export default function AdminApiKeysPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121824] via-[#0E1522] to-[#151D2C] border border-[#232F42] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              INTELLIGENCE &amp; INFRASTRUCTURE
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
                <Key className="w-6 h-6" />
              </span>
              AI API Keys &amp; Frontier Model Engine
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Connect your frontier model API keys for Anthropic Claude, OpenAI GPT, Google Gemini, and Chinese frontier models (DeepSeek &amp; Qwen). Power autonomous design polish, live JSX component generation, and multi-model coding copilots.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <Link
              href="/admin/editor"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              Launch Visual Page Editor
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/admin/sandbox"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 font-medium text-xs transition"
            >
              <Code2 className="w-3.5 h-3.5 text-slate-400" />
              Test in API Sandbox
            </Link>
          </div>
        </div>
      </div>

      {/* Security & Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0E1522]/90 border border-slate-800/80 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3 text-emerald-400 font-semibold text-sm">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            100% Client-Side Privacy
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            API keys are kept strictly in your local browser storage (<code className="text-slate-300 font-mono">localStorage</code>). They are never saved into server disk, environment files, or committed to git repositories.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1522]/90 border border-slate-800/80 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3 text-purple-400 font-semibold text-sm">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Cpu className="w-4 h-4 text-purple-400" />
            </div>
            Frontier Multi-Model Suite
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Freely switch between Claude Opus/Sonnet 5.5, GPT-6 Astra/Sol/Luna, Gemini 2.0 Flash, DeepSeek-R1/V3, and Qwen 2.5 Coder directly inside the Visual Page Editor coding panel.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1522]/90 border border-slate-800/80 shadow-sm flex flex-col gap-2">
          <div className="flex items-center gap-3 text-sky-400 font-semibold text-sm">
            <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
              <Zap className="w-4 h-4 text-sky-400" />
            </div>
            Live Latency &amp; Health Probes
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Click &ldquo;Test Key&rdquo; on any provider to verify real-time handshake, authorization status, and network round-trip response latency before generating or polishing web code.
          </p>
        </div>
      </div>

      {/* Main Credentials Panel (Embeds ApiKeysTab) */}
      <div className="rounded-3xl bg-[#121A28] border border-[#232F42] shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-400" />
              Configured AI Providers &amp; Credentials
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Add your API key for each provider you wish to use. You only need to add keys for the models you want active.
            </p>
          </div>
        </div>

        {/* ApiKeysTab Component */}
        <ApiKeysTab />
      </div>

      {/* Supported Models Catalog & Recommendation Guide */}
      <div className="rounded-3xl bg-[#0E1522] border border-slate-800/80 p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              Model Recommendation &amp; Capability Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Recommended model selection depending on the design and coding tasks you are executing.
            </p>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
            5 Frontier Families
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Claude Family */}
          <div className="p-4 rounded-2xl bg-[#141C2A] border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 tracking-wider uppercase">Anthropic</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">Top Pick</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Claude Opus 5.5 &amp; Sonnet 5.5</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Exceptional for deep Next.js architectural refactors, responsive Tailwind CSS layouts, and full-page aesthetic polish. Includes Claude Sonnet 5 &amp; Frontier series.
            </p>
            <div className="pt-2 border-t border-purple-500/10 text-[11px] text-purple-300/80 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
              Best for: Visual design &amp; zero-defect JSX
            </div>
          </div>

          {/* OpenAI Family */}
          <div className="p-4 rounded-2xl bg-[#141C2A] border border-emerald-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">OpenAI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">Frontier</span>
            </div>
            <h4 className="text-sm font-semibold text-white">GPT-6 Astra, Sol &amp; Luna</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cutting-edge autonomous reasoning for token design systems, complex state management, data visualization, and performance optimization. Includes o3-mini and GPT-4o.
            </p>
            <div className="pt-2 border-t border-emerald-500/10 text-[11px] text-emerald-300/80 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Best for: High-throughput logic &amp; state
            </div>
          </div>

          {/* Gemini Family */}
          <div className="p-4 rounded-2xl bg-[#141C2A] border border-sky-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 tracking-wider uppercase">Google</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">Fast &amp; Multi-modal</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Gemini 2.0 Flash &amp; 1.5 Pro</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ultra-fast generation with million-token context window. Ideal for cross-referencing massive design system token libraries and instantaneous interactive suggestions.
            </p>
            <div className="pt-2 border-t border-sky-500/10 text-[11px] text-sky-300/80 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
              Best for: Instantaneous feedback &amp; long contexts
            </div>
          </div>

          {/* DeepSeek Family */}
          <div className="p-4 rounded-2xl bg-[#141C2A] border border-blue-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-400 tracking-wider uppercase">DeepSeek</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">Reasoning</span>
            </div>
            <h4 className="text-sm font-semibold text-white">DeepSeek-R1 &amp; DeepSeek-V3</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Frontier Chinese reasoning model. Superb chain-of-thought verification for complex mathematical calculations, data transforms, and algorithmic UI computations.
            </p>
            <div className="pt-2 border-t border-blue-500/10 text-[11px] text-blue-300/80 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              Best for: Algorithmic correctness &amp; reasoning
            </div>
          </div>

          {/* Qwen Family */}
          <div className="p-4 rounded-2xl bg-[#141C2A] border border-amber-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Alibaba / Qwen</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">Coder 32B</span>
            </div>
            <h4 className="text-sm font-semibold text-white">Qwen 2.5 Coder &amp; Qwen Max</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Specialized code intelligence fine-tuned on vast repositories. Excels at idiomatic TypeScript, AST parsing, and robust error-free component props.
            </p>
            <div className="pt-2 border-t border-amber-500/10 text-[11px] text-amber-300/80 font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
              Best for: Type-safe TypeScript &amp; props
            </div>
          </div>

          {/* Quick Launch Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-[#141C2A] to-slate-900 border border-amber-500/30 flex flex-col justify-between space-y-3">
            <div>
              <span className="text-xs font-bold text-amber-400 tracking-wider uppercase">Action</span>
              <h4 className="text-sm font-semibold text-white mt-1">Ready to finish &amp; polish?</h4>
              <p className="text-xs text-slate-300 leading-relaxed mt-1">
                Open the Visual Page Editor to preview pages, inspect zones, and chat directly with your selected AI coding model.
              </p>
            </div>
            <Link
              href="/admin/editor"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
            >
              Open Visual Editor
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
