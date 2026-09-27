export interface OperationGeologyDetails {
  basin: string;
  depositType: string;
  stratigraphy: string;
  mineralization: string;
  structuralControls: string;
  explorationStatus: string;
}

export interface OperationWorkforceDetails {
  headcount: string;
  stability: string;
  nationalShare: string;
  safetyMilestone: string;
}

export interface OperationCommunityDetails {
  primaryInitiative: string;
  description: string;
  keyMetrics: string[];
}

export interface OperationRenewableDetails {
  system: string;
  capacity: string;
  impact: string;
  details: string;
}

export interface ExtendedOperationData {
  geology: OperationGeologyDetails;
  workforce: OperationWorkforceDetails;
  community: OperationCommunityDetails;
  renewables: OperationRenewableDetails;
  relatedReportIds: string[];
}

export const OPERATION_EXTENDED_DATA: Record<string, ExtendedOperationData> = {
  'south-deep': {
    geology: {
      basin: 'Witwatersrand Basin (Central Rand Group)',
      depositType: 'Paleoplacer Quartz-Pebble Conglomerate System',
      stratigraphy: 'Upper Elsburg conglomerates (EC and MB reef packages) unconformably overlain by the Ventersdorp Contact Reef (VCR).',
      mineralization: 'Native gold occurring within the pyritic matrix of quartz conglomerates at depths between 2,400m and 3,000m below surface.',
      structuralControls: 'West Rand and Wrench fault corridors; massive tabular ore bodies up to 30m in thickness extracted using mechanised long-hole bulk stoping.',
      explorationStatus: 'Advanced deep diamond drilling underway in the "South of Wrench" block validating life-of-mine reserve continuity well beyond 2060.'
    },
    workforce: {
      headcount: '~4,500 employees & direct contracting personnel',
      stability: '5-Year Wage Agreement secured July 2026 (2026 - 2031) with organized labour (NUM & UASA)',
      nationalShare: '>95% South African workforce with extensive local Westonaria recruitment',
      safetyMilestone: 'Zero fatalities achieved across H1 2026 reporting period with ongoing Courageous Leadership training'
    },
    community: {
      primaryInitiative: '9 Host Community Development Trusts',
      description: 'Funding independent community trusts to invest in youth employment, STEM education, community clinics, and infrastructure across Westonaria and the West Rand District.',
      keyMetrics: [
        '9 Host Community Trusts independently administered',
        'Over R120M directed into municipal socio-economic development projects',
        'Youth artisan skills development and bursary programmes'
      ]
    },
    renewables: {
      system: 'Khanyisa 50 MW Photovoltaic Solar Plant',
      capacity: '50 MWac / 60 MWp capacity with 116,000 solar panels',
      impact: '~110,000 tonnes of CO2e avoided annually (~24% of mine electricity demand)',
      details: 'Commissioned at a capital cost of R715M (~$40M), generating ~110 GWh of clean solar power per year with zero operational emissions.'
    },
    relatedReportIds: ['h1-2026-booklet', 'h1-2026-presentation', 'iar-2025', 'ccr-2024']
  },

  'tarkwa': {
    geology: {
      basin: 'Proterozoic Tarkwaian Paleoplacer System (Ashanti Belt)',
      depositType: 'Banket Series Quartz-Pebble Conglomerate Gold Deposit',
      stratigraphy: 'Oligomictic quartz-pebble conglomerates of the Banket Series situated within the Tarkwa syncline.',
      mineralization: 'Free-milling detrital gold concentrated within hematite-magnetite rich conglomerate beds across the Pepe, Teberebie, and Akontansi pits.',
      structuralControls: 'North-northeast trending thrust faulting and regional fold axes controlling repeat sub-crop packages.',
      explorationStatus: 'Near-pit resource extension drilling delivering reserve replenishment across Teberebie Cut 5 and Akontansi underground scoping.'
    },
    workforce: {
      headcount: '~3,800 employees and contractors',
      stability: 'Productive collective bargaining agreements with the Ghana Mineworkers Union',
      nationalShare: '>98% Ghanaian national workforce',
      safetyMilestone: 'Over 12 million Lost Time Injury-free hours accumulated across operations'
    },
    community: {
      primaryInitiative: 'Gold Fields Ghana Foundation',
      description: 'The premier corporate social foundation in West Africa, funding regional roads, the 33km Tarkwa-Damang highway, community health centers, and scholarships.',
      keyMetrics: [
        'Exceeded $100M in cumulative community development investments',
        '73% host community and in-country procurement share',
        'Modernized maternity wards and community potable water boreholes'
      ]
    },
    renewables: {
      system: 'Gas-Grid Hybrid & High-Efficiency Processing',
      capacity: '13.5 Mtpa CIL processing plant optimization',
      impact: 'Continuous reduction in energy intensity per tonne milled',
      details: 'Grid-tied power supplemented by high-efficiency gas generators with ongoing engineering studies for utility-scale solar PV integration.'
    },
    relatedReportIds: ['h1-2026-booklet', 'h1-2026-presentation', 'iar-2025']
  },

  'salares-norte': {
    geology: {
      basin: 'High Andes Maricunga Mineral Belt (Atacama Region)',
      depositType: 'High-Sulphidation Epithermal Gold-Silver Deposit',
      stratigraphy: 'Miocene-aged dacitic and andesitic volcanic dome complexes, hydrothermal breccia pipes, and phreatomagmatic diatremes.',
      mineralization: 'Native gold, electrum, and acanthite hosted within vuggy silica and advanced argillic alteration (Brecha Principal and Agua Amarga).',
      structuralControls: 'Northwest-striking regional faults intersecting ring-fracture systems associated with caldera volcanic centers at 3,900m to 4,700m elevation.',
      explorationStatus: 'District exploration progressing at surrounding targets including Pollux, Horizon, and exploratory satellite domes.'
    },
    workforce: {
      headcount: '~1,200 permanent personnel during commercial operations',
      stability: 'Stable labor agreements concluded with Chilean mining federations',
      nationalShare: '>95% Chilean recruitment with dedicated Atacama regional training',
      safetyMilestone: 'Advanced high-altitude extreme weather survival and fatigue management systems'
    },
    community: {
      primaryInitiative: 'Colla Indigenous Community Collaboration & Chinchilla Stewardship',
      description: 'Close environmental and socio-economic partnerships with indigenous Colla communities of Diego de Almagro and strict Chinchilla protection protocols.',
      keyMetrics: [
        'Comprehensive Short-Tailed Chinchilla habitat monitoring protocols under SMA oversight',
        'Indigenous local employment and local supplier incubation programmes',
        'Zero discharge into high-altitude Andean salt flat ecosystems'
      ]
    },
    renewables: {
      system: 'Dry-Stack Tailings & High-Efficiency Hybrid Power',
      capacity: '2.0 Mtpa Merrill-Crowe processing plant',
      impact: '>86% process water recovered and recycled in hyper-arid desert conditions',
      details: 'State-of-the-art vacuum belt filtered dry-stack tailings eliminating liquid tailings ponds, maximizing seismic resilience and conserving precious Andean water.'
    },
    relatedReportIds: ['h1-2026-booklet', 'h1-2026-presentation', 'iar-2025', 'ccr-2024']
  },

  'cerro-corona': {
    geology: {
      basin: 'Cajamarca Mineral District (Northern Peruvian Cordillera)',
      depositType: 'Diorite Porphyry Copper-Gold Deposit',
      stratigraphy: 'Cretaceous carbonate and limestone sequences (Chulec and Inca formations) intruded by a subvolcanic diorite stock.',
      mineralization: 'Stockwork quartz-pyrite-chalcopyrite veinlets with gold finely associated with chalcopyrite and bornite sulfides.',
      structuralControls: 'Regional Andean northeast fault system controlling diorite emplacement and hydrothermal fluid migration at ~3,800m altitude.',
      explorationStatus: 'Life-of-mine extension via geotechnical in-pit tailings deposition engineering, optimizing resource recovery to 2030+.'
    },
    workforce: {
      headcount: '~2,100 employees and contractors',
      stability: 'Multi-year union agreements with Sindicato de Trabajadores Cerro Corona',
      nationalShare: '>99% Peruvian personnel with over 40% from Hualgayoc and Cajamarca',
      safetyMilestone: 'Award-winning occupational health protocols and ISO 45001 certification'
    },
    community: {
      primaryInitiative: 'Community Potable Water & Watershed Stewardship',
      description: 'Building and operating advanced potable water treatment and distribution infrastructure supplying rural villages across the Hualgayoc district.',
      keyMetrics: [
        'Clean drinking water delivered to over 5,000 local residents 24/7',
        '100% GISTM conformance on the Cerro Corona Tailings Management Facility',
        'Agricultural productivity and livestock enhancement programs'
      ]
    },
    renewables: {
      system: 'Hydro-Grid Electrification & In-Pit Tailings',
      capacity: '6.7 Mtpa Flotation Concentrator',
      impact: 'Low Scope 2 emission factor via Peruvian national hydroelectric grid',
      details: 'Transitioning to in-pit tailings deposition for the final life-of-mine phase, minimizing surface footprint and preserving surrounding landscapes.'
    },
    relatedReportIds: ['h1-2026-booklet', 'iar-2025', 'ccr-2024']
  },

  'st-ives': {
    geology: {
      basin: 'Norseman-Wiluna Greenstone Belt (Eastern Goldfields, WA)',
      depositType: 'Orogenic Mesothermal Vein & Shear Gold System',
      stratigraphy: 'Archaean tholeiitic basalts, komatiitic ultramafic volcanics, and sedimentary rocks within the Kambalda domain across Lake Lefroy.',
      mineralization: 'High-grade quartz-carbonate veins and albite-pyrite alteration along the Boulder-Lefroy fault corridor (Invincible, Hamlet, Neptune).',
      structuralControls: 'Major regional crustal strike-slip shear zone with subsidiary splay faults controlling multi-deposit occurrences.',
      explorationStatus: 'Lake Lefroy sub-surface exploration drilling consistently replacing depleted reserves annually.'
    },
    workforce: {
      headcount: '~1,350 employees and contractors',
      stability: 'Direct employment model with flexible roster patterns',
      nationalShare: '>95% Western Australian resident workforce',
      safetyMilestone: 'Autonomous underground haulage safety protocols and continuous ventilation monitoring'
    },
    community: {
      primaryInitiative: 'Ngadju Traditional Owners Partnership & RAP',
      description: 'Reconciliation Action Plan (RAP) partnerships covering cultural heritage surveys, native title engagement, and Indigenous business procurement.',
      keyMetrics: [
        'Active cultural heritage preservation agreements across Lake Lefroy',
        'Indigenous ranger support and land management co-design',
        'Apprenticeship pathways for youth in the Kambalda and Kalgoorlie regions'
      ]
    },
    renewables: {
      system: 'Large-Scale Renewables Microgrid Expansion',
      capacity: 'Multi-megawatt wind and solar PV farm under deployment',
      impact: 'Displacing over 60,000 tonnes of Scope 1 & 2 carbon emissions annually',
      details: 'Combining solar arrays, utility-scale wind turbines, and battery energy storage to supply clean energy to the Lefroy processing mill and underground portals.'
    },
    relatedReportIds: ['h1-2026-booklet', 'h1-2026-presentation', 'ccr-2024']
  },

  'granny-smith': {
    geology: {
      basin: 'Laverton Greenstone Belt (Yilgarn Craton, WA)',
      depositType: 'Intrusion-Hosted Orogenic Gold Deposit',
      stratigraphy: 'Wallaby alkali granodiorite pipe intrusive into a thick sequence of polymictic conglomerate and graywacke.',
      mineralization: 'Sheeted quartz-pyrite vein arrays within flat-lying actinolite-magnetite alteration zones mined down to 1,200m depth.',
      structuralControls: 'Sub-horizontal to moderately dipping shear fractures within the granodiorite plug (Zones 100, 110, 120, and 135).',
      explorationStatus: 'Wallaby underground drilling confirming deep high-grade extensions below Zone 135 indicating substantial mine life.'
    },
    workforce: {
      headcount: '~1,050 employees and contracting specialists',
      stability: 'Long-term operational team with low turnover rates',
      nationalShare: '>98% Australian personnel',
      safetyMilestone: 'Tele-remote automated underground drilling preventing worker exposure to active stopes'
    },
    community: {
      primaryInitiative: 'Laverton Regional Development & Indigenous Business Procurement',
      description: 'Support for the Laverton community through educational grants, youth leadership programs, and procurement contracts with local Aboriginal businesses.',
      keyMetrics: [
        'Direct procurement spend with local Wongatha businesses',
        'Support for the Laverton Leonora Cross Cultural Association',
        'Progressive rehabilitation on legacy historical waste landforms'
      ]
    },
    renewables: {
      system: 'Award-Winning Hybrid Solar-Gas-Battery Microgrid',
      capacity: '8 MWp Solar PV + 2 MW/1 MWh Battery + Reciprocating Gas Engines',
      impact: 'Reduced carbon emissions by ~18,000 tonnes CO2e per year',
      details: 'Pioneering hybrid microgrid optimizing renewable generation with high-efficiency gas generation to power the processing plant and underground ventilation.'
    },
    relatedReportIds: ['h1-2026-booklet', 'ccr-2024']
  },

  'agnew': {
    geology: {
      basin: 'Agnew-Wiluna Greenstone Belt (Northern Goldfields, WA)',
      depositType: 'Mesothermal Quartz-Vein Shear Gold Deposit',
      stratigraphy: 'Tholeiitic quartz dolerite sills and metasedimentary packages along the Waroonga shear zone.',
      mineralization: 'Steeply plunging high-grade quartz reefs (Waranga, New Holland, Barren Lands, Cinderella) with arsenopyrite and visible gold.',
      structuralControls: 'Regional Waroonga and Miranda shear corridors intersecting competency contrasts between dolerite and ultramafic rocks.',
      explorationStatus: 'Active underground diamond drilling extending mineralized shoots at Barren Lands and Redeemer North.'
    },
    workforce: {
      headcount: '~850 personnel',
      stability: 'High employee engagement through innovation-led zero-emission culture',
      nationalShare: '>95% Australian workforce',
      safetyMilestone: 'Zero fatalities and top decile safety performance across the Australian region'
    },
    community: {
      primaryInitiative: 'Northern Goldfields Community Investment & Traditional Owner Engagement',
      description: 'Supporting remote Goldfields communities, historical heritage preservation, and Indigenous cultural awareness programs with the Tjiwarl Traditional Owners.',
      keyMetrics: [
        'Collaborative partnerships with the Tjiwarl Native Title Holders',
        'Community grant programs across Leinster and Leonora',
        'Benchmark biodiversity surveys protecting arid zone species'
      ]
    },
    renewables: {
      system: 'Global Benchmark Renewable Microgrid',
      capacity: '18 MW Wind (5 turbines) + 4 MW Solar + 13 MW/4 MWh Battery BESS',
      impact: 'Routinely achieves 70% to 85%+ instantaneous renewable energy penetration',
      details: 'Celebrated global mining benchmark for remote renewable integration, proving that high-penetration wind, solar, and battery storage can reliably power deep underground mining.'
    },
    relatedReportIds: ['h1-2026-booklet', 'h1-2026-presentation', 'ccr-2024']
  },

  'gruyere': {
    geology: {
      basin: 'Dorothy Hills Greenstone Belt (Yamarna Terrane, WA)',
      depositType: 'Intrusion-Hosted Shear-Zone Gold Deposit',
      stratigraphy: 'Medium-grained quartz-monzonite porphyry intrusion (Gruyere Porphyry) up to 160m wide, bounded by mafic volcanic rocks.',
      mineralization: 'Finely disseminated native gold associated with albite-biotite-chlorite alteration and quartz-carbonate sheeted veinlet networks.',
      structuralControls: 'Major north-trending shear zone controlling the tabular geometry of the porphyry intrusive over a 1,500m strike length.',
      explorationStatus: 'Deep resource extension drilling scoping prospective underground transition opportunities beyond pit design.'
    },
    workforce: {
      headcount: '~750 personnel across operations and processing',
      stability: 'Joint venture operations management agreement executed smoothly by Gold Fields',
      nationalShare: '>98% Australian workforce',
      safetyMilestone: 'Advanced automated in-pit radar wall monitoring and fatigue detection systems'
    },
    community: {
      primaryInitiative: 'Yilka Traditional Owners & Cosmo Newberry Partnership',
      description: 'Comprehensive native title agreement with the Yilka People providing employment, business development, education, and cultural heritage protection.',
      keyMetrics: [
        'Dedicated Yilka liaison committee overseeing environmental and cultural sites',
        'Direct employment and training for local Aboriginal community members',
        'Sponsorship of remote community sports and healthcare initiatives'
      ]
    },
    renewables: {
      system: 'Yamarna Solar Farm & Microgrid Integration',
      capacity: '13 MW DC Solar Farm with automated energy management',
      impact: 'Displaces over 16,000 tonnes of Scope 1 carbon emissions annually',
      details: 'Remote solar plant integrated into the gas-fired power station supplying the 10.0 Mtpa processing facility and mine camp.'
    },
    relatedReportIds: ['h1-2026-booklet', 'iar-2025']
  },

  'windfall': {
    geology: {
      basin: 'Abitibi Greenstone Belt (Urban-Barry Subprovince, Quebec)',
      depositType: 'High-Grade Intrusion-Associated Orogenic Gold System',
      stratigraphy: 'Felsic to intermediate volcanic rocks intruded by quartz-feldspar porphyry dykes and gabbroic bodies.',
      mineralization: 'Extremely high-grade pyrite-silica-tourmaline replacement veins and breccias across the Lynx, Underdog, and Triple 8 zones.',
      structuralControls: 'Regional shear structures and lithological contacts dipping steeply east-northeast; exceptional grade continuity.',
      explorationStatus: 'Over 12 km of underground exploration decline completed; bulk sampling validating >95% metallurgical recovery.'
    },
    workforce: {
      headcount: '~350 project and development personnel during pre-construction',
      stability: 'Strong joint venture governance between Gold Fields and Osisko Mining',
      nationalShare: '>95% Quebec and Canadian workforce',
      safetyMilestone: 'Industry-leading underground development safety standards'
    },
    community: {
      primaryInitiative: 'Cree First Nation of Waswanipi Collaborative Engagement',
      description: 'Advancing collaborative negotiations toward a comprehensive Impact Benefit Agreement (IBA), respecting Cree rights, hunting grounds, and traditional ecological knowledge.',
      keyMetrics: [
        'Active joint consultation on environmental assessment and tailings design',
        'Cree-owned contracting opportunities for road access and camp logistics',
        'Environmental monitoring co-managed with community talley-men'
      ]
    },
    renewables: {
      system: 'Quebec Zero-Carbon Hydroelectric Grid Connection',
      capacity: 'High-voltage grid connection under engineering permitting',
      impact: 'Projected to be one of the lowest carbon footprint underground gold mines in North America',
      details: 'Direct hook-up to Hydro-Québec\'s 100% renewable hydroelectric power grid, virtually eliminating Scope 1 & 2 power emissions from mining and milling operations.'
    },
    relatedReportIds: ['h1-2026-booklet', 'iar-2025']
  },

  'damang': {
    geology: {
      basin: 'Proterozoic Tarkwaian Paleoplacer System (South-Western Ghana)',
      depositType: 'Hydrothermal & Paleoplacer Banket Quartz Conglomerate Deposit',
      stratigraphy: 'Banket series quartz-pebble conglomerates and hydrothermal quartz vein networks along the Damang anticline.',
      mineralization: 'Gold hosted in hydrothermal veins and conglomerate reefs mined across the Damang cutback, Amoanda, and Lima South pits.',
      structuralControls: 'Anticlinal folding and faulting creating dilation zones for hydrothermal gold deposition.',
      explorationStatus: 'Asset fully transferred to Government of Ghana on 18 April 2026; exploration and operational data handed over in full.'
    },
    workforce: {
      headcount: 'Historical workforce transferred with orderly handover',
      stability: 'Compliant transition preserving regional employment continuity',
      nationalShare: '>99% Ghanaian workforce historically',
      safetyMilestone: 'Maintained excellent environmental and safety records throughout historical operations'
    },
    community: {
      primaryInitiative: 'Orderly Stewardship Transfer to Government of Ghana',
      description: 'Transfer agreement executed on 18 April 2026 ensuring ongoing community stability, road infrastructure maintenance, and local employment stewardship.',
      keyMetrics: [
        'Formal transfer concluded 18 April 2026 as per H1 2026 Operational Disclosures',
        'Over 4 million ounces of gold produced under Gold Fields operational custody',
        'Comprehensive environmental management plans handed over to Ghanaian authorities'
      ]
    },
    renewables: {
      system: 'Historical Processing Plant & Reclaimed Landforms',
      capacity: 'Historical 5.0 Mtpa CIL processing facility',
      impact: 'Extensive progressive revegetation and agroforestry land rehabilitation',
      details: 'Progressive rehabilitation completed across waste rock landforms prior to asset transfer on 18 April 2026.'
    },
    relatedReportIds: ['h1-2026-booklet', 'iar-2025']
  }
};
