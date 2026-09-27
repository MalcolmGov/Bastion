import { AssistantMessage } from '@/lib/types';

export class DemoAssistantProvider {
  static getSuggestedPrompts(): string[] {
    return [
      "Find latest financial results",
      "Tell me about South Deep operation",
      "Where can I find climate & decarbonization reporting?",
      "Explore engineering careers and vacancies",
      "What is the supplier onboarding process in South Africa?",
      "What is the stock price prediction for next quarter?"
    ];
  }

  static getInitialGreeting(): AssistantMessage {
    return {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Welcome to **Ask Gold Fields**. I can assist you with published corporate disclosures, operations overview, sustainability targets, careers discovery, and regional supplier requirements.\n\n*Note: This is a concept demonstration assistant responding deterministically from verified corporate sources.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  static processQuery(userInput: string, activeContext?: string): AssistantMessage {
    const q = userInput.toLowerCase().trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const defaultBadge = activeContext ? `Context: ${activeContext}` : undefined;

    // Path 1: Latest Results query
    if (q.includes('result') || q.includes('h1') || q.includes('q2') || q.includes('financial') || q.includes('earnings')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Gold Fields published its **H1 2026 Financial and Operational Results** on **25 August 2026** (for the six months ended 30 June 2026).\n\nKey highlights include attributable gold-equivalent production of **1.06Moz**, stable delivery at South Deep (**151,000 oz**), ongoing commissioning at Salares Norte, and the transfer of Damang to the Government of Ghana on 18 April 2026.`,
        contextBadge: "Using: H1 2026 Results Suite",
        timestamp: timeStr,
        sources: [
          {
            title: "H1 2026 Results Booklet",
            url: "https://www.goldfields.com/reports/q2-2026/pdf/booklet.pdf",
            date: "25 August 2026",
            section: "Executive Financial Summary"
          },
          {
            title: "H1 2026 Results Presentation",
            url: "https://www.goldfields.com/reports/q2-2026/pdf/presentation.pdf",
            date: "25 August 2026",
            section: "Operational Review"
          }
        ],
        actionCard: {
          type: "report",
          title: "H1 2026 Results Booklet (PDF)",
          description: "Full six-month financial statements, cash flow, unit costs, and regional production tables.",
          linkText: "View Full Report in Investor Centre",
          linkUrl: "/investors"
        }
      };
    }

    // Path 2: South Deep inquiry
    if (q.includes('south deep') || q.includes('south africa') || q.includes('westonaria') || q.includes('khanyisa')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `**South Deep** is Gold Fields' deep-level bulk mechanized underground gold mine located in Gauteng, South Africa (~45km southwest of Johannesburg).\n\n• **H1 2026 Production:** 151,000 ounces attributable gold.\n• **Workforce Stability:** A landmark 5-year wage agreement was concluded with organised labour in July 2026 (effective through 2031).\n• **Renewables:** The onsite 50MW Khanyisa solar plant abates over 110,000 tonnes of CO2e annually.\n• **Certification:** Awarded ISO 55001 certification in June 2026 for asset management excellence.`,
        contextBadge: "Using: South Deep Operational Review",
        timestamp: timeStr,
        sources: [
          {
            title: "H1 2026 Operations Review: South Africa",
            url: "https://www.goldfields.com/reports/q2-2026/review-of-operations.php",
            date: "25 August 2026",
            section: "South Deep Operational Performance"
          },
          {
            title: "Media Release: South Deep 5-Year Wage Agreement",
            url: "https://www.goldfields.com/media-releases.php",
            date: "28 July 2026",
            section: "Organised Labour Concurrence"
          }
        ],
        actionCard: {
          type: "operation",
          title: "South Deep Asset Profile",
          description: "Explore geological reserves, mechanized mining methods, Khanyisa solar facility, and community trusts.",
          linkText: "Open South Deep Profile",
          linkUrl: "/operations/south-deep"
        }
      };
    }

    // Path 3: Climate & Sustainability
    if (q.includes('climate') || q.includes('sustainability') || q.includes('esg') || q.includes('carbon') || q.includes('emission') || q.includes('water') || q.includes('tailings') || q.includes('gistm')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Gold Fields targets a **30% net reduction in Scope 1 & 2 carbon emissions by 2030** (vs 2016 baseline) and Net Zero by 2050. As of H1 2026, emissions stand at **1.28 Mt CO2e** (representing a 26.4% net reduction vs baseline).\n\n• **Water Stewardship:** 78% recycled water achieved in H1 2026 (targeting 80%+ by 2030).\n• **Tailings (GISTM):** 100% of extreme and very high consequence TSF facilities conform with the Global Industry Standard on Tailings Management.\n• **Renewables:** Led by the Agnew wind/solar hybrid microgrid (>70% renewable penetration) and South Deep's 50MW Khanyisa solar plant.`,
        contextBadge: "Using: 2030 ESG Target Disclosures",
        timestamp: timeStr,
        sources: [
          {
            title: "Climate Change and Environment Report",
            url: "https://www.goldfields.com/energy-and-climate-change.php",
            section: "Decarbonisation Roadmap"
          },
          {
            title: "Global Industry Standard Tailings Conformance",
            url: "https://www.goldfields.com/our-tsfs.php",
            section: "TSF Assurance"
          }
        ],
        actionCard: {
          type: "report",
          title: "Sustainability Dashboard & Targets",
          description: "Inspect verified baselines, latest actuals, and TSF safety protocols.",
          linkText: "Go to Sustainability Hub",
          linkUrl: "/sustainability"
        }
      };
    }

    // Path 4: Careers & Engineering
    if (q.includes('career') || q.includes('job') || q.includes('engineer') || q.includes('role') || q.includes('hire') || q.includes('work')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Gold Fields offers global opportunities across mechanized mining, metallurgy, renewable energy integration, exploration geology, and environmental engineering across South Africa, Australia, Ghana, Chile, Peru, and Canada.\n\n*Prototype Demonstration:* Sample roles are indexed below for exploration. For verified live vacancies and applications, please visit the official recruitment portal.`,
        contextBadge: "Using: Global Careers Directory",
        timestamp: timeStr,
        sources: [
          {
            title: "Official Gold Fields Careers Portal",
            url: "https://careers.goldfields.com/utm_source=corpsite",
            section: "Global Job Search"
          }
        ],
        actionCard: {
          type: "jobs",
          title: "Explore Open Technical Disciplines",
          description: "Filter roles across Mining Engineering, Microgrid Electrical, and Metallurgy.",
          linkText: "Browse Careers & Discovery",
          linkUrl: "/careers"
        }
      };
    }

    // Path 5: Supplier Guidance & Checklist
    if (q.includes('supplier') || q.includes('procurement') || q.includes('vendor') || q.includes('tender') || q.includes('contractor') || q.includes('register')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Gold Fields procures goods and services through transparent regional portals. For **South Africa** (South Deep & Sandton corporate office), prospective suppliers must prepare:\n\n1. Valid CIPC Company Registration\n2. Valid SARS Tax Clearance PIN\n3. B-BBEE Verification Certificate or Sworn Affidavit\n4. Valid COIDA Letter of Good Standing\n5. Proof of Host Community Residence (if claiming West Rand local status)\n\n*Important Notice:* Registration on the supplier portal does not guarantee contract awards or tenders; it qualifies suppliers to participate in competitive bidding.`,
        contextBadge: "Using: South Africa Procurement Guidelines",
        timestamp: timeStr,
        sources: [
          {
            title: "South Africa Supplier Guidelines",
            url: "https://www.goldfields.com/south-africa.php",
            section: "Pre-Qualification Criteria"
          },
          {
            title: "Supplier Code of Business Conduct",
            url: "https://www.goldfields.com/code-of-conduct/index.php",
            section: "Ethics & Compliance"
          }
        ],
        actionCard: {
          type: "checklist",
          title: "Interactive Regional Supplier Checklist",
          description: "Select South Africa, Ghana, Australia, or Americas to generate a localized compliance roadmap.",
          linkText: "Open Supplier Guide",
          linkUrl: "/suppliers"
        }
      };
    }

