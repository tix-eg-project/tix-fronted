"use client";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { ReferralInfo } from "@/utils/Types/referral";

/**
 * Shared referral info fetch — used anywhere we need the customer's code /
 * stats (account nav, referral page) so the gating logic (hide UI when
 * `is_active` is false) lives in one place, mirroring useLoyaltySummary.
 */
export function useReferral() {
  const { state: authState } = useAuth();
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    if (!authState.isAuthenticated) {
      setReferral(null);
      setError(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/referral");
      if (res.data.status) {
        setReferral(res.data.data);
        setError(false);
      } else {
        setReferral(null);
        setError(true);
      }
    } catch {
      setReferral(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { referral, loading, error, refresh };
}
