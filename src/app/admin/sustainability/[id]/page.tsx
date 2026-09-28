'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RecordEditor } from '@/components/admin/RecordEditor';

export default function SustainabilityEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <RecordEditor
      collection="sustainability"
      id={id}
      collectionTitle="Sustainability Target / 2030 ESG Pillar"
    />
  );
}
