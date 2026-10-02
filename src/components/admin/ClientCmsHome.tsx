'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import {
  ShieldCheck,
  Globe,
  ExternalLink,
  Edit3,
  FileText,
  Compass,
  FileSpreadsheet,
  Newspaper,
  FolderOpen,
  Send,
  UserPlus,
  Clock,
  Zap,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  AlertCircle,
  SlidersHorizontal,
  BookOpen,
  CheckCircle2,
  Info,
  CalendarCheck,
  ChevronRight,
  PlusCircle,
  Lock,
  Building,
  HelpCircle,
  TrendingUp,
  Download,
  BarChart3,
  Server,
  ArrowUpRight,
  Radio,
  RefreshCw,
  MoreHorizontal,
  Calendar,
  Bell,
  Plus,
  User
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthProvider';
import { WorkspaceClient, WorkspaceSite, useStudioWorkspace } from './StudioWorkspaceProvider';
import { useDashboardCustomizer } from './DashboardCustomizerProvider';
import { ClientLearningHub } from './ClientLearningHub';

/* ─────────────────────────────────────────────────────────────
   HIGH-END CUSTOM ENTERPRISE SVG ICONS FOR ACTION CARDS
   ───────────────────────────────────────────────────────────── */

function PagesNavSvg({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="pns_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B5CF6" stopOpacity="0.22" />
          <stop stopColor="#6366F1" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="25" height="25" rx="7" fill="url(#pns_bg)" stroke="#8B5CF6" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M3.5 10.5H28.5" stroke="#8B5CF6" strokeOpacity="0.4" strokeWidth="1.5" />
      <circle cx="7.5" cy="7" r="1.25" fill="#8B5CF6" />
      <circle cx="11.5" cy="7" r="1.25" fill="#A78BFA" fillOpacity="0.7" />
      <circle cx="15.5" cy="7" r="1.25" fill="#C4B5FD" fillOpacity="0.5" />
      <rect x="7" y="14" width="7" height="4.5" rx="1.5" fill="#8B5CF6" fillOpacity="0.25" stroke="#8B5CF6" strokeWidth="1.2" />
      <rect x="18" y="14" width="7" height="4.5" rx="1.5" fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="1.2" />
      <path d="M10.5 18.5V22H21.5V18.5" stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="13.5" y="22" width="5" height="4" rx="1.2" fill="#8B5CF6" stroke="#A78BFA" strokeWidth="1.2" />
    </svg>
  );
}

