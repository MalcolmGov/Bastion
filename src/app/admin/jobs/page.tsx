'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function AdminJobsPage() {
  const { activeClient } = useStudioWorkspace();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (activeClient?.id) queryParams.set('clientId', activeClient.id);

        const res = await fetch(`/api/admin/content/jobs?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setRecords(json.records || []);
        }
      } catch (err) {
        console.error('Failed to load jobs:', err);
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
    ? 'Global Careers & Mining Vacancies'
    : `${clientName} Careers & Open Opportunities`;

  const description = isGoldFields
    ? 'Manage open roles across underground mining, metallurgy, geotechnical engineering, community liaison, and corporate leadership.'
    : `Career opportunities, job postings, candidate requirements, and departmental hiring for ${clientName}.`;

  return (
    <DataTable
      title={title}
      collection="jobs"
      description={description}
      records={records}
      createUrl="/admin/jobs/new"
    />
  );
}
