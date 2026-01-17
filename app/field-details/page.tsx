'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Question = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'radio' | 'checkbox' | 'textarea';
  required: boolean;
  options?: string[];
  aiHelp?: boolean;
};

type FieldConfig = {
  icon: string;
  name: string;
  questions: Question[];
};

const FIELD_QUESTIONS: Record<string, FieldConfig> = {
  export: {
    icon: '🌍',
    name: '수출 지원',
    questions: [
      {
        id: 'target_country',
        label: '수출 희망 국가',
        type: 'select',
        required: true,
        options: ['미국', '중국', '일본', '유럽', '동남아', '중동', '기타']
      },
      {
        id: 'export_status',
        label: '현재 수출 상태',
        type: 'radio',
        required: true,
        options: ['내수기업 (수출 경험 없음)', '수출 초보 (1-3년)', '수출 강소 (3년 이상)']
      },
      {
        id: 'export_amount_2023',
        label: '2023년 수출액 (만원)',
        type: 'number',
        required: false
      },
      {
        id: 'export_amount_2024',
        label: '2024년 수출액 (만원)',
        type: 'number',
        required: false
      },
      {
        id: 'reason',
        label: '해당 국가 선택 이유',
        type: 'textarea',
        required: true,
        aiHelp: true
      }
    ]
  },
  manufacturing: {
    icon: '🏭',
    name: '제조/생산 지원',
    questions: [
      {
        id: 'factory',
        label: '공장 보유 여부',
        type: 'radio',
        required: true,
        options: ['자체 공장 보유', '공유 공장 사용', '외주 생산', '없음']
      },
      {
        id: 'production_type',
        label: '생산 방식',
        type: 'radio',
        required: true,
        options: ['직접 생산', '외주 생산', '혼합']
      },
      {
        id: 'production_range',
        label: '생산 범위 (중복 선택 가능)',
        type: 'checkbox',
        required: true,
        options: ['기획', '설계', '제조', '조립', '포장', '배송']
      },
      {
        id: 'production_detail',
        label: '생산 시설 및 역량 설명',
        type: 'textarea',
        required: true,
        aiHelp: true
      }
    ]
  },
  design: {
    icon: '🎨',
    name: '디자인 개발',
    questions: [
      {
        id: 'design_type',
        label: '필요한 디자인 종류 (중복 선택)',
        type: 'checkbox',
        required: true,
        options: ['제품 디자인', 'BI/CI', '패키지 디자인', 'UI/UX']
      },
      {
        id: 'design_purpose',
        label: '디자인 개발 목적',
        type: 'textarea',
        required: true,
        aiHelp: true
      }
    ]
  },
  digital: {
    icon: '💻',
    name: '디지털 마케팅',
    questions: [
      {
        id: 'digital_type',
        label: '필요한 서비스 (중복 선택)',
        type: 'checkbox',
        required: true,
        options: ['홈페이지 제작', '영상 제작', 'SNS 마케팅', '온라인 광고']
      },
      {
        id: 'current_status',
        label: '현재 디지털 마케팅 현황',
        type: 'textarea',
        required: true
      }
    ]
  },
  rnd: {
    icon: '🔬',
    name: 'R&D/기술개발',
    questions: [
      {
        id: 'research_field',
        label: '연구개발 분야',
        type: 'text',
        required: true
      },
      {
        id: 'patent_status',
        label: '특허 보유 현황',
        type: 'radio',
        required: true,
        options: ['보유', '출원 중', '없음']
      },
      {
        id: 'research_detail',
        label: '연구개발 내용',
        type: 'textarea',
        required: true,
        aiHelp: true
      }
    ]
  },
  startup: {
    icon: '🚀',
    name: '예비창업',
    questions: [
      {
        id: 'business_model',
        label: '사업 모델',
        type: 'textarea',
        required: true,
        aiHelp: true
      },
      {
        id: 'team_status',
        label: '팀 구성 현황',
        type: 'text',
        required: false
      }
    ]
  },
  investment: {
    icon: '💰',
    name: '투자유치',
    questions: [
      {
        id: 'investment_stage',
        label: '투자 단계',
        type: 'radio',
        required: true,
        options: ['시드', '시리즈 A', '시리즈 B', '시리즈 C 이상']
      },
      {
        id: 'investment_amount',
        label: '희망 투자 금액 (만원)',
        type: 'number',
        required: true
      },
      {
        id: 'investment_purpose',
        label: '투자금 사용 목적',
        type: 'textarea',
        required: true
      }
    ]
  },
  sales: {
    icon: '📢',
    name: '판로개척/마케팅',
    questions: [
      {
        id: 'target_market',
        label: '타겟 시장',
        type: 'text',
        required: true
      },
      {
        id: 'marketing_channel',
        label: '원하는 마케팅 채널',
        type: 'checkbox',
        required: true,
        options: ['온라인', '오프라인', '전시회', '박람회', '유통']
      },
      {
        id: 'marketing_plan',
        label: '마케팅 계획',
        type: 'textarea',
        required: true,
        aiHelp: true
      }
    ]
  }
};

