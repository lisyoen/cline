import type { ApiProvider, ModelInfo, OpenAiCompatibleModelInfo } from "./api"

/**
 * OpenAI Compatible 커스텀 모델 정의
 */
export interface OpenAiCompatibleCustomModel {
	/** 고유 식별자 (ULID) */
	id: string
	/** 사용자 정의 이름 (UI 표시용) */
	name: string
	/** API Base URL */
	baseUrl: string
	/** 모델 ID */
	modelId: string
	/** 모델 정보 (토큰, 가격 등) */
	modelInfo?: OpenAiCompatibleModelInfo
	/** 커스텀 헤더 (옵션) */
	headers?: Record<string, string>
}

/**
 * 프로필 메타데이터
 */
export interface ProfileMetadata {
	/** 프로필 고유 ID (ULID) */
	id: string
	/** 사용자 정의 프로필 이름 (최대 50자) */
	name: string
	/** 프로필 설명 (최대 200자, 옵션) */
	description?: string
	/** 기본 프로필 여부 */
	isDefault: boolean
	/** 생성 시간 (ISO 8601) */
	createdAt: string
	/** 마지막 수정 시간 (ISO 8601) */
	updatedAt: string
	/** UI 색상 태그 (옵션) */
	color?: string
	/** 아이콘 이름 (옵션) */
	icon?: string
}

/**
 * Plan Mode 설정
 */
export interface PlanModeConfiguration {
	apiProvider?: ApiProvider
	apiModelId?: string
	thinkingBudgetTokens?: number
	reasoningEffort?: string

	// OpenRouter
	openRouterModelId?: string
	openRouterModelInfo?: ModelInfo

	// OpenAI
	openAiModelId?: string
	openAiModelInfo?: OpenAiCompatibleModelInfo

	// ⭐ OpenAI Compatible 다중 모델 설정
	openAiCompatibleModels?: OpenAiCompatibleCustomModel[]

	// Ollama
	ollamaModelId?: string

	// LM Studio
	lmStudioModelId?: string

	// LiteLLM
	liteLlmModelId?: string
	liteLlmModelInfo?: any

	// Requesty
	requestyModelId?: string
	requestyModelInfo?: ModelInfo

	// Together
	togetherModelId?: string

	// Fireworks
	fireworksModelId?: string

	// SAP AI Core
	sapAiCoreModelId?: string
	sapAiCoreDeploymentId?: string

	// Groq
	groqModelId?: string
	groqModelInfo?: ModelInfo

	// Baseten
	basetenModelId?: string
	basetenModelInfo?: ModelInfo

	// HuggingFace
	huggingFaceModelId?: string
	huggingFaceModelInfo?: ModelInfo

	// Huawei Cloud MaaS
	huaweiCloudMaasModelId?: string
	huaweiCloudMaasModelInfo?: ModelInfo

	// OCA
	ocaModelId?: string
	ocaModelInfo?: any

	// AIHubMix
	aihubmixModelId?: string
	aihubmixModelInfo?: OpenAiCompatibleModelInfo

	// Hicap
	hicapModelId?: string
	hicapModelInfo?: ModelInfo

	// Nous Research
	nousResearchModelId?: string

	// VSCode LM
	vsCodeLmModelSelector?: any

	// AWS Bedrock
	awsBedrockCustomSelected?: boolean
	awsBedrockCustomModelBaseId?: string
}

/**
 * Act Mode 설정
 */
export interface ActModeConfiguration {
	apiProvider?: ApiProvider
	apiModelId?: string
	thinkingBudgetTokens?: number
	reasoningEffort?: string

	// OpenRouter
	openRouterModelId?: string
	openRouterModelInfo?: ModelInfo

	// OpenAI
	openAiModelId?: string
	openAiModelInfo?: OpenAiCompatibleModelInfo

	// ⭐ OpenAI Compatible 다중 모델 설정
	openAiCompatibleModels?: OpenAiCompatibleCustomModel[]

