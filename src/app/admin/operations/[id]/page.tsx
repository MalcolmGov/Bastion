'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RecordEditor } from '@/components/admin/RecordEditor';

export default function OperationEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <RecordEditor
      collection="operations"
      id={id}
      collectionTitle="Mining Asset / Operational Profile"
    />
  );
}
