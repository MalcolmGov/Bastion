'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RecordEditor } from '@/components/admin/RecordEditor';

export default function JobEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <RecordEditor
      collection="jobs"
      id={id}
      collectionTitle="Mining Vacancy / Career Opportunity"
    />
  );
}
