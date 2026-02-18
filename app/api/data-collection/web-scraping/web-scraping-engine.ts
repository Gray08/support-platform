// 정부 웹사이트 자동 스크래핑 시스템

import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';
import { GovernmentProgram } from '@/lib/types/government-program';

interface ScrapingTarget {
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
  updateFrequency: number; // 시간 단위
}

// 주요 스크래핑 대상 사이트들
const SCRAPING_TARGETS: ScrapingTarget[] = [
  {
    name: '중소벤처기업부',
    baseUrl: 'https://www.mss.go.kr/site/smba/ex/bbs/List.do?cbIdx=86',
    selectors: {
      programList: '.board_list tbody tr',
      programTitle: '.subject a',
      programDescription: '.subject .summary',
      applicationDeadline: '.date',
      supportAmount: '.amount',
      detailLink: '.subject a'
    },
    updateFrequency: 24 // 24시간마다
  },
  {
    name: '창업넷',
    baseUrl: 'https://www.k-startup.go.kr/homepage/businessManage/businessManageFunction.do',
    selectors: {
      programList: '.business_list .item',
      programTitle: '.title',
      programDescription: '.description',
      applicationDeadline: '.period',
      supportAmount: '.support_amount',
      detailLink: '.title a'
    },
    updateFrequency: 12 // 12시간마다
  },
  {
    name: '기업마당',
    baseUrl: 'https://www.bizinfo.go.kr/see/seea/selectSEEA140List.do',
    selectors: {
      programList: '.board_type01 tbody tr',
      programTitle: '.tit a',
      programDescription: '.cont',
      applicationDeadline: '.period',
      supportAmount: '.amount',
      detailLink: '.tit a'
    },
    updateFrequency: 24
  }
];

export class WebScrapingEngine {
  private browser: any;
  
