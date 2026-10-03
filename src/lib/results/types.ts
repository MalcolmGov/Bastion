export type RowKind = 'data' | 'section' | 'total';

export interface ResultsColumn {
  id: string;
  label: string;
  role: 'note' | 'figure';
}

export interface ResultsRow {
  id: string;
  label: string;
  kind: RowKind;
  cells: Array<string | null>;
  sourceBlankCells?: number[];
  confidence: number;
}

export interface ResultsStatement {
  sourcePage?: number;
  id: string;
  title: string;
  period: string;
  stubLabel: string;
  columns: ResultsColumn[];
  rows: ResultsRow[];
  confidence: number;
}

export interface ResultsHighlight {
  label: string;
  value: string;
  comparison: string;
}

export interface ResultsBrand {
  sourceUrl: string;
  siteName: string;
  logoUrl: string | null;
  colors: string[];
  primary: string;
  accent: string;
  ink: string;
  paper: string;
  headingFont: string;
  bodyFont: string;
}

export interface PublicationTable {
  columns: string[];
  current: boolean[];
  rows: Array<{ kind: 'section' | 'data' | 'subtotal' | 'total'; label: string; cells: Array<string | null> }>;
  footnotes: string[];
}

export interface PublicationMetric {
  group: string;
  label: string;
  value: string;
  comparison: string;
}

export interface PublicationBlock {
  kind: 'heading' | 'paragraph' | 'metrics' | 'table' | 'list';
  sourcePage?: number;
  level?: 2 | 3;
  text?: string;
  items?: string[];
  metrics?: PublicationMetric[];
  table?: PublicationTable;
}

export interface ResultsDocument {
  issuer: string;
  title: string;
  periodLabel: string;
  unit: string;
  narrative: string[];
  highlights: ResultsHighlight[];
  statements: ResultsStatement[];
  notes: string[];
  warnings: string[];
  sourceFilename: string;
  pageCount: number;
  brand?: ResultsBrand | null;
  presentationHtml?: string | null;
  publication?: PublicationBlock[];
  sourcePages?: Array<{ page: number; width: number; height: number; image: string }>;
}

export interface StoredResultsDocument {
  id: string;
  clientId: string | null;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  sourceFilename: string;
  document: ResultsDocument;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}
