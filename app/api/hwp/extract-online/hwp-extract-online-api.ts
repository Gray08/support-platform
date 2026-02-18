// app/api/hwp/extract-online/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('hwp_file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'HWP 파일이 업로드되지 않았습니다' },
        { status: 400 }
      );
    }
    
    console.log('☁️ 온라인 변환 서비스 시작:', file.name);
    
    // 1. CloudConvert API 시도
    let result = await tryCloudConvert(file);
    if (result.success) {
      return NextResponse.json(result);
    }
    
    // 2. iLovePDF API 시도 
    result = await tryILovePDF(file);
    if (result.success) {
      return NextResponse.json(result);
    }
    
    // 3. Convertio API 시도
    result = await tryConvertio(file);
    if (result.success) {
      return NextResponse.json(result);
    }
    
    // 4. 모든 온라인 서비스 실패시 기본 처리
    const fallbackResult = await fallbackExtraction(file);
    return NextResponse.json(fallbackResult);
    
  } catch (error) {
    console.error('온라인 변환 오류:', error);
    return NextResponse.json(
      { 
        success: false,
        error: '온라인 변환 서비스 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

async function tryCloudConvert(file: File) {
  try {
    console.log('🌥️ CloudConvert API 시도...');
    
    const apiKey = process.env.CLOUDCONVERT_API_KEY;
    if (!apiKey) {
      throw new Error('CloudConvert API 키가 설정되지 않음');
    }
    
    // 1. Job 생성
    const jobResponse = await fetch('https://api.cloudconvert.com/v2/jobs', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tasks: {
          'import-hwp': {
            operation: 'import/upload'
          },
          'convert-hwp': {
            operation: 'convert',
            input: 'import-hwp',
            output_format: 'txt',
            some_other_option: 'value'
          },
          'export-txt': {
            operation: 'export/url',
            input: 'convert-hwp'
          }
        }
      })
    });
    
    if (!jobResponse.ok) {
      throw new Error(`CloudConvert Job 생성 실패: ${jobResponse.status}`);
    }
    
    const jobData = await jobResponse.json();
    const importTask = jobData.data.tasks.find((t: any) => t.name === 'import-hwp');
    
    // 2. 파일 업로드
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    const uploadResponse = await fetch(importTask.result.form.url, {
      method: 'POST',
      body: uploadFormData
    });
    
    if (!uploadResponse.ok) {
      throw new Error('파일 업로드 실패');
    }
    
    // 3. 변환 완료 대기 (간단한 폴링)
    let attempts = 0;
    const maxAttempts = 30; // 30초 대기
    
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.cloudconvert.com/v2/jobs/${jobData.data.id}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.data.status === 'finished') {
        const exportTask = statusData.data.tasks.find((t: any) => t.name === 'export-txt');
        
        // 4. 변환된 텍스트 다운로드
        const textResponse = await fetch(exportTask.result.files[0].url);
        const extractedText = await textResponse.text();
        
        return {
          success: true,
          method: 'cloudconvert',
          fileName: file.name,
          extractedText: extractedText,
          confidence: 0.85
        };
      }
      
      if (statusData.data.status === 'error') {
        throw new Error('CloudConvert 변환 실패');
      }
      
      // 2초 대기
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    throw new Error('CloudConvert 변환 시간 초과');
    
  } catch (error) {
    console.error('CloudConvert 실패:', error);
    return { success: false, error: error.message };
  }
}

async function tryILovePDF(file: File) {
  try {
    console.log('❤️ iLovePDF API 시도...');
    
    const apiKey = process.env.ILOVEPDF_API_KEY;
    if (!apiKey) {
      throw new Error('iLovePDF API 키가 설정되지 않음');
    }
    
    // iLovePDF는 HWP를 직접 지원하지 않으므로 스킵
    throw new Error('iLovePDF는 HWP 형식을 지원하지 않음');
    
  } catch (error) {
    console.error('iLovePDF 실패:', error);
    return { success: false, error: error.message };
  }
}

async function tryConvertio(file: File) {
  try {
    console.log('🔄 Convertio API 시도...');
    
    const apiKey = process.env.CONVERTIO_API_KEY;
    if (!apiKey) {
      throw new Error('Convertio API 키가 설정되지 않음');
    }
    
    // 1. 변환 작업 시작
    const startResponse = await fetch('https://api.convertio.co/convert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apikey: apiKey,
        input: 'upload',
        inputformat: 'hwp',
        outputformat: 'txt',
        file: await fileToBase64(file)
      })
    });
    
    if (!startResponse.ok) {
      throw new Error(`Convertio 시작 실패: ${startResponse.status}`);
    }
    
    const startData = await startResponse.json();
    
    if (startData.status !== 'ok') {
      throw new Error(`Convertio 오류: ${startData.error}`);
    }
    
    const conversionId = startData.data.id;
    
    // 2. 변환 완료 대기
    let attempts = 0;
    const maxAttempts = 30;
    
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.convertio.co/convert/${conversionId}/status`, {
        method: 'GET'
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.data.step === 'finish') {
        // 3. 결과 다운로드
        const downloadResponse = await fetch(`https://api.convertio.co/convert/${conversionId}/dl`);
        const extractedText = await downloadResponse.text();
        
        return {
          success: true,
          method: 'convertio',
          fileName: file.name,
          extractedText: extractedText,
          confidence: 0.75
        };
      }
      
      if (statusData.data.step === 'error') {
        throw new Error(`Convertio 변환 실패: ${statusData.data.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    }
    
    throw new Error('Convertio 변환 시간 초과');
    
  } catch (error) {
    console.error('Convertio 실패:', error);
    return { success: false, error: error.message };
  }
}

async function fallbackExtraction(file: File) {
  console.log('🔧 기본 추출 방법 시도...');
  
  try {
    // 파일을 바이너리로 읽어서 텍스트 추출 시도
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // UTF-8로 디코딩 시도
    let text = buffer.toString('utf8');
    
    // 한글 문자 추출
    const koreanMatches = text.match(/[가-힣\s.,!?()0-9a-zA-Z]+/g);
    
    if (koreanMatches && koreanMatches.length > 0) {
      const extractedText = koreanMatches
        .filter(match => match.trim().length > 2)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (extractedText.length > 50) {
        return {
          success: true,
          method: 'fallback-binary',
          fileName: file.name,
          extractedText: extractedText,
          confidence: 0.5,
          warning: '기본 추출 방법을 사용했습니다. 정확도가 낮을 수 있습니다.'
        };
      }
    }
    
    return {
      success: false,
      method: 'fallback-failed',
      error: 'HWP 파일에서 텍스트를 추출할 수 없습니다',
      fileName: file.name
    };
    
  } catch (error) {
    return {
      success: false,
      method: 'fallback-error',
      error: `기본 추출 실패: ${error}`,
      fileName: file.name
    };
  }
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}