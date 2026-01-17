'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (email === '' || password === '') {
      setMessage('이메일과 비밀번호를 입력하세요!');
      return;
    }
    
    if (email === 'test@test.com' && password === '1234') {
      setMessage('로그인 성공! 대시보드로 이동합니다...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else {
      setMessage('이메일 또는 비밀번호가 틀렸습니다.');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        width: '400px'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          로그인
        </h1>
        
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '30px'
        }}>
          정부 지원금 플랫폼
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: 'bold',
            color: '#333'
          }}>
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#F59E0B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          로그인
        </button>

        {message && (
          <p style={{
            textAlign: 'center',
            padding: '12px',
            borderRadius: '8px',
            backgroundColor: message.includes('성공') ? '#D1FAE5' : '#FEE2E2',
            color: message.includes('성공') ? '#059669' : '#DC2626',
            fontWeight: 'bold'
          }}>
            {message}
          </p>
        )}

        <p style={{
          textAlign: 'center',
          fontSize: '14px',
          color: '#999',
          marginTop: '20px'
        }}>
          테스트: test@test.com / 1234
        </p>
      </div>
    </div>
  );
}