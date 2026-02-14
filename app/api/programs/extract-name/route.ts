import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const pdf = formData.get('pdf') as File;

    if (!pdf) {
      return NextResponse.json(
        { error: 'PDF 파일이 필요합니다' },
        { status: 400 }
      );
    }

    console.log('=== 지원사업명 추출 시작 ===');
    console.log('파일명:', pdf.name);
    console.log('파일 크기:', Math.round(pdf.size / 1024), 'KB');

    // 파일 크기 체크 (5MB 이상이면 파일명에서만 추출)
    if (pdf.size > 5 * 1024 * 1024) {
      console.log('파일이 너무 큼, 파일명에서만 추출');
      const fileNameExtracted = extractFromFileName(pdf.name);
      return NextResponse.json({
        success: true,
        programName: fileNameExtracted,
        fileName: pdf.name,
        extractedFrom: 'filename',
        note: '파일 크기가 커서 파일명에서 추출했습니다'
      });
    }

    // 먼저 파일명에서 추출 시도 (API 호출 없이)
    const fileNameExtracted = extractFromFileName(pdf.name);
    if (fileNameExtracted) {
      console.log('파일명에서 추출 성공:', fileNameExtracted);
      
      // 파일명에서 추출했지만 더 정확한 추출을 위해 API도 시도
      try {
        const apiExtracted = await extractFromContent(pdf);
        if (apiExtracted && apiExtracted !== fileNameExtracted) {
          console.log('API에서 더 정확한 이름 추출:', apiExtracted);
          return NextResponse.json({
            success: true,
            programName: apiExtracted,
            fileName: pdf.name,
            extractedFrom: 'content'
          });
        }
      } catch (err) {
        console.log('API 추출 실패, 파일명 추출 결과 사용:', fileNameExtracted);
        console.log('오류 세부사항:', err);
      }
      
      return NextResponse.json({
        success: true,
        programName: fileNameExtracted,
        fileName: pdf.name,
        extractedFrom: 'filename'
      });
    }

    // 파일명에서 추출 실패 시에만 API 호출
    try {
      const apiExtracted = await extractFromContent(pdf);
      return NextResponse.json({
        success: true,
        programName: apiExtracted,
        fileName: pdf.name,
        extractedFrom: 'content'
      });
    } catch (err) {
      console.error('API 추출도 실패:', err);
      
      return NextResponse.json({
        success: true,
        programName: null,
        fileName: pdf.name,
        extractedFrom: 'none',
        error: 'AI 분석 실패, 수동 입력이 필요합니다'
      });
    }

  } catch (error) {
    console.error('지원사업명 추출 오류:', error);
    
    return NextResponse.json(
      { 
        error: '지원사업명 추출 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

async function extractFromContent(pdf: File): Promise<string | null> {
  // PDF를 base64로 변환
  const bytes = await pdf.arrayBuffer();
  const base64 = Buffer.from(bytes).toString('base64');

  // 간단한 프롬프트 (토큰 절약)
  const extractPrompt = `PDF에서 지원사업명만 추출해주세요. JSON 형식으로 응답하세요:
{"programName": "추출된 지원사업명"}`;

  console.log('Claude API 호출 시작...');

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500, // 토큰 수 줄임
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64
            }
          },
          {
            type: 'text',
            text: extractPrompt
          }
        ]
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    
    // Rate Limit 오류 특별 처리
    if (response.status === 429 || errorText.includes('rate_limit_error')) {
      throw new Error('RATE_LIMIT');
    }
    
    throw new Error(`API 오류: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.content || !data.content[0]) {
    throw new Error('API 응답 형식 오류');
  }

  const extractResult = data.content[0].text;
  
  try {
    const cleanedResult = extractResult
      .replace(/```json\n?|\n?```/g, '')
      .replace(/```\n?|\n?```/g, '')
      .trim();
    
    const parsedResult = JSON.parse(cleanedResult);
    return parsedResult.programName || null;
  } catch (e) {
    console.error('JSON 파싱 실패:', e);
    return null;
  }
}

// 파일명에서 지원사업명 추출 (개선된 버전)
function extractFromFileName(fileName: string): string | null {
  console.log('파일명에서 추출 시도:', fileName);
  
  // 파일 확장자 제거
  const nameWithoutExt = fileName.replace(/\.(pdf|hwp|docx?)$/i, '');
  
  // 더 많은 패턴들 추가
  const patterns = [
    /(\d{4}년?\s*.*?사업)/,
    /(\d{4}.*?프로젝트)/,
    /(.*?지원사업)/,
    /(.*?패키지)/,
    /(글로벌.*?\d+.*?프로젝트)/,
    /(글로벌.*?강소기업.*?\d+)/,
    /(중소기업.*?지원)/,
    /(창업.*?사업)/,
    /(K-.*?사업)/,
    /(.*?도약.*?패키지)/,
    /(.*?스타트업.*?사업)/,
    /(수출.*?바우처)/,
    /(.*?혁신.*?지원)/,
    /(.*?기술.*?개발)/
  ];

  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match && match[1]) {
      const extracted = match[1].trim();
      console.log('패턴 매치 성공:', extracted);
      return extracted;
    }
  }

  // 특수 문자 제거 후 재시도
  const cleanName = nameWithoutExt
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 길이가 적당하면 파일명 자체 사용
  if (cleanName.length > 5 && cleanName.length < 50) {
    console.log('파일명 자체 사용:', cleanName);
    return cleanName;
  }

  console.log('파일명에서 추출 실패');
  return null;
}