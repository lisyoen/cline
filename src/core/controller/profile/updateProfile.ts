import type { ProfileResponse, UpdateProfileRequest } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import type { Controller } from "../index"

/**
 * Updates an existing profile.
 *
 * @param controller The controller instance
 * @param request Update profile request with profile ID and optional updates
 * @returns The updated profile
 */
export async function updateProfile(_controller: Controller, request: UpdateProfileRequest): Promise<ProfileResponse> {
	const profileManager = ProfileManager.get()

	const updates: any = {}

	if (request.name) {
		updates.metadata = { ...updates.metadata, name: request.name }
	}

	if (request.description !== undefined) {
		updates.metadata = { ...updates.metadata, description: request.description }
	}

	if (request.color !== undefined) {
		updates.metadata = { ...updates.metadata, color: request.color }
	}

	if (request.icon !== undefined) {
		updates.metadata = { ...updates.metadata, icon: request.icon }
	}

	// TODO: Handle configuration updates
	// if (request.configuration?.api_configuration) {
	//   updates.configuration = convertProtoToConfiguration(request.configuration)
	// }

	const profile = profileManager.updateProfile(request.profileId, updates)

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
