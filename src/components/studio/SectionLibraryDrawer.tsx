'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  HelpCircle,
  ListOrdered,
  Scale,
  MessageSquareQuote,
  MapPin,
  Sparkles,
  Layout,
  Briefcase,
  Users,
  Quote,
  Send,
  Navigation,
  FileText,
  X,
  Plus
} from 'lucide-react';

export interface LibrarySectionItem {
  id: string;
  name: string;
  category: 'Commerce' | 'Social Proof' | 'Content' | 'Conversion' | 'Layout';
  description: string;
  icon: React.ReactNode;
  badge?: string;
  color: string;
}

export const AVAILABLE_LIBRARY_SECTIONS: LibrarySectionItem[] = [
  // ── Commerce
  {
    id: 'pricing',
    name: 'Pricing Plans',
    category: 'Commerce',
    description: '3-tier subscription or service cards with monthly/annual switch and features checklist.',
    icon: <CreditCard className="w-5 h-5" />,
    badge: 'Popular',
    color: '#F59E0B'
  },
  // ── Social Proof
  {
    id: 'faq',
    name: 'FAQ Accordion',
    category: 'Social Proof',
    description: 'Interactive expandable question & answer accordion with contact desk fallback.',
    icon: <HelpCircle className="w-5 h-5" />,
    badge: 'High Conversion',
    color: '#6366F1'
  },
  {
    id: 'testimonials',
    name: 'Testimonials & Reviews',
    category: 'Social Proof',
    description: 'Executive testimonials with 5-star ratings, client credentials, and verified badges.',
    icon: <MessageSquareQuote className="w-5 h-5" />,
    color: '#10B981'
  },
  {
    id: 'comparison',
    name: 'Comparison Matrix',
    category: 'Social Proof',
    description: 'Feature matrix comparing plans side-by-side with checkmarks and popular highlight.',
    icon: <Scale className="w-5 h-5" />,
    color: '#0EA5E9'
  },
  {
    id: 'case_studies',
    name: 'Case Studies & Track Record',
    category: 'Social Proof',
    description: 'Verified transaction profiles, measurable ROI narratives, and client metrics.',
    icon: <FileText className="w-5 h-5" />,
    color: '#8B5CF6'
  },
  // ── Content
  {
    id: 'process',
    name: 'Process & How It Works',
    category: 'Content',
    description: 'Numbered sequential steps (01, 02, 03, 04) showing operational roadmap.',
    icon: <ListOrdered className="w-5 h-5" />,
    badge: 'Essential',
    color: '#38BDF8'
  },
  {
    id: 'services_grid',
    name: 'Capabilities & Services',
    category: 'Content',
    description: 'Modular grid showcasing offerings, deliverables, and practice area metrics.',
    icon: <Briefcase className="w-5 h-5" />,
    color: '#A855F7'
  },
  {
    id: 'team',
    name: 'Leadership & Team',
    category: 'Content',
    description: 'Partner biographies, executive governance, and credential profiles.',
    icon: <Users className="w-5 h-5" />,
    color: '#F43F5E'
  },
  {
    id: 'rich_text',
    name: 'Editorial Statement',
    category: 'Content',
    description: 'Large typographic quote, manifesto statement, or brand narrative.',
    icon: <Quote className="w-5 h-5" />,
    color: '#E2E8F0'
  },
  // ── Conversion
  {
    id: 'cta',
    name: 'Call to Action',
    category: 'Conversion',
    description: 'High-conversion contact invitation banner with office numbers and email.',
    icon: <Sparkles className="w-5 h-5" />,
    badge: 'Lead Magnet',
    color: '#22C55E'
  },
  {
    id: 'contact_form',
    name: 'Inquiry Form',
    category: 'Conversion',
    description: 'Structured form for client inquiries, mandate submissions, or RFP intake.',
    icon: <Send className="w-5 h-5" />,
    color: '#14B8A6'
  },
  // ── Directory & Layout
  {
    id: 'map_hours',
    name: 'Map & Business Hours',
    category: 'Layout',
    description: 'Headquarters location card with interactive map, operating hours, and directions.',
    icon: <MapPin className="w-5 h-5" />,
    color: '#22D3EE'
  },
  {
    id: 'header',
    name: 'Header & Navigation',
    category: 'Layout',
    description: 'Sticky top navigation bar with brand logo, primary links, and action button.',
    icon: <Navigation className="w-5 h-5" />,
    color: '#64748B'
  },
  {
    id: 'footer',
    name: 'Multi-Column Footer',
    category: 'Layout',
    description: 'Comprehensive footer with social media icons, office cards, and legal copyright.',
    icon: <Layout className="w-5 h-5" />,
    color: '#94A3B8'
  }
];

interface SectionLibraryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectComponent: (componentId: string) => void;
}

export const SectionLibraryDrawer: React.FC<SectionLibraryDrawerProps> = ({
  open,
  onClose,
  onSelectComponent
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!open) return null;

  const categories = ['All', 'Commerce', 'Social Proof', 'Content', 'Conversion', 'Layout'];

  const filteredSections = AVAILABLE_LIBRARY_SECTIONS.filter((sec) => {
    const matchesCategory = activeCategory === 'All' || sec.category === activeCategory;
    const matchesSearch =
      sec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#090D16] border-l border-slate-800 text-white flex flex-col z-10 shadow-2xl h-full">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-[#0B101C]">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <h2 className="text-sm font-bold tracking-tight text-white uppercase tracking-wider">
                Section Library
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Choose a block to insert into your page composition
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Pills */}
        <div className="p-4 border-b border-slate-800 space-y-3 shrink-0 bg-[#070A12]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blocks (pricing, faq, process...)..."
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
          />

          <div className="flex items-center space-x-1 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition shrink-0 ${
                  activeCategory === cat
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Section List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredSections.map((sec) => (
            <div
              key={sec.id}
              onClick={() => {
                onSelectComponent(sec.id);
                onClose();
              }}
              className="group p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-850 cursor-pointer transition-all flex items-start justify-between space-x-3"
            >
              <div className="flex items-start space-x-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border border-white/5"
                  style={{ backgroundColor: `${sec.color}15`, color: sec.color }}
                >
                  {sec.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                      {sec.name}
                    </span>
                    {sec.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        {sec.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5 line-clamp-2">
                    {sec.description}
                  </p>
                </div>
              </div>

              <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-sky-500 group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs font-mono">
              No matching sections found for "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
