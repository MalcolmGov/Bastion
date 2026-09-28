'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Shield } from 'lucide-react';
import type { DesignCollectionId } from '@/lib/studio/types';

interface ContactFormProps {
  props: {
    title: string;
    description?: string;
    submitButtonText?: string;
  };
  collection?: DesignCollectionId;
  variant?: string;
  isEditor?: boolean;
}

export function StudioContactForm({ props, collection = 'contemporary', variant = 'split_layout', isEditor }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const isImmersive = collection === 'immersive';
  const isEditorial = collection === 'editorial';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditor) return;
    setSubmitted(true);
  };

  return (
    <section className={`py-20 md:py-28 px-6 ${isImmersive ? 'bg-[#09090B] text-white' : isEditorial ? 'bg-[#F7F6F2] text-[#172C3D]' : 'bg-white text-slate-900'}`}>
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h2 className={`text-3xl sm:text-4xl font-bold tracking-tight ${isEditorial || isImmersive ? 'font-serif font-normal' : 'font-sans'}`}>
            {props.title}
          </h2>
          {props.description && (
            <p className={`text-base max-w-xl mx-auto ${isImmersive ? 'text-zinc-400' : 'text-slate-600'}`}>
              {props.description}
            </p>
          )}
        </div>

        <div className={`p-8 md:p-10 rounded-2xl ${isImmersive ? 'bg-[#141416] border border-[#27272A]' : isEditorial ? 'bg-white border border-[#E2E7EA] rounded-none shadow-sm' : 'bg-slate-50 border border-slate-200'}`}>
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-2xl font-bold">Mandate Received</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Thank you for your submission. Our senior partners review all inquiries under strict NDA and will respond within 24 hours.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-semibold text-sky-600 underline"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-500">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-500">
                    Corporate Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. e.vance@enterprise.com"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-500">
                  Telephone (Direct)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 20 7000 0000"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider text-slate-500">
                  Transaction / Mandate Summary
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline key objectives, estimated deal volume or requirements, and preferred timeline..."
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  <span>Confidentiality & Non-Disclosure Bound</span>
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 transition text-sm shadow-sm flex items-center space-x-2"
                >
                  <span>{props.submitButtonText || 'Submit Mandate'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
