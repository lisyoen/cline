import { Empty } from "@shared/proto/cline/common"
import type { ActivateProfileRequest } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import type { Controller } from "../index"

/**
 * Activates a profile (sets as active).
 *
 * @param controller The controller instance
 * @param request Activate profile request with profile ID
 * @returns Empty response
 */
export async function activateProfile(_controller: Controller, request: ActivateProfileRequest): Promise<Empty> {
	const profileManager = ProfileManager.get()

	profileManager.activateProfile(request.profileId)

	return {}
}
