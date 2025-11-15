import { ApiConfiguration } from "@shared/api"
import {
	PROFILE_ERRORS,
	type Profile,
	type ProfileConfiguration,
	ProfileError,
	type ProfileEvent,
	type ProfileMetadata,
	type ProfileSecrets,
	type ProfileSystemState,
} from "@shared/profiles"
import { ulid } from "ulid"
import type { StateManager } from "./StateManager"

/**
 * 프로필 관리 클래스
 * 싱글톤 패턴으로 모든 프로필 CRUD 작업 및 전환 관리
 */
export class ProfileManager {
	private static instance: ProfileManager | null = null
	private stateManager: StateManager
	private cache: Map<string, Profile> = new Map()
	private eventListeners: Map<string, Set<(event: ProfileEvent) => void>> = new Map()

	// Secret Storage 키 접두사
	private static readonly SECRET_KEY_PREFIX = "cline.profile"

	private constructor(stateManager: StateManager) {
		this.stateManager = stateManager
	}

	/**
	 * ProfileManager 초기화
	 */
	public static initialize(stateManager: StateManager): ProfileManager {
		if (!ProfileManager.instance) {
			ProfileManager.instance = new ProfileManager(stateManager)
			ProfileManager.instance.loadProfilesIntoCache()
		}
		return ProfileManager.instance
	}

	/**
	 * ProfileManager 인스턴스 가져오기
	 */
	public static get(): ProfileManager {
		if (!ProfileManager.instance) {
			throw new Error("ProfileManager not initialized. Call initialize() first.")
		}
		return ProfileManager.instance
	}

	/**
	 * 캐시에 프로필 로드
	 */
	private loadProfilesIntoCache(): void {
		try {
			const state = this.getProfileSystemState()
			if (state?.profiles) {
				for (const profile of state.profiles) {
					this.cache.set(profile.metadata.id, profile)
				}
			}
		} catch (error) {
			console.warn("[ProfileManager] Failed to load profiles into cache:", error)
			// 캐시 로드 실패 시 빈 캐시로 시작
		}
	}

	/**
	 * 프로필 시스템 상태 가져오기
	 */
	private getProfileSystemState(): ProfileSystemState | null {
		try {
			const state = this.stateManager.getGlobalStateKey("profileSystemState")
			return state || null
		} catch {
			// StateManager 초기화 중일 수 있음
			return null
		}
	}

	/**
	 * 프로필 시스템 상태 저장
	 */
	private saveProfileSystemState(state: ProfileSystemState): void {
		this.stateManager.setGlobalState("profileSystemState", state)
	}

