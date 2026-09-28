'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';

export default function AdminSuppliersPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/content/suppliers');
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
      title="Regional Supplier Portals & Guidelines"
      collection="suppliers"
      description="Procurement standards, host-community preference criteria, compliance checklists (MHSA, B-BBEE, anti-bribery), and Coupa portal guidance."
      records={records}
      createUrl="/admin/suppliers/new"
    />
  );
}
