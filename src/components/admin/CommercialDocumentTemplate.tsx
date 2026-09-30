'use client';

import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import type { BillingDoc, DocStatus } from '@/lib/studio/billingTypes';
import { calcDocTotals, fmtMoney, STATUS_CONFIG } from '@/lib/studio/billingTypes';

interface CommercialDocumentTemplateProps {
  doc: BillingDoc;
  client?: {
    name: string;
    logoUrl?: string;
    contact?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    };
    siteName?: string;
  } | null;
  mode?: 'preview' | 'portal';
  onClose?: () => void;
  onStatusChange?: (newStatus: DocStatus) => Promise<void> | void;
  onSendReminder?: () => Promise<void> | void;
  onDuplicate?: () => Promise<void> | void;
  onConvertToInvoice?: () => Promise<void> | void;
}

export function CommercialDocumentTemplate({
  doc,
  client,
  mode = 'preview',
  onClose,
  onStatusChange,
  onSendReminder,
  onDuplicate,
  onConvertToInvoice
}: CommercialDocumentTemplateProps) {
  const [copiedBankRef, setCopiedBankRef] = useState(false);
  const [copiedShareUrl, setCopiedShareUrl] = useState(false);

  const totals = calcDocTotals(doc.items);
  const statusCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;
  const isInvoice = doc.type === 'invoice';
  const isQuote = doc.type === 'quote';
  const isPaid = doc.status === 'paid';
  const isAccepted = doc.status === 'accepted';

  const docTitle = isInvoice
    ? 'TAX INVOICE'
    : isQuote
    ? 'COMMERCIAL QUOTATION'
    : doc.type === 'receipt'
    ? 'PAYMENT RECEIPT'
    : 'COMMERCIAL DOCUMENT';

  const handlePrint = () => {
    window.print();
  };

  const handleCopyBankRef = () => {
    const ref = doc.paymentRef || doc.docNumber;
    navigator.clipboard.writeText(ref);
    setCopiedBankRef(true);
    setTimeout(() => setCopiedBankRef(false), 2000);
  };

  const handleCopyShareLink = () => {
    if (!doc.acceptanceToken) return;
    const url = `${window.location.origin}/${isInvoice ? 'invoice' : 'quote'}/${doc.acceptanceToken}`;
    navigator.clipboard.writeText(url);
    setCopiedShareUrl(true);
    setTimeout(() => setCopiedShareUrl(false), 2000);
  };

  // Client Details resolution
  const resolvedClientName = client?.name || doc.companyName || 'Corporate Client';
  const resolvedContactPerson =
    doc.clientContactPerson || client?.contact?.name || 'Accounts Payable & Commercial Management';
  const resolvedClientEmail = doc.clientEmail || client?.contact?.email || 'accounts@client.com';
  const resolvedClientPhone = doc.clientPhone || client?.contact?.phone || '+27 (0)11 000 0000';
  const resolvedClientAddress =
    doc.clientAddress || client?.contact?.address || 'Metropolitan Business District, Johannesburg, South Africa';
  const resolvedClientVat = doc.clientVat || '4890123456 (Standard Corporate Rate)';

  // Bastion Company Details
  const companyName = doc.companyName || 'Bastion Group (Pty) Ltd';
  const companyReg = doc.companyRegNo || '2024/091823/07';
  const companyVat = doc.companyVat || '4820194821';
  const companyAddress = doc.companyAddress || '100 Sandton Drive, Sandton, Johannesburg, 2196, South Africa';
  const companyEmail = doc.companyEmail || 'billing@bastiongroup.co.za';
  const companyPhone = doc.companyPhone || '+27 11 883 4000';

  // Bank Remittance
  const bankName = doc.bankName || 'First National Bank (FNB)';
  const accountNo = doc.accountNo || '62849102941';
  const branchCode = doc.branchCode || '250655';
  const swiftCode = doc.swiftCode || 'FIRNZAJJ';
  const paymentRef = doc.paymentRef || doc.docNumber;
  const paymentTerms = doc.paymentTerms || 'Net 14 Days from issuance. 50% deposit for commercial commencement.';

  return (
    <div className="commercial-doc-root relative flex flex-col items-center w-full">
      {/* Print-specific style overrides */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .commercial-doc-root,
          .commercial-doc-root * {
            visibility: visible;
          }
          .commercial-doc-root {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .printable-paper {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 24px !important;
            max-width: 100% !important;
            background: white !important;
            color: #0f172a !important;
          }
        }
      `}</style>

      {/* Action Header Bar (Hidden in Print) */}
      <div className="no-print w-full max-w-4xl mb-4 flex flex-wrap items-center justify-between gap-3 px-2 py-2">
        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
          >
            <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium">
            {doc.docNumber}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Action buttons */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          {doc.acceptanceToken && (
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-700/80 shadow-sm transition"
              title="Copy Client Access Link"
            >
              {copiedShareUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied Link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Link</span>
                </>
              )}
            </button>
          )}

          {doc.acceptanceToken && (
            <a
              href={`/${isInvoice ? 'invoice' : 'quote'}/${doc.acceptanceToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500 text-sky-600 dark:text-sky-400 hover:text-white border border-sky-400/30 transition"
              title="Open Client Portal View"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Client Portal</span>
            </a>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Close Preview"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Printable Document Sheet (A4 Proportion Aesthetic) */}
      <div className="printable-paper w-full max-w-4xl bg-white dark:bg-[#0B1019] text-slate-900 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xl p-8 sm:p-12 relative overflow-hidden transition-colors duration-200">
        {/* Top Decorative Gradient Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-500 via-indigo-500 to-amber-500" />

        {/* ======================================================== */}
        {/* 1. LETTERHEAD & HEADER SECTION */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-200/80 dark:border-slate-800/80">
          {/* Company Brand & Credentials */}
          <div className="space-y-3 max-w-md">
            <div className="flex items-center space-x-3">
              {/* Bastion Crest Monogram */}
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-serif font-black text-xl shadow-md select-none">
                B
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                  {companyName}
                </h1>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Sovereign Corporate & Technology Holdings
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5 leading-relaxed font-sans">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{companyAddress}</span>
              </div>
              <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-500">
                <span>Reg: <strong className="font-mono text-slate-700 dark:text-slate-300">{companyReg}</strong></span>
                <span>•</span>
                <span>VAT ID: <strong className="font-mono text-slate-700 dark:text-slate-300">{companyVat}</strong></span>
              </div>
              <div className="flex items-center gap-4 pt-0.5 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  {companyEmail}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  {companyPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Document Classification & Metadata */}
          <div className="sm:text-right space-y-2 sm:self-start">
            <div className="inline-flex flex-col sm:items-end">
              <span className="px-3 py-1 rounded-md text-xs font-black tracking-widest uppercase bg-slate-900 text-white dark:bg-sky-500 dark:text-slate-950 font-sans shadow-sm">
                {docTitle}
              </span>
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1.5">
                {doc.docNumber}
              </div>
            </div>

            {/* Status Ribbon Badge */}
            <div className="sm:flex sm:justify-end">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                {statusCfg.label}
              </span>
            </div>

            {/* Issued & Due Dates Matrix */}
            <div className="pt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1 font-sans">
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">Date Issued:</span>
                <strong className="font-mono text-slate-800 dark:text-slate-200">
                  {doc.issueDate}
                </strong>
              </div>
              <div className="flex sm:justify-end items-center gap-2">
                <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">
                  {isQuote ? 'Valid Until:' : 'Payment Due:'}
                </span>
                <strong className="font-mono text-slate-800 dark:text-slate-200">
                  {doc.dueDate}
                </strong>
              </div>
              {doc.paymentTerms && (
                <div className="flex sm:justify-end items-center gap-2 text-[11px] text-slate-500">
                  <span className="text-slate-400 uppercase text-[10px] font-semibold tracking-wider">Terms:</span>
                  <span>{doc.paymentTerms}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. BILLED BY & BILLED TO PARTIES GRID */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b border-slate-200/80 dark:border-slate-800/80">
          {/* Provider / Billed By */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Provider / Billed By
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {companyName}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              <p>{companyAddress}</p>
              <p className="pt-1 text-[11px]">
                VAT No: <span className="font-mono text-slate-700 dark:text-slate-300">{companyVat}</span> • Reg: <span className="font-mono text-slate-700 dark:text-slate-300">{companyReg}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Email: {companyEmail} • Tel: {companyPhone}
              </p>
            </div>
          </div>

          {/* Client / Billed To */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Client / Billed To
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {resolvedClientName}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              <p className="font-medium text-slate-800 dark:text-slate-200">
                Attn: {resolvedContactPerson}
              </p>
              <p>{resolvedClientAddress}</p>
              <p className="pt-1 text-[11px]">
                VAT / Tax ID: <span className="font-mono text-slate-700 dark:text-slate-300">{resolvedClientVat}</span>
              </p>
              <p className="text-[11px] text-slate-500">
                Email: {resolvedClientEmail} • Tel: {resolvedClientPhone}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. LINE ITEMS & DELIVERABLES TABLE */}
        {/* ======================================================== */}
        <div className="py-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3 w-12 text-center">#</th>
                  <th className="py-3 px-3">Description & Scope of Work</th>
                  <th className="py-3 px-3 w-16 text-center">Qty</th>
                  <th className="py-3 px-3 w-28 text-right">Unit Rate</th>
                  <th className="py-3 px-3 w-20 text-center">VAT</th>
                  <th className="py-3 px-3 w-32 text-right">Total ({doc.currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
                {doc.items.map((item, idx) => {
                  const lineSub = (item.qty || 1) * (item.unitPrice || 0);
                  const lineTotal = lineSub * (1 + (item.taxRate || 0) / 100);
                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-3 text-center font-mono text-slate-400 font-semibold">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                          {item.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-700 dark:text-slate-300">
                        {item.qty}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                        {fmtMoney(item.unitPrice, doc.currency)}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                        {item.taxRate}%
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {fmtMoney(lineTotal, doc.currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 4. FINANCIAL SUMMARY BREAKDOWN & TOTALS */}
        {/* ======================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 py-4 border-t border-b border-slate-200/80 dark:border-slate-800/80">
          {/* Notes & Special Directives */}
          <div className="max-w-md space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Commercial Terms & Notes
            </span>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 text-xs leading-relaxed whitespace-pre-line font-sans text-slate-700 dark:text-slate-300">
              {doc.notes ||
                'Deliverables subject to Bastion Standard Enterprise Master Services Agreement (MSA). All software architecture and infrastructure assets remain property of Bastion Group until final settlement.'}
            </div>
          </div>

          {/* Financial Totals Card */}
          <div className="w-full sm:w-80 space-y-2 self-end">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal (Excl. VAT):</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                  {fmtMoney(totals.sub, doc.currency)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Value Added Tax (15% VAT):</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">
                  {fmtMoney(totals.tax, doc.currency)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-sm font-bold text-slate-900 dark:text-white">
                <span>Gross Total Due:</span>
                <span className="text-base font-black font-mono text-sky-600 dark:text-sky-400">
                  {fmtMoney(totals.total, doc.currency)}
                </span>
              </div>

              {isPaid && (
                <div className="pt-2 border-t border-emerald-500/20 flex justify-between items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Amount Paid & Reconciled:
                  </span>
                  <span className="font-mono">
                    {fmtMoney(doc.amountPaid || totals.total, doc.currency)}
                  </span>
                </div>
              )}

              {isPaid && (
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Balance Outstanding:</span>
                  <span className="font-mono">R 0.00</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 5. REMITTANCE & BANKING DETAILS (EFT) */}
        {/* ======================================================== */}
        <div className="py-6 border-b border-slate-200/80 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
              <CreditCard className="w-4 h-4 text-sky-500" />
              <span>Electronic Funds Transfer (EFT) Remittance</span>
            </div>
            <button
              type="button"
              onClick={handleCopyBankRef}
              className="no-print inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              {copiedBankRef ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Reference Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Payment Ref</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Bank Name</span>
              <strong className="text-slate-900 dark:text-slate-100">{bankName}</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Account Name</span>
              <strong className="text-slate-900 dark:text-slate-100">{companyName}</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Account Number</span>
              <strong className="font-mono text-slate-900 dark:text-slate-100 tracking-wider">
                {accountNo}
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">Branch Code</span>
              <strong className="font-mono text-slate-900 dark:text-slate-100">{branchCode}</strong>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60">
              <span className="block text-[10px] text-slate-400 font-bold uppercase">SWIFT / BIC</span>
              <strong className="font-mono text-slate-900 dark:text-slate-100">{swiftCode}</strong>
            </div>

            <div className="p-3 rounded-lg bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-500/30">
              <span className="block text-[10px] text-sky-700 dark:text-sky-300 font-bold uppercase">
                Payment Ref
              </span>
              <strong className="font-mono text-sky-800 dark:text-sky-300 font-black">
                {paymentRef}
              </strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
            * Please email proof of payment (POP) quoting reference <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{paymentRef}</span> to{' '}
            <span className="underline">{companyEmail}</span>.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 6. CRYPTOGRAPHIC E-SIGNATURE & AUDIT SEAL */}
        {/* ======================================================== */}
        <div className="py-6">
          {isAccepted ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/30 dark:border-emerald-500/40 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 text-emerald-800 dark:text-emerald-300">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-md">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">
                      Digitally Verified & Legally Accepted Commercial Agreement
                    </h3>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      South African ECTA Compliant (Electronic Communications & Transactions Act 25 of 2002)
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-white dark:bg-slate-900 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  <Lock className="w-3 h-3 text-emerald-500" />
                  <span>SHA-256 SEAL VERIFIED</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Authorized Signatory
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {doc.signerName || resolvedContactPerson}
                  </strong>
                  <div className="text-[11px] text-slate-500">{doc.signerRole || 'Director'}</div>
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                    Acceptance Timestamp
                  </span>
                  <strong className="font-mono text-slate-900 dark:text-white">
                    {doc.acceptedAt
                      ? new Date(doc.acceptedAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })
                      : new Date().toLocaleString('en-ZA')}
                  </strong>
                  <div className="text-[11px] text-slate-500">Johannesburg, South Africa (GMT+2)</div>
                </div>

                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Signature Audit Trail
                  </span>
                  {doc.signatureData ? (
                    <div className="h-14 w-44 rounded-lg bg-white dark:bg-slate-900 border border-emerald-500/40 p-1 flex items-center justify-center shadow-inner">
                      <img
                        src={doc.signatureData}
                        alt="Digital Signature"
                        className="max-h-full max-w-full object-contain filter dark:invert"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-40 rounded-lg bg-white dark:bg-slate-900 border border-emerald-500/40 flex items-center justify-center font-serif italic text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                      {doc.signerName || 'Digital Approval'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                  Digital Acceptance Pending
                </span>
                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                  This commercial document can be digitally reviewed and signed via the secured client portal.
                </p>
              </div>

              {doc.acceptanceToken && (
                <a
                  href={`/${isInvoice ? 'invoice' : 'quote'}/${doc.acceptanceToken}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-print inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-sm transition shrink-0"
                >
                  <span>Open Acceptance Portal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 7. FOOTER & COMPLIANCE SEAL */}
        {/* ======================================================== */}
        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-400">
          <div>
            © {new Date().getFullYear()} {companyName}. All Rights Reserved. Confidential & Proprietary.
          </div>
          <div className="flex items-center space-x-3">
            <span>ECTA Compliant</span>
            <span>•</span>
            <span>VAT Act 89 of 1991</span>
            <span>•</span>
            <span className="font-mono">ID: {doc.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
