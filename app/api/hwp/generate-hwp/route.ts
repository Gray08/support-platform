import { NextRequest, NextResponse } from 'next/server';
import HWPExtractPythonAPI from './hwp-extract-python-api';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('hwp_file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'HWP 파일이 필요합니다' },
        { status: 400 }
      );
    }
    
    console.log('📄 Python HWP 추출 시작:', file.name);
    
    const result = await HWPExtractPythonAPI.extract(file);
    
    return NextResponse.json({
      success: result.success,
      data: result
    });
  } catch (error) {
    console.error('❌ Python 추출 오류:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}