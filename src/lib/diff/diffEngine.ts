import crypto from 'node:crypto';

export type DiffChangeType = 'added' | 'removed' | 'unchanged' | 'modified';

export interface WordDiffChunk {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface LineDiffItem {
  type: DiffChangeType;
  oldLineNumber?: number;
  newLineNumber?: number;
  oldContent?: string;
  newContent?: string;
  wordDiffs?: WordDiffChunk[];
}

export interface FieldDiff {
  fieldName: string;
  fieldLabel: string;
  status: 'added' | 'removed' | 'modified' | 'unchanged';
  oldValue: any;
  newValue: any;
  lineDiff?: LineDiffItem[];
  additions: number;
  deletions: number;
}

export interface RecordDiffSummary {
  recordId: string;
  collection: string;
  title: string;
  fromRevisionNumber?: number;
  toRevisionNumber?: number;
  fromContentHash?: string;
  toContentHash?: string;
  totalAdditions: number;
  totalDeletions: number;
  fieldsChanged: number;
  fieldDiffs: FieldDiff[];
}

/**
 * Deterministic SHA-256 hash generator for content payloads
 */
export function generateContentHash(content: any): string {
  const normalized = typeof content === 'string' ? content : JSON.stringify(content, Object.keys(content || {}).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Computes Longest Common Subsequence (LCS) matrix
 */
function computeLCS<T>(a: T[], b: T[], equals: (x: T, y: T) => boolean = (x, y) => x === y): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (equals(a[i - 1], b[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp;
}

/**
 * Computes intra-line word/token-level diff for modified lines
 */
export function computeWordDiff(oldStr: string, newStr: string): WordDiffChunk[] {
  // Tokenize by word boundaries and spaces
  const tokenize = (s: string) => s.match(/([^\s]+|\s+)/g) || [];
  const wordsA = tokenize(oldStr);
  const wordsB = tokenize(newStr);

  const dp = computeLCS(wordsA, wordsB);
  const chunks: WordDiffChunk[] = [];

  let i = wordsA.length;
  let j = wordsB.length;

  const stack: WordDiffChunk[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && wordsA[i - 1] === wordsB[j - 1]) {
      stack.push({ type: 'unchanged', text: wordsA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'added', text: wordsB[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      stack.push({ type: 'removed', text: wordsA[i - 1] });
      i--;
    }
  }

  // Reverse since we backtracked from end
  stack.reverse();

  // Merge contiguous chunks of same type
  for (const item of stack) {
    if (chunks.length > 0 && chunks[chunks.length - 1].type === item.type) {
      chunks[chunks.length - 1].text += item.text;
    } else {
      chunks.push({ ...item });
    }
  }

  return chunks;
}

/**
 * Computes line-by-line diff between two multi-line strings
 */
export function computeLineDiff(oldText: string = '', newText: string = ''): LineDiffItem[] {
  const linesA = oldText ? oldText.split('\n') : [];
  const linesB = newText ? newText.split('\n') : [];

  const dp = computeLCS(linesA, linesB);
  const rawDiff: { type: 'unchanged' | 'added' | 'removed'; lineA?: string; lineB?: string; lineNoA?: number; lineNoB?: number }[] = [];

  let i = linesA.length;
  let j = linesB.length;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      rawDiff.push({
        type: 'unchanged',
        lineA: linesA[i - 1],
        lineB: linesB[j - 1],
        lineNoA: i,
        lineNoB: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.push({
        type: 'added',
        lineB: linesB[j - 1],
        lineNoB: j,
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.push({
        type: 'removed',
        lineA: linesA[i - 1],
        lineNoA: i,
      });
      i--;
    }
  }

  rawDiff.reverse();

  // Second pass: group contiguous non-unchanged items and pair removed + added lines into 'modified' items with word diffs
  const result: LineDiffItem[] = [];
  let idx = 0;

  while (idx < rawDiff.length) {
    const cur = rawDiff[idx];

    if (cur.type === 'unchanged') {
      result.push({
        type: 'unchanged',
        oldLineNumber: cur.lineNoA,
        newLineNumber: cur.lineNoB,
        oldContent: cur.lineA,
        newContent: cur.lineB,
      });
      idx++;
    } else {
      // Gather contiguous diff chunk (all consecutive removals and additions)
      const removals: typeof rawDiff = [];
      const additions: typeof rawDiff = [];

      while (idx < rawDiff.length && rawDiff[idx].type !== 'unchanged') {
        if (rawDiff[idx].type === 'removed') {
          removals.push(rawDiff[idx]);
        } else if (rawDiff[idx].type === 'added') {
          additions.push(rawDiff[idx]);
        }
        idx++;
      }

      const pairs = Math.min(removals.length, additions.length);
      for (let k = 0; k < pairs; k++) {
        const rem = removals[k];
        const add = additions[k];
        const wordDiffs = computeWordDiff(rem.lineA || '', add.lineB || '');
        result.push({
          type: 'modified',
          oldLineNumber: rem.lineNoA,
          newLineNumber: add.lineNoB,
          oldContent: rem.lineA,
          newContent: add.lineB,
          wordDiffs,
        });
      }

      // Any remaining removals
      for (let k = pairs; k < removals.length; k++) {
        const rem = removals[k];
        result.push({
          type: 'removed',
          oldLineNumber: rem.lineNoA,
          oldContent: rem.lineA,
        });
      }

      // Any remaining additions
      for (let k = pairs; k < additions.length; k++) {
        const add = additions[k];
        result.push({
          type: 'added',
          newLineNumber: add.lineNoB,
          newContent: add.lineB,
        });
      }
    }
  }

  return result;
}

/**
 * Friendly field label mapping
 */
const FIELD_LABELS: Record<string, string> = {
  title: 'Publication Title',
  slug: 'URL Permalink / Slug',
  summary: 'Executive Summary',
  content: 'Article / Body Content',
  body_html: 'Regulatory Release Body (HTML)',
  headline: 'Announcement Headline',
  highlights: 'Key Financial & Operational Highlights',
  narrative: 'Executive Review Narrative',
  meta_description: 'Search Engine Meta Description',
  author: 'Author Designation',
  period_label: 'Financial Reporting Period',
  unit: 'Financial Currency Unit',
};

/**
 * Computes structured field-by-field diff between two JSON records
 */
export function computeRecordDiff(
  oldObj: Record<string, any> = {},
  newObj: Record<string, any> = {}
): { fieldDiffs: FieldDiff[]; totalAdditions: number; totalDeletions: number; fieldsChanged: number } {
  const allKeys = Array.from(new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]))
    .filter((k) => !['id', 'created_at', 'updated_at', 'content_hash', 'author_id'].includes(k));

  const fieldDiffs: FieldDiff[] = [];
  let totalAdditions = 0;
  let totalDeletions = 0;

  for (const key of allKeys) {
    const oldVal = oldObj ? oldObj[key] : undefined;
    const newVal = newObj ? newObj[key] : undefined;

    const oldStr = formatValueForDiff(oldVal);
    const newStr = formatValueForDiff(newVal);

    if (oldStr === newStr) {
      continue; // Skip unchanged fields from verbose display unless inspected
    }

    let status: 'added' | 'removed' | 'modified' | 'unchanged' = 'modified';
    if (oldVal === undefined || oldVal === null || oldVal === '') {
      status = 'added';
    } else if (newVal === undefined || newVal === null || newVal === '') {
      status = 'removed';
    }

    const lineDiff = computeLineDiff(oldStr, newStr);

    let additions = 0;
    let deletions = 0;
    for (const item of lineDiff) {
      if (item.type === 'added') additions++;
      else if (item.type === 'removed') deletions++;
      else if (item.type === 'modified') {
        additions++;
        deletions++;
      }
    }

    totalAdditions += additions;
    totalDeletions += deletions;

    fieldDiffs.push({
      fieldName: key,
      fieldLabel: FIELD_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      status,
      oldValue: oldVal,
      newValue: newVal,
      lineDiff,
      additions,
      deletions,
    });
  }

  return {
    fieldDiffs,
    totalAdditions,
    totalDeletions,
    fieldsChanged: fieldDiffs.length,
  };
}

function formatValueForDiff(val: any): string {
  if (val === undefined || val === null) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (Array.isArray(val)) {
    return val
      .map((item) => (typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)))
      .join('\n');
  }
  return JSON.stringify(val, null, 2);
}
