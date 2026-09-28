import React from 'react';
import type { Metadata } from 'next';
import { getPublishedSuppliers } from '@/lib/server/content';
import SuppliersClient from './SuppliersClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Suppliers & Procurement Guidelines — Gold Fields',
  description:
    'Localized prequalification checklists, compliance mandates, tender portal access, and host community procurement guidelines across all Gold Fields jurisdictions.',
};

export default async function SuppliersPage() {
  let isDraft = false;
  try {
    const { draftMode } = await import('next/headers');
    const dm = await draftMode();
    isDraft = dm.isEnabled;
  } catch (e) {}

  const guidance = await getPublishedSuppliers(isDraft);

  return <SuppliersClient initialGuidance={guidance} />;
}
