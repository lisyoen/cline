# 현재 설정 시스템 분석

## 날짜
2025-11-13

## 분석 개요
Cline의 현재 LLM API 설정 시스템을 분석하여 다중 프로필 기능 개발의 기반을 마련합니다.

---

## 1. ApiConfiguration 인터페이스 구조

### 위치
- `src/shared/api.ts` (3887 lines)

### 주요 구성 요소

#### 1.1 ApiProvider 타입 (43개)
```typescript
type ApiProvider = 
  | "anthropic" | "claude-code" | "openrouter" | "bedrock" 
  | "vertex" | "openai" | "ollama" | "lmstudio" | "gemini"
  | "openai-native" | "requesty" | "together" | "deepseek"
  | "qwen" | "qwen-code" | "doubao" | "mistral" | "vscode-lm"
  | "cline" | "litellm" | "moonshot" | "nebius" | "fireworks"
  | "asksage" | "xai" | "sambanova" | "cerebras" | "sapaicore"
  | "groq" | "huggingface" | "huawei-cloud-maas" | "dify"
  | "baseten" | "vercel-ai-gateway" | "zai" | "oca"
  | "aihubmix" | "minimax" | "hicap" | "nousResearch"
```

#### 1.2 ApiHandlerSecrets 인터페이스
**민감 정보 - VSCode Secret Storage에 저장됨**

주요 필드:
- `apiKey` (Anthropic)
- `openRouterApiKey`
- `openAiApiKey`
- `geminiApiKey`
- `awsAccessKey`, `awsSecretKey`, `awsSessionToken`
- `clineAccountId`
- 기타 40+ Provider별 API 키들

총 약 30개의 민감 정보 필드

#### 1.3 ApiHandlerOptions 인터페이스
**일반 설정 - VSCode GlobalState에 저장됨**

**전역 설정 (모드 공통):**
- `ulid` - 태스크 식별자
- `anthropicBaseUrl`
- `openAiBaseUrl`
- `awsRegion`
- `awsUseCrossRegionInference`
- `awsUseGlobalInference`
- `vertexProjectId`, `vertexRegion`
- `ollamaBaseUrl`, `ollamaApiOptionsCtxNum`
- `geminiBaseUrl`
- `requestTimeoutMs`
- Provider별 base URL 및 일반 설정들

**Plan Mode 전용 설정 (약 30개 필드):**
- `planModeApiModelId`
- `planModeThinkingBudgetTokens`
- `planModeReasoningEffort`
- `planModeVsCodeLmModelSelector`
- `planModeOpenRouterModelId`
- `planModeOpenRouterModelInfo`
- `planModeOpenAiModelId`
- `planModeOpenAiModelInfo`
- Provider별 모델 설정들

**Act Mode 전용 설정 (약 30개 필드):**
- `actModeApiModelId`
- `actModeThinkingBudgetTokens`
- `actModeReasoningEffort`
- `actModeVsCodeLmModelSelector`
- `actModeOpenRouterModelId`
- `actModeOpenRouterModelInfo`
- `actModeOpenAiModelId`
- `actModeOpenAiModelInfo`
- Provider별 모델 설정들

#### 1.4 ApiConfiguration 최종 타입
```typescript
type ApiConfiguration = ApiHandlerOptions & ApiHandlerSecrets & {
  planModeApiProvider?: ApiProvider
  actModeApiProvider?: ApiProvider
}
```

**총 필드 수: 약 100개 이상**

---

## 2. 설정 저장/로드 메커니즘

### 위치
- `src/core/storage/StateManager.ts` (1238 lines)

### 2.1 StateManager 클래스
**싱글톤 패턴 - 메모리 캐시 + 비동기 디스크 저장**

#### 주요 캐시
```typescript
class StateManager {
  private globalStateCache: GlobalStateAndSettings
  private taskStateCache: Partial<Settings>
  private remoteConfigCache: Partial<RemoteConfigFields>
  private secretsCache: Secrets
  private workspaceStateCache: LocalState
}
```

#### 초기화 프로세스
```typescript
static async initialize(context: ExtensionContext): Promise<StateManager> {
  // 1. 디스크에서 전역 상태 로드
  const globalState = await readGlobalStateFromDisk(context)
  
  // 2. Secret Storage에서 민감 정보 로드
  const secrets = await readSecretsFromDisk(context)
  
  // 3. Workspace State 로드
  const workspaceState = await readWorkspaceStateFromDisk(context)
  
  // 4. 캐시 채우기
  instance.populateCache(globalState, secrets, workspaceState)
  
  // 5. 파일 감시자 설정
  await instance.setupTaskHistoryWatcher()
}
```

### 2.2 API 설정 접근 메서드

#### getApiConfiguration()
```typescript
getApiConfiguration(): ApiConfiguration {
  // 캐시에서 모든 API 설정 필드를 조합하여 반환
  return this.constructApiConfigurationFromCache()
}
```

