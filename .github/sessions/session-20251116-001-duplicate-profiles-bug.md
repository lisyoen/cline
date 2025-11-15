# Session: session-20251116-001-duplicate-profiles-bug

## 세션 정보
- **세션 ID**: session-20251116-001-duplicate-profiles-bug
- **시작 시간**: 2025-11-16
- **상태**: 🚧 진행 중
- **작업 유형**: 버그 수정
- **이전 세션**: session-20251115-003-settings-profile-ui

## 작업 목적
매번 Extension Host 재시작 시 중복된 Default 프로필이 생성되는 버그 수정

## 문제 발견

### 증상
- Extension Host 재시작할 때마다 새로운 "Default" 프로필이 생성됨
- 모든 프로필이 같은 이름 "Default"
- UI에 동일한 프로필이 여러 개 표시됨

![스크린샷 참조](사용자 제공 이미지)

### 사용자 보고
> "다시 실행해보니 같은 이름의 Default 프로파일이 잔뜩 생김, 게다가 모두 Default 임"

## 원인 분석

### 1. StateManager 마이그레이션 로직 확인
**파일**: `src/core/storage/StateManager.ts` (lines 105-135)

```typescript
// Profile system migration (first run only)
const migrationCompleted = StateManager.instance.globalStateCache["profileMigrationCompleted"]

if (!migrationCompleted) {
    try {
        const currentApiConfig = StateManager.instance.constructApiConfigurationFromCache()
        await StateManager.instance.profileManager.migrateFromLegacyConfig(currentApiConfig)
        StateManager.instance.setGlobalState("profileMigrationCompleted", true)
    } catch (error) {
        console.error("[Profile] Profile system migration failed:", error)
    }
}
```

**분석**:
- ✅ `profileMigrationCompleted` 플래그로 첫 실행만 체크
- ✅ 플래그가 true면 마이그레이션 건너뜀
- ❓ 그런데 왜 중복 생성?

### 2. ProfileManager.migrateFromLegacyConfig() 확인
**파일**: `src/core/storage/ProfileManager.ts` (lines 501-550)

```typescript
public migrateFromLegacyConfig(apiConfig: any): Profile {
    // "Default" 프로필 생성
    const metadata: ProfileMetadata = {
        id: ulid(),  // ⚠️ 매번 새 ID 생성!
        name: "Default",
        description: "Migrated from previous configuration",
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
    
    // ... 설정 추출 ...
    
    // 프로필 저장
    this.saveProfile(profile)  // ⚠️ 기존 확인 없이 무조건 저장!
    
    return profile
}
```

**문제 발견!**
1. **기존 "Default" 프로필 확인 안 함**
2. **매번 새 ulid() 생성**
3. **saveProfile()이 state.profiles 배열에 추가만 함**

### 3. saveProfile() 동작 확인
**추정 로직**:
```typescript
private saveProfile(profile: Profile): void {
    const state = this.getProfileSystemState()
    state.profiles.push(profile)  // ⚠️ 중복 체크 없이 추가!
    this.saveProfileSystemState(state)
}
```

### 근본 원인
**시나리오**:
1. 첫 실행: `profileMigrationCompleted = false`
   - `migrateFromLegacyConfig()` 호출
   - "Default" 프로필 생성 (ID: abc123)
   - `profileMigrationCompleted = true` 저장

2. 디버깅 중 `forceMigration = true` 사용:
   - `profileMigrationCompleted = true` 무시
   - `migrateFromLegacyConfig()` 강제 호출
   - 새 "Default" 프로필 생성 (ID: def456)
   - 기존 프로필 확인 안 함 → **중복 생성!**

3. Extension 개발 모드:
   - globalState가 초기화되거나
   - 여러 Extension Host 인스턴스가 동시에 실행되거나
   - 마이그레이션 플래그가 제대로 저장 안 되는 경우

## 해결 방법

