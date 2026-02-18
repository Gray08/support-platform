import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Anthropic API error:', error);
      // 개발 중에는 오류 상세를 클라이언트에 전달해 원인 파악을 쉽게 합니다.
      // (프로덕션에서는 민감정보 노출 주의)
      const payload: any = { error: 'AI API 호출 실패' };
      if (process.env.NODE_ENV !== 'production') payload.details = error;
      return NextResponse.json(payload, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}