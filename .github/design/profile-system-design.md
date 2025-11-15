# Profile System Design

## 날짜
2025-11-13

## 개요
Cline의 다중 LLM 프로필 시스템 상세 설계

**핵심 기능**: OpenAI Compatible Provider에서 Base URL + API Key + Model ID 세트를 다중 등록하여 Cline Provider처럼 채팅창 하단에서 모델을 선택할 수 있도록 구현.

**사용 시나리오**:
- 사용자가 여러 개의 커스텀 LLM 엔드포인트(로컬 Ollama, 회사 내부 LLM 서버, 커스텀 OpenAI 호환 API 등)를 하나의 프로필에 등록
- 채팅 중 모델 전환 시 Base URL과 API Key가 함께 변경됨
- Cline Provider의 모델 선택 UI와 동일한 사용자 경험 제공

---

## 1. 데이터 스키마

### 1.1 Profile 인터페이스

```typescript
/**
 * 프로필 메타데이터
 */
interface ProfileMetadata {
  id: string                    // ULID 또는 UUID
  name: string                  // 사용자 정의 이름 (최대 50자)
  description?: string          // 선택적 설명 (최대 200자)
  isDefault: boolean           // 기본 프로필 여부
  createdAt: string            // ISO 8601 timestamp
  updatedAt: string            // ISO 8601 timestamp
  color?: string               // UI 색상 태그 (옵션)
  icon?: string                // 아이콘 이름 (옵션)
}

/**
 * 프로필 설정 - 델타 방식
 * 설정되지 않은 필드는 기본값 사용
 */
interface ProfileConfiguration {
  // Plan Mode Provider 설정
  planMode?: {
    apiProvider?: ApiProvider
    apiModelId?: string
    thinkingBudgetTokens?: number
    reasoningEffort?: string
    
    // Provider별 특화 설정
    openRouterModelId?: string
    openRouterModelInfo?: ModelInfo
    openAiModelId?: string
    openAiModelInfo?: OpenAiCompatibleModelInfo
    ollamaModelId?: string
    lmStudioModelId?: string
    
    // ⭐ OpenAI Compatible 다중 모델 설정
    openAiCompatibleModels?: Array<{
      id: string                                  // 내부 식별자 (ULID)
      name: string                                // 사용자 정의 이름 (UI 표시용)
      baseUrl: string                             // API 엔드포인트
      modelId: string                             // 모델 ID (예: "gpt-4", "llama2")
      modelInfo?: OpenAiCompatibleModelInfo       // 모델 정보 (토큰, 가격 등)
      apiKey?: string                             // API Key (Secret Storage 참조 ID)
      headers?: Record<string, string>            // 커스텀 헤더
    }>
    // ... 기타 Provider별 모델 설정
  }
  
  // Act Mode Provider 설정
  actMode?: {
    apiProvider?: ApiProvider
    apiModelId?: string
    thinkingBudgetTokens?: number
    reasoningEffort?: string
    
    // Provider별 특화 설정
    openRouterModelId?: string
    openRouterModelInfo?: ModelInfo
    openAiModelId?: string
    openAiModelInfo?: OpenAiCompatibleModelInfo
    ollamaModelId?: string
    lmStudioModelId?: string
    
    // ⭐ OpenAI Compatible 다중 모델 설정
    openAiCompatibleModels?: Array<{
      id: string
      name: string
      baseUrl: string
      modelId: string
      modelInfo?: OpenAiCompatibleModelInfo
      apiKey?: string
      headers?: Record<string, string>
    }>
    // ... 기타 Provider별 모델 설정
  }
  
  // 공통 설정 (필요한 경우만)
  common?: {
    anthropicBaseUrl?: string
    openAiBaseUrl?: string
    ollamaBaseUrl?: string
    geminiBaseUrl?: string
    awsRegion?: string
    vertexProjectId?: string
    vertexRegion?: string
    requestTimeoutMs?: number
    // ... 기타 공통 설정
  }
}

/**
 * 완전한 프로필
 */
interface Profile {
  metadata: ProfileMetadata
  configuration: ProfileConfiguration
}
```

### 1.2 Secret 관리

```typescript
/**
 * 프로필별 Secrets
 * Secret Storage에 별도 저장
 */
interface ProfileSecrets {
  // API Keys
  apiKey?: string                    // Anthropic
  openRouterApiKey?: string
  openAiApiKey?: string
  geminiApiKey?: string
  awsAccessKey?: string
  awsSecretKey?: string
  awsSessionToken?: string
  // ... 모든 Provider API 키
  
  // 기타 민감 정보
  awsProfile?: string
  claudeCodePath?: string
  qwenCodeOauthPath?: string
}
```

