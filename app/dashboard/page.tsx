'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

enum UserType {
  EXISTING = 'existing',
  PRELIMINARY = 'preliminary'
}

export default function Dashboard() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType | null>(null);

  return (
    <div style={{ minHeight: '100vh', padding: '50px', backgroundColor: '#f3f4f6' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {!userType && (
          <div style={{ backgroundColor: 'white', padding: '60px', borderRadius: '12px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '40px' }}>어떻게 시작하시겠어요?</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '700px', margin: '0 auto' }}>
              <button onClick={() => { localStorage.setItem('userType', 'existing'); router.push('/existing-business'); }} style={{ padding: '40px', border: '2px solid #ddd', borderRadius: '12px', cursor: 'pointer', backgroundColor: 'white' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>💼</div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>기존 사업자</h3>
                <p style={{ color: '#666' }}>사업자등록증이 있으신 분</p>
              </button>

              <button onClick={() => { localStorage.setItem('userType', 'preliminary'); router.push('/preliminary'); }} style={{ padding: '40px', border: '2px solid #ddd', borderRadius: '12px', cursor: 'pointer', backgroundColor: 'white' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🚀</div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px' }}>예비창업자</h3>
                <p style={{ color: '#666' }}>창업을 준비 중이신 분</p>
              </button>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
}