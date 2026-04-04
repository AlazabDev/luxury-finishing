import { useEffect, useMemo, useState } from "react";
import { AlertCircle, BadgeCheck, Facebook, Loader2, RefreshCcw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getFacebookLoginStatus,
  loginWithFacebook,
  type FacebookLoginStatus,
} from "@/lib/meta-sdk";

const AUTH_HOOKS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/auth-hooks`;
const FACEBOOK_SCOPES = [
  "public_profile",
  "email",
  "business_management",
  "whatsapp_business_management",
  "whatsapp_business_messaging",
];

const FacebookConnectionCard = () => {
  const { lang } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FacebookLoginStatus | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const copy = useMemo(
    () =>
      lang === "ar"
        ? {
            badge: "ربط فيسبوك",
            title: "ربط حساب فيسبوك الخاص بالمشروع",
            lead:
              "استخدم هذه الخطوة للتحقق من اتصال تطبيق ميتا من الواجهة الأمامية وتسجيل حالة الربط داخل هوكات المصادقة.",
            connect: "تسجيل الدخول عبر فيسبوك",
            refresh: "تحديث الحالة",
            ready: "متصل",
            pending: "غير متصل",
            unknown: "غير معروف",
            syncOk: "تم تسجيل حالة ربط فيسبوك بنجاح.",
            syncFail: "تم الاتصال بفيسبوك لكن تعذر تسجيل الحالة على الخادم.",
            missingApp: "معرف تطبيق فيسبوك غير مضبوط في بيئة الواجهة.",
            connectedAs: "معرف المستخدم",
            lastSync: "آخر مزامنة",
            state: "الحالة الحالية",
            note:
              "هذه البطاقة مخصصة للتحقق من المصادقة وتأكيد التكامل فقط، ولا تعرض أي أسرار تشغيلية.",
            permissions: "الصلاحيات المطلوبة",
          }
        : {
            badge: "Facebook Connection",
            title: "Connect The Project Facebook Account",
            lead:
              "Use this step to verify the Meta app connection from the frontend and register the result through the authentication hooks.",
            connect: "Sign In With Facebook",
            refresh: "Refresh Status",
            ready: "Connected",
            pending: "Not Connected",
            unknown: "Unknown",
            syncOk: "Facebook connection status was registered successfully.",
            syncFail: "Facebook login succeeded, but the server status registration failed.",
            missingApp: "Facebook app id is not configured in the frontend environment.",
            connectedAs: "User ID",
            lastSync: "Last Sync",
            state: "Current Status",
            note:
              "This card is intended for authentication verification and integration confirmation only. No operational secrets are exposed here.",
            permissions: "Requested permissions",
          },
    [lang],
  );

  const appId = import.meta.env.VITE_FB_APP_ID;

  const syncStatus = async (response: FacebookLoginStatus) => {
    const payload = {
      source: "facebook-sdk",
      provider: "facebook",
      status: response.status,
      authResponse: response.authResponse,
      userAgent: navigator.userAgent,
      syncedAt: new Date().toISOString(),
    };

    const res = await fetch(AUTH_HOOKS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || "Failed to sync auth hook state");
    }

    setLastSync(data.received_at || payload.syncedAt);
  };

  const refreshStatus = async () => {
    if (!appId) {
      toast.error(copy.missingApp);
      return;
    }

    setLoading(true);
    try {
      const nextStatus = await getFacebookLoginStatus();
      setStatus(nextStatus);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.pending);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!appId) {
      toast.error(copy.missingApp);
      return;
    }

    setLoading(true);
    try {
      const nextStatus = await loginWithFacebook(FACEBOOK_SCOPES);
      setStatus(nextStatus);

      if (nextStatus?.status === "connected") {
        try {
          await syncStatus(nextStatus);
          toast.success(copy.syncOk);
        } catch (error) {
          console.error(error);
          toast.error(copy.syncFail);
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : copy.pending);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshStatus();
  }, []);

  const statusLabel =
    status?.status === "connected"
      ? copy.ready
      : status?.status === "not_authorized"
        ? copy.pending
        : copy.unknown;

  const statusTone =
    status?.status === "connected"
      ? "bg-emerald-500/10 text-emerald-700"
      : status?.status === "not_authorized"
        ? "bg-amber-500/10 text-amber-700"
        : "bg-secondary text-foreground";

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1 text-xs font-bold text-primary">
        <Facebook className="h-3.5 w-3.5" />
        {copy.badge}
      </div>

      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-primary">{copy.title}</h2>
          <p className="max-w-2xl leading-7 text-muted-foreground">{copy.lead}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-primary">{copy.state}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusTone}`}>
              {statusLabel}
            </span>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-accent" />
              {copy.permissions}: {FACEBOOK_SCOPES.join(", ")}
            </p>
            {status?.authResponse?.userID ? (
              <p className="font-mono text-xs">
                {copy.connectedAs}: {status.authResponse.userID}
              </p>
            ) : null}
            {lastSync ? (
              <p className="text-xs">
                {copy.lastSync}:{" "}
                {new Date(lastSync).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4">
          <p className="mb-4 text-sm leading-7 text-muted-foreground">{copy.note}</p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => void handleConnect()} disabled={loading || !appId}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Facebook className="h-4 w-4" />}
              {copy.connect}
            </Button>
            <Button variant="outline" onClick={() => void refreshStatus()} disabled={loading || !appId}>
              <RefreshCcw className="h-4 w-4" />
              {copy.refresh}
            </Button>
            {!appId ? (
              <div className="flex items-start gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{copy.missingApp}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookConnectionCard;
