'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ExistingBusiness() {
  const router = useRouter();
  const [businessNumber, setBusinessNumber] = useState('');
  const [industry, setIndustry] = useState('');
  const [region, setRegion] = useState('');
  const [startDate, setStartDate] = useState('');
  const [employees, setEmployees] = useState('');
  const [businessDetail, setBusinessDetail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!businessNumber || !industry || !region || !startDate) {
      setError('모든 필수 항목을 입력해주세요!');
      return;
    }

    localStorage.setItem('existingBusinessInfo', JSON.stringify({
      businessNumber,
      industry,
      region,
      startDate,
      employees,
      businessDetail,
      userType: 'existing'
    }));

    router.push('/field-selection');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>💼</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>기존 사업자 정보 입력</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>사업에 맞는 맞춤 지원사업을 찾아드립니다</p>
        </div>

        {/* 입력 폼 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px' }}>사업자 정보</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>사업자등록번호 *</label>
              <input type="text" value={businessNumber} onChange={(e) => setBusinessNumber(e.target.value)} placeholder="123-45-67890" style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>업종 *</label>
              <select value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}>
                <option value="">선택하세요</option>
                <option value="음식점/카페">음식점/카페</option>
                <option value="소매/도소매">소매/도소매</option>
                <option value="제조업">제조업</option>
                <option value="IT/소프트웨어">IT/소프트웨어</option>
                <option value="서비스업">서비스업</option>
                <option value="건설/부동산">건설/부동산</option>
                <option value="기타">기타</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>사업 지역 *</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}>
              <option value="서울">서울</option>
              <option value="부산">부산</option>
              <option value="대구">대구</option>
              <option value="인천">인천</option>
              <option value="광주">광주</option>
              <option value="대전">대전</option>
              <option value="울산">울산</option>
              <option value="세종">세종</option>
              <option value="경기">경기</option>
              <option value="강원">강원</option>
              <option value="충북">충북</option>
              <option value="충남">충남</option>
              <option value="전북">전북</option>
              <option value="전남">전남</option>
              <option value="경북">경북</option>
              <option value="경남">경남</option>
              <option value="제주">제주</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>창업/개업 시기 *</label>
              <select value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}>
                <option value="">선택하세요</option>
                <option value="1년미만">1년 미만</option>
                <option value="1-3년">1-3년</option>
                <option value="3-7년">3-7년</option>
                <option value="7년이상">7년 이상</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>직원 수</label>
              <select value={employees} onChange={(e) => setEmployees(e.target.value)} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}>
                <option value="">선택하세요</option>
                <option value="1명">1명 (대표만)</option>
                <option value="2-5명">2-5명</option>
                <option value="6-10명">6-10명</option>
                <option value="11-20명">11-20명</option>
                <option value="20명이상">20명 이상</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>사업 내용 (선택)</label>
            <textarea value={businessDetail} onChange={(e) => setBusinessDetail(e.target.value)} placeholder="사업 내용을 간단히 설명해주세요" rows={4} style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>

          {error && <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '14px' }}>⚠️ {error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginTop: '30px' }}>
            <button onClick={() => router.push('/dashboard')} style={{ padding: '16px', backgroundColor: 'white', color: '#666', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
              ← 뒤로가기
            </button>
            <button onClick={handleSubmit} style={{ padding: '16px', backgroundColor: '#F59E0B', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
              다음 단계 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}