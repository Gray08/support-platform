/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Result() {
  const router = useRouter();
  const [application, setApplication] = useState('');
  const [program, setProgram] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const savedApplication = localStorage.getItem('generatedApplication');
    const savedProgram = localStorage.getItem('selectedProgram');
    
    if (savedApplication) setApplication(savedApplication);
    if (savedProgram) setProgram(JSON.parse(savedProgram));
  }, []);

  const handleDownloadDOCX = async () => {
    setDownloading(true);
    
    try {
      const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${program?.name || '지원사업'} 신청서</title>
    <style>
        body { font-family: 'Malgun Gothic', sans-serif; line-height: 1.8; padding: 40px; }
        h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
        h2 { color: #059669; margin-top: 30px; }
        p { margin: 15px 0; }
    </style>
</head>
<body>
    <h1>${program?.name || '정부 지원사업'} 신청서</h1>
    <hr>
    <div style="white-space: pre-wrap;">${application}</div>
    <hr>
    <p style="margin-top: 40px; text-align: center; color: #666;">
        본 신청서는 AI로 자동 생성되었습니다.<br>
        실제 제출 전 내용을 검토하고 수정해주세요.
    </p>
</body>
</html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${program?.name || '신청서'}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('✅ 신청서가 HTML 파일로 다운로드되었습니다!\n\n💡 팁: Microsoft Word나 한글(HWP)에서 이 파일을 열어서 DOCX/HWP로 저장할 수 있습니다.');
      
    } catch (error) {
      console.error('Download error:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(application).then(() => {
      alert('✅ 신청서가 클립보드에 복사되었습니다!\n\n이제 Word나 한글에 붙여넣기 하실 수 있습니다.');
    }).catch(() => {
      alert('복사에 실패했습니다.');
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '50px 20px'
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: '#D1FAE5',
          padding: '30px',
          borderRadius: '12px',
          marginBottom: '30px',
          textAlign: 'center',
          border: '2px solid #059669'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '15px'
          }}>
            🎉
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#059669',
            marginBottom: '10px'
          }}>
            신청서 작성 완료!
          </h1>
          <p style={{
            color: '#065f46',
            fontSize: '16px'
          }}>
            AI가 전문적인 신청서를 작성했습니다. 이제 다운로드하거나 수정하실 수 있습니다.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px',
          marginBottom: '30px'
        }}>
          <button
            onClick={handleDownloadDOCX}
            disabled={downloading}
            style={{
              padding: '16px',
              backgroundColor: '#F59E0B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: downloading ? 'not-allowed' : 'pointer',
              opacity: downloading ? 0.6 : 1
            }}
          >
            {downloading ? '⏳ 준비 중...' : '📥 HTML 다운로드'}
          </button>

          <button
            onClick={handleCopyToClipboard}
            style={{
              padding: '16px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📋 클립보드 복사
          </button>

          <button
            onClick={handlePrint}
            style={{
              padding: '16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🖨️ 인쇄하기
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '50px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          marginBottom: '30px'
        }}>
          {program && (
            <div style={{
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '20px',
              marginBottom: '30px'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                marginBottom: '10px'
              }}>
                {program.name}
              </h2>
              <div style={{
                fontSize: '20px',
                color: '#F59E0B',
                fontWeight: 'bold'
              }}>
                지원금액: {program.amount}
              </div>
            </div>
          )}

          <div style={{
            whiteSpace: 'pre-wrap',
            lineHeight: '2',
            fontSize: '15px',
            color: '#333'
          }}>
            {application || '신청서 내용이 없습니다.'}
          </div>

          <div style={{
            marginTop: '40px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb',
            fontSize: '14px',
            color: '#999',
            textAlign: 'center'
          }}>
            본 신청서는 AI로 자동 생성되었습니다.<br />
            실제 제출 전 내용을 검토하고 필요에 따라 수정해주세요.
          </div>
        </div>

        <div style={{
          backgroundColor: '#FEF3C7',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #FCD34D'
        }}>
          <div style={{
            fontWeight: 'bold',
            marginBottom: '10px',
            color: '#92400E'
          }}>
            💡 다음 단계
          </div>
          <ol style={{
            margin: '10px 0',
            paddingLeft: '20px',
            color: '#78350F',
            lineHeight: '1.8'
          }}>
            <li>다운로드한 파일을 Word나 한글(HWP)에서 열기</li>
            <li>내용 검토 및 필요시 수정</li>
            <li>필요한 첨부 서류 준비 (사업자등록증, 재무제표 등)</li>
            <li>해당 지원사업 담당 기관에 제출</li>
          </ol>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px'
        }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '16px',
              backgroundColor: 'white',
              color: '#666',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🏠 대시보드로 돌아가기
          </button>
          <button
            onClick={() => router.push('/application')}
            style={{
              padding: '16px',
              backgroundColor: '#6B7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📝 신청서 다시 작성하기
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body { padding: 0; background: white; }
          button { display: none !important; }
        }
      `}</style>
    </div>
  );
}