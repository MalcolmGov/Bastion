import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/guard";
import { getReleasePreview } from "@/lib/releases/preview";
import { StudioComponentRenderer } from "@/components/studio/StudioComponentRenderer";
import type { DesignCollectionId, SectionInstance } from "@/lib/studio/types";

export const dynamic = "force-dynamic";

export default async function EmbeddedPreview({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; itemId: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const gate = await requirePermission("content:read");
  if (!gate.ok) notFound();
  const { id, itemId } = await params;
  const { mode } = await searchParams;
  const preview = await getReleasePreview(gate.user, id);
  const item = preview?.items.find((candidate) => candidate.id === itemId);
  if (!item?.visual) notFound();
  const content = mode === "live" ? item.live : item.proposed;
  if (!content)
    return (
      <p className="p-10 text-center text-slate-500">
        No published baseline is available.
      </p>
    );
  const sections = content.sections as SectionInstance[];
  return (
    <div className="min-h-screen bg-white text-slate-900" inert>
      {sections.map((section) => (
        <StudioComponentRenderer
          key={section.id}
          section={section}
          collection={content.collection as DesignCollectionId}
        />
      ))}
    </div>
  );
}
