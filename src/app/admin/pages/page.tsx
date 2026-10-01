'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function AdminPagesPage() {
  const { activeClient, activeSite } = useStudioWorkspace();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (activeSite?.id) queryParams.set('siteId', activeSite.id);
        if (activeClient?.id) queryParams.set('clientId', activeClient.id);

        const res = await fetch(`/api/admin/content/pages?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setRecords(json.records || []);
        }
      } catch (err) {
        console.error('Failed to load pages:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeClient?.id, activeSite?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const clientName = activeClient?.name || 'Corporate';

  return (
    <DataTable
      title={`${clientName} Website Pages`}
      collection="pages"
      description={`Visual Page Builder workspace for core brand landing pages, structured layout blocks, hero messaging, and disclosures for ${clientName}.`}
      records={records}
      createUrl="/admin/pages/new"
    />
  );
}
