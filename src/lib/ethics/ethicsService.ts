/**
 * Bastion Move Studio: Encrypted Anonymous Whistleblower Hotline & Ethics Service
 * Compliant with South African Protected Disclosures Act (Act 26 of 2000),
 * Companies Act 71 of 2008 §159, and King IV Principles 1 & 2.
 * 
 * Strict Guarantees:
 * 1. Zero IP address logging or persistent telemetry
 * 2. AES-256-GCM authenticated encryption at rest for all report details and messages
 * 3. Cryptographic salt-hashed access keys for anonymous follow-ups
 * 4. Multi-tenant client boundary isolation
 */

import crypto from 'node:crypto';
import { getDb, ensureDbReady } from '@/lib/db/client';
import { encryptSecret, decryptSecret } from '@/lib/crypto/encryption';

export type WhistleblowerCategory =
  | 'bribery_corruption'
  | 'health_safety'
  | 'environmental'
  | 'harassment_discrimination'
  | 'financial_fraud'
  | 'tender_irregularity'
  | 'other';

export type WhistleblowerSeverity = 'low' | 'medium' | 'high' | 'critical';
export type WhistleblowerStatus =
  | 'received'
  | 'under_investigation'
  | 'substantiated'
  | 'dismissed'
  | 'resolved';

export interface WhistleblowerReportInput {
  clientId: string;
  category: WhistleblowerCategory;
  severity?: WhistleblowerSeverity;
  jurisdiction?: string;
  subject: string;
  details: string; // Will be encrypted at rest
  incidentDate?: string;
  involvedParties?: string;
  evidenceLinks?: string[];
}

export interface WhistleblowerReportRecord {
  id: string;
  clientId: string;
  trackingCode: string;
  category: WhistleblowerCategory;
  severity: WhistleblowerSeverity;
  jurisdiction: string;
  subject: string;
  details: string; // Decrypted for authorized callers
  status: WhistleblowerStatus;
  assignedInvestigatorId: string | null;
  resolutionSummary: string | null;
  createdAt: string;
  updatedAt: string;
  messagesCount?: number;
}

export interface WhistleblowerMessage {
  id: string;
  reportId: string;
  senderType: 'whistleblower' | 'investigator';
  senderId: string | null;
  message: string; // Decrypted
  createdAt: string;
}

function hashAccessKey(accessKey: string): string {
  return crypto.createHash('sha256').update(`bastion_ethics_salt_${accessKey}`).digest('hex');
}

/**
 * Creates an anonymous whistleblower report with zero IP retention
 * Returns tracking code and one-time plain access key
 */
