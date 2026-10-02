'use client';

import {
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import type { SectionInstance } from '@/lib/studio/types';
import { COMPONENT_REGISTRY } from '@/lib/studio/componentRegistry';

export function EditorSectionList({
  sections,
  canEdit,
  selectedId,
  onSelect,
  onAdd,
  onMove,
  onDuplicate,
  onDelete,
  onVisibility,
}: {
  sections: SectionInstance[];
  canEdit: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
  onDuplicate: (index: number) => void;
  onDelete: (id: string) => void;
  onVisibility: (id: string) => void;
}) {
  return (
    <div className="flex h-full flex-col p-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Page sections
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          Select a section to edit its text, images, and links.
        </p>
      </div>
      {canEdit && (
        <button
          type="button"
          onClick={onAdd}
          className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"
        >
          <Plus className="h-4 w-4" />
          Add section
        </button>
      )}
      <ol className="mt-4 flex-1 space-y-2 overflow-y-auto">
        {sections.map((section, index) => (
          <li
            key={section.id}
            className={`rounded-xl border ${selectedId === section.id ? 'border-blue-400 bg-blue-50/60 dark:bg-blue-950/30' : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'}`}
          >
            <button
              type="button"
              aria-pressed={selectedId === section.id}
              onClick={() => onSelect(section.id)}
              className="w-full p-3 text-left"
            >
              <span className="block text-xs font-semibold text-slate-900 dark:text-slate-100">
                {index + 1}.{' '}
                {COMPONENT_REGISTRY[section.componentId]?.name ||
                  section.componentId.replaceAll('_', ' ')}
                {!section.visible && (
                  <span className="ml-2 text-slate-400">Hidden</span>
                )}
              </span>
              <span className="mt-1 block truncate text-[11px] text-slate-500">
                {section.props.title ||
                  section.props.quote ||
                  'Select to edit this section'}
              </span>
            </button>
            {selectedId === section.id && canEdit && (
              <div className="flex items-center justify-between border-t border-blue-100 px-2 py-1.5 dark:border-blue-900">
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Move section up"
                    disabled={index === 0}
                    onClick={() => onMove(index, 'up')}
                    className="rounded p-1.5 text-slate-500 hover:bg-blue-100 disabled:opacity-30"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move section down"
                    disabled={index === sections.length - 1}
                    onClick={() => onMove(index, 'down')}
                    className="rounded p-1.5 text-slate-500 hover:bg-blue-100 disabled:opacity-30"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={
                      section.visible ? 'Hide section' : 'Show section'
                    }
                    onClick={() => onVisibility(section.id)}
                    className="rounded p-1.5 text-slate-500 hover:bg-blue-100"
                  >
                    {section.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    aria-label="Duplicate section"
                    onClick={() => onDuplicate(index)}
                    className="rounded p-1.5 text-slate-500 hover:bg-blue-100"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete section"
                    onClick={() => onDelete(section.id)}
                    className="rounded p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ol>
      {!sections.length && (
        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500 dark:bg-slate-900">
          This page has no sections yet. Ask your Bastion team to set up its
          layout, or add an approved section.
        </p>
      )}
      <p className="mt-4 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400 dark:border-slate-800">
        Changes appear on the canvas immediately. Save a draft to keep them;
        publish when your page is ready.
      </p>
    </div>
  );
}
