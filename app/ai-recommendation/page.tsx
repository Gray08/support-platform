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

export default function AIRecommendation() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const analyze = async () => {
      try {
        setLoading(true);
        
        // 임시 데이터 (API 없이 테스트)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const dummyPrograms: Program[] = [
          {
            id: 'p1',
            name: '창업도약패키지',
            organization: '중소벤처기업부',
            amount: '최대 1억원',
            eligibility: '창업 7년 이내 기업',
            reason: '귀하의 사업 단계와 성장 계획에 가장 적합합니다',
            matchScore: 95
          },
          {
            id: 'p2',
            name: '청년창업사관학교',
            organization: '중소벤처기업부',
            amount: '최대 1억원',
            eligibility: '만 39세 이하 예비창업자',
            reason: '예비창업자를 위한 최적의 프로그램입니다',
            matchScore: 88
          },
          {
            id: 'p3',
            name: '초기창업패키지',
            organization: '창업진흥원',
            amount: '최대 1억원',
            eligibility: '창업 3년 이내',
            reason: '초기 단계 지원에 특화되어 있습니다',
            matchScore: 85
          }
        ];
        
        setPrograms(dummyPrograms);
      } catch (err) {
        console.error(err);
        setError('오류가 발생했습니다');
      } finally {
        setLoading(false);
      }
    };
    
    analyze();
  }, []);

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
          <p style={{ color: '#666', fontSize: '16px', marginTop: '30px' }}>약 20-30초 소요됩니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>오류가 발생했습니다</h1>
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
          <div key={program.id} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', marginBottom: '20px' }}>
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
                <div style={{ color: '#666' }}>적합도: <strong>{program.matchScore}%</strong></div>
              </div>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>📋 신청 자격</div>
              <div>{program.eligibility}</div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>💡 추천 이유</div>
              <div>{program.reason}</div>
            </div>
            <button onClick={() => handleSelectProgram(program)} style={{ width: '100%', padding: '14px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              📝 이 지원사업 신청서 작성하기 →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}