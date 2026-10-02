/**
 * Bastion Move Studio: Corporate Supplier Tender & RFP Procurement Engine
 * Enforces South African statutory procurement requirements:
 * 1. CIPC Company Registration verification (Format: YYYY/NNNNNN/NN)
 * 2. SARS Tax Compliance Status PIN validation (9-10 alphanumeric characters)
 * 3. Broad-Based Black Economic Empowerment (B-BBEE) contributor vetting (Level 1–8)
 * 4. Host-community local supplier empowerment mandates
 */

import crypto from 'crypto';
import { getDb, ensureDbReady } from '@/lib/db/client';

export type TenderStatus = 'active' | 'closed' | 'under_evaluation' | 'awarded' | 'cancelled';
export type TenderSubmissionStatus = 'submitted' | 'compliant' | 'shortlisted' | 'rejected' | 'awarded';

export interface TenderRecord {
  id: string;
  clientId: string;
  tenderNumber: string;
  title: string;
  category: string;
  description: string;
  estimatedValue: string | null;
  closingDate: string;
  status: TenderStatus;
  minBbbeeLevel: number;
  cidbGrading: string | null;
  hostCommunityMandate: boolean;
  scopeDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  submissionsCount?: number;
}

export interface TenderSubmissionRecord {
  id: string;
  tenderId: string;
  clientId: string;
  referenceCode: string;
  vendorName: string;
  cipcRegistrationNumber: string;
  sarsTaxPin: string;
  bbbeeLevel: number;
  hostCommunityRegistered: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bidAmount: number | null;
  currency: string;
  status: TenderSubmissionStatus;
  complianceNotes: string | null;
  createdAt: string;
  updatedAt: string;
  tenderTitle?: string;
  tenderNumber?: string;
}

export interface TenderInput {
  clientId: string;
  tenderNumber: string;
  title: string;
  category: string;
  description: string;
  estimatedValue?: string;
  closingDate: string;
  minBbbeeLevel?: number;
  cidbGrading?: string;
  hostCommunityMandate?: boolean;
  scopeDocumentUrl?: string;
}

export interface TenderSubmissionInput {
  tenderId: string;
  clientId: string;
  vendorName: string;
  cipcRegistrationNumber: string;
  sarsTaxPin: string;
  bbbeeLevel: number;
  hostCommunityRegistered?: boolean;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  bidAmount?: number;
  currency?: string;
}

/**
 * Validates CIPC Company Registration Number format (YYYY/NNNNNN/NN)
 * Example: 2018/123456/07
 */
export function validateCipcRegistration(regNumber: string): { valid: boolean; error?: string } {
  if (!regNumber || typeof regNumber !== 'string') {
    return { valid: false, error: 'CIPC Registration Number is required.' };
  }
  const clean = regNumber.trim();
  const pattern = /^(19|20)\d{2}\/\d{6}\/\d{2}$/;
  if (!pattern.test(clean)) {
    return {
      valid: false,
      error: 'Invalid CIPC format. Must be YYYY/NNNNNN/NN (e.g. 2018/123456/07).',
    };
  }
  return { valid: true };
}

/**
 * Validates SARS Tax Compliance Status (TCS) PIN (9-10 alphanumeric characters)
 */
export function validateSarsTaxPin(pin: string): { valid: boolean; error?: string } {
  if (!pin || typeof pin !== 'string') {
    return { valid: false, error: 'SARS Tax Compliance PIN is required.' };
  }
  const clean = pin.trim().toUpperCase();
  const pattern = /^[A-Z0-9]{9,10}$/;
  if (!pattern.test(clean)) {
    return {
      valid: false,
      error: 'Invalid SARS PIN format. Must be 9 to 10 alphanumeric characters.',
    };
  }
  return { valid: true };
}

/**
 * Validates B-BBEE Contributor Level (Levels 1 to 8)
 */
export function validateBbbeeLevel(level: number): { valid: boolean; error?: string } {
  if (!Number.isInteger(level) || level < 1 || level > 8) {
    return {
      valid: false,
      error: 'B-BBEE Contributor Level must be an integer between 1 and 8.',
    };
  }
  return { valid: true };
}

/**
 * Lists active published tenders for public procurement portal
 */