#### setApiConfiguration(apiConfiguration)
```typescript
setApiConfiguration(apiConfiguration: ApiConfiguration): void {
  // 1. Secret Storage에 저장할 필드 분리
  const secrets = {
    apiKey,
    openRouterApiKey,
    awsAccessKey,
    awsSecretKey,
    // ... 모든 민감 정보
  }
  
  // 2. GlobalState에 저장할 필드 분리
  const globalState = {
    anthropicBaseUrl,
    openAiBaseUrl,
    awsRegion,
    // ... 모든 일반 설정
  }
  
  // 3. 각각 별도로 저장
  this.setSecrets(secrets)
  this.setGlobalState(globalState)
}
```

### 2.3 저장 위치

#### VSCode Secret Storage
- **저장 내용**: API 키 및 민감 정보
- **암호화**: VSCode가 자동으로 암호화하여 저장
- **위치**: OS별 안전한 키체인
  - Windows: Credential Manager
  - macOS: Keychain
  - Linux: Secret Service API

#### VSCode GlobalState
- **저장 내용**: 일반 설정 (모델 ID, URL, 파라미터 등)
- **위치**: `~/.vscode/globalStorage/saoudrizwan.claude-dev/`
- **형식**: JSON 파일

#### VSCode WorkspaceState
- **저장 내용**: 작업 영역별 설정
- **위치**: `.vscode/` 폴더 또는 작업 영역 설정

### 2.4 Debounced 저장 메커니즘
```typescript
private readonly PERSISTENCE_DELAY_MS = 500

// 변경 사항을 500ms 동안 모아서 한 번에 저장
private schedulePersistence() {
  if (this.persistenceTimeout) {
    clearTimeout(this.persistenceTimeout)
  }
  
  this.persistenceTimeout = setTimeout(() => {
    this.persistChanges()
  }, this.PERSISTENCE_DELAY_MS)
}
```

---

## 3. Provider별 필수/선택 파라미터

### 3.1 공통 필수 파라미터
모든 Provider에 필요:
- API Provider 선택 (`planModeApiProvider`, `actModeApiProvider`)
- 모델 ID (`planModeApiModelId`, `actModeApiModelId`)

### 3.2 Provider별 특화 파라미터

#### Anthropic
- **필수**: `apiKey`
- **선택**: `anthropicBaseUrl`, `thinkingBudgetTokens`

#### OpenRouter
- **필수**: `openRouterApiKey`, `openRouterModelId`
- **선택**: `openRouterModelInfo`, `openRouterProviderSorting`

#### AWS Bedrock
- **필수**: `awsAccessKey`, `awsSecretKey`, `awsRegion`
- **선택**: 
  - `awsSessionToken`
  - `awsUseCrossRegionInference`
  - `awsUseGlobalInference`
  - `awsBedrockUsePromptCache`
  - `awsAuthentication` ("profile" | "credentials")
  - `awsProfile`, `awsUseProfile`

#### Google Vertex/Gemini
- **필수**: `vertexProjectId`, `vertexRegion` 또는 `geminiApiKey`
- **선택**: `geminiBaseUrl`, `thinkingBudgetTokens`

#### OpenAI
- **필수**: `openAiApiKey`, `openAiModelId`
- **선택**: 
  - `openAiBaseUrl`
  - `azureApiVersion` (Azure 사용 시)
  - `openAiHeaders` (커스텀 헤더)

