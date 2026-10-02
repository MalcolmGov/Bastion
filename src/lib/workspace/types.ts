export interface AttentionItem {
  id: string;
  title: string;
  status: string;
  kind: string;
  updatedAt: string;
  href: string;
}

export interface AttentionData {
  focus: string;
  counts: Record<string, number>;
  items: AttentionItem[];
  links: { title: string; href: string }[];
}

export interface PreviewItem {
  id: string;
  title: string;
  kind: string;
  action: string;
  issues: string[];
  live: Record<string, unknown> | null;
  proposed: Record<string, unknown> | null;
  fields: string[];
  visual: boolean;
}

export interface ReleasePreview {
  id: string;
  name: string;
  status: string;
  scheduledAt: string | null;
  checkedAt: string;
  issues: string[];
  items: PreviewItem[];
}
