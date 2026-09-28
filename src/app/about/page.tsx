import React from 'react';
import type { Metadata } from 'next';
import { getPublishedPage } from '@/lib/server/content';
import { AboutHero } from '@/components/about/AboutHero';
import { PurposeNarrative } from '@/components/about/PurposeNarrative';
import { CoreValuesSection } from '@/components/about/CoreValuesSection';
import { StrategicPillarsSection } from '@/components/about/StrategicPillarsSection';
import { LeadershipGovernanceSection } from '@/components/about/LeadershipGovernanceSection';
import { HeritageAndPresenceSection } from '@/components/about/HeritageAndPresenceSection';
import { AboutCTA } from '@/components/about/AboutCTA';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Gold Fields — 135+ Years of Mining Heritage & Leadership',
  description:
    'Creating enduring value beyond mining. Explore Gold Fields\' 135+ year heritage, core values, 3 strategic pillars, Board of Directors, Executive Committee, and presence across 6 countries.',
  keywords: [
    'About Gold Fields',
    'Creating Enduring Value Beyond Mining',
    'Gold Fields Core Values',
    'Safety & Culture',
    'Quality Portfolio',
    'Capital Allocation',
    'Mike Fraser CEO',
    'Gold Fields Leadership',
    'Gold Fields Heritage 1887',
  ],
};

export default async function AboutPage() {
  let isDraft = false;
  try {
    const { draftMode } = await import('next/headers');
    const dm = await draftMode();
    isDraft = dm.isEnabled;
  } catch (e) {}

  const pageData = await getPublishedPage('about', isDraft);

  return (
    <div className="space-y-0">
      {/* 1. Cinematic Hero with Purpose Anchor & Fast Facts Strip */}
      <AboutHero
        title={pageData?.hero?.title}
        subtitle={pageData?.hero?.subtitle}
        badge={pageData?.hero?.badge}
      />

      {/* 2. Purpose Narrative: "Creating enduring value beyond mining" & Six Capitals */}
      <PurposeNarrative />

      {/* 3. Five Core Values: Safety, Respect, Collaboration, Responsibility, Integrity */}
      <CoreValuesSection />

      {/* 4. Three Strategic Pillars: Quality Portfolio, Safety & Culture, Capital Allocation */}
      <StrategicPillarsSection />

      {/* 5. Leadership & Governance: Board of Directors & Executive Committee Structure */}
      <LeadershipGovernanceSection />

      {/* 6. Verified 135+ Year Heritage Timeline & Presence Across 6 Countries */}
      <HeritageAndPresenceSection />

      {/* 7. Contextual AI Trigger & Official Corporate Governance Disclosures */}
      <AboutCTA />
    </div>
  );
}
