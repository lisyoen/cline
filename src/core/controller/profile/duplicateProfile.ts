import type { DuplicateProfileRequest, ProfileResponse } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import type { Controller } from "../index"

/**
 * Duplicates an existing profile.
 *
 * @param controller The controller instance
 * @param request Duplicate profile request with source profile ID and new name
 * @returns The duplicated profile
 */
export async function duplicateProfile(_controller: Controller, request: DuplicateProfileRequest): Promise<ProfileResponse> {
	const profileManager = ProfileManager.get()

	const profile = profileManager.duplicateProfile(request.sourceProfileId, request.newName, request.newDescription)

	return {
		profile: {
			metadata: {
				id: profile.metadata.id,
				name: profile.metadata.name,
				description: profile.metadata.description,
				isDefault: profile.metadata.isDefault,
				createdAt: profile.metadata.createdAt,
				updatedAt: profile.metadata.updatedAt,
				color: profile.metadata.color,
				icon: profile.metadata.icon,
			},
			configuration: {
				apiConfiguration: undefined, // TODO: Convert configuration to proto
			},
		},
	}
}
