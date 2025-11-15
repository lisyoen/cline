import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "../common/AlertDialog"

interface ProfileModalProps {
	open: boolean
	mode: "create" | "edit"
	profileName?: string
	profileDescription?: string
	onOpenChange: (open: boolean) => void
	onSave: (name: string, description: string) => void
}

export function ProfileModal({ open, mode, profileName = "", profileDescription = "", onOpenChange, onSave }: ProfileModalProps) {
	const [name, setName] = useState(profileName)
	const [description, setDescription] = useState(profileDescription)
	const [nameError, setNameError] = useState("")

	// Props 변경 시 state 업데이트 (Edit 모드에서 프로필 데이터 로드)
	useEffect(() => {
		if (open) {
			setName(profileName)
			setDescription(profileDescription)
			setNameError("")

			// Focus and select text after a short delay to ensure DOM is ready
			setTimeout(() => {
				const input = document.getElementById("profile-name") as HTMLInputElement
				if (input) {
					input.focus()
					input.select()
				}
			}, 100)
		}
	}, [open, profileName, profileDescription])

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			// 모달 닫힐 때 state 초기화
			setName("")
			setDescription("")
			setNameError("")
		}
		onOpenChange(newOpen)
	}

	const validateName = (value: string): boolean => {
		if (!value.trim()) {
			setNameError("Profile name is required")
			return false
		}
		if (value.trim().length < 2) {
			setNameError("Profile name must be at least 2 characters")
			return false
		}
		if (value.trim().length > 50) {
			setNameError("Profile name must be less than 50 characters")
			return false
		}
		setNameError("")
		return true
	}

	const handleSave = () => {
		if (!validateName(name)) {
			return
		}
		onSave(name.trim(), description.trim())
		handleOpenChange(false)
	}

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault()
			handleSave()
		}
		// Escape는 AlertDialog가 자동으로 처리
	}

	return (
		<AlertDialog onOpenChange={handleOpenChange} open={open}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{mode === "create" ? "Create New Profile" : "Edit Profile"}</AlertDialogTitle>
				</AlertDialogHeader>
				<div className="flex flex-col gap-4 mt-4">
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium" htmlFor="profile-name">
							Profile Name <span className="text-(--vscode-errorForeground)">*</span>
						</label>
						<VSCodeTextField
							id="profile-name"
							onInput={(e: any) => {
								const value = e.target.value
								setName(value)
								if (nameError) {
									validateName(value)
								}
							}}
							onKeyDown={handleKeyDown}
							placeholder="e.g., Production, Development, Testing"
							value={name}
						/>
						{nameError && <p className="text-xs text-(--vscode-errorForeground) m-0">{nameError}</p>}
					</div>
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium" htmlFor="profile-description">
							Description <span className="text-xs opacity-70">(optional)</span>
						</label>
						<VSCodeTextField
							id="profile-description"
							onInput={(e: any) => setDescription(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Brief description of this profile"
							value={description}
						/>
					</div>
				</div>
				<AlertDialogFooter>
					<AlertDialogCancel onClick={() => handleOpenChange(false)}>Cancel</AlertDialogCancel>
					<AlertDialogAction onClick={handleSave}>{mode === "create" ? "Create" : "Save"}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
