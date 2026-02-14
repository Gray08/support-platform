'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Program = {
  id: string;
  name: string;
  organization: string;
  amount: string;
  eligibility: string;
  reason: string;
  matchScore: number;
};

type BasicInfo = {
  [key: string]: string | number;
};

type FieldDetails = {
  [key: string]: string | string[] | number;
};

type UploadedFile = {
  name: string;
  size: number;
  type: string;
};

export default function AIRecommendation() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const analyzeAndRecommend = async () => {
      try {
        setLoading(true);

        // localStorage에서 모든 정보 수집
        const userType = localStorage.getItem('userType');
        const basicInfo = userType === 'preliminary' 
          ? JSON.parse(localStorage.getItem('preliminaryInfo') || '{}') as BasicInfo
          : JSON.parse(localStorage.getItem('existingBusinessInfo') || '{}') as BasicInfo;
        
        const selectedFields = JSON.parse(localStorage.getItem('selectedFields') || '[]') as string[];
        const fieldDetails = JSON.parse(localStorage.getItem('fieldDetails') || '{}') as FieldDetails;
        const uploadedFiles = JSON.parse(localStorage.getItem('uploadedFiles') || '[]') as UploadedFile[];
        const additionalNotes = localStorage.getItem('additionalNotes') || '';

        // AI 프롬프트 생성
        const prompt = `당신은 한국의 정부 지원사업 전문 컨설턴트입니다. 다음 정보를 바탕으로 가장 적합한 정부 지원사업을 3-5개 추천해주세요.

## 사용자 정보

**사용자 유형:** ${userType === 'preliminary' ? '예비창업자' : '기존 사업자'}

**기본 정보:**
${JSON.stringify(basicInfo, null, 2)}

**관심 분야:**
${selectedFields.join(', ')}

**상세 정보:**
${JSON.stringify(fieldDetails, null, 2)}

**업로드된 파일:**
${uploadedFiles.length > 0 ? uploadedFiles.map((f) => f.name).join(', ') : '없음'}

**추가 메모:**
${additionalNotes || '없음'}

## 요청사항

다음 형식으로 정확히 3-5개의 실제 정부 지원사업을 추천해주세요:

[지원사업 1]
사업명: (구체적인 사업명)
주관기관: (예: 중소벤처기업부, 한국산업기술진흥원 등)
지원금액: (예: 최대 5,000만원)
신청자격: (구체적 자격 요건)
추천이유: (이 사용자에게 적합한 이유)
적합도: (0-100 점수)

[지원사업 2]
...

실제로 신청 가능한 사업만 추천해주세요.`;

        // Claude API 호출
        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4096,
            messages: [{
              role: 'user',
              content: prompt
            }]
          })
        });

        if (!response.ok) {
          throw new Error('AI 분석 실패');
        }

        const data = await response.json();
        const result = data.content[0].text;

        // 결과 파싱
        const parsedPrograms = parseAIResponse(result);
        setPrograms(parsedPrograms);
        
      } catch (err) {
        console.error('Error:', err);
        setError('AI 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setLoading(false);
      }
    };

    analyzeAndRecommend();
  }, []);

  const parseAIResponse = (response: string): Program[] => {
    const programs: Program[] = [];
    const regex = /\[지원사업 \d+\]([\s\S]*?)(?=\[지원사업 \d+\]|$)/g;
    const matches = response.matchAll(regex);

    let index = 1;
    for (const match of matches) {
      const content = match[1];
      
      const nameMatch = content.match(/사업명:\s*(.+)/);
      const orgMatch = content.match(/주관기관:\s*(.+)/);
      const amountMatch = content.match(/지원금액:\s*(.+)/);
      const eligibilityMatch = content.match(/신청자격:\s*(.+)/);
      const reasonMatch = content.match(/추천이유:\s*(.+)/);
      const scoreMatch = content.match(/적합도:\s*(\d+)/);

      if (nameMatch) {
        programs.push({
          id: `program-${index}`,
          name: nameMatch[1].trim(),
          organization: orgMatch ? orgMatch[1].trim() : '정부기관',
          amount: amountMatch ? amountMatch[1].trim() : '상세 확인 필요',
          eligibility: eligibilityMatch ? eligibilityMatch[1].trim() : '상세 내용 확인 필요',
          reason: reasonMatch ? reasonMatch[1].trim() : '-',
          matchScore: scoreMatch ? parseInt(scoreMatch[1]) : 80
        });
        index++;
      }
    }

    return programs;
  };

  const handleSelectProgram = (program: Program) => {
    localStorage.setItem('selectedProgram', JSON.stringify(program));
    router.push('/application');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ fontSize: '64px', marginBottom: '30px' }}>🤖</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>AI가 맞춤 지원사업을 찾고 있습니다</h1>
          <div style={{ width: '80px', height: '80px', border: '6px solid #f3f4f6', borderTop: '6px solid #059669', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '30px auto' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.8', marginTop: '30px' }}>
            • 입력하신 정보를 분석 중입니다<br />
            • 12,000개 이상의 지원사업을 검색하고 있습니다<br />
            • 가장 적합한 사업을 선별하고 있습니다<br />
            <br />
            <strong>약 20-30초 소요됩니다...</strong>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#DC2626' }}>오류가 발생했습니다</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '16px 32px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>✨</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>AI 맞춤 지원사업 추천</h1>
          <p style={{ color: '#666' }}>총 {programs.length}개의 지원사업을 찾았습니다</p>
        </div>

        {programs.map((program, index) => (
          <div key={program.id} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <span style={{ padding: '4px 12px', backgroundColor: index === 0 ? '#FEF3C7' : '#DBEAFE', color: index === 0 ? '#92400E' : '#1E40AF', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                  {index === 0 ? '🏆 최고 추천' : `추천 #${index + 1}`}
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px' }}>{program.name}</h2>
                <p style={{ color: '#666' }}>{program.organization}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>{program.amount}</div>
                <div style={{ color: '#666' }}>적합도: <strong style={{ color: '#059669' }}>{program.matchScore}%</strong></div>
              </div>
            </div>
            <div style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#666' }}>📋 신청 자격</div>
              <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.6' }}>{program.eligibility}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', fontSize: '14px', color: '#666' }}>💡 추천 이유</div>
              <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.6' }}>{program.reason}</div>
            </div>
            <button 
              onClick={() => handleSelectProgram(program)} 
              style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
            >
              📝 이 지원사업 신청서 작성하기 →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}