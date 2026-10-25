export interface ReferralStats {
  total: number;
  pending: number;
  rewarded: number;
  points_earned: number;
}

export interface ReferralInfo {
  is_active: boolean;
  code: string | null;
  needs_username: boolean;
  points_per_invite: number;
  stats: ReferralStats;
}

export interface ReferralCheckResult {
  valid: boolean;
  reason: string | null;
}

export type ReferralInviteStatus = "pending" | "rewarded" | "cancelled";

export interface ReferralInvite {
  id: number;
  customer: string;
  status: ReferralInviteStatus;
  points_awarded: number;
  shipping_saved: number;
  created_at: string;
  rewarded_at: string | null;
}

export interface ReferralInvitesResponse {
  items: ReferralInvite[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
