'use client';

import React, { useState, useEffect, use } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  Download,
  CreditCard,
  Mail,
  Phone,
  ArrowLeft,
  Check,
  Copy,
  PenTool
} from 'lucide-react';
import type { BillingDoc } from '@/lib/studio/billingTypes';
import { CommercialDocumentTemplate } from '@/components/admin/CommercialDocumentTemplate';

interface InvoicePortalProps {
  params: Promise<{ token: string }>;
}

export default function InvoicePortalPage({ params }: InvoicePortalProps) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<BillingDoc | null>(null);
  const [client, setClient] = useState<{
    name: string;
    logoUrl?: string;
    contact?: { name: string; email: string; phone?: string; address?: string };
    siteName?: string;
  } | null>(null);

  // Digital Acknowledgement
  const [acknowledged, setAcknowledged] = useState(false);
  const [ackName, setAckName] = useState('');
  const [ackSubmitting, setAckSubmitting] = useState(false);
  const [showAckModal, setShowAckModal] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        const res = await fetch(`/api/invoice/${token}`);
        if (!res.ok) {
          // Fallback to quote endpoint if needed
          const fallbackRes = await fetch(`/api/quote/${token}`);
          if (!fallbackRes.ok) {
            throw new Error('Invoice not found or the secure link has expired.');
          }
          const data = await fallbackRes.json();
          setInvoice(data.quote);
          setClient(data.client);
          if (data.client?.contact?.name) {
            setAckName(data.client.contact.name);
          }
          return;
        }
        const data = await res.json();
        setInvoice(data.invoice);
        setClient(data.client);
        if (data.client?.contact?.name) {
          setAckName(data.client.contact.name);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchInvoice();
  }, [token]);

  const handleAcknowledge = async () => {
    if (!invoice) return;
    try {
      setAckSubmitting(true);
      const res = await fetch(`/api/invoice/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge',
          signerName: ackName || 'Accounts Representative',
          signerRole: 'Commercial Client Representative',
        }),
      });
      if (res.ok) {
        setAcknowledged(true);
        setShowAckModal(false);
        // Refresh local invoice state
        setInvoice((prev) =>
          prev
            ? {
                ...prev,
                signerName: ackName || 'Accounts Representative',
                acceptedAt: new Date().toISOString(),
              }
            : null
        );
      }
    } catch (e) {
      console.error('Failed to acknowledge invoice:', e);
    } finally {
      setAckSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#070A0F] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-mono">Securing official tax invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-[#070A0F] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Document Not Available</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {error || 'This invoice link could not be located or may have expired.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/90 dark:bg-[#070A0F] text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6">
      {/* Top Client Portal Navigation Bar */}
      <div className="no-print max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white/80 dark:bg-[#0E1522]/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center font-serif font-black text-sm">
            B
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Bastion Corporate Billing Portal</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                SSL Secured
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Tax invoice prepared for {client?.name || invoice.companyName || 'Corporate Client'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!invoice.acceptedAt && !acknowledged && (
            <button
              type="button"
              onClick={() => setShowAckModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center space-x-1.5 transition"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Acknowledge Receipt</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Commercial Document Template */}
      <CommercialDocumentTemplate
        doc={invoice}
        client={client}
        mode="portal"
      />

      {/* Digital Acknowledgement Modal */}
      {showAckModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-sky-500" />
                Acknowledge Invoice Receipt
              </h3>
              <button
                type="button"
                onClick={() => setShowAckModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Confirm receipt of Tax Invoice <strong className="font-mono">{invoice.docNumber}</strong> on behalf of{' '}
              <strong>{client?.name || 'your organization'}</strong>.
            </p>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Your Full Name & Designation
              </label>
              <input
                type="text"
                value={ackName}
                onChange={(e) => setAckName(e.target.value)}
                placeholder="e.g. Sarah van der Merwe (Finance Director)"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAckModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={ackSubmitting || !ackName.trim()}
                onClick={handleAcknowledge}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-sky-500/20"
              >
                {ackSubmitting ? 'Confirming...' : 'Confirm Acknowledgement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
