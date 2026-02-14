'use client';

import React, { useState } from 'react';

interface CompanyProfile {
  // 기본 정보
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
  
  // 업종 정보
  industry: string;
  businessType: string;
  mainProducts: string;
  
  // 재무 정보
  annualSales2022: string;
  annualSales2023: string;
  annualSales2024: string;
  
  // 기술력 및 특장점
  coreTechnologies: string;
  patents: string;
  certifications: string;
  majorClients: string;
  
  // 정부지원 이력
  previousSupports: string;
  
  // 우대조건
  specialStatus: string[];
}

const INDUSTRY_OPTIONS = [
  '제조업 - 기계/장비',
  '제조업 - 전자/IT',
  '제조업 - 화학/소재',
  '제조업 - 바이오/의료기기',
  '제조업 - 자동차/부품',
  '제조업 - 국방/항공',
  'IT/소프트웨어',
  '바이오/제약',
  '에너지/환경',
  '농업/식품',
  '문화/콘텐츠',
  '서비스업',
  '기타'
];

const BUSINESS_TYPE_OPTIONS = [
  '예비창업자',
  '창업기업 (7년 미만)',
  '중소기업',
  '중견기업',
  '소상공인',
  '협동조합',
  '사회적기업',
  '기타'
];

const SPECIAL_STATUS_OPTIONS = [
  '벤처기업',
  '이노비즈기업',
  '메인비즈기업',
  '여성기업',
  '청년기업',
  '사회적기업',
  '예비사회적기업',
  '장애인기업',
  '국가유공자기업',
  '협동조합',
  '소상공인',
  '농업회사법인',
  '강소기업',
  '글로벌전문기업',
  '수출유망중소기업'
];

