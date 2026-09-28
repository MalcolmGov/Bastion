import React from 'react';
import type { Metadata } from 'next';
import { getPublishedJobs } from '@/lib/server/content';
import CareersClient from './CareersClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Careers & Workplace Culture — Gold Fields',
  description:
    'Join a global community of innovators, engineers, and geologists working across mechanized underground operations, renewable microgrids, and advanced mineral processing.',
};

export default async function CareersPage() {
  let isDraft = false;
  try {
    const { draftMode } = await import('next/headers');
    const dm = await draftMode();
    isDraft = dm.isEnabled;
  } catch (e) {}

  const jobs = await getPublishedJobs(isDraft);

  return <CareersClient initialJobs={jobs} />;
}
