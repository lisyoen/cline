import { Mode } from "@shared/storage/types"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { X } from "lucide-react"
import { useState } from "react"
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
 * TODO: 프로필별 설정 로드/저장 구현
 * - ProfileServiceClient.getProfile() 호출하여 설정 로드
 * - ApiOptions에서 변경된 설정을 프로필에 저장
 * - Plan/Act Mode 별도 설정 지원
 */
export function ProfileApiConfigModal({ open, profileId, profileName, onOpenChange, onSave }: ProfileApiConfigModalProps) {
	const [currentTab, setCurrentTab] = useState<Mode>("plan")
	// TODO: 변경사항 추적 및 profileId로 설정 로드 구현
	const _profileId = profileId
	const [_hasChanges, _setHasChanges] = useState(false)

	if (!open) {
		return null
	}

	const handleClose = () => {
		// TODO: 변경사항 있으면 확인 모달 표시
		onOpenChange(false)
	}

	const handleSave = () => {
		// TODO: 프로필 설정 저장
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

					{/* API Options */}
					<div className="mb-4">
						{/* TODO: 프로필별 설정을 ApiOptions에 전달 */}
						<ApiOptions currentMode={currentTab} showModelOptions={true} />
					</div>

					{/* Info */}
					<div className="text-xs text-(--vscode-descriptionForeground) p-3 bg-(--vscode-textBlockQuote-background) rounded">
						<strong>Note:</strong> These settings will only apply to this profile. Each profile can have different API
						providers, models, and configurations for both Plan and Act modes.
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 p-4 border-t border-(--vscode-panel-border)">
					<VSCodeButton appearance="secondary" onClick={handleClose}>
						Cancel
					</VSCodeButton>
					<VSCodeButton appearance="primary" onClick={handleSave}>
						Save Changes
					</VSCodeButton>
				</div>
			</div>
		</div>
	)
}
