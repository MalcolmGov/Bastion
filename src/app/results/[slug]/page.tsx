import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { InteractiveResultsViewer } from '@/components/results/InteractiveResultsViewer';
import { getPublishedResultsBySlug } from '@/lib/results/store';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const stored = await getPublishedResultsBySlug(slug);
  if (!stored) return { title: 'Results' };
  return {
    title: stored.title,
    description: `${stored.document.issuer}. ${stored.document.periodLabel}`,
    robots: 'noindex, nofollow',
  };
}

export default async function PublishedResultsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ format?: string }>;
}) {
  const { slug } = await params;
  const sp = searchParams ? await searchParams : {};
  const stored = await getPublishedResultsBySlug(slug);
  if (!stored) notFound();

  if (sp.format === 'document' && stored.document.presentationHtml) {
    return (
      <iframe
        title={stored.title}
        src={`/results/${slug}/document`}
        className="block h-screen w-full border-0 bg-white"
      />
    );
  }

  return (
    <InteractiveResultsViewer
      document={stored.document}
      slug={slug}
      published={stored.status === 'published'}
    />
  );
}