#### Ollama
- **필수**: `ollamaModelId`
- **선택**: `ollamaBaseUrl` (기본: http://localhost:11434), `ollamaApiKey`, `ollamaApiOptionsCtxNum`

#### LM Studio
- **필수**: `lmStudioModelId`
- **선택**: `lmStudioBaseUrl` (기본: http://localhost:1234), `lmStudioMaxTokens`

#### 기타 Provider (40+)
각 Provider마다 고유한 API 키와 설정 필드 조합

---

## 4. 현재 설정 UI

### 위치
- `webview-ui/src/` (React 컴포넌트)

### 주요 UI 컴포넌트
- Settings Panel: API Provider 선택 및 설정 입력
- Model Selection: 모델 선택 드롭다운
- Plan/Act Mode Toggle: 모드 전환 스위치

---

## 5. 다중 프로필 구현을 위한 고려사항

### 5.1 데이터 구조 설계

#### 옵션 1: 프로필별 전체 복사
```typescript
interface Profile {
  id: string
  name: string
  description?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
  configuration: ApiConfiguration  // 전체 설정 복사
}

interface ProfileStorage {
  profiles: Profile[]
  activeProfileId: string
}
```

**장점:**
- 구현 단순
- 프로필 간 독립성 보장

**단점:**
- 스토리지 사용량 증가
- 중복 데이터 많음

#### 옵션 2: 델타 방식 (추천)
```typescript
interface ProfileBase {
  id: string
  name: string
  description?: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

interface Profile extends ProfileBase {
  // Plan Mode
  planModeApiProvider?: ApiProvider
  planModeApiModelId?: string
  planModeConfiguration?: Partial<ApiConfiguration>
  
  // Act Mode
  actModeApiProvider?: ApiProvider
  actModeApiModelId?: string
  actModeConfiguration?: Partial<ApiConfiguration>
  
  // 공통 설정 (필요한 경우만)
  commonConfiguration?: Partial<ApiConfiguration>
}
```

**장점:**
- 스토리지 효율적
- 필요한 설정만 저장
- 기본값 활용 가능

**단점:**
- 구현 복잡도 증가
- 병합 로직 필요

### 5.2 Secret Storage 관리

#### 문제점
- Secret Storage는 flat key-value 구조
- 프로필별 API 키 관리 필요

#### 해결 방안
```typescript
// 프로필 ID를 접두사로 사용
const secretKey = `profile:${profileId}:apiKey`
const secretKey = `profile:${profileId}:openRouterApiKey`

// 또는 JSON 직렬화
const secretKey = `profile:${profileId}:secrets`
const secretValue = JSON.stringify({
  apiKey: "...",
  openRouterApiKey: "..."
})
```

### 5.3 마이그레이션 전략

#### 첫 실행 시
```typescript
async function migrateToProfileSystem() {
  // 1. 현재 설정 읽기
  const currentConfig = stateManager.getApiConfiguration()
  
  // 2. "Default" 프로필 생성
  const defaultProfile: Profile = {
    id: generateId(),
    name: "Default",
    isDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    configuration: currentConfig
  }
  
  // 3. 프로필 저장
  await saveProfile(defaultProfile)
  
  // 4. 마이그레이션 완료 플래그 설정
  await stateManager.set("profileMigrationComplete", true)
}
```

### 5.4 프로필 전환 메커니즘

```typescript
async function switchProfile(profileId: string) {
  // 1. 프로필 로드
  const profile = await loadProfile(profileId)
  
  // 2. API Configuration 구성
  const apiConfig = mergeConfiguration(
    getDefaultConfiguration(),
    profile.configuration
  )
  
  // 3. StateManager에 적용
  stateManager.setApiConfiguration(apiConfig)
  
  // 4. 활성 프로필 ID 저장
  await stateManager.set("activeProfileId", profileId)
  
  // 5. UI 업데이트 이벤트 발생
  eventEmitter.emit("profileChanged", profile)
}
```

### 5.5 UI 구조 제안

```
┌─────────────────────────────────────┐
│ ▼ Profile: Work                  ⚙️ │ <- 드롭다운 + 설정 버튼
├─────────────────────────────────────┤
│ Plan Mode: OpenRouter              │
│ Model: claude-3.5-sonnet           │
│                                     │
│ Act Mode: Anthropic                │
│ Model: claude-3-opus               │
└─────────────────────────────────────┘

프로필 관리 대화상자:
┌─────────────────────────────────────┐
│ Profile Management               ✕  │
├─────────────────────────────────────┤
│ ○ Default (Active)                  │
│ ○ Work                              │
│ ○ Personal                          │
│                                     │
│ [+ New] [✏️ Edit] [🗑️ Delete]      │
│ [⬆️ Export] [⬇️ Import]              │
└─────────────────────────────────────┘
```

---

## 6. 구현 우선순위 제안

### Phase 1: 핵심 백엔드 (2-3일)
1. Profile 데이터 구조 정의
2. ProfileManager 클래스 구현
3. Secret Storage 통합
4. 기본 CRUD 작업

### Phase 2: 마이그레이션 (1일)
1. 마이그레이션 로직
2. 기존 설정 → Default 프로필 변환
3. 버전 관리

### Phase 3: UI (2-3일)
1. 프로필 선택 드롭다운
2. 프로필 관리 대화상자
3. 프로필 편집 폼

### Phase 4: 고급 기능 (1-2일)
1. 프로필 가져오기/내보내기
2. 프로필 복제
3. 단축키 지원

### Phase 5: 테스트 및 문서화 (2일)
1. 단위 테스트
2. 통합 테스트
3. 사용자 문서
4. PR 준비

---

## 7. 잠재적 문제점 및 해결 방안

### 7.1 설정 크기
**문제**: ApiConfiguration이 100+ 필드로 매우 큼
**해결**: 델타 방식 + 기본값 활용

### 7.2 Secret Storage 제약
**문제**: Secret Storage는 key-value만 지원
**해결**: JSON 직렬화 또는 key prefix 사용

### 7.3 하위 호환성
**문제**: 기존 사용자 설정 보존
**해결**: 자동 마이그레이션 + 롤백 가능

### 7.4 동기화
**문제**: 프로필 변경 시 UI 전체 업데이트 필요
**해결**: 이벤트 기반 아키텍처 + React Context

---

## 다음 단계

1. ✅ 현재 설정 시스템 분석 완료
2. ⬜ Profile 데이터 스키마 상세 설계
3. ⬜ ProfileManager 클래스 설계
4. ⬜ UI 목업 작성
5. ⬜ 구현 시작
