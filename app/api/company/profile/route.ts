import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface CompanyProfile {
  id: string;
  companyName: string;
  ceoName: string;
  businessNumber: string;
  establishedYear: string;
  employeeCount: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  industry: string;
  businessType: string;
  mainProducts: string;
  annualSales2022: string;
  annualSales2023: string;
  annualSales2024: string;
  coreTechnologies: string;
  patents: string;
  certifications: string;
  majorClients: string;
  previousSupports: string;
  specialStatus: string[];
  createdAt: string;
  updatedAt: string;
}

// 기업 프로필 저장 (POST)
export async function POST(request: Request) {
  try {
    console.log('=== 기업 프로필 등록 시작 ===');
    
    const profileData = await request.json() as Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>;
    
    // 고유 ID 생성
    const companyId = profileData.businessNumber.replace(/-/g, '') + '_' + Date.now();
    
    const profile: CompanyProfile = {
      id: companyId,
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 데이터 디렉토리 확인/생성
    const dataDir = path.join(process.cwd(), 'data', 'companies');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 프로필 파일 저장
    const profilePath = path.join(dataDir, `${companyId}.json`);
    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
    
    console.log('기업 프로필 저장 완료:', profile.companyName);
    console.log('업종:', profile.industry);
    console.log('기업 유형:', profile.businessType);

    return NextResponse.json({
      success: true,
      companyId: companyId,
      message: `${profile.companyName} 프로필이 성공적으로 등록되었습니다.`
    });

  } catch (error) {
    console.error('기업 프로필 저장 오류:', error);
    return NextResponse.json(
      { 
        error: '기업 프로필 저장 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

// 기업 프로필 조회 (GET)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('id');
    
    if (!companyId) {
      // 모든 기업 목록 반환
      const dataDir = path.join(process.cwd(), 'data', 'companies');
      
      if (!fs.existsSync(dataDir)) {
        return NextResponse.json({ companies: [] });
      }

      const files = fs.readdirSync(dataDir);
      const companies = files
        .filter((f: string) => f.endsWith('.json'))
        .map((f: string) => {
          try {
            const content = fs.readFileSync(path.join(dataDir, f), 'utf8');
            return JSON.parse(content) as CompanyProfile;
          } catch {
            return null;
          }
        })
        .filter((company): company is CompanyProfile => company !== null);

      return NextResponse.json({ companies });
    }

    // 특정 기업 프로필 반환
    const profilePath = path.join(process.cwd(), 'data', 'companies', `${companyId}.json`);
    
    if (!fs.existsSync(profilePath)) {
      return NextResponse.json(
        { error: '해당 기업 프로필을 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    const profile: CompanyProfile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    return NextResponse.json({ profile });

  } catch (error) {
    console.error('기업 프로필 조회 오류:', error);
    return NextResponse.json(
      { 
        error: '기업 프로필 조회 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}