'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface MegaMenuProps {
  activeMenu: string | null;
  onClose: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({ activeMenu, onClose }) => {
  if (!activeMenu) return null;

  return (
    <div
      className="absolute top-full left-0 w-full bg-white border-b border-mist shadow-elevated z-50 transition-all duration-200"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeMenu === 'about' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
                  Purpose & Strategy
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/about"
                      onClick={onClose}
                      className="group flex flex-col hover:text-navy transition-colors"
                    >
                      <span className="font-semibold text-ink group-hover:text-gold-dark transition-colors">
                        This is Gold Fields
                      </span>
                      <span className="text-xs text-ink-muted">
                        Creating enduring value beyond mining.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about#values"
                      onClick={onClose}
                      className="group flex flex-col hover:text-navy transition-colors"
                    >
                      <span className="font-semibold text-ink group-hover:text-gold-dark transition-colors">
                        Core Values
                      </span>
                      <span className="text-xs text-ink-muted">
                        Safety, Respect, Collaboration, Responsibility, Integrity.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about#strategy"
                      onClick={onClose}
                      className="group flex flex-col hover:text-navy transition-colors"
                    >
                      <span className="font-semibold text-ink group-hover:text-gold-dark transition-colors">
                        Our Strategy
                      </span>
                      <span className="text-xs text-ink-muted">
                        Three pillars of sustainable growth and capital discipline.
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
                  Leadership & Governance
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/about#leadership"
                      onClick={onClose}
                      className="group flex flex-col hover:text-navy transition-colors"
                    >
                      <span className="font-semibold text-ink group-hover:text-gold-dark transition-colors">
                        Board & Executive Committee
                      </span>
                      <span className="text-xs text-ink-muted">
                        Group executive leadership profiles.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about#governance"
                      onClick={onClose}
                      className="group flex flex-col hover:text-navy transition-colors"
                    >
                      <span className="font-semibold text-ink group-hover:text-gold-dark transition-colors">
                        Corporate Governance & Policies
                      </span>
                      <span className="text-xs text-ink-muted">
                        Code of conduct, ethical charter, and compliance standards.
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-span-4 bg-editorial p-6 rounded-lg border border-mist flex flex-col justify-between">
              <div>
                <div className="relative h-36 w-full rounded overflow-hidden mb-4">
                  <Image
                    src="/assets/nav1.jpg"
                    alt="About Gold Fields"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-bold text-navy text-sm mb-1">
                  135+ Years of Mining Heritage
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Headquartered in Johannesburg, South Africa, operating a globally diversified portfolio across 6 countries.
                </p>
              </div>
              <Link
                href="/about"
                onClick={onClose}
                className="inline-flex items-center text-xs font-bold text-navy hover:text-gold-dark transition-colors mt-4"
              >
                Learn more about our heritage <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        )}

        {activeMenu === 'operations' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 grid grid-cols-3 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
                  South Africa & West Africa
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/operations/south-deep"
                      onClick={onClose}
                      className="group block hover:text-navy"
                    >
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        South Deep
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Mechanised underground (Gauteng, SA)
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/operations/tarkwa"
                      onClick={onClose}
                      className="group block hover:text-navy"
                    >
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Tarkwa
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Open pit gold complex (Ghana)
                      </span>
                    </Link>
                  </li>
                  <li className="pt-1">
                    <span className="text-xs text-slate italic">
                      Damang: Transferred to Gov of Ghana (18 Apr 2026)
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
                  Australia
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/operations#agnew" onClick={onClose} className="text-sm font-medium text-ink hover:text-gold-dark block">
                      Agnew (Underground / Wind Microgrid)
                    </Link>
                  </li>
                  <li>
                    <Link href="/operations#granny-smith" onClick={onClose} className="text-sm font-medium text-ink hover:text-gold-dark block">
                      Granny Smith (Underground)
                    </Link>
                  </li>
                  <li>
                    <Link href="/operations#st-ives" onClick={onClose} className="text-sm font-medium text-ink hover:text-gold-dark block">
                      St Ives (Underground & Open Pit)
                    </Link>
                  </li>
                  <li>
                    <Link href="/operations#gruyere" onClick={onClose} className="text-sm font-medium text-ink hover:text-gold-dark block">
                      Gruyere (50/50 Joint Venture)
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
                  Americas & Canada
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/operations/salares-norte" onClick={onClose} className="text-sm font-medium text-ink hover:text-gold-dark block">
                      Salares Norte (Open Pit, Chile)
                    </Link>
                  </li>
                  <li>
                    <Link href="/operations#cerro-corona" onClick={onClose} className="text-sm font-medium text-ink hover:text-gold-dark block">
                      Cerro Corona (Copper-Gold, Peru)
                    </Link>
                  </li>
                  <li>
                    <Link href="/operations#windfall" onClick={onClose} className="text-sm font-medium text-ink hover:text-gold-dark block">
                      Windfall Project (JV, Canada)
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-span-4 bg-editorial p-6 rounded-lg border border-mist flex flex-col justify-between">
              <div>
                <div className="relative h-36 w-full rounded overflow-hidden mb-4">
                  <Image
                    src="/assets/nav2.jpg"
                    alt="Global Operations"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-bold text-navy text-sm mb-1">
                  Global Portfolio Explorer
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Interactive SVG map with region filters, verified production metrics, and asset status indicators.
                </p>
              </div>
              <Link
                href="/operations"
                onClick={onClose}
                className="inline-flex items-center text-xs font-bold text-navy hover:text-gold-dark transition-colors mt-4"
              >
                Open interactive map & portfolio <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        )}

        {activeMenu === 'sustainability' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
                  ESG Commitments & Action
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/sustainability#decarbonization" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Energy & Decarbonization
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Targeting 30% net carbon reduction by 2030 (Scope 1 & 2).
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/sustainability#water" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Water Stewardship
                      </span>
                      <span className="text-xs text-ink-muted block">
                        78% water recycling achieved across group operations.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/sustainability#tailings" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Tailings Management (GISTM)
                      </span>
                      <span className="text-xs text-ink-muted block">
                        100% audited conformance on extreme/very high facilities.
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
                  Communities & People
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/sustainability#safety" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Safety, Health & Wellness
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Courageous safety leadership; zero fatalities in H1 2026.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/sustainability#community" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Shared Community Value
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Over $914M shared value distributed to host communities.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/sustainability#targets" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        2030 ESG Target Tracker
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Live comparison of verified baselines versus latest actuals.
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-span-4 bg-editorial p-6 rounded-lg border border-mist flex flex-col justify-between">
              <div>
                <div className="relative h-36 w-full rounded overflow-hidden mb-4">
                  <Image
                    src="/assets/nav-sustainability.jpg"
                    alt="Sustainability"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-bold text-navy text-sm mb-1">
                  Responsible Stewardship
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Grounded in rigorous science-based targets, environmental transparency, and human rights.
                </p>
              </div>
              <Link
                href="/sustainability"
                onClick={onClose}
                className="inline-flex items-center text-xs font-bold text-navy hover:text-gold-dark transition-colors mt-4"
              >
                View full sustainability reporting <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        )}

        {activeMenu === 'investors' && (
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-8 grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
                  Results & Reporting Suite
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/investors" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Latest Results Center (H1 2026)
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Published 25 August 2026: Booklet, Presentation & SENS.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Annual Report Suite & Archives
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Integrated Annual Reports, Form 20-F, and Mineral Reserves.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/reports?pack=true" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        My Report Pack Shortlist
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Queue documents and download a local synthesized index.
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-muted mb-4">
                  Shareholder Information
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link href="/investors#dividends" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Dividends & Capital Allocation
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Consistent payouts aligned to normalized cash flow.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/investors#calendar" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Financial Calendar & Webcasts
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Quarterly updates, AGM, and analyst conference registrations.
                      </span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/media" onClick={onClose} className="group block hover:text-navy">
                      <span className="font-semibold text-ink group-hover:text-gold-dark block text-sm">
                        Media Releases & News
                      </span>
                      <span className="text-xs text-ink-muted block">
                        Official announcements and executive commentary.
                      </span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="col-span-4 bg-editorial p-6 rounded-lg border border-mist flex flex-col justify-between">
              <div>
                <div className="relative h-36 w-full rounded overflow-hidden mb-4">
                  <Image
                    src="/assets/nav-investors.jpg"
                    alt="Investor Relations"
                    fill
                    className="object-cover"
                  />
                </div>
                <h4 className="font-bold text-navy text-sm mb-1">
                  H1 2026 Financial Results
                </h4>
                <p className="text-xs text-ink-muted leading-relaxed">
                  Attributable production 1.06Moz, disciplined capital returns, and long-term mine life extension.
                </p>
              </div>
              <Link
                href="/investors"
                onClick={onClose}
                className="inline-flex items-center text-xs font-bold text-navy hover:text-gold-dark transition-colors mt-4"
              >
                Access Investor Portal <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
