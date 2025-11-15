# Cline 프로젝트 목표

## 프로젝트 개요
**Cline**은 VSCode용 AI 코딩 어시스턴트 확장 프로그램으로, 다양한 LLM Provider를 통해 자율적인 코딩 작업을 수행합니다.

## 현재 진행 중인 작업

### LLM 다중 설정 기능 개발

#### 목표
사용자가 여러 개의 LLM 설정 프로필을 저장하고 전환할 수 있는 기능을 개발하여 Upstream(cline/cline)에 기여

**핵심 기능**: OpenAI Compatible Provider에서 Base URL + API Key + Model ID 세트를 다중 등록하여 Cline Provider처럼 채팅창 하단에서 모델을 선택할 수 있도록 구현

#### 구체적인 목표

1. **다중 프로필 관리 시스템**
   - 여러 개의 LLM 설정 프로필 저장
   - 프로필별 이름 지정 및 설명 추가
   - 프로필 생성, 수정, 삭제 기능
   - 기본 프로필 설정 기능

2. **프로필 구성 요소**
   - API Provider 설정 (Anthropic, OpenAI, OpenRouter 등 40+ providers)
   - Plan Mode/Act Mode 별도 설정
   - 모델 선택 및 파라미터
   - API 키 및 엔드포인트
   - 고급 설정 (thinking budget, reasoning effort 등)
   - **OpenAI Compatible 다중 모델 설정**:
     - Base URL (예: https://api.openai.com, https://custom-llm.com)
     - API Key
     - Model ID
     - ModelInfo (maxTokens, contextWindow, pricing 등)
     - 여러 세트를 프로필에 저장하여 채팅 UI에서 선택 가능

3. **사용자 인터페이스**
   - Webview UI에 프로필 선택 드롭다운 추가
   - 프로필 관리 대화상자 구현
   - 현재 활성 프로필 표시
   - 빠른 프로필 전환 기능
   - **OpenAI Compatible 모델 선택기**:
     - 프로필 내 여러 OpenAI Compatible 모델 목록 표시
     - 채팅창 하단에서 모델 선택 (Cline Provider 방식과 동일)
     - Base URL + API Key + Model 세트별 구분 표시

4. **데이터 저장 및 동기화**
   - VSCode 설정 시스템 활용
   - 프로필별 설정 격리
   - 안전한 API 키 관리 (VSCode Secret Storage 활용)
   - 프로필 가져오기/내보내기 기능 (API 키 제외)

5. **하위 호환성**
   - 기존 단일 설정 사용자의 설정 자동 마이그레이션
   - 기존 API 인터페이스 유지
   - 점진적 기능 활성화

#### 개발 단계

**Phase 1: 분석 및 설계** ✅
- [x] 현재 설정 시스템 상세 분석
  - ApiConfiguration 인터페이스 구조
  - 설정 저장/로드 메커니즘
  - Provider별 필수/선택 파라미터
- [x] 프로필 데이터 스키마 설계
- [x] UI/UX 목업 작성
- [x] 마이그레이션 전략 수립

**Phase 2: 백엔드 구현** ✅
- [x] 타입 정의 작성 (src/shared/profiles.ts)
  - [x] OpenAI Compatible 커스텀 모델 타입 (OpenAiCompatibleCustomModel)
  - [x] PlanMode/ActMode에 openAiCompatibleModels 배열 추가
  - [x] ProfileSecrets에 동적 키 지원 추가
- [x] state-keys 업데이트
- [x] 프로필 저장소 클래스 구현 (ProfileManager.ts - 688 lines)
- [x] 프로필 CRUD 작업 구현
- [x] 프로필 전환 로직 구현
- [x] Secret Storage 통합
- [ ] 단위 테스트 작성

**Phase 3: 프론트엔드 구현** ⬜
- [ ] Webview UI 프로필 선택기 구현
- [ ] 프로필 관리 대화상자 구현
- [ ] 프로필 가져오기/내보내기 UI
- [ ] 상태 표시 및 알림

**Phase 4: 통합 및 테스트** ⬜
- [ ] 백엔드-프론트엔드 통합
- [ ] 마이그레이션 로직 테스트
- [ ] 다양한 Provider 테스트
- [ ] 에지 케이스 처리
- [ ] 통합 테스트 작성

**Phase 5: 문서화 및 PR** ⬜
- [ ] 기능 문서 작성
- [ ] CHANGELOG 업데이트
- [ ] README 업데이트 (필요 시)
- [ ] PR 작성 및 제출
- [ ] 리뷰 피드백 대응

## 기술 스택

### 주요 기술
- **언어**: TypeScript
- **프레임워크**: VSCode Extension API
- **UI**: React (Webview UI)
- **빌드 도구**: esbuild, Vite
- **테스트**: Jest, Playwright

### 프로젝트 구조
```
src/
  ├── core/
  │   ├── api/              # API Provider 핸들러들
  │   │   ├── index.ts      # Provider 선택 및 생성
  │   │   └── providers/    # 40+ Provider 구현
  │   ├── storage/          # 설정 저장 관리
  │   └── ...
  ├── shared/               # 공유 타입 및 유틸
  │   └── api.ts           # ApiConfiguration 타입
  └── webview-ui/           # React UI
```

### 관련 파일
- `src/core/api/index.ts` - API Provider 생성 로직
- `src/shared/api.ts` - API 설정 타입 정의
- `src/core/storage/` - 설정 저장소
- `webview-ui/src/` - 사용자 인터페이스
- `src/extension.ts` - 확장 진입점

## 주요 고려사항

### 보안
- API 키는 반드시 VSCode Secret Storage 사용
- 프로필 내보내기 시 민감 정보 제외
- 프로필 가져오기 시 검증

### 성능
- 프로필 전환 시 최소한의 리로드
- 설정 읽기 캐싱
- 대량 프로필 지원 (최소 10개 이상)

### 사용성
- 직관적인 프로필 관리 UI
- 명확한 프로필 이름과 설명
- 빠른 프로필 전환 (단축키 지원 고려)

### 호환성
- 기존 사용자 설정 자동 마이그레이션
- 구버전과의 하위 호환성
- 설정 파일 버전 관리

## 성공 기준

1. **기능 완성도**
   - 모든 Phase 1-4 체크리스트 완료
   - 40+ Provider 모두에서 정상 작동
   - 엣지 케이스 처리

2. **코드 품질**
   - TypeScript 타입 안전성
   - 단위 테스트 커버리지 80% 이상
   - ESLint/Biome 규칙 준수
   - 코드 리뷰 통과

3. **사용자 경험**
   - 직관적인 UI
   - 프로필 전환 시 1초 이내 완료
   - 명확한 에러 메시지

4. **문서화**
   - 기능 사용 가이드 작성
   - API 문서 업데이트
   - 마이그레이션 가이드 제공

5. **커뮤니티 승인**
   - PR 리뷰 통과
   - 메인테이너 승인
   - Upstream 머지 완료

## 참고 자료

### 공식 문서
- [Cline Documentation](https://docs.cline.bot/)
- [VSCode Extension API](https://code.visualstudio.com/api)
- [VSCode Secret Storage API](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)

### 관련 이슈/PR
- (추후 추가)

### 설계 문서
- (작업 진행 중 추가)

## 현재 작업 세션
- **세션 ID**: session-20251113-001-llm-multi-config
- **세션 파일**: `.github/sessions/session-20251113-001-llm-multi-config.md`