### 1.3 저장 구조

```typescript
/**
 * GlobalState에 저장되는 프로필 시스템 상태
 */
interface ProfileSystemState {
  version: number                    // 스키마 버전 (마이그레이션용)
  activeProfileId: string            // 현재 활성 프로필 ID
  profiles: Profile[]                // 모든 프로필 목록
  migrationCompleted: boolean        // 마이그레이션 완료 여부
}

/**
 * Secret Storage 키 형식
 * Key: "cline.profile.{profileId}.secrets"
 * Value: JSON.stringify(ProfileSecrets)
 */
```

---

## 2. ProfileManager 클래스 설계

### 2.1 클래스 구조

```typescript
/**
 * 프로필 관리 클래스
 * 싱글톤 패턴, StateManager와 통합
 */
class ProfileManager {
  private static instance: ProfileManager | null = null
  private stateManager: StateManager
  private cache: Map<string, Profile> = new Map()
  
  // 이벤트 이미터
  onProfileChanged?: (profile: Profile) => void
  onProfilesUpdated?: (profiles: Profile[]) => void
  
  private constructor(stateManager: StateManager) {
    this.stateManager = stateManager
  }
  
  static async initialize(stateManager: StateManager): Promise<ProfileManager>
  static get(): ProfileManager
  
  // CRUD 작업
  async createProfile(name: string, description?: string): Promise<Profile>
  async getProfile(profileId: string): Promise<Profile | null>
  async getAllProfiles(): Promise<Profile[]>
  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<Profile>
  async deleteProfile(profileId: string): Promise<void>
  async duplicateProfile(profileId: string, newName: string): Promise<Profile>
  
  // 프로필 전환
  async switchProfile(profileId: string): Promise<void>
  getActiveProfile(): Promise<Profile>
  getActiveProfileId(): string
  
  // 기본 프로필
  async setDefaultProfile(profileId: string): Promise<void>
  async getDefaultProfile(): Promise<Profile>
  
  // Secrets 관리
  async getProfileSecrets(profileId: string): Promise<ProfileSecrets>
  async setProfileSecrets(profileId: string, secrets: ProfileSecrets): Promise<void>
  async updateProfileSecrets(profileId: string, updates: Partial<ProfileSecrets>): Promise<void>
  
  // 프로필 → ApiConfiguration 변환
  async getApiConfiguration(profileId: string): Promise<ApiConfiguration>
  async setApiConfigurationFromProfile(profileId: string): Promise<void>
  
  // Import/Export
  async exportProfile(profileId: string, includeSecrets?: boolean): Promise<string>
  async importProfile(data: string): Promise<Profile>
  
  // 마이그레이션
  async migrateFromLegacyConfig(): Promise<Profile>
}
```

### 2.2 주요 메서드 로직

#### createProfile()
```typescript
async createProfile(name: string, description?: string): Promise<Profile> {
  // 1. ID 생성 (ULID)
  const id = ulid()
  
  // 2. 메타데이터 생성
  const metadata: ProfileMetadata = {
    id,
    name,
    description,
    isDefault: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  // 3. 빈 설정으로 프로필 생성
  const profile: Profile = {
    metadata,
    configuration: {}
  }
  
  // 4. 저장
  await this.saveProfile(profile)
  
  // 5. 이벤트 발생
  this.onProfilesUpdated?.(await this.getAllProfiles())
  
  return profile
}
```

#### switchProfile()
```typescript
async switchProfile(profileId: string): Promise<void> {
  // 1. 프로필 존재 확인
  const profile = await this.getProfile(profileId)
  if (!profile) {
    throw new Error(`Profile ${profileId} not found`)
  }
  
  // 2. ApiConfiguration 생성
  const apiConfig = await this.getApiConfiguration(profileId)
  
  // 3. StateManager에 적용
  this.stateManager.setApiConfiguration(apiConfig)
  
  // 4. 활성 프로필 ID 저장
  await this.stateManager.set("activeProfileId", profileId)
  
  // 5. 이벤트 발생
  this.onProfileChanged?.(profile)
}
```