export default function FieldDetails() {
  const router = useRouter();
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [error, setError] = useState('');

   useEffect(() => {
    const loadFields = () => {
        const fields = localStorage.getItem('selectedFields');
        if (fields) {
        const parsedFields = JSON.parse(fields) as string[];
        if (parsedFields.length > 0) {
            setSelectedFields(parsedFields);
        } else {
            router.push('/field-selection');
        }
        } else {
        router.push('/field-selection');
        }
    };

    loadFields();
    }, [router]);

  if (selectedFields.length === 0) {
    return <div>로딩 중...</div>;
  }

  const currentField = selectedFields[currentFieldIndex];
  const fieldConfig = FIELD_QUESTIONS[currentField];

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setAnswers({
      ...answers,
      [`${currentField}_${questionId}`]: value
    });
    setError('');
  };

  const handleNext = () => {
    const requiredQuestions = fieldConfig.questions.filter(q => q.required);
    const missingAnswers = requiredQuestions.filter(q => 
      !answers[`${currentField}_${q.id}`] || 
      (Array.isArray(answers[`${currentField}_${q.id}`]) && (answers[`${currentField}_${q.id}`] as string[]).length === 0)
    );

    if (missingAnswers.length > 0) {
      setError('모든 필수 항목을 입력해주세요!');
      return;
    }

    if (currentFieldIndex < selectedFields.length - 1) {
      setCurrentFieldIndex(currentFieldIndex + 1);
      setError('');
    } else {
      localStorage.setItem('fieldDetails', JSON.stringify(answers));
      router.push('/file-upload');
    }
  };

  const handleBack = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    } else {
      router.push('/field-selection');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>{fieldConfig.icon}</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>{fieldConfig.name} 상세 정보</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>
            {currentFieldIndex + 1} / {selectedFields.length} 단계
          </p>
        </div>

        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {fieldConfig.questions.map((question) => (
            <div key={question.id} style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                {question.label} {question.required && '*'}
              </label>

              {question.type === 'text' && (
                <input
                  type="text"
                  value={(answers[`${currentField}_${question.id}`] as string) || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                />
              )}

              {question.type === 'number' && (
                <input
                  type="number"
                  value={(answers[`${currentField}_${question.id}`] as number) || ''}
                  onChange={(e) => handleAnswerChange(question.id, parseInt(e.target.value) || 0)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                />
              )}

              {question.type === 'select' && (
                <select
                  value={(answers[`${currentField}_${question.id}`] as string) || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
                >
                  <option value="">선택하세요</option>
                  {question.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {question.type === 'radio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {question.options?.map((opt) => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name={`${currentField}_${question.id}`}
                        value={opt}
                        checked={answers[`${currentField}_${question.id}`] === opt}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'checkbox' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {question.options?.map((opt) => (
                    <label key={opt} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        value={opt}
                        checked={((answers[`${currentField}_${question.id}`] as string[]) || []).includes(opt)}
                        onChange={(e) => {
                          const current = (answers[`${currentField}_${question.id}`] as string[]) || [];
                          const newValue = e.target.checked
                            ? [...current, opt]
                            : current.filter(v => v !== opt);
                          handleAnswerChange(question.id, newValue);
                        }}
                        style={{ marginRight: '8px' }}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              )}

              {question.type === 'textarea' && (
                <>
                  <textarea
                    value={(answers[`${currentField}_${question.id}`] as string) || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    rows={5}
                    style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' }}
                  />
                  {question.aiHelp && (
                    <button
                      onClick={() => alert('AI 작성 도움 기능은 곧 추가됩니다!')}
                      style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#DBEAFE', color: '#1E40AF', border: '1px solid #93C5FD', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
                    >
                      💡 AI 작성 도움
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          {error && (
            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginTop: '30px' }}>
            <button
              onClick={handleBack}
              style={{ padding: '16px', backgroundColor: 'white', color: '#666', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ← 뒤로
            </button>
            <button
              onClick={handleNext}
              style={{ padding: '16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {currentFieldIndex < selectedFields.length - 1 ? '다음 분야 →' : '완료 & 다음 단계 →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}