/**
 * Move Studio — Reusable Component Registry
 * Defines stable component contracts, schemas, variants, and editable fields.
 */

export interface FieldDefinition {
  type: 'text' | 'textarea' | 'image' | 'link' | 'list' | 'select' | 'boolean' | 'number';
  label: string;
  description?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  itemSchema?: Record<string, FieldDefinition>;
  defaultValue?: any;
}

export interface RegisteredComponent {
  id: string;
  name: string;
  category: 'navigation' | 'hero' | 'content' | 'features' | 'social_proof' | 'conversion' | 'directory';
  description: string;
  schemaVersion: string;
  variants: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  fields: Record<string, FieldDefinition>;
  defaultProps: Record<string, any>;
}

export const COMPONENT_REGISTRY: Record<string, RegisteredComponent> = {
  header: {
    id: 'header',
    name: 'Header & Navigation',
    category: 'navigation',
    description: 'Site top bar with brand logo, primary navigation links, utility pills, and key conversion action.',
    schemaVersion: '1.0.0',
    variants: [
      { id: 'standard_glass', name: 'Standard Sticky Glass', description: 'Translucent background with blur and subtle bottom border' },
      { id: 'minimal_inline', name: 'Minimal Inline', description: 'Quiet hairline separation with condensed nav links' },
      { id: 'bold_solid', name: 'Bold Solid Dark', description: 'Solid midnight background with high-contrast active highlights' }
    ],
    fields: {
      brandName: { type: 'text', label: 'Brand Name', required: true, defaultValue: 'Move Studio' },
      logoUrl: { type: 'image', label: 'Logo Image URL' },
      links: {
        type: 'list',
        label: 'Navigation Links',
        itemSchema: {
          label: { type: 'text', label: 'Link Label', required: true },
          href: { type: 'text', label: 'Destination URL', required: true }
        }
      },
      ctaText: { type: 'text', label: 'CTA Button Text', defaultValue: 'Get in Touch' },
      ctaHref: { type: 'text', label: 'CTA Button Link', defaultValue: '/contact' }
    },
    defaultProps: {
      brandName: 'Brand Flagship',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Case Studies', href: '/case-studies' },
        { label: 'Contact', href: '/contact' }
      ],
      ctaText: 'Discuss Mandate',
      ctaHref: '/contact'
    }
  },

  hero: {
    id: 'hero',
    name: 'Hero Showcase',
    category: 'hero',
    description: 'High-impact entrance section with executive headline, strategic narrative, dual CTAs, and optional stat badges.',
    schemaVersion: '1.0.0',
    variants: [
      { id: 'contemporary_bold', name: 'Contemporary Bold Split', description: 'Bold typography with 4-pillar metric counters' },
      { id: 'editorial_split', name: 'Editorial Image Split', description: 'Playfair headline with large portrait photograph on right' },
      { id: 'immersive_full', name: 'Immersive Full Bleed', description: 'Cinematic full-width background with atmospheric scrim' },
      { id: 'minimal_statement', name: 'Minimal Typographic Statement', description: 'Oversized display headline focused purely on narrative' }
    ],
    fields: {
      badge: { type: 'text', label: 'Eyebrow / Badge Text' },
      title: { type: 'text', label: 'Primary Headline', required: true },
      subtitle: { type: 'textarea', label: 'Supporting Narrative' },
      primaryCta: {
        type: 'text',
        label: 'Primary CTA',
        itemSchema: {
          label: { type: 'text', label: 'Label' },
          href: { type: 'text', label: 'Link' }
        }
      },
      secondaryCta: {
        type: 'text',
        label: 'Secondary CTA',
        itemSchema: {
          label: { type: 'text', label: 'Label' },
          href: { type: 'text', label: 'Link' }
        }
      },
      bgImage: { type: 'image', label: 'Background / Showcase Image' }
    },
    defaultProps: {
      badge: 'Strategic Corporate Advisory',
      title: 'Precision advisory for defining corporate transactions.',
      subtitle: 'Advising market leaders and institutional capital on high-stakes M&A, private credit, and restructuring across global markets.',
      primaryCta: { label: 'Explore Advisory Practice', href: '/services' },
      secondaryCta: { label: 'Track Record & Case Studies', href: '/case-studies' }
    }
  },

  services_grid: {
    id: 'services_grid',
    name: 'Capabilities & Services',
    category: 'features',
    description: 'Modular grid or list presenting core capabilities, practice areas, or offerings with deliverables.',
    schemaVersion: '1.0.0',
    variants: [
      { id: 'cards_3col', name: '3-Column Structured Cards', description: 'Clean bordered cards with deliverables and metrics' },
      { id: 'list_rows', name: 'Horizontal Expandable Rows', description: 'Minimalist editorial rows with hover accents' },
      { id: 'featured_highlight', name: 'Featured Pillar with Side Grid', description: 'One large flagship service flanked by secondary practices' }
    ],
    fields: {
      eyebrow: { type: 'text', label: 'Section Eyebrow' },
      title: { type: 'text', label: 'Section Title', required: true },
      description: { type: 'textarea', label: 'Section Description' },
      services: {
        type: 'list',
        label: 'Services / Practice Areas',
        required: true,
        itemSchema: {
          title: { type: 'text', label: 'Service Name', required: true },
          description: { type: 'textarea', label: 'Service Description', required: true },
          metrics: { type: 'text', label: 'Impact / Deliverable Metric' },
          href: { type: 'text', label: 'Details Link' }
        }
      }
    },
    defaultProps: {
      eyebrow: 'Our Practice Areas',
      title: 'Structured capabilities for high-stakes corporate execution.',
      description: 'Senior partner-led execution across all strategic advisory and capital disciplines.',
      services: [
        {
          title: 'M&A & Strategic Divestitures',
          description: 'Comprehensive transaction advisory, cross-border deal execution, valuation modeling, and synergy governance.',
          metrics: '26 closed deals ($2.8B)',
          href: '/services'
        },
        {
          title: 'Growth Capital & Private Credit',
          description: 'Institutional debt origination, hybrid mezzanine structures, and bespoke equity syndication for scaling enterprises.',
          metrics: '14 facilities placed ($950M)',
          href: '/services'
        },
        {
          title: 'Balance Sheet Restructuring',
          description: 'Consensual debt reorganization, liquidity management, and operational turnaround advisory.',
          metrics: '8 successful mandates ($450M)',
          href: '/services'
        }
      ]
    }
  },

  case_studies: {
    id: 'case_studies',
    name: 'Case Studies & Track Record',
    category: 'social_proof',
    description: 'Verified transaction profiles, client impact narratives, and measurable outcome highlights.',
    schemaVersion: '1.0.0',
    variants: [
      { id: 'impact_cards', name: 'Dual Outcome Cards', description: 'Two prominent case cards with challenge, strategy, and metrics' },
      { id: 'editorial_feature', name: 'Full-Width Case Narrative', description: 'Deep-dive case study with pull quotes and data callouts' }
    ],
    fields: {
      eyebrow: { type: 'text', label: 'Section Eyebrow' },
      title: { type: 'text', label: 'Section Title', required: true },
      caseStudies: {
        type: 'list',
        label: 'Case Studies',
        itemSchema: {
          headline: { type: 'text', label: 'Transaction / Outcome Headline', required: true },
          client: { type: 'text', label: 'Client / Sector', required: true },
          outcome: { type: 'textarea', label: 'Measurable Outcome Narrative', required: true },
          tag: { type: 'text', label: 'Practice Tag' }
        }
      }
    },
    defaultProps: {
      eyebrow: 'Selected Track Record',
      title: 'Delivering decisive outcomes in demanding market conditions.',
      caseStudies: [
        {
          headline: '€420M Cross-Border Industrial Carve-Out',
          client: 'Pan-European Engineering Conglomerate',
          outcome: 'Structured complex carve-out of robotics division with sovereign wealth co-investment, executing within 4 months.',
          tag: 'M&A Advisory'
        },
        {
          headline: '$180M Growth Debt Facility for Cloud Infrastructure Provider',
          client: 'Tier-1 SaaS Enterprise',
          outcome: 'Arranged dual-tranche debt package reducing overall cost of capital by 240bps with zero equity dilution.',
          tag: 'Private Credit'
        }
      ]
    }
  },

  team: {
    id: 'team',
    name: 'Team & Leadership',
    category: 'content',
    description: 'Partner biographies, executive governance, and credential profiles with professional portraits.',
    schemaVersion: '1.0.0',
    variants: [
      { id: 'portrait_grid', name: '3-Column Portrait Cards', description: 'High-contrast monochrome or warm photography with bios' },
      { id: 'executive_rows', name: 'Compact Horizontal Rows', description: 'Board / committee style listing with credentials' }
    ],
    fields: {
      eyebrow: { type: 'text', label: 'Eyebrow' },
      title: { type: 'text', label: 'Title', required: true },
      members: {
        type: 'list',
        label: 'Team Members',
        itemSchema: {
          name: { type: 'text', label: 'Full Name', required: true },
          role: { type: 'text', label: 'Title / Practice Lead', required: true },
          bio: { type: 'textarea', label: 'Biography' },
          image: { type: 'image', label: 'Portrait Image' }
        }
      }
    },
    defaultProps: {
      eyebrow: 'Leadership Team',
      title: 'Partner-level execution. Zero junior delegation.',
      members: [
        {
          name: 'Alexandra Vance',
          role: 'Managing Partner — M&A Advisory',
          bio: '22 years investment banking experience across London and Zurich. Former Managing Director at Morgan Stanley.',
          image: '/assets/team-partner-1.jpg'
        },
        {
          name: 'Julian Thorne',
          role: 'Senior Partner — Capital Solutions',
          bio: 'Specialist in private credit, hybrid debt, and sovereign capital placement with $3B+ completed transactions.',
          image: '/assets/team-partner-2.jpg'
        }
      ]
    }
  },

  rich_text: {
    id: 'rich_text',
    name: 'Narrative & Editorial Statement',
    category: 'content',
    description: 'Typographic quote, mission statement, or long-form editorial narrative.',
    schemaVersion: '1.0.0',
    variants: [
      { id: 'editorial_quote', name: 'Prominent Executive Pull Quote', description: 'Large serif quote with author attribution' },
      { id: 'manifesto_split', name: 'Two-Column Manifesto', description: 'Oversized statement on left with explanatory body on right' }
    ],
    fields: {
      quote: { type: 'textarea', label: 'Quote / Statement Text', required: true },
      author: { type: 'text', label: 'Author Name' },
      role: { type: 'text', label: 'Author Title / Organization' }
    },
    defaultProps: {
      quote: '“We do not merely advise on transactions; we architect the corporate balance sheet to withstand economic cycles and compound enduring value.”',
      author: 'Alexandra Vance',
      role: 'Managing Partner'
    }
  },

  cta: {
    id: 'cta',
    name: 'Call to Action',
    category: 'conversion',
    description: 'High-conversion contact invitation banner, appointment scheduler, or direct telephone/email trigger.',
    schemaVersion: '1.0.0',
    variants: [
      { id: 'split_card', name: 'Card with Direct Contact Details', description: 'Action button alongside office numbers and email' },
      { id: 'banner', name: 'Full-Width Accent Banner', description: 'Centered high-impact headline and primary button' }
    ],
    fields: {
      eyebrow: { type: 'text', label: 'Eyebrow' },
      title: { type: 'text', label: 'Title', required: true },
      description: { type: 'textarea', label: 'Description' },
      ctaText: { type: 'text', label: 'Button Text', required: true },
      ctaHref: { type: 'text', label: 'Button Link', required: true }
    },
    defaultProps: {
      eyebrow: 'Confidential Inquiry',
      title: 'Initiate a preliminary discussion with our partners.',
      description: 'All introductory discussions are held under strict non-disclosure. We respond to all qualified corporate mandates within 24 hours.',
      ctaText: 'Schedule Confidential Discussion',
      ctaHref: '/contact'
    }
  },

  contact_form: {
    id: 'contact_form',
    name: 'Contact & Mandate Inquiry Form',
    category: 'conversion',
    description: 'Structured form for client inquiries, mandate submissions, or reservation requests with real-time validation.',
    schemaVersion: '1.0.0',
    variants: [
      { id: 'split_layout', name: 'Form with Office Directory Split', description: 'Interactive form on left with office addresses on right' },
      { id: 'centered_card', name: 'Centered Card Form', description: 'Focused single-column inquiry form' }
    ],
    fields: {
      title: { type: 'text', label: 'Form Title', required: true },
      description: { type: 'textarea', label: 'Form Subtitle' },
      submitButtonText: { type: 'text', label: 'Submit Button Text', defaultValue: 'Submit Mandate' }
    },
    defaultProps: {
      title: 'Confidential Mandate Submission',
      description: 'Please provide brief details regarding your transaction timeline and capital requirements.',
      submitButtonText: 'Submit Inquiry'
    }
  },

  footer: {
    id: 'footer',
    name: 'Footer & Legal',
    category: 'navigation',
    description: 'Comprehensive footer with office locations, regulatory disclosures, site links, and copyright notice.',
    schemaVersion: '1.0.0',
    variants: [
      { id: 'multi_column', name: '4-Column Corporate Footer', description: 'Multi-column links with office address and regulatory disclaimers' },
      { id: 'compact_studio', name: 'Compact Studio Footer', description: 'Clean single-row links with subtle copyright' }
    ],
    fields: {
      copyright: { type: 'text', label: 'Copyright Notice', required: true },
      officeAddress: { type: 'text', label: 'Office Address' },
      contactEmail: { type: 'text', label: 'Contact Email' },
      contactPhone: { type: 'text', label: 'Contact Phone' }
    },
    defaultProps: {
      copyright: '© 2026 Move Studio. All rights reserved.',
      officeAddress: '100 Bishopsgate, London EC2N 4AG',
      contactEmail: 'contact@movestudio.agency',
      contactPhone: '+44 20 7946 0912'
    }
  }
};
