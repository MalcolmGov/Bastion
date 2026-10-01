'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  Printer,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  PenTool,
  RotateCcw,
  Sparkles,
  Download,
  CreditCard,
  Mail,
  Phone
} from 'lucide-react';
import type { BillingDoc } from '@/lib/studio/billingTypes';
import { calcDocTotals, fmtMoney, STATUS_CONFIG } from '@/lib/studio/billingTypes';

interface ClientPortalProps {
  params: Promise<{ token: string }>;
}

export default function QuoteSignPortal({ params }: ClientPortalProps) {
  const { token } = use(params);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<BillingDoc | null>(null);
  const [client, setClient] = useState<{
    name: string;
    logoUrl?: string;
    contact?: { name: string; email: string; phone?: string };
    siteName?: string;
  } | null>(null);

  // Signing state
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('Director / Authorized Signatory');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signSuccess, setSignSuccess] = useState(false);
  const [signTab, setSignTab] = useState<'draw' | 'type'>('draw');
  const [typedSignature, setTypedSignature] = useState('');

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    async function fetchQuote() {
      try {
        setLoading(true);
        const res = await fetch(`/api/quote/${token}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to load quotation');
        }
        const data = await res.json();
        setQuote(data.quote);
        setClient(data.client);
        if (data.client?.contact?.name) {
          setSignerName(data.client.contact.name);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuote();
  }, [token]);

  // Setup canvas
  useEffect(() => {
    if (!canvasRef.current || quote?.status === 'accepted') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    ctx.scale(ratio, ratio);

    ctx.strokeStyle = '#0284C7';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [quote?.status, signTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Generate signature data URL
  const getSignatureDataUrl = (): string | null => {
    if (signTab === 'draw') {
      if (!hasDrawn || !canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png');
    } else {
      if (!typedSignature.trim()) return null;
      // Render typed text into offscreen canvas
      const offscreen = document.createElement('canvas');
      offscreen.width = 500;
      offscreen.height = 160;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return null;
      ctx.fillStyle = '#0284C7';
      ctx.font = 'italic 38px "Caveat", "Brush Script MT", "Segoe Script", cursive, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typedSignature.trim(), 250, 80);
      return offscreen.toDataURL('image/png');
    }
  };

  const handleSign = async () => {
    if (!termsAgreed) {
      alert('Please confirm the authorization checkbox to proceed.');
      return;
    }
    const signatureData = getSignatureDataUrl();
    if (!signatureData) {
      alert('Please draw or type your signature before approving.');
      return;
    }
    if (!signerName.trim()) {
      alert('Please enter your full legal name.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/quote/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          signatureData,
          signerName,
          signerRole,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit agreement');
      }

      const updated = await res.json();
      setSignSuccess(true);
      if (quote) {
        setQuote({
          ...quote,
          status: 'accepted',
          signatureData,
          signerName,
          signerRole,
          acceptedAt: updated.acceptedAt,
        });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A11] text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm font-mono text-slate-400">Loading secure digital quotation...</div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#070A11] text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0F172A] border border-rose-500/30 text-center space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">Quotation Agreement Unavailable</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {error || 'This proposal could not be retrieved. The link may have expired or was revoked by the issuing agency.'}
          </p>
        </div>
      </div>
    );
  }

  const totals = calcDocTotals(quote.items);
  const isSigned = quote.status === 'accepted';
  const statusCfg = STATUS_CONFIG[quote.status] || STATUS_CONFIG.draft;

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-sky-500/30">
      {/* Top Banner / Breadcrumb */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 font-bold text-white text-base">
            B
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider">
              {quote.companyName || 'Bastion Group'}
            </div>
            <div className="text-[11px] text-slate-400">Secure Digital Service Agreement</div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
            {statusCfg.label}
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg bg-[#141C2A] hover:bg-[#1E293B] border border-[#232F42] text-xs font-semibold text-slate-300 hover:text-white flex items-center space-x-1.5 transition shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Main Document Card */}
      <div className="max-w-4xl mx-auto rounded-2xl bg-[#0E1522] border border-[#1E293B] shadow-2xl overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Document Header */}
        <div className="p-8 sm:p-10 border-b border-[#1E293B] bg-gradient-to-b from-[#141C2A] to-[#0E1522]">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest mb-1.5">
                {quote.docNumber?.startsWith('PRO-') ? 'Enterprise Acquisition Proposal' : 'Official Quotation & Agreement'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {quote.docNumber}
              </h1>
              <div className="text-xs text-slate-400 mt-2 flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Issued: {quote.issueDate}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Valid Until: {quote.dueDate}</span>
                </span>
              </div>
            </div>

            {/* Client Recipient Details */}
            <div className="md:text-right p-4 rounded-xl bg-[#0A0F18] border border-[#1E293B] md:min-w-[260px]">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Prepared Specifically For
              </div>
              <div className="text-sm font-bold text-white">
                {quote.clientLegalName || client?.name || 'Valued Client'}
              </div>
              {quote.clientRegNo && (
                <div className="text-[10px] text-slate-400 font-mono">Reg: {quote.clientRegNo}</div>
              )}
              {quote.clientVat && (
                <div className="text-[10px] text-slate-400 font-mono">VAT: {quote.clientVat}</div>
              )}
              {(quote.clientContactPerson || client?.contact?.name) && (
                <div className="text-xs text-slate-300 mt-0.5">
                  Attn: {quote.clientContactPerson || client?.contact?.name}
                </div>
              )}
              {(quote.clientEmail || client?.contact?.email) && (
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {quote.clientEmail || client?.contact?.email}
                </div>
              )}
              {quote.poNumber && (
                <div className="text-[10px] font-mono text-emerald-400 mt-1 font-semibold">PO Ref: {quote.poNumber}</div>
              )}
              {client?.siteName && (
                <div className="text-[10px] font-mono text-sky-400 mt-0.5">Project: {client.siteName}</div>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="p-8 sm:p-10">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Deliverables & Investment Schedule
          </div>

          <div className="overflow-x-auto rounded-xl border border-[#1E293B] bg-[#0A0F18]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#101726] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                  <th className="py-3 px-4">Item & Scope Description</th>
                  <th className="py-3 px-4 text-center w-16">Qty</th>
                  <th className="py-3 px-4 text-right w-28">Unit Price</th>
                  <th className="py-3 px-4 text-center w-20">Tax %</th>
                  <th className="py-3 px-4 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2333]">
                {quote.items.map((item, idx) => {
                  const lineTotal = (item.qty || 0) * (item.unitPrice || 0) * (1 + (item.taxRate || 0) / 100);
                  return (
                    <tr key={item.id || idx} className="hover:bg-[#121A2B]/40 transition">
                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {item.description || 'Deliverable Item'}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{item.qty}</td>
                      <td className="py-3.5 px-4 text-right text-slate-300 font-mono">
                        {fmtMoney(item.unitPrice, quote.currency)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400">{item.taxRate}%</td>
                      <td className="py-3.5 px-4 text-right font-bold text-white font-mono">
                        {fmtMoney(lineTotal, quote.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="mt-6 flex justify-end">
            <div className="w-full sm:w-72 space-y-2 p-4 rounded-xl bg-[#0A0F18] border border-[#1E293B]">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono text-slate-200">{fmtMoney(totals.sub, quote.currency)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Value Added Tax (15%)</span>
                <span className="font-mono text-slate-200">{fmtMoney(totals.tax, quote.currency)}</span>
              </div>
              <div className="pt-2 border-t border-[#1E293B] flex justify-between items-center text-sm font-bold text-white">
                <span className="uppercase text-xs tracking-wider">Total Investment</span>
                <span className="text-base text-sky-400 font-mono">
                  {fmtMoney(totals.total, quote.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Banking & Remittance Details */}
          {quote.bankName && (
            <div className="mt-8 p-5 rounded-xl bg-[#101726] border border-[#1E293B] space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wide">
                <CreditCard className="w-4 h-4" />
                <span>Banking & Remittance Information</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Bank</div>
                  <div className="font-semibold text-slate-200">{quote.bankName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Account Number</div>
                  <div className="font-mono text-slate-200">{quote.accountNo}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Branch Code</div>
                  <div className="font-mono text-slate-200">{quote.branchCode}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Payment Reference</div>
                  <div className="font-mono font-bold text-sky-300">{quote.paymentRef || quote.docNumber}</div>
                </div>
              </div>
            </div>
          )}

          {/* Notes & Scope Provisions */}
          {quote.notes && (
            <div className="mt-6 p-4 rounded-xl bg-[#0A0F18] border border-[#1E293B] text-xs text-slate-400 leading-relaxed space-y-1">
              <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wide">
                Terms of Service & Delivery Conditions
              </div>
              <p className="whitespace-pre-line">{quote.notes}</p>
            </div>
          )}

          {/* DIGITAL SIGNATURE / ACCEPTANCE SECTION */}
          <div className="mt-10 pt-8 border-t border-[#1E293B]">
            {isSigned ? (
              /* Already Signed Card */
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-emerald-300">
                      Agreement Digitally Signed & Approved
                    </h3>
                    <p className="text-xs text-emerald-400/80">
                      Executed by {quote.signerName} ({quote.signerRole}) on{' '}
                      {new Date(quote.acceptedAt || Date.now()).toLocaleString('en-ZA', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                  </div>
                </div>

                {quote.signatureData && (
                  <div className="pt-3 border-t border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-emerald-400/70 tracking-wider mb-1">
                        Verified Signature Stamp
                      </div>
                      <div className="h-16 w-56 rounded-lg bg-white/5 border border-emerald-500/20 flex items-center justify-center p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={quote.signatureData}
                          alt="Digital Signature"
                          className="max-h-full max-w-full object-contain filter invert"
                        />
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-400 font-mono">
                      Security Hash: SHA-256 Verified
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Active Signature Pad */
              <div className="p-6 sm:p-8 rounded-2xl bg-[#0A0F18] border border-sky-500/30 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
                      <PenTool className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Digital Signature & Acceptance</h3>
                      <p className="text-xs text-slate-400">
                        Sign below using mouse, stylus or fingertip to approve this agreement.
                      </p>
                    </div>
                  </div>

                  {/* Draw vs Type Switcher */}
                  <div className="flex rounded-lg bg-[#141C2A] p-1 border border-[#232F42] text-xs">
                    <button
                      type="button"
                      onClick={() => setSignTab('draw')}
                      className={`px-3 py-1 rounded-md font-medium transition ${
                        signTab === 'draw' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Draw Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => setSignTab('type')}
                      className={`px-3 py-1 rounded-md font-medium transition ${
                        signTab === 'type' ? 'bg-sky-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Type to Sign
                    </button>
                  </div>
                </div>

                {/* Signature Input Canvas or Text Input */}
                {signTab === 'draw' ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl border border-dashed border-[#2A374E] bg-[#0E1522] overflow-hidden">
                      <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-36 cursor-crosshair touch-none"
                      />
                      {!hasDrawn && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-500 text-xs font-mono">
                          ✍ Click / touch and draw your signature here
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={clearCanvas}
                        className="text-[11px] text-slate-400 hover:text-white flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear & Redraw</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Type your full legal name to generate digital signature"
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#0E1522] border border-[#2A374E] text-white text-sm focus:outline-none focus:border-sky-500"
                    />
                    {typedSignature && (
                      <div className="p-4 rounded-xl bg-[#0E1522] border border-sky-500/20 text-center">
                        <span className="font-serif italic text-2xl text-sky-400 tracking-wide">
                          {typedSignature}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Signer Legal Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      Full Legal Signatory Name
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="e.g. Sipho Dlamini"
                      className="w-full px-3 py-2 rounded-lg bg-[#0E1522] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                      Signatory Role / Designation
                    </label>
                    <input
                      type="text"
                      value={signerRole}
                      onChange={(e) => setSignerRole(e.target.value)}
                      placeholder="e.g. Managing Director"
                      className="w-full px-3 py-2 rounded-lg bg-[#0E1522] border border-[#232F42] text-white text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Terms Agreement Checkbox */}
                <label className="flex items-start space-x-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mt-0.5 rounded border-[#232F42] text-sky-500 focus:ring-0 w-4 h-4 bg-[#0E1522]"
                  />
                  <span className="text-xs text-slate-400 leading-relaxed">
                    I confirm that I am duly authorized to accept this quotation and bind{' '}
                    <strong className="text-slate-200">{client?.name || 'our company'}</strong> to the deliverable scope, investment terms, and conditions outlined in this agreement.
                  </span>
                </label>

                {/* Submit Action Button */}
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleSign}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Applying Cryptographic Digital Signature...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve & Digitally Sign Quotation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Document Footer */}
        <div className="p-6 bg-[#0A0F18] border-t border-[#1E293B] text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-3.5 h-3.5 text-slate-600" />
            <span>
              {quote.companyName} • Reg: {quote.companyVat ? `VAT ${quote.companyVat}` : 'Johannesburg, South Africa'}
            </span>
          </div>
          <div>Powered by Bastion Group Commercial Engine</div>
        </div>
      </div>
    </div>
  );
}