#### getApiConfiguration()
```typescript
async getApiConfiguration(profileId: string): Promise<ApiConfiguration> {
  // 1. 프로필 로드
  const profile = await this.getProfile(profileId)
  if (!profile) {
    throw new Error(`Profile ${profileId} not found`)
  }
  
  // 2. Secrets 로드
  const secrets = await this.getProfileSecrets(profileId)
  
  // 3. 기본 설정 로드
  const defaults = getDefaultApiConfiguration()
  
  // 4. 병합 (defaults <- profile.configuration <- secrets)
  const merged: ApiConfiguration = {
    ...defaults,
    ...profile.configuration.common,
    
    // Plan Mode
    planModeApiProvider: profile.configuration.planMode?.apiProvider,
    planModeApiModelId: profile.configuration.planMode?.apiModelId,
    planModeThinkingBudgetTokens: profile.configuration.planMode?.thinkingBudgetTokens,
    // ... 모든 Plan Mode 필드
    
    // Act Mode
    actModeApiProvider: profile.configuration.actMode?.apiProvider,
    actModeApiModelId: profile.configuration.actMode?.apiModelId,
    actModeThinkingBudgetTokens: profile.configuration.actMode?.thinkingBudgetTokens,
    // ... 모든 Act Mode 필드
    
    // Secrets
    ...secrets
  }
  
  return merged
}
```

#### exportProfile()
```typescript
async exportProfile(profileId: string, includeSecrets = false): Promise<string> {
  // 1. 프로필 로드
  const profile = await this.getProfile(profileId)
  if (!profile) {
    throw new Error(`Profile ${profileId} not found`)
  }
  
  // 2. Export 데이터 구성
  const exportData: any = {
    version: 1,
    profile: {
      ...profile,
      metadata: {
        ...profile.metadata,
        id: undefined, // 새 ID 생성을 위해 제거
        createdAt: undefined,
        updatedAt: undefined
      }
    }
  }
  
  // 3. Secrets 포함 (옵션)
  if (includeSecrets) {
    const secrets = await this.getProfileSecrets(profileId)
    exportData.secrets = secrets
  }
  
  // 4. JSON 직렬화
  return JSON.stringify(exportData, null, 2)
}
```

#### migrateFromLegacyConfig()
```typescript
async migrateFromLegacyConfig(): Promise<Profile> {
  // 1. 마이그레이션 완료 확인
  const migrated = await this.stateManager.get("profileMigrationCompleted")
  if (migrated) {
    return await this.getDefaultProfile()
  }
  
  // 2. 현재 ApiConfiguration 로드
  const currentConfig = this.stateManager.getApiConfiguration()
  
  // 3. "Default" 프로필 생성
  const defaultProfile = await this.createProfile(
    "Default",
    "Migrated from existing configuration"
  )
  
  // 4. 설정을 프로필 형식으로 변환
  const profileConfig: ProfileConfiguration = {
    planMode: {
      apiProvider: currentConfig.planModeApiProvider,
      apiModelId: currentConfig.planModeApiModelId,
      thinkingBudgetTokens: currentConfig.planModeThinkingBudgetTokens,
      // ... 모든 Plan Mode 필드
    },
    actMode: {
      apiProvider: currentConfig.actModeApiProvider,
      apiModelId: currentConfig.actModeApiModelId,
      thinkingBudgetTokens: currentConfig.actModeThinkingBudgetTokens,
      // ... 모든 Act Mode 필드
    },
    common: {
      anthropicBaseUrl: currentConfig.anthropicBaseUrl,
      openAiBaseUrl: currentConfig.openAiBaseUrl,
      // ... 모든 공통 필드
    }
  }
  
  // 5. Secrets 추출 및 저장
  const secrets: ProfileSecrets = {
    apiKey: currentConfig.apiKey,
    openRouterApiKey: currentConfig.openRouterApiKey,
    // ... 모든 Secret 필드
  }
  
  // 6. 프로필 업데이트
  await this.updateProfile(defaultProfile.metadata.id, {
    configuration: profileConfig
  })
  await this.setProfileSecrets(defaultProfile.metadata.id, secrets)
  
  // 7. 기본 프로필로 설정
  await this.setDefaultProfile(defaultProfile.metadata.id)
  
  // 8. 활성 프로필로 설정
  await this.switchProfile(defaultProfile.metadata.id)
  
  // 9. 마이그레이션 완료 플래그
  await this.stateManager.set("profileMigrationCompleted", true)
  
  return defaultProfile
}
```

---

## 3. 저장소 구조

### 3.1 GlobalState Keys

```typescript
// src/shared/storage/state-keys.ts에 추가

export type GlobalStateKey = 
  // ... 기존 키들
  | "profileSystemState"
  | "activeProfileId"
  | "profileMigrationCompleted"

interface ProfileSystemStateValue {
  version: number
  profiles: Profile[]
}
```

### 3.2 Secret Storage Keys

```typescript
// 키 형식
const SECRET_KEY_PREFIX = "cline.profile"

function getProfileSecretsKey(profileId: string): string {
  return `${SECRET_KEY_PREFIX}.${profileId}.secrets`
}

// 예시:
// "cline.profile.01HXYZ1234ABCD5678.secrets"
```

---

## 4. 이벤트 시스템

### 4.1 이벤트 타입

```typescript
type ProfileEvent = 
  | { type: "profile.created", profile: Profile }
  | { type: "profile.updated", profile: Profile }
  | { type: "profile.deleted", profileId: string }
  | { type: "profile.switched", profile: Profile }
  | { type: "profiles.reloaded", profiles: Profile[] }

class ProfileEventEmitter {
  private listeners: Map<string, Set<(event: ProfileEvent) => void>> = new Map()
  
  on(eventType: ProfileEvent["type"], handler: (event: ProfileEvent) => void): void
  off(eventType: ProfileEvent["type"], handler: (event: ProfileEvent) => void): void
  emit(event: ProfileEvent): void
}
```

---

## 5. 에러 처리

### 5.1 에러 타입

```typescript
class ProfileError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = "ProfileError"
  }
}

// 에러 코드
export const PROFILE_ERRORS = {
  NOT_FOUND: "PROFILE_NOT_FOUND",
  DUPLICATE_NAME: "PROFILE_DUPLICATE_NAME",
  INVALID_NAME: "PROFILE_INVALID_NAME",
  CANNOT_DELETE_ACTIVE: "PROFILE_CANNOT_DELETE_ACTIVE",
  CANNOT_DELETE_DEFAULT: "PROFILE_CANNOT_DELETE_DEFAULT",
  SECRETS_NOT_FOUND: "PROFILE_SECRETS_NOT_FOUND",
  IMPORT_INVALID: "PROFILE_IMPORT_INVALID",
  MIGRATION_FAILED: "PROFILE_MIGRATION_FAILED"
} as const
```

---

## 6. 유틸리티 함수

### 6.1 프로필 병합

```typescript
/**
 * 프로필 설정과 기본값을 병합
 */
function mergeProfileConfiguration(
  defaults: ApiConfiguration,
  profile: ProfileConfiguration,
  secrets: ProfileSecrets
): ApiConfiguration {
  // 깊은 병합 로직
  // defaults <- profile <- secrets 순서로 덮어쓰기
}
```

### 6.2 프로필 검증

```typescript
/**
 * 프로필 이름 유효성 검사
 */
function validateProfileName(name: string): boolean {
  if (!name || name.trim().length === 0) return false
  if (name.length > 50) return false
  // 특수 문자 제한 등
  return true
}

/**
 * 프로필 설정 유효성 검사
 */
function validateProfileConfiguration(config: ProfileConfiguration): boolean {
  // Provider와 모델 ID 조합 검증 등
}
```

---

## 7. StateManager 통합

### 7.1 StateManager 확장

```typescript
// StateManager.ts에 추가

class StateManager {
  // ... 기존 코드
  
  // ProfileManager 인스턴스
  private profileManager?: ProfileManager
  
  getProfileManager(): ProfileManager {
    if (!this.profileManager) {
      throw new Error("ProfileManager not initialized")
    }
    return this.profileManager
  }
  
  async initializeProfileManager(): Promise<void> {
    this.profileManager = await ProfileManager.initialize(this)
    
    // 마이그레이션 확인
    const migrated = await this.get("profileMigrationCompleted")
    if (!migrated) {
      await this.profileManager.migrateFromLegacyConfig()
    }
  }
}
```

---

## 8. 다음 단계

1. ✅ 프로필 데이터 스키마 설계 완료
2. ✅ ProfileManager 클래스 설계 완료
3. ⬜ 타입 정의 파일 작성 (`src/shared/profiles.ts`)
4. ⬜ ProfileManager 구현
5. ⬜ 단위 테스트 작성

---

## 참고사항

### 델타 방식의 장점
- 스토리지 효율적 (변경사항만 저장)
- 기본값 업데이트 시 자동 반영
- 프로필 크기 최소화

### 구현 복잡도 관리
- 처음엔 핵심 기능만 구현 (CRUD + 전환)
- 고급 기능은 점진적 추가 (복제, Import/Export)
- 철저한 타입 정의로 안정성 확보