	// Ollama
	ollamaModelId?: string

	// LM Studio
	lmStudioModelId?: string

	// LiteLLM
	liteLlmModelId?: string
	liteLlmModelInfo?: any

	// Requesty
	requestyModelId?: string
	requestyModelInfo?: ModelInfo

	// Together
	togetherModelId?: string

	// Fireworks
	fireworksModelId?: string

	// SAP AI Core
	sapAiCoreModelId?: string
	sapAiCoreDeploymentId?: string

	// Groq
	groqModelId?: string
	groqModelInfo?: ModelInfo

	// Baseten
	basetenModelId?: string
	basetenModelInfo?: ModelInfo

	// HuggingFace
	huggingFaceModelId?: string
	huggingFaceModelInfo?: ModelInfo

	// Huawei Cloud MaaS
	huaweiCloudMaasModelId?: string
	huaweiCloudMaasModelInfo?: ModelInfo

	// OCA
	ocaModelId?: string
	ocaModelInfo?: any

	// AIHubMix
	aihubmixModelId?: string
	aihubmixModelInfo?: OpenAiCompatibleModelInfo

	// Hicap
	hicapModelId?: string
	hicapModelInfo?: ModelInfo

	// Nous Research
	nousResearchModelId?: string

	// VSCode LM
	vsCodeLmModelSelector?: any

	// AWS Bedrock
	awsBedrockCustomSelected?: boolean
	awsBedrockCustomModelBaseId?: string
}

/**
 * 공통 설정 (Provider별 base URL 등)
 */
export interface CommonConfiguration {
	// Base URLs
	anthropicBaseUrl?: string
	openAiBaseUrl?: string
	ollamaBaseUrl?: string
	geminiBaseUrl?: string
	requestyBaseUrl?: string
	liteLlmBaseUrl?: string
	lmStudioBaseUrl?: string
	asksageApiUrl?: string
	sapAiCoreBaseUrl?: string
	difyBaseUrl?: string
	ocaBaseUrl?: string
	aihubmixBaseUrl?: string

	// AWS
	awsRegion?: string
	awsUseCrossRegionInference?: boolean
	awsUseGlobalInference?: boolean
	awsBedrockUsePromptCache?: boolean
	awsBedrockEndpoint?: string
	awsAuthentication?: string
	awsUseProfile?: boolean

	// Google Vertex
	vertexProjectId?: string
	vertexRegion?: string

	// Azure
	azureApiVersion?: string

	// OpenRouter
	openRouterProviderSorting?: string

	// Ollama
	ollamaApiOptionsCtxNum?: string

	// LM Studio
	lmStudioMaxTokens?: string

	// LiteLLM
	liteLlmUsePromptCache?: boolean

	// Fireworks
	fireworksModelMaxCompletionTokens?: number
	fireworksModelMaxTokens?: number

	// Qwen
	qwenApiLine?: string

	// Moonshot
	moonshotApiLine?: string

	// ZAI
	zaiApiLine?: string

	// Minimax
	minimaxApiLine?: string

	// SAP AI Core
	sapAiResourceGroup?: string
	sapAiCoreTokenUrl?: string
	sapAiCoreUseOrchestrationMode?: boolean

	// OCA
	ocaMode?: string

	// General
	requestTimeoutMs?: number

	// AIHubMix
	aihubmixAppCode?: string
}

/**
 * 프로필 설정 (델타 방식)
 */
export interface ProfileConfiguration {
	planMode?: PlanModeConfiguration
	actMode?: ActModeConfiguration
	common?: CommonConfiguration
}

/**
 * 프로필별 Secrets (Secret Storage에 저장)
 */
