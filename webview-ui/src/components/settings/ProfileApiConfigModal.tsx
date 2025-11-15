import { Mode } from "@shared/storage/types"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { Info, Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { ProfileServiceClient } from "@/services/grpc-client"
import { TabButton } from "../mcp/configuration/McpConfigurationView"
import ApiOptions from "./ApiOptions"

interface ProfileApiConfigModalProps {
	open: boolean
	profileId: string
	profileName: string
	onOpenChange: (open: boolean) => void
	onSave: () => void
}

/**
 * 프로필별 API 설정 모달
 *
 * 프로필의 Plan/Act Mode별 API 설정 구성
 * - ProfileServiceClient.getProfile() 호출하여 설정 로드
 * - 현재는 정보 표시만 구현 (ApiOptions 통합은 향후 작업)
 */
export function ProfileApiConfigModal({ open, profileId, profileName, onOpenChange, onSave }: ProfileApiConfigModalProps) {
	const [currentTab, setCurrentTab] = useState<Mode>("plan")
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [profileData, setProfileData] = useState<any>(null)

	// 프로필 데이터 로드
	useEffect(() => {
		if (!open || !profileId) {
			return
		}

		const loadProfileData = async () => {
			setLoading(true)
			setError(null)

			try {
				const response = await ProfileServiceClient.getProfile({ profileId })
				setProfileData(response.profile)
			} catch (err) {
				const message = err instanceof Error ? err.message : "Failed to load profile"
				setError(message)
			} finally {
				setLoading(false)
			}
		}

		loadProfileData()
	}, [open, profileId])

	// Escape 키로 모달 닫기
	useEffect(() => {
		if (!open) {
			return
		}

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				handleClose()
			}
		}

		document.addEventListener("keydown", handleKeyDown)
		return () => document.removeEventListener("keydown", handleKeyDown)
	}, [open])

	// 프로필 변경 시 탭 상태 초기화
	useEffect(() => {
		if (open) {
			setCurrentTab("plan")
		}
	}, [open, profileId])

	if (!open) {
		return null
	}

	const handleClose = () => {
		// 모달 닫을 때 상태 초기화
		setProfileData(null)
		setError(null)
		onOpenChange(false)
	}

	const handleSave = () => {
		// TODO: 프로필 설정 저장 구현
		// ProfileServiceClient.updateProfile()로 configuration 업데이트
		onSave()
		onOpenChange(false)
	}

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center"
			onClick={handleClose}
			style={{ zIndex: 9999 }}>
			<div
				className="bg-(--vscode-editor-background) rounded-sm border border-(--vscode-panel-border) shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col"
				onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-(--vscode-panel-border)">
					<div>
						<h2 className="text-lg font-medium m-0">Configure API Settings</h2>
						<p className="text-sm text-(--vscode-descriptionForeground) m-0 mt-1">
							Profile: <strong>{profileName}</strong>
						</p>
					</div>
					<VSCodeButton appearance="icon" aria-label="Close" onClick={handleClose}>
						<X className="w-4 h-4" />
					</VSCodeButton>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-5">
					{/* Loading State */}
					{loading && (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="w-6 h-6 animate-spin text-(--vscode-descriptionForeground)" />
							<span className="ml-2 text-(--vscode-descriptionForeground)">Loading profile settings...</span>
						</div>
					)}

					{/* Error State */}
					{error && (
						<div className="p-4 mb-4 bg-(--vscode-inputValidation-errorBackground) border border-(--vscode-inputValidation-errorBorder) rounded">
							<p className="text-(--vscode-inputValidation-errorForeground) m-0">{error}</p>
						</div>
					)}

					{/* Loaded State */}
					{!loading && !error && profileData && (
						<>
							{/* Plan/Act Mode Tabs */}
							<div className="flex gap-px mb-4 border-0 border-b border-solid border-(--vscode-panel-border)">
								<TabButton
									disabled={currentTab === "plan"}
									isActive={currentTab === "plan"}
									onClick={() => setCurrentTab("plan")}
									style={{
										opacity: 1,
										cursor: "pointer",
									}}>
									Plan Mode
								</TabButton>
								<TabButton
									disabled={currentTab === "act"}
									isActive={currentTab === "act"}
									onClick={() => setCurrentTab("act")}
									style={{
										opacity: 1,
										cursor: "pointer",
									}}>
									Act Mode
								</TabButton>
							</div>

							{/* Profile Info */}
							<div className="mb-4 p-4 bg-(--vscode-textBlockQuote-background) rounded border border-(--vscode-panel-border)">
								<div className="flex items-start gap-2">
									<Info className="w-4 h-4 mt-0.5 text-(--vscode-charts-blue)" />
									<div className="flex-1">
										<p className="text-sm font-medium m-0 mb-2">Profile Configuration Status</p>
										<p className="text-xs text-(--vscode-descriptionForeground) m-0">
											Profile loaded successfully. Profile-specific API configuration UI is currently under
											development.
										</p>
										<p className="text-xs text-(--vscode-descriptionForeground) m-0 mt-2">
											<strong>Coming soon:</strong> Configure different API providers and models for each
											profile's Plan and Act modes.
										</p>
									</div>
								</div>
							</div>

							{/* Temporary: Show current global settings */}
							<div className="mb-4">
								<p className="text-sm text-(--vscode-descriptionForeground) mb-3">
									Currently using global API settings:
								</p>
								<ApiOptions currentMode={currentTab} showModelOptions={true} />
							</div>

							{/* Future Info */}
							<div className="text-xs text-(--vscode-descriptionForeground) p-3 bg-(--vscode-textBlockQuote-background) rounded">
								<strong>Note:</strong> Once implemented, these settings will only apply to this profile. Each
								profile will be able to have different API providers, models, and configurations for both Plan and
								Act modes.
							</div>
						</>
					)}
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 p-4 border-t border-(--vscode-panel-border)">
					<VSCodeButton appearance="secondary" onClick={handleClose}>
						Close
					</VSCodeButton>
					{/* Save button disabled until profile-specific settings are implemented */}
					<VSCodeButton appearance="primary" disabled={true} onClick={handleSave}>
						Save Changes (Coming Soon)
					</VSCodeButton>
				</div>
			</div>
		</div>
	)
}
