import React from 'react';
import type { Metadata } from 'next';
import { getPublishedReports } from '@/lib/server/content';
import ReportsClient from './ReportsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Reports & Regulatory Disclosures — Gold Fields',
  description:
    'Access audited annual financial statements, quarterly operational booklets, ESG sustainability disclosures, and stock exchange releases.',
};

export default async function ReportsPage() {
  let isDraft = false;
  try {
    const { draftMode } = await import('next/headers');
    const dm = await draftMode();
    isDraft = dm.isEnabled;
  } catch (e) {}

  const reports = await getPublishedReports(isDraft);

  return <ReportsClient initialReports={reports} />;
}
