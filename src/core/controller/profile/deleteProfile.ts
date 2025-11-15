import { Empty } from "@shared/proto/cline/common"
import type { DeleteProfileRequest } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import type { Controller } from "../index"

/**
 * Deletes a profile (cannot delete default profile).
 *
 * @param controller The controller instance
 * @param request Delete profile request with profile ID
 * @returns Empty response
 */
export async function deleteProfile(_controller: Controller, request: DeleteProfileRequest): Promise<Empty> {
	const profileManager = ProfileManager.get()

	profileManager.deleteProfile(request.profileId)

	return {}
}
