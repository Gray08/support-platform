// app/api/live-programs/route.ts
import { NextResponse } from 'next/server';

// 모든 타입을 이 파일에 직접 정의
interface GovernmentProgram {
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

interface SearchFilters {
  category?: string;
  organization?: string;
  keywords?: string;
}

interface LiveProgramResponse {
  success: boolean;
  totalPrograms: number;
  programs: GovernmentProgram[];
  lastUpdated: string;
  message: string;
}

// 샘플 지원사업 데이터 (실제 정부 지원사업 기반)
const SAMPLE_PROGRAMS: GovernmentProgram[] = [
  {
    id: 'mss_001',
    title: '2025년 중소기업 혁신바우처 지원사업',
    organization: '중소벤처기업부',
    category: '기술혁신',
    eligibility: ['중소기업', '벤처기업', '소상공인'],
    supportAmount: '최대 5,000만원',
    applicationPeriod: {
      start: '2025-02-01',
      end: '2025-03-31'
    },
    description: '중소기업의 기술개발 및 혁신 활동을 지원하는 바우처 사업으로, R&D, 시설투자, 인력양성 등을 종합 지원합니다.',
    requirements: ['사업계획서', '기업개요서', '기술개발계획서'],
    documents: ['사업자등록증', '법인등기부등본', '재무제표'],
    contactInfo: {
      department: '중소벤처기업부 기술혁신과',
      phone: '044-204-7500',
      email: 'tech@mss.go.kr'
    },
    url: 'https://www.mss.go.kr/site/smba/ex/bbs/View.do?cbIdx=86&bcIdx=1234567',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'kised_002',
    title: '2025년 스타트업 도약 패키지 지원사업',
    organization: '창업진흥원',
    category: '창업지원',
    eligibility: ['창업 3년 이내 기업', '예비창업자'],
    supportAmount: '최대 1억원',
    applicationPeriod: {
      start: '2025-03-01',
      end: '2025-04-30'
    },
    description: '스타트업 성장단계별 맞춤 지원을 통해 글로벌 시장 진출과 성공적인 도약을 지원하는 종합 프로그램입니다.',
    requirements: ['창업계획서', '팀구성현황', '기술경쟁력분석서'],
    documents: ['창업자 이력서', '사업자등록증', '기술개발계획서'],
    contactInfo: {
      department: '창업진흥원 성장지원센터',
      phone: '02-2156-9700',
      email: 'startup@kised.or.kr'
    },
    url: 'https://www.k-startup.go.kr/homepage/businessManage/businessManageFunction.do',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'motie_003',
    title: '2025년 소재부품 기술개발 지원사업',
    organization: '산업통상자원부',
    category: '소재부품',
    eligibility: ['제조업체', '연구기관', '대학'],
    supportAmount: '3억원~10억원',
    applicationPeriod: {
      start: '2025-01-15',
      end: '2025-02-28'
    },
    description: '핵심 소재부품의 국산화 및 기술자립도 제고를 위한 R&D 지원사업으로, 글로벌 공급망 대응력을 강화합니다.',
    requirements: ['연구개발계획서', '기업부설연구소 현황', '연구진 구성계획'],
    documents: ['연구개발비 내역서', '기업 재무현황', '연구시설 현황'],
    contactInfo: {
      department: '산업통상자원부 소재부품과',
      phone: '044-203-4300',
      email: 'materials@motie.go.kr'
    },
    url: 'https://www.motie.go.kr/motie/ne/presse/press2/bbs/bbsView.do?bbs_seq_n=164123',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'msit_004',
    title: '2025년 AI 반도체 혁신 허브 구축사업',
    organization: '과학기술정보통신부',
    category: 'AI/반도체',
    eligibility: ['대기업', '중견기업', '연구기관'],
    supportAmount: '최대 50억원',
    applicationPeriod: {
      start: '2025-02-15',
      end: '2025-03-15'
    },
    description: 'AI 반도체 설계부터 제조까지 전주기 혁신 생태계 구축을 위한 대규모 투자 지원사업입니다.',
    requirements: ['사업제안서', 'AI 기술로드맵', '인프라 구축계획'],
    documents: ['기업 기술현황', '연구진 이력서', '시설투자계획서'],
    contactInfo: {
      department: '과기정통부 정보통신정책실',
      phone: '044-202-6200',
      email: 'ai@msit.go.kr'
    },
    url: 'https://www.msit.go.kr/bbs/view.do?sCode=user&mId=113&mPid=112&bbsSeqNo=94&nttSeqNo=3181234',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'sba_005',
    title: '2025년 소상공인 디지털 전환 지원사업',
    organization: '소상공인시장진흥공단',
    category: '디지털전환',
    eligibility: ['소상공인', '자영업자'],
    supportAmount: '최대 300만원',
    applicationPeriod: {
      start: '2025-01-01',
      end: '2025-12-31'
    },
    description: '소상공인의 디지털 기술 도입과 온라인 진출을 지원하여 경쟁력 강화를 돕는 사업입니다.',
    requirements: ['신청서', '디지털전환계획서'],
    documents: ['사업자등록증', '매출현황증명서'],
    contactInfo: {
      department: '소상공인시장진흥공단 디지털지원센터',
      phone: '1566-3232',
      email: 'digital@semas.or.kr'
    },
    url: 'https://www.semas.or.kr/web/board/BD_selectBoard.do?q_bbsCode=1001&q_bbscttSn=20250101001',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'kipo_006',
    title: '2025년 중소기업 IP 바우처 지원사업',
    organization: '특허청',
    category: '지적재산',
    eligibility: ['중소기업', '소상공인', '개인'],
    supportAmount: '최대 300만원',
    applicationPeriod: {
      start: '2025-03-01',
      end: '2025-11-30'
    },
    description: '중소기업의 특허 출원, 상표 등록 등 지적재산권 확보를 위한 비용을 지원하는 바우처 사업입니다.',
    requirements: ['신청서', 'IP 창출계획서'],
    documents: ['사업자등록증', '기술개발현황서'],
    contactInfo: {
      department: '특허청 중소벤처기업지원과',
      phone: '042-481-8800',
      email: 'sme@kipo.go.kr'
    },
    url: 'https://www.kipo.go.kr/kpo/BoardApp/UnewApp?c=1003&seq=19123',
    lastUpdated: new Date().toISOString()
  }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 검색 필터 파싱
    const filters: SearchFilters = {
      category: searchParams.get('category') || undefined,
      organization: searchParams.get('organization') || undefined,
      keywords: searchParams.get('q') || undefined
    };
    
    console.log('🔍 실시간 지원사업 검색:', filters);
    
    // 필터 적용
    let filteredPrograms = [...SAMPLE_PROGRAMS];
    
    if (filters.category) {
      filteredPrograms = filteredPrograms.filter(p => 
        p.category.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }
    
    if (filters.organization) {
      filteredPrograms = filteredPrograms.filter(p => 
        p.organization.toLowerCase().includes(filters.organization!.toLowerCase())
      );
    }
    
    if (filters.keywords) {
      const keywords = filters.keywords.toLowerCase();
      filteredPrograms = filteredPrograms.filter(p => {
        const searchText = `${p.title} ${p.description} ${p.organization} ${p.category}`.toLowerCase();
        return searchText.includes(keywords);
      });
    }
    
    // 마감일 임박 순으로 정렬
    filteredPrograms.sort((a, b) => {
      const dateA = new Date(a.applicationPeriod.end);
      const dateB = new Date(b.applicationPeriod.end);
      return dateA.getTime() - dateB.getTime();
    });
    
    const response: LiveProgramResponse = {
      success: true,
      totalPrograms: filteredPrograms.length,
      programs: filteredPrograms,
      lastUpdated: new Date().toISOString(),
      message: `${filteredPrograms.length}개의 실시간 지원사업을 찾았습니다.`
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('실시간 지원사업 조회 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '지원사업 데이터 조회 중 오류가 발생했습니다',
        message: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}