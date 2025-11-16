import type { ProfileConfiguration } from "@shared/profiles"
import type { ApiConfiguration } from "@shared/proto/cline/models"
import { ApiProvider } from "@shared/proto/cline/models"
import { ProfileManager } from "@/core/storage/ProfileManager"

/**
 * ProfileConfiguration을 proto ApiConfiguration으로 변환
 *
 * @param config 프로필 설정 (ProfileConfiguration)
 * @param profileId 프로필 ID (Secrets 로드용)
 * @returns proto ApiConfiguration
 */
export function convertProfileConfigurationToProto(config: ProfileConfiguration, profileId: string): ApiConfiguration {
	const profileManager = ProfileManager.get()
	const secrets = profileManager.getProfileSecrets(profileId)

	// ModelsApiOptions 생성 (공통 설정 + Plan/Act 모드)
	const options: any = {
		// Common configuration
		anthropicBaseUrl: config.common?.anthropicBaseUrl,
		openAiBaseUrl: config.common?.openAiBaseUrl,
		ollamaBaseUrl: config.common?.ollamaBaseUrl,
		geminiBaseUrl: config.common?.geminiBaseUrl,
		requestyBaseUrl: config.common?.requestyBaseUrl,
		liteLlmBaseUrl: config.common?.liteLlmBaseUrl,
		lmStudioBaseUrl: config.common?.lmStudioBaseUrl,
		asksageApiUrl: config.common?.asksageApiUrl,
		sapAiCoreBaseUrl: config.common?.sapAiCoreBaseUrl,
		difyBaseUrl: config.common?.difyBaseUrl,
		ocaBaseUrl: config.common?.ocaBaseUrl,
		aihubmixBaseUrl: config.common?.aihubmixBaseUrl,
		awsRegion: config.common?.awsRegion,
		awsUseCrossRegionInference: config.common?.awsUseCrossRegionInference,
		awsUseGlobalInference: config.common?.awsUseGlobalInference,
		awsBedrockUsePromptCache: config.common?.awsBedrockUsePromptCache,
		awsBedrockEndpoint: config.common?.awsBedrockEndpoint,
		awsAuthentication: config.common?.awsAuthentication,
		awsUseProfile: config.common?.awsUseProfile,
		vertexProjectId: config.common?.vertexProjectId,
		vertexRegion: config.common?.vertexRegion,
		azureApiVersion: config.common?.azureApiVersion,
		openRouterProviderSorting: config.common?.openRouterProviderSorting,
		ollamaApiOptionsCtxNum: config.common?.ollamaApiOptionsCtxNum,
		lmStudioMaxTokens: config.common?.lmStudioMaxTokens,
		liteLlmUsePromptCache: config.common?.liteLlmUsePromptCache,
		fireworksModelMaxCompletionTokens: config.common?.fireworksModelMaxCompletionTokens,
		fireworksModelMaxTokens: config.common?.fireworksModelMaxTokens,
		qwenApiLine: config.common?.qwenApiLine,
		moonshotApiLine: config.common?.moonshotApiLine,
		zaiApiLine: config.common?.zaiApiLine,
		minimaxApiLine: config.common?.minimaxApiLine,
		sapAiResourceGroup: config.common?.sapAiResourceGroup,
		sapAiCoreTokenUrl: config.common?.sapAiCoreTokenUrl,
		sapAiCoreUseOrchestrationMode: config.common?.sapAiCoreUseOrchestrationMode,
		ocaMode: config.common?.ocaMode,
		requestTimeoutMs: config.common?.requestTimeoutMs,
		aihubmixAppCode: config.common?.aihubmixAppCode,
	}

	// Plan Mode 설정
	if (config.planMode) {
		const plan = config.planMode
		options.planModeApiProvider = convertApiProviderToProto(plan.apiProvider)
		options.planModeApiModelId = plan.apiModelId
		options.planModeThinkingBudgetTokens = plan.thinkingBudgetTokens
		options.planModeReasoningEffort = plan.reasoningEffort

		// Provider별 설정
		options.planModeOpenRouterModelId = plan.openRouterModelId
		options.planModeOpenRouterModelInfo = plan.openRouterModelInfo
		options.planModeOpenAiModelId = plan.openAiModelId
		options.planModeOpenAiModelInfo = plan.openAiModelInfo
		options.planModeOllamaModelId = plan.ollamaModelId
		options.planModeLmStudioModelId = plan.lmStudioModelId
		options.planModeLiteLlmModelId = plan.liteLlmModelId
		options.planModeLiteLlmModelInfo = plan.liteLlmModelInfo
		options.planModeRequestyModelId = plan.requestyModelId
		options.planModeRequestyModelInfo = plan.requestyModelInfo
		options.planModeTogetherModelId = plan.togetherModelId
		options.planModeFireworksModelId = plan.fireworksModelId
		options.planModeSapAiCoreModelId = plan.sapAiCoreModelId
		options.planModeSapAiCoreDeploymentId = plan.sapAiCoreDeploymentId
		options.planModeGroqModelId = plan.groqModelId
		options.planModeGroqModelInfo = plan.groqModelInfo
		options.planModeBasetenModelId = plan.basetenModelId
		options.planModeBasetenModelInfo = plan.basetenModelInfo
		options.planModeHuggingFaceModelId = plan.huggingFaceModelId
		options.planModeHuggingFaceModelInfo = plan.huggingFaceModelInfo
		options.planModeHuaweiCloudMaasModelId = plan.huaweiCloudMaasModelId
		options.planModeHuaweiCloudMaasModelInfo = plan.huaweiCloudMaasModelInfo
		options.planModeOcaModelId = plan.ocaModelId
		options.planModeOcaModelInfo = plan.ocaModelInfo
		options.planModeAihubmixModelId = plan.aihubmixModelId
		options.planModeAihubmixModelInfo = plan.aihubmixModelInfo
		options.planModeHicapModelId = plan.hicapModelId
		options.planModeHicapModelInfo = plan.hicapModelInfo
		options.planModeNousResearchModelId = plan.nousResearchModelId
		options.planModeVsCodeLmModelSelector = plan.vsCodeLmModelSelector
		options.planModeAwsBedrockCustomSelected = plan.awsBedrockCustomSelected
		options.planModeAwsBedrockCustomModelBaseId = plan.awsBedrockCustomModelBaseId
	}

	// Act Mode 설정
	if (config.actMode) {
		const act = config.actMode
		options.actModeApiProvider = convertApiProviderToProto(act.apiProvider)
		options.actModeApiModelId = act.apiModelId
		options.actModeThinkingBudgetTokens = act.thinkingBudgetTokens
		options.actModeReasoningEffort = act.reasoningEffort

		// Provider별 설정
		options.actModeOpenRouterModelId = act.openRouterModelId
		options.actModeOpenRouterModelInfo = act.openRouterModelInfo
		options.actModeOpenAiModelId = act.openAiModelId
		options.actModeOpenAiModelInfo = act.openAiModelInfo
		options.actModeOllamaModelId = act.ollamaModelId
		options.actModeLmStudioModelId = act.lmStudioModelId
		options.actModeLiteLlmModelId = act.liteLlmModelId
		options.actModeLiteLlmModelInfo = act.liteLlmModelInfo
		options.actModeRequestyModelId = act.requestyModelId
		options.actModeRequestyModelInfo = act.requestyModelInfo
		options.actModeTogetherModelId = act.togetherModelId
		options.actModeFireworksModelId = act.fireworksModelId
		options.actModeSapAiCoreModelId = act.sapAiCoreModelId
		options.actModeSapAiCoreDeploymentId = act.sapAiCoreDeploymentId
		options.actModeGroqModelId = act.groqModelId
		options.actModeGroqModelInfo = act.groqModelInfo
		options.actModeBasetenModelId = act.basetenModelId
		options.actModeBasetenModelInfo = act.basetenModelInfo
		options.actModeHuggingFaceModelId = act.huggingFaceModelId
		options.actModeHuggingFaceModelInfo = act.huggingFaceModelInfo
		options.actModeHuaweiCloudMaasModelId = act.huaweiCloudMaasModelId
		options.actModeHuaweiCloudMaasModelInfo = act.huaweiCloudMaasModelInfo
		options.actModeOcaModelId = act.ocaModelId
		options.actModeOcaModelInfo = act.ocaModelInfo
		options.actModeAihubmixModelId = act.aihubmixModelId
		options.actModeAihubmixModelInfo = act.aihubmixModelInfo
		options.actModeHicapModelId = act.hicapModelId
		options.actModeHicapModelInfo = act.hicapModelInfo
		options.actModeNousResearchModelId = act.nousResearchModelId
		options.actModeVsCodeLmModelSelector = act.vsCodeLmModelSelector
		options.actModeAwsBedrockCustomSelected = act.awsBedrockCustomSelected
		options.actModeAwsBedrockCustomModelBaseId = act.awsBedrockCustomModelBaseId
	}

	// ModelsApiSecrets 생성
	const secretsProto: any = {
		apiKey: secrets.apiKey,
		openRouterApiKey: secrets.openRouterApiKey,
		openAiApiKey: secrets.openAiApiKey,
		geminiApiKey: secrets.geminiApiKey,
		openAiNativeApiKey: secrets.openAiNativeApiKey,
		ollamaApiKey: secrets.ollamaApiKey,
		deepSeekApiKey: secrets.deepSeekApiKey,
		requestyApiKey: secrets.requestyApiKey,
		togetherApiKey: secrets.togetherApiKey,
		fireworksApiKey: secrets.fireworksApiKey,
		qwenApiKey: secrets.qwenApiKey,
		doubaoApiKey: secrets.doubaoApiKey,
		mistralApiKey: secrets.mistralApiKey,
		moonshotApiKey: secrets.moonshotApiKey,
		asksageApiKey: secrets.asksageApiKey,
		xaiApiKey: secrets.xaiApiKey,
		sambanovaApiKey: secrets.sambanovaApiKey,
		cerebrasApiKey: secrets.cerebrasApiKey,
		groqApiKey: secrets.groqApiKey,
		nebiusApiKey: secrets.nebiusApiKey,
		huggingFaceApiKey: secrets.huggingFaceApiKey,
		huaweiCloudMaasApiKey: secrets.huaweiCloudMaasApiKey,
		basetenApiKey: secrets.basetenApiKey,
		vercelAiGatewayApiKey: secrets.vercelAiGatewayApiKey,
		difyApiKey: secrets.difyApiKey,
		zaiApiKey: secrets.zaiApiKey,
		minimaxApiKey: secrets.minimaxApiKey,
		hicapApiKey: secrets.hicapApiKey,
		nousResearchApiKey: secrets.nousResearchApiKey,
		liteLlmApiKey: secrets.liteLlmApiKey,
		aihubmixApiKey: secrets.aihubmixApiKey,
		awsAccessKey: secrets.awsAccessKey,
		awsSecretKey: secrets.awsSecretKey,
		awsSessionToken: secrets.awsSessionToken,
		awsBedrockApiKey: secrets.awsBedrockApiKey,
		awsProfile: secrets.awsProfile,
		sapAiCoreClientId: secrets.sapAiCoreClientId,
		sapAiCoreClientSecret: secrets.sapAiCoreClientSecret,
		clineAccountId: secrets.clineAccountId,
		claudeCodePath: secrets.claudeCodePath,
		qwenCodeOauthPath: secrets.qwenCodeOauthPath,
	}

	return {
		options,
		secrets: secretsProto,
	}
}

