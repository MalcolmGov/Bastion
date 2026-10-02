"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
} from "lucide-react";
import type { ReleasePreview } from "@/lib/workspace/types";

function display(value: unknown) {
  if (value === undefined) return "—";
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

export function ReleasePreviewRoom({ releaseId }: { releaseId: string }) {
  const [state, setState] = useState<{
    id: string;
    data?: ReleasePreview;
    error?: string;
  }>({ id: releaseId });
  const [selected, setSelected] = useState("");
  const [width, setWidth] = useState(1280);
  const [mode, setMode] = useState<"live" | "proposed">("proposed");
  const [tab, setTab] = useState<"visual" | "changes">("visual");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState({ id: releaseId });
    fetch(`/api/admin/releases/${encodeURIComponent(releaseId)}/preview`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error(
            response.status === 404
              ? "Release not found in your workspace."
              : "Unable to load this preview.",
          );
        const data: ReleasePreview = await response.json();
        setState({ id: releaseId, data });
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState({ id: releaseId, error: error.message });
      });
    return () => controller.abort();
  }, [releaseId, refresh]);
  const data = state.id === releaseId ? state.data : undefined;
  const item =
    data?.items.find((candidate) => candidate.id === selected) ||
    data?.items[0];
  const issues = data
    ? [
        ...data.issues,
        ...data.items.flatMap((candidate) =>
          candidate.issues.map((issue) => `${candidate.title}: ${issue}`),
        ),
      ]
    : [];
  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      <Link
        href="/admin/releases"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to releases
      </Link>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Release preview room
          </p>
          <h1 className="mt-1 text-2xl font-bold">
            {data?.name || "Review your release"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Compare current drafts with published baselines before signing off.
            Refresh after edits; these previews follow current content rather
            than a frozen release snapshot.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRefresh((value) => value + 1)}
          aria-label="Refresh release preview"
          className="rounded-xl border border-slate-200 dark:border-slate-700 p-3"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-5 text-rose-700">
          {state.error}
        </p>
      )}
      {!data && !state.error && (
        <p role="status" className="py-10 text-slate-500">
          Checking content and approvals…
        </p>
      )}
      {data && (
        <>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 capitalize">
              {data.status}
            </span>
            <span>{data.items.length} bundled items</span>
            {data.scheduledAt && (
              <span>
                Scheduled: {new Date(data.scheduledAt).toLocaleString()}
              </span>
            )}
            <span>
              Checked: {new Date(data.checkedAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="space-y-5">
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141C] p-4">
                <h2 className="font-semibold">Release contents</h2>
                <div className="mt-3 space-y-2">
                  {data.items.map((candidate) => (
                    <button
                      type="button"
                      key={candidate.id}
                      aria-pressed={candidate.id === item?.id}
                      onClick={() => {
                        setSelected(candidate.id);
                        setTab("visual");
                      }}
                      className={`w-full rounded-xl border p-3 text-left text-sm ${candidate.id === item?.id ? "border-blue-500 bg-blue-50 dark:bg-blue-950" : "border-slate-200 dark:border-slate-800 hover:border-slate-400"}`}
                    >
                      <span className="block font-semibold">
                        {candidate.title}
                      </span>
                      <span className="mt-1 block text-xs capitalize text-slate-500">
                        {candidate.kind} · {candidate.action}
                        {candidate.issues.length ? " · Needs review" : ""}
                      </span>
                    </button>
                  ))}
                </div>
                {!data.items.length && (
                  <p className="mt-3 text-sm text-slate-500">
                    This release has no content yet.
                  </p>
                )}
              </section>
              <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141C] p-4">
                <h2 className="flex items-center gap-2 font-semibold">
                  {issues.length ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                  Review checks
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  These checks inform review; publication still uses your
                  existing workflow.
                </p>
                {issues.length ? (
                  <ul className="mt-3 space-y-3 text-xs text-amber-700 dark:text-amber-300">
                    {issues.map((issue, index) => (
                      <li key={index}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-emerald-600">
                    No outstanding checks found.
                  </p>
                )}
              </section>
            </aside>
            <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F141C]">
              {item ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 p-4">
                    <h2 className="font-semibold">{item.title}</h2>
                    <div className="flex gap-2">
                      {(["visual", "changes"] as const).map((value) => (
                        <button
                          type="button"
                          key={value}
                          aria-pressed={tab === value}
                          onClick={() => setTab(value)}
                          className={`rounded-lg px-3 py-2 text-xs font-semibold ${tab === value ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800"}`}
                        >
                          {value === "visual"
                            ? "Preview"
                            : `Changes (${item.fields.length})`}
                        </button>
                      ))}
                    </div>
                  </div>
                  {tab === "visual" && item.visual ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900 p-3">
                        <div className="flex gap-1">
                          {[
                            { size: 1280, label: "Desktop", Icon: Monitor },
                            { size: 768, label: "Tablet", Icon: Tablet },
                            { size: 375, label: "Mobile", Icon: Smartphone },
                          ].map(({ size, label, Icon }) => (
                            <button
                              type="button"
                              key={size}
                              aria-label={label}
                              aria-pressed={width === size}
                              onClick={() => setWidth(size)}
                              className={`rounded-lg p-2 ${width === size ? "bg-blue-600 text-white" : "hover:bg-slate-200 dark:hover:bg-slate-800"}`}
                            >
                              <Icon className="h-4 w-4" />
                            </button>
                          ))}
                          <span className="self-center px-2 text-xs text-slate-500">
                            {width}px
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {(["live", "proposed"] as const).map((value) => (
                            <button
                              type="button"
                              key={value}
                              aria-pressed={mode === value}
                              onClick={() => setMode(value)}
                              className={`rounded-lg px-3 py-2 text-xs ${mode === value ? "bg-blue-600 text-white" : "bg-slate-200 dark:bg-slate-800"}`}
                            >
                              {value === "live"
                                ? "Published baseline"
                                : "Current draft"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="overflow-x-auto bg-slate-100 dark:bg-slate-950 p-3">
                        <iframe
                          key={`${item.id}:${mode}:${refresh}`}
                          title={`${item.title} — ${mode === "live" ? "published baseline" : "current draft"} at ${width}px`}
                          sandbox="allow-scripts"
                          src={`/admin/releases/${encodeURIComponent(releaseId)}/preview/${encodeURIComponent(item.id)}?mode=${mode}`}
                          style={{ width, height: 700 }}
                          className="mx-auto block shrink-0 border-0 bg-white shadow-sm"
                        />
                      </div>
                    </>
                  ) : (
                    <div className="p-5">
                      <p className="mb-4 text-xs text-slate-500">
                        {!item.visual && tab === "visual"
                          ? "Structured content comparison. Visual previews are available for page compositions."
                          : "Changed fields in the current draft. HTML is displayed as text."}
                      </p>
                      {!item.live && (
                        <p className="mb-4 text-sm text-amber-600">
                          No published baseline is available.
                        </p>
                      )}
                      {!item.proposed && (
                        <p className="mb-4 text-sm text-amber-600">
                          No draft is available. Check the review notes.
                        </p>
                      )}
                      <div className="space-y-5">
                        {(tab === "changes"
                          ? item.fields
                          : [
                              ...new Set([
                                ...Object.keys(item.live || {}),
                                ...Object.keys(item.proposed || {}),
                              ]),
                            ]
                        ).map((field) => (
                          <div key={field}>
                            <h3 className="mb-2 text-sm font-semibold capitalize">
                              {field.replaceAll("_", " ")}
                            </h3>
                            <div className="grid gap-3 md:grid-cols-2">
                              {(["live", "proposed"] as const).map((value) => (
                                <div
                                  key={value}
                                  className={`min-w-0 rounded-xl border p-3 ${value === "live" ? "border-slate-200 dark:border-slate-700" : "border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20"}`}
                                >
                                  <p className="mb-2 text-xs font-semibold text-slate-500">
                                    {value === "live"
                                      ? "Published baseline"
                                      : "Current draft"}
                                  </p>
                                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words text-xs font-sans leading-relaxed">
                                    {display(item[value]?.[field])}
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {tab === "changes" && !item.fields.length && (
                          <p className="py-6 text-sm text-slate-500">
                            No field changes to display.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="p-10 text-sm text-slate-500">
                  Bundle an item from the releases page to start a preview.
                </p>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
