'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RecordEditor } from '@/components/admin/RecordEditor';

export default function SupplierEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <RecordEditor
      collection="suppliers"
      id={id}
      collectionTitle="Regional Supplier Guidance & Procurement Policy"
    />
  );
}
