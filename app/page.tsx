'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [clicked, setClicked] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  return (
    <div style={{ 
      padding: '100px', 
      textAlign: 'center',
      backgroundColor: '#f3f4f6',
      minHeight: '100vh'
    }}>
      <h1 style={{ 
        fontSize: '48px', 
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#111'
      }}>
        정부 지원금 플랫폼
      </h1>
      
      <p style={{ 
        fontSize: '24px', 
        color: '#666',
        marginBottom: '40px'
      }}>
        AI가 당신의 사업에 맞는 지원사업을 찾아드립니다
      </p>
      
      <button 
        onClick={handleClick}
        style={{
          padding: '20px 40px',
          fontSize: '20px',
          backgroundColor: clicked ? '#10B981' : '#F59E0B',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          transition: 'all 0.3s'
        }}
      >
        {clicked ? '로그인 페이지로 이동 중...' : '시작하기 →'}
      </button>
      
      {clicked && (
        <p style={{
          marginTop: '30px',
          fontSize: '20px',
          color: '#10B981',
          fontWeight: 'bold'
        }}>
          잠시만 기다려주세요! 🚀
        </p>
      )}
    </div>
  );
}