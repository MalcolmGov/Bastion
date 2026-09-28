import React from 'react';
import type { Metadata } from 'next';
import { getPublishedOperations } from '@/lib/server/content';
import OperationsClient from './OperationsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Global Mining Operations & Mineral Assets — Gold Fields',
  description:
    'Explore Gold Fields 10 mining operations across South Africa, Australia, Ghana, Chile, Peru, and Canada with verified operational performance.',
};

export default async function OperationsPage() {
  let isDraft = false;
  try {
    const { draftMode } = await import('next/headers');
    const dm = await draftMode();
    isDraft = dm.isEnabled;
  } catch (e) {}

  const operations = await getPublishedOperations(isDraft);

  return <OperationsClient initialOperations={operations} />;
}