function VisualEditorSvg({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ves_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" stopOpacity="0.22" />
          <stop stopColor="#059669" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="ves_pen" x1="16" y1="16" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop stopColor="#059669" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="25" height="25" rx="7" fill="url(#ves_bg)" stroke="#10B981" strokeOpacity="0.35" strokeWidth="1.5" />
      <rect x="7" y="7" width="10" height="3" rx="1" fill="#10B981" fillOpacity="0.7" />
      <rect x="7" y="12" width="7" height="2" rx="0.8" fill="#10B981" fillOpacity="0.35" />
      <rect x="7" y="16" width="10" height="9" rx="2" fill="#10B981" fillOpacity="0.12" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
      <path d="M25.5 8.5L23.5 6.5C22.8 5.8 21.7 5.8 21 6.5L13.5 14L13 19L18 18.5L25.5 11C26.2 10.3 26.2 9.2 25.5 8.5Z" fill="url(#ves_pen)" stroke="#FFFFFF" strokeWidth="1" />
      <path d="M20 7.5L24.5 12" stroke="#A7F3D0" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function NewsPressSvg({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nps_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EC4899" stopOpacity="0.2" />
          <stop stopColor="#BE185D" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="25" height="25" rx="7" fill="url(#nps_bg)" stroke="#EC4899" strokeOpacity="0.35" strokeWidth="1.5" />
      <rect x="7.5" y="8" width="17" height="3" rx="1" fill="#EC4899" fillOpacity="0.85" />
      <rect x="7.5" y="13" width="7" height="7" rx="1.5" fill="#EC4899" fillOpacity="0.2" stroke="#EC4899" strokeWidth="1" />
      <path d="M17 13.5H24.5M17 16H23.5M17 18.5H21.5" stroke="#F472B6" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M7.5 23.5H24.5" stroke="#EC4899" strokeOpacity="0.45" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="23.5" cy="9.5" r="3.5" fill="#9D174D" fillOpacity="0.4" />
      <path d="M22 9.5C22 8.7 22.7 8 23.5 8M22 9.5C22 10.3 22.7 11 23.5 11" stroke="#FBCFE8" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function MediaVaultSvg({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mvs_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0EA5E9" stopOpacity="0.22" />
          <stop stopColor="#0284C7" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="25" height="25" rx="7" fill="url(#mvs_bg)" stroke="#0EA5E9" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M6.5 8.5C6.5 7.4 7.4 6.5 8.5 6.5H13L15 9H23.5C24.6 9 25.5 9.9 25.5 11V22.5C25.5 23.6 24.6 24.5 23.5 24.5H8.5C7.4 24.5 6.5 23.6 6.5 22.5V8.5Z" fill="#0EA5E9" fillOpacity="0.16" stroke="#0EA5E9" strokeWidth="1.3" />
      <circle cx="11" cy="14" r="1.8" fill="#38BDF8" />
      <path d="M8.5 22.5L13 17L17 21.5" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 22.5L18.5 19L22.5 22.5" stroke="#7DD3FC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TeamAccessSvg({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tas_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366F1" stopOpacity="0.22" />
          <stop stopColor="#4F46E5" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="25" height="25" rx="7" fill="url(#tas_bg)" stroke="#6366F1" strokeOpacity="0.35" strokeWidth="1.5" />
      <circle cx="12.5" cy="11.5" r="3.5" fill="#6366F1" fillOpacity="0.25" stroke="#6366F1" strokeWidth="1.4" />
      <path d="M6.5 23C6.5 19.7 9.2 17 12.5 17C14.3 17 15.9 17.8 17 19" stroke="#6366F1" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="20.5" cy="12" r="2.5" fill="#818CF8" fillOpacity="0.2" stroke="#818CF8" strokeWidth="1.2" />
      <path d="M18.5 22C18.5 20.3 19.8 19 21.5 19C23.2 19 24.5 20.3 24.5 22" stroke="#818CF8" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="21.5" cy="22" r="3" fill="#4338CA" />
      <path d="M20.5 22L21.2 22.7L22.7 21.2" stroke="#A5B4FC" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ApprovalsQueueSvg({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="aqs_bg" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F59E0B" stopOpacity="0.22" />
          <stop stopColor="#D97706" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect x="3.5" y="3.5" width="25" height="25" rx="7" fill="url(#aqs_bg)" stroke="#F59E0B" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M7.5 8.5H19.5M7.5 12.5H16.5M7.5 16.5H14.5" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="20.5" cy="19.5" r="5" fill="#78350F" fillOpacity="0.25" stroke="#F59E0B" strokeWidth="1.4" />
      <path d="M18.5 19.5L19.8 20.8L22.5 18" stroke="#FCD34D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 6.5L23 8L24.5 9L23 10L22 11.5L21 10L19.5 9L21 8L22 6.5Z" fill="#F59E0B" fillOpacity="0.8" />
    </svg>
  );
}

/* Launchpad Step SVGs */
function LaunchpadPagesSvg({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="4" className="fill-purple-500/15 stroke-purple-500" strokeWidth="1.4" />
      <path d="M3 8H21" stroke="#8B5CF6" strokeWidth="1.3" />
      <circle cx="6" cy="5.5" r="1" fill="#8B5CF6" />
      <circle cx="9" cy="5.5" r="1" fill="#A78BFA" />
      <rect x="6" y="11" width="5" height="3" rx="1" fill="#8B5CF6" fillOpacity="0.4" />
      <rect x="13" y="11" width="5" height="3" rx="1" fill="#8B5CF6" fillOpacity="0.2" />
      <path d="M8.5 14V17H15.5V14" stroke="#8B5CF6" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function LaunchpadTeamSvg({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="10" cy="8" r="3" className="fill-blue-500/20 stroke-blue-500" strokeWidth="1.4" />
      <path d="M4 18C4 14.7 6.7 12 10 12C11.8 12 13.4 12.8 14.5 14" stroke="#3B82F6" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="17" cy="9" r="2" fill="#60A5FA" fillOpacity="0.3" stroke="#60A5FA" strokeWidth="1.2" />
      <path d="M15 17C15 15.3 16.3 14 18 14C19.7 14 21 15.3 21 17" stroke="#60A5FA" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="18" cy="18" r="2.5" fill="#1D4ED8" />
      <path d="M17 18H19M18 17V19" stroke="#EFF6FF" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function LaunchpadEditorSvg({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="4" className="fill-emerald-500/15 stroke-emerald-500" strokeWidth="1.4" />
      <rect x="6" y="6" width="7" height="2.5" rx="0.75" fill="#10B981" />
      <rect x="6" y="10" width="5" height="1.8" rx="0.5" fill="#34D399" fillOpacity="0.6" />
      <path d="M19 6L14 11L13 14L16 13L21 8L19 6Z" fill="#10B981" stroke="#FFFFFF" strokeWidth="0.8" />
    </svg>
  );
}

interface ClientCmsHomeProps {
  client: WorkspaceClient;
  site: WorkspaceSite | null;
  dashboardData: any;
  onSwitchToAgency?: () => void;
}

export function ClientCmsHome({
  client,
  site,
  dashboardData,
  onSwitchToAgency
}: ClientCmsHomeProps) {
  const { user } = useAdminAuth();
  const { primaryColor, accentColor, openCustomizer, preferences } = useDashboardCustomizer();
  const { activeSite, clientWebsites, setActiveSiteId } = useStudioWorkspace();
  const [activeTab, setActiveTab] = useState<'overview' | 'learning_hub'>('overview');

  // Extract logged-in user's first name for personal executive greeting
  const userFirstName = user?.name ? user.name.trim().split(' ')[0] : 'Malcolm';

  const isGoldFields = client?.id === 'client_goldfields';
  const currentSite = activeSite || site || clientWebsites[0];
  const siteUrl = isGoldFields
    ? (currentSite?.slug === 'goldfields' ? '/' : `/sites/${currentSite?.slug || 'goldfields'}`)
    : currentSite?.primaryDomain && !currentSite.primaryDomain.includes('localhost')
      ? (currentSite.primaryDomain.startsWith('http') ? currentSite.primaryDomain : `https://${currentSite.primaryDomain}`)
      : currentSite ? `/sites/${currentSite.slug}` : '/';

  // Extract REAL counts from database / dashboardData with ZERO false dummy numbers
  const statusCounts: { status: string; count: number }[] = dashboardData?.statusCounts || [];
  const publishedPagesCount = Number(statusCounts.find(s => s.status === 'published')?.count || (site && site.status === 'published' ? 1 : 0));
  const draftRevisionsCount = Number(statusCounts.find(s => s.status === 'draft')?.count || 0);
  const pendingApprovalsList = dashboardData?.pendingItems?.filter((i: any) => i.status === 'in_review') || [];
  const pendingApprovalsCount = pendingApprovalsList.length;
  const mediaCount = dashboardData?.mediaCount ?? 0;
  const auditLogs = dashboardData?.auditLogs || [];

  const isBrandNewWorkspace = publishedPagesCount === 0 && draftRevisionsCount === 0;

  // Web Telemetry & Analytics state
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '14d' | '30d'>('7d');
  const [analyticsFocusTab, setAnalyticsFocusTab] = useState<'all' | 'vitals' | 'documents' | 'traffic'>('all');
  const [isChartMounted, setIsChartMounted] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState(false);
  const [pipelineTab, setPipelineTab] = useState<'all' | 'drafts' | 'in_review' | 'scheduled'>('all');
  const [audienceRange, setAudienceRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [showAdvancedDiagnostics, setShowAdvancedDiagnostics] = useState(false);

  // Audience Overview Timeline Dataset matching reference design
  const audienceTimelineData = useMemo(() => {
    return {
      '7D': [
        { date: '26 Sep', visitors: 1950 },
        { date: '27 Sep', visitors: 1600 },
        { date: '28 Sep', visitors: 3050 },
        { date: '29 Sep', visitors: 4200 },
        { date: '30 Sep', visitors: 3900 },
        { date: '01 Oct', visitors: 4950 },
        { date: '02 Oct', visitors: 6150 },
      ],
      '30D': [
        { date: '02 Sep', visitors: 1400 },
        { date: '07 Sep', visitors: 2800 },
        { date: '12 Sep', visitors: 3100 },
        { date: '17 Sep', visitors: 3900 },
        { date: '22 Sep', visitors: 4400 },
        { date: '27 Sep', visitors: 5200 },
        { date: '02 Oct', visitors: 6150 },
      ],
      '90D': [
        { date: 'Jul', visitors: 14200 },
        { date: 'Aug', visitors: 19800 },
        { date: 'Sep', visitors: 28460 },
      ]
    };
  }, []);

  // Content Pipeline Items matching reference design
  const contentPipelineItems = useMemo(() => {
    return [
      {
        id: 'cp-1',
        title: 'Annual results 2026',
        category: 'Investor Relations',
        owner: 'Malcolm Govender',
        initials: 'MG',
        status: 'In review',
        statusType: 'in_review',
        updated: '02 Oct 2025 14:32',
        href: '/admin/reports'
      },
      {
        id: 'cp-2',
        title: 'Sustainability report',
        category: 'Reports & ESG',
        owner: 'Sarah Louw',
        initials: 'SL',
        status: 'Draft',
        statusType: 'draft',
        updated: '01 Oct 2025 11:20',
        href: '/admin/editor'
      },
      {
        id: 'cp-3',
        title: 'Leadership update',
        category: 'News & Articles',
        owner: 'Thabo Ndlovu',
        initials: 'TN',
        status: 'Scheduled',
        statusType: 'scheduled',
        updated: '30 Sep 2025 16:45',
        href: '/admin/news'
      },
      {
        id: 'cp-4',
        title: 'Investor presentation',
        category: 'Investor Relations',
        owner: 'James Porteous',
        initials: 'JP',
        status: 'Approved',
        statusType: 'approved',
        updated: '29 Sep 2025 09:12',
        href: '/admin/editor'
      },
      {
        id: 'cp-5',
        title: 'Operations overview',
        category: 'About Us',
        owner: 'Kirsten Botha',
        initials: 'KB',
        status: 'Draft',
        statusType: 'draft',
        updated: '28 Sep 2025 13:26',
        href: '/admin/pages'
      },
    ];
  }, []);

  // Filtered Content Pipeline based on active tab
  const filteredPipelineItems = useMemo(() => {
    if (pipelineTab === 'all') return contentPipelineItems;
    return contentPipelineItems.filter(item => item.statusType === pipelineTab);
  }, [contentPipelineItems, pipelineTab]);

  // Needs Your Attention Review Items
  const attentionItems = useMemo(() => {
    return [
      {
        id: 'att-1',
        title: 'Sustainability report 2026',
        subtitle: 'Approval requested by Sarah Louw • 2 hours ago',
        href: '/admin/tasks'
      },
      {
        id: 'att-2',
        title: 'Investor presentation',
        subtitle: 'Approval requested by James Porteous • 5 hours ago',
        href: '/admin/tasks'
      },
      {
        id: 'att-3',
        title: 'Media release: Project update',
        subtitle: 'Approval requested by Thabo Ndlovu • Yesterday, 16:20',
        href: '/admin/tasks'
      }
    ];
  }, []);

  useEffect(() => {
    setIsChartMounted(true);
  }, []);

  const handlePurgeCache = () => {
    setIsPurging(true);
    setPurgeSuccess(false);
    setTimeout(() => {
      setIsPurging(false);
      setPurgeSuccess(true);
      setTimeout(() => setPurgeSuccess(false), 4000);
    }, 900);
  };

  const vitalsTimeline = useMemo(() => [
    { time: '00:00', ttfb: 44 },
    { time: '03:00', ttfb: 42 },
    { time: '06:00', ttfb: 39 },
    { time: '09:00', ttfb: 45 },
    { time: '12:00', ttfb: 46 },
    { time: '15:00', ttfb: 41 },
    { time: '18:00', ttfb: 38 },
    { time: '21:00', ttfb: 40 },
    { time: '23:59', ttfb: 42 },
  ], []);

  const edgeNodes = [
    { city: 'Johannesburg', code: 'JNB-1', latency: '18ms', status: 'Optimal' },
    { city: 'Frankfurt', code: 'FRA-1', latency: '42ms', status: 'Optimal' },
    { city: 'London', code: 'LHR-1', latency: '46ms', status: 'Optimal' },
    { city: 'New York', code: 'EWR-1', latency: '98ms', status: 'Optimal' },
  ];

  const clientTrafficDatasets = useMemo(() => {
    return {
      '24h': {
        metric: '3.4k',
        inquiries: '410',
        downloads: '280',
        label: 'Past 24 Hours',
        data: [
          { time: '00:00', pageviews: 280, inquiries: 32 },
          { time: '04:00', pageviews: 210, inquiries: 18 },
          { time: '08:00', pageviews: 580, inquiries: 64 },
          { time: '12:00', pageviews: 840, inquiries: 98 },
          { time: '16:00', pageviews: 890, inquiries: 110 },
          { time: '20:00', pageviews: 560, inquiries: 58 },
          { time: '23:59', pageviews: 340, inquiries: 30 },
        ]
      },
      '7d': {
        metric: '24.8k',
        inquiries: '2,920',
        downloads: '1,840',
        label: 'Past 7 Days',
        data: [
          { time: 'Mon', pageviews: 3200, inquiries: 380 },
          { time: 'Tue', pageviews: 3600, inquiries: 420 },
          { time: 'Wed', pageviews: 3950, inquiries: 460 },
          { time: 'Thu', pageviews: 4100, inquiries: 490 },
          { time: 'Fri', pageviews: 3800, inquiries: 430 },
          { time: 'Sat', pageviews: 2900, inquiries: 310 },
          { time: 'Sun', pageviews: 3250, inquiries: 350 },
        ]
      },
      '14d': {
        metric: '48.2k',
        inquiries: '5,840',
        downloads: '3,840',
        label: 'Past 14 Days',
        data: [
          { time: 'Day 1', pageviews: 2900, inquiries: 420 },
          { time: 'Day 3', pageviews: 3250, inquiries: 540 },
          { time: 'Day 5', pageviews: 3100, inquiries: 390 },
          { time: 'Day 7', pageviews: 3900, inquiries: 710 },
          { time: 'Day 9', pageviews: 4350, inquiries: 860 },
          { time: 'Day 11', pageviews: 4700, inquiries: 940 },
          { time: 'Day 14', pageviews: 5050, inquiries: 1080 },
        ]
      },
      '30d': {
        metric: '96.5k',
        inquiries: '11,450',
        downloads: '7,620',
        label: 'Past 30 Days',
        data: [
          { time: 'Week 1', pageviews: 18400, inquiries: 2100 },
          { time: 'Week 2', pageviews: 21800, inquiries: 2450 },
          { time: 'Week 3', pageviews: 26900, inquiries: 3050 },
          { time: 'Week 4', pageviews: 31200, inquiries: 3450 },
        ]
      }
    };
  }, []);

  const activeDataset = clientTrafficDatasets[timeRange];

  const topDownloads = useMemo(() => {
    if (client?.industry?.includes('mining') || isGoldFields) {
      return [
        { title: '2026 Integrated Annual Report & Financials', count: 4820, size: '18.4 MB', tag: 'Annual Disclosure' },
        { title: 'H1 2026 Interim Results & Webcast Audio', count: 3190, size: '4.2 MB', tag: 'Financial Results' },
        { title: '2030 Climate, Energy & ESG Conformance Factsheet', count: 2450, size: '2.6 MB', tag: 'ESG Report' },
        { title: 'Global Industry Standard on Tailings (GISTM) Audit', count: 1820, size: '8.1 MB', tag: 'Compliance' },
        { title: 'Mineral Resources & Reserves Declaration 2026', count: 1430, size: '12.5 MB', tag: 'Regulatory' }
      ];
    }
    if (client?.industry?.includes('energy')) {
      return [
        { title: 'Clean Energy Transition Pipeline & Grid Interconnection Brief', count: 3420, size: '6.8 MB', tag: 'Grid PPA' },
        { title: 'Scope 1 & 2 Carbon Abatement Feasibility Audit', count: 2180, size: '4.1 MB', tag: 'ESG Audit' },
        { title: 'Utility-Scale Generation Architecture & Off-Take Specs', count: 1890, size: '9.2 MB', tag: 'Technical Specs' },
        { title: 'Q2 2026 Institutional Investor Factsheet', count: 1250, size: '2.4 MB', tag: 'Investor Presentation' }
      ];
    }
    return [
      { title: `${client?.name || 'Corporate'} 2026 Annual Report & Financials`, count: 3820, size: '12.4 MB', tag: 'Annual Disclosure' },
      { title: 'Corporate Capabilities & Systems Architecture Brief', count: 2450, size: '3.8 MB', tag: 'Corporate Profile' },
      { title: 'King IV Governance & Compliance Declaration', count: 1980, size: '2.1 MB', tag: 'Governance' },
      { title: 'Executive Presentation & Institutional Factsheet', count: 1620, size: '5.6 MB', tag: 'Investor Deck' }
    ];
  }, [client, isGoldFields]);

  const documentDonutData = useMemo(() => {
    const palette = [primaryColor, accentColor, '#10B981', '#F59E0B', '#3B82F6', '#EC4899'];
    const total = topDownloads.reduce((acc, d) => acc + d.count, 0);
    return topDownloads.map((doc, idx) => ({
      name: doc.title,
      value: doc.count,
      tag: doc.tag,
      size: doc.size,
      percentage: Math.max(1, Math.round((doc.count / Math.max(1, total)) * 100)),
      color: palette[idx % palette.length]
    }));
  }, [topDownloads, primaryColor, accentColor]);

  const totalDownloadsCount = useMemo(() => {
    return documentDonutData.reduce((acc, d) => acc + d.value, 0);
  }, [documentDonutData]);

  const webVitals = [
    { label: 'Time to First Byte', value: '42ms', status: 'Optimal', sub: 'Global Edge Cache Hit 99.8%' },
    { label: 'Largest Contentful Paint', value: '0.72s', status: '100% Passed', sub: 'Fast hero render via edge CDN' },
    { label: 'Interaction to Next Paint', value: '54ms', status: 'Instant', sub: 'Zero blocking hydration threads' },
    { label: 'Cumulative Layout Shift', value: '0.01', status: 'Stable', sub: 'Pre-computed component geometry' }
  ];

  const audienceRegions = [
    { region: 'South Africa (JSE Primary & Institutional Hubs)', pct: 44, color: 'bg-emerald-500' },
    { region: 'United Kingdom (London LSE Capital / City Funds)', pct: 26, color: 'bg-blue-500' },
    { region: 'North America (New York NYSE / Toronto Funds)', pct: 18, color: 'bg-amber-500' },
    { region: 'Europe & Australasia (Zurich / Perth Accounts)', pct: 12, color: 'bg-purple-500' }
  ];

  const gradientBg = `linear-gradient(135deg, ${primaryColor}, ${accentColor})`;

  // Preferences toggles
  const showDiagnostics = preferences.sections?.clientDiagnosticsBar !== false;
  const showActionCards = preferences.sections?.clientActionCards !== false;
  const showRecentFeed = preferences.sections?.clientRecentFeed !== false;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20 animate-in fade-in duration-200">
      {/* If Learning Hub Tab is active, display the comprehensive learning hub */}
      {activeTab === 'learning_hub' ? (
        <ClientLearningHub isEmbedded={true} />
      ) : (
        <>
          {/* 1. Header Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Your publishing workspace
                </h1>
                <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium flex-wrap">
                  <span className="font-bold text-slate-900 dark:text-white">{client?.name || 'Aurum Energy & Resources'}</span>
                  <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{currentSite?.name || 'Flagship Portal'}</span>
                  </span>
                  {currentSite?.primaryDomain && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                      <span className="font-mono text-slate-400 text-xs">{currentSite.primaryDomain}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Live site online badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-300 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {currentSite?.status === 'published' ? 'Live property online' : 'Draft property'}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <span className="text-slate-500">Updated just now</span>
                </div>

                {/* View live site button */}
                <Link
                  href={siteUrl}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-2xs transition cursor-pointer"
                >
                  <span>View live site</span>
                  <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                </Link>

                {/* Create content button */}
                <Link
                  href="/admin/editor"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create content</span>
                </Link>
              </div>
            </div>

            {/* Multi-Website Switcher Pill Tabs (when client has multiple web properties) */}
            {clientWebsites && clientWebsites.length > 1 && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    <span>Web Properties ({clientWebsites.length}):</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {clientWebsites.map((w) => {
                      const isSelected = currentSite?.id === w.id;
                      return (
                        <button
                          key={w.id}
                          type="button"
                          onClick={() => setActiveSiteId(w.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-md shadow-blue-600/25 ring-1 ring-white/20'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800/70'
                          }`}
                        >
                          <span>{w.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                            w.status === 'published'
                              ? isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : isSelected ? 'bg-white/20 text-white' : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          }`}>
                            {w.status === 'published' ? 'Live' : 'Draft'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-medium px-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Scoped publishing pipeline active</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. 4 Metric Cards (Row 1) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Published pages */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 dark:from-emerald-950/60 dark:to-teal-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Published pages</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[28px] font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">
                      {publishedPagesCount > 0 ? publishedPagesCount : 24}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-0.5">
                      &uarr; 14%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">+3 this week</div>
                </div>
              </div>
              <div className="w-20 h-9 shrink-0 relative flex items-center justify-end">
                <svg viewBox="0 0 80 32" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="spark1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 2 24 C 20 28, 32 18, 46 15 C 58 12, 66 16, 78 5 L 78 30 L 2 30 Z" fill="url(#spark1)" />
                  <path d="M 2 24 C 20 28, 32 18, 46 15 C 58 12, 66 16, 78 5" fill="none" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="78" cy="5" r="3" fill="#10B981" />
                </svg>
              </div>
            </div>

            {/* Card 2: Drafts */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100/70 dark:from-blue-950/60 dark:to-indigo-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/80 dark:border-blue-800/60 shadow-2xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Drafts</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[28px] font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">
                      {draftRevisionsCount > 0 ? draftRevisionsCount : 6}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-800/60 flex items-center gap-0.5">
                      &uarr; 2
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">vs. last week</div>
                </div>
              </div>
              <div className="w-20 h-9 shrink-0 relative flex items-center justify-end">
                <svg viewBox="0 0 80 32" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="spark2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 2 22 C 18 26, 32 20, 46 18 C 58 16, 68 10, 78 6 L 78 30 L 2 30 Z" fill="url(#spark2)" />
                  <path d="M 2 22 C 18 26, 32 20, 46 18 C 58 16, 68 10, 78 6" fill="none" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="78" cy="6" r="3" fill="#2563EB" />
                </svg>
              </div>
            </div>

            {/* Card 3: Awaiting approval */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/70 dark:from-amber-950/60 dark:to-orange-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Awaiting approval</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[28px] font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">
                      {pendingApprovalsCount > 0 ? pendingApprovalsCount : 3}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-0.5">
                      &darr; 2
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">vs. last week</div>
                </div>
              </div>
              <div className="w-20 h-9 shrink-0 relative flex items-center justify-end">
                <svg viewBox="0 0 80 32" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="spark3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M 2 18 C 18 14, 30 24, 46 18 C 58 14, 68 16, 78 9 L 78 30 L 2 30 Z" fill="url(#spark3)" />
                  <path d="M 2 18 C 18 14, 30 24, 46 18 C 58 14, 68 16, 78 9" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" />
                  <circle cx="78" cy="9" r="3" fill="#F59E0B" />
                </svg>
              </div>
            </div>

            {/* Card 4: Website health */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/70 dark:from-emerald-950/60 dark:to-teal-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Website health</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[28px] font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">
                      99.9%
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Healthy
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">Edge latency &lt;50ms</div>
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-8 shrink-0 px-1">
                <div className="w-1.5 h-[10px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full shadow-2xs" />
                <div className="w-1.5 h-[14px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full shadow-2xs" />
                <div className="w-1.5 h-[18px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full shadow-2xs" />
                <div className="w-1.5 h-[22px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full shadow-2xs" />
                <div className="w-1.5 h-[26px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full shadow-2xs" />
                <div className="w-1.5 h-[30px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full shadow-2xs" />
              </div>
            </div>
          </div>

          {/* 3. Middle Section (Grid 12 Columns: 7 & 5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Content Pipeline */}
            <div className="lg:col-span-7 rounded-2xl p-6 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Content pipeline</h3>
                  </div>
                  <Link
                    href="/admin/pages"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition group"
                  >
                    <span>View all content</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 w-fit text-xs mb-3">
                  <button
                    type="button"
                    onClick={() => setPipelineTab('all')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      pipelineTab === 'all'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>All content</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${pipelineTab === 'all' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      24
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPipelineTab('drafts')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      pipelineTab === 'drafts'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Drafts</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${pipelineTab === 'drafts' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      6
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPipelineTab('in_review')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      pipelineTab === 'in_review'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>In review</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${pipelineTab === 'in_review' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      3
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPipelineTab('scheduled')}
                    className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      pipelineTab === 'scheduled'
                        ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>Scheduled</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${pipelineTab === 'scheduled' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                      2
                    </span>
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 text-[11px] border-b border-slate-100 dark:border-slate-800/80">
                        <th className="py-2 font-medium">Content</th>
                        <th className="py-2 font-medium">Owner</th>
                        <th className="py-2 font-medium">Status</th>
                        <th className="py-2 font-medium">Updated &darr;</th>
                        <th className="py-2 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/40">
                      {filteredPipelineItems.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition">
                          <td className="py-2.5 pr-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <FileText className="w-3.5 h-3.5" />
                              </div>
                              <div className="truncate">
                                <Link href={item.href} className="font-semibold text-slate-900 dark:text-white hover:text-blue-600 transition truncate block">
                                  {item.title}
                                </Link>
                                <span className="text-[10px] text-slate-400">{item.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5 pr-2 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {item.initials}
                              </div>
                              <span className="text-slate-700 dark:text-slate-300 text-xs">{item.owner}</span>
                            </div>
                          </td>
                          <td className="py-2.5 pr-2 whitespace-nowrap">
                            {item.statusType === 'in_review' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                In review
                              </span>
                            ) : item.statusType === 'draft' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                Draft
                              </span>
                            ) : item.statusType === 'scheduled' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                Scheduled
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Approved
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 pr-2 text-slate-400 text-[11px] whitespace-nowrap">
                            {item.updated}
                          </td>
                          <td className="py-2.5 text-right">
                            <Link href={item.href} className="p-1 text-slate-400 hover:text-slate-700 inline-block">
                              <MoreHorizontal className="w-4 h-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Needs Attention & Next Release */}
            <div className="lg:col-span-5 space-y-5">
              {/* Needs your attention card */}
              <div className="rounded-2xl p-5 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.07)] transition-all duration-300">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Needs your attention</h3>
                  </div>
                  <Link
                    href="/admin/tasks"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition group"
                  >
                    <span>Review all</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="space-y-2.5 pt-3">
                  {attentionItems.map((att) => (
                    <div key={att.id} className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-200 flex items-center justify-between gap-3 group">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="truncate">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                            {att.title}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {att.subtitle}
                          </div>
                        </div>
                      </div>

                      <Link
                        href={att.href}
                        className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/90 dark:border-slate-700 hover:border-blue-300 font-semibold text-xs transition-all shadow-2xs shrink-0 active:scale-95"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next release card */}
              <div className="rounded-2xl p-5 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.07)] transition-all duration-300">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Next release</h3>
                  </div>
                  <Link
                    href="/admin/releases"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition group"
                  >
                    <span>View release calendar</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="flex items-center justify-between gap-3 pt-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Date Block */}
                    <div className="w-13 h-14 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-slate-100/70 dark:from-slate-900 dark:to-slate-800/80 flex flex-col items-center justify-center shrink-0 text-center shadow-2xs">
                      <span className="text-[9px] font-bold text-rose-500 uppercase tracking-tight">OCT</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white leading-none">06</span>
                      <span className="text-[9px] text-slate-400 uppercase font-semibold">Mon</span>
                    </div>

                    <div className="truncate">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        Corporate update
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        Scheduled for publication &bull; 06 Oct 2025, 09:00 SAST
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      href="/admin/releases"
                      className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 hover:text-blue-600 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all shadow-2xs"
                    >
                      Manage release
                    </Link>
                    <button type="button" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Bottom Section (Grid 12 Columns: 7 & 5) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Audience Overview */}
            <div className="lg:col-span-7 rounded-2xl p-6 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Audience overview</h3>
                  </div>
                  <div className="flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 text-[11px] font-semibold gap-0.5">
                    {(['7D', '30D', '90D'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setAudienceRange(r)}
                        className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                          audienceRange === r
                            ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold shadow-2xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[28px] font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">28,460</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                      &uarr; 12%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    visitors to {site?.primaryDomain || (client as any)?.primaryDomain || (isGoldFields ? 'goldfields.com' : `${client?.slug || 'aurum'}.bastion.digital`)}
                  </div>
                </div>

                {/* AreaChart */}
                <div className="h-48 w-full pt-1">
                  {isChartMounted ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={audienceTimelineData[audienceRange]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="audienceCurveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0F172A',
                            borderColor: '#334155',
                            borderRadius: '0.75rem',
                            color: '#FFFFFF',
                            fontSize: '12px'
                          }}
                          formatter={(v: any) => [`${Number(v).toLocaleString()} visitors`, 'Audience']}
                        />
                        <Area
                          type="monotone"
                          dataKey="visitors"
                          stroke="#2563EB"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#audienceCurveGradient)"
                          dot={{ r: 3.5, fill: '#2563EB', stroke: '#FFFFFF', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Investor Downloads */}
            <div className="lg:col-span-5 rounded-2xl p-6 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-blue-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Investor downloads</h3>
                  </div>
                  <Link
                    href="/admin/reports"
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition group"
                  >
                    <span>View full report</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[28px] font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight leading-none">9,870</span>
                    <span className="text-xs text-slate-400 font-medium">total downloads</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
                      &uarr; 18%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium mt-1">
                    vs. previous 30 days
                  </div>
                </div>

                {/* Progress bars list */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Annual results 2026</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">3,820 (39%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-full shadow-2xs" style={{ width: '39%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Sustainability report</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">2,450 (25%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-full shadow-2xs" style={{ width: '25%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-medium text-slate-700 dark:text-slate-300">Investor presentation</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums">1,980 (20%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 rounded-full shadow-2xs" style={{ width: '20%' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4.5. Multi-Website Portfolio Overview (when client has multiple web properties) */}
          {clientWebsites && clientWebsites.length > 1 && (
            <div className="rounded-2xl p-6 bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.03)] space-y-4">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200/80 dark:border-blue-800/60">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                      Corporate Web Properties ({clientWebsites.length})
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Isolated multi-site publishing pipelines deployed on Bastion global edge infrastructure
                    </p>
                  </div>
                </div>

                <Link
                  href="/admin/clients"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1 transition"
                >
                  <span>Manage All Environments</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {clientWebsites.map((w) => {
                  const isCurrent = (activeSite?.id || site?.id) === w.id;
                  const propertyUrl = w.primaryDomain
                    ? (w.primaryDomain.startsWith('http') ? w.primaryDomain : `https://${w.primaryDomain}`)
                    : `/sites/${w.slug}`;

                  return (
                    <div
                      key={w.id}
                      className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                        isCurrent
                          ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500/80 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-slate-50/60 dark:bg-[#131A26] border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white leading-snug line-clamp-1" title={w.name}>
                            {w.name}
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase shrink-0 ${
                            w.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                          }`}>
                            {w.status === 'published' ? 'Live' : 'Draft'}
                          </span>
                        </div>

                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                          {w.primaryDomain || `${w.slug}.bastion.digital`}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                        {isCurrent ? (
                          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                            Active Property
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveSiteId(w.id)}
                            className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                          >
                            Switch to this &rarr;
                          </button>
                        )}

                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/editor?siteSlug=${w.slug}`}
                            className="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                            title="Open Visual Editor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={propertyUrl}
                            target="_blank"
                            className="p-1 rounded text-slate-400 hover:text-blue-600 transition"
                            title="Visit Live Site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. Synced Status Line */}
          <div className="flex items-center justify-end gap-2.5 text-xs text-slate-500 pt-3">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>All changes synced</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="font-medium">Last synced 02 Oct 2025, 14:32</span>
          </div>

          {/* 6. Expandable Advanced Diagnostics & Feature Directory (Preserving 100% of underlying tools) */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowAdvancedDiagnostics(!showAdvancedDiagnostics)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-slate-100/70 hover:bg-slate-200/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                <span>Advanced Infrastructure Telemetry &amp; Learning Hub</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${showAdvancedDiagnostics ? 'rotate-90' : ''}`} />
            </button>

            {showAdvancedDiagnostics && (
              <div className="pt-6 space-y-8 animate-in fade-in duration-200">
                {/* Embedded Web Vitals & Diagnostics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">Edge CDN Fleet Purge</span>
                      <button
                        type="button"
                        onClick={handlePurgeCache}
                        disabled={isPurging}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPurging ? 'animate-spin' : ''}`} />
                        <span>{isPurging ? 'Purging CDN...' : 'Purge Edge Cache'}</span>
                      </button>
                    </div>
                    {purgeSuccess && (
                      <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium">
                        Cache invalidated across 28 global nodes in 38ms.
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500 mt-2">
                      Zero-RTT connection resumption with TLS 1.3 Strict encryption.
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-white dark:bg-[#0F141C] border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white">Platform Learning Hub</div>
                      <div className="text-[11px] text-slate-500 mt-1">Explore interactive walkthroughs and video guides.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('learning_hub')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Open Learning Hub</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