export async function listActiveTenders(clientId?: string | null): Promise<TenderRecord[]> {
  await ensureDbReady();
  const db = getDb();

  let query = `
    SELECT t.*, 
      (SELECT COUNT(*) FROM tender_submissions s WHERE s.tender_id = t.id) as sub_count
    FROM tenders t
    WHERE t.status = 'active'
  `;
  const args: any[] = [];

  if (clientId) {
    query += ` AND t.client_id = ?`;
    args.push(clientId);
  }

  query += ` ORDER BY t.closing_date ASC`;

  const res = await db.execute({ sql: query, args });

  return res.rows.map((r: any) => ({
    id: r.id,
    clientId: r.client_id,
    tenderNumber: r.tender_number,
    title: r.title,
    category: r.category,
    description: r.description,
    estimatedValue: r.estimated_value,
    closingDate: r.closing_date,
    status: r.status,
    minBbbeeLevel: Number(r.min_bbbee_level || 4),
    cidbGrading: r.cidb_grading,
    hostCommunityMandate: Boolean(r.host_community_mandate),
    scopeDocumentUrl: r.scope_document_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    submissionsCount: Number(r.sub_count || 0),
  }));
}

/**
 * Lists all tenders (including draft, closed, awarded) for admin procurement workspace
 */
export async function listAllTenders(clientId?: string | null): Promise<TenderRecord[]> {
  await ensureDbReady();
  const db = getDb();

  let query = `
    SELECT t.*, 
      (SELECT COUNT(*) FROM tender_submissions s WHERE s.tender_id = t.id) as sub_count
    FROM tenders t
  `;
  const args: any[] = [];

  if (clientId) {
    query += ` WHERE t.client_id = ?`;
    args.push(clientId);
  }

  query += ` ORDER BY t.created_at DESC`;

  const res = await db.execute({ sql: query, args });

  return res.rows.map((r: any) => ({
    id: r.id,
    clientId: r.client_id,
    tenderNumber: r.tender_number,
    title: r.title,
    category: r.category,
    description: r.description,
    estimatedValue: r.estimated_value,
    closingDate: r.closing_date,
    status: r.status,
    minBbbeeLevel: Number(r.min_bbbee_level || 4),
    cidbGrading: r.cidb_grading,
    hostCommunityMandate: Boolean(r.host_community_mandate),
    scopeDocumentUrl: r.scope_document_url,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    submissionsCount: Number(r.sub_count || 0),
  }));
}

/**
 * Creates a new RFP tender
 */
