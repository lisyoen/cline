import type { ExportProfileRequest, ExportProfileResponse } from "@shared/proto/cline/profile"
import { ProfileManager } from "@/core/storage/ProfileManager"
import type { Controller } from "../index"

/**
 * Exports a profile to JSON.
 *
 * @param controller The controller instance
 * @param request Export profile request with profile ID
 * @returns JSON string of the profile
 */
export async function exportProfile(_controller: Controller, request: ExportProfileRequest): Promise<ExportProfileResponse> {
	const profileManager = ProfileManager.get()

	const jsonData = profileManager.exportProfile(request.profileId)

	return {
		jsonData,
	}
}
