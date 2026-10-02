"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";
import { useStudioWorkspace } from "./StudioWorkspaceProvider";

export function MobileStudioNavigation() {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const { activeSite } = useStudioWorkspace();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-[#0B0F19] md:hidden">
        <button
          type="button"
          aria-label="Open navigation"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-bold">Bastion Studio</p>
          <p className="truncate text-xs text-slate-500">
            {activeSite?.name || "Publishing workspace"}
          </p>
        </div>
      </header>
      <dialog
        ref={dialog}
        aria-label="Studio navigation"
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        className="fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-72 max-w-[90vw] border-0 bg-[#0D1522] p-0 text-white backdrop:bg-slate-950/60"
      >
        <div className="flex h-12 items-center justify-between border-b border-slate-700 px-4">
          <span className="text-sm font-semibold">Navigation</span>
          <button
            type="button"
            autoFocus
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {open && (
          <div className="[&>aside]:h-[calc(100dvh-3rem)] [&>aside]:w-full">
            <AdminSidebar />
          </div>
        )}
      </dialog>
    </>
  );
}
