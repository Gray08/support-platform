'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Field = {
  id: string;
  name: string;
  icon: string;
  description: string;
};

const FIELDS: Field[] = [
  { id: 'export', name: '수출 지원', icon: '🌍', description: '해외 진출 및 수출 확대' },
  { id: 'manufacturing', name: '제조/생산 지원', icon: '🏭', description: '생산시설 및 제조 역량' },
  { id: 'design', name: '디자인 개발', icon: '🎨', description: '제품/BI/CI 디자인' },
  { id: 'digital', name: '디지털 마케팅', icon: '💻', description: '홈페이지/영상/SNS' },
  { id: 'rnd', name: 'R&D/기술개발', icon: '🔬', description: '연구개발 및 기술혁신' },
  { id: 'startup', name: '예비창업', icon: '🚀', description: '창업 준비 및 초기 지원' },
  { id: 'investment', name: '투자유치', icon: '💰', description: '투자 및 자금 조달' },
  { id: 'sales', name: '판로개척/마케팅', icon: '📢', description: '시장 진출 및 홍보' }
];

export default function FieldSelection() {
  const router = useRouter();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleFieldToggle = (fieldId: string) => {
    if (selectedFields.includes(fieldId)) {
      setSelectedFields(selectedFields.filter(id => id !== fieldId));
      setError('');
    } else {
      if (selectedFields.length >= 3) {
        setError('최대 3개까지만 선택할 수 있습니다!');
        return;
      }
      setSelectedFields([...selectedFields, fieldId]);
      setError('');
    }
  };

  const handleNext = () => {
    if (selectedFields.length === 0) {
      setError('최소 1개 이상 선택해주세요!');
      return;
    }

    localStorage.setItem('selectedFields', JSON.stringify(selectedFields));
    
    // 다음 페이지로 이동
    router.push('/field-details');
    };

  const handleBack = () => {
    const userType = localStorage.getItem('userType');
    if (userType === 'preliminary') {
      router.push('/preliminary');
    } else {
      router.push('/existing-business');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎯</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>관심 분야를 선택하세요</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>최대 3개까지 선택 가능합니다</p>
          <div style={{ marginTop: '15px', fontSize: '18px', fontWeight: 'bold', color: '#059669' }}>
            선택됨: {selectedFields.length}/3
          </div>
        </div>

        {/* 분야 선택 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>지원받고 싶은 분야</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {FIELDS.map(field => {
              const isSelected = selectedFields.includes(field.id);
              return (
                <button
                  key={field.id}
                  onClick={() => handleFieldToggle(field.id)}
                  style={{
                    padding: '20px',
                    border: isSelected ? '3px solid #059669' : '2px solid #ddd',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#ECFDF5' : 'white',
                    textAlign: 'left',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '32px', marginRight: '12px' }}>{field.icon}</span>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                        {isSelected && '✓ '}{field.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        {field.description}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* 안내 박스 */}
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FCD34D' }}>
            <p style={{ color: '#92400E', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              💡 <strong>선택한 분야에 맞는 지원사업을 추천해드립니다!</strong><br />
              각 분야별로 상세 정보를 입력하는 페이지로 이동합니다.
            </p>
          </div>

          {/* 버튼 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginTop: '30px' }}>
            <button
              onClick={handleBack}
              style={{ padding: '16px', backgroundColor: 'white', color: '#666', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ← 뒤로가기
            </button>
            <button
              onClick={handleNext}
              disabled={selectedFields.length === 0}
              style={{ 
                padding: '16px', 
                backgroundColor: selectedFields.length === 0 ? '#ccc' : '#059669', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '18px', 
                fontWeight: 'bold', 
                cursor: selectedFields.length === 0 ? 'not-allowed' : 'pointer' 
              }}
            >
              다음 단계 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}