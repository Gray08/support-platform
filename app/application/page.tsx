'use client';

import { useState, useEffect, useCallback } from 'react';
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

export default function Application() {
  const router = useRouter();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState('');
  const [error, setError] = useState('');

  const generateApplication = useCallback(async () => {
    try {
      setLoading(true);

      // 저장된 정보 불러오기
      const programStr = localStorage.getItem('selectedProgram');
      if (!programStr) {
        router.push('/dashboard');
        return;
      }

      const program = JSON.parse(programStr) as Program;
      setSelectedProgram(program);

      const userType = localStorage.getItem('userType');
      const basicInfo = userType === 'preliminary'
        ? JSON.parse(localStorage.getItem('preliminaryInfo') || '{}') as BasicInfo
        : JSON.parse(localStorage.getItem('existingBusinessInfo') || '{}') as BasicInfo;

      const selectedFields = JSON.parse(localStorage.getItem('selectedFields') || '[]') as string[];
      const fieldDetails = JSON.parse(localStorage.getItem('fieldDetails') || '{}') as FieldDetails;
      const additionalNotes = localStorage.getItem('additionalNotes') || '';

      // AI 프롬프트 생성
      const prompt = `당신은 정부 지원사업 신청서 작성 전문가입니다. 다음 정보를 바탕으로 전문적인 신청서를 작성해주세요.

## 지원사업 정보
- 사업명: ${program.name}
- 주관기관: ${program.organization}
- 지원금액: ${program.amount}

## 신청자 정보
- 사용자 유형: ${userType === 'preliminary' ? '예비창업자' : '기존 사업자'}
- 기본 정보: ${JSON.stringify(basicInfo, null, 2)}
- 관심 분야: ${selectedFields.join(', ')}
- 상세 정보: ${JSON.stringify(fieldDetails, null, 2)}
- 추가 메모: ${additionalNotes}

## 작성 요청사항

다음 구조로 전문적인 신청서를 작성해주세요:

### 1. 지원동기 및 목표
- 왜 이 사업에 지원하는지
- 이 지원사업을 통해 달성하고자 하는 목표

### 2. 사업 개요
- 현재 사업 현황
- 주요 제품/서비스
- 사업의 강점

### 3. 지원 필요성
- 현재 당면한 과제
- 이 지원사업이 필요한 구체적 이유
- 예상되는 효과

### 4. 활용 계획
- 지원금 사용 계획
- 구체적인 추진 일정
- 예상 성과

### 5. 향후 계획
- 지원사업 종료 후 계획
- 지속가능성

각 섹션을 명확하게 구분하고, 전문적이면서도 진솔하게 작성해주세요.
각 섹션은 최소 200자 이상으로 작성해주세요.`;

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
        throw new Error('신청서 작성 실패');
      }

      const data = await response.json();
      const result = data.content[0].text;

      setApplication(result);

    } catch (err) {
      console.error('Error:', err);
      setError('신청서 작성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    generateApplication();
  }, [generateApplication]);

  const handleDownload = () => {
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${selectedProgram?.name} 신청서</title>
  <style>
    body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.8; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { color: #333; border-bottom: 3px solid #059669; padding-bottom: 10px; }
    h2 { color: #059669; margin-top: 30px; }
    h3 { color: #666; margin-top: 20px; }
    p { color: #333; margin: 10px 0; }
    .header { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
    .section { margin: 30px 0; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${selectedProgram?.name}</h1>
    <p><strong>주관기관:</strong> ${selectedProgram?.organization}</p>
    <p><strong>지원금액:</strong> ${selectedProgram?.amount}</p>
    <p><strong>작성일:</strong> ${new Date().toLocaleDateString('ko-KR')}</p>
  </div>
  <div class="content">
    ${application.split('\n').map(line => {
      if (line.startsWith('###')) {
        return `<h2>${line.replace(/###/g, '').trim()}</h2>`;
      } else if (line.startsWith('##')) {
        return `<h3>${line.replace(/##/g, '').trim()}</h3>`;
      } else if (line.trim()) {
        return `<p>${line}</p>`;
      }
      return '';
    }).join('\n')}
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedProgram?.name}_신청서_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(application);
    alert('클립보드에 복사되었습니다!');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '600px' }}>
          <div style={{ fontSize: '64px', marginBottom: '30px' }}>📝</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>AI가 신청서를 작성하고 있습니다</h1>

          <div style={{ width: '80px', height: '80px', border: '6px solid #f3f4f6', borderTop: '6px solid #059669', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '30px auto' }} />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>

          <p style={{ color: '#666', fontSize: '16px', lineHeight: '1.8', marginTop: '30px' }}>
            • 입력하신 정보를 분석하고 있습니다<br />
            • 지원사업 요구사항을 확인하고 있습니다<br />
            • 전문적인 신청서를 작성하고 있습니다<br />
            <br />
            <strong>약 30초 소요됩니다...</strong>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#DC2626' }}>오류가 발생했습니다</h1>
            <p style={{ color: '#666', marginBottom: '30px' }}>{error}</p>
            <button
              onClick={() => generateApplication()}
              style={{ padding: '16px 32px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* 헤더 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <span style={{ display: 'inline-block', padding: '4px 12px', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginBottom: '10px' }}>
                ✅ 작성 완료
              </span>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>{selectedProgram?.name}</h1>
              <p style={{ color: '#666', fontSize: '16px' }}>{selectedProgram?.organization}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                {selectedProgram?.amount}
              </div>
            </div>
          </div>
        </div>

        {/* 신청서 미리보기 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
            📄 신청서 내용
          </h2>

          <div style={{ lineHeight: '1.8', color: '#333', whiteSpace: 'pre-wrap' }}>
            {application.split('\n').map((line, index) => {
              if (line.startsWith('###')) {
                return <h3 key={index} style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '30px', marginBottom: '15px', color: '#059669' }}>{line.replace(/###/g, '').trim()}</h3>;
              } else if (line.startsWith('##')) {
                return <h4 key={index} style={{ fontSize: '18px', fontWeight: 'bold', marginTop: '20px', marginBottom: '10px', color: '#666' }}>{line.replace(/##/g, '').trim()}</h4>;
              } else if (line.trim()) {
                return <p key={index} style={{ marginBottom: '10px' }}>{line}</p>;
              }
              return <br key={index} />;
            })}
          </div>
        </div>

        {/* 버튼 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '30px' }}>
          <button
            onClick={() => router.push('/ai-recommendation')}
            style={{ padding: '16px', backgroundColor: 'white', color: '#666', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            ← 다른 사업 보기
          </button>
          <button
            onClick={handleCopy}
            style={{ padding: '16px', backgroundColor: '#DBEAFE', color: '#1E40AF', border: '2px solid #93C5FD', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📋 복사하기
          </button>
          <button
            onClick={handleDownload}
            style={{ padding: '16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            📥 다운로드
          </button>
        </div>

        {/* 안내 */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.8' }}>
            💡 <strong>작성된 신청서를 확인하고 수정하세요!</strong><br />
            AI가 작성한 내용을 기반으로 필요한 부분을 수정하여 사용하시면 됩니다.<br />
            실제 신청 시 각 기관의 양식에 맞춰 제출해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}