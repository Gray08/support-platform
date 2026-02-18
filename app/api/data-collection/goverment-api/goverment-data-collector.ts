// 정부 공공데이터 API 연동 시스템

import { GovernmentProgram } from '@/lib/types/government-program';

interface APIConfig {
  name: string;
  baseUrl: string;
  apiKey: string;
  endpoints: {
    programs: string;
    details: string;
  };
  updateFrequency: 'daily' | 'weekly' | 'realtime';
}

// 주요 정부 API 설정
const GOVERNMENT_APIS: APIConfig[] = [
  {
    name: '중소벤처기업부',
    baseUrl: 'https://api.data.go.kr/openapi/service',
    apiKey: process.env.PUBLIC_DATA_API_KEY || '',
    endpoints: {
      programs: '/smes-support-program',
      details: '/program-details'
    },
    updateFrequency: 'daily'
  },
  {
    name: '산업통상자원부',
    baseUrl: 'https://api.data.go.kr/openapi/service',
    apiKey: process.env.PUBLIC_DATA_API_KEY || '',
    endpoints: {
      programs: '/rd-program-info',
      details: '/rd-program-details'
    },
    updateFrequency: 'weekly'
  },
  {
    name: '과학기술정보통신부',
    baseUrl: 'https://api.ntis.go.kr/openapi',
    apiKey: process.env.NTIS_API_KEY || '',
    endpoints: {
      programs: '/tech-support-program',
      details: '/program-info'
    },
    updateFrequency: 'weekly'
  }
];

// API 데이터 수집기
export class GovernmentDataCollector {
  async collectAllPrograms(): Promise<GovernmentProgram[]> {
    const allPrograms: GovernmentProgram[] = [];
    
    for (const api of GOVERNMENT_APIS) {
      try {
        const programs = await this.fetchFromAPI(api);
        allPrograms.push(...programs);
      } catch (error) {
        console.error(`API 수집 실패 (${api.name}):`, error);
      }
    }
    
    return this.deduplicatePrograms(allPrograms);
  }
  
  private async fetchFromAPI(api: APIConfig): Promise<GovernmentProgram[]> {
    const response = await fetch(`${api.baseUrl}${api.endpoints.programs}`, {
      headers: {
        'X-API-KEY': api.apiKey,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }
    
    const data = await response.json();
    return this.parseAPIResponse(data, api.name);
  }
  
  private parseAPIResponse(data: any, source: string): GovernmentProgram[] {
    // API 응답을 표준 형식으로 변환
    return data.items?.map((item: any) => ({
      id: `${source}_${item.id}`,
      title: item.title || item.programName,
      organization: source,
      category: item.category || '기타',
      eligibility: item.eligibility?.split(',') || [],
      supportAmount: item.supportAmount || '별도 공지',
      applicationPeriod: {
        start: item.applicationStart,
        end: item.applicationEnd
      },
      description: item.description,
      requirements: item.requirements?.split(',') || [],
      documents: item.requiredDocuments?.split(',') || [],
      contactInfo: {
        department: item.department,
        phone: item.contactPhone,
        email: item.contactEmail
      },
      url: item.detailUrl,
      lastUpdated: new Date().toISOString()
    })) || [];
  }
  
  private deduplicatePrograms(programs: GovernmentProgram[]): GovernmentProgram[] {
    const seen = new Set();
    return programs.filter(program => {
      const key = `${program.title}_${program.organization}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// 스케줄러 - 정기적 데이터 업데이트
export class DataUpdateScheduler {
  async scheduleDailyUpdate() {
    console.log('🔄 일일 지원사업 데이터 업데이트 시작');
    
    const collector = new GovernmentDataCollector();
    const programs = await collector.collectAllPrograms();
    
    // 데이터베이스 업데이트
    await this.updateDatabase(programs);
    
    // 새로운 공고 알림
    await this.notifyNewPrograms(programs);
    
    console.log(`✅ ${programs.length}개 지원사업 정보 업데이트 완료`);
  }
  
  private async updateDatabase(programs: GovernmentProgram[]) {
    // 실제 데이터베이스 업데이트 로직
    // JSON 파일 또는 데이터베이스에 저장
  }
  
  private async notifyNewPrograms(programs: GovernmentProgram[]) {
    // 새로운 프로그램 알림 로직
    // 이메일, 슬랙, 웹훅 등으로 알림
  }
}