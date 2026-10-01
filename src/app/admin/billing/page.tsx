'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  Receipt,
  CheckCircle2,
  Clock,
  Send,
  Plus,
  Copy,
  ExternalLink,
  Trash2,
  Eye,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  CreditCard,
  Download,
  Filter,
  Check,
  BellRing,
  RotateCcw,
  Sparkles,
  Layers,
  Printer,
  ChevronDown
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import type { BillingDoc, LineItem, DocType, DocStatus } from '@/lib/studio/billingTypes';
import { calcDocTotals, fmtMoney, STATUS_CONFIG } from '@/lib/studio/billingTypes';
import { CommercialDocumentTemplate } from '@/components/admin/CommercialDocumentTemplate';

export default function AdminBillingPage() {
  const { clients, activeClient, activeSite } = useStudioWorkspace();

  const [docs, setDocs] = useState<BillingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'quote' | 'invoice'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<BillingDoc | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Form State for New/Edit Doc
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocType>('quote');
  const [targetClientId, setTargetClientId] = useState<string>('');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('R');
  const [paymentTerms, setPaymentTerms] = useState('Net 14 Days. 50% deposit on acceptance, 50% on project delivery.');
  const [clientLegalName, setClientLegalName] = useState('');
  const [clientRegNo, setClientRegNo] = useState('');
  const [clientContactPerson, setClientContactPerson] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientVat, setClientVat] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [isClientCompliant, setIsClientCompliant] = useState(false);

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 'item_1', description: 'Enterprise Portal Engineering & Custom Design System', qty: 1, unitPrice: 45000, taxRate: 15 },
    { id: 'item_2', description: 'Headless CMS Architecture & Multi-Site Content Integration', qty: 1, unitPrice: 20000, taxRate: 15 },
    { id: 'item_3', description: 'High-Availability Cloud Infrastructure & 24/7 SLA (Annual)', qty: 1, unitPrice: 18000, taxRate: 15 },
  ]);
  const [notes, setNotes] = useState(
    'Payment Terms: 50% deposit upon digital signature acceptance, 50% upon deployment.\nBank remittance details listed below.'
  );
  const [bankName, setBankName] = useState('First National Bank (FNB)');
  const [accountNo, setAccountNo] = useState('62849102941');
  const [branchCode, setBranchCode] = useState('250655');
  const [swiftCode, setSwiftCode] = useState('FIRNZAJJ');

  // Trigger brief feedback toast
  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  // Fetch docs
  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/billing');
      if (res.ok) {
        const data = await res.json();
        setDocs(data.docs || []);
      }
    } catch (e) {
      console.error('Failed to load billing docs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  useEffect(() => {
    if (activeClient && !targetClientId) {
      setTargetClientId(activeClient.id);
      populateClientFields(activeClient.id);
    }
  }, [activeClient, targetClientId]);

  // Populate client details helper
  const populateClientFields = (clientId: string) => {
    const selected = clients.find((c) => c.id === clientId) as any;
    if (selected) {
      const b = selected.billingDetails || {};
      const primaryContact = selected.primaryContact || {};

      const legalName = b.legalEntityName || selected.name || 'Commercial Client';
      const regNo = b.registrationNumber || '';
      const vat = b.vatNumber || selected.vatNumber || '';
      const contactPerson = b.billingContactName || primaryContact.name || selected.name || 'Accounts Payable';
      const email = b.billingEmail || primaryContact.email || 'accounts@client.com';
      const phone = b.billingPhone || primaryContact.phone || '+27 11 000 0000';
      const address = b.billingAddress || primaryContact.address || selected.headquarters || 'Sandton, Johannesburg, South Africa';

      setClientLegalName(legalName);
      setClientRegNo(regNo);
      setClientVat(vat);
      setClientContactPerson(contactPerson);
      setClientEmail(email);
      setClientPhone(phone);
      setClientAddress(address);
      if (b.currency) setCurrency(b.currency);
      if (b.paymentTerms) setPaymentTerms(b.paymentTerms);
      setIsClientCompliant(!!(b.registrationNumber || b.vatNumber));
    }
  };

  const handleClientSelectChange = (newClientId: string) => {
    setTargetClientId(newClientId);
    populateClientFields(newClientId);
  };

  // Handle open create modal
  const handleOpenCreate = (type: DocType = 'quote') => {
    setDocType(type);
    setEditingDocId(null);
    const chosenClientId = activeClient?.id || (clients[0]?.id ?? 'client_swifter');
    setTargetClientId(chosenClientId);
    populateClientFields(chosenClientId);

    const randNum = Math.floor(1000 + Math.random() * 9000);
    setDocNumber(`${type === 'quote' ? 'QUO' : 'INV'}-${randNum}`);
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]);
    setPaymentTerms('Net 14 Days. 50% deposit on acceptance, 50% on project delivery.');
    setLineItems([
      { id: 'item_1', description: 'Enterprise Portal Engineering & Custom Design System', qty: 1, unitPrice: 45000, taxRate: 15 },
      { id: 'item_2', description: 'Headless CMS Architecture & Multi-Site Content Integration', qty: 1, unitPrice: 20000, taxRate: 15 },
      { id: 'item_3', description: 'High-Availability Cloud Infrastructure & 24/7 SLA (Annual)', qty: 1, unitPrice: 18000, taxRate: 15 },
    ]);
    setIsCreateOpen(true);
  };

  // Line item helpers
  const handleItemChange = (index: number, field: keyof LineItem, val: any) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: val };
    setLineItems(updated);
  };

  const handleAddItem = () => {
    setLineItems([
      ...lineItems,
      { id: `item_${Date.now()}`, description: '', qty: 1, unitPrice: 0, taxRate: 15 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  // Save document
  const handleSaveDoc = async (status: DocStatus = 'sent') => {
    try {
      const selectedClient = clients.find((c) => c.id === targetClientId);
      const payload: Partial<BillingDoc> = {
        id: editingDocId || undefined,
        clientId: targetClientId,
        siteId: activeSite?.id || undefined,
        type: docType,
        status,
        docNumber,
        issueDate,
        dueDate,
        currency,
        items: lineItems,
        notes,
        bankName,
        accountNo,
        branchCode,
        swiftCode,
        paymentRef: docNumber,
        paymentTerms,
        companyName: 'Bastion Group (Pty) Ltd',
        companyAddress: '100 Sandton Drive, Sandton, Johannesburg, 2196, South Africa',
        companyEmail: 'billing@bastiongroup.co.za',
        companyPhone: '+27 11 883 4000',
        companyVat: '4820194821',
        companyRegNo: '2024/091823/07',
        clientLegalName,
        clientRegNo,
        poNumber,
        clientContactPerson,
        clientEmail,
        clientPhone,
        clientAddress,
        clientVat,
      };

      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        await fetchDocs();
        showToast(`Document ${docNumber} saved successfully (${status.toUpperCase()})`);
      }
    } catch (e) {
      console.error('Failed to save document:', e);
    }
  };

  // Convert quote to invoice
  const handleConvertToInvoice = async (docId: string) => {
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'convert_to_invoice', docId }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDocs();
        showToast(`Quotation converted to Tax Invoice ${data.docNumber}!`);
      }
    } catch (e) {
      console.error('Failed to convert quote:', e);
    }
  };

  // Send to Client
  const handleSendToClient = async (docId: string, docNum: string) => {
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', docId }),
      });
      if (res.ok) {
        await fetchDocs();
        showToast(`Document ${docNum} dispatched to client with portal link!`);
      }
    } catch (e) {
      console.error('Failed to send doc:', e);
    }
  };

  // Send Payment Reminder
  const handleSendReminder = async (docId: string, docNum: string) => {
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_reminder', docId }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDocs();
        showToast(`Automated payment reminder #${data.remindersCount} dispatched for ${docNum}`);
      }
    } catch (e) {
      console.error('Failed to send reminder:', e);
    }
  };

  // Update Status (paid, draft, sent, etc.)
  const handleUpdateStatus = async (docId: string, status: DocStatus) => {
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', docId, status }),
      });
      if (res.ok) {
        await fetchDocs();
        showToast(`Status updated to ${status.toUpperCase()}`);
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Duplicate Document
  const handleDuplicateDoc = async (docId: string) => {
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'duplicate', docId }),
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDocs();
        showToast(`Cloned into draft document ${data.docNumber}`);
      }
    } catch (e) {
      console.error('Failed to duplicate doc:', e);
    }
  };

  // Delete doc
  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to permanently delete this commercial document?')) return;
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', docId }),
      });
      if (res.ok) {
        await fetchDocs();
        showToast('Document deleted');
      }
    } catch (e) {
      console.error('Failed to delete doc:', e);
    }
  };

  // Copy portal link
  const handleCopyLink = (token: string, type: DocType) => {
    const fullUrl = `${window.location.origin}/${type === 'invoice' ? 'invoice' : 'quote'}/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
    showToast('Secure client portal link copied to clipboard!');
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Filtering
  const filteredDocs = docs.filter((d) => {
    if (filterType !== 'all' && d.type !== filterType) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (selectedClientFilter !== 'all' && d.clientId !== selectedClientFilter) return false;
    return true;
  });

  // Calculate metrics
  const totalQuoted = docs
    .filter((d) => d.type === 'quote')
    .reduce((acc, d) => acc + calcDocTotals(d.items).total, 0);

  const totalInvoiced = docs
    .filter((d) => d.type === 'invoice')
    .reduce((acc, d) => acc + calcDocTotals(d.items).total, 0);

  const totalPaid = docs
    .filter((d) => d.type === 'invoice' && d.status === 'paid')
    .reduce((acc, d) => acc + calcDocTotals(d.items).total, 0);

  const signedQuotesCount = docs.filter((d) => d.type === 'quote' && d.status === 'accepted').length;

  const currentFormTotals = calcDocTotals(lineItems);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-slate-900 dark:text-slate-100">
      {/* Feedback Toast */}
      {feedbackToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center space-x-2.5 text-xs font-semibold animate-in slide-in-from-bottom-3 duration-200 border border-slate-700 dark:border-slate-300">
          <Sparkles className="w-4 h-4 text-sky-400 dark:text-sky-600" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* PAGE HEADER */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 uppercase tracking-widest">
              Commercial Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">
            Commercial Quotes & Invoicing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Issue proposals, collect cryptographic digital signatures, and manage full enterprise invoicing.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleOpenCreate('quote')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quotation</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreate('invoice')}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#141C2A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white font-bold text-xs shadow-sm flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 KPI METRIC CARDS ROW (Modern Light/Dark Adaptive) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quoted */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Total Quoted</span>
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/40">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {fmtMoney(totalQuoted)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center space-x-1">
            <span>{docs.filter((d) => d.type === 'quote').length} active commercial proposals</span>
          </div>
        </div>

        {/* Signed Agreements */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Signed Agreements</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {signedQuotesCount}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            Digitally signed & legally accepted
          </div>
        </div>

        {/* Total Invoiced */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Total Invoiced</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/40">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {fmtMoney(totalInvoiced)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            {docs.filter((d) => d.type === 'invoice').length} issued tax invoices
          </div>
        </div>

        {/* Settled Revenue */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-[#1E293B] shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">Settled Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {fmtMoney(totalPaid)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Paid & reconciled in FNB
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FILTER AND SEARCH BAR (Modern Light/Dark Adaptive) */}
      {/* ======================================================== */}
      <div className="p-3 rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-[#1E293B] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Document Type Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#1A2333] text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'all'
                ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Docs ({docs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('quote')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'quote'
                ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Quotations ({docs.filter((d) => d.type === 'quote').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('invoice')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'invoice'
                ? 'bg-white dark:bg-sky-600 text-slate-900 dark:text-white font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Invoices ({docs.filter((d) => d.type === 'invoice').length})
          </button>
        </div>

        {/* Client & Status Filters */}
        <div className="flex items-center space-x-2 text-xs">
          <select
            value={selectedClientFilter}
            onChange={(e) => setSelectedClientFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0A0F18] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Clients</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#0A0F18] border border-slate-200 dark:border-[#1E293B] text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent to Client</option>
            <option value="accepted">Accepted / Signed</option>
            <option value="paid">Paid & Settled</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* ======================================================== */}
      {/* DOCUMENTS MANAGEMENT TABLE (Clean Light/Dark Adaptive) */}
      {/* ======================================================== */}
      <div className="rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200/90 dark:border-[#1E293B] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#1E293B] bg-slate-50/80 dark:bg-[#101726] text-slate-500 dark:text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Client Details</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Status & Reminders</th>
                <th className="py-3 px-4">Issued / Due</th>
                <th className="py-3 px-4 text-right">Management Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#1A2333]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading commercial documents...</span>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No commercial documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const totals = calcDocTotals(doc.items);
                  const clientObj = clients.find((c) => c.id === doc.clientId);
                  const statusCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;
                  const isAcceptedQuote = doc.type === 'quote' && doc.status === 'accepted';
                  const alreadyConverted = !!doc.convertedToInvoiceId;
                  const isInvoice = doc.type === 'invoice';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/70 dark:hover:bg-[#121A2B]/40 transition group">
                      {/* Document Details */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              doc.type === 'quote'
                                ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30'
                                : 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30'
                            }`}
                          >
                            {doc.type.toUpperCase()}
                          </span>
                          <span>{doc.docNumber}</span>
                        </div>
                        {doc.convertedFromQuoteId && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans font-normal mt-0.5">
                            From Quote
                          </div>
                        )}
                        {alreadyConverted && (
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-sans font-normal mt-0.5 flex items-center gap-1">
                            <span>→ Invoiced</span>
                          </div>
                        )}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                          <span>{doc.clientLegalName || clientObj?.name || doc.companyName || 'Corporate Client'}</span>
                          {doc.docNumber?.startsWith('PRO-') && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                              Enterprise Proposal
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <span>{doc.items.length} line items</span>
                          {doc.clientContactPerson && (
                            <>
                              <span>•</span>
                              <span>{doc.clientContactPerson}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        {fmtMoney(totals.total, doc.currency)}
                      </td>

                      {/* Status & Reminders */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                            <span>{statusCfg.label}</span>
                          </span>

                          {/* Reminder telemetry */}
                          {doc.remindersCount && doc.remindersCount > 0 ? (
                            <div className="text-[10px] text-sky-600 dark:text-sky-400 flex items-center gap-1 font-sans">
                              <BellRing className="w-3 h-3" />
                              <span>Reminded {doc.remindersCount}x</span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        <div>{doc.issueDate}</div>
                        <div className="text-[10px] text-slate-500">Due: {doc.dueDate}</div>
                      </td>

                      {/* Actions Toolbar */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Preview Button */}
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            title="Preview Document & Print"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141C2A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Link */}
                          {doc.acceptanceToken && (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(doc.acceptanceToken!, doc.type)}
                              title="Copy Client Portal Link"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141C2A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition shadow-sm"
                            >
                              {copiedToken === doc.acceptanceToken ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Send to Client action */}
                          {doc.status === 'draft' && (
                            <button
                              type="button"
                              onClick={() => handleSendToClient(doc.id, doc.docNumber)}
                              title="Dispatch to Client"
                              className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-600 border border-sky-200 dark:border-sky-500/40 text-sky-600 dark:text-sky-300 hover:text-white font-bold text-[10px] transition flex items-center space-x-1 shadow-sm"
                            >
                              <Send className="w-3 h-3" />
                              <span>Send</span>
                            </button>
                          )}

                          {/* Payment Reminder (for sent or overdue invoices) */}
                          {isInvoice && (doc.status === 'sent' || doc.status === 'overdue') && (
                            <button
                              type="button"
                              onClick={() => handleSendReminder(doc.id, doc.docNumber)}
                              title="Send Payment Reminder"
                              className="px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-600 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 hover:text-white font-bold text-[10px] transition flex items-center space-x-1 shadow-sm"
                            >
                              <BellRing className="w-3 h-3" />
                              <span>Remind</span>
                            </button>
                          )}

                          {/* Mark Paid action */}
                          {isInvoice && doc.status !== 'paid' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(doc.id, 'paid')}
                              title="Mark as Settled / Paid"
                              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:text-white font-bold text-[10px] transition shadow-sm"
                            >
                              Mark Paid
                            </button>
                          )}

                          {/* Mark Unpaid action (if paid) */}
                          {isInvoice && doc.status === 'paid' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(doc.id, 'sent')}
                              title="Mark as Unpaid"
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-semibold transition"
                            >
                              Unpaid
                            </button>
                          )}

                          {/* Convert quote to invoice */}
                          {doc.type === 'quote' && !alreadyConverted && (
                            <button
                              type="button"
                              onClick={() => handleConvertToInvoice(doc.id)}
                              className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 border border-indigo-200 dark:border-indigo-500/40 text-indigo-700 dark:text-indigo-300 hover:text-white font-bold text-[10px] transition flex items-center space-x-1 shadow-sm"
                            >
                              <span>→ Invoice</span>
                            </button>
                          )}

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateDoc(doc.id)}
                            title="Duplicate Document as Draft"
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#141C2A] dark:hover:bg-[#1E293B] border border-slate-200 dark:border-[#232F42] text-slate-500 hover:text-slate-800 dark:hover:text-white transition shadow-sm"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc.id)}
                            title="Delete Document"
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-transparent hover:border-rose-200 dark:hover:border-rose-500/30 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CREATE / EDIT DOCUMENT MODAL (Modern Light/Dark Adaptive) */}
      {/* ======================================================== */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#232F42] shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#1E293B]">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Create New {docType === 'quote' ? 'Commercial Quotation' : 'Tax Invoice'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure deliverables, client billing address, and EFT banking information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Recipient Client
                </label>
                <select
                  value={targetClientId}
                  onChange={(e) => handleClientSelectChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-sky-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Document Number
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs"
                >
                  <option value="R">ZAR (R)</option>
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  {docType === 'quote' ? 'Valid Until' : 'Payment Due Date'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="e.g. Net 14 Days"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs"
                />
              </div>
            </div>

            {/* Client Particulars Grid */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A0F18] border border-slate-200/90 dark:border-[#1E293B] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Client Corporate Particulars &amp; Tax Compliance
                </span>
                {isClientCompliant ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60 shrink-0 self-start sm:self-auto">
                    ✓ Populated from Onboarding (SARS &amp; CIPC Compliant)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 shrink-0 self-start sm:self-auto">
                    Standard Client Details
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1 font-semibold">
                    Registered Legal Entity
                  </label>
                  <input
                    type="text"
                    value={clientLegalName}
                    onChange={(e) => setClientLegalName(e.target.value)}
                    placeholder="e.g. Vodacom Group Limited"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1 font-semibold">
                    Company Reg No (CIPC)
                  </label>
                  <input
                    type="text"
                    value={clientRegNo}
                    onChange={(e) => setClientRegNo(e.target.value)}
                    placeholder="e.g. 1993/005461/06"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1 font-semibold">
                    Client VAT / Tax ID (SARS)
                  </label>
                  <input
                    type="text"
                    value={clientVat}
                    onChange={(e) => setClientVat(e.target.value)}
                    placeholder="e.g. 4010118149"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1 font-semibold">
                    Client PO Ref / Order #
                  </label>
                  <input
                    type="text"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    placeholder="e.g. PO-89210-VDCM"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Contact Person / Attention
                  </label>
                  <input
                    type="text"
                    value={clientContactPerson}
                    onChange={(e) => setClientContactPerson(e.target.value)}
                    placeholder="e.g. Nombuso Khumalo"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Accounts Payable Email
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="accounts.payable@client.com"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Registered Billing Address
                  </label>
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="e.g. Vodacom Corporate Park, 082 Vodacom Boulevard, Midrand"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Direct Telephone
                  </label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+27 11 546 1000"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Line Items & Scope Deliverables
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-500/20 hover:bg-sky-500 text-sky-600 dark:text-sky-300 hover:text-white border border-sky-200 dark:border-sky-400/30 text-xs font-bold transition flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#1E293B] grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Deliverable Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="100"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0E1522] border border-slate-200 dark:border-[#222E42] text-slate-900 dark:text-white text-xs text-right font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-center text-slate-500 dark:text-slate-400 font-mono">15%</div>
                    <div className="col-span-1 text-right">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-500 hover:text-rose-600 p-1"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Totals Bar */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#1E293B] flex justify-between items-center text-xs">
                <div className="text-slate-600 dark:text-slate-400">
                  Subtotal: <span className="font-mono font-semibold text-slate-900 dark:text-white">{fmtMoney(currentFormTotals.sub, currency)}</span> •
                  VAT (15%): <span className="font-mono font-semibold text-slate-900 dark:text-white">{fmtMoney(currentFormTotals.tax, currency)}</span>
                </div>
                <div className="text-sm font-bold text-sky-600 dark:text-sky-400 font-mono">
                  Total Due: {fmtMoney(currentFormTotals.total, currency)}
                </div>
              </div>
            </div>

            {/* Banking Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">Account No</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">Branch Code</label>
                <input
                  type="text"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase mb-1">SWIFT Code</label>
                <input
                  type="text"
                  value={swiftCode}
                  onChange={(e) => setSwiftCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0A0F18] border border-slate-200 dark:border-[#232F42] text-slate-900 dark:text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-[#1E293B]">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141C2A] dark:hover:bg-[#1E293B] text-slate-600 dark:text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveDoc('draft')}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-[#1E293B] dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveDoc('sent')}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/25 flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Issue & Send to Client</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* DOCUMENT PREVIEW MODAL WITH FULL BRANDED TEMPLATE */}
      {/* ======================================================== */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md overflow-y-auto p-4 sm:p-6 flex justify-center items-start">
          <div className="w-full max-w-4xl my-6 space-y-4">
            <CommercialDocumentTemplate
              doc={previewDoc}
              client={clients.find((c) => c.id === previewDoc.clientId)}
              mode="preview"
              onClose={() => setPreviewDoc(null)}
              onStatusChange={(newStatus) => handleUpdateStatus(previewDoc.id, newStatus)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