export default function CompanyRegistrationPage() {
  const [profile, setProfile] = useState<CompanyProfile>({
    companyName: '',
    ceoName: '',
    businessNumber: '',
    establishedYear: '',
    employeeCount: '',
    address: '',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    industry: '',
    businessType: '',
    mainProducts: '',
    annualSales2022: '',
    annualSales2023: '',
    annualSales2024: '',
    coreTechnologies: '',
    patents: '',
    certifications: '',
    majorClients: '',
    previousSupports: '',
    specialStatus: []
  });

  const [currentStep, setCurrentStep] = useState(1);

  const handleInputChange = (field: keyof CompanyProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelectChange = (field: keyof CompanyProfile, value: string, checked: boolean) => {
    if (field === 'specialStatus') {
      setProfile(prev => ({
        ...prev,
        specialStatus: checked 
          ? [...prev.specialStatus, value]
          : prev.specialStatus.filter(item => item !== value)
      }));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const response = await fetch('/api/company/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        alert('🎉 기업 프로필이 성공적으로 등록되었습니다!');
        // 메인 작성 페이지로 이동
        window.location.href = '/writer';
      } else {
        alert('프로필 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const renderStep1 = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        📋 기본 정보
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            기업명 *
          </label>
          <input
            type="text"
            value={profile.companyName}
            onChange={(e) => handleInputChange('companyName', e.target.value)}
            placeholder="(주)테크놀로지"
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            대표자명 *
          </label>
          <input
            type="text"
            value={profile.ceoName}
            onChange={(e) => handleInputChange('ceoName', e.target.value)}
            placeholder="홍길동"
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            사업자등록번호 *
          </label>
          <input
            type="text"
            value={profile.businessNumber}
            onChange={(e) => handleInputChange('businessNumber', e.target.value)}
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

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            설립년도 *
          </label>
          <input
            type="text"
            value={profile.establishedYear}
            onChange={(e) => handleInputChange('establishedYear', e.target.value)}
            placeholder="2019"
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            직원 수 *
          </label>
          <input
            type="text"
            value={profile.employeeCount}
            onChange={(e) => handleInputChange('employeeCount', e.target.value)}
            placeholder="15명"
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            연락처 *
          </label>
          <input
            type="text"
            value={profile.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="02-123-4567"
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

      <div style={{ marginTop: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
          기업 주소 *
        </label>
        <input
          type="text"
          value={profile.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="서울특별시 강남구 테헤란로 123"
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
  );

  const renderStep2 = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        🏭 업종 및 사업 정보
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            업종 분류 *
          </label>
          <select
            value={profile.industry}
            onChange={(e) => handleInputChange('industry', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          >
            <option value="">업종을 선택하세요</option>
            {INDUSTRY_OPTIONS.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            기업 유형 *
          </label>
          <select
            value={profile.businessType}
            onChange={(e) => handleInputChange('businessType', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          >
            <option value="">기업 유형을 선택하세요</option>
            {BUSINESS_TYPE_OPTIONS.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
          주요 제품/서비스 *
        </label>
        <textarea
          value={profile.mainProducts}
          onChange={(e) => handleInputChange('mainProducts', e.target.value)}
          rows={3}
          placeholder="무인지상차량, 다단계 폴 시스템, 원격무기체계 등"
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
  );

  const renderStep3 = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        💰 재무 정보
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            2022년 매출액
          </label>
          <input
            type="text"
            value={profile.annualSales2022}
            onChange={(e) => handleInputChange('annualSales2022', e.target.value)}
            placeholder="8.29억원"
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            2023년 매출액
          </label>
          <input
            type="text"
            value={profile.annualSales2023}
            onChange={(e) => handleInputChange('annualSales2023', e.target.value)}
            placeholder="12.26억원"
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            2024년 매출액
          </label>
          <input
            type="text"
            value={profile.annualSales2024}
            onChange={(e) => handleInputChange('annualSales2024', e.target.value)}
            placeholder="8.8억원"
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
  );

  const renderStep4 = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        🔬 기술력 및 특장점
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            핵심 기술 및 역량
          </label>
          <textarea
            value={profile.coreTechnologies}
            onChange={(e) => handleInputChange('coreTechnologies', e.target.value)}
            rows={3}
            placeholder="AI 기반 자율주행, 다단계 폴 시스템, IoT 통합 제어 등"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              보유 특허 및 IP
            </label>
            <textarea
              value={profile.patents}
              onChange={(e) => handleInputChange('patents', e.target.value)}
              rows={2}
              placeholder="다단계 폴 시스템 특허 1건 등"
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

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
              보유 인증서
            </label>
            <textarea
              value={profile.certifications}
              onChange={(e) => handleInputChange('certifications', e.target.value)}
              rows={2}
              placeholder="ISO9001, 방산업체 등록 등"
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

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            주요 고객사 및 실적
          </label>
          <textarea
            value={profile.majorClients}
            onChange={(e) => handleInputChange('majorClients', e.target.value)}
            rows={2}
            placeholder="KORAIL, POSCO, 국방부, 인천시, 포항시 등"
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
  );

  const renderStep5 = () => (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem', marginBottom: '1.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
        🏆 우대조건 및 정부지원 이력
      </h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', color: '#374151' }}>
          해당하는 우대조건을 모두 선택하세요
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
          {SPECIAL_STATUS_OPTIONS.map(status => (
            <label key={status} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={profile.specialStatus.includes(status)}
                onChange={(e) => handleMultiSelectChange('specialStatus', status, e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <span style={{ fontSize: '0.875rem' }}>{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
          정부지원 수혜 이력
        </label>
        <textarea
          value={profile.previousSupports}
          onChange={(e) => handleInputChange('previousSupports', e.target.value)}
          rows={3}
          placeholder="2023년 기술개발지원사업 5천만원, 2024년 창업지원금 3천만원 등"
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
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', padding: '2rem 0' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            🏢 기업 정보 등록
          </h1>
          <p style={{ color: '#6b7280' }}>
            AI가 맞춤형 사업계획서를 작성할 수 있도록 기업 정보를 입력해주세요.
          </p>
        </div>

        {/* 진행단계 표시 */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          {[1, 2, 3, 4, 5].map(step => (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: currentStep >= step ? '#3b82f6' : '#e5e7eb',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {step}
              </div>
              {step < 5 && (
                <div style={{
                  width: '3rem',
                  height: '2px',
                  backgroundColor: currentStep > step ? '#3b82f6' : '#e5e7eb',
                  margin: '0 0.5rem'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* 단계별 폼 */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
        {currentStep === 5 && renderStep5()}

        {/* 네비게이션 버튼 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: currentStep === 1 ? '#9ca3af' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              fontSize: '1rem'
            }}
          >
            ← 이전
          </button>

          {currentStep < 5 ? (
            <button
              onClick={() => setCurrentStep(prev => Math.min(5, prev + 1))}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              다음 →
            </button>
          ) : (
            <button
              onClick={handleSaveProfile}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              🚀 등록 완료
            </button>
          )}
        </div>
      </div>
    </div>
  );
}