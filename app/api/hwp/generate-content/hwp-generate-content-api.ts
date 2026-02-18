// app/api/hwp/generate-content/route.ts
import { NextResponse } from 'next/server';

interface FieldContent {
  fieldId: string;
  content: string;
  confidence: number;
  wordCount: number;
}

interface ContentGenerationRequest {
  fields: Array<{
    id: string;
    label: string;
    type: string;
    category: string;
    description?: string;
    required: boolean;
  }>;
  companyInfo: {
    companyName: string;
    ceoName: string;
    businessNumber: string;
    industry: string;
    mainProducts: string;
    coreTechnologies: string;
    annualSales?: string;
    employeeCount?: string;
    majorClients?: string;
  };
  programInfo: {
    name: string;
    organization: string;
    category: string;
    supportAmount: string;
    applicationPeriod: {
      start: string;
      end: string;
    };
  };
  options?: {
    tone: 'formal' | 'professional' | 'technical';
    length: 'short' | 'medium' | 'long';
    focus: string[];
  };
}

export async function POST(request: Request) {
  try {
    const body: ContentGenerationRequest = await request.json();
    const { fields, companyInfo, programInfo, options } = body;
    
    if (!fields || fields.length === 0) {
      return NextResponse.json(
        { error: '생성할 필드 정보가 제공되지 않았습니다' },
        { status: 400 }
      );
    }
    
    console.log('🤖 AI 내용 생성 시작');
    console.log(`회사: ${companyInfo.companyName}`);
    console.log(`지원사업: ${programInfo.name}`);
    console.log(`필드 수: ${fields.length}개`);
    
    const generatedContents: FieldContent[] = [];
    const failedFields: string[] = [];
    
    // 필드를 카테고리별로 그룹화
    const fieldsByCategory = groupFieldsByCategory(fields);
    
    // 카테고리별로 순차 처리 (속도 및 비용 최적화)
    for (const [category, categoryFields] of Object.entries(fieldsByCategory)) {
      console.log(`📝 ${category} 카테고리 처리 중... (${categoryFields.length}개 필드)`);
      
      try {
        const categoryContents = await generateCategoryContent(
          category,
          categoryFields,
          companyInfo,
          programInfo,
          options
        );
        
        generatedContents.push(...categoryContents);
        
      } catch (error) {
        console.error(`${category} 카테고리 생성 실패:`, error);
        categoryFields.forEach(field => failedFields.push(field.id));
      }
    }
    
    // 실패한 필드들 개별 처리
    if (failedFields.length > 0) {
      console.log(`🔄 실패한 필드 개별 재시도: ${failedFields.length}개`);
      
      for (const fieldId of failedFields) {
        const field = fields.find(f => f.id === fieldId);
        if (field) {
          try {
            const content = await generateSingleFieldContent(
              field,
              companyInfo,
              programInfo,
              options
            );
            generatedContents.push(content);
          } catch (error) {
            console.error(`필드 ${field.label} 개별 생성 실패:`, error);
            // 기본 내용으로 대체
            generatedContents.push({
              fieldId: field.id,
              content: generateFallbackContent(field, companyInfo),
              confidence: 0.3,
              wordCount: 0
            });
          }
        }
      }
    }
    
    console.log(`✅ 내용 생성 완료: ${generatedContents.length}개 필드`);
    
    return NextResponse.json({
      success: true,
      totalFields: fields.length,
      generatedFields: generatedContents.length,
      failedFields: failedFields.length,
      contents: generatedContents,
      summary: generateSummary(generatedContents)
    });
    
  } catch (error) {
    console.error('내용 생성 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '내용 생성 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

function groupFieldsByCategory(fields: any[]) {
  const groups: Record<string, any[]> = {};
  
  for (const field of fields) {
    const category = field.category || 'other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(field);
  }
  
  return groups;
}

async function generateCategoryContent(
  category: string,
  fields: any[],
  companyInfo: any,
  programInfo: any,
  options?: any
): Promise<FieldContent[]> {
  
  const categoryPrompt = createCategoryPrompt(category, fields, companyInfo, programInfo, options);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      messages: [{
        role: 'user',
        content: categoryPrompt
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Claude API 호출 실패: ${response.status}`);
  }
  
  const data = await response.json();
  const resultText = data.content[0].text.trim();
  
  try {
    // JSON 형태로 파싱 시도
    const cleanedResult = resultText
      .replace(/```json\n?|\n?```/g, '')
      .replace(/```\n?|\n?```/g, '')
      .trim();
    
    const parsedResults = JSON.parse(cleanedResult);
    
    return fields.map(field => {
      const content = parsedResults[field.id] || parsedResults[field.label] || '';
      return {
        fieldId: field.id,
        content: content,
        confidence: 0.8,
        wordCount: content.split(/\s+/).length
      };
    });
    
  } catch (parseError) {
    console.log('JSON 파싱 실패, 텍스트 분할 시도');
    return parseTextResponse(resultText, fields);
  }
}

function createCategoryPrompt(
  category: string,
  fields: any[],
  companyInfo: any,
  programInfo: any,
  options?: any
): string {
  
  const tone = options?.tone || 'professional';
  const length = options?.length || 'medium';
  
  const categoryDescriptions: Record<string, string> = {
    company: '기업 기본 정보 작성',
    project: '사업/프로젝트 개요 작성',
    budget: '예산 및 재무 계획 작성',
    technology: '기술 내용 및 개발 계획 작성',
    market: '시장 분석 및 사업성 검토 작성',
    team: '연구/사업 수행 인력 구성 작성',
    plan: '수행 계획 및 추진 전략 작성'
  };
  
  return `
당신은 정부 지원사업 신청서 작성 전문가입니다. 
${categoryDescriptions[category] || '관련 내용 작성'}을 해주세요.

## 기업 정보:
- 회사명: ${companyInfo.companyName}
- 대표자: ${companyInfo.ceoName}
- 업종: ${companyInfo.industry}
- 주요 제품/서비스: ${companyInfo.mainProducts}
- 핵심 기술: ${companyInfo.coreTechnologies}
- 직원 수: ${companyInfo.employeeCount || '정보없음'}
- 연매출: ${companyInfo.annualSales || '정보없음'}
- 주요 고객사: ${companyInfo.majorClients || '정보없음'}

## 지원사업 정보:
- 사업명: ${programInfo.name}
- 주관기관: ${programInfo.organization}
- 분야: ${programInfo.category}
- 지원규모: ${programInfo.supportAmount}
- 신청기간: ${programInfo.applicationPeriod.start} ~ ${programInfo.applicationPeriod.end}

## 작성할 필드들:
${fields.map(field => `- ${field.label}: ${field.description || '관련 내용 작성'}`).join('\n')}

## 작성 지침:
1. **문체**: ${tone === 'formal' ? '격식있는 공문서체' : tone === 'professional' ? '전문적이고 명확한 문체' : '기술적이고 구체적인 문체'}
2. **길이**: ${length === 'short' ? '간결하게 (50-100자)' : length === 'medium' ? '적당히 상세하게 (100-300자)' : '매우 상세하게 (300-500자)'}
3. **내용**: 기업의 실제 정보와 지원사업의 목적에 부합하는 구체적인 내용
4. **전문성**: 해당 분야의 전문 용어를 적절히 사용
5. **차별화**: 다른 기업과 구별되는 고유한 강점 강조

## 응답 형식:
다음 JSON 형식으로 응답해주세요:

{
${fields.map(field => `  "${field.id}": "${field.label}에 해당하는 내용을 여기에 작성"`).join(',\n')}
}

각 필드에 대해 위 지침을 따라 전문적이고 설득력 있는 내용을 작성해주세요.
`;
}

async function generateSingleFieldContent(
  field: any,
  companyInfo: any,
  programInfo: any,
  options?: any
): Promise<FieldContent> {
  
  const prompt = `
정부 지원사업 신청서의 "${field.label}" 항목을 작성해주세요.

기업 정보:
- 회사명: ${companyInfo.companyName}
- 업종: ${companyInfo.industry}
- 주요 사업: ${companyInfo.mainProducts}
- 핵심 기술: ${companyInfo.coreTechnologies}

지원사업: ${programInfo.name} (${programInfo.organization})

필드 설명: ${field.description || '관련 내용을 전문적으로 작성'}

요구사항:
- 기업의 실제 정보 반영
- 지원사업 목적에 부합
- 전문적이고 설득력 있는 내용
- ${field.type === 'textarea' ? '200-400자 내외의 상세한 설명' : '간결하고 명확한 내용'}

답변: (내용만 작성, 따옴표나 부가 설명 제외)
`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Claude API 호출 실패: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.content[0].text.trim();
  
  return {
    fieldId: field.id,
    content: content,
    confidence: 0.75,
    wordCount: content.split(/\s+/).length
  };
}

function parseTextResponse(text: string, fields: any[]): FieldContent[] {
  // AI가 JSON으로 응답하지 않은 경우의 대안 파싱
  const contents: FieldContent[] = [];
  
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  let currentFieldIndex = 0;
  let currentContent = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    // 필드 구분자 찾기
    const fieldMatch = trimmed.match(/^(.+?):(.+)$/);
    if (fieldMatch && currentFieldIndex < fields.length) {
      if (currentContent) {
        contents.push({
          fieldId: fields[currentFieldIndex - 1]?.id || `field_${currentFieldIndex - 1}`,
          content: currentContent.trim(),
          confidence: 0.7,
          wordCount: currentContent.split(/\s+/).length
        });
      }
      
      currentContent = fieldMatch[2].trim();
      currentFieldIndex++;
    } else {
      currentContent += ' ' + trimmed;
    }
  }
  
  // 마지막 필드 추가
  if (currentContent && currentFieldIndex <= fields.length) {
    contents.push({
      fieldId: fields[currentFieldIndex - 1]?.id || `field_${currentFieldIndex - 1}`,
      content: currentContent.trim(),
      confidence: 0.7,
      wordCount: currentContent.split(/\s+/).length
    });
  }
  
  return contents;
}

function generateFallbackContent(field: any, companyInfo: any): string {
  // AI 생성이 완전히 실패한 경우의 기본 내용
  const templates: Record<string, string> = {
    '회사명': companyInfo.companyName || '[회사명을 입력하세요]',
    '대표자명': companyInfo.ceoName || '[대표자명을 입력하세요]',
    '사업명': `${companyInfo.companyName} ${field.label}`,
    '사업목적': `${companyInfo.companyName}의 ${companyInfo.industry} 분야 경쟁력 강화를 위한 사업입니다.`,
    '핵심기술': companyInfo.coreTechnologies || '[핵심기술을 입력하세요]',
    '주요제품': companyInfo.mainProducts || '[주요제품을 입력하세요]'
  };
  
  return templates[field.label] || `[${field.label}에 대한 내용을 입력하세요]`;
}

function generateSummary(contents: FieldContent[]) {
  const totalWords = contents.reduce((sum, content) => sum + content.wordCount, 0);
  const avgConfidence = contents.reduce((sum, content) => sum + content.confidence, 0) / contents.length;
  
  const categoryStats = contents.reduce((stats: Record<string, number>, content) => {
    const category = content.fieldId.split('_')[0] || 'other';
    stats[category] = (stats[category] || 0) + 1;
    return stats;
  }, {});
  
  return {
    totalWords: totalWords,
    averageConfidence: Math.round(avgConfidence * 100) / 100,
    categoryDistribution: categoryStats,
    qualityScore: avgConfidence > 0.7 ? 'high' : avgConfidence > 0.5 ? 'medium' : 'low'
  };
}