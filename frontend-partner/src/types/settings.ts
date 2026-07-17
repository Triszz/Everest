// ── Partner Settings types (mirrors backend GET /api/partner/settings) ───────────

export type PartnerStatus = 'Pending' | 'Approved' | 'Rejected';

export interface PartnerSettingsUser {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
}

export interface PartnerSettingsPartner {
  partnerId: number;
  companyName: string;
  taxCode: string;
  representativeName: string | null;
  representativePosition: string | null;
  representativePhone: string | null;
  representativeEmail: string | null;
  businessLicenseUrl: string | null;
  status: PartnerStatus;
  createdAt: string;
}

export interface PartnerSettingsResponse {
  user: PartnerSettingsUser;
  partner: PartnerSettingsPartner;
}

// ── Update inputs ───────────────────────────────────────────────────────────────

export interface UpdateUserProfileInput {
  fullName?: string;
  phoneNumber?: string | null;
}

export interface UpdatePartnerProfileInput {
  representativeName?: string | null;
  representativePosition?: string | null;
  representativePhone?: string | null;
  representativeEmail?: string | null;
  businessLicenseUrl?: string | null;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
