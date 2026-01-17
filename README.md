# 🚀 AI 지원사업 추천 플랫폼

정부 지원사업 신청을 AI가 자동으로 분석하고 추천해주는 종합 플랫폼

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Claude AI](https://img.shields.io/badge/Claude-Sonnet%204-orange)

---

## 📌 프로젝트 개요

**문제점:**
- 정부 지원사업 12,000개 이상 → 찾기 어려움
- 신청서 작성 복잡 → 포기율 높음
- 자격 요건 파악 어려움 → 탈락률 높음

**솔루션:**
- AI가 사용자 정보 분석 → 맞춤 추천
- 신청서 자동 작성 → 5분 완성
- 분야별 맞춤 질문 → 정확한 매칭

---

## ✨ 주요 기능

### 1. 사용자 분류
- 👔 기존 사업자 모드
- 🚀 예비창업자 모드

### 2. 분야별 맞춤 질문
- 🌍 수출 지원
- 🏭 제조/생산
- 🎨 디자인 개발
- 💻 디지털 마케팅
- 🔬 R&D/기술개발
- 💰 투자유치
- 📢 판로개척
- (총 8개 분야)

### 3. AI 분석 & 추천
- Claude Sonnet 4 기반
- 실시간 분석
- 적합도 점수 제공

### 4. 신청서 자동 작성
- 입력 정보 기반 생성
- HTML 파일 다운로드
- 즉시 활용 가능

---

## 🛠️ 기술 스택

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Inline Styles (빠른 프로토타입)

### AI
- **Model:** Claude Sonnet 4 (Anthropic)
- **Use Cases:** 
  - 지원사업 추천
  - 신청서 자동 작성
  - 맞춤형 분석

### 데이터 저장
- **현재:** localStorage (프로토타입)
- **예정:** PostgreSQL (Supabase)

---

## 📁 프로젝트 구조
```
support-platform/
├── app/
│   ├── dashboard/              # 사용자 선택
│   ├── existing-business/      # 기존 사업자 폼
│   ├── preliminary/            # 예비창업자 폼
│   ├── field-selection/        # 관심 분야 선택
│   ├── field-details/          # 분야별 상세 질문
│   ├── file-upload/            # 파일 업로드
│   ├── ai-recommendation/      # AI 추천
│   ├── application/            # 신청서 작성
│   └── api/
│       └── ai/                 # Claude API
├── public/
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 시작하기

### 1. 설치
```bash
# 저장소 클론
git clone https://github.com/your-username/support-platform.git

# 디렉토리 이동
cd support-platform

# 패키지 설치
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:
```env
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

## 📸 스크린샷

### 사용자 선택
![Dashboard](./docs/screenshots/dashboard.png)

### 예비창업자 폼
![Preliminary](./docs/screenshots/preliminary.png)

### AI 추천
![Recommendation](./docs/screenshots/recommendation.png)

### 신청서 작성
![Application](./docs/screenshots/application.png)

---

## 🎯 로드맵

### Phase 1 (완료 ✅)
- [x] 기본 플로우 구현
- [x] AI 추천 시스템
- [x] 신청서 자동 작성
- [x] 8개 분야 맞춤 질문

### Phase 2 (진행 중 🔄)
- [ ] 실제 지원사업 DB 연동
- [ ] K-Startup API 통합
- [ ] 크롤링 시스템 구축

### Phase 3 (예정 📅)
- [ ] 회원 시스템
- [ ] 신청 이력 관리
- [ ] 결제 시스템
- [ ] 전문가 마켓플레이스

### Phase 4 (예정 📅)
- [ ] 모바일 앱
- [ ] 컨설턴트 매칭
- [ ] 광고 시스템
- [ ] 기업 패키지

---

## 💰 비즈니스 모델

### 수익원
1. **SaaS 구독:** Free / Basic / Pro / Premium
2. **전문가 매칭 수수료:** 15-30%
3. **광고 수익:** 프리미엄 배치
4. **기업 패키지:** 대량 이용

### 목표
- 6개월: 월 3,600만원
- 1년: 월 1억 1,300만원
- 2년: 월 2억 9,000만원 (연 35억)

---

## 🤝 기여하기

프로젝트에 기여하고 싶으신가요?

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

MIT License

---

## 👥 팀

- **개발자:** [Your Name]
- **연락:** [Your Email]

---

## 🙏 감사의 말

- Anthropic (Claude API)
- Next.js Team
- K-Startup

---

## 📞 문의

프로젝트에 대한 문의사항이 있으시면:
- Email: your-email@example.com
- GitHub Issues: [Issues 페이지](https://github.com/your-username/support-platform/issues)

---

**⭐ 이 프로젝트가 유용하다면 Star를 눌러주세요!**