'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';

export default function AdminSustainabilityPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/content/sustainability');
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-6 h-6 border-2 border-[#C99700] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <DataTable
      title="Sustainability & 2030 ESG Targets"
      collection="sustainability"
      description="Science-based targets, Scope 1 & 2 carbon abatement metrics, water recycling performance, safety statistics, and female workforce participation."
      records={records}
      createUrl="/admin/sustainability/new"
    />
  );
}
