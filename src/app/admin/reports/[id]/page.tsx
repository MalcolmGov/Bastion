'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RecordEditor } from '@/components/admin/RecordEditor';

export default function ReportEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <RecordEditor
      collection="reports"
      id={id}
      collectionTitle="Corporate Financial Report / Regulatory Booklet"
    />
  );
}
