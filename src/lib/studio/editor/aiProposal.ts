import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';
import type { SectionInstance } from '@/lib/studio/types';

const styleKeys = new Set([
  'backgroundType',
  'backgroundColor',
  'gradient',
  'textColor',
  'headingColor',
  'accentColor',
  'borderColor',
  'paddingY',
  'backgroundPattern',
  'patternOpacity',
  'theme',
  'brandTextColor',
]);
function safeValue(value: unknown): void {
  if (
    typeof value === 'string' &&
    (value.length > 20000 ||
      /(?:javascript|vbscript|data):|<\s*(?:script|iframe|object|embed)|\bon\w+\s*=/i.test(
        value,
      ))
  )
    throw new Error(
      'The suggestion contains unsupported content. Please ask for a simpler change.',
    );
  if (Array.isArray(value)) {
    if (value.length > 100)
      throw new Error('Too many items in this suggestion.');
    value.forEach(safeValue);
  } else if (value && typeof value === 'object')
    for (const [key, item] of Object.entries(value)) {
      if (['__proto__', 'constructor', 'prototype'].includes(key))
        throw new Error('Invalid content property.');
      safeValue(item);
    }
}
function mergeKnown(current: any, update: any): any {
  if (Array.isArray(current)) {
    if (!Array.isArray(update))
      throw new Error('The suggestion has an invalid list.');
    return update.map((item) =>
      current[0] ? mergeKnown(current[0], item) : item,
    );
  }
  if (current && typeof current === 'object') {
    if (!update || typeof update !== 'object' || Array.isArray(update))
      throw new Error('The suggestion has an invalid content field.');
    const merged = { ...current };
    for (const [key, value] of Object.entries(update)) {
      if (!(key in current))
        throw new Error(`Unsupported content field: ${key}`);
      merged[key] = mergeKnown(current[key], value);
    }
    return merged;
  }
  if (current != null && typeof current !== typeof update)
    throw new Error('The suggestion has an invalid field type.');
  return update;
}

/** Only complete, valid JSON can become a reviewable editor change. */
export function validateAiProposal(reply: string, section: SectionInstance) {
  const block =
    reply.match(/```json\s*([\s\S]*?)```/i)?.[1] ||
    (reply.trim().startsWith('{') ? reply.trim() : null);
  if (!block) return null; // A conversational answer need not contain a change.
  let raw: any;
  try {
    raw = JSON.parse(block);
  } catch {
    throw new Error(
      'The assistant returned an incomplete suggestion. Please try again.',
    );
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('Invalid suggestion.');
  if (raw.targetSectionId && raw.targetSectionId !== section.id)
    throw new Error(
      'The suggestion targets a different section. Select that section and try again.',
    );
  safeValue(raw);
  const props: Record<string, any> = {};
  for (const [key, value] of Object.entries(raw.props || {})) {
    const definition = COMPONENT_REGISTRY[section.componentId]?.fields[key];
    if (!(key in section.props) && !definition)
      throw new Error(`Unsupported content field: ${key}`);
    if (
      definition &&
      !definition.itemSchema &&
      ['text', 'textarea', 'image', 'link', 'select'].includes(
        definition.type,
      ) &&
      typeof value !== 'string'
    )
      throw new Error('The suggestion has an invalid text field.');
    if (
      definition?.type === 'number' &&
      (typeof value !== 'number' || !Number.isFinite(value))
    )
      throw new Error('The suggestion has an invalid number.');
    if (definition?.type === 'boolean' && typeof value !== 'boolean')
      throw new Error('The suggestion has an invalid switch.');
    if (definition?.type === 'list' && !Array.isArray(value))
      throw new Error('The suggestion has an invalid list.');
    const baseline =
      section.props[key] ??
      COMPONENT_REGISTRY[section.componentId]?.defaultProps[key] ??
      definition?.defaultValue;
    props[key] = mergeKnown(baseline, value);
    if (definition?.required && !props[key])
      throw new Error(`The ${definition.label} cannot be empty.`);
    if (
      definition?.type === 'select' &&
      !definition.options?.some((option) => option.value === props[key])
    )
      throw new Error('Unsupported content option.');
  }
  const styles: Record<string, any> = {};
  for (const [key, value] of Object.entries(raw.styles || {})) {
    if (
      !styleKeys.has(key) ||
      (typeof value !== 'string' && typeof value !== 'number')
    )
      throw new Error(`Unsupported design setting: ${key}`);
    if (
      /color/i.test(key) &&
      (typeof value !== 'string' ||
        !/^(#[a-f\d]{3,8}|rgba?\([\d\s.,%]+\)|transparent)$/i.test(value))
    )
      throw new Error('Unsupported color value.');
    if (key === 'theme' && !['light', 'dark'].includes(String(value)))
      throw new Error('Unsupported theme.');
    if (
      key === 'paddingY' &&
      !/^py-(0|2|4|6|8|10|12|16|20|24|32)$/.test(String(value))
    )
      throw new Error('Unsupported spacing.');
    styles[key] = value;
  }
  if (!Object.keys(props).length && !Object.keys(styles).length) return null;
  return {
    summary:
      typeof raw.summary === 'string' ? raw.summary : 'Suggested page update',
    targetSectionId: section.id,
    props,
    styles,
  };
}
