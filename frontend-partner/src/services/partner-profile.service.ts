import { get, put } from './api-client';
import type {
  PartnerSettingsResponse,
  UpdatePartnerProfileInput,
} from '../types/settings';

// ── GET /api/partner/settings ──────────────────────────────────────────────────

/**
 * GET /api/partner/settings
 * Returns combined user + partner data for the Account Settings page.
 */
export function apiGetPartnerSettings(): Promise<PartnerSettingsResponse> {
  return get<PartnerSettingsResponse>('/api/partner/settings', { auth: true })
    .then(res => res.data);
}

// ── PUT /api/partner/profile ───────────────────────────────────────────────────

/**
 * PUT /api/partner/profile
 * Updates partner representative info and business license.
 */
export function apiUpdatePartnerProfile(
  input: UpdatePartnerProfileInput,
): Promise<unknown> {
  return put('/api/partner/profile', input, { auth: true }).then(res => res.data);
}
