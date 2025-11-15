# Cline 프로젝트 목표

## 프로젝트 개요
**Cline**은 VSCode용 AI 코딩 어시스턴트 확장 프로그램으로, 다양한 LLM Provider를 통해 자율적인 코딩 작업을 수행합니다.

## 🎯 최종 목표: Upstream 기여

**이 프로젝트의 최종 목표는 개발한 기능을 Cline Upstream(cline/cline)에 성공적으로 기여하는 것입니다.**

### Upstream 기여 성공 조건
1. ✅ **코드 품질**: Cline 프로젝트의 코딩 스타일 및 아키텍처 준수
2. ✅ **하위 호환성**: 기존 사용자 경험 유지 및 자동 마이그레이션
3. ✅ **문서화**: 기능 사용 가이드 및 기술 문서 작성
4. ✅ **테스트**: 충분한 단위 테스트 및 통합 테스트
5. ✅ **리뷰 대응**: 메인테이너 피드백에 신속한 대응
6. ✅ **PR 승인 및 머지**: Upstream에 성공적으로 머지

## 현재 진행 중인 작업

### LLM 다중 설정 기능 개발

#### 개발 목표
사용자가 여러 개의 LLM 설정 프로필을 저장하고 전환할 수 있는 기능을 개발

**핵심 기능**: OpenAI Compatible Provider에서 Base URL + API Key + Model ID 세트를 다중 등록하여 Cline Provider처럼 채팅창 하단에서 모델을 선택할 수 있도록 구현

#### Upstream 기여를 위한 개발 전략

1. **Cline 아키텍처 준수**
   - 기존 코드 스타일 및 패턴 분석 후 동일하게 적용
   - 파일 구조 및 네이밍 컨벤션 유지
   - 기존 API 인터페이스 호환성 보장

2. **최소 침습적 변경**
   - 기존 코드 수정 최소화
   - 새로운 기능은 독립적인 모듈로 구현
   - 기존 기능에 영향 없도록 격리

3. **점진적 기능 활성화**
   - 기본적으로 기존 동작 유지
   - 사용자가 명시적으로 활성화 시에만 새 기능 동작
   - 언제든 이전 방식으로 복귀 가능

4. **완벽한 하위 호환성**
   - 기존 설정 자동 마이그레이션 (데이터 손실 없음)
   - 기존 사용자는 변경 사항을 느끼지 못함
   - 새 사용자도 기존 워크플로우 사용 가능

5. **명확한 문서화**
   - 사용자 가이드 (how-to)
   - 기술 문서 (architecture, API)
   - 마이그레이션 가이드
   - CHANGELOG 작성

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

**Phase 5: 문서화 및 Upstream 기여 준비** ⬜
- [ ] 사용자 가이드 작성 (docs/ 폴더)
- [ ] 기술 문서 작성 (아키텍처, API)
- [ ] 마이그레이션 가이드 작성
- [ ] CHANGELOG 업데이트
- [ ] README 업데이트 (필요 시)
- [ ] 코드 스타일 최종 검증 (ESLint/Biome)
- [ ] 커밋 히스토리 정리 (squash if needed)

**Phase 6: PR 제출 및 리뷰** ⬜
- [ ] Upstream 저장소 포크 업데이트
- [ ] Feature 브랜치 생성 및 푸시
- [ ] PR 작성 (템플릿 준수)
  - [ ] 기능 설명
  - [ ] 스크린샷/GIF
  - [ ] 테스트 결과
  - [ ] Breaking Changes 없음 명시
- [ ] PR 제출
- [ ] 메인테이너 리뷰 대응
- [ ] 요청사항 반영 및 수정
- [ ] CI/CD 통과 확인
- [ ] 최종 승인 대기

**Phase 7: 머지 후 작업** ⬜
- [ ] 머지 확인
- [ ] 릴리즈 노트 확인
- [ ] 사용자 피드백 모니터링
- [ ] 버그 리포트 대응
- [ ] 후속 개선 작업 (필요 시)

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

## 주요 고려사항 (Upstream 기여 관점)

### 1. 코드 품질 및 일관성
- **Cline 코딩 스타일 준수**: ESLint/Biome 규칙 엄격히 준수
- **타입 안전성**: TypeScript strict 모드, any 사용 금지
- **기존 패턴 따르기**: 기존 코드의 패턴 및 구조 분석 후 동일하게 적용
- **명확한 네이밍**: 변수/함수명은 자기 설명적으로 작성
- **주석 및 문서화**: 복잡한 로직은 주석 추가

### 2. 보안 (Critical for Upstream)
- **API 키 관리**: 반드시 VSCode Secret Storage 사용
- **민감 정보 격리**: 프로필 내보내기 시 API 키 제외
- **입력 검증**: 사용자 입력 및 외부 데이터 철저히 검증
- **에러 처리**: 민감 정보가 에러 메시지에 노출되지 않도록 주의

### 3. 성능 (User Experience)
- **빠른 프로필 전환**: 1초 이내 완료
- **효율적인 캐싱**: 설정 읽기 최소화
- **메모리 관리**: 대량 프로필(10개 이상) 지원
- **UI 반응성**: 비동기 작업은 로딩 표시

### 4. 사용성 (Critical for Acceptance)
- **직관적인 UI**: 별도 학습 없이 사용 가능
- **명확한 피드백**: 작업 결과 즉시 표시
- **에러 메시지**: 사용자가 이해하고 해결할 수 있는 메시지
- **접근성**: 키보드 네비게이션, 스크린 리더 지원

### 5. 하위 호환성 (Must Have)
- **자동 마이그레이션**: 기존 설정 자동 변환 (데이터 손실 없음)
- **기존 API 유지**: 기존 코드와의 인터페이스 호환
- **설정 파일 버전 관리**: 버전별 마이그레이션 경로 제공
- **롤백 가능**: 문제 발생 시 이전 상태로 복구 가능

### 6. 테스트 커버리지 (Essential for Review)
- **단위 테스트**: 모든 public 메서드 테스트 (80% 이상)
- **통합 테스트**: 주요 워크플로우 E2E 테스트
- **엣지 케이스**: 비정상 입력 및 오류 상황 테스트
- **마이그레이션 테스트**: 다양한 기존 설정 패턴 검증

### 7. 문서화 (Required for Merge)
- **사용자 가이드**: 기능 사용 방법 (스크린샷 포함)
- **API 문서**: 새로운 인터페이스 및 타입 설명
- **아키텍처 문서**: 설계 결정 및 구조 설명
- **마이그레이션 가이드**: 기존 사용자를 위한 가이드
- **CHANGELOG**: 변경 사항 상세 기록

## 🎖️ Upstream 기여 성공 기준

### 필수 조건 (Must Have for Merge)

1. **✅ 기능 완성도**
   - [ ] 모든 Phase 1-6 체크리스트 완료
   - [ ] 40+ Provider 모두에서 정상 작동
   - [ ] 모든 엣지 케이스 처리
   - [ ] 마이그레이션 100% 성공률

2. **✅ 코드 품질**
   - [ ] TypeScript strict 모드 통과
   - [ ] ESLint/Biome 오류 0개
   - [ ] 단위 테스트 커버리지 80% 이상
   - [ ] 통합 테스트 주요 시나리오 커버
   - [ ] 코드 리뷰 체크리스트 통과

3. **✅ 하위 호환성**
   - [ ] 기존 설정 자동 마이그레이션
   - [ ] Breaking Changes 없음
   - [ ] 기존 API 인터페이스 유지
   - [ ] 롤백 메커니즘 구현

4. **✅ 사용자 경험**
   - [ ] 기존 사용자: 변경 감지 불가 (마이그레이션 완료 알림만)
   - [ ] 새 사용자: 직관적인 UI
   - [ ] 프로필 전환 1초 이내
   - [ ] 명확한 에러 메시지 및 해결 방법

5. **✅ 문서화**
   - [ ] 사용자 가이드 (스크린샷/GIF 포함)
   - [ ] 기술 문서 (아키텍처, API)
   - [ ] 마이그레이션 가이드
   - [ ] CHANGELOG 상세 작성
   - [ ] PR 설명 완벽 작성

### PR 리뷰 통과 조건

6. **✅ PR 품질**
   - [ ] 명확한 제목 및 설명
   - [ ] Before/After 스크린샷
   - [ ] 테스트 결과 첨부
   - [ ] Breaking Changes 없음 명시
   - [ ] 관련 이슈 링크 (있는 경우)
   - [ ] 리뷰어 질문에 24시간 내 응답

7. **✅ CI/CD**
   - [ ] 모든 CI 테스트 통과
   - [ ] 빌드 오류 없음
   - [ ] 린트 체크 통과
   - [ ] 테스트 커버리지 기준 충족

### 최종 성공 지표

8. **🎯 Upstream 머지**
   - [ ] 메인테이너 최종 승인
   - [ ] PR 머지 완료
   - [ ] 릴리즈 노트 포함 확인

9. **📈 커뮤니티 반응**
   - [ ] 버그 리포트 0개 (첫 1주일)
   - [ ] 긍정적 사용자 피드백
   - [ ] 추가 개선 제안 수집

10. **🔄 유지보수**
    - [ ] 머지 후 1개월 모니터링
    - [ ] 발견된 버그 즉시 수정
    - [ ] 메인테이너 요청사항 대응

## 📚 참고 자료

### Upstream 저장소
- **메인 저장소**: [cline/cline](https://github.com/cline/cline)
- **기여 가이드**: CONTRIBUTING.md 참조
- **코드 스타일 가이드**: ESLint/Biome 설정 참조

### 공식 문서
- [Cline Documentation](https://docs.cline.bot/)
- [VSCode Extension API](https://code.visualstudio.com/api)
- [VSCode Secret Storage API](https://code.visualstudio.com/api/references/vscode-api#SecretStorage)

### PR 체크리스트
1. [ ] 코드 품질 검증 (ESLint/Biome 통과)
2. [ ] 테스트 커버리지 80% 이상
3. [ ] 하위 호환성 검증 (마이그레이션 테스트)
4. [ ] 문서 작성 완료 (사용자 가이드 + 기술 문서)
5. [ ] CHANGELOG 업데이트
6. [ ] PR 설명 작성 (템플릿 준수)
7. [ ] 스크린샷/GIF 첨부
8. [ ] Breaking Changes 없음 확인

### 관련 이슈/PR
- (Upstream 이슈 추적 시 추가)

### 설계 문서
- `.github/sessions/` - 각 세션별 상세 개발 기록
- (기술 문서는 Phase 5에서 작성)

## 현재 작업 세션
- **최신 세션**: session-20251115-003-settings-profile-ui
- **세션 파일**: `.github/sessions/session-20251115-003-settings-profile-ui.md`
- **진행 상황**: Phase 3 진행 중 (Settings UI 구현)
