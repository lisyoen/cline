import type { GetProfileRequest, ProfileResponse } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import type { Controller } from "../index"

/**
 * Gets a single profile by ID.
 *
 * @param controller The controller instance
 * @param request Get profile request with profile ID
 * @returns The requested profile
 */
export async function getProfile(_controller: Controller, request: GetProfileRequest): Promise<ProfileResponse> {
	const profileManager = ProfileManager.get()

	const profile = profileManager.getProfile(request.profileId)

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
