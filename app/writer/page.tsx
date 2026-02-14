'use client';

import React, { useState, useEffect } from 'react';

interface ProgramData {
  id: string;
  name: string;
  analysisData: Record<string, unknown>;
  documents: Record<string, Record<string, unknown>>;
}

interface ApplicationFormData {
  // 기업 정보
  companyName: string;
  ceoName: string;
  businessNumber: string;
  address: string;
  contactPerson: string;
  phone: string;
  email: string;
  
  // 사업 내용
  projectTitle: string;
  projectSummary: string;
  projectBackground: string;
  projectGoals: string;
  expectedOutcomes: string;
  
  // 재무 정보
  averageSales: string;
  supportAmount: string;
  selfFunding: string;
  
  // 추가 정보
  previousSupport: string;
  specialFeatures: string;
}

// Next.js App Router에서 요구하는 방식으로 export
export default function WriterPage() {
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [formData, setFormData] = useState<ApplicationFormData>({
    companyName: '한시스템 주식회사',
    ceoName: '유한종',
    businessNumber: '',
    address: '경상북도 포항시',
    contactPerson: '장연수',
    phone: '010-3639-7607',
    email: '',
    projectTitle: '',
    projectSummary: '',
    projectBackground: '',
    projectGoals: '',
    expectedOutcomes: '',
    averageSales: '',
    supportAmount: '',
    selfFunding: '',
    previousSupport: '',
    specialFeatures: ''
  });
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // 프로그램 목록 불러오기
  useEffect(() => {
    const loadPrograms = async (): Promise<void> => {
      try {
        const response = await fetch('/api/programs/list');
        if (response.ok) {
          const data: { programs: ProgramData[] } = await response.json();
          setPrograms(data.programs || []);
        }
      } catch (error) {
        console.error('프로그램 목록 로딩 실패:', error);
      }
    };

    loadPrograms();
  }, []);

  // AI 추천 텍스트 생성
  const generateAISuggestion = async (field: string): Promise<void> => {
    if (!selectedProgram) {
      alert('먼저 지원사업을 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedProgramData = programs.find((p: ProgramData) => p.id === selectedProgram);
      
      const response = await fetch('/api/programs/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programData: selectedProgramData,
          field: field,
          currentFormData: formData
        })
      });

      if (response.ok) {
        const data: { suggestion: string } = await response.json();
        setAiSuggestions(prev => ({
          ...prev,
          [field]: data.suggestion
        }));
      } else {
        alert('AI 추천 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('AI 추천 생성 오류:', error);
      alert('AI 추천 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 전체 사업계획서 생성
  const generateFullApplication = async (): Promise<void> => {
    if (!selectedProgram) {
      alert('먼저 지원사업을 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedProgramData = programs.find((p: ProgramData) => p.id === selectedProgram);
      
      const response = await fetch('/api/programs/generate-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programData: selectedProgramData,
          companyInfo: {
            companyName: formData.companyName,
            ceoName: formData.ceoName,
            businessNumber: formData.businessNumber,
            address: formData.address
          }
        })
      });

      if (response.ok) {
        const data: { applicationData: Partial<ApplicationFormData> } = await response.json();
        // 생성된 내용으로 폼 데이터 업데이트
        setFormData(prev => ({
          ...prev,
          ...data.applicationData
        }));
        alert('🎉 AI가 사업계획서를 생성했습니다!');
      } else {
        alert('사업계획서 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('사업계획서 생성 오류:', error);
      alert('사업계획서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 폼 데이터 변경 핸들러
  const handleInputChange = (field: keyof ApplicationFormData, value: string): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // AI 추천 적용
  const applySuggestion = (field: string): void => {
    const suggestion = aiSuggestions[field];
    if (suggestion) {
      handleInputChange(field as keyof ApplicationFormData, suggestion);
      setAiSuggestions(prev => {
        const newSuggestions = { ...prev };
        delete newSuggestions[field];
        return newSuggestions;
      });
    }
  };

  // 선택 변경 핸들러
  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedProgram(event.target.value);
  };

  // 텍스트 입력 핸들러
  const handleTextChange = (field: keyof ApplicationFormData) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
      handleInputChange(field, event.target.value);
    };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            🤖 AI 지원사업서 작성
          </h1>
          <p style={{ color: '#6b7280' }}>
            분석된 지원사업 정보를 바탕으로 AI가 맞춤형 사업계획서를 작성해드립니다.
          </p>
        </div>

        {/* 프로그램 선택 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
            📄 지원사업 선택
          </h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedProgram}
              onChange={handleSelectChange}
              style={{
                flex: '1',
                minWidth: '300px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            >
              <option value="">분석된 지원사업을 선택하세요</option>
              {programs.map((program: ProgramData) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
            <button 
              onClick={generateFullApplication}
              disabled={!selectedProgram || isGenerating}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: selectedProgram && !isGenerating ? '#2563eb' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: selectedProgram && !isGenerating ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              {isGenerating ? '생성 중...' : '🚀 전체 사업계획서 생성'}
            </button>
          </div>
          
          {selectedProgram && (
            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
              <span style={{ 
                backgroundColor: '#e5e7eb', 
                color: '#374151', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                선택된 사업
              </span>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                {programs.find((p: ProgramData) => p.id === selectedProgram)?.name}
              </p>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
          {/* 기업 정보 섹션 */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              🏢 기업 정보
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  기업명 *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={handleTextChange('companyName')}
                  placeholder="한시스템 주식회사"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  대표자명 *
                </label>
                <input
                  type="text"
                  value={formData.ceoName}
                  onChange={handleTextChange('ceoName')}
                  placeholder="유한종"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  사업자등록번호 *
                </label>
                <input
                  type="text"
                  value={formData.businessNumber}
                  onChange={handleTextChange('businessNumber')}
                  placeholder="123-45-67890"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>

          {/* 사업 내용 섹션 */}
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
              📋 사업 내용
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: '500' }}>사업명 *</label>
                  <button
                    onClick={() => generateAISuggestion('projectTitle')}
                    disabled={isGenerating}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    💡 AI 추천
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={handleTextChange('projectTitle')}
                  placeholder="AI가 추천하는 사업명을 확인하세요"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
                {aiSuggestions.projectTitle && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.75rem', 
                    backgroundColor: '#eff6ff', 
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px' 
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#1d4ed8', marginBottom: '0.5rem' }}>💡 AI 추천:</p>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>{aiSuggestions.projectTitle}</p>
                    <button
                      onClick={() => applySuggestion('projectTitle')}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      ✅ 적용
                    </button>
                  </div>
                )}
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontWeight: '500' }}>사업 개요 *</label>
                  <button
                    onClick={() => generateAISuggestion('projectSummary')}
                    disabled={isGenerating}
                    style={{
                      padding: '0.25rem 0.75rem',
                      backgroundColor: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    💡 AI 추천
                  </button>
                </div>
                <textarea
                  value={formData.projectSummary}
                  onChange={handleTextChange('projectSummary')}
                  rows={4}
                  placeholder="사업의 핵심 내용을 간략히 설명하세요"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
                {aiSuggestions.projectSummary && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.75rem', 
                    backgroundColor: '#eff6ff', 
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px' 
                  }}>
                    <p style={{ fontSize: '0.875rem', color: '#1d4ed8', marginBottom: '0.5rem' }}>💡 AI 추천:</p>
                    <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
                      {aiSuggestions.projectSummary}
                    </p>
                    <button
                      onClick={() => applySuggestion('projectSummary')}
                      style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.875rem'
                      }}
                    >
                      ✅ 적용
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button 
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            💾 임시저장
          </button>
          <button 
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            📥 사업계획서 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}