export async function createWhistleblowerReport(
  input: WhistleblowerReportInput
): Promise<{ reportId: string; trackingCode: string; accessKey: string }> {
  await ensureDbReady();
  const db = getDb();

  const reportId = `wb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  
  // Format: ETH-YYYY-XXXXX (e.g. ETH-2026-9F4B2)
  const currentYear = new Date().getFullYear();
  const trackingCode = `ETH-${currentYear}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
  
  // High-entropy 18-character access key for the anonymous reporter
  const accessKey = `ak_${crypto.randomBytes(9).toString('hex')}`;
  const accessKeyHash = hashAccessKey(accessKey);

  const payloadToEncrypt = JSON.stringify({
    details: input.details,
    incidentDate: input.incidentDate || null,
    involvedParties: input.involvedParties || null,
    evidenceLinks: input.evidenceLinks || [],
  });

  const encryptedDetails = encryptSecret(payloadToEncrypt);
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO whistleblower_reports (
            id, client_id, tracking_code, access_key_hash, category, severity,
            jurisdiction, subject, encrypted_details, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?, ?)`,
    args: [
      reportId,
      input.clientId,
      trackingCode,
      accessKeyHash,
      input.category,
      input.severity || 'medium',
      input.jurisdiction || 'ZA',
      input.subject,
      encryptedDetails,
      now,
      now,
    ],
  });

  return { reportId, trackingCode, accessKey };
}

/**
 * Retrieves case status and decrypted dialogue for the anonymous reporter using trackingCode + accessKey
 */
export async function getWhistleblowerCaseByTrackingCode(
  trackingCode: string,
  accessKey: string
): Promise<{
  report: WhistleblowerReportRecord;
  messages: WhistleblowerMessage[];
} | null> {
  await ensureDbReady();
  const db = getDb();

  const code = trackingCode.trim().toUpperCase();
  const accessKeyHash = hashAccessKey(accessKey.trim());

  const res = await db.execute({
    sql: `SELECT * FROM whistleblower_reports WHERE tracking_code = ? AND access_key_hash = ? LIMIT 1`,
    args: [code, accessKeyHash],
  });

  if (res.rows.length === 0) {
    return null;
  }

  const row = res.rows[0] as any;
  const decryptedRaw = decryptSecret(row.encrypted_details);
  let parsedPayload: any = { details: decryptedRaw };
  try {
    parsedPayload = JSON.parse(decryptedRaw);
  } catch {
    parsedPayload = { details: decryptedRaw };
  }

  // Fetch dialogue messages
  const msgRes = await db.execute({
    sql: `SELECT * FROM whistleblower_messages WHERE report_id = ? ORDER BY created_at ASC`,
    args: [row.id],
  });

  const messages: WhistleblowerMessage[] = msgRes.rows.map((m: any) => ({
    id: m.id,
    reportId: m.report_id,
    senderType: m.sender_type,
    senderId: m.sender_id,
    message: decryptSecret(m.encrypted_message),
    createdAt: m.created_at,
  }));

  const report: WhistleblowerReportRecord = {
    id: row.id,
    clientId: row.client_id,
    trackingCode: row.tracking_code,
    category: row.category,
    severity: row.severity,
    jurisdiction: row.jurisdiction,
    subject: row.subject,
    details: parsedPayload.details || '',
    status: row.status,
    assignedInvestigatorId: row.assigned_investigator_id,
    resolutionSummary: row.resolution_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    messagesCount: messages.length,
  };

  return { report, messages };
}

/**
 * Adds an encrypted communication message to a whistleblower case
 */
export async function addWhistleblowerMessage(params: {
  reportId: string;
  senderType: 'whistleblower' | 'investigator';
  senderId?: string;
  messageText: string;
}): Promise<WhistleblowerMessage> {
  await ensureDbReady();
  const db = getDb();

  const id = `wbm_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const encrypted = encryptSecret(params.messageText);
  const now = new Date().toISOString();

  await db.execute({
    sql: `INSERT INTO whistleblower_messages (
            id, report_id, sender_type, sender_id, encrypted_message, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      id,
      params.reportId,
      params.senderType,
      params.senderId || null,
      encrypted,
      now,
    ],
  });

  await db.execute({
    sql: `UPDATE whistleblower_reports SET updated_at = ? WHERE id = ?`,
    args: [now, params.reportId],
  });

  return {
    id,
    reportId: params.reportId,
    senderType: params.senderType,
    senderId: params.senderId || null,
    message: params.messageText,
    createdAt: now,
  };
}

/**
 * Lists whistleblower reports for authorized compliance officers & platform admins
 */
export async function listWhistleblowerReports(
  clientId?: string | null
): Promise<WhistleblowerReportRecord[]> {
  await ensureDbReady();
  const db = getDb();

  let query = `
    SELECT r.*, 
      (SELECT COUNT(*) FROM whistleblower_messages m WHERE m.report_id = r.id) as msg_count
    FROM whistleblower_reports r
  `;
  const args: any[] = [];

  if (clientId) {
    query += ` WHERE r.client_id = ?`;
    args.push(clientId);
  }

  query += ` ORDER BY r.created_at DESC`;

  const res = await db.execute({ sql: query, args });

  return res.rows.map((row: any) => {
    let details = '';
    try {
      const decrypted = decryptSecret(row.encrypted_details);
      const parsed = JSON.parse(decrypted);
      details = parsed.details || decrypted;
    } catch {
      details = decryptSecret(row.encrypted_details);
    }

    return {
      id: row.id,
      clientId: row.client_id,
      trackingCode: row.tracking_code,
      category: row.category,
      severity: row.severity,
      jurisdiction: row.jurisdiction,
      subject: row.subject,
      details,
      status: row.status,
      assignedInvestigatorId: row.assigned_investigator_id,
      resolutionSummary: row.resolution_summary,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messagesCount: Number(row.msg_count || 0),
    };
  });
}

/**
 * Updates case status and investigation resolution summary
 */
export async function updateWhistleblowerStatus(
  reportId: string,
  status: WhistleblowerStatus,
  resolutionSummary?: string,
  assignedInvestigatorId?: string
): Promise<void> {
  await ensureDbReady();
  const db = getDb();
  const now = new Date().toISOString();

  await db.execute({
    sql: `UPDATE whistleblower_reports 
          SET status = ?, resolution_summary = COALESCE(?, resolution_summary), 
              assigned_investigator_id = COALESCE(?, assigned_investigator_id), updated_at = ?
          WHERE id = ?`,
    args: [status, resolutionSummary || null, assignedInvestigatorId || null, now, reportId],
  });
}
