'use client';

import { createContext, useContext, useEffect, useId, useState } from 'react';
import { EditorDialog } from './EditorDialog';

const MediaClient = createContext<string | undefined>(undefined);
function ImageChooser({ onChoose }: { onChoose: (url: string) => void }) {
  const clientId = useContext(MediaClient);
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(
      `/api/admin/media?${new URLSearchParams({ mime: 'image', ...(clientId ? { clientId } : {}) })}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || 'Images could not be loaded.');
        setAssets(data.assets || []);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [open, clientId]);
  const filtered = assets.filter((asset) =>
    `${asset.filename} ${asset.alt_text || ''}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600"
      >
        Choose from media library
      </button>
      <EditorDialog
        open={open}
        title="Choose an image"
        onClose={() => setOpen(false)}
      >
        <input
          aria-label="Search images"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search your images…"
          className="my-4 w-full rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        {error && (
          <p role="alert" className="text-sm text-rose-600">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-sm text-slate-500">Loading images…</p>
        ) : (
          <div className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto">
            {filtered.map((asset) => (
              <button
                type="button"
                key={asset.id}
                onClick={() => {
                  onChoose(asset.url);
                  setOpen(false);
                }}
                className="overflow-hidden rounded-lg border border-slate-200 text-left hover:border-blue-500"
              >
                <img
                  src={asset.url}
                  alt={asset.alt_text || asset.filename}
                  loading="lazy"
                  className="h-28 w-full object-cover"
                />
                <span className="block truncate p-2 text-xs">
                  {asset.filename}
                </span>
              </button>
            ))}
          </div>
        )}
        {!loading && !error && !filtered.length && (
          <p className="text-sm text-slate-500">
            No matching images. Upload images in your workspace’s Media library,
            then return here to choose one.
          </p>
        )}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-5 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          Close
        </button>
      </EditorDialog>
    </>
  );
}

import type {
  FieldDefinition,
  RegisteredComponent,
} from '@/lib/studio/componentRegistry';

const names: Record<string, string> = {
  title: 'Heading',
  subtitle: 'Description',
  description: 'Description',
  badge: 'Small heading',
  eyebrow: 'Small heading',
  primaryCta: 'Main button',
  secondaryCta: 'Secondary button',
  bgImage: 'Section image',
  logoUrl: 'Logo image',
  brandName: 'Brand name',
  quote: 'Quote',
  ctaText: 'Button text',
  ctaHref: 'Button link',
  links: 'Navigation links',
  href: 'Link address',
  label: 'Button text',
};
const label = (key: string, fallback?: string) =>
  names[key] || fallback || key.replace(/([A-Z])/g, ' $1').replaceAll('_', ' ');
