import type { ImportProfileRequest, ProfileResponse } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import type { Controller } from "../index"

/**
 * Imports a profile from JSON.
 *
 * @param controller The controller instance
 * @param request Import profile request with JSON data and optional new name
 * @returns The imported profile
 */
export async function importProfile(_controller: Controller, request: ImportProfileRequest): Promise<ProfileResponse> {
	const profileManager = ProfileManager.get()

	const profile = profileManager.importProfile(request.jsonData, request.newName)

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
