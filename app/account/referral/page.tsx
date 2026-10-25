"use client";
import { useEffect, useState } from "react";
import { Gift, Copy, Loader2, Users, Award } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useReferral } from "@/utils/useReferral";
import type { ReferralInvite, ReferralInvitesResponse } from "@/utils/Types/referral";

const INVITES_PER_PAGE = 15;
const USERNAME_PATTERN = /^[A-Za-z0-9._]{3,30}$/;

export default function ReferralPage() {
  const { state: authState } = useAuth();
  const { t, lang } = useLanguage();
  const { referral, loading: referralLoading, error: referralError, refresh } = useReferral();

  // Username form (only shown when the customer has no code yet)
  const [username, setUsername] = useState("");
  const [creating, setCreating] = useState(false);

  // Invites list
  const [invites, setInvites] = useState<ReferralInvite[]>([]);
  const [invitesMeta, setInvitesMeta] = useState<ReferralInvitesResponse["meta"] | null>(null);
  const [invitesPage, setInvitesPage] = useState(1);
  const [invitesLoading, setInvitesLoading] = useState(true);

  useEffect(() => {
    if (!authState.isAuthenticated || !referral?.is_active || referral.needs_username) return;
    setInvitesLoading(true);
    api
      .get("/referral/invites", { params: { page: invitesPage, per_page: INVITES_PER_PAGE } })
      .then((res) => {
        if (res.data.status) {
          setInvites(res.data.data.items || []);
          setInvitesMeta(res.data.data.meta || null);
        }
      })
      .catch(() => {})
      .finally(() => setInvitesLoading(false));
  }, [authState.isAuthenticated, referral?.is_active, referral?.needs_username, invitesPage, lang]);

  const handleCopyCode = async () => {
    if (!referral?.code) return;
    try {
      await navigator.clipboard.writeText(referral.code);
      toast.success(t("referral.codeCopied"));
    } catch {
      toast.error(t("referral.copyFailed"));
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (creating) return;
    if (!USERNAME_PATTERN.test(username.trim())) {
      toast.error(t("referral.usernameInvalid"));
      return;
    }
    setCreating(true);
    try {
      const res = await api.post("/referral", { username: username.trim() });
      if (res.data.status) {
        toast.success(res.data.message || t("referral.codeCreated"));
        await refresh();
      } else {
        toast.error(res.data.message || t("common.error"));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("common.error"));
    } finally {
      setCreating(false);
    }
  };

  if (authState.isLoading || referralLoading) {
    return (
      <div className="card p-6 flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-black" />
      </div>
    );
  }

  if (referralError) {
    return (
      <div className="card p-10 flex flex-col items-center text-center text-text-muted gap-3">
        <Gift className="w-12 h-12 text-text-faint" />
        <p className="font-medium">{t("referral.loadError")}</p>
      </div>
    );
  }

  if (!referral || !referral.is_active) {
    return (
      <div className="card p-10 flex flex-col items-center text-center text-text-muted gap-3">
        <Gift className="w-12 h-12 text-text-faint" />
        <p className="font-medium">{t("referral.inactiveTitle")}</p>
        <p className="text-sm">{t("referral.inactiveDesc")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">{t("referral.pageTitle")}</h2>

      {/* Code card */}
      <div className="card p-6">
        {referral.needs_username ? (
          <form onSubmit={handleCreateCode} className="space-y-3">
            <div className="flex items-center gap-4 mb-1">
              <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold">{t("referral.needsUsernameTitle")}</p>
                <p className="text-sm text-text-muted">{t("referral.needsUsernameDesc")}</p>
              </div>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("referral.usernamePlaceholder")}
              className="input-field"
              dir="ltr"
            />
            <p className="text-xs text-text-faint">{t("referral.usernameHint")}</p>
            <button type="submit" className="btn-primary w-full" disabled={creating}>
              {creating ? t("referral.creatingCode") : t("referral.createCode")}
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
              <Gift className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-muted">{t("referral.codeCardTitle")}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-2xl font-bold" dir="ltr">{referral.code}</p>
                <button
                  onClick={handleCopyCode}
                  className="w-8 h-8 rounded-lg border border-divider flex items-center justify-center hover:border-black transition-colors shrink-0"
                  aria-label={t("referral.copyCode")}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-text-faint mt-1">{t("referral.codeDesc")}</p>
              <p className="text-xs text-text-faint">
                {t("referral.pointsPerInvite", { points: referral.points_per_invite })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      {!referral.needs_username && (
        <div className="card p-5">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-black" />
            {t("referral.statsTitle")}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t("referral.statsTotal"), value: referral.stats.total },
              { label: t("referral.statsPending"), value: referral.stats.pending },
              { label: t("referral.statsRewarded"), value: referral.stats.rewarded },
              { label: t("referral.statsPointsEarned"), value: referral.stats.points_earned },
            ].map((stat) => (
              <div key={stat.label} className="p-3.5 rounded-xl border border-divider text-center">
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-xs text-text-muted mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invites */}
      {!referral.needs_username && (
        <div className="card p-5">
          <h3 className="font-bold flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-black" />
            {t("referral.invitesTitle")}
          </h3>

          {invitesLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-black" />
            </div>
          ) : invites.length === 0 ? (
            <div className="flex flex-col items-center text-center text-text-muted gap-2 py-10">
              <Users className="w-10 h-10 text-text-faint" />
              <p className="font-medium">{t("referral.emptyInvitesTitle")}</p>
              <p className="text-sm">{t("referral.emptyInvitesDesc")}</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {invites.map((invite) => {
                  const date = new Date(invite.created_at).toLocaleDateString(
                    lang === "en" ? "en-US" : "ar-EG",
                    { year: "numeric", month: "short", day: "numeric" },
                  );
                  const statusStyle =
                    invite.status === "rewarded"
                      ? "bg-success/10 text-success"
                      : invite.status === "cancelled"
                      ? "bg-error/10 text-error"
                      : "bg-surface-2 text-text-muted";
                  return (
                    <div
                      key={invite.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-divider"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{invite.customer}</p>
                        <p className="text-xs text-text-faint">{date}</p>
                      </div>
                      <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${statusStyle}`}>
                        {t(`referral.status_${invite.status}`)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {invitesMeta && invitesMeta.last_page > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => setInvitesPage((p) => p - 1)}
                    disabled={invitesPage === 1}
                    className="px-4 py-2 rounded-xl border border-divider text-sm font-medium disabled:opacity-40 hover:border-black transition-colors"
                  >
                    {t("common.previous")}
                  </button>
                  <span className="text-sm text-text-muted">
                    {invitesPage} / {invitesMeta.last_page}
                  </span>
                  <button
                    onClick={() => setInvitesPage((p) => p + 1)}
                    disabled={invitesPage === invitesMeta.last_page}
                    className="px-4 py-2 rounded-xl border border-divider text-sm font-medium disabled:opacity-40 hover:border-black transition-colors"
                  >
                    {t("common.next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
