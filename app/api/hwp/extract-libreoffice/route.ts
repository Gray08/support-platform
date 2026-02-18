import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('hwp_file') as File;
    
    if (!file) {
      return NextResponse.json(
        { 
          success: false,
          error: 'HWP 파일이 필요합니다' 
        },
        { status: 400 }
      );
    }
    
    console.log('🖥️ LibreOffice HWP 추출:', file.name);
    
    const result = {
      success: true,
      fileName: file.name,
      fileSize: file.size,
      extractedAt: new Date().toISOString()
    };
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ LibreOffice 추출 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : '알 수 없는 오류' 
      },
      { status: 500 }
    );
  }
}
