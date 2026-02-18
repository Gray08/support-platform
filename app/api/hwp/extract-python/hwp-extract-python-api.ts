// app/api/hwp/extract-python/route.ts
import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  let tempFilePath = '';
  let scriptPath = '';
  
  try {
    const formData = await request.formData();
    const file = formData.get('hwp_file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'HWP 파일이 업로드되지 않았습니다' },
        { status: 400 }
      );
    }
    
    console.log('📄 Python HWP 추출 시작:', file.name);
    
    // 1. 임시 디렉토리 생성
    const tempDir = path.join(process.cwd(), 'temp', 'hwp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // 2. 파일 저장
    tempFilePath = path.join(tempDir, `${Date.now()}_${file.name}`);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempFilePath, buffer);
    
    // 3. Python 추출 실행
    const extractedText = await extractWithPython(tempFilePath);
    
    // 4. 기본 분석
    const analysis = analyzeExtractedText(extractedText);
    
    return NextResponse.json({
      success: true,
      method: 'python-hwp5tools',
      fileName: file.name,
      extractedText: extractedText,
      analysis: analysis,
      confidence: 0.9
    });
    
  } catch (error) {
    console.error('Python 추출 실패:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'HWP 파일 추출 실패',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  } finally {
    // 임시 파일 정리
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

async function extractWithPython(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const pythonScript = `
import sys
import os

def extract_hwp_text(file_path):
    try:
        # hwp5tools 사용한 추출 시도
        import subprocess
        result = subprocess.run(['hwp5txt', file_path], 
                              capture_output=True, text=True, encoding='utf-8')
        
        if result.returncode == 0:
            return result.stdout
        else:
            # 대안: olefile을 사용한 기본 추출
            return extract_with_olefile(file_path)
            
    except Exception as e:
        return f"추출 실패: {str(e)}"

def extract_with_olefile(file_path):
    try:
        import olefile
        ole = olefile.OleFileIO(file_path)
        
        # HWP 파일의 텍스트 스트림 찾기
        text_streams = []
        for stream in ole.listdir():
            if 'BodyText' in str(stream):
                text_streams.append(stream)
        
        extracted_text = ""
        for stream in text_streams:
            try:
                data = ole.openfile(stream).read()
                # 간단한 텍스트 추출 (완전하지 않음)
                text = data.decode('utf-8', errors='ignore')
                extracted_text += text + "\\n"
            except:
                continue
                
        ole.close()
        return extracted_text
        
    except Exception as e:
        return f"대안 추출도 실패: {str(e)}"

if __name__ == "__main__":
    file_path = sys.argv[1]
    result = extract_hwp_text(file_path)
    print(result)
`;

    const scriptPath = path.join(path.dirname(filePath), 'extract_hwp.py');
    fs.writeFileSync(scriptPath, pythonScript);
    
    const pythonProcess = spawn('python3', [scriptPath, filePath]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      // 스크립트 파일 정리
      if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
      }
      
      if (code === 0) {
        resolve(output || '텍스트 추출 완료되었으나 내용이 비어있습니다.');
      } else {
        reject(new Error(`Python 실행 실패: ${errorOutput || '알 수 없는 오류'}`));
      }
    });
  });
}

function analyzeExtractedText(text: string) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const wordCount = text.split(/\s+/).length;
  
  return {
    totalLines: lines.length,
    wordCount: wordCount,
    hasContent: text.trim().length > 0,
    estimatedFields: Math.floor(lines.length / 10) // 대략적 추정
  };
}