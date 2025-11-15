import type { CreateProfileRequest, ProfileResponse } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import { StateManager } from "@/core/storage/StateManager"
import type { Controller } from "../index"

/**
 * Creates a new profile.
 *
 * @param controller The controller instance
 * @param request Create profile request with name, description, and optional configuration
 * @returns The created profile
 */
export async function createProfile(controller: Controller, request: CreateProfileRequest): Promise<ProfileResponse> {
	console.log("[Profile] createProfile: starting, name:", request.name)
	const profileManager = ProfileManager.get()

	// Create profile with basic metadata
	const profile = profileManager.createProfile(request.name, request.description)
	console.log("[Profile] createProfile: profile created with ID:", profile.metadata.id)

	// TODO: Update configuration if provided in request
	// if (request.configuration?.api_configuration) {
	//   profileManager.updateProfile(profile.metadata.id, {
	//     configuration: convertProtoToConfiguration(request.configuration)
	//   })
	// }

	// Immediately flush to disk to prevent data loss on quick restart
	console.log("[Profile] createProfile: calling StateManager.flush()...")
	await StateManager.get().flush()
	console.log("[Profile] createProfile: StateManager.flush() completed")

	// Immediately update webview state
	console.log("[Profile] createProfile: calling postStateToWebview()...")
	await controller.postStateToWebview()
	console.log("[Profile] createProfile: completed successfully")

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
