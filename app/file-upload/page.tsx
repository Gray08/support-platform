'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FileUpload() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // 파일 타입 검증
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    const invalidFiles = newFiles.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setError('PDF, JPG, PNG 파일만 업로드 가능합니다!');
      return;
    }

    // 최대 3개 제한
    if (files.length + newFiles.length > 3) {
      setError('최대 3개 파일까지만 업로드 가능합니다!');
      return;
    }

    setFiles([...files, ...newFiles]);
    setError('');
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSkip = () => {
    // 파일 없이 다음 단계
    router.push('/ai-recommendation');
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError('최소 1개 파일을 업로드해주세요! (또는 건너뛰기)');
      return;
    }

    // 파일 정보 저장 (실제로는 base64나 서버 업로드)
    const fileInfo = files.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    }));

    localStorage.setItem('uploadedFiles', JSON.stringify(fileInfo));
    localStorage.setItem('additionalNotes', additionalNotes);

    // TODO: 실제로는 여기서 파일을 서버에 업로드하고 AI 분석
    // 지금은 다음 페이지로 이동
    router.push('/ai-recommendation');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', padding: '50px 20px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📄</div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>자료 업로드</h1>
          <p style={{ color: '#666', fontSize: '16px' }}>회사소개서, 카탈로그 등을 업로드하면 더 정확한 추천을 받을 수 있습니다</p>
          <p style={{ color: '#999', fontSize: '14px', marginTop: '10px' }}>(선택사항 - 건너뛰기 가능)</p>
        </div>

        {/* 업로드 폼 */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          
          {/* 드래그 & 드롭 영역 */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{
              border: dragActive ? '3px dashed #059669' : '2px dashed #ddd',
              borderRadius: '12px',
              padding: '60px 40px',
              textAlign: 'center',
              backgroundColor: dragActive ? '#ECFDF5' : '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.3s',
              marginBottom: '30px'
            }}
          >
            <input
              type="file"
              id="fileInput"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileInput}
              style={{ display: 'none' }}
            />
            <label htmlFor="fileInput" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '48px', marginBottom: '15px' }}>📁</div>
              <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#333' }}>
                파일을 드래그 & 드롭하거나 클릭하여 선택
              </p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                PDF, JPG, PNG 파일 지원 (최대 3개)
              </p>
            </label>
          </div>

          {/* 업로드된 파일 목록 */}
          {files.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                업로드된 파일 ({files.length}/3)
              </h3>
              {files.map((file, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: '24px', marginRight: '12px' }}>
                      {file.type.includes('pdf') ? '📄' : '🖼️'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#333' }}>
                        {file.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {formatFileSize(file.size)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 추가 메모 */}
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              추가 메모 (선택)
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="AI에게 전달하고 싶은 추가 정보를 입력하세요.&#10;예) 특허 출원 중인 기술이 있습니다, 주요 고객사는 삼성전자입니다 등"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
            />
          </div>

          {/* 안내 박스 */}
          <div style={{ padding: '20px', backgroundColor: '#FEF3C7', borderRadius: '8px', border: '1px solid #FCD34D', marginBottom: '20px' }}>
            <p style={{ color: '#92400E', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              💡 <strong>파일 업로드는 선택사항입니다!</strong><br />
              파일을 업로드하면 AI가 회사 정보를 자동으로 분석하여 더 정확한 지원사업을 추천해드립니다.<br />
              건너뛰어도 이전에 입력한 정보로 추천을 받을 수 있습니다.
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '14px' }}>
              ⚠️ {error}
            </div>
          )}

          {/* 버튼 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '15px' }}>
            <button
              onClick={() => router.push('/field-details')}
              style={{
                padding: '16px',
                backgroundColor: 'white',
                color: '#666',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ← 뒤로
            </button>
            <button
              onClick={handleSkip}
              style={{
                padding: '16px',
                backgroundColor: '#F3F4F6',
                color: '#666',
                border: '2px solid #ddd',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              건너뛰기
            </button>
            <button
              onClick={handleSubmit}
              disabled={files.length === 0}
              style={{
                padding: '16px',
                backgroundColor: files.length === 0 ? '#D1D5DB' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: files.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              AI 분석 시작 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}