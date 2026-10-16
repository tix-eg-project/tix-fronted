"use client";
import { useCallback, useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { LoyaltySummary } from "@/utils/Types/loyalty";

/**
 * Shared loyalty summary fetch — used anywhere we need balance / is_active
 * (Header, account sidebar, cart, checkout) so the gating logic
 * (hide UI when `is_active` is false) lives in one place.
 */
export function useLoyaltySummary() {
  const { state: authState } = useAuth();
  const [summary, setSummary] = useState<LoyaltySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    if (!authState.isAuthenticated) {
      setSummary(null);
      setError(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get("/loyalty/summary");
      if (res.data.status) {
        setSummary(res.data.data);
        setError(false);
      } else {
        setSummary(null);
        setError(true);
      }
    } catch {
      setSummary(null);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { summary, loading, error, refresh };
}
