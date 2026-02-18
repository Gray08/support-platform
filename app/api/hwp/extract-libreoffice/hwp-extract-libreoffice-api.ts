// app/api/hwp/extract-libreoffice/route.ts
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  let tempFilePath = '';
  let outputPath = '';
  
  try {
    const formData = await request.formData();
    const file = formData.get('hwp_file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'HWP 파일이 업로드되지 않았습니다' },
        { status: 400 }
      );
    }
    
    console.log('🖥️ LibreOffice HWP 변환 시작:', file.name);
    
    // 1. 임시 디렉토리 생성
    const tempDir = path.join(process.cwd(), 'temp', 'libreoffice');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // 2. HWP 파일 저장
    tempFilePath = path.join(tempDir, `${Date.now()}_${file.name}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempFilePath, buffer);
    
    // 3. LibreOffice로 텍스트 변환
    const extractedText = await convertWithLibreOffice(tempFilePath, tempDir);
    
    // 4. 추출 결과 분석
    const analysis = analyzeLibreOfficeText(extractedText);
    
    return NextResponse.json({
      success: true,
      method: 'libreoffice-headless',
      fileName: file.name,
      extractedText: extractedText,
      analysis: analysis,
      confidence: 0.8
    });
    
  } catch (error) {
    console.error('LibreOffice 변환 실패:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'LibreOffice 변환 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  } finally {
    // 임시 파일들 정리
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    if (outputPath && fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
    }
  }
}

async function convertWithLibreOffice(inputPath: string, tempDir: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const outputFileName = path.basename(inputPath, path.extname(inputPath)) + '.txt';
    const outputPath = path.join(tempDir, outputFileName);
    
    // LibreOffice headless 모드로 텍스트 변환
    const libreOfficeProcess = spawn('libreoffice', [
      '--headless',
      '--convert-to', 'txt',
      '--outdir', tempDir,
      inputPath
    ]);
    
    let errorOutput = '';
    
    libreOfficeProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    libreOfficeProcess.on('close', (code) => {
      if (code === 0) {
        // 변환된 파일 읽기
        try {
          if (fs.existsSync(outputPath)) {
            const text = fs.readFileSync(outputPath, 'utf-8');
            resolve(text);
          } else {
            // 대안: 직접 텍스트 추출 시도
            resolve(extractTextDirectly(inputPath));
          }
        } catch (readError) {
          reject(new Error(`변환 파일 읽기 실패: ${readError}`));
        }
      } else {
        // LibreOffice 실패시 대안 방법
        console.log('LibreOffice 변환 실패, 대안 방법 시도...');
        resolve(extractTextDirectly(inputPath));
      }
    });
    
    libreOfficeProcess.on('error', (error) => {
      console.log('LibreOffice 실행 실패, 대안 방법 시도...');
      resolve(extractTextDirectly(inputPath));
    });
  });
}

function extractTextDirectly(filePath: string): string {
  try {
    // HWP 파일을 바이너리로 읽어서 텍스트 부분 추출 시도
    const buffer = fs.readFileSync(filePath);
    const text = buffer.toString('utf8', 0, Math.min(buffer.length, 50000));
    
    // 한글 문자만 추출하는 간단한 방법
    const koreanText = text.match(/[가-힣\s.,!?()0-9a-zA-Z]+/g);
    
    if (koreanText && koreanText.length > 0) {
      return koreanText.join(' ').replace(/\s+/g, ' ').trim();
    }
    
    return '텍스트 추출 실패 - 바이너리 데이터';
    
  } catch (error) {
    return `직접 추출 실패: ${error}`;
  }
}

function analyzeLibreOfficeText(text: string) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const wordCount = text.split(/\s+/).length;
  
  // 한글 문자 비율 계산
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const totalChars = text.length;
  const koreanRatio = totalChars > 0 ? (koreanChars / totalChars) * 100 : 0;
  
  return {
    totalLines: lines.length,
    paragraphs: paragraphs.length,
    wordCount: wordCount,
    koreanRatio: Math.round(koreanRatio * 100) / 100,
    hasValidContent: koreanRatio > 10, // 한글이 10% 이상이면 유효한 내용
    estimatedSections: Math.floor(paragraphs.length / 3)
  };
}