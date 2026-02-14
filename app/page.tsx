'use client';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      
      {/* 네비게이션 */}
      <nav style={{ 
        padding: '20px 40px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}>
          THE FUND
        </div>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#000000',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
        >
          시작하기
        </button>
      </nav>

      {/* 히어로 섹션 */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: '120px 40px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          fontSize: '72px', 
          fontWeight: 'bold', 
          marginBottom: '30px',
          lineHeight: '1.2',
          letterSpacing: '-2px'
        }}>
          정부 지원사업,<br />
          <span style={{ color: '#059669' }}>AI가 찾아드립니다</span>
        </h1>
        
        <p style={{ 
          fontSize: '24px', 
          color: '#666',
          marginBottom: '50px',
          lineHeight: '1.6'
        }}>
          12,000개 이상의 지원사업 중<br />
          당신의 사업에 딱 맞는 프로그램을 추천하고<br />
          신청서까지 자동으로 작성해드립니다
        </p>

        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '20px 40px',
              backgroundColor: '#000000',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#333333';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#000000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            무료로 시작하기 →
          </button>
        </div>

        <p style={{ 
          marginTop: '20px', 
          fontSize: '14px', 
          color: '#999'
        }}>
          신용카드 불필요 · 5분이면 완료
        </p>
      </section>

      {/* 특징 섹션 */}
      <section style={{ 
        backgroundColor: '#f9fafb',
        padding: '100px 40px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            textAlign: 'center',
            marginBottom: '80px'
          }}>
            왜 THE FUND인가요?
          </h2>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '40px'
          }}>
            {/* 특징 1 */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
                AI 맞춤 추천
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                Claude Sonnet 4 기반<br />
                사업에 딱 맞는<br />
                지원사업을 찾아드립니다
              </p>
            </div>

            {/* 특징 2 */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
                5분 완성
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                복잡한 신청서를<br />
                AI가 자동으로 작성<br />
                바로 다운로드하세요
              </p>
            </div>

            {/* 특징 3 */}
            <div style={{ 
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>💰</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' }}>
                최대 10억원
              </h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>
                창업부터 성장까지<br />
                단계별 맞춤 지원<br />
                받을 수 있습니다
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 프로세스 섹션 */}
      <section style={{ 
        padding: '100px 40px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h2 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold', 
          textAlign: 'center',
          marginBottom: '80px'
        }}>
          어떻게 작동하나요?
        </h2>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '30px'
        }}>
          {/* Step 1 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#000000',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 auto 20px'
            }}>
              1
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              정보 입력
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              사업 정보와<br />
              관심 분야 선택
            </p>
          </div>

          {/* Step 2 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#000000',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 auto 20px'
            }}>
              2
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              AI 분석
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              12,000개 지원사업<br />
              실시간 분석
            </p>
          </div>

          {/* Step 3 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#000000',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 auto 20px'
            }}>
              3
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              맞춤 추천
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              적합도 점수와 함께<br />
              3-5개 추천
            </p>
          </div>

          {/* Step 4 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: '#059669',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: 'bold',
              margin: '0 auto 20px'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
              신청서 작성
            </h3>
            <p style={{ color: '#666', fontSize: '14px' }}>
              AI가 자동 작성<br />
              바로 다운로드
            </p>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section style={{ 
        backgroundColor: '#000000',
        color: 'white',
        padding: '100px 40px',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: '48px', 
          fontWeight: 'bold',
          marginBottom: '30px'
        }}>
          지금 바로 시작하세요
        </h2>
        <p style={{ 
          fontSize: '20px',
          marginBottom: '40px',
          opacity: 0.8
        }}>
          5분이면 당신의 사업에 맞는 지원사업을 찾을 수 있습니다
        </p>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '20px 40px',
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          무료로 시작하기 →
        </button>
      </section>

      {/* 푸터 */}
      <footer style={{ 
        padding: '40px',
        textAlign: 'center',
        borderTop: '1px solid #e5e7eb',
        color: '#666',
        fontSize: '14px'
      }}>
        <p>© 2025 THE FUND. All rights reserved.</p>
      </footer>
    </div>
  );
}