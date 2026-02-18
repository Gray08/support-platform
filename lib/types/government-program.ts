// lib/types/government-program.ts
export interface GovernmentProgram {
  id: string;
  title: string;
  organization: string;
  category: string;
  eligibility: string[];
  supportAmount: string;
  applicationPeriod: {
    start: string;
    end: string;
  };
  description: string;
  requirements: string[];
  documents: string[];
  contactInfo: {
    department: string;
    phone: string;
    email: string;
  };
  url: string;
  lastUpdated: string;
}

export interface APIConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  endpoints: {
    programs: string;
    details: string;
  };
  updateFrequency: 'daily' | 'weekly' | 'realtime';
}

export interface ScrapingTarget {
  name: string;
  baseUrl: string;
  selectors: {
    programList: string;
    programTitle: string;
    programDescription: string;
    applicationDeadline: string;
    supportAmount: string;
    detailLink: string;
  };
  updateFrequency: number;
}

export interface SearchFilters {
  category?: string;
  organization?: string;
  supportAmountMin?: number;
  supportAmountMax?: number;
  deadline?: 'upcoming' | 'thisMonth' | 'thisQuarter';
  eligibility?: string[];
  keywords?: string;
}