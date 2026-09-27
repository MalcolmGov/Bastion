import operationsData from '@/content/operations.json';
import reportsData from '@/content/reports.json';
import sustainabilityData from '@/content/sustainability.json';
import newsData from '@/content/news.json';
import jobsData from '@/content/jobs.json';
import suppliersData from '@/content/suppliers.json';
import {
  Operation,
  ReportItem,
  SustainabilityTarget,
  NewsArticle,
  JobListing,
  SupplierGuidance
} from '@/lib/types';

export class ContentRepository {
  static getOperations(): Operation[] {
    return operationsData as Operation[];
  }

  static getActiveOperations(): Operation[] {
    return (operationsData as Operation[]).filter(op => op.status === 'Active' || op.status === 'Project');
  }

  static getOperationBySlug(slug: string): Operation | undefined {
    return (operationsData as Operation[]).find(op => op.slug === slug);
  }

  static getReports(category?: string, year?: number): ReportItem[] {
    let reports = reportsData as ReportItem[];
    if (category && category !== 'All') {
      reports = reports.filter(r => r.category === category);
    }
    if (year) {
      reports = reports.filter(r => r.year === year);
    }
    return reports;
  }

  static getReportById(id: string): ReportItem | undefined {
    return (reportsData as ReportItem[]).find(r => r.id === id);
  }

  static getSustainabilityTargets(): SustainabilityTarget[] {
    return sustainabilityData as SustainabilityTarget[];
  }

  static getNews(): NewsArticle[] {
    return newsData as NewsArticle[];
  }

  static getNewsBySlug(slug: string): NewsArticle | undefined {
    return (newsData as NewsArticle[]).find(n => n.slug === slug);
  }

  static getJobs(discipline?: string, country?: string): JobListing[] {
    let jobs = jobsData as JobListing[];
    if (discipline && discipline !== 'All') {
      jobs = jobs.filter(j => j.discipline === discipline);
    }
    if (country && country !== 'All') {
      jobs = jobs.filter(j => j.country === country);
    }
    return jobs;
  }

  static getSupplierGuidance(countryCode?: string): SupplierGuidance[] {
    const list = suppliersData as SupplierGuidance[];
    if (countryCode) {
      return list.filter(s => s.countryCode.toLowerCase() === countryCode.toLowerCase());
    }
    return list;
  }

  static search(query: string): {
    operations: Operation[];
    reports: ReportItem[];
    news: NewsArticle[];
    sustainability: SustainabilityTarget[];
  } {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { operations: [], reports: [], news: [], sustainability: [] };
    }

    const operations = (operationsData as Operation[]).filter(op =>
      op.name.toLowerCase().includes(q) ||
      op.country.toLowerCase().includes(q) ||
      op.overview.toLowerCase().includes(q)
    );

    const reports = (reportsData as ReportItem[]).filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.period.toLowerCase().includes(q) ||
      r.summary.toLowerCase().includes(q)
    );

    const news = (newsData as NewsArticle[]).filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.summary.toLowerCase().includes(q)
    );

    const sustainability = (sustainabilityData as SustainabilityTarget[]).filter(s =>
      s.title.toLowerCase().includes(q) ||
      s.pillar.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );

    return { operations, reports, news, sustainability };
  }
}
