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
  Check
} from 'lucide-react';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';
import type { BillingDoc, LineItem, DocType, DocStatus } from '@/lib/studio/billingTypes';
import { calcDocTotals, fmtMoney, STATUS_CONFIG } from '@/lib/studio/billingTypes';

export default function AdminBillingPage() {
  const { clients, activeClient, activeSite } = useStudioWorkspace();

  const [docs, setDocs] = useState<BillingDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'quote' | 'invoice'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedClientFilter, setSelectedClientFilter] = useState<string>('all');

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<BillingDoc | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form State for New/Edit Doc
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [docType, setDocType] = useState<DocType>('quote');
  const [targetClientId, setTargetClientId] = useState<string>('');
  const [docNumber, setDocNumber] = useState('');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]);
  const [currency, setCurrency] = useState('R');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: 'item_1', description: 'Enterprise Website Design & Custom Component Suite', qty: 1, unitPrice: 45000, taxRate: 15 },
    { id: 'item_2', description: 'Headless CMS Integration & Content Migration', qty: 1, unitPrice: 20000, taxRate: 15 },
    { id: 'item_3', description: 'Managed Cloud Infrastructure & Monthly Maintenance (Annual SLA)', qty: 1, unitPrice: 18000, taxRate: 15 },
  ]);
  const [notes, setNotes] = useState(
    'Payment Terms: 50% deposit upon digital signature acceptance, 50% upon deployment.\nBank details listed below.'
  );
  const [bankName, setBankName] = useState('First National Bank (FNB)');
  const [accountNo, setAccountNo] = useState('62849102941');
  const [branchCode, setBranchCode] = useState('250655');

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
    }
  }, [activeClient, targetClientId]);

  // Handle open create modal
  const handleOpenCreate = (type: DocType = 'quote') => {
    setDocType(type);
    setEditingDocId(null);
    setTargetClientId(activeClient?.id || (clients[0]?.id ?? 'client_swifter'));
    const randNum = Math.floor(1000 + Math.random() * 9000);
    setDocNumber(`${type === 'quote' ? 'QUO' : 'INV'}-${randNum}`);
    setIssueDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 30 * 864e5).toISOString().split('T')[0]);
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
        paymentRef: docNumber,
        companyName: 'Move Studio Agency',
        companyAddress: '100 Sandton Drive, Sandton, Johannesburg, 2196',
        companyEmail: 'billing@movestudio.agency',
        companyPhone: '+27 11 883 4000',
        companyVat: '4820194821',
      };

      const res = await fetch('/api/admin/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsCreateOpen(false);
        await fetchDocs();
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
        await fetchDocs();
      }
    } catch (e) {
      console.error('Failed to convert quote:', e);
    }
  };

  // Mark invoice as paid
  const handleMarkPaid = async (docId: string) => {
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_status', docId, status: 'paid' }),
      });
      if (res.ok) {
        await fetchDocs();
      }
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  // Delete doc
  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch('/api/admin/billing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', docId }),
      });
      if (res.ok) {
        await fetchDocs();
      }
    } catch (e) {
      console.error('Failed to delete doc:', e);
    }
  };

  // Copy signing link
  const handleCopyLink = (token: string) => {
    const fullUrl = `${window.location.origin}/quote/${token}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedToken(token);
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-widest">
              Commercial Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Client Quoting & Invoicing
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Issue proposals, collect digital signatures, and manage client invoicing in one place.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => handleOpenCreate('quote')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-500/20 flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Quotation</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreate('invoice')}
            className="px-4 py-2 rounded-xl bg-[#141C2A] hover:bg-[#1E293B] border border-[#232F42] text-slate-200 hover:text-white font-bold text-xs flex items-center space-x-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0E1522] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Quoted</span>
            <FileText className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{fmtMoney(totalQuoted)}</div>
          <div className="text-[11px] text-slate-500 flex items-center space-x-1">
            <span>{docs.filter((d) => d.type === 'quote').length} active proposals</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1522] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Signed Agreements</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{signedQuotesCount}</div>
          <div className="text-[11px] text-slate-500">Digitally accepted by clients</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1522] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Invoiced</span>
            <Receipt className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{fmtMoney(totalInvoiced)}</div>
          <div className="text-[11px] text-slate-500">
            {docs.filter((d) => d.type === 'invoice').length} issued tax invoices
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E1522] border border-[#1E293B] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Settled Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{fmtMoney(totalPaid)}</div>
          <div className="text-[11px] text-emerald-500/80">Paid & reconciled</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-2xl bg-[#0E1522] border border-[#1E293B] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Document Type Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#0A0F18] border border-[#1A2333] text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'all' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Docs ({docs.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('quote')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'quote' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Quotations ({docs.filter((d) => d.type === 'quote').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('invoice')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'invoice' ? 'bg-sky-500 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
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
            className="px-3 py-1.5 rounded-lg bg-[#0A0F18] border border-[#1E293B] text-slate-300 focus:outline-none"
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
            className="px-3 py-1.5 rounded-lg bg-[#0A0F18] border border-[#1E293B] text-slate-300 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="accepted">Accepted / Signed</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl bg-[#0E1522] border border-[#1E293B] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#101726] text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Issued / Due</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A2333]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading commercial documents...</span>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No documents found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const totals = calcDocTotals(doc.items);
                  const clientObj = clients.find((c) => c.id === doc.clientId);
                  const statusCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.draft;
                  const isAcceptedQuote = doc.type === 'quote' && doc.status === 'accepted';
                  const alreadyConverted = !!doc.convertedToInvoiceId;

                  return (
                    <tr key={doc.id} className="hover:bg-[#121A2B]/40 transition group">
                      {/* Document Details */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              doc.type === 'quote'
                                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                                : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30'
                            }`}
                          >
                            {doc.type.toUpperCase()}
                          </span>
                          <span>{doc.docNumber}</span>
                        </div>
                        {doc.convertedFromQuoteId && (
                          <div className="text-[10px] text-slate-500 font-sans font-normal mt-0.5">
                            From Quote
                          </div>
                        )}
                        {alreadyConverted && (
                          <div className="text-[10px] text-indigo-400 font-sans font-normal mt-0.5">
                            → Invoiced
                          </div>
                        )}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-200">
                          {clientObj?.name || doc.companyName || 'Client'}
                        </div>
                        <div className="text-[10px] text-slate-400">{doc.items.length} line items</div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {fmtMoney(totals.total, doc.currency)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          {doc.status === 'accepted' && <ShieldCheck className="w-3 h-3 text-emerald-400" />}
                          <span>{statusCfg.label}</span>
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-slate-400">
                        <div>{doc.issueDate}</div>
                        <div className="text-[10px] text-slate-500">Due: {doc.dueDate}</div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Preview / Inspector */}
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            title="Preview Document & Signature"
                            className="p-1.5 rounded-lg bg-[#141C2A] hover:bg-[#1E293B] border border-[#232F42] text-slate-300 hover:text-white transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy Sign Link (for quotes with tokens) */}
                          {doc.acceptanceToken && (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(doc.acceptanceToken!)}
                              title="Copy Client Sign Link"
                              className="p-1.5 rounded-lg bg-[#141C2A] hover:bg-[#1E293B] border border-[#232F42] text-sky-400 hover:text-sky-300 transition"
                            >
                              {copiedToken === doc.acceptanceToken ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}

                          {/* Convert to Invoice action */}
                          {doc.type === 'quote' && !alreadyConverted && (
                            <button
                              type="button"
                              onClick={() => handleConvertToInvoice(doc.id)}
                              className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500 border border-indigo-400/30 hover:border-indigo-400 text-indigo-300 hover:text-white font-bold text-[10px] transition flex items-center space-x-1"
                            >
                              <span>→ Invoice</span>
                            </button>
                          )}

                          {/* Mark Paid action */}
                          {doc.type === 'invoice' && doc.status !== 'paid' && (
                            <button
                              type="button"
                              onClick={() => handleMarkPaid(doc.id)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-400/30 hover:border-emerald-400 text-emerald-300 hover:text-white font-bold text-[10px] transition"
                            >
                              Paid
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeleteDoc(doc.id)}
                            title="Delete Document"
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 text-slate-500 hover:text-rose-400 transition"
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

      {/* CREATE / EDIT DOCUMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-[#0E1522] border border-[#232F42] shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Create New {docType === 'quote' ? 'Quotation' : 'Invoice'}
                </h2>
                <p className="text-xs text-slate-400">
                  Fill in the client deliverables and banking information.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Document Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Recipient Client
                </label>
                <select
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F18] border border-[#232F42] text-white text-xs"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Document Number
                </label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F18] border border-[#232F42] text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F18] border border-[#232F42] text-white text-xs"
                >
                  <option value="R">ZAR (R)</option>
                  <option value="$">USD ($)</option>
                  <option value="€">EUR (€)</option>
                  <option value="£">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  Issue Date
                </label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F18] border border-[#232F42] text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-slate-400 mb-1">
                  {docType === 'quote' ? 'Valid Until' : 'Due Date'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0A0F18] border border-[#232F42] text-white text-xs"
                />
              </div>
            </div>

            {/* Line Items Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                  Line Items & Scope Deliverables
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-400/30 text-xs font-bold transition flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Line Item</span>
                </button>
              </div>

              <div className="space-y-2">
                {lineItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-[#0A0F18] border border-[#1E293B] grid grid-cols-12 gap-2 items-center text-xs"
                  >
                    <div className="col-span-6">
                      <input
                        type="text"
                        placeholder="Deliverable Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded bg-[#0E1522] border border-[#222E42] text-white text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                        className="w-full px-2.5 py-1.5 rounded bg-[#0E1522] border border-[#222E42] text-white text-xs text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        step="100"
                        placeholder="Unit Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2.5 py-1.5 rounded bg-[#0E1522] border border-[#222E42] text-white text-xs text-right font-mono"
                      />
                    </div>
                    <div className="col-span-1 text-center text-slate-400 font-mono">15%</div>
                    <div className="col-span-1 text-right">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-rose-400 hover:text-rose-300 p-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Totals Bar */}
              <div className="p-4 rounded-xl bg-[#0A0F18] border border-[#1E293B] flex justify-between items-center text-xs">
                <div className="text-slate-400">
                  Subtotal: <span className="font-mono text-white">{fmtMoney(currentFormTotals.sub, currency)}</span> •
                  VAT (15%): <span className="font-mono text-white">{fmtMoney(currentFormTotals.tax, currency)}</span>
                </div>
                <div className="text-sm font-bold text-sky-400 font-mono">
                  Total: {fmtMoney(currentFormTotals.total, currency)}
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0A0F18] border border-[#232F42] text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Account No</label>
                <input
                  type="text"
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0A0F18] border border-[#232F42] text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1">Branch Code</label>
                <input
                  type="text"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded bg-[#0A0F18] border border-[#232F42] text-white text-xs font-mono"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#141C2A] hover:bg-[#1E293B] text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveDoc('draft')}
                className="px-4 py-2 rounded-xl bg-[#1E293B] hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Save as Draft
              </button>
              <button
                type="button"
                onClick={() => handleSaveDoc('sent')}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-sky-500/25 flex items-center space-x-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Issue & Send to Client</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW & DIGITAL SIGNATURE MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-[#0E1522] border border-[#232F42] shadow-2xl p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#1E293B]">
              <div>
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider">
                  {previewDoc.type.toUpperCase()} PREVIEW
                </span>
                <h2 className="text-xl font-bold text-white">{previewDoc.docNumber}</h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Document Details */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-[#0A0F18] border border-[#1E293B] space-y-2">
                <div className="text-slate-400 uppercase text-[10px] font-bold">Deliverables</div>
                {previewDoc.items.map((i, idx) => (
                  <div key={idx} className="flex justify-between text-slate-200">
                    <span>
                      {i.qty}x {i.description}
                    </span>
                    <span className="font-mono font-bold">
                      {fmtMoney(i.qty * i.unitPrice * (1 + i.taxRate / 100), previewDoc.currency)}
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-[#1E293B] flex justify-between font-bold text-sm text-sky-400">
                  <span>Grand Total</span>
                  <span className="font-mono">
                    {fmtMoney(calcDocTotals(previewDoc.items).total, previewDoc.currency)}
                  </span>
                </div>
              </div>

              {/* Digital Signature Audit Stamp */}
              {previewDoc.status === 'accepted' ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Digitally Signed Agreement</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Signatory: <strong>{previewDoc.signerName}</strong> ({previewDoc.signerRole})
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Timestamp: {new Date(previewDoc.acceptedAt || Date.now()).toLocaleString('en-ZA')}
                  </div>
                  {previewDoc.signatureData && (
                    <div className="h-16 w-56 rounded-lg bg-white/5 border border-emerald-500/30 p-2 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={previewDoc.signatureData}
                        alt="Signature"
                        className="max-h-full max-w-full object-contain filter invert"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#141C2A] border border-[#232F42] flex items-center justify-between">
                  <div className="text-slate-400 text-xs">
                    Client signing link is active for this quotation.
                  </div>
                  {previewDoc.acceptanceToken && (
                    <a
                      href={`/quote/${previewDoc.acceptanceToken}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-sky-500 text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <span>Open Signing Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-[#141C2A] hover:bg-[#1E293B] text-white text-xs font-semibold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