  async initialize() {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
  
  async scrapeAllSites(): Promise<GovernmentProgram[]> {
    if (!this.browser) await this.initialize();
    
    const allPrograms: GovernmentProgram[] = [];
    
    for (const target of SCRAPING_TARGETS) {
      try {
        console.log(`🕷️  ${target.name} 스크래핑 시작...`);
        const programs = await this.scrapeSite(target);
        allPrograms.push(...programs);
        console.log(`✅ ${target.name}: ${programs.length}개 프로그램 수집`);
      } catch (error) {
        console.error(`❌ ${target.name} 스크래핑 실패:`, error);
      }
    }
    
    return allPrograms;
  }
  
  private async scrapeSite(target: ScrapingTarget): Promise<GovernmentProgram[]> {
    const page = await this.browser.newPage();
    
    try {
      await page.goto(target.baseUrl, { waitUntil: 'networkidle' });
      await page.waitForSelector(target.selectors.programList, { timeout: 10000 });
      
      const programs = await page.evaluate((targetData: typeof target) => {
        const items = document.querySelectorAll(targetData.selectors.programList);
        const results: any[] = [];
        
        items.forEach((item, index) => {
          try {
            const titleElement = item.querySelector(targetData.selectors.programTitle);
            const descElement = item.querySelector(targetData.selectors.programDescription);
            const deadlineElement = item.querySelector(targetData.selectors.applicationDeadline);
            const amountElement = item.querySelector(targetData.selectors.supportAmount);
            const linkElement = item.querySelector(targetData.selectors.detailLink);
            
            if (titleElement) {
              results.push({
                id: `${targetData.name}_${Date.now()}_${index}`,
                title: titleElement.textContent?.trim() || '',
                description: descElement?.textContent?.trim() || '',
                deadline: deadlineElement?.textContent?.trim() || '',
                supportAmount: amountElement?.textContent?.trim() || '',
                detailUrl: linkElement?.getAttribute('href') || '',
                source: targetData.name,
                scrapedAt: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('개별 항목 파싱 오류:', error);
          }
        });
        
        return results;
      }, target);
      
      // 상세 정보 추가 수집
      const detailedPrograms = await this.enrichProgramDetails(programs, target);
      
      return detailedPrograms.map(program => this.normalizeProgram(program, target.name));
      
    } finally {
      await page.close();
    }
  }
  
  private async enrichProgramDetails(programs: any[], target: ScrapingTarget): Promise<any[]> {
    const enriched = [];
    
    // 처음 5개만 상세 정보 수집 (성능 고려)
    for (const program of programs.slice(0, 5)) {
      if (program.detailUrl) {
        try {
          const detailInfo = await this.scrapeDetailPage(program.detailUrl, target);
          enriched.push({ ...program, ...detailInfo });
        } catch (error) {
          console.error(`상세 정보 수집 실패: ${program.title}`);
          enriched.push(program);
        }
      } else {
        enriched.push(program);
      }
    }
    
    // 나머지는 기본 정보만
    enriched.push(...programs.slice(5));
    
    return enriched;
  }
  
  private async scrapeDetailPage(url: string, target: ScrapingTarget): Promise<any> {
    const page = await this.browser.newPage();
    
    try {
      const fullUrl = url.startsWith('http') ? url : `${new URL(target.baseUrl).origin}${url}`;
      await page.goto(fullUrl, { timeout: 5000 });
      
      const detailInfo = await page.evaluate(() => {
        // 일반적인 상세 정보 선택자들
        const selectors = [
          '.view_content', '.content', '.detail_content',
          '.board_view', '.view_area', '.post_content'
        ];
        
        let content = '';
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            content = element.textContent?.trim() || '';
            break;
          }
        }
        
        return {
          detailedDescription: content
        };
      });
      
      // Node.js 컨텍스트에서 정보 추출
      const eligibility = this.extractEligibility(detailInfo.detailedDescription);
      const requiredDocuments = this.extractDocuments(detailInfo.detailedDescription);
      const contactInfo = this.extractContact(detailInfo.detailedDescription);
      
      return {
        ...detailInfo,
        eligibility,
        requiredDocuments,
        contactInfo
      };
      
    } catch (error) {
      console.error('상세 페이지 스크래핑 오류:', error);
      return {};
    } finally {
      await page.close();
    }
  }
  
  private normalizeProgram(rawProgram: any, source: string): GovernmentProgram {
    return {
      id: rawProgram.id,
      title: rawProgram.title,
      organization: source,
      category: this.categorizeProgram(rawProgram.title, rawProgram.description),
      eligibility: rawProgram.eligibility || [],
      supportAmount: rawProgram.supportAmount || '별도 공지',
      applicationPeriod: {
        start: '',
        end: rawProgram.deadline || ''
      },
      description: rawProgram.detailedDescription || rawProgram.description,
      requirements: rawProgram.requiredDocuments || [],
      documents: [],
      contactInfo: rawProgram.contactInfo || {
        department: source,
        phone: '',
        email: ''
      },
      url: rawProgram.detailUrl,
      lastUpdated: rawProgram.scrapedAt
    };
  }
  
  private categorizeProgram(title: string, description: string): string {
    const content = (title + ' ' + description).toLowerCase();
    
    if (content.includes('창업') || content.includes('스타트업')) return '창업지원';
    if (content.includes('r&d') || content.includes('연구개발')) return 'R&D';
    if (content.includes('수출') || content.includes('해외진출')) return '수출지원';
    if (content.includes('기술개발') || content.includes('혁신')) return '기술혁신';
    if (content.includes('바이오') || content.includes('의료')) return '바이오/의료';
    if (content.includes('디지털') || content.includes('ai') || content.includes('소프트웨어')) return 'IT/디지털';
    
    return '기타';
  }

  private extractEligibility(content: string): string[] {
    const eligibilityPatterns = [
      /자격요건[:\s]+([^.]*)/gi,
      /대상[:\s]+([^.]*)/gi,
      /지원대상[:\s]+([^.]*)/gi
    ];
    
    const eligibilities: string[] = [];
    for (const pattern of eligibilityPatterns) {
      const match = content.match(pattern);
      if (match) {
        eligibilities.push(...match.map(m => m.replace(/자격요건|대상|지원대상[:\s]+/gi, '').trim()));
      }
    }
    return eligibilities.length > 0 ? eligibilities : ['제한 없음'];
  }

  private extractDocuments(content: string): string[] {
    const documentPatterns = [
      /첨부서류[:\s]+([^.]*)/gi,
      /제출서류[:\s]+([^.]*)/gi,
      /준비서류[:\s]+([^.]*)/gi,
      /필수서류[:\s]+([^.]*)/gi
    ];
    
    const documents: string[] = [];
    for (const pattern of documentPatterns) {
      const match = content.match(pattern);
      if (match) {
        documents.push(...match.map(m => m.replace(/첨부서류|제출서류|준비서류|필수서류[:\s]+/gi, '').trim()));
      }
    }
    return documents;
  }

  private extractContact(content: string): { department: string; phone: string; email: string } {
    const phoneMatch = content.match(/\d{2,3}-\d{3,4}-\d{4}/);
    const emailMatch = content.match(/[\w.-]+@[\w.-]+\.\w+/);
    
    const departmentMatch = content.match(/담당부서[:\s]+([^,\n]+)/i);
    
    return {
      department: departmentMatch?.[1]?.trim() || '',
      phone: phoneMatch?.[0] || '',
      email: emailMatch?.[0] || ''
    };
  }
  
  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 자동 스크래핑 스케줄러
export class ScrapingScheduler {
  private intervals: NodeJS.Timeout[] = [];
  
  start() {
    console.log('🕷️  웹 스크래핑 스케줄러 시작');
    
    // 매일 오전 9시에 전체 스크래핑
    const dailyInterval = setInterval(async () => {
      await this.runFullScraping();
    }, 24 * 60 * 60 * 1000); // 24시간
    
    this.intervals.push(dailyInterval);
    
    // 즉시 한 번 실행
    this.runFullScraping();
  }
  
  private async runFullScraping() {
    console.log('🔄 전체 사이트 스크래핑 시작');
    
    const scraper = new WebScrapingEngine();
    
    try {
      const programs = await scraper.scrapeAllSites();
      
      // 수집된 데이터 저장
      await this.saveScrapedData(programs);
      
      console.log(`✅ 총 ${programs.length}개 지원사업 수집 완료`);
      
    } catch (error) {
      console.error('❌ 스크래핑 실패:', error);
    } finally {
      await scraper.close();
    }
  }
  
  private async saveScrapedData(programs: GovernmentProgram[]) {
    // 파일 시스템에 저장
    const dataPath = path.join(process.cwd(), 'data', 'scraped-programs');
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(dataPath, { recursive: true });
    }
    
    const fileName = `scraped_${new Date().toISOString().split('T')[0]}.json`;
    const filePath = path.join(dataPath, fileName);
    
    fs.writeFileSync(filePath, JSON.stringify(programs, null, 2));
    
    // 최신 데이터로 메인 파일 업데이트
    const mainFilePath = path.join(process.cwd(), 'data', 'programs', 'live-programs.json');
    fs.writeFileSync(mainFilePath, JSON.stringify({
      lastUpdated: new Date().toISOString(),
      totalPrograms: programs.length,
      programs: programs
    }, null, 2));
  }
  
  stop() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    console.log('🛑 스크래핑 스케줄러 중지');
  }
}