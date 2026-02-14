// @ts-nocheck
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Next.js App Router에서 요구하는 named export
export async function GET() {
  try {
    console.log('=== 프로그램 목록 조회 시작 ===');
    
    const dataDir = path.join(process.cwd(), 'data', 'programs');
    console.log('데이터 디렉토리:', dataDir);
    
    if (!fs.existsSync(dataDir)) {
      console.log('데이터 디렉토리가 존재하지 않음');
      return NextResponse.json({
        programs: [],
        total: 0,
        lastUpdated: new Date().toISOString()
      });
    }

    // 직접 JSON 파일들을 스캔
    const files = fs.readdirSync(dataDir);
    const jsonFiles = files.filter(f => 
      f.endsWith('.json') && 
      f !== 'index.json' && 
      f !== 'programs.json'
    );
    
    console.log('찾은 JSON 파일 수:', jsonFiles.length);
    console.log('파일 목록 (처음 5개):', jsonFiles.slice(0, 5));

    const programs = [];
    
    // 최대 20개 파일만 처리 (성능 고려)
    const filesToProcess = jsonFiles.slice(0, 20);
    
    for (const fileName of filesToProcess) {
      try {
        const filePath = path.join(dataDir, fileName);
        const fileData = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(fileData);
        
        // 프로그램 이름 추출 (여러 가지 가능성 고려)
        let programName = '알 수 없는 프로그램';
        
        if (parsedData.programName) {
          programName = parsedData.programName;
        } else if (parsedData.name) {
          programName = parsedData.name;
        } else if (parsedData.data && parsedData.data.지원사업명) {
          programName = parsedData.data.지원사업명;
        } else if (parsedData.data && parsedData.data.기본정보 && parsedData.data.기본정보.지원사업명) {
          programName = parsedData.data.기본정보.지원사업명;
        } else {
          // 파일명에서 프로그램명 추출
          programName = fileName
            .replace('.json', '')
            .replace(/_comprehensive.*$/, '')
            .replace(/_/g, ' ')
            .replace(/\d{4}-\d{2}-\d{2}.*$/, '')
            .trim();
        }
        
        const programId = fileName.replace('.json', '');
        const analyzedAt = parsedData.analyzedAt || new Date().toISOString();
        
        programs.push({
          id: programId,
          name: programName,
          createdAt: analyzedAt,
          updatedAt: analyzedAt,
          documents: { 
            comprehensive: { 
              fileName: fileName, 
              analyzedAt: analyzedAt 
            } 
          },
          analysisData: parsedData.data || {}
        });
        
      } catch (fileError) {
        console.error(`파일 처리 실패 (${fileName}):`, fileError);
        continue;
      }
    }
    
    console.log('성공적으로 처리된 프로그램 수:', programs.length);
    
    // 프로그램명으로 정렬
    programs.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    
    return NextResponse.json({
      programs: programs,
      total: programs.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('프로그램 목록 조회 중 전체 오류:', error);
    
    return NextResponse.json(
      { 
        error: '프로그램 목록을 불러오는 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}