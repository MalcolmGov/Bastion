/**
 * Move Studio — Commercial Quoting, Invoicing & Digital E-Signature Types
 */

export type DocType = 'invoice' | 'quote' | 'receipt' | 'credit-note';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';
export type DocStatus = InvoiceStatus | QuoteStatus;

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number; // e.g. 15 for 15% VAT
}

export interface BillingDoc {
  id: string;
  clientId: string;
  siteId?: string;
  type: DocType;
  status: DocStatus;
  docNumber: string; // e.g. QUO-1001 or INV-1001
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  currency: string;  // e.g. 'R', '$', '€'
  items: LineItem[];
  notes?: string;

  // Banking Details
  bankName?: string;
  accountNo?: string;
  branchCode?: string;
  swiftCode?: string;
  paymentRef?: string;

  // Company / Agency Profile
  companyName?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyVat?: string;
  companyRegNo?: string;

  // Client Details
  clientLegalName?: string;
  clientRegNo?: string;
  clientAddress?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientVat?: string;
  clientContactPerson?: string;
  paymentTerms?: string;
  poNumber?: string;

  // Lifecycle & Reminders
  sentAt?: string;
  lastRemindedAt?: string;
  remindersCount?: number;
  paidAt?: string;
  amountPaid?: number;

  // Digital E-Signature & Acceptance Workflow
  acceptanceToken?: string;
  signatureData?: string; // Base64 PNG data URL of drawn signature
  signerName?: string;
  signerRole?: string;
  acceptedAt?: string;    // ISO timestamp
  declinedAt?: string;    // ISO timestamp
  declineReason?: string;

  // Relationship pointers
  convertedFromQuoteId?: string;
  convertedToInvoiceId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DocTotals {
  sub: number;
  tax: number;
  total: number;
}

export function calcDocTotals(items: LineItem[] = []): DocTotals {
  let sub = 0;
  let tax = 0;
  items.forEach((item) => {
    const s = (item.qty || 0) * (item.unitPrice || 0);
    sub += s;
    tax += (s * (item.taxRate || 0)) / 100;
  });
  return {
    sub,
    tax,
    total: sub + tax,
  };
}

export function fmtMoney(amount: number, currency = 'R'): string {
  const formatted = amount.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

export const STATUS_CONFIG: Record<
  DocStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  draft: {
    label: 'Draft',
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  sent: {
    label: 'Sent to Client',
    bg: 'bg-sky-50 dark:bg-sky-950/70',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-500/40',
    dot: 'bg-sky-500',
  },
  accepted: {
    label: 'Approved & Signed',
    bg: 'bg-emerald-50 dark:bg-emerald-950/70',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/40',
    dot: 'bg-emerald-500',
  },
  paid: {
    label: 'Settled & Paid',
    bg: 'bg-emerald-50 dark:bg-emerald-950/70',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-500/40',
    dot: 'bg-emerald-500',
  },
  declined: {
    label: 'Declined',
    bg: 'bg-rose-50 dark:bg-rose-950/70',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-500/40',
    dot: 'bg-rose-500',
  },
  overdue: {
    label: 'Overdue',
    bg: 'bg-rose-50 dark:bg-rose-950/70',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-500/40',
    dot: 'bg-rose-500 animate-pulse',
  },
  expired: {
    label: 'Expired',
    bg: 'bg-amber-50 dark:bg-amber-950/70',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-500/40',
    dot: 'bg-amber-500',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-slate-100 dark:bg-slate-900',
    text: 'text-slate-500 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-800',
    dot: 'bg-slate-400',
  },
};