export interface ProfileSecrets {
	// API Keys
	apiKey?: string // Anthropic
	openRouterApiKey?: string
	openAiApiKey?: string
	geminiApiKey?: string
	openAiNativeApiKey?: string
	ollamaApiKey?: string
	deepSeekApiKey?: string
	requestyApiKey?: string
	togetherApiKey?: string
	fireworksApiKey?: string
	qwenApiKey?: string
	doubaoApiKey?: string
	mistralApiKey?: string
	moonshotApiKey?: string
	asksageApiKey?: string
	xaiApiKey?: string
	sambanovaApiKey?: string
	cerebrasApiKey?: string
	groqApiKey?: string
	nebiusApiKey?: string
	huggingFaceApiKey?: string
	huaweiCloudMaasApiKey?: string
	basetenApiKey?: string
	vercelAiGatewayApiKey?: string
	difyApiKey?: string
	zaiApiKey?: string
	minimaxApiKey?: string
	hicapApiKey?: string
	nousResearchApiKey?: string
	liteLlmApiKey?: string
	aihubmixApiKey?: string

	// ⭐ OpenAI Compatible 커스텀 모델 API Keys
	// Key: `openAiCompatible.${modelId}`
	// 예: "openAiCompatible.01HXYZ123..." -> "sk-custom-key-123"
	[key: `openAiCompatible.${string}`]: string | undefined

	// AWS
	awsAccessKey?: string
	awsSecretKey?: string
	awsSessionToken?: string
	awsBedrockApiKey?: string
	awsProfile?: string

	// SAP AI Core
	sapAiCoreClientId?: string
	sapAiCoreClientSecret?: string

	// Cline
	clineAccountId?: string

	// Paths
	claudeCodePath?: string
	qwenCodeOauthPath?: string
}

/**
 * 완전한 프로필
 */
export interface Profile {
	metadata: ProfileMetadata
	configuration: ProfileConfiguration
}

/**
 * 프로필 시스템 상태 (GlobalState에 저장)
 */
export interface ProfileSystemState {
	/** 스키마 버전 (마이그레이션용) */
	version: number
	/** 현재 활성 프로필 ID */
	activeProfileId: string
	/** 모든 프로필 목록 */
	profiles: Profile[]
	/** 마이그레이션 완료 여부 */
	migrationCompleted: boolean
}

/**
 * 프로필 Export 데이터
 */
export interface ProfileExportData {
	version: number
	exportedAt: string
	profile: Profile
	secrets?: ProfileSecrets
}

/**
 * 프로필 이벤트
 */
export type ProfileEvent =
	| { type: "profile.created"; profile: Profile }
	| { type: "profile.updated"; profile: Profile }
	| { type: "profile.deleted"; profileId: string }
	| { type: "profile.switched"; profile: Profile; previousProfileId?: string }
	| { type: "profiles.reloaded"; profiles: Profile[] }

/**
 * 프로필 에러 코드
 */
export const PROFILE_ERRORS = {
	NOT_FOUND: "PROFILE_NOT_FOUND",
	DUPLICATE_NAME: "PROFILE_DUPLICATE_NAME",
	INVALID_NAME: "PROFILE_INVALID_NAME",
	CANNOT_DELETE_ACTIVE: "PROFILE_CANNOT_DELETE_ACTIVE",
	CANNOT_DELETE_DEFAULT: "PROFILE_CANNOT_DELETE_DEFAULT",
	CANNOT_DELETE_LAST: "PROFILE_CANNOT_DELETE_LAST",
	SYSTEM_NOT_INITIALIZED: "PROFILE_SYSTEM_NOT_INITIALIZED",
	SECRETS_NOT_FOUND: "PROFILE_SECRETS_NOT_FOUND",
	IMPORT_INVALID: "PROFILE_IMPORT_INVALID",
	MIGRATION_FAILED: "PROFILE_MIGRATION_FAILED",
	INVALID_CONFIGURATION: "PROFILE_INVALID_CONFIGURATION",
} as const

/**
 * 프로필 에러
 */
export class ProfileError extends Error {
	constructor(
		message: string,
		public code: (typeof PROFILE_ERRORS)[keyof typeof PROFILE_ERRORS],
	) {
		super(message)
		this.name = "ProfileError"
	}
}
