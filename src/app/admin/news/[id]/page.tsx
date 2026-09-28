'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { RecordEditor } from '@/components/admin/RecordEditor';

export default function NewsEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <RecordEditor
      collection="news"
      id={id}
      collectionTitle="News Release / Stock Exchange Announcement"
    />
  );
}
