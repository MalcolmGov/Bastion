import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/guard";
import { getReleasePreview } from "@/lib/releases/preview";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("content:read");
  if (!gate.ok) return gate.response;
  const { id } = await params;
  const preview = await getReleasePreview(gate.user, id);
  return NextResponse.json(preview || { error: "Release not found" }, {
    status: preview ? 200 : 404,
    headers: { "Cache-Control": "private, no-store" },
  });
}