/**
 * ApiProvider 문자열을 proto enum으로 변환
 */
function convertApiProviderToProto(provider?: string): ApiProvider | undefined {
	if (!provider) {
		return undefined
	}

	const providerMap: Record<string, ApiProvider> = {
		anthropic: ApiProvider.ANTHROPIC,
		openrouter: ApiProvider.OPENROUTER,
		bedrock: ApiProvider.BEDROCK,
		vertex: ApiProvider.VERTEX,
		openai: ApiProvider.OPENAI,
		ollama: ApiProvider.OLLAMA,
		lmstudio: ApiProvider.LMSTUDIO,
		gemini: ApiProvider.GEMINI,
		"openai-native": ApiProvider.OPENAI_NATIVE,
		requesty: ApiProvider.REQUESTY,
		together: ApiProvider.TOGETHER,
		deepseek: ApiProvider.DEEPSEEK,
		qwen: ApiProvider.QWEN,
		doubao: ApiProvider.DOUBAO,
		mistral: ApiProvider.MISTRAL,
		"vscode-lm": ApiProvider.VSCODE_LM,
		cline: ApiProvider.CLINE,
		litellm: ApiProvider.LITELLM,
		nebius: ApiProvider.NEBIUS,
		fireworks: ApiProvider.FIREWORKS,
		asksage: ApiProvider.ASKSAGE,
		xai: ApiProvider.XAI,
		sambanova: ApiProvider.SAMBANOVA,
		cerebras: ApiProvider.CEREBRAS,
		groq: ApiProvider.GROQ,
		sapaicore: ApiProvider.SAPAICORE,
		"claude-code": ApiProvider.CLAUDE_CODE,
		moonshot: ApiProvider.MOONSHOT,
		huggingface: ApiProvider.HUGGINGFACE,
		"huawei-cloud-maas": ApiProvider.HUAWEI_CLOUD_MAAS,
		baseten: ApiProvider.BASETEN,
		zai: ApiProvider.ZAI,
		"vercel-ai-gateway": ApiProvider.VERCEL_AI_GATEWAY,
		"qwen-code": ApiProvider.QWEN_CODE,
		dify: ApiProvider.DIFY,
		oca: ApiProvider.OCA,
		minimax: ApiProvider.MINIMAX,
		hicap: ApiProvider.HICAP,
		aihubmix: ApiProvider.AIHUBMIX,
		nousresearch: ApiProvider.NOUSRESEARCH,
	}

	return providerMap[provider.toLowerCase()]
}
