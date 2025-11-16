import type { Profile } from "@shared/profiles"
import type { GetProfileRequest, ProfileResponse } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import type { Controller } from "../index"
import { convertProfileConfigurationToProto } from "./utils/profileConfigConverter"

/**
 * Gets a single profile by ID.
 *
 * @param controller The controller instance
 * @param request Get profile request with profile ID
 * @returns The requested profile
 */
export async function getProfile(_controller: Controller, request: GetProfileRequest): Promise<ProfileResponse> {
	const profileManager = ProfileManager.get()

	const profileOrNull = profileManager.getProfile(request.profileId)
	if (!profileOrNull) {
		throw new Error(`Profile not found: ${request.profileId}`)
	}

	// Type assertion: we know profile is not null after the check
	const profile: Profile = profileOrNull!

	// Convert ProfileConfiguration to proto format
	const apiConfiguration = convertProfileConfigurationToProto(profile.configuration, request.profileId)

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
				apiConfiguration,
			},
		},
	}
}
