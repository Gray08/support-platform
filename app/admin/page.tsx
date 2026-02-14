'use client';

import React, { useState } from 'react';

interface AnalysisResult {
  success: boolean;
  programId: string;
  data: Record<string, unknown>;
  savedPath?: string;
  message?: string;
}

interface UploadFile {
  id: string;
  file: File;
  documentType: string;
  status: 'pending' | 'analyzing' | 'completed' | 'error' | 'extracting';
  result?: AnalysisResult;
  error?: string;
  extractedProgramName?: string;
}

export default function AdminPage() {
  const [programName, setProgramName] = useState<string>('');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [globalProgress, setGlobalProgress] = useState<number>(0);
  const [autoExtractedNames, setAutoExtractedNames] = useState<string[]>([]);

  const addFiles = (selectedFiles: FileList): void => {
    const newFiles: UploadFile[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type === 'application/pdf') {
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file: file,
          documentType: 'comprehensive',
          status: 'pending'
        });
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
    
    // 자동으로 지원사업명 추출 시작
    if (newFiles.length > 0) {
      extractProgramNamesFromFiles(newFiles);
    }
  };

  const extractProgramNamesFromFiles = async (filesToExtract: UploadFile[]): Promise<void> => {
    const extractedNames: string[] = [];
    
    for (const fileInfo of filesToExtract) {
      try {
        // 파일 상태를 추출 중으로 변경
        setFiles(prev => prev.map(f => 
          f.id === fileInfo.id ? { ...f, status: 'extracting' } : f
        ));

        const formData = new FormData();
        formData.append('pdf', fileInfo.file);

        const response = await fetch('/api/programs/extract-name', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          const extractedName = result.programName;
          
          if (extractedName) {
            extractedNames.push(extractedName);
            
            // 파일에 추출된 이름 저장
            setFiles(prev => prev.map(f => 
              f.id === fileInfo.id 
                ? { ...f, status: 'pending', extractedProgramName: extractedName }
                : f
            ));
          } else {
            setFiles(prev => prev.map(f => 
              f.id === fileInfo.id ? { ...f, status: 'pending' } : f
            ));
          }
        } else {
          // 추출 실패해도 pending 상태로 돌리기
          setFiles(prev => prev.map(f => 
            f.id === fileInfo.id ? { ...f, status: 'pending' } : f
          ));
        }
      } catch (error) {
        console.error('지원사업명 추출 실패:', error);
        setFiles(prev => prev.map(f => 
          f.id === fileInfo.id ? { ...f, status: 'pending' } : f
        ));
      }
    }

    // 추출된 이름들 처리
    if (extractedNames.length > 0) {
      setAutoExtractedNames(extractedNames);
      
      // 모든 파일에서 같은 이름이 추출되면 자동 설정
      const uniqueNames = [...new Set(extractedNames)];
      if (uniqueNames.length === 1 && !programName) {
        setProgramName(uniqueNames[0]);
      }
    }
  };

  const removeFile = (fileId: string): void => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const updateFileDocumentType = (fileId: string, documentType: string): void => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, documentType } : f
    ));
  };

  const analyzeAllFiles = async (): Promise<void> => {
    if (files.length === 0) {
      alert('최소 1개의 PDF 파일을 업로드해주세요');
      return;
    }

    // 지원사업명이 없으면 추출된 이름 중 첫 번째 사용
    let finalProgramName = programName;
    if (!finalProgramName && autoExtractedNames.length > 0) {
      finalProgramName = autoExtractedNames[0];
      setProgramName(finalProgramName);
    }

    if (!finalProgramName) {
      alert('지원사업명을 입력하거나 PDF에서 자동 추출될 때까지 기다려주세요');
      return;
    }

    setLoading(true);
    setGlobalProgress(0);

    setFiles(prev => prev.map(f => ({ ...f, status: 'analyzing' as const })));

    let completedFiles = 0;
    
    for (const fileInfo of files) {
      try {
        console.log(`분석 시작: ${fileInfo.file.name}`);
        
        const formData = new FormData();
        formData.append('pdf', fileInfo.file);
        formData.append('programName', finalProgramName);
        formData.append('documentType', fileInfo.documentType);

        const response = await fetch('/api/programs/analyze', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const result = await response.json() as AnalysisResult;
        
        setFiles(prev => prev.map(f => 
          f.id === fileInfo.id 
            ? { ...f, status: 'completed', result }
            : f
        ));
        
        console.log(`분석 완료: ${fileInfo.file.name}`);
        
      } catch (error) {
        console.error(`분석 실패: ${fileInfo.file.name}`, error);
        
        setFiles(prev => prev.map(f => 
          f.id === fileInfo.id 
            ? { 
                ...f, 
                status: 'error', 
                error: error instanceof Error ? error.message : '알 수 없는 오류'
              }
            : f
        ));
      }
      
      completedFiles++;
      setGlobalProgress(Math.round((completedFiles / files.length) * 100));
    }

    setLoading(false);
    
    const completed = files.filter(f => f.status === 'completed').length;
    const failed = files.filter(f => f.status === 'error').length;
    
    alert(`분석 완료!\n성공: ${completed}개\n실패: ${failed}개`);
  };

  const resetAll = (): void => {
    setFiles([]);
    setProgramName('');
    setGlobalProgress(0);
    setAutoExtractedNames([]);
  };

  const selectExtractedName = (name: string): void => {
    setProgramName(name);
  };

  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'pending': return '⏳';
      case 'extracting': return '🔍';
      case 'analyzing': return '🔄';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '📄';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pending': return '대기중';
      case 'extracting': return '사업명 추출 중...';
      case 'analyzing': return '분석중...';
      case 'completed': return '완료';
      case 'error': return '실패';
      default: return '알 수 없음';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleProgramNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setProgramName(e.target.value);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>): void => {
    e.target.style.borderColor = '#3b82f6';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>): void => {
    e.target.style.borderColor = '#e5e7eb';
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏛️</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
          THE FUND - 관리자 페이지
        </h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          PDF에서 지원사업명을 자동 추출하여 AI 분석을 수행합니다
        </p>
      </div>

      {/* 지원사업명 설정 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        marginBottom: '30px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', color: '#1f2937' }}>
          📋 지원사업명
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '600',
            color: '#374151' 
          }}>
            지원사업명 (PDF에서 자동 추출됩니다)
          </label>
          <input
            type="text"
            value={programName}
            onChange={handleProgramNameChange}
            placeholder="PDF 파일을 업로드하면 자동으로 추출됩니다..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '16px',
              transition: 'border-color 0.2s',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
          />
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px' }}>
            💡 PDF 업로드 시 AI가 자동으로 지원사업명을 추출합니다. 필요시 수정 가능합니다.
          </p>
        </div>

        {/* 추출된 지원사업명 목록 */}
        {autoExtractedNames.length > 0 && (
          <div style={{ 
            padding: '15px', 
            backgroundColor: '#f0fdf4', 
            borderRadius: '8px',
            border: '1px solid #a7f3d0',
            marginTop: '15px'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', color: '#065f46' }}>
              🤖 PDF에서 추출된 지원사업명:
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[...new Set(autoExtractedNames)].map((name, index) => (
                <button
                  key={index}
                  onClick={() => selectExtractedName(name)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: programName === name ? '#059669' : 'white',
                    color: programName === name ? 'white' : '#059669',
                    border: '1px solid #059669',
                    borderRadius: '20px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 파일 업로드 */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        marginBottom: '30px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
        border: '1px solid #e5e7eb'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '30px', color: '#1f2937' }}>
          📄 PDF 파일 업로드
        </h2>

        {/* 파일 선택 */}
        <div style={{ marginBottom: '30px' }}>
          <input
            type="file"
            accept=".pdf"
            multiple
            onChange={handleFileInputChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px dashed #3b82f6',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          />
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px', textAlign: 'center' }}>
            💡 여러 PDF 파일을 한 번에 선택하면 각 파일에서 지원사업명을 자동으로 추출합니다
          </p>
        </div>

        {/* 업로드된 파일 목록 */}
        {files.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
              📋 업로드된 파일 목록 ({files.length}개)
            </h3>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              {files.map((fileInfo) => (
                <div
                  key={fileInfo.id}
                  style={{
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    backgroundColor: fileInfo.status === 'completed' ? '#f0fdf4' : 
                                   fileInfo.status === 'error' ? '#fef2f2' : 
                                   fileInfo.status === 'analyzing' ? '#f0f9ff' :
                                   fileInfo.status === 'extracting' ? '#fef3c7' : '#f8fafc'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px' }}>{getStatusIcon(fileInfo.status)}</span>
                        <strong style={{ fontSize: '16px', color: '#1f2937' }}>{fileInfo.file.name}</strong>
                        <span style={{ fontSize: '14px', color: '#6b7280' }}>
                          ({Math.round(fileInfo.file.size / 1024)} KB)
                        </span>
                      </div>
                      <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
                        상태: {getStatusText(fileInfo.status)}
                      </p>
                      {fileInfo.extractedProgramName && (
                        <p style={{ fontSize: '12px', color: '#059669', margin: '4px 0 0 0', fontWeight: '600' }}>
                          🤖 추출된 사업명: {fileInfo.extractedProgramName}
                        </p>
                      )}
                    </div>
                    
                    {(fileInfo.status === 'pending' || fileInfo.status === 'extracting') && (
                      <button
                        onClick={() => removeFile(fileInfo.id)}
                        disabled={fileInfo.status === 'extracting'}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: fileInfo.status === 'extracting' ? '#9ca3af' : '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: fileInfo.status === 'extracting' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                  
                  {/* 문서 유형 선택 */}
                  {fileInfo.status === 'pending' && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
                        문서 유형
                      </label>
                      <select
                        value={fileInfo.documentType}
                        onChange={(e) => updateFileDocumentType(fileInfo.id, e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px',
                          fontSize: '14px',
                          backgroundColor: 'white'
                        }}
                      >
                        <option value="comprehensive">📚 종합 문서 (추천)</option>
                        <option value="announcement">📢 공고문</option>
                        <option value="form">📝 신청서 양식</option>
                        <option value="guideline">📋 작성 가이드</option>
                      </select>
                    </div>
                  )}
                  
                  {/* 오류 메시지 */}
                  {fileInfo.status === 'error' && fileInfo.error && (
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#fee2e2', 
                      borderRadius: '6px',
                      marginTop: '10px'
                    }}>
                      <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>
                        ⚠️ 오류: {fileInfo.error}
                      </p>
                    </div>
                  )}
                  
                  {/* 성공 결과 미리보기 */}
                  {fileInfo.status === 'completed' && fileInfo.result && (
                    <div style={{ 
                      padding: '12px', 
                      backgroundColor: '#dcfce7', 
                      borderRadius: '6px',
                      marginTop: '10px'
                    }}>
                      <p style={{ color: '#059669', fontSize: '14px', margin: '0 0 8px 0', fontWeight: '600' }}>
                        ✅ 분석 완료 - 프로그램 ID: {fileInfo.result.programId}
                      </p>
                      <details style={{ fontSize: '12px' }}>
                        <summary style={{ cursor: 'pointer', color: '#059669' }}>분석 결과 보기</summary>
                        <pre style={{ 
                          marginTop: '8px', 
                          padding: '8px', 
                          backgroundColor: 'white', 
                          borderRadius: '4px',
                          fontSize: '11px',
                          maxHeight: '200px',
                          overflow: 'auto'
                        }}>
                          {JSON.stringify(fileInfo.result.data, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 전체 분석 버튼 */}
        {files.length > 0 && (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={analyzeAllFiles}
              disabled={loading}
              style={{
                padding: '16px 32px',
                backgroundColor: loading ? '#9ca3af' : '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginRight: '15px'
              }}
            >
              {loading ? `🔄 분석 중... (${globalProgress}%)` : `🚀 전체 파일 분석 시작 (${files.length}개)`}
            </button>
            
            <button
              onClick={resetAll}
              disabled={loading}
              style={{
                padding: '16px 32px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              🔄 전체 초기화
            </button>
          </div>
        )}
      </div>

      {/* 전체 진행 상황 */}
      {loading && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '16px', 
          textAlign: 'center',
          border: '2px solid #3b82f6',
          marginBottom: '30px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🤖</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#1f2937' }}>
            다중 PDF 분석 진행 중
          </h3>
          
          <div style={{
            width: '100%',
            height: '12px',
            backgroundColor: '#e5e7eb',
            borderRadius: '6px',
            marginBottom: '20px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${globalProgress}%`,
              height: '100%',
              backgroundColor: '#059669',
              borderRadius: '6px',
              transition: 'width 0.5s ease-in-out'
            }} />
          </div>
          
          <p style={{ fontSize: '18px', color: '#059669', fontWeight: '600' }}>
            진행률: {globalProgress}% ({files.filter(f => f.status === 'completed').length} / {files.length})
          </p>
        </div>
      )}
    </div>
  );
}