"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  ExternalLink,
  FolderOpen,
  Globe,
  Layers,
  Pencil,
  Send,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useAdminAuth } from "./AdminAuthProvider";
import {
  type WorkspaceClient,
  type WorkspaceSite,
  useStudioWorkspace,
} from "./StudioWorkspaceProvider";
import { useDashboardCustomizer } from "./DashboardCustomizerProvider";
import { ClientLearningHub } from "./ClientLearningHub";
import { WorkspaceActionCenter } from "./WorkspaceActionCenter";
import { isAgencyUser } from "@/lib/auth/roles";

interface ClientCmsHomeProps {
  client: WorkspaceClient;
  site: WorkspaceSite | null;
  dashboardData: { mediaCount?: number } | null;
  onSwitchToAgency?: () => void;
}

const actionClass =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500";

export function ClientCmsHome({
  client,
  site,
  dashboardData,
  onSwitchToAgency,
}: ClientCmsHomeProps) {
  const { user, hasPerm } = useAdminAuth();
  const { activeSite, clientWebsites, setActiveSiteId } = useStudioWorkspace();
  const { openCustomizer, preferences } = useDashboardCustomizer();
  const [learning, setLearning] = useState(false);
  const currentSite = [activeSite, site, clientWebsites[0]].find(
    (candidate) => candidate?.clientId === client.id,
  );
  const publishedSites = clientWebsites.filter(
    (website) => website.status === "published",
  ).length;
  const editorHref = currentSite
    ? `/admin/editor?siteId=${encodeURIComponent(currentSite.id)}`
    : "/admin/editor";
  // Preview the published local composition, never an external customer domain in an iframe.
  const previewHref =
    currentSite?.slug === "goldfields"
      ? "/"
      : currentSite
        ? `/sites/${encodeURIComponent(currentSite.slug)}`
        : null;
  const domain = currentSite?.primaryDomain;
  const liveHref =
    domain && /^https?:\/\//i.test(domain)
      ? domain
      : domain && !domain.includes("localhost")
        ? `https://${domain}`
        : previewHref;
  const isPublished = currentSite?.status === "published";
  const firstName = user?.name?.trim().split(" ")[0];

  if (learning)
    return (
      <div className="mx-auto max-w-[1440px] space-y-6 pb-12">
        <button
          type="button"
          onClick={() => setLearning(false)}
          className={`${actionClass} border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200`}
        >
          Back to overview
        </button>
        <ClientLearningHub isEmbedded />
      </div>
    );

  return (
    <div className="mx-auto max-w-[1440px] space-y-7 pb-12 text-slate-900 dark:text-slate-100">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {client.name} / Executive overview
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Your digital presence, at a glance.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {firstName ? `Welcome back, ${firstName}.` : "Welcome back."}{" "}
            Everything you need to keep your websites moving forward.
          </p>
        </div>
        <button
          type="button"
          onClick={openCustomizer}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 focus-visible:outline-blue-500 dark:hover:bg-slate-800"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Personalise
        </button>
      </div>

      <section
        aria-labelledby="featured-website"
        className="relative isolate overflow-hidden rounded-[28px] bg-[#101b32] text-white shadow-[0_18px_55px_-25px_rgba(15,23,42,0.5)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-40 h-[600px] w-[600px] rounded-full bg-blue-500/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-48 left-1/4 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl"
        />
        <div className="relative grid items-center gap-8 p-6 sm:p-9 lg:grid-cols-[1fr_1.05fr] xl:gap-12 xl:p-10">
          <div className="min-w-0">
            <div className="mb-7 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-200">
              <span
                className={`h-2 w-2 rounded-full ${isPublished ? "bg-emerald-400" : "bg-amber-400"}`}
              />
              {isPublished
                ? "Published website"
                : currentSite
                  ? "Website in preparation"
                  : "Your website workspace"}
            </div>
            <h2
              id="featured-website"
              className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-[38px]"
            >
              {currentSite?.name || "Select a website to get started"}
            </h2>
            <p className="mt-4 flex items-center gap-2 break-all text-sm text-slate-300">
              <Globe className="h-4 w-4 shrink-0 text-blue-300" />
              {domain ||
                (currentSite
                  ? `Your website · ${currentSite.slug}`
                  : "Your Bastion team will connect your website here.")}
            </p>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Make your next update with confidence. Edit visually, review your
              changes, and prepare them for publishing.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              {currentSite && hasPerm("content:edit") && (
                <Link
                  href={editorHref}
                  className={`${actionClass} bg-white text-slate-900 hover:bg-blue-50`}
                >
                  <Pencil className="h-4 w-4" />
                  Edit website
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
              {currentSite && liveHref && isPublished && (
                <a
                  href={liveHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${actionClass} border border-white/20 text-white hover:bg-white/10`}
                >
                  View live site
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <div className="mt-7 flex items-center gap-2 text-xs text-slate-400">
              <Check className="h-4 w-4 text-teal-300" />
              Draft edits stay separate from your published website.
            </div>
          </div>
          <div className="min-w-0 rounded-2xl border border-white/20 bg-white/5 p-2 shadow-2xl sm:p-3">
            <div className="overflow-hidden rounded-xl bg-white">
              <div className="flex h-10 items-center gap-3 border-b border-slate-100 bg-slate-50 px-4">
                <div aria-hidden="true" className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                  <span className="h-2 w-2 rounded-full bg-slate-300" />
                </div>
                <span className="min-w-0 flex-1 truncate text-center text-[10px] font-medium text-slate-500">
                  {currentSite?.name || "Website preview"}
                </span>
                <Globe aria-hidden="true" className="h-3 w-3 text-slate-400" />
              </div>
              <div className="relative h-[250px] overflow-hidden bg-slate-100 sm:h-[290px]">
                {previewHref && isPublished ? (
                  <iframe
                    key={previewHref}
                    src={previewHref}
                    title={`Published preview of ${currentSite?.name}`}
                    tabIndex={-1}
                    sandbox="allow-same-origin"
                    loading="lazy"
                    className="pointer-events-none absolute left-0 top-0 h-[200%] w-[200%] origin-top-left scale-50 border-0"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center text-slate-500">
                    <Globe className="h-10 w-10 text-slate-300" />
                    <p className="text-sm">
                      Your website preview will appear after its first
                      publication.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <p className="px-2 pb-1 pt-3 text-[11px] text-slate-300">
              {isPublished
                ? "Published composition preview · open the live site for the full experience"
                : "Website preview"}
            </p>
          </div>
        </div>
      </section>

      <section
        aria-label="Workspace summary"
        className="grid grid-cols-1 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0 dark:divide-slate-800 dark:border-slate-800 dark:bg-[#0F141C]"
      >
        {[
          {
            label: "Websites in your workspace",
            value: clientWebsites.length,
            detail: "Your connected web properties",
            icon: Layers,
            color:
              "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300",
          },
          {
            label: "Published websites",
            value: publishedSites,
            detail: "Based on publishing status",
            icon: Globe,
            color:
              "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-300",
          },
          {
            label: "Media assets",
            value: dashboardData
              ? Number(dashboardData.mediaCount || 0).toLocaleString()
              : "—",
            detail: "Images and files in your client library",
            icon: FolderOpen,
            color:
              "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300",
          },
        ].map((metric) => (
          <div
            key={metric.label}
            className="flex items-center gap-4 p-5 lg:p-6"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${metric.color}`}
            >
              <metric.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {metric.label}
              </p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
                {metric.value}
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                {metric.detail}
              </p>
            </div>
          </div>
        ))}
      </section>

      {clientWebsites.length > 1 && (
        <section aria-labelledby="website-switcher">
          <div className="mb-3 flex items-center justify-between gap-4">
            <h2 id="website-switcher" className="text-sm font-semibold">
              Your web properties
            </h2>
            <p className="text-xs text-slate-500">
              Select a website to focus your workspace
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clientWebsites.map((website) => (
              <button
                type="button"
                key={website.id}
                aria-pressed={website.id === currentSite?.id}
                onClick={() => setActiveSiteId(website.id)}
                className={`group flex min-w-0 items-center gap-3 rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${website.id === currentSite?.id ? "border-blue-300 bg-blue-50/70 dark:border-blue-700 dark:bg-blue-950/40" : "border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-[#0F141C]"}`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-blue-600 dark:border-slate-700 dark:bg-slate-900">
                  <Globe className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">
                    {website.name}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${website.status === "published" ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                    {website.status === "published"
                      ? "Published"
                      : "In preparation"}
                  </span>
                </span>
                {website.id === currentSite?.id && (
                  <Check className="h-4 w-4 shrink-0 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
        <WorkspaceActionCenter clientId={client.id} siteId={currentSite?.id} />
        <div className="space-y-5">
          {hasPerm("content:edit") && currentSite && (
            <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 dark:border-indigo-900 dark:from-indigo-950 dark:via-slate-900 dark:to-slate-900">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
                  A little help. A big difference.
                </span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                Meet your website assistant.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Describe what you want to enhance, fix, or polish. Review the
                proposed updates before applying them to your drafts.
              </p>
              <Link
                href={`${editorHref}&panel=ai`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-300"
              >
                Start with an idea
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </section>
          )}
          {preferences.sections?.clientActionCards !== false && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-[#0F141C]">
              <h2 className="text-sm font-semibold">
                A clear path to your next update
              </h2>
              <ol className="mt-5 space-y-5">
                {[
                  {
                    icon: Pencil,
                    title: "Edit with confidence",
                    text: "Update your copy, images, and layout in the visual editor.",
                  },
                  {
                    icon: Check,
                    title: "Review the details",
                    text: "Check your draft before preparing it for approval.",
                  },
                  {
                    icon: Send,
                    title: "Publish when ready",
                    text: "Your publishing team controls what goes live.",
                  },
                ].map((step, index) => (
                  <li key={step.title} className="flex gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500 dark:bg-slate-800">
                      0{index + 1}
                    </span>
                    <div>
                      <h3 className="text-xs font-semibold">{step.title}</h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {step.text}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => setLearning(true)}
                className="mt-5 flex w-full items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-blue-600 dark:border-slate-800 dark:text-blue-300"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Explore the learning hub
                </span>
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </section>
          )}
        </div>
      </div>
      {onSwitchToAgency && isAgencyUser(user) && (
        <button
          type="button"
          onClick={onSwitchToAgency}
          className="text-xs text-slate-500 hover:text-blue-600"
        >
          Return to agency workspace{" "}
          <ArrowRight className="ml-1 inline h-3 w-3" />
        </button>
      )}
    </div>
  );
}
