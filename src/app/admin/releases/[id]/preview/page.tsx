import { ReleasePreviewRoom } from "@/components/admin/ReleasePreviewRoom";

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReleasePreviewRoom releaseId={id} />;
}
