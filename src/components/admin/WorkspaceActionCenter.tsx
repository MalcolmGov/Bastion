"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, RefreshCw } from "lucide-react";
import type { AttentionData } from "@/lib/workspace/types";

const labels: Record<string, string> = {
  draft: "Drafts",
  in_review: "In review",
  approved: "Approved",
  changes_requested: "Changes requested",
  scheduled: "Scheduled",
};

export function WorkspaceActionCenter({
  clientId,
  siteId,
}: {
  clientId?: string;
  siteId?: string;
}) {
  const query = new URLSearchParams({
    ...(clientId ? { clientId } : {}),
    ...(siteId ? { siteId } : {}),
  }).toString();
  const [state, setState] = useState<{
    query: string;
    data?: AttentionData;
    error?: string;
  }>({ query: "" });
  const [refresh, setRefresh] = useState(0);
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    const controller = new AbortController();
    setState({ query });
    setFilter("all");
    fetch(`/api/admin/workspace/attention?${query}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load workspace activity.");
        const data: AttentionData = await response.json();
        setState({ query, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ query, error: error.message });
      });
    return () => controller.abort();
  }, [query, refresh]);
  const data = state.query === query ? state.data : undefined;
  const error = state.query === query ? state.error : undefined;
  const items =
    data?.items.filter((item) => filter === "all" || item.status === filter) ||
    [];
  return (
    <section
      aria-labelledby="workspace-attention"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141C] p-5 sm:p-6 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Your next steps
          </p>
          <h2 id="workspace-attention" className="mt-1 text-xl font-bold">
            {data?.focus || "Workspace activity"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Live content and upcoming releases in this workspace.
          </p>
        </div>
        <button
          type="button"
          aria-label="Refresh workspace activity"
          onClick={() => setRefresh((value) => value + 1)}
          className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      {!data && !error && (
        <p role="status" className="py-8 text-sm text-slate-500">
          Loading your next steps…
        </p>
      )}
      {error && (
        <p role="alert" className="py-6 text-sm text-rose-600">
          {error} Use refresh to try again.
        </p>
      )}
      {data && (
        <>
          <div
            className="my-5 flex flex-wrap gap-2"
            aria-label="Filter activity"
          >
            <button
              type="button"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
              className={`rounded-xl border px-4 py-2 text-sm ${filter === "all" ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "border-slate-200 dark:border-slate-700"}`}
            >
              All activity
            </button>
            {Object.entries(data.counts).map(([status, count]) => (
              <button
                type="button"
                key={status}
                aria-pressed={filter === status}
                onClick={() => setFilter(status)}
                className={`rounded-xl border px-4 py-2 text-sm ${filter === status ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300" : "border-slate-200 dark:border-slate-700"}`}
              >
                {labels[status] || status}{" "}
                <strong className="ml-2 tabular-nums">{count}</strong>
              </button>
            ))}
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {items.map((item) => (
              <Link
                key={`${item.kind}:${item.id}`}
                href={item.href}
                className="group flex items-center justify-between gap-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-500 capitalize">
                    {item.kind.replaceAll("_", " ")} ·{" "}
                    {item.status.replaceAll("_", " ")} ·{" "}
                    {new Date(item.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {item.kind === "release" ? "Preview" : "Open"}
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </Link>
            ))}
            {!items.length && (
              <div className="flex items-center gap-3 py-8 text-sm text-slate-500">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <p>No pending items in this view. New work will appear here.</p>
              </div>
            )}
          </div>
          {items.length > 0 && (
            <p className="mt-3 text-xs text-slate-400">
              Showing up to 12 recent content items 6 page layouts and 6
              upcoming releases. Counts include all matching content.
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 pt-4">
            {data.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-semibold hover:text-blue-600"
              >
                {link.title}
              </Link>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
