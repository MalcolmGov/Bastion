import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';
import type { SectionInstance } from '@/lib/studio/types';
import { validateAiProposal } from './aiProposal';
export interface WebsitePage {
  pageSlug: string;
  title: string;
  version: number;
  sections: SectionInstance[];
}
export interface WebsiteProposal {
  summary: string;
  pages: (WebsitePage & {
    baseSections: SectionInstance[];
    changes: string[];
  })[];
}
export function validateWebsiteProposal(
  reply: string,
  pages: WebsitePage[],
  target?: { pageSlug: string; id: string },
): WebsiteProposal | null {
  const block =
    reply.match(/```json\s*([\s\S]*?)```/i)?.[1] ||
    (reply.trim().startsWith('{') ? reply.trim() : null);
  if (!block) return null;
  let raw: any;
  try {
    raw = JSON.parse(block);
  } catch {
    throw new Error(
      'The assistant returned an incomplete plan. Please try again.',
    );
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('Invalid website plan.');
  const changed = new Map<string, WebsiteProposal['pages'][number]>();
  const pageFor = (slug: string) => {
    const page = pages.find((page) => page.pageSlug === slug);
    if (!page)
      throw new Error('The plan refers to a page outside this website.');
    if (!changed.has(slug))
      changed.set(slug, {
        ...page,
        sections: JSON.parse(JSON.stringify(page.sections)),
        baseSections: page.sections,
        changes: [],
      });
    return changed.get(slug)!;
  };
  if (raw.theme) {
    if (!['dark', 'light'].includes(raw.theme))
      throw new Error('Unsupported theme.');
    const slugs = raw.pageSlugs || pages.map((page) => page.pageSlug);
    if (!Array.isArray(slugs) || !slugs.length)
      throw new Error('Invalid theme scope.');
    for (const slug of slugs) {
      const page = pageFor(slug);
      page.sections = page.sections.map((section) =>
        target &&
        (target.pageSlug !== page.pageSlug || target.id !== section.id)
          ? section
          : {
              ...section,
              styles: {
                ...section.styles,
                theme: raw.theme,
                backgroundType: 'solid',
                gradient: undefined,
                backgroundColor: raw.theme === 'dark' ? '#0F172A' : '#FFFFFF',
                headingColor: raw.theme === 'dark' ? '#F8FAFC' : '#0F172A',
                textColor: raw.theme === 'dark' ? '#CBD5E1' : '#475569',
              },
            },
      );
      page.changes.push(
        `Apply ${raw.theme} theme to ${target ? 1 : page.sections.length} sections`,
      );
    }
  }
  if (
    raw.changes !== undefined &&
    (!Array.isArray(raw.changes) || raw.changes.length > 200)
  )
    throw new Error('Invalid list of website changes.');
  for (const change of raw.changes || []) {
    if (
      target &&
      (target.pageSlug !== change.pageSlug ||
        target.id !== change.targetSectionId)
    )
      throw new Error('The plan exceeds the selected section scope.');
    const page = pageFor(change.pageSlug);
    const index = page.sections.findIndex(
      (section) => section.id === change.targetSectionId,
    );
    if (index < 0) throw new Error('The plan refers to an unknown section.');
    let section = page.sections[index];
    const proposal = validateAiProposal(JSON.stringify(change), section);
    if (proposal)
      section = {
        ...section,
        props: { ...section.props, ...proposal.props },
        styles: { ...section.styles, ...proposal.styles },
      };
    if (change.variant !== undefined) {
      if (
        !COMPONENT_REGISTRY[section.componentId]?.variants.some(
          (variant) => variant.id === change.variant,
        )
      )
        throw new Error('Unsupported section layout.');
      section = { ...section, variant: change.variant };
    }
    if (change.visible !== undefined) {
      if (typeof change.visible !== 'boolean')
        throw new Error('Invalid section visibility.');
      section = { ...section, visible: change.visible };
    }
    page.sections[index] = section;
    page.changes.push(
      typeof change.summary === 'string'
        ? change.summary
        : `Update ${COMPONENT_REGISTRY[section.componentId]?.name || section.componentId}`,
    );
  }
  if (
    raw.orders !== undefined &&
    (!Array.isArray(raw.orders) || raw.orders.length > pages.length)
  )
    throw new Error('Invalid page ordering.');
  if (target && raw.orders?.length)
    throw new Error('Select a page or website scope to reorder sections.');
  for (const order of raw.orders || []) {
    const page = pageFor(order.pageSlug);
    if (
      !Array.isArray(order.sectionIds) ||
      order.sectionIds.length !== page.sections.length ||
      new Set(order.sectionIds).size !== page.sections.length ||
      order.sectionIds.some(
        (id: string) => !page.sections.some((section) => section.id === id),
      )
    )
      throw new Error('Section order must retain every existing section.');
    page.sections = order.sectionIds.map((id: string) =>
      page.sections.find((section) => section.id === id)!,
    );
    page.changes.push('Reorder page sections');
  }
  const updates = [...changed.values()].filter(
    (page) =>
      JSON.stringify(page.sections) !== JSON.stringify(page.baseSections),
  );
  return updates.length
    ? {
        summary:
          typeof raw.summary === 'string'
            ? raw.summary
            : 'Suggested website improvements',
        pages: updates,
      }
    : null;
}
