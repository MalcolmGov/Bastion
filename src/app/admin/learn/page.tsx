'use client';

import React from 'react';
import { ClientLearningHub } from '@/components/admin/ClientLearningHub';

export default function PlatformLearningHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 animate-in fade-in duration-200">
      <ClientLearningHub isEmbedded={false} />
    </div>
  );
}
