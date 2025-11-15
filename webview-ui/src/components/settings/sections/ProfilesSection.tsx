import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { Plus, Settings2, Star, Trash2 } from "lucide-react"
import { useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ProfileModal } from "../ProfileModal"
import Section from "../Section"

interface ProfilesSectionProps {
	renderSectionHeader?: (tabId: string) => JSX.Element | null
}

interface EditingProfile {
	id: string
	name: string
	description?: string
}

const ProfilesSection = ({ renderSectionHeader }: ProfilesSectionProps) => {
	const { profiles, activeProfileId, profileSystemActive } = useExtensionState()
	const [selectedProfileId, setSelectedProfileId] = useState<string | null>(activeProfileId || null)

	// 모달 상태
	const [modalOpen, setModalOpen] = useState(false)
	const [modalMode, setModalMode] = useState<"create" | "edit">("create")
	const [editingProfile, setEditingProfile] = useState<EditingProfile | null>(null)

	// 프로필 생성 핸들러
	const handleCreateProfile = () => {
		setModalMode("create")
		setEditingProfile(null)
		setModalOpen(true)
	}

	// 프로필 편집 핸들러
	const handleEditProfile = (profile: { id: string; name: string; description?: string }) => {
		setModalMode("edit")
		setEditingProfile(profile)
		setModalOpen(true)
	}

	// 프로필 저장 핸들러
	const handleSaveProfile = (name: string, description: string) => {
		// TODO: ProfileManager API 호출 (gRPC)
		if (modalMode === "create") {
			console.log("Create profile:", { name, description })
			// ProfileManager.createProfile({ name, description, configuration: {...} })
		} else if (editingProfile) {
			console.log("Update profile:", { id: editingProfile.id, name, description })
			// ProfileManager.updateProfile(editingProfile.id, { name, description })
		}
		setModalOpen(false)
	}

	// 프로필 시스템이 비활성화된 경우
	if (!profileSystemActive) {
		return (
			<div>
				{renderSectionHeader?.("profiles")}
				<Section>
					<div className="flex flex-col items-center justify-center py-10 text-center">
						<Settings2 className="w-12 h-12 mb-4 opacity-50" />
						<h3 className="text-lg mb-2">Profile System Disabled</h3>
						<p className="text-sm opacity-70 mb-4">Profile system is not active.</p>
					</div>
				</Section>
			</div>
		)
	}

	return (
		<div>
			{renderSectionHeader?.("profiles")}
			<Section>
				{/* 헤더: 설명 + 새 프로필 버튼 */}
				<div className="flex items-start justify-between mb-4">
					<div className="flex-1">
						<p className="text-sm opacity-70 mb-2">
							Manage multiple LLM configuration profiles. Switch between different API providers, models, and
							settings.
						</p>
					</div>
					<VSCodeButton onClick={handleCreateProfile}>
						<Plus className="w-4 h-4 mr-2" />
						New Profile
					</VSCodeButton>
				</div>

				{/* 프로필 목록 */}
				<div className="flex flex-col gap-2">
					{profiles?.map((profile) => {
						const isActive = profile.id === activeProfileId
						const isSelected = profile.id === selectedProfileId

						return (
							<div
								className={`
									border border-(--vscode-panel-border) rounded-md p-4 cursor-pointer
									transition-colors duration-150
									${isSelected ? "bg-selection border-(--vscode-focusBorder)" : "hover:bg-list-hover"}
								`}
								key={profile.id}
								onClick={() => setSelectedProfileId(profile.id)}>
								{/* 프로필 헤더 */}
								<div className="flex items-start justify-between mb-2">
									<div className="flex items-center gap-2 flex-1">
										<h4 className="text-base font-medium m-0">{profile.name}</h4>
										{profile.isDefault && (
											<span className="flex items-center gap-1 text-xs opacity-70">
												<Star className="w-3 h-3" />
												Default
											</span>
										)}
										{isActive && (
											<span className="text-xs px-2 py-0.5 rounded bg-(--vscode-badge-background) text-(--vscode-badge-foreground)">
												Active
											</span>
										)}
									</div>
									<div className="flex items-center gap-1">
										<VSCodeButton
											appearance="icon"
											aria-label="Edit profile"
											onClick={() => handleEditProfile(profile)}>
											<Settings2 className="w-4 h-4" />
										</VSCodeButton>
										{!profile.isDefault && (
											<VSCodeButton appearance="icon" aria-label="Delete profile">
												<Trash2 className="w-4 h-4" />
											</VSCodeButton>
										)}
									</div>
								</div>

								{/* 프로필 설명 */}
								{profile.description && <p className="text-sm opacity-70 m-0 mb-2">{profile.description}</p>}

								{/* 활성화 버튼 */}
								{!isActive && (
									<div className="mt-3">
										<VSCodeButton appearance="secondary" className="w-full">
											Activate Profile
										</VSCodeButton>
									</div>
								)}
							</div>
						)
					})}
				</div>

				{/* 프로필 관리 옵션 */}
				<div className="mt-4 pt-4 border-t border-(--vscode-panel-border)">
					<div className="flex items-center gap-2">
						<VSCodeButton appearance="secondary">Import Profile</VSCodeButton>
						<VSCodeButton appearance="secondary" disabled={!selectedProfileId}>
							Export Profile
						</VSCodeButton>
						<VSCodeButton appearance="secondary" disabled={!selectedProfileId}>
							Duplicate Profile
						</VSCodeButton>
					</div>
				</div>
			</Section>

			{/* Profile Modal */}
			<ProfileModal
				mode={modalMode}
				onOpenChange={setModalOpen}
				onSave={handleSaveProfile}
				open={modalOpen}
				profileDescription={editingProfile?.description}
				profileName={editingProfile?.name}
			/>
		</div>
	)
}

export default ProfilesSection
