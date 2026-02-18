'use client';

import React, { useState, useEffect } from 'react';

interface ProgramData {
  id: string;
  name: string;
  analysisData: Record<string, unknown>;
  documents: Record<string, Record<string, unknown>>;
}

interface CompanyProfile {
  id: string;
  companyName: string;
  ceoName: string;
  industry: string;
  businessType: string;
  mainProducts: string;
  establishedYear: string;
  employeeCount: string;
  coreTechnologies: string;
  specialStatus: string[];
}

interface ApplicationFormData {
  companyId: string;
  projectTitle: string;
  projectSummary: string;
  projectBackground: string;
  projectGoals: string;
  expectedOutcomes: string;
  averageSales: string;
  supportAmount: string;
  selfFunding: string;
  specialFeatures: string;
}

export default function WriterPage() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [formData, setFormData] = useState<ApplicationFormData>({
    companyId: '',
    projectTitle: '',
    projectSummary: '',
    projectBackground: '',
    projectGoals: '',
    expectedOutcomes: '',
    averageSales: '',
    supportAmount: '',
    selfFunding: '',
    specialFeatures: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // 등록된 기업 목록 불러오기
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch('/api/company/profile');
        if (response.ok) {
          const data = await response.json();
          setCompanies(data.companies || []);
        }
      } catch (error) {
        console.error('기업 목록 로딩 실패:', error);
      }
    };

    loadCompanies();
  }, []);

  // 프로그램 목록 불러오기
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const response = await fetch('/api/programs/list');
        if (response.ok) {
          const data = await response.json();
          setPrograms(data.programs || []);
        }
      } catch (error) {
        console.error('프로그램 목록 로딩 실패:', error);
      }
    };

    loadPrograms();
  }, []);

  // 전체 사업계획서 생성
  const generateFullApplication = async () => {
    if (!selectedCompany || !selectedProgram) {
      alert('기업과 지원사업을 모두 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    try {
      const selectedProgramData = programs.find(p => p.id === selectedProgram);
      
      const response = await fetch('/api/universal/generate-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programData: selectedProgramData,
          companyId: selectedCompany
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // 생성된 내용으로 폼 데이터 업데이트
        setFormData(prev => ({
          ...prev,
          companyId: selectedCompany,
          ...data.applicationData
        }));
        
        alert(`🎉 ${data.message}`);
      } else {
        const errorData = await response.json();
        alert(`사업계획서 생성에 실패했습니다: ${errorData.error}`);
      }
    } catch (error) {
      console.error('사업계획서 생성 오류:', error);
      alert('사업계획서 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTextChange = (field: keyof ApplicationFormData) => 
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: event.target.value
      }));
    };

  const selectedCompanyInfo = companies.find(c => c.id === selectedCompany);
  const selectedProgramInfo = programs.find(p => p.id === selectedProgram);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            🤖 범용 AI 지원사업서 작성 플랫폼
          </h1>
          <p style={{ color: '#6b7280' }}>
            모든 업종, 모든 규모의 기업이 사용할 수 있는 맞춤형 사업계획서 작성 서비스입니다.
          </p>
        </div>

        {/* 기업 등록 버튼 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                🏢 기업 선택
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                등록된 기업: {companies.length}개
              </p>
            </div>
            <a 
              href="/company/register"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1rem'
              }}
            >
              + 새 기업 등록
            </a>
          </div>
        </div>

        {/* 기업 및 프로그램 선택 */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
            🎯 사업계획서 작성 설정
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* 기업 선택 */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                기업 선택 *
              </label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="">등록된 기업을 선택하세요</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.companyName} ({company.industry})
                  </option>
                ))}
              </select>
            </div>

            {/* 지원사업 선택 */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                지원사업 선택 *
              </label>
              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="">분석된 지원사업을 선택하세요</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 선택된 정보 표시 */}
          {(selectedCompanyInfo || selectedProgramInfo) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              {selectedCompanyInfo && (
                <div style={{ padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '6px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#059669' }}>
                    선택된 기업
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                    <strong>{selectedCompanyInfo.companyName}</strong><br/>
                    {selectedCompanyInfo.industry} | {selectedCompanyInfo.businessType}<br/>
                    설립: {selectedCompanyInfo.establishedYear}년 | 직원: {selectedCompanyInfo.employeeCount}
                  </p>
                </div>
              )}
              
              {selectedProgramInfo && (
                <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '6px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2563eb' }}>
                    선택된 지원사업
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#374151' }}>
                    {selectedProgramInfo.name}
                  </p>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={generateFullApplication}
            disabled={!selectedCompany || !selectedProgram || isGenerating}
            style={{
              width: '100%',
              padding: '1rem 1.5rem',
              backgroundColor: (selectedCompany && selectedProgram && !isGenerating) ? '#2563eb' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (selectedCompany && selectedProgram && !isGenerating) ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              fontSize: '1.1rem'
            }}
          >
            {isGenerating ? '🔄 AI 맞춤 사업계획서 생성 중...' : '🚀 AI 맞춤 사업계획서 생성'}
          </button>
        </div>

        {/* 생성된 사업계획서 표시 */}
        {formData.projectTitle && (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)', 
            padding: '2rem',
            marginBottom: '1.5rem'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#059669' }}>
              ✨ 생성된 사업계획서
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  사업명
                </label>
                <input
                  type="text"
                  value={formData.projectTitle}
                  onChange={handleTextChange('projectTitle')}
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
                  지원금액
                </label>
                <input
                  type="text"
                  value={formData.supportAmount}
                  onChange={handleTextChange('supportAmount')}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  사업 개요
                </label>
                <textarea
                  value={formData.projectSummary}
                  onChange={handleTextChange('projectSummary')}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  추진 배경
                </label>
                <textarea
                  value={formData.projectBackground}
                  onChange={handleTextChange('projectBackground')}
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {formData.projectTitle && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
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
              💾 사업계획서 저장
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
              📥 Word 문서 다운로드
            </button>
          </div>
        )}
      </div>
    </div>
  );
}