### 1차 수정: migrateFromLegacyConfig() 중복 방지
```typescript
public migrateFromLegacyConfig(apiConfig: any): Profile {
    // ✅ 기존 "Default" 프로필 확인 추가
    const existingProfiles = this.getAllProfiles()
    const existingDefault = existingProfiles.find((p) => p.metadata.name === "Default")
    
    if (existingDefault) {
        console.log("[Profile] Default profile already exists, skipping migration:", existingDefault.metadata.id)
        return existingDefault
    }
    
    console.log("[Profile] Creating new Default profile from legacy configuration")
    
    // 새 프로필 생성 로직...
}
```

**효과**:
- 기존 "Default" 프로필이 있으면 재사용
- 중복 생성 방지
- 마이그레이션 안전성 향상

### 2차 개선 (향후): saveProfile() 중복 체크
```typescript
private saveProfile(profile: Profile): void {
    const state = this.getProfileSystemState()
    
    // 같은 ID가 있으면 업데이트, 없으면 추가
    const index = state.profiles.findIndex((p) => p.metadata.id === profile.metadata.id)
    if (index >= 0) {
        state.profiles[index] = profile
    } else {
        state.profiles.push(profile)
    }
    
    this.saveProfileSystemState(state)
}
```

## 작업 진행

### 1. migrateFromLegacyConfig() 수정 - 2025-11-16 ✅
**변경 사항**:
- 기존 "Default" 프로필 확인 로직 추가
- 있으면 기존 프로필 반환
- 없으면 새로 생성
- 로그 추가로 동작 추적 가능

**커밋**: 89105d7d "fix: migrateFromLegacyConfig()에 중복 방지 로직 추가"

### 2. 중복 프로필 정리 방법 제공 - 2025-11-16 ✅

사용자가 기존 중복 프로필을 정리하는 방법:

#### 방법 1: UI에서 수동 삭제 (권장)
1. Settings → Profiles 탭
2. 중복된 "Default" 프로필들 중 하나만 남기고 나머지 Delete (휴지통 아이콘)
3. 남은 프로필을 Activate

#### 방법 2: VSCode 설정 초기화 (완전 초기화)
1. VSCode 완전 종료
2. VSCode 설정 폴더로 이동:
   - Windows: `%APPDATA%\Code\User\globalStorage\`
   - Mac: `~/Library/Application Support/Code/User/globalStorage/`
   - Linux: `~/.config/Code/User/globalStorage/`
3. `saoudrizwan.claude-dev` 폴더 삭제
4. VSCode 재시작 → 자동으로 새 Default 프로필 생성

#### 방법 3: PowerShell 스크립트로 정리 (고급)
```powershell
# VSCode globalState JSON 파일 직접 수정
# 주의: VSCode 종료 후 실행!
$statePath = "$env:APPDATA\Code\User\globalStorage\saoudrizwan.claude-dev\state.vscdb"
# JSON 파싱하여 profileSystemState.profiles 배열에서 중복 제거
```

### 3. 테스트 및 검증 - 2025-11-16 🚧

**테스트 계획**:
1. ✅ 코드 수정 완료
2. ⬜ Extension Host 재시작
3. ⬜ 콘솔에서 "[Profile] Default profile already exists" 로그 확인
4. ⬜ Settings → Profiles에서 중복 생성 안 되는지 확인
5. ⬜ 기존 중복 프로필은 수동 삭제 필요

## 테스트 계획
1. VSCode 완전 종료
2. Extension Development Host 실행
3. Default 프로필 1개만 생성되는지 확인
4. 재시작 시 중복 생성 안 되는지 확인

## 참고 사항
- ProfileManager는 싱글톤
- globalState는 VSCode 재시작 시 유지됨
- Extension 개발 모드에서는 여러 Host 인스턴스 가능

## 다음 단계
1. ✅ 원인 분석 완료
2. 🚧 migrateFromLegacyConfig() 수정
3. ⬜ 중복 프로필 정리 방법 제공
4. ⬜ 테스트 및 검증
5. ⬜ 커밋 및 세션 완료
