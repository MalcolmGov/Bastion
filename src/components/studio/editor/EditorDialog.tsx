'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function EditorDialog({
  open,
  title,
  onClose,
  children,
  wide = false,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      aria-label={title}
      onCancel={onClose}
      onClose={onClose}
      className={`${wide ? 'w-[1120px]' : 'w-[460px]'} max-w-[calc(100vw-32px)] rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl backdrop:bg-slate-900/40 dark:border-slate-700 dark:bg-slate-900 dark:text-white`}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </dialog>
  );
}