function infer(value: any, key: string): FieldDefinition {
  return {
    type: Array.isArray(value)
      ? 'list'
      : typeof value === 'boolean'
        ? 'boolean'
        : typeof value === 'number'
          ? 'number'
          : key.toLowerCase().includes('image') || key === 'logoUrl'
            ? 'image'
            : typeof value === 'string' && value.length > 100
              ? 'textarea'
              : 'text',
    label: label(key),
    ...(value && typeof value === 'object' && !Array.isArray(value)
      ? {
          itemSchema: Object.fromEntries(
            Object.entries(value).map(([key, value]) => [
              key,
              infer(value, key),
            ]),
          ),
        }
      : {}),
  };
}
function ContentField({
  path,
  definition,
  value,
  template,
  onChange,
  depth = 0,
}: {
  path: string;
  definition: FieldDefinition;
  value: any;
  template?: any;
  onChange: (value: any) => void;
  depth?: number;
}) {
  const uid = useId();
  const id = `field-${path}`;
  const input =
    'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white';
  const key = path.split('.').pop() || path;
  const title = label(key, definition.label);
  if (depth > 5)
    return (
      <p className="text-xs text-slate-500">
        This content is nested too deeply to edit here.
      </p>
    );
  if (definition.type === 'list') {
    const items: any[] = Array.isArray(value) ? value : [];
    const sample = Array.isArray(template) ? template[0] : items[0];
    return (
      <details className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
        <summary className="cursor-pointer text-xs font-semibold">
          {title}{' '}
          <span className="ml-1 font-normal text-slate-400">
            {items.length} items
          </span>
        </summary>
        <div className="mt-3 space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800"
            >
              <div className="mb-3 flex justify-between text-xs">
                <strong>Item {index + 1}</strong>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  className="text-slate-500 hover:text-rose-600"
                >
                  Remove
                </button>
              </div>
              <ContentField
                path={`${path}.${index}`}
                definition={
                  definition.itemSchema
                    ? {
                        type: 'text',
                        label: `Item ${index + 1}`,
                        itemSchema: definition.itemSchema,
                      }
                    : infer(item, `Item ${index + 1}`)
                }
                value={item}
                template={sample}
                onChange={(next) =>
                  onChange(
                    items.map((current, i) => (i === index ? next : current)),
                  )
                }
                depth={depth + 1}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              onChange([
                ...items,
                sample !== undefined
                  ? JSON.parse(JSON.stringify(sample))
                  : definition.itemSchema
                    ? Object.fromEntries(
                        Object.entries(definition.itemSchema).map(
                          ([key, field]) => [key, field.defaultValue ?? ''],
                        ),
                      )
                    : '',
              ])
            }
            className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-medium text-blue-600"
          >
            Add item
          </button>
        </div>
      </details>
    );
  }
  const fields =
    definition.itemSchema ||
    (value && typeof value === 'object'
      ? infer(value, key).itemSchema
      : undefined);
  if (fields)
    return (
      <fieldset
        id={id}
        className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
      >
        <legend className="px-1 text-xs font-semibold">{title}</legend>
        <div className="space-y-4">
          {Object.entries(fields).map(([key, field]) => (
            <ContentField
              key={key}
              path={`${path}.${key}`}
              definition={field}
              value={value?.[key]}
              template={template?.[key]}
              onChange={(next) => onChange({ ...value, [key]: next })}
              depth={depth + 1}
            />
          ))}
        </div>
      </fieldset>
    );
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-slate-600 dark:text-slate-300"
      >
        {title}
        {definition.required && <span className="ml-1 text-slate-400">*</span>}
      </label>
      {definition.type === 'boolean' ? (
        <input
          id={id}
          type="checkbox"
          checked={!!value}
          onChange={(event) => onChange(event.target.checked)}
          className="mt-2"
        />
      ) : definition.type === 'select' ? (
        <select
          id={id}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          className={input}
        >
          {definition.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : definition.type === 'textarea' ||
        key === 'title' ||
        key === 'quote' ? (
        <textarea
          id={id}
          rows={3}
          value={typeof value === 'string' ? value : ''}
          onChange={(event) => onChange(event.target.value)}
          className={`${input} leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          type={definition.type === 'number' ? 'number' : 'text'}
          value={
            typeof value === 'string' || typeof value === 'number' ? value : ''
          }
          onChange={(event) =>
            onChange(
              definition.type === 'number'
                ? Number(event.target.value)
                : event.target.value,
            )
          }
          className={input}
        />
      )}
      {definition.type === 'image' && <ImageChooser onChoose={onChange} />}
      {definition.type === 'image' && (
        <p
          id={`${uid}-help`}
          className="mt-2 text-[11px] leading-relaxed text-slate-400"
        >
          Choose an existing image above, or paste an HTTPS image link.
        </p>
      )}
      {definition.description && (
        <p className="mt-2 text-[11px] text-slate-400">
          {definition.description}
        </p>
      )}
    </div>
  );
}

export function EditorContentFields({
  component,
  values,
  onChange,
  disabled,
  clientId,
}: {
  clientId?: string;
  component?: RegisteredComponent;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  disabled: boolean;
}) {
  const known =
    component?.fields ||
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, infer(value, key)]),
    );
  const additional = Object.entries(values).filter(
    ([key]) =>
      !known[key] && !/(color|theme|style|font|padding|alignment)/i.test(key),
  );
  return (
    <MediaClient.Provider value={clientId}>
      <fieldset disabled={disabled} className="space-y-5 disabled:opacity-70">
        <p className="text-xs leading-relaxed text-slate-500">
          {disabled
            ? 'You have view-only access to this page.'
            : 'Changes appear immediately on the page. Fields marked * are required content.'}
        </p>
        {Object.entries(known).map(([key, definition]) => (
          <ContentField
            key={key}
            path={key}
            definition={definition}
            value={values[key]}
            template={component?.defaultProps[key]}
            onChange={(next) => onChange(key, next)}
          />
        ))}
        {additional.length > 0 && (
          <details className="border-t border-slate-200 pt-4">
            <summary className="cursor-pointer text-xs font-medium text-slate-500">
              Additional content
            </summary>
            <div className="mt-4 space-y-5">
              {additional.map(([key, value]) => (
                <ContentField
                  key={key}
                  path={key}
                  definition={infer(value, key)}
                  value={value}
                  onChange={(next) => onChange(key, next)}
                />
              ))}
            </div>
          </details>
        )}
      </fieldset>
    </MediaClient.Provider>
  );
}
