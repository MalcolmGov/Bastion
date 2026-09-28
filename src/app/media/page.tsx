import React from 'react';
import type { Metadata } from 'next';
import { getPublishedNews } from '@/lib/server/content';
import MediaClient from './MediaClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Media Releases & Announcements — Gold Fields',
  description:
    'Verified operational announcements, financial results, labor agreements, and renewable energy milestones across Gold Fields global assets.',
};

export default async function MediaListPage() {
  let isDraft = false;
  try {
    const { draftMode } = await import('next/headers');
    const dm = await draftMode();
    isDraft = dm.isEnabled;
  } catch (e) {}

  const articles = await getPublishedNews(isDraft);

  return <MediaClient initialArticles={articles} />;
}