    // Path 6: Leadership & Governance (Board & ExCo)
    if (q.includes('lead') || q.includes('ceo') || q.includes('fraser') || q.includes('board') || q.includes('exco') || q.includes('mackenzie') || q.includes('executive') || q.includes('chair')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Gold Fields is steered by **Mike Fraser** (Chief Executive Officer, appointed 1 Jan 2024) and an independent Board chaired by **John MacKenzie** (Non-Executive Chairperson).\n\n• **Executive Committee:** Includes Mike Fraser (CEO), Alex Dall (CFO), Francois Swanepoel (COO), Jason Sander (Acting CTO), Kelly Carter (Legal & Governance), Chris Gratias (Strategy & Corporate Development), Jongisa Magagula (External Affairs), Mariette Steyn (People & Sustainability), and Benford Mokoatle (EVP South Africa).\n• **Governance Framework:** Compliant with South Africa's King IV code and US SOX requirements, with 5 standing Board committees: Audit, Remuneration, SHSD, Nomination & Governance, and Strategy & Investment.`,
        contextBadge: "Using: Leadership & Governance Suite",
        timestamp: timeStr,
        sources: [
          {
            title: "Board & Executive Committee Disclosures",
            url: "https://www.goldfields.com/board-of-directors.php",
            section: "Executive Committee & Non-Executive Directors"
          },
          {
            title: "2025 Integrated Annual Report",
            url: "https://www.goldfields.com/reports/annual-report-2025/index.php",
            section: "Corporate Governance Review"
          }
        ],
        actionCard: {
          type: "operation",
          title: "Gold Fields Leadership & Governance Hub",
          description: "Inspect detailed profiles of the Board of Directors, Executive Committee, and committee charters.",
          linkText: "Explore About & Governance",
          linkUrl: "/about#leadership"
        }
      };
    }

    // Path 7: Core Values & Purpose
    if (q.includes('value') || q.includes('purpose') || q.includes('enduring value') || q.includes('respect') || q.includes('collaboration') || q.includes('integrity') || q.includes('culture') || q.includes('moral')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Gold Fields' corporate purpose is **"Creating enduring value beyond mining."**\n\nOur operations and culture are anchored in **Five Core Values**:\n1. **Safety:** *"If we cannot mine safely, we will not mine."* (Primary moral imperative; zero fatalities in H1 2026).\n2. **Respect:** We treat each other with dignity and care, fostering psychological safety and targeted 30% female representation by 2030.\n3. **Collaboration:** We work together to achieve shared value with organized labour, joint ventures, and host communities.\n4. **Responsibility:** We act with care for our catchments, environment (100% GISTM tailings, dry stack at Salares Norte), and local spend ($914M in FY25).\n5. **Integrity:** We uphold the highest ethical standards with zero tolerance for corruption.`,
        contextBadge: "Using: Core Values Charter",
        timestamp: timeStr,
        sources: [
          {
            title: "Gold Fields Code of Conduct & Values",
            url: "https://www.goldfields.com/code-of-conduct/index.php",
            section: "Our Values in Action"
          }
        ],
        actionCard: {
          type: "report",
          title: "Our Purpose & Core Values",
          description: "Read how our Five Core Values and Six Capitals guide daily decisions across all 6 jurisdictions.",
          linkText: "View Values on About Page",
          linkUrl: "/about#values"
        }
      };
    }

    // Path 8: Strategic Pillars & Capital Allocation
    if (q.includes('strateg') || q.includes('pillar') || q.includes('portfolio') || q.includes('capital allocation') || q.includes('dividend')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Gold Fields' corporate strategy is built upon **Three Strategic Pillars**:\n\n1. **Quality Portfolio:** Low-cost, long-life Tier-1 and quality gold assets across stable jurisdictions. Growth driven by Salares Norte (Chile) and the Windfall 50/50 JV (Canada), supported by cash generation from Tarkwa, South Deep, and Western Australian operations.\n2. **Safety & Culture:** Courageous Safety Leadership, mechanized underground tele-remote mining, and a target of 30% women in mining by 2030.\n3. **Capital Allocation:** Disciplined 4-tier hierarchy: sustaining capital & tailings safety → investment-grade balance sheet (net debt/EBITDA < 1.0x) → shareholder dividends (30% to 45% of normalized earnings) → high-return growth (>15% IRR hurdle) and self-generation renewables.`,
        contextBadge: "Using: Strategic Architecture Framework",
        timestamp: timeStr,
        sources: [
          {
            title: "H1 2026 Results Presentation",
            url: "https://www.goldfields.com/reports/q2-2026/pdf/presentation.pdf",
            date: "25 August 2026",
            section: "Strategic Priorities & Capital Allocation"
          }
        ],
        actionCard: {
          type: "report",
          title: "Three Strategic Pillars & Capital Hierarchy",
          description: "Examine our Quality Portfolio, Safety & Culture, and Capital Allocation frameworks.",
          linkText: "Explore Strategy on About Page",
          linkUrl: "/about#strategy"
        }
      };
    }

    // Path 9: Heritage & 135+ Years / Global Footprint
    if (q.includes('heritage') || q.includes('135') || q.includes('1887') || q.includes('history') || q.includes('jurisdiction') || q.includes('countries') || q.includes('where does gold fields operate')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Gold Fields holds a **verified 135+ year heritage**, founded in **1887** in South Africa by Cecil Rhodes and Charles Rudd. Over more than a century, the group pioneered deep-level geophysics on the Witwatersrand Basin before expanding into a globally diversified, mechanized producer.\n\n• **Global Presence across 6 Countries:** South Africa (South Deep), Australia (Agnew, Granny Smith, Gruyere JV, St Ives), Ghana (Tarkwa), Chile (Salares Norte), Peru (Cerro Corona), and Canada (Windfall JV).\n• **Critical Asset Note:** Damang in Ghana was transferred to the Government of Ghana on 18 April 2026 and is excluded from current active assets.`,
        contextBadge: "Using: 135+ Year Heritage Registry",
        timestamp: timeStr,
        sources: [
          {
            title: "Gold Fields Corporate Heritage & History",
            url: "https://www.goldfields.com/our-history.php",
            section: "1887 to Present Day"
          }
        ],
        actionCard: {
          type: "operation",
          title: "Heritage Timeline & Global Footprint",
          description: "Explore our historical milestones and our operations across six mining jurisdictions.",
          linkText: "View 135+ Year Heritage",
          linkUrl: "/about#heritage"
        }
      };
    }

    // Path 6: Sensitive, speculative, whistleblowing, or unsupported questions
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: `I am the **Ask Gold Fields** concept prototype assistant. To preserve corporate integrity and regulatory compliance:\n\n• **Financial & Stock Forecasts:** I cannot provide stock price predictions, investment advice, or unreleased financial forecasts. Official market filings are available via the JSE and NYSE.\n• **Whistleblowing & Governance Concerns:** Whistleblowing, fraud, safety violations, or unethical conduct must be submitted directly through the independent, confidential **Speak Up** reporting channel.\n• **General Queries:** For inquiries outside public reports, please contact Investor Relations or regional corporate communications.`,
      contextBadge: defaultBadge || "Demo Boundary Disclosure",
      timestamp: timeStr,
      isUnsupportedBoundary: true,
      sources: [
        {
          title: "EthicsPoint Independent Speak Up Service",
          url: "https://secure.ethicspoint.eu/domain/media/en/gui/114521/index.html",
          section: "Confidential Reporting"
        },
        {
          title: "Investor Relations Contacts",
          url: "https://www.goldfields.com/investor-relations-contacts.php",
          section: "Direct Shareholder Enquiries"
        }
      ],
      actionCard: {
        type: "contact",
        title: "Official Communication & Governance Channels",
        description: "Access verified media, shareholder contacts, and confidential whistleblowing channels.",
        linkText: "Visit Contact & Speak Up",
        linkUrl: "/contact"
      }
    };
  }
}
