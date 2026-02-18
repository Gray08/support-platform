import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CompanyProfile {
  companyName: string;
  ceoName: string;
  industry: string;
  businessType: string;
  mainProducts: string;
  employeeCount: string;
  establishedYear: string;
  address: string;
  annualSales2022: string;
  annualSales2023: string;
  annualSales2024: string;
  coreTechnologies: string;
  patents: string;
  certifications: string;
  majorClients: string;
  specialStatus: string[];
  previousSupports: string;
}

interface ProgramData {
  name: string;
  analysisData?: Record<string, unknown>;
}

interface RequestBody {
  programData: ProgramData;
  companyId: string;
}

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { programData, companyId } = body;

    console.log('=== 범용 AI 사업계획서 생성 시작 ===');
    console.log('선택된 프로그램:', programData?.name);
    console.log('기업 ID:', companyId);

    // 기업 프로필 로드
    const companyProfile = await loadCompanyProfile(companyId);
    if (!companyProfile) {
      return NextResponse.json(
        { error: '기업 프로필을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    console.log('기업 정보 로드 완료:', companyProfile.companyName);
    console.log('업종:', companyProfile.industry);

    // 업종별 맞춤 프롬프트 생성
    const customizedPrompt = generateIndustryCustomizedPrompt(
      programData, 
      companyProfile
    );

    try {
      // Claude API 호출
      console.log('Claude API 호출 - 업종 맞춤형 프롬프트 사용');
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4000,
          messages: [{
            role: 'user',
            content: customizedPrompt
          }]
        })
      });

      if (!response.ok) {
        console.log('Claude API 사용 불가, 업종별 기본 사업계획서 생성');
        const industryApplication = createIndustryBasedApplication(companyProfile, programData);
        return NextResponse.json({
          success: true,
          applicationData: industryApplication,
          message: `${companyProfile.industry} 업종에 최적화된 기본 사업계획서를 제공합니다`
        });
      }

      const data = await response.json() as { content: Array<{ text: string }> };
      const applicationText = data.content[0].text.trim();

      try {
        const cleanedResult = applicationText
          .replace(/```json\n?|\n?```/g, '')
          .replace(/```\n?|\n?```/g, '')
          .trim();
        
        const applicationData = JSON.parse(cleanedResult);
        
        console.log('업종 맞춤형 AI 사업계획서 생성 성공');
        console.log('사업명:', applicationData.projectTitle);

        return NextResponse.json({
          success: true,
          applicationData: applicationData,
          message: `🎯 ${companyProfile.companyName}에 최적화된 ${programData.name} 사업계획서가 생성되었습니다!`
        });

      } catch (parseError) {
        // JSON 파싱 실패 시 기본 사업계획서 제공
        console.log('JSON 파싱 실패:', parseError instanceof Error ? parseError.message : '알 수 없는 오류');
        const industryApplication = createIndustryBasedApplication(companyProfile, programData);
        return NextResponse.json({
          success: true,
          applicationData: industryApplication,
          message: '분석 완료, 업종 맞춤 사업계획서를 제공합니다'
        });
      }

    } catch (apiError) {
      // API 호출 실패 시 기본 사업계획서 제공
      console.log('API 호출 실패:', apiError instanceof Error ? apiError.message : '알 수 없는 오류');
      
      return NextResponse.json({
        success: true,
        applicationData: industryApplication,
        message: '네트워크 오류로 인해 업종 맞춤 사업계획서를 제공합니다'
      });
    }

  } catch (error) {
    console.error('범용 사업계획서 생성 오류:', error);
    return NextResponse.json(
      { 
        error: '사업계획서 생성 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

async function loadCompanyProfile(companyId: string): Promise<CompanyProfile | null> {
  try {
    const profilePath = path.join(process.cwd(), 'data', 'companies', `${companyId}.json`);
    
    if (!fs.existsSync(profilePath)) {
      return null;
    }

    const profileData = fs.readFileSync(profilePath, 'utf8');
    return JSON.parse(profileData) as CompanyProfile;
    
  } catch (error) {
    console.error('기업 프로필 로드 오류:', error);
    return null;
  }
}

function generateIndustryCustomizedPrompt(
  programData: ProgramData, 
  company: CompanyProfile
): string {
  
  const analysisData = programData?.analysisData || {};
  
  // 업종별 맞춤 키워드 및 강조점
  const industryInsights = getIndustryInsights(company.industry);
  
  // 기업 규모별 특성
  const scaleInsights = getScaleInsights(company.businessType, company.employeeCount);
  
  // 평균 매출 계산
  const avgSales = calculateAverageSales(
    company.annualSales2022,
    company.annualSales2023, 
    company.annualSales2024
  );

  return `
# ${company.companyName} 맞춤형 사업계획서 작성

## 지원사업 상세 분석:
${JSON.stringify(analysisData, null, 2)}

## 기업 프로필:
- **기업명**: ${company.companyName}
- **대표자**: ${company.ceoName}
- **업종**: ${company.industry}
- **기업유형**: ${company.businessType}
- **설립년도**: ${company.establishedYear}년
- **직원수**: ${company.employeeCount}
- **소재지**: ${company.address}

## 사업 현황:
- **주요 제품/서비스**: ${company.mainProducts}
- **핵심 기술**: ${company.coreTechnologies}
- **보유 특허**: ${company.patents}
- **인증서**: ${company.certifications}
- **주요 고객사**: ${company.majorClients}
- **평균 매출**: ${avgSales}

## 우대조건:
${company.specialStatus.join(', ')}

## 정부지원 이력:
${company.previousSupports}

## 업종별 특화 전략:
${industryInsights.strategy}

### 주요 강조점:
${industryInsights.keyPoints.map((point: string) => `- ${point}`).join('\n')}

### 예상 평가 기준:
${industryInsights.evaluationCriteria.map((criteria: string) => `- ${criteria}`).join('\n')}

## 기업 규모별 접근법:
${scaleInsights}

---

## 작성 지침:
"${programData.name}"에 대한 전문적인 사업계획서를 작성하되, 다음 사항을 반드시 준수:

1. **업종 특성 반영**: ${company.industry} 분야의 시장 동향과 기술 트렌드 포함
2. **기업 규모 고려**: ${company.businessType}에 적합한 현실적 목표 설정
3. **차별화 포인트**: 경쟁사 대비 ${company.companyName}의 고유 강점 부각
4. **정량적 목표**: 매출 규모와 성장 단계에 맞는 구체적 수치 제시
5. **실행 가능성**: 현재 인력과 자원으로 달성 가능한 계획 수립

### 결과물 JSON 형식:
{
  "projectTitle": "업종 특성과 기업 규모를 반영한 현실적 사업명 (15자 이내)",
  "projectSummary": "업종 전문성과 기업 특장점을 강조한 종합 개요 (500자 내외)",
  "projectBackground": "업종 동향, 기업 현황, 지원사업 부합성을 포함한 추진 배경 (600자 내외)",
  "projectGoals": "기업 규모에 적합한 현실적이고 구체적인 목표 (400자 내외)",
  "expectedOutcomes": "업종 특성을 고려한 실현 가능한 성과 (300자 내외)",
  "averageSales": "${avgSales}",
  "supportAmount": "지원사업 한도 내 적정 금액",
  "selfFunding": "기업 규모별 적정 자부담 비율",
  "specialFeatures": "실제 우대조건과 기업 특성을 정확히 매칭"
}

### 중요사항:
- 일반론이 아닌 ${company.companyName}만의 구체적이고 차별화된 내용
- ${company.industry} 업종의 전문 용어와 시장 지식 활용
- ${company.businessType} 규모에 맞는 현실적인 계획과 목표
- 보유 기술과 역량을 최대한 활용한 실행 전략 제시
`;
}

function getIndustryInsights(industry: string) {
  const insights: Record<string, { strategy: string; keyPoints: string[]; evaluationCriteria: string[] }> = {
    '제조업 - 기계/장비': {
      strategy: '스마트 제조, 자동화, Industry 4.0 기술 융합을 통한 생산성 혁신',
      keyPoints: [
        '정밀 가공 기술과 품질 관리 시스템',
        '설비 자동화 및 IoT 연계 솔루션',
        '에너지 효율성과 친환경 제조 공정',
        'OEM/ODM 파트너십을 통한 시장 확장'
      ],
      evaluationCriteria: [
        '기술혁신성과 차별화',
        '생산 효율성 개선 효과',
        '시장 경쟁력과 수출 가능성',
        '고용 창출 및 동반성장 기여도'
      ]
    },
    '제조업 - 전자/IT': {
      strategy: '디지털 전환, AI/IoT 융합, 차세대 전자기기 개발 집중',
      keyPoints: [
        '반도체/디스플레이 핵심 부품 기술',
        'AI 칩셋과 엣지 컴퓨팅 솔루션',
        '5G/6G 통신 장비 및 모듈',
        '전기차/이차전지 관련 전자 부품'
      ],
      evaluationCriteria: [
        '기술력과 특허 경쟁력',
        '글로벌 시장 진출 가능성',
        '대기업 협력 및 공급망 참여',
        'R&D 투자와 인력 양성 계획'
      ]
    },
    '제조업 - 국방/항공': {
      strategy: 'K-방산 혁신 4.0, 무인체계, 차세대 방위산업 기술 개발',
      keyPoints: [
        '무인 시스템 및 자율 운용 기술',
        '방산 품질 인증 및 보안성 확보',
        '국방 R&D와 민수 기술 이중화',
        '방위산업청 정책과 연계된 기술 개발'
      ],
      evaluationCriteria: [
        '국방 과학기술 혁신성',
        '안보 기여도 및 수출 전력화',
        '방산업체 자격과 보안 역량',
        '민군겸용기술 상용화 가능성'
      ]
    },
    'IT/소프트웨어': {
      strategy: 'AI, 클라우드, 빅데이터, 사이버보안 등 디지털 혁신 기술',
      keyPoints: [
        'AI/머신러닝 알고리즘 및 플랫폼',
        '클라우드 네이티브 서비스 개발',
        '사이버보안 및 개인정보 보호',
        'API 경제와 플랫폼 비즈니스'
      ],
      evaluationCriteria: [
        '소프트웨어 기술 혁신성',
        '시장 확장성과 수익 모델',
        '데이터 활용 역량',
        '디지털 전환 기여도'
      ]
    },
    '바이오/제약': {
      strategy: '신약 개발, 의료기기, 정밀의학, 바이오 헬스케어 혁신',
      keyPoints: [
        '바이오의약품 및 플랫폼 기술',
        '의료기기 인허가 및 임상시험',
        '개인 맞춤형 치료제 개발',
        'GMP 시설과 품질관리 체계'
      ],
      evaluationCriteria: [
        '기술의 과학적 타당성',
        '임상 개발 계획의 현실성',
        '규제 승인 가능성',
        '글로벌 진출 전략'
      ]
    }
  };

  return insights[industry] || {
    strategy: '업종 특성에 맞는 혁신 기술 개발과 시장 경쟁력 강화',
    keyPoints: [
      '핵심 기술력 확보 및 차별화',
      '시장 동향 분석과 고객 니즈 반영',
      '품질 향상과 효율성 개선',
      '지속 가능한 성장 기반 구축'
    ],
    evaluationCriteria: [
      '기술혁신성',
      '시장성과 사업화 가능성',
      '추진 역량',
      '정책 부합성'
    ]
  };
}

function getScaleInsights(businessType: string, employeeCount: string): string {
  const employeeNum = parseInt(employeeCount.replace(/[^0-9]/g, '')) || 0;
  
  if (businessType.includes('창업') || employeeNum < 10) {
    return '창업·소규모 기업 특성: 기술 집약적이고 실현 가능한 목표 설정, 핵심 인력 중심의 효율적 추진 체계, 초기 시장 진입과 고객 확보에 집중';
  } else if (employeeNum < 50) {
    return '중소기업 특성: 안정적인 기술 개발 역량 보유, 전문성 기반 틈새시장 공략, 대기업과의 협력을 통한 동반성장 모델 추구';
  } else {
    return '중견기업 특성: 체계적인 R&D 조직과 인프라 보유, 글로벌 진출 역량 확보, 산업 생태계 선도 및 상생 협력 주도';
  }
}

function calculateAverageSales(sales2022: string, sales2023: string, sales2024: string): string {
  const values = [sales2022, sales2023, sales2024]
    .map(s => parseFloat(s?.replace(/[^0-9.]/g, '') || '0'))
    .filter(v => v > 0);
    
  if (values.length === 0) return '매출 정보 없음';
  
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  return `${average.toFixed(1)}억원 (최근 ${values.length}년 평균)`;
}

function createIndustryBasedApplication(company: CompanyProfile, programData: ProgramData) {
  const industryInsights = getIndustryInsights(company.industry);
  const avgSales = calculateAverageSales(
    company.annualSales2022, 
    company.annualSales2023, 
    company.annualSales2024
  );
  
  // 업종별 맞춤 사업명
  let projectTitle = `${company.industry.split(' - ')[1] || company.industry} 혁신기술 개발`;
  if (company.industry.includes('제조업')) {
    projectTitle = `스마트 ${company.industry.split(' - ')[1]} 통합솔루션 개발`;
  } else if (company.industry.includes('IT')) {
    projectTitle = `AI 기반 ${company.mainProducts.split(',')[0]} 플랫폼 개발`;
  }
  
  return {
    projectTitle: projectTitle.substring(0, 15),
    projectSummary: `${company.companyName}는 ${company.industry} 분야의 전문기업으로서, ${company.establishedYear}년 설립 이래 ${company.coreTechnologies}을 바탕으로 차별화된 기술력을 축적해왔습니다. 본 과제는 ${programData.name}의 목표에 부합하는 혁신 솔루션 개발을 통해 ${industryInsights.keyPoints[0]}과 ${industryInsights.keyPoints[1]}을 실현하고자 합니다. ${company.mainProducts}를 기반으로 한 당사의 핵심 역량과 ${company.majorClients}와의 협력 경험을 활용하여, 시장 경쟁력을 한층 강화하고 ${company.businessType}으로서의 성장 기반을 확고히 다지겠습니다.`,
    projectBackground: `${company.industry} 시장은 디지털 전환과 기술 혁신의 가속화로 인해 새로운 성장 동력이 요구되는 시점입니다. ${industryInsights.strategy}이 핵심 트렌드로 부상하고 있으며, ${programData.name} 역시 이러한 산업 혁신을 지원하는 정책 방향과 일치합니다. ${company.companyName}은 ${parseInt(company.establishedYear) ? (2025 - parseInt(company.establishedYear)) : 0}년간의 업계 경험과 ${company.patents}등의 지적재산권을 바탕으로 ${company.specialStatus.join(', ')}등의 우대조건을 보유하고 있습니다. 그러나 급변하는 시장 환경과 글로벌 경쟁 심화에 대응하기 위해서는 차세대 기술 개발과 사업 모델 혁신이 필수적인 상황입니다.`,
    projectGoals: `본 사업을 통해 ① ${industryInsights.keyPoints[0]}을 구현한 차세대 솔루션 개발, ② ${industryInsights.keyPoints[1]} 기반의 경쟁력 강화, ③ ${industryInsights.keyPoints[2]}를 통한 시장 확대, ④ ${company.businessType} 규모에 적합한 지속 가능한 성장 모델 구축을 목표로 합니다. 정량적으로는 기술개발 완료 후 관련 매출 30% 증가, 신규 고용 ${Math.max(2, Math.floor(parseInt(company.employeeCount.replace(/[^0-9]/g, '')) * 0.2))}명 창출, 특허 출원 2건 이상을 달성하고자 합니다.`,
    expectedOutcomes: `기술적으로는 ${company.industry} 분야의 핵심 원천기술 확보와 ${company.coreTechnologies} 고도화를 통한 기술 경쟁력 강화를 기대합니다. 경제적으로는 사업 완료 후 3년 내 관련 매출 2배 증가와 ${company.businessType}으로서의 안정적 성장을 실현하며, 산업적으로는 ${company.industry} 생태계 발전에 기여하고 협력업체와의 상생 모델을 구축할 것입니다.`,
    averageSales: avgSales,
    supportAmount: '3,000만원',
    selfFunding: '750만원 (20%)',
    specialFeatures: company.specialStatus.join(', ') + 
      (company.certifications ? ', ' + company.certifications : '') + 
      (company.previousSupports ? ', 정부지원 수혜 경험 보유' : '')
  };
}