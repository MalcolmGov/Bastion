import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ siteSlug: string }>;
}

export default async function PreviewRedirectPage({ params }: PageProps) {
  const { siteSlug } = await params;
  redirect(`/sites/${siteSlug}?preview=true`);
}
