import { EmptyRequest } from "@shared/proto/cline/common"
import type { ProfileListResponse } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import type { Controller } from "../index"

/**
 * Gets all profiles.
 *
 * @param controller The controller instance
 * @param request Empty request
 * @returns List of all profiles
 */
export async function getAllProfiles(_controller: Controller, _request: EmptyRequest): Promise<ProfileListResponse> {
	const profileManager = ProfileManager.get()

	const profiles = profileManager.getAllProfiles()

	return {
		profiles: profiles.map((profile) => ({
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
		})),
	}
}
