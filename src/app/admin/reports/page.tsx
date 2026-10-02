'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function AdminReportsPage() {
  const { activeClient } = useStudioWorkspace();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const query = activeClient?.id ? `?clientId=${encodeURIComponent(activeClient.id)}` : '';
        const res = await fetch(`/api/admin/content/reports${query}`);
        if (res.ok) {
          const json = await res.json();
          setRecords(json.records || []);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
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

  return (
    <DataTable
      title="Corporate Reports & Financial Results"
      collection="reports"
      description="Quarterly booklets, audited annual financial statements, climate reports, and mineral resource disclosures subject to strict compliance review and two-person sign-off."
      records={records}
      createUrl="/admin/reports/new"
    />
  );
}