	/**
	 * 새 프로필 생성
	 */
	public createProfile(name: string, description?: string): Profile {
		// 이름 검증
		if (!this.validateProfileName(name)) {
			throw new ProfileError("Invalid profile name", PROFILE_ERRORS.INVALID_NAME)
		}

		// 중복 이름 확인
		const profiles = this.getAllProfiles()
		if (profiles.some((p) => p.metadata.name === name)) {
			throw new ProfileError(`Profile with name "${name}" already exists`, PROFILE_ERRORS.DUPLICATE_NAME)
		}

		// 메타데이터 생성
		const metadata: ProfileMetadata = {
			id: ulid(),
			name,
			description,
			isDefault: false,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		// 빈 설정으로 프로필 생성
		const profile: Profile = {
			metadata,
			configuration: {},
		}

		// 저장
		this.saveProfile(profile)

		// 이벤트 발생
		this.emitEvent({ type: "profile.created", profile })

		return profile
	}

	/**
	 * 프로필 가져오기
	 */
	public getProfile(profileId: string): Profile | null {
		// 캐시 확인
		if (this.cache.has(profileId)) {
			return this.cache.get(profileId)!
		}

		// 스토리지에서 로드
		const state = this.getProfileSystemState()
		if (!state) {
			return null
		}

		const profile = state.profiles.find((p) => p.metadata.id === profileId)
		if (profile) {
			this.cache.set(profileId, profile)
		}

		return profile || null
	}

	/**
	 * 모든 프로필 가져오기
	 */
	public getAllProfiles(): Profile[] {
		const state = this.getProfileSystemState()
		if (!state) {
			return []
		}

		// 캐시 동기화
		for (const profile of state.profiles) {
			this.cache.set(profile.metadata.id, profile)
		}

		return state.profiles
	}

	/**
	 * 프로필 업데이트
	 */
	public updateProfile(profileId: string, updates: Partial<Profile>): Profile {
		const profile = this.getProfile(profileId)
		if (!profile) {
			throw new ProfileError(`Profile ${profileId} not found`, PROFILE_ERRORS.NOT_FOUND)
		}

		// 이름 변경 시 검증
		if (updates.metadata?.name && updates.metadata.name !== profile.metadata.name) {
			if (!this.validateProfileName(updates.metadata.name)) {
				throw new ProfileError("Invalid profile name", PROFILE_ERRORS.INVALID_NAME)
			}

			const profiles = this.getAllProfiles()
			const newName = updates.metadata.name // 타입 가드
			if (profiles.some((p) => p.metadata.id !== profileId && p.metadata.name === newName)) {
				throw new ProfileError(`Profile with name "${newName}" already exists`, PROFILE_ERRORS.DUPLICATE_NAME)
			}
		}

		// 업데이트된 프로필 생성
		const updatedProfile: Profile = {
			metadata: {
				...profile.metadata,
				...updates.metadata,
				id: profile.metadata.id, // ID는 변경 불가
				updatedAt: new Date().toISOString(),
			},
			configuration: updates.configuration
				? {
						...profile.configuration,
						...updates.configuration,
					}
				: profile.configuration,
		}

		// 저장
		this.saveProfile(updatedProfile)

		// 이벤트 발생
		this.emitEvent({ type: "profile.updated", profile: updatedProfile })

		return updatedProfile
	} /**
	 * 프로필 삭제
	 */
	public deleteProfile(profileId: string): void {
		const profile = this.getProfile(profileId)
		if (!profile) {
			throw new ProfileError(`Profile ${profileId} not found`, PROFILE_ERRORS.NOT_FOUND)
		}

		// 활성 프로필 삭제 방지
		const activeId = this.getActiveProfileId()
		if (activeId === profileId) {
			throw new ProfileError("Cannot delete active profile", PROFILE_ERRORS.CANNOT_DELETE_ACTIVE)
		}

		// 기본 프로필 삭제 방지
		if (profile.metadata.isDefault) {
			throw new ProfileError("Cannot delete default profile", PROFILE_ERRORS.CANNOT_DELETE_DEFAULT)
		}

		// 마지막 프로필 삭제 방지
		const profiles = this.getAllProfiles()
		if (profiles.length <= 1) {
			throw new ProfileError("Cannot delete the last profile", PROFILE_ERRORS.CANNOT_DELETE_LAST)
		}

		// 상태에서 제거
		const state = this.getProfileSystemState()
		if (state) {
			state.profiles = state.profiles.filter((p) => p.metadata.id !== profileId)
			this.saveProfileSystemState(state)
		}

		// 캐시에서 제거
		this.cache.delete(profileId)

		// 이벤트 발생
		this.emitEvent({ type: "profile.deleted", profileId })

		// Note: Secrets는 비동기 삭제가 필요하므로 별도로 호출 필요
	}

	/**
	 * 프로필 복제
	 */
	public duplicateProfile(profileId: string, newName: string): Profile {
		const sourceProfile = this.getProfile(profileId)
		if (!sourceProfile) {
			throw new ProfileError(`Profile ${profileId} not found`, PROFILE_ERRORS.NOT_FOUND)
		}

		// 새 프로필 생성
		const newProfile = this.createProfile(newName, `Copy of ${sourceProfile.metadata.name}`)

		// 설정 복사
		const updatedProfile = this.updateProfile(newProfile.metadata.id, {
			configuration: sourceProfile.configuration,
		})

		// Note: Secrets 복사는 비동기 처리가 필요하므로 별도 메서드 사용 필요

		return updatedProfile
	}

	/**
	 * 프로필 저장 (내부 메서드)
	 */
	private saveProfile(profile: Profile): void {
		const state = this.getProfileSystemState() || {
			version: 1,
			activeProfileId: profile.metadata.id,
			profiles: [],
			migrationCompleted: false,
		}

		// 프로필 목록 업데이트
		const index = state.profiles.findIndex((p) => p.metadata.id === profile.metadata.id)
		if (index >= 0) {
			state.profiles[index] = profile
		} else {
			state.profiles.push(profile)
		}

		// 저장
		this.saveProfileSystemState(state)

		// 캐시 업데이트
		this.cache.set(profile.metadata.id, profile)
	}

	/**
	 * 활성 프로필 ID 가져오기
	 */
	public getActiveProfileId(): string | null {
		const state = this.getProfileSystemState()
		return state?.activeProfileId || null
	}

	/**
	 * 활성 프로필 가져오기
	 */
	public getActiveProfile(): Profile | null {
		const activeId = this.getActiveProfileId()
		if (!activeId) {
			return null
		}
		return this.getProfile(activeId)
	}

	/**
	 * 기본 프로필 가져오기
	 */
	public getDefaultProfile(): Profile | null {
		const profiles = this.getAllProfiles()
		return profiles.find((p) => p.metadata.isDefault) || null
	}

	/**
	 * 기본 프로필 설정
	 */
	public setDefaultProfile(profileId: string): void {
		const profile = this.getProfile(profileId)
		if (!profile) {
			throw new ProfileError(`Profile ${profileId} not found`, PROFILE_ERRORS.NOT_FOUND)
		}

		const state = this.getProfileSystemState()
		if (!state) {
			return
		}

		// 모든 프로필의 isDefault를 false로 설정
		for (const p of state.profiles) {
			p.metadata.isDefault = false
		}

		// 선택한 프로필만 isDefault = true
		const targetProfile = state.profiles.find((p) => p.metadata.id === profileId)
		if (targetProfile) {
			targetProfile.metadata.isDefault = true
		}

		this.saveProfileSystemState(state)

		// 캐시 업데이트
		this.loadProfilesIntoCache()
	}

	/**
	 * Secret Storage 키 생성
	 */
	private getSecretKey(profileId: string): string {
		return `${ProfileManager.SECRET_KEY_PREFIX}.${profileId}.secrets`
	}

	/**
	 * 프로필 전환
	 */
	public switchProfile(profileId: string): void {
		const profile = this.getProfile(profileId)
		if (!profile) {
			throw new ProfileError(`Profile ${profileId} not found`, PROFILE_ERRORS.NOT_FOUND)
		}

		const state = this.getProfileSystemState()
		if (!state) {
			throw new ProfileError("Profile system not initialized", PROFILE_ERRORS.SYSTEM_NOT_INITIALIZED)
		}

		const oldProfileId = state.activeProfileId

		// 활성 프로필 변경
		state.activeProfileId = profileId
		this.saveProfileSystemState(state)

		// 이벤트 발생
		this.emitEvent({
			type: "profile.switched",
			profile,
			previousProfileId: oldProfileId,
		})
	}

	/**
	 * 프로필 Secrets 가져오기
	 */
	public getProfileSecrets(profileId: string): ProfileSecrets {
		const key = this.getSecretKey(profileId)
		const secretsJson = this.stateManager.getSecretKey(key as any)

		if (!secretsJson) {
			return {}
		}

		try {
			return JSON.parse(secretsJson)
		} catch (error) {
			console.error(`Failed to parse secrets for profile ${profileId}:`, error)
			return {}
		}
	}

	/**
	 * 프로필 Secrets 저장
	 */
	public setProfileSecrets(profileId: string, secrets: ProfileSecrets): void {
		const key = this.getSecretKey(profileId)
		const secretsJson = JSON.stringify(secrets)
		this.stateManager.setSecret(key as any, secretsJson)
	}

	/**
	 * 프로필 Secrets 업데이트
	 */
	public updateProfileSecrets(profileId: string, updates: Partial<ProfileSecrets>): void {
		const currentSecrets = this.getProfileSecrets(profileId)
		const updatedSecrets = { ...currentSecrets, ...updates }
		this.setProfileSecrets(profileId, updatedSecrets)
	}

	/**
	 * 프로필 Secrets 삭제 (내부 메서드)
	 */
	public deleteProfileSecrets(profileId: string): void {
		// Secret Storage에서 빈 값으로 설정하여 삭제 효과
		const key = this.getSecretKey(profileId)
		this.stateManager.setSecret(key as any, "")
	}

	/**
	 * 프로필 이름 검증
	 */
	private validateProfileName(name: string): boolean {
		if (!name || name.trim().length === 0) {
			return false
		}
		if (name.length > 50) {
			return false
		}
		// 기본적인 특수문자 제한
		const invalidChars = /[<>:"/\\|?*]/
		if (invalidChars.test(name)) {
			return false
		}
		return true
	}

	/**
	 * 이벤트 리스너 등록
	 */
	public on(eventType: ProfileEvent["type"], handler: (event: ProfileEvent) => void): void {
		if (!this.eventListeners.has(eventType)) {
			this.eventListeners.set(eventType, new Set())
		}
		this.eventListeners.get(eventType)!.add(handler)
	}

	/**
	 * 이벤트 리스너 제거
	 */
	public off(eventType: ProfileEvent["type"], handler: (event: ProfileEvent) => void): void {
		const listeners = this.eventListeners.get(eventType)
		if (listeners) {
			listeners.delete(handler)
		}
	}

	/**
	 * 이벤트 발생
	 */
	private emitEvent(event: ProfileEvent): void {
		const listeners = this.eventListeners.get(event.type)
		if (listeners) {
			for (const handler of listeners) {
				try {
					handler(event)
				} catch (error) {
					console.error(`Error in profile event handler for ${event.type}:`, error)
				}
			}
		}
	}

	/**
	 * 기존 ApiConfiguration을 Profile로 마이그레이션
	 */
	public migrateFromLegacyConfig(apiConfig: any): Profile {
		// 기존 "Default" 프로필이 있는지 확인
		const existingProfiles = this.getAllProfiles()
		const existingDefault = existingProfiles.find((p) => p.metadata.name === "Default")

		if (existingDefault) {
			console.log("[Profile] Default profile already exists, skipping migration:", existingDefault.metadata.id)
			return existingDefault
		}

		console.log("[Profile] Creating new Default profile from legacy configuration")

		// "Default" 프로필 생성
		const metadata: ProfileMetadata = {
			id: ulid(),
			name: "Default",
			description: "Migrated from previous configuration",
			isDefault: true,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		}

		// 설정을 Plan/Act/Common으로 분리
		const configuration: ProfileConfiguration = {}

		// Plan Mode 설정 추출
		const planModeFields = this.extractModeConfiguration(apiConfig, "planMode")
		if (Object.keys(planModeFields).length > 0) {
			configuration.planMode = planModeFields
		}

		// Act Mode 설정 추출
		const actModeFields = this.extractModeConfiguration(apiConfig, "actMode")
		if (Object.keys(actModeFields).length > 0) {
			configuration.actMode = actModeFields
		}

		// Common 설정 추출 (provider나 mode prefix가 없는 것들)
		const commonFields = this.extractCommonConfiguration(apiConfig)
		if (Object.keys(commonFields).length > 0) {
			configuration.common = commonFields
		}

		const profile: Profile = {
			metadata,
			configuration,
		}

		// Secrets 추출 및 저장
		const secrets = this.extractSecrets(apiConfig)
		if (Object.keys(secrets).length > 0) {
			this.setProfileSecrets(profile.metadata.id, secrets)
		}

		// 프로필 저장
		this.saveProfile(profile)

		return profile
	}

	/**
	 * 중복된 Default 프로필 정리 (디버깅/마이그레이션 문제 해결용)
	 * 가장 최근 것 하나만 남기고 나머지 삭제
	 */
	public cleanupDuplicateDefaultProfiles(): void {
		const profiles = this.getAllProfiles()
		const defaultProfiles = profiles.filter((p) => p.metadata.name === "Default")

		if (defaultProfiles.length <= 1) {
			console.log("[Profile] No duplicate Default profiles found")
			return
		}

		console.log(`[Profile] Found ${defaultProfiles.length} Default profiles, cleaning up...`)

		// 가장 최근 것 찾기 (updatedAt 기준)
		const sortedByDate = [...defaultProfiles].sort(
			(a, b) => new Date(b.metadata.updatedAt).getTime() - new Date(a.metadata.updatedAt).getTime(),
		)
		const keepProfile = sortedByDate[0]
		const deleteProfiles = sortedByDate.slice(1)

		console.log(`[Profile] Keeping profile: ${keepProfile.metadata.id}`)
		console.log(`[Profile] Deleting ${deleteProfiles.length} duplicate profiles`)

		// 상태 가져오기
		const state = this.getProfileSystemState()
		if (!state) {
			return
		}

		// 중복 프로필들 제거 (isDefault 체크 우회)
		for (const profile of deleteProfiles) {
			console.log(`[Profile] Removing duplicate: ${profile.metadata.id}`)
			state.profiles = state.profiles.filter((p) => p.metadata.id !== profile.metadata.id)
			this.cache.delete(profile.metadata.id)
		}

		// keepProfile이 isDefault = true인지 확인
		const keepIndex = state.profiles.findIndex((p) => p.metadata.id === keepProfile.metadata.id)
		if (keepIndex >= 0) {
			state.profiles[keepIndex].metadata.isDefault = true
		}

		// 저장
		this.saveProfileSystemState(state)

		console.log("[Profile] Cleanup completed successfully")
	}

	/**
	 * Mode별 설정 추출 (planMode* 또는 actMode*)
	 */
	private extractModeConfiguration(apiConfig: any, mode: "planMode" | "actMode"): any {
		const config: any = {}
		const prefix = mode

		for (const [key, value] of Object.entries(apiConfig)) {
			if (key.startsWith(prefix) && value !== undefined) {
				// planModeApiProvider -> apiProvider
				// planModeOllamaModelId -> ollamaModelId
				const fieldName = key.replace(prefix, "").replace(/^./, (c) => c.toLowerCase())
				config[fieldName] = value
				console.log(`[Profile] Migration: ${key} -> ${mode}.${fieldName} = ${value}`)
			}
		}

		return config
	}

	/**
	 * 공통 설정 추출
	 */
	private extractCommonConfiguration(apiConfig: any): any {
		const config: any = {}

		// Secret이 아니고, mode prefix가 없는 필드들
		const secretKeys = [
			"apiKey",
			"awsAccessKey",
			"awsSecretKey",
			"awsSessionToken",
			"awsBedrockApiKey",
			"openRouterApiKey",
			"openAiApiKey",
			"geminiApiKey",
			"openAiNativeApiKey",
			"ollamaApiKey",
			"deepSeekApiKey",
			"requestyApiKey",
			"togetherApiKey",
			"fireworksApiKey",
			"qwenApiKey",
			"doubaoApiKey",
			"mistralApiKey",
			"moonshotApiKey",
			"asksageApiKey",
			"xaiApiKey",
			"sambanovaApiKey",
			"cerebrasApiKey",
			"groqApiKey",
			"nebiusApiKey",
			"huggingFaceApiKey",
			"huaweiCloudMaasApiKey",
			"basetenApiKey",
			"vercelAiGatewayApiKey",
			"difyApiKey",
			"minimaxApiKey",
			"zaiApiKey",
			"hicapApiKey",
			"nousResearchApiKey",
			"liteLlmApiKey",
			"clineAccountId",
			"authNonce",
			"sapAiCoreClientId",
			"sapAiCoreClientSecret",
			"aihubmixApiKey",
		]

		for (const [key, value] of Object.entries(apiConfig)) {
			if (value !== undefined && !key.startsWith("planMode") && !key.startsWith("actMode") && !secretKeys.includes(key)) {
				config[key] = value
			}
		}

		return config
	}

	/**
	 * Secrets 추출
	 */
	private extractSecrets(apiConfig: any): ProfileSecrets {
		const secrets: ProfileSecrets = {}

		const secretKeys = [
			"apiKey",
			"awsAccessKey",
			"awsSecretKey",
			"awsSessionToken",
			"awsBedrockApiKey",
			"openRouterApiKey",
			"openAiApiKey",
			"geminiApiKey",
			"openAiNativeApiKey",
			"ollamaApiKey",
			"deepSeekApiKey",
			"requestyApiKey",
			"togetherApiKey",
			"fireworksApiKey",
			"qwenApiKey",
			"doubaoApiKey",
			"mistralApiKey",
			"moonshotApiKey",
			"asksageApiKey",
			"xaiApiKey",
			"sambanovaApiKey",
			"cerebrasApiKey",
			"groqApiKey",
			"nebiusApiKey",
			"huggingFaceApiKey",
			"huaweiCloudMaasApiKey",
			"basetenApiKey",
			"vercelAiGatewayApiKey",
			"difyApiKey",
			"minimaxApiKey",
			"zaiApiKey",
			"hicapApiKey",
			"nousResearchApiKey",
			"liteLlmApiKey",
			"clineAccountId",
			"authNonce",
			"sapAiCoreClientId",
			"sapAiCoreClientSecret",
			"aihubmixApiKey",
		]

		for (const key of secretKeys) {
			if (apiConfig[key] !== undefined) {
				secrets[key as keyof ProfileSecrets] = apiConfig[key]
			}
		}

		return secrets
	}

	/**
	 * 프로필을 ApiConfiguration으로 변환
	 * @param profileId 변환할 프로필 ID
	 * @param usePlanMode Plan 모드 설정을 사용할지 (true), Act 모드 설정을 사용할지 (false)
	 * @returns ApiConfiguration 객체
	 */
	public convertToApiConfiguration(profileId: string, usePlanMode: boolean): ApiConfiguration {
		const profile = this.getProfile(profileId)
		if (!profile) {
			throw new Error(`Profile not found: ${profileId}`)
		}

		const secrets = this.getProfileSecrets(profileId)
		const modeConfig = usePlanMode ? profile.configuration.planMode : profile.configuration.actMode

		// Common 설정 + Mode별 설정 + Secrets 병합
		const apiConfig: any = {
			...profile.configuration.common,
			...secrets,
		}

		// Mode별 설정을 최상위 키로 추가
		if (modeConfig) {
			for (const [key, value] of Object.entries(modeConfig)) {
				if (value !== undefined) {
					apiConfig[key] = value
				}
			}
		}

		// ⭐ CRITICAL: planModeApiProvider 및 actModeApiProvider 설정
		// buildApiHandler가 mode에 따라 선택하므로 둘 다 설정 필요
		if (profile.configuration.planMode?.apiProvider) {
			apiConfig.planModeApiProvider = profile.configuration.planMode.apiProvider
			apiConfig.planModeApiModelId = profile.configuration.planMode.apiModelId

			console.log(
				`[ProfileManager] Plan Mode: provider=${profile.configuration.planMode.apiProvider}, modelId=${profile.configuration.planMode.apiModelId}, ollamaModelId=${profile.configuration.planMode.ollamaModelId}`,
			)

			// ⭐ Provider별 modelId 매핑 (각 handler가 자신의 전용 키를 요구)
			const planProvider = profile.configuration.planMode.apiProvider
			if (planProvider === "ollama" && profile.configuration.planMode.ollamaModelId) {
				apiConfig.planModeOllamaModelId = profile.configuration.planMode.ollamaModelId
				console.log(`[ProfileManager] Set planModeOllamaModelId: ${apiConfig.planModeOllamaModelId}`)
			} else if (planProvider === "openrouter" && profile.configuration.planMode.openRouterModelId) {
				apiConfig.planModeOpenRouterModelId = profile.configuration.planMode.openRouterModelId
				apiConfig.planModeOpenRouterModelInfo = profile.configuration.planMode.openRouterModelInfo
			} else if (planProvider === "openai" && profile.configuration.planMode.openAiModelId) {
				apiConfig.planModeOpenAiModelId = profile.configuration.planMode.openAiModelId
				apiConfig.planModeOpenAiModelInfo = profile.configuration.planMode.openAiModelInfo
			} else if (planProvider === "lmstudio" && profile.configuration.planMode.lmStudioModelId) {
				apiConfig.planModeLmStudioModelId = profile.configuration.planMode.lmStudioModelId
			} else if (planProvider === "litellm" && profile.configuration.planMode.liteLlmModelId) {
				apiConfig.planModeLiteLlmModelId = profile.configuration.planMode.liteLlmModelId
				apiConfig.planModeLiteLlmModelInfo = profile.configuration.planMode.liteLlmModelInfo
			}
			// 필요시 다른 provider 추가...
		}

		if (profile.configuration.actMode?.apiProvider) {
			apiConfig.actModeApiProvider = profile.configuration.actMode.apiProvider
			apiConfig.actModeApiModelId = profile.configuration.actMode.apiModelId

			// ⭐ Provider별 modelId 매핑 (Act Mode)
			const actProvider = profile.configuration.actMode.apiProvider
			if (actProvider === "ollama" && profile.configuration.actMode.ollamaModelId) {
				apiConfig.actModeOllamaModelId = profile.configuration.actMode.ollamaModelId
			} else if (actProvider === "openrouter" && profile.configuration.actMode.openRouterModelId) {
				apiConfig.actModeOpenRouterModelId = profile.configuration.actMode.openRouterModelId
				apiConfig.actModeOpenRouterModelInfo = profile.configuration.actMode.openRouterModelInfo
			} else if (actProvider === "openai" && profile.configuration.actMode.openAiModelId) {
				apiConfig.actModeOpenAiModelId = profile.configuration.actMode.openAiModelId
				apiConfig.actModeOpenAiModelInfo = profile.configuration.actMode.openAiModelInfo
			} else if (actProvider === "lmstudio" && profile.configuration.actMode.lmStudioModelId) {
				apiConfig.actModeLmStudioModelId = profile.configuration.actMode.lmStudioModelId
			} else if (actProvider === "litellm" && profile.configuration.actMode.liteLlmModelId) {
				apiConfig.actModeLiteLlmModelId = profile.configuration.actMode.liteLlmModelId
				apiConfig.actModeLiteLlmModelInfo = profile.configuration.actMode.liteLlmModelInfo
			}
			// 필요시 다른 provider 추가...
		}

		// Legacy 호환성: apiProvider와 apiModelId도 설정 (일부 코드가 이것을 참조)
		if (modeConfig?.apiProvider) {
			apiConfig.apiProvider = modeConfig.apiProvider
			apiConfig.apiModelId = modeConfig.apiModelId
		}

		return apiConfig as ApiConfiguration
	}

	/**
	 * 현재 활성 프로필을 ApiConfiguration으로 변환
	 * @param usePlanMode Plan 모드 설정을 사용할지 여부
	 * @returns ApiConfiguration 객체, 활성 프로필이 없으면 null
	 */
	public getActiveProfileAsApiConfiguration(usePlanMode: boolean): ApiConfiguration | null {
		const activeProfileId = this.getActiveProfileId()
		if (!activeProfileId) {
			console.log("[ProfileManager] No active profile found")
			return null
		}
		console.log(
			`[ProfileManager] Converting active profile ${activeProfileId} to ApiConfiguration (usePlanMode: ${usePlanMode})`,
		)
		const apiConfig = this.convertToApiConfiguration(activeProfileId, usePlanMode)
		console.log("[ProfileManager] Converted API config:", {
			planModeApiProvider: apiConfig.planModeApiProvider,
			actModeApiProvider: apiConfig.actModeApiProvider,
			planModeOllamaModelId: (apiConfig as any).planModeOllamaModelId,
			actModeOllamaModelId: (apiConfig as any).actModeOllamaModelId,
		})
		return apiConfig
	}
}
