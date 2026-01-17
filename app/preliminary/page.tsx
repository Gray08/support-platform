'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Preliminary() {
  const router = useRouter();
  
  // 기본 정보
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [startupTiming, setStartupTiming] = useState('');
  const [industry, setIndustry] = useState('');
  const [region, setRegion] = useState('');
  
  // 🆕 창업 아이템 상세 (선택사항)
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemFeatures, setItemFeatures] = useState('');
  const [itemAdvantages, setItemAdvantages] = useState('');
  const [itemDifference, setItemDifference] = useState('');
  const [businessDirection, setBusinessDirection] = useState('');
  
  const [error, setError] = useState('');

  const handleNext = () => {
    if (!name || !phone || !startupTiming || !industry || !region) {
      setError('기본 정보(*)는 필수입니다!');
      return;
    }

    // 정보 저장
    localStorage.setItem('preliminaryInfo', JSON.stringify({
      name,
      phone,
      startupTiming,
      industry,
      region,
      itemName,
      itemDescription,
      itemFeatures,
      itemAdvantages,
      itemDifference,
      businessDirection,
      userType: 'preliminary'
    }));

    // 관심 분야 선택 페이지로 이동
    router.push('/field-selection');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚀</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>예비창업자 정보 입력</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>창업 준비를 위한 맞춤 지원사업을 찾아드립니다</p>
        </div>

        {/* 입력 폼 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          
          {/* 기본 정보 */}
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', paddingBottom: '15px', borderBottom: '2px solid #e5e7eb' }}>
            📋 기본 정보
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            
            {/* 이름 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>이름 *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            {/* 연락처 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>연락처 *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-1234-5678"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            {/* 창업 예정 시기 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>창업 예정 시기 *</label>
              <select
                value={startupTiming}
                onChange={(e) => setStartupTiming(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              >
                <option value="">선택하세요</option>
                <option value="3개월 이내">3개월 이내</option>
                <option value="6개월 이내">6개월 이내</option>
                <option value="1년 이내">1년 이내</option>
                <option value="아직 미정">아직 미정</option>
              </select>
            </div>

            {/* 창업 업종 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>창업 업종 *</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              >
                <option value="">선택하세요</option>
                <option value="온라인 쇼핑몰">온라인 쇼핑몰</option>
                <option value="음식점/카페">음식점/카페</option>
                <option value="IT 서비스">IT 서비스</option>
                <option value="제조업">제조업</option>
                <option value="디자인/크리에이티브">디자인/크리에이티브</option>
                <option value="교육/컨설팅">교육/컨설팅</option>
                <option value="뷰티/헬스케어">뷰티/헬스케어</option>
                <option value="기타">기타</option>
              </select>
            </div>

            {/* 창업 지역 */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>창업 예정 지역 *</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              >
                <option value="">선택하세요</option>
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
          </div>

          {/* 🆕 창업 아이템 상세 (선택사항) */}
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '40px', marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e5e7eb' }}>
            💡 창업 아이템 상세 <span style={{ fontSize: '16px', color: '#999', fontWeight: 'normal' }}>(선택사항)</span>
          </h2>

          <div style={{ backgroundColor: '#FEF3C7', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #FCD34D' }}>
            <p style={{ fontSize: '14px', color: '#92400E', margin: 0 }}>
              💡 아래 내용을 작성하시면 더 정확하고 맞춤형 지원사업을 추천받을 수 있습니다!
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 아이템명 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>창업 아이템명</label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="예) 반려동물 맞춤 사료 구독 서비스"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box' }}
              />
            </div>

            {/* 아이템 설명 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>아이템 설명</label>
              <textarea
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="어떤 제품/서비스인가요? 간단히 설명해주세요.&#10;예) 반려견의 건강 상태와 나이에 맞춘 맞춤형 사료를 정기 배송하는 구독 서비스입니다."
                rows={4}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            {/* 특징 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>주요 특징</label>
              <textarea
                value={itemFeatures}
                onChange={(e) => setItemFeatures(e.target.value)}
                placeholder="이 아이템만의 특별한 특징은 무엇인가요?&#10;예) AI 기반 반려견 건강 분석, 수의사 협업 레시피 개발, 친환경 포장재 사용"
                rows={3}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            {/* 장점 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>경쟁 우위 / 장점</label>
              <textarea
                value={itemAdvantages}
                onChange={(e) => setItemAdvantages(e.target.value)}
                placeholder="다른 제품/서비스보다 나은 점은 무엇인가요?&#10;예) 개별 맞춤형 제공, 합리적인 가격, 빠른 배송"
                rows={3}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            {/* 차별점 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>타사와의 차이점</label>
              <textarea
                value={itemDifference}
                onChange={(e) => setItemDifference(e.target.value)}
                placeholder="기존 경쟁사와 어떻게 다른가요?&#10;예) 기존 업체는 일반 사료만 판매하지만, 저희는 반려견 개별 데이터 기반으로 완전 맞춤형 제공"
                rows={3}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            {/* 사업 방향 */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>향후 사업 방향</label>
              <textarea
                value={businessDirection}
                onChange={(e) => setBusinessDirection(e.target.value)}
                placeholder="앞으로 어떻게 사업을 발전시킬 계획인가요?&#10;예) 1단계: 온라인 판매, 2단계: 오프라인 매장 확대, 3단계: 해외 진출"
                rows={3}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>
          </div>

          {/* 안내 박스 */}
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#DBEAFE', borderRadius: '8px', border: '1px solid #93C5FD' }}>
            <p style={{ color: '#1E40AF', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              💡 <strong>예비창업자 지원사업</strong><br />
              창업패키지, 청년창업사관학교, 예비창업자 교육 등<br />
              사업자등록 전에도 신청 가능한 다양한 지원사업이 있습니다!
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* 버튼 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginTop: '30px' }}>
            <button
              onClick={() => router.push('/dashboard')}
              style={{ padding: '16px', backgroundColor: 'white', color: '#666', border: '2px solid #ddd', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ← 뒤로가기
            </button>
            <button
              onClick={handleNext}
              style={{ padding: '16px', backgroundColor: '#059669', color: 'white', border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              다음 단계 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}