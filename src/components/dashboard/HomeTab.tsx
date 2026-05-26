import { useLanguage } from "@/i18n/LanguageContext";
import { User } from "@/lib/auth";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList, Bug, Bird, AlertTriangle, History,
  IndianRupee, ChevronRight, Syringe, TrendingUp, Lightbulb, Bell,
} from "lucide-react";

type NavTab = "weekly" | "disease" | "notifications" | "history" | "prices" | "loan";

interface HomeTabProps {
  user: User;
  onNavigate?: (tab: NavTab) => void;
}

function fmt(d: string) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
}

const NOTIF_CONFIG: Record<string, { icon: typeof Bell; iconColor: string; bg: string; border: string; labelEn: string; labelTa: string }> = {
  disease:              { icon: AlertTriangle, iconColor: "text-danger",  bg: "bg-danger/8",  border: "border-danger/30",  labelEn: "Disease Alert",         labelTa: "நோய் எச்சரிக்கை" },
  market:               { icon: TrendingUp,    iconColor: "text-success", bg: "bg-success/8", border: "border-success/30", labelEn: "Market Price",           labelTa: "சந்தை விலை" },
  tip:                  { icon: Lightbulb,     iconColor: "text-primary", bg: "bg-primary/8", border: "border-primary/30", labelEn: "Farming Tip",            labelTa: "வேளாண் குறிப்பு" },
  vaccination_reminder: { icon: Syringe,       iconColor: "text-warning", bg: "bg-warning/8", border: "border-warning/30", labelEn: "Vaccination Reminder",   labelTa: "தடுப்பூசி நினைவூட்டல்" },
};

const HomeTab = ({ user, onNavigate }: HomeTabProps) => {
  const { t, lang } = useLanguage();

  const { data: weekData } = useQuery({ queryKey: ["checkWeek"],   queryFn: () => api.checkWeekSubmitted(), staleTime: 60_000 });
  const { data: marketPrice } = useQuery({ queryKey: ["marketPrice"], queryFn: () => api.getMarketPrice(),    staleTime: 60_000 });
  const { data: notifications = [] } = useQuery({ queryKey: ["notifications"], queryFn: () => api.getNotifications(), staleTime: 30_000 });

  const weekDone = weekData?.submitted ?? false;

  // Show max 3 most recent notifications in the alert dashboard
  const alertNotifs = (notifications as any[]).slice(0, 3);

  const cards: { key: NavTab; titleTa: string; titleEn: string; icon: typeof Bird; color: string; bg: string }[] = [
    { key: "weekly",  titleTa: t("birdsUpdate"),        titleEn: "(Birds update)",        icon: Bird,          color: "text-primary",   bg: "bg-primary/10" },
    { key: "loan",    titleTa: t("servicesNeededTitle"), titleEn: "(Services & Loan)",     icon: ClipboardList, color: "text-[#8D6E63]", bg: "bg-[#8D6E63]/10" },
    { key: "disease", titleTa: t("reportDisease"),       titleEn: "(Report diseases)",     icon: Bug,           color: "text-danger",    bg: "bg-danger/10" },
    { key: "history", titleTa: t("vaccinationHistory"),  titleEn: "(Vaccination History)", icon: History,       color: "text-success",   bg: "bg-success/10" },
    { key: "prices",  titleTa: t("marketPrice"),         titleEn: "(Market Prices)",       icon: IndianRupee,   color: "text-[#F9A825]", bg: "bg-[#F9A825]/10" },
  ];

  return (
    <div className="flex flex-col gap-4">

      {/* Greeting card */}
      <div className="rounded-2xl p-5 text-white shadow-md" style={{ background: "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)" }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold leading-tight">{t("hello")}, {user.name} 👋</p>
            <p className="text-sm opacity-85 mt-0.5">{user.hamlet}{user.shgName ? ` • ${user.shgName}` : ""}</p>
          </div>
          <div className="text-3xl">🌾</div>
        </div>
        <div className="mt-3 bg-white/20 rounded-xl px-3 py-2 flex items-center gap-2">
          <span className="text-base">{weekDone ? "✅" : "⏰"}</span>
          <p className="text-xs font-semibold">
            {weekDone ? t("weeklyUpdateSubmitted") : t("weeklyUpdateNotSubmitted")}
          </p>
        </div>
        {marketPrice && (
          <div className="mt-2 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2">
            <IndianRupee size={14} className="text-white/80" />
            <p className="text-xs font-semibold">
              {lang === "ta" ? "கறிக்கோழி" : "Broiler"}: ₹{marketPrice.broiler}/kg &nbsp;•&nbsp;
              {lang === "ta" ? "முட்டை" : "Egg"}: ₹{marketPrice.egg} &nbsp;•&nbsp;
              {lang === "ta" ? "குஞ்சு" : "Chick"}: ₹{marketPrice.chick}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs italic text-muted-foreground text-center">{t("dashboardEn")}</p>

      {/* Nav cards */}
      <div className="flex flex-col gap-3">
        {cards.map((c) => (
          <button
            key={c.key}
            onClick={() => onNavigate?.(c.key)}
            className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-border/60 shadow-sm hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.98] text-left"
          >
            <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center shrink-0`}>
              <c.icon size={24} className={c.color} />
            </div>
            <div className="flex-1">
              <p className="text-base font-bold text-foreground leading-tight">{c.titleTa}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{c.titleEn}</p>
            </div>
            {c.key === "weekly" && !weekDone && (
              <span className="text-[10px] bg-warning/20 text-warning font-bold px-2 py-1 rounded-lg shrink-0">{t("pending")}</span>
            )}
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      {/* Alert dashboard */}
      <div className="rounded-2xl border-2 border-warning/30 overflow-hidden" style={{ background: "linear-gradient(135deg, #fffde7, #fff8e1)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-warning/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-warning shrink-0" size={18} />
            <p className="text-sm font-bold text-foreground">{t("attention")}</p>
          </div>
          <button
            onClick={() => onNavigate?.("notifications")}
            className="text-xs font-semibold text-primary flex items-center gap-1"
          >
            {lang === "ta" ? "அனைத்தும்" : "View all"} <ChevronRight size={13} />
          </button>
        </div>

        {/* Notification cards */}
        <div className="flex flex-col divide-y divide-warning/10">
          {alertNotifs.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-4">
              <Bell size={18} className="text-muted-foreground/50 shrink-0" />
              <p className="text-sm text-muted-foreground">
                {lang === "ta" ? "புதிய அறிவிப்புகள் இல்லை" : "No new alerts"}
              </p>
            </div>
          ) : (
            alertNotifs.map((n: any) => {
              const cfg = NOTIF_CONFIG[n.type] ?? NOTIF_CONFIG["tip"];
              const Icon = cfg.icon;
              const label = lang === "ta" ? cfg.labelTa : cfg.labelEn;
              return (
                <div key={n._id} className="flex items-start gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon size={15} className={cfg.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.iconColor}`}>
                        {label}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{fmt(n.createdAt)}</span>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{n.message}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};

export default HomeTab;
