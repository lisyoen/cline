import { ChevronDown } from "lucide-react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import styled from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"

interface ProfileSelectorProps {
	disabled?: boolean
}

const SelectorContainer = styled.div<{ disabled: boolean }>`
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 6px 10px;
	background-color: transparent;
	border: 1px solid var(--vscode-input-border);
	border-radius: 8px;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	font-size: 11px;
	white-space: nowrap;
	transition: background-color 0.2s ease;
	user-select: none;
	min-width: 120px;
	max-width: 200px;

	&:hover {
		background-color: ${(props) => (props.disabled ? "transparent" : "var(--vscode-list-hoverBackground)")};
	}
`

const ProfileLabel = styled.span`
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--vscode-foreground);
	font-weight: 500;
`

const IconWrapper = styled.span`
	display: flex;
	align-items: center;
	color: var(--vscode-foreground);
	opacity: 0.7;
`

const SelectorWrapper = styled.div`
	position: relative;
`

const DropdownMenu = styled.div`
	position: absolute;
	right: 0;
	background-color: var(--vscode-dropdown-background);
	border: 1px solid var(--vscode-dropdown-border);
	border-radius: 8px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	min-width: 200px;
	max-width: 300px;
	max-height: 300px;
	overflow-y: auto;
	z-index: 1000;
	padding: 4px;
`

const DropdownItem = styled.div<{ active?: boolean }>`
	padding: 8px 12px;
	cursor: pointer;
	border-radius: 4px;
	font-size: 11px;
	color: var(--vscode-foreground);
	background-color: ${(props) => (props.active ? "var(--vscode-list-activeSelectionBackground)" : "transparent")};

	&:hover {
		background-color: var(--vscode-list-hoverBackground);
	}
`

const DropdownItemTitle = styled.div`
	font-weight: 500;
	margin-bottom: 2px;
`

const DropdownItemDescription = styled.div`
	font-size: 10px;
	opacity: 0.7;
`

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ disabled = false }) => {
	const { profiles, activeProfileId, profileSystemActive } = useExtensionState()
	const [isOpen, setIsOpen] = useState(false)
	const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">("bottom")
	const wrapperRef = useRef<HTMLDivElement>(null)

	const activeProfile = useMemo(() => {
		if (!profileSystemActive || !profiles || !activeProfileId) {
			return null
		}
		return profiles.find((p) => p.id === activeProfileId)
	}, [profiles, activeProfileId, profileSystemActive])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside)
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [isOpen])

	const handleToggle = () => {
		if (disabled) {
			return
		}

		// 드롭다운 위치 계산
		if (wrapperRef.current && !isOpen) {
			const rect = wrapperRef.current.getBoundingClientRect()
			const spaceBelow = window.innerHeight - rect.bottom
			const spaceAbove = rect.top
			const dropdownHeight = 200 // 예상 드롭다운 높이

			if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
				setDropdownPosition("top")
			} else {
				setDropdownPosition("bottom")
			}
		}

		console.log("[ProfileSelector] Toggling dropdown")
		setIsOpen(!isOpen)
	}

	return (
		<SelectorWrapper ref={wrapperRef}>
			{isOpen && profiles && profiles.length > 0 && (
				<DropdownMenu
					style={{
						top: dropdownPosition === "bottom" ? "100%" : "auto",
						bottom: dropdownPosition === "top" ? "100%" : "auto",
						marginTop: dropdownPosition === "bottom" ? "4px" : "0",
						marginBottom: dropdownPosition === "top" ? "4px" : "0",
					}}>
					{profiles.map((profile) => (
						<DropdownItem
							active={profile.id === activeProfileId}
							key={profile.id}
							onClick={(e) => {
								e.stopPropagation()
								console.log("[ProfileSelector] Selected:", profile.name)
								setIsOpen(false)
							}}>
							<DropdownItemTitle>
								{profile.name} {profile.isDefault && "(기본)"}
							</DropdownItemTitle>
							{profile.description && <DropdownItemDescription>{profile.description}</DropdownItemDescription>}
						</DropdownItem>
					))}
				</DropdownMenu>
			)}
			<SelectorContainer disabled={disabled} onClick={handleToggle} title="프로필 선택">
				<ProfileLabel>
					{activeProfile?.name || (profileSystemActive ? "프로필 선택" : "프로필 시스템 비활성")}
				</ProfileLabel>
				<IconWrapper>
					<ChevronDown size={14} />
				</IconWrapper>
			</SelectorContainer>
		</SelectorWrapper>
	)
}

export default ProfileSelector
