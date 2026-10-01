'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function AdminNewsPage() {
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

        const res = await fetch(`/api/admin/content/news?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setRecords(json.records || []);
        }
      } catch (err) {
        console.error('Failed to load news:', err);
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

  const isGoldFields = activeClient?.id === 'client_goldfields';
  const clientName = activeClient?.name || 'Corporate';

  const title = isGoldFields
    ? 'News & Regulatory Releases'
    : `${clientName} News & Press Releases`;

  const description = isGoldFields
    ? 'Stock exchange announcements (JSE SENS & NYSE), executive appointments, operational milestones, and community investments.'
    : `Company announcements, press releases, thought leadership, and operational updates for ${clientName}.`;

  return (
    <DataTable
      title={title}
      collection="news"
      description={description}
      records={records}
      createUrl="/admin/news/new"
    />
  );
}
