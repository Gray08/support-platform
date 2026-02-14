import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface SaveDataInterface {
  id: string;
  programName: string;
  documentType: string;
  analyzedAt: string;
  fileSize: number;
  fileName: string;
  data: Record<string, unknown>;
  version: string;
}

interface IndexStructure {
  programs: Record<string, {
    id: string;
    name: string;
    documents: Record<string, {
      fileName: string;
      analyzedAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  metadata: {
    totalPrograms: number;
    lastUpdated: string;
    version: string;
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const pdf = formData.get('pdf') as File;
    const programName = formData.get('programName') as string;
    const documentType = formData.get('documentType') as string;

    console.log('=== PDF 분석 시작 (테스트 모드) ===');
    console.log('프로그램명:', programName);
    console.log('문서 유형:', documentType);
    console.log('PDF 크기:', Math.round(pdf.size / 1024), 'KB');

    if (!pdf || !programName || !documentType) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다' },
        { status: 400 }
      );
    }

    // 🧪 테스트: 모든 파일에 대해 기본 분석만 수행
    console.log('🧪 테스트 모드: 기본 분석만 수행');
    const basicAnalysis = createBasicAnalysis(programName, documentType);
    const saveResult = await saveAnalysisData(programName, documentType, basicAnalysis, pdf.size);
    
    return NextResponse.json({
      success: true,
      programId: saveResult.programId,
      data: basicAnalysis,
      savedPath: saveResult.savedPath,
      message: '🧪 테스트: 기본 분석을 수행했습니다'
    });

  } catch (error) {
    console.error('PDF 분석 오류:', error);
    
    return NextResponse.json(
      { 
        error: 'PDF 분석 중 오류가 발생했습니다', 
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 기본 분석 데이터 생성 (API 호출 없이)
function createBasicAnalysis(programName: string, documentType: string): Record<string, unknown> {
  const basicInfo = {
    지원사업명: programName,
    분석일시: new Date().toISOString(),
    문서유형: documentType,
    분석방식: '🧪 테스트 기본 분석'
  };

  switch (documentType) {
    case 'comprehensive':
      return {
        문서구성: {
          공고문_포함: true,
          신청서_포함: true,
          가이드_포함: true,
          기타_섹션: []
        },
        기본정보: {
          지원사업명: programName,
          주관기관: "중소벤처기업부",
          총페이지수: 37,
          발행연도: "2024",
          예산규모: "614억원"
        },
        공고내용: {
          지원금액: { 최소: "0원", 최대: "50백만원" },
          신청자격: "제조업 중소기업",
          지원내용: "컨설팅, 기술지원, 마케팅",
          신청기간: { 시작일: "2024.11.8", 종료일: "2024.11.28" }
        },
        분석메타: basicInfo
      };
      
    case 'announcement':
      return {
        지원사업명: programName,
        주관기관: "중소벤처기업부",
        지원금액: { 최소: "0원", 최대: "50백만원" },
        신청자격: "제조업 중소기업",
        지원내용: "바우처 형태 지원",
        분석메타: basicInfo
      };
      
    case 'form':
      return {
        섹션구조: [{
          순서: 1,
          제목: "사업계획서",
          필수여부: true,
          페이지: "16-29",
          필드목록: ["회사연혁", "대표자경력", "주요거래처"]
        }],
        첨부서류: ["사업자등록증명원", "재무제표증명원", "완납증명서"],
        작성주의사항: ["필수서류 미제출시 선정 제외"],
        분석메타: basicInfo
      };
      
    case 'guideline':
      return {
        작성원칙: ["상세한 사업계획 작성", "증빙자료 첨부"],
        섹션별가이드: {
          "사업계획서": "별첨1 서식 활용",
          "재무정보": "최근 3개년 제출"
        },
        평가기준: "서면심사 → 현장평가 → 지역별위원회",
        자주하는실수: ["필수서류 미제출", "신청기간 초과"],
        추가팁: ["마감일 피해서 신청", "수행기관 사전 확인"],
        분석메타: basicInfo
      };
      
    default:
      return {
        지원사업명: programName,
        문서유형: documentType,
        내용: "혁신바우처 사업 관련 문서",
        분석메타: basicInfo
      };
  }
}

async function saveAnalysisData(
  programName: string, 
  documentType: string, 
  data: Record<string, unknown>, 
  fileSize: number
): Promise<{ programId: string; savedPath: string }> {
  // 데이터 디렉토리 생성
  const dataDir = path.join(process.cwd(), 'data', 'programs');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // 프로그램 ID 생성
  const programId = programName
    .replace(/\s+/g, '_')
    .replace(/[^\w가-힣]/g, '')
    .toLowerCase();

  // 파일명 생성
  const timestamp = new Date().toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .substring(0, 19);
  
  const fileName = `${programId}_${documentType}_${timestamp}.json`;
  const filePath = path.join(dataDir, fileName);
  
  // 저장할 데이터 구조
  const saveData: SaveDataInterface = {
    id: programId,
    programName: programName,
    documentType: documentType,
    analyzedAt: new Date().toISOString(),
    fileSize: Math.round(fileSize / 1024),
    fileName: fileName,
    data: data,
    version: "1.0"
  };

  // JSON 파일로 저장
  fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2), 'utf8');
  console.log('🧪 테스트 결과 저장됨:', filePath);

  return {
    programId: programId,
    savedPath: filePath
  };
}