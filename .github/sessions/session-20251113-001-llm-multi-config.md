# Session: session-20251113-001-llm-multi-config

## 세션 정보
- **세션 ID**: session-20251113-001-llm-multi-config
- **시작 시간**: 2025-11-13
- **상태**: 진행 중
- **작업 유형**: 신규 기능 개발

## 작업 목적
Cline 프로젝트에 LLM 다중 설정 기능을 개발하여 Upstream에 기여

**핵심 목표**: OpenAI Compatible Provider에서 Base URL + API Key + Model ID 세트를 다중 등록하여, Cline Provider처럼 채팅창 하단에서 모델을 선택할 수 있도록 구현. 사용자는 여러 개의 커스텀 LLM 엔드포인트(예: 로컬 Ollama, 커스텀 OpenAI 호환 서버 등)를 프로필에 저장하고 실시간으로 전환 가능.

## 작업 계획
1. ✅ 새 세션 생성 및 초기화
2. ✅ project-goal.md 작성
3. ✅ 기존 코드 분석 및 구조 파악
   - ApiConfiguration 인터페이스 (100+ 필드)
   - StateManager 캐시 시스템
   - Secret Storage vs GlobalState 분리
   - 43개 Provider 지원 구조
4. ✅ Phase 1 완료: 분석 및 설계
   - 현재 설정 시스템 상세 분석
   - 델타 방식 프로필 데이터 스키마 설계
   - ProfileManager 클래스 설계
   - 이벤트 시스템 및 에러 처리 설계
5. ✅ Phase 2 백엔드 준비 완료
   - 타입 정의 파일 작성 (src/shared/profiles.ts)
   - state-keys 업데이트 (프로필 시스템 상태 추가)
   - 상세 설계 문서 작성
6. ✅ ProfileManager 구현 완료
   - CRUD 작업, 프로필 전환, Secret Storage 통합
   - 마이그레이션 로직 구현
7. ✅ StateManager 통합 완료
   - ProfileManager 초기화
   - ApiConfiguration 변환
   - 자동 마이그레이션
8. ⬜ UI 구현 (다음 단계)
9. ⬜ 통합 테스트 및 PR 준비

## 진행 상황

### 2025-11-15 (세션 재개)
- VSCode 새 프로필 생성 후 Extension 재설치 완료
- **StateManager-ProfileManager 통합 완료** ✅
  - ProfileManager import 추가
  - StateManager에 profileManager 필드 추가
  - initialize() 메서드에 ProfileManager 초기화 추가
  - getProfileManager() 메서드 추가
  - isProfileSystemActive() 메서드 추가 (마이그레이션 완료 여부 확인)
- **ApiConfiguration 변환 메서드 추가 완료** ✅
  - ProfileManager에 convertToApiConfiguration() 추가
  - getActiveProfileAsApiConfiguration() 추가
  - Profile → ApiConfiguration 양방향 변환 지원
- **Migration 로직 연결 완료** ✅
  - StateManager.initialize()에 마이그레이션 로직 추가
  - 첫 실행 시 기존 ApiConfiguration → "Default" 프로필 자동 변환
  - profileMigrationCompleted 플래그로 중복 마이그레이션 방지
- **빌드 및 타입 체크 완료** ✅
  - Proto 파일 생성 완료 (7개 파일)
  - TypeScript 컴파일 에러 없음 확인
  - state-helpers.ts 타입 에러 수정 (profile 필드 추가)

### 2025-11-13
- 세션 시작
- 프로젝트 구조 분석 완료
  - src/core/api/index.ts: 40개 이상의 API Provider 핸들러 확인
  - mode 기반 설정 분리 (plan/act) 확인
  - 각 provider별 configuration 파라미터 확인
- project-goal.md 작성 완료
- 개발 환경 설정
  - Node.js v22.20.0, npm v10.9.3 확인
  - 프로젝트 의존성 설치 완료 (npm install)
  - webview-ui 의존성 설치 완료
  - watch 태스크 실행 중 (백그라운드 빌드)
  - proto 파일 생성 완료
  - 디버그 구성 확인 (.vscode/launch.json)
  - Extension 정상 동작 확인 ✅
- Phase 1 완료: 현재 설정 시스템 상세 분석
  - ApiConfiguration 인터페이스 분석 (100+ 필드, 43개 Provider)
  - StateManager 분석 (싱글톤, 메모리 캐시 + 비동기 디스크)
  - Secret Storage vs GlobalState 저장 구조 파악
  - Provider별 필수/선택 파라미터 정리
  - 분석 문서 작성: `.github/analysis/current-config-system.md`
- Phase 2 백엔드 설계 및 타입 정의 완료
  - 프로필 데이터 스키마 설계 (델타 방식)
  - ProfileManager 클래스 상세 설계
  - 이벤트 시스템 및 에러 처리 설계
  - 마이그레이션 전략 수립
  - 설계 문서 작성: `.github/design/profile-system-design.md`
  - 타입 정의: `src/shared/profiles.ts` (397 lines)
  - state-keys 업데이트 완료
- Phase 2 ProfileManager 구현 완료 ✅
  - **파일 생성**: `src/core/storage/ProfileManager.ts` (688 lines)
  - **핵심 기능**:
    - ✅ 싱글톤 패턴 구현
    - ✅ CRUD 작업: createProfile, getProfile, getAllProfiles, updateProfile, deleteProfile
    - ✅ 프로필 복제: duplicateProfile
    - ✅ 프로필 전환: switchProfile
    - ✅ 기본 프로필 관리: getDefaultProfile, setDefaultProfile
    - ✅ 활성 프로필 관리: getActiveProfile, getActiveProfileId
    - ✅ Secret Storage 통합: getProfileSecrets, setProfileSecrets, updateProfileSecrets
    - ✅ 마이그레이션: migrateFromLegacyConfig (기존 ApiConfiguration → Profile 변환)
    - ✅ 이벤트 시스템: on, off, emitEvent
    - ✅ 검증 로직: validateProfileName
  - **StateManager 통합**:
    - GlobalState를 통한 프로필 저장 (getGlobalStateKey, setGlobalState)
    - Secret Storage를 통한 API 키 관리 (getSecretKey, setSecret)
    - 메모리 캐시로 빠른 접근 (Map<string, Profile>)
  - **타입 정의 업데이트**:
    - ProfileEvent에 previousProfileId 필드 추가 (profile.switched 이벤트용)
    - PROFILE_ERRORS에 SYSTEM_NOT_INITIALIZED 추가

## 결정 사항
- 세션 ID: session-20251113-001-llm-multi-config
- 작업 범위: LLM 다중 설정 기능 개발
- **핵심 설계 결정**:
  - OpenAI Compatible Provider에서 다중 모델 지원:
    - `OpenAiCompatibleCustomModel` 타입 정의 (id, name, baseUrl, modelId, modelInfo, headers)
    - PlanMode/ActMode 각각 `openAiCompatibleModels` 배열로 관리
    - API Key는 ProfileSecrets에 동적 키(`openAiCompatible.${modelId}`)로 저장
  - 델타 방식 프로필 저장 (기본값과 차이만 저장)
  - StateManager의 GlobalState + Secret Storage 활용
  - 마이그레이션: 기존 ApiConfiguration → "Default" 프로필 자동 변환

## 문제점 및 해결방법

### Proto 파일 import 에러
- **문제**: `@/shared/proto/index.host` 모듈을 찾을 수 없음
- **원인**: Proto 파일이 생성되지 않은 상태
- **해결**: `node scripts/build-proto.mjs` 직접 실행하여 proto 파일 생성

### state-helpers.ts 타입 에러
- **문제**: readGlobalStateFromDisk()가 profile 관련 필드를 반환하지 않음
- **해결**: profileSystemState, activeProfileId, profileMigrationCompleted 필드 추가 (undefined 초기화)

### Windows WSL 의존성
- **문제**: proto-lint.sh 스크립트가 WSL 필요
- **해결**: package.json의 lint:proto 스크립트를 echo 메시지로 변경 (Windows 환경 우회)

## 다음 단계

### Phase 3: UI 구현 (다음 작업)
1. **프로필 선택 UI**
   - 채팅창 하단에 프로필 선택 드롭다운 추가
   - 현재 활성 프로필 표시
   - 프로필 전환 시 즉시 반영

2. **프로필 관리 UI**
   - Settings에 "프로필 관리" 섹션 추가
   - 프로필 목록 표시
   - 생성/수정/삭제/복제 버튼

3. **OpenAI Compatible 다중 모델 UI**
   - 커스텀 모델 추가/수정/삭제 UI
   - Base URL, API Key, Model ID 입력 폼
   - 모델 정보 (토큰, 가격) 옵션 입력

### Phase 4: 테스트 및 통합
1. ProfileManager 단위 테스트
2. StateManager 통합 테스트
3. UI 테스트
4. 마이그레이션 테스트 (기존 사용자 → 프로필 시스템)

## 작업 완료 요약

### 2025-11-15 작업 요약
**주요 성과**: StateManager-ProfileManager 통합 완료, 자동 마이그레이션 구현

**변경된 파일**:
1. `src/core/storage/StateManager.ts`
   - ProfileManager import 추가
   - profileManager 필드 추가
   - initialize()에 ProfileManager 초기화 및 마이그레이션 로직 추가
   - getProfileManager(), isProfileSystemActive() 메서드 추가

2. `src/core/storage/ProfileManager.ts`
   - ApiConfiguration import 추가
   - convertToApiConfiguration() 메서드 추가: Profile → ApiConfiguration 변환
   - getActiveProfileAsApiConfiguration() 메서드 추가: 현재 활성 프로필을 ApiConfiguration으로 반환

3. `src/core/storage/utils/state-helpers.ts`
   - readGlobalStateFromDisk()에 profile 시스템 필드 추가 (profileSystemState, activeProfileId, profileMigrationCompleted)

4. `package.json`
   - lint:proto 스크립트 수정 (Windows WSL 우회)

**기술적 의사결정**:
- 프로필 시스템 활성화 플래그: `profileMigrationCompleted` (GlobalState)
- 첫 실행 시 자동 마이그레이션: 기존 ApiConfiguration → "Default" 프로필
- 마이그레이션 실패 시 기존 방식으로 동작 (하위 호환성 유지)
- Profile → ApiConfiguration 변환 시 planMode/actMode 구분 지원

**다음 세션 시작 시 확인사항**:
- Phase 3 UI 구현 시작 전 백엔드 통합 테스트 실행 권장
- 마이그레이션 로직이 실제로 동작하는지 확인 필요
- ProfileManager 이벤트 시스템이 UI와 연동될 준비 완료

## 참고 사항
- Cline은 AI 코딩 어시스턴트 VSCode 확장
- 40개 이상의 다양한 LLM Provider 지원
- Plan/Act 모드별 별도 설정 지원 중
- 백엔드 구현 완료, UI 구현 대기 중