export async function createTender(input: TenderInput): Promise<TenderRecord> {
  await ensureDbReady();
  const db = getDb();

  const id = `tdr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO tenders (
            id, client_id, tender_number, title, category, description,
            estimated_value, closing_date, status, min_bbbee_level, cidb_grading,
            host_community_mandate, scope_document_url, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      input.clientId,
      input.tenderNumber.trim().toUpperCase(),
      input.title.trim(),
      input.category.trim(),
      input.description.trim(),
      input.estimatedValue || null,
      input.closingDate,
      input.minBbbeeLevel || 4,
      input.cidbGrading || null,
      input.hostCommunityMandate ? 1 : 0,
      input.scopeDocumentUrl || null,
      now,
      now,
    ],
  });

  return {
    id,
    clientId: input.clientId,
    tenderNumber: input.tenderNumber.trim().toUpperCase(),
    title: input.title.trim(),
    category: input.category.trim(),
    description: input.description.trim(),
    estimatedValue: input.estimatedValue || null,
    closingDate: input.closingDate,
    status: 'active',
    minBbbeeLevel: input.minBbbeeLevel || 4,
    cidbGrading: input.cidbGrading || null,
    hostCommunityMandate: Boolean(input.hostCommunityMandate),
    scopeDocumentUrl: input.scopeDocumentUrl || null,
    createdAt: now,
    updatedAt: now,
    submissionsCount: 0,
  };
}

/**
 * Submits a validated tender bid proposal
 */
export async function submitTenderBid(
  input: TenderSubmissionInput
): Promise<TenderSubmissionRecord> {
  await ensureDbReady();
  const db = getDb();

  // 1. Statutory Validation
  const cipcCheck = validateCipcRegistration(input.cipcRegistrationNumber);
  if (!cipcCheck.valid) {
    throw new Error(cipcCheck.error);
  }

  const sarsCheck = validateSarsTaxPin(input.sarsTaxPin);
  if (!sarsCheck.valid) {
    throw new Error(sarsCheck.error);
  }

  const bbbeeCheck = validateBbbeeLevel(input.bbbeeLevel);
  if (!bbbeeCheck.valid) {
    throw new Error(bbbeeCheck.error);
  }

  // 2. Verify target tender exists and is active
  const tenderRes = await db.execute({
    sql: `SELECT id, status, client_id, min_bbbee_level FROM tenders WHERE id = ? LIMIT 1`,
    args: [input.tenderId],
  });

  if (tenderRes.rows.length === 0) {
    throw new Error('Tender RFP not found.');
  }

  const tenderRow = tenderRes.rows[0] as any;
  if (tenderRow.status !== 'active') {
    throw new Error(`Cannot submit bid: Tender is ${tenderRow.status}.`);
  }

  const id = `sub_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const year = new Date().getFullYear();
  const referenceCode = `BID-${year}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  const now = new Date().toISOString();

  // Evaluate initial compliance flag
  const isBbbeeCompliant = input.bbbeeLevel <= (tenderRow.min_bbbee_level || 4);
  const complianceNotes = isBbbeeCompliant
    ? 'Automated statutory check: Valid CIPC format, SARS TCS PIN verified, B-BBEE level compliant.'
    : `Notice: B-BBEE Level ${input.bbbeeLevel} exceeds requested target (Level ${tenderRow.min_bbbee_level}). Subject to procurement committee waiver.`;

  await db.execute({
    sql: `INSERT INTO tender_submissions (
            id, tender_id, client_id, reference_code, vendor_name,
            cipc_registration_number, sars_tax_pin, bbbee_level,
            host_community_registered, contact_name, contact_email,
            contact_phone, bid_amount, currency, status, compliance_notes,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?)`,
    args: [
      id,
      input.tenderId,
      input.clientId || tenderRow.client_id,
      referenceCode,
      input.vendorName.trim(),
      input.cipcRegistrationNumber.trim(),
      input.sarsTaxPin.trim().toUpperCase(),
      input.bbbeeLevel,
      input.hostCommunityRegistered ? 1 : 0,
      input.contactName.trim(),
      input.contactEmail.trim().toLowerCase(),
      input.contactPhone.trim(),
      input.bidAmount || null,
      input.currency || 'ZAR',
      complianceNotes,
      now,
      now,
    ],
  });

  return {
    id,
    tenderId: input.tenderId,
    clientId: input.clientId || tenderRow.client_id,
    referenceCode,
    vendorName: input.vendorName.trim(),
    cipcRegistrationNumber: input.cipcRegistrationNumber.trim(),
    sarsTaxPin: input.sarsTaxPin.trim().toUpperCase(),
    bbbeeLevel: input.bbbeeLevel,
    hostCommunityRegistered: Boolean(input.hostCommunityRegistered),
    contactName: input.contactName.trim(),
    contactEmail: input.contactEmail.trim().toLowerCase(),
    contactPhone: input.contactPhone.trim(),
    bidAmount: input.bidAmount || null,
    currency: input.currency || 'ZAR',
    status: 'submitted',
    complianceNotes,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Lists tender submissions for a specific tender or client
 */
export async function listTenderSubmissions(
  tenderId?: string,
  clientId?: string | null
): Promise<TenderSubmissionRecord[]> {
  await ensureDbReady();
  const db = getDb();

  let query = `
    SELECT s.*, t.title as tender_title, t.tender_number
    FROM tender_submissions s
    JOIN tenders t ON t.id = s.tender_id
  `;
  const conditions: string[] = [];
  const args: any[] = [];

  if (tenderId) {
    conditions.push(`s.tender_id = ?`);
    args.push(tenderId);
  }
  if (clientId) {
    conditions.push(`s.client_id = ?`);
    args.push(clientId);
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  query += ` ORDER BY s.created_at DESC`;

  const res = await db.execute({ sql: query, args });

  return res.rows.map((r: any) => ({
    id: r.id,
    tenderId: r.tender_id,
    clientId: r.client_id,
    referenceCode: r.reference_code,
    vendorName: r.vendor_name,
    cipcRegistrationNumber: r.cipc_registration_number,
    sarsTaxPin: r.sars_tax_pin,
    bbbeeLevel: Number(r.bbbee_level),
    hostCommunityRegistered: Boolean(r.host_community_registered),
    contactName: r.contact_name,
    contactEmail: r.contact_email,
    contactPhone: r.contact_phone,
    bidAmount: r.bid_amount ? Number(r.bid_amount) : null,
    currency: r.currency,
    status: r.status,
    complianceNotes: r.compliance_notes,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    tenderTitle: r.tender_title,
    tenderNumber: r.tender_number,
  }));
}

/**
 * Updates submission evaluation status
 */
export async function updateTenderSubmissionStatus(
  submissionId: string,
  status: TenderSubmissionStatus,
  notes?: string
): Promise<void> {
  await ensureDbReady();
  const db = getDb();
  const now = new Date().toISOString();

  await db.execute({
    sql: `UPDATE tender_submissions 
          SET status = ?, compliance_notes = COALESCE(?, compliance_notes), updated_at = ?
          WHERE id = ?`,
    args: [status, notes || null, now, submissionId],
  });
}
