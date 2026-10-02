'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { useStudioWorkspace } from '@/components/admin/StudioWorkspaceProvider';

export default function AdminSuppliersPage() {
  const { activeClient } = useStudioWorkspace();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (activeClient?.id) queryParams.set('clientId', activeClient.id);

        const res = await fetch(`/api/admin/content/suppliers?${queryParams.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setRecords(json.records || []);
        }
      } catch (err) {
        console.error('Failed to load suppliers:', err);
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

  const clientName = activeClient?.name || 'Corporate';

  return (
    <DataTable
      title={`${clientName} Supplier Portals & Guidelines`}
      collection="suppliers"
      description={`Procurement standards, host-community preference criteria, compliance checklists, and vendor onboarding guidance for ${clientName}.`}
      records={records}
      createUrl="/admin/suppliers/new"
    />
  );
}
