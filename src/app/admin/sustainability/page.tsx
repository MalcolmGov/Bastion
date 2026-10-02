'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function AdminSustainabilityPage() {
  const { activeClient } = useStudioWorkspace();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (activeClient?.id) queryParams.set('clientId', activeClient.id);

        const res = await fetch(`/api/admin/content/sustainability?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setRecords(json.records || []);
        }
      } catch (err) {
        console.error('Failed to load sustainability targets:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeClient?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isGoldFields = activeClient?.id === 'client_goldfields';
  const clientName = activeClient?.name || 'Corporate';

  const title = isGoldFields
    ? 'Sustainability & 2030 ESG Targets'
    : `${clientName} ESG & Sustainability Metrics`;

  const description = isGoldFields
    ? 'Science-based targets, Scope 1 & 2 carbon abatement metrics, water recycling performance, safety statistics, and female workforce participation.'
    : `ESG targets, decarbonization roadmaps, community impact initiatives, and governance compliance for ${clientName}.`;

  return (
    <DataTable
      title={title}
      collection="sustainability"
      description={description}
      records={records}
      createUrl="/admin/sustainability/new"
    />
  );
}
