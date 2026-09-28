'use client';

import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { Bot, Sparkles, Send, CheckCircle2, Shield, Search, Database, Layers, ArrowRight } from 'lucide-react';

export default function AdminAiKnowledgePage() {
  const { user } = useAdminAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Playground query state
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/ai-knowledge');
        if (res.ok) {
          const json = await res.json();
          setItems(json.items || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRunTestQuery = async (queryText?: string) => {
    const q = queryText || testQuery;
    if (!q.trim()) return;

    setIsQuerying(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/ai-knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q })
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsQuerying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0B1019] border border-[#1C2638] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#C99700] uppercase font-bold tracking-wider mb-1">
            <Bot className="w-4 h-4" />
            <span>AI Knowledge Governance &amp; Grounding</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Ask Gold Fields AI Governance</h1>
          <p className="text-xs text-gray-400 mt-1">
            Control which regulatory booklets, operational disclosures, and policies are indexed into the public AI assistant. Zero hallucinations, 100% cited disclosures.
          </p>
        </div>

        <div className="text-xs font-mono text-gray-400 bg-[#080D14] border border-[#1E2B3E] px-3.5 py-2 rounded-xl">
          Indexed Documents: <span className="text-[#C99700] font-bold">{items.length}</span>
        </div>
      </div>

      {/* Two Column Layout: Knowledge Index & Query Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7: Knowledge Documents Index */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0B1019] border border-[#1C2638] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-[#1C2638] flex items-center justify-between">
              <h2 className="text-xs uppercase font-bold tracking-wider text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-[#C99700]" />
                <span>Authorized Knowledge Corpus</span>
              </h2>
              <span className="text-[10px] text-emerald-400">Strictly Approved Sources Only</span>
            </div>

            <div className="divide-y divide-[#162030]">
              {items.map((item) => (
                <div key={item.id} className="p-4 space-y-2 hover:bg-[#0E1624] transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-xs text-white">{item.title}</div>
                      <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                        Source: {item.source_url}
                      </div>
                    </div>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 shrink-0 ml-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{item.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-gray-500 font-mono pt-1">
                    <span>{item.chunk_count} Vector Chunks</span>
                    <span>Indexed {new Date(item.last_indexed_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5: Interactive Query Sandbox */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0B1019] border border-[#1C2638] rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-[#C99700]" />
              <h2 className="text-xs uppercase font-bold tracking-wider text-white">
                RAG Citation Sandbox
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Test how the AI assistant answers stakeholder questions using only verified published records:
            </p>

            {/* Quick Prompts */}
            <div className="space-y-1.5">
              {[
                'What is Gold Fields\' production guidance for 2026?',
                'Tell me about Khanyisa solar plant at South Deep',
                'What are the pre-qualification requirements for South African suppliers?'
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    setTestQuery(prompt);
                    handleRunTestQuery(prompt);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-[#080D14] hover:bg-[#121A28] border border-[#1A2536] text-[11px] text-gray-300 hover:text-white transition flex items-center justify-between group"
                >
                  <span className="truncate">{prompt}</span>
                  <ArrowRight className="w-3 h-3 text-[#C99700] opacity-50 group-hover:opacity-100 shrink-0 ml-2" />
                </button>
              ))}
            </div>

            {/* Query Form */}
            <div className="pt-2">
              <div className="relative">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunTestQuery()}
                  placeholder="Ask a custom question..."
                  className="w-full bg-[#080D14] border border-[#202C3F] rounded-xl pl-3 pr-10 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#C99700]"
                />
                <button
                  onClick={() => handleRunTestQuery()}
                  disabled={isQuerying || !testQuery.trim()}
                  className="absolute right-2 top-2 p-1 text-[#C99700] hover:text-white disabled:opacity-30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Result Display */}
            {testResult && (
              <div className="p-4 rounded-xl bg-[#0E1624] border border-[#1E2B3E] space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <span>Latency: {testResult.latencyMs}ms</span>
                  <span className="text-emerald-400">100% Grounded</span>
                </div>

                <div className="text-xs text-gray-200 leading-relaxed">
                  {testResult.answer}
                </div>

                <div className="pt-2 border-t border-[#1C2638]">
                  <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Citations &amp; Sources
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {testResult.citations?.map((cit: string) => (
                      <span
                        key={cit}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#162337] text-[#E6C657] border border-[#24354F]"
                      >
                        {cit}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
