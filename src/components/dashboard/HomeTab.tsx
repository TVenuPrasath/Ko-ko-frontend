import { useLanguage } from "@/i18n/LanguageContext";
import { User } from "@/lib/auth";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList, Bug, Bird, History,
  IndianRupee, ChevronRight, Syringe,
} from "lucide-react";

type NavTab = "weekly" | "disease" | "notifications" | "history" | "prices" | "loan";

interface HomeTabProps {
  user: User;
  onNavigate?: (tab: NavTab) => void;
}

function fmt(d: string | Date) {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
}

const TYPE_LABEL: Record<string, { en: string; ta: string }> = {
  F_vaccine:   { en: "F Vaccine",              ta: "F தடுப்பூசி" },
  IBD:         { en: "IBD Vaccine",             ta: "IBD தடுப்பூசி" },
  LaSota:      { en: "LaSota Vaccine",          ta: "LaSota தடுப்பூசி" },
  fowl_pox:    { en: "Fowl Pox Vaccine",        ta: "கோழி அம்மை தடுப்பூசி" },
  deworming:   { en: "Deworming",               ta: "குடற்புழு நீக்கம்" },
  R2B:         { en: "R2B + Deworming",         ta: "R2B + புழு நீக்கம்" },
  R2B_booster: { en: "R2B Booster + Deworming", ta: "R2B மீண்டும் + புழு நீக்கம்" },
};

const HomeTab = ({ user, onNavigate }: HomeTabProps) => {
  const { t, lang } = useLanguage();

  const { data: weekData } = useQuery({ queryKey: ["checkWeek"], queryFn: () => api.checkWeekSubmitted(), staleTime: 60_000 });
  const { data: scheduleData } = useQuery({
    queryKey: ["mySchedule"],
    queryFn: () => api.getMySchedule().catch(() => ({ batchDate: null, schedule: [] })),
    staleTime: 60_000,
  });

  const weekDone = weekData?.submitted ?? false;

  const schedule: any[] = scheduleData?.schedule ?? [];
  const nextVax = schedule
    .filter((e) => e.status === "upcoming" || e.status === "scheduled" || e.status === "overdue")
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())[0] ?? null;

  const isOverdue = nextVax?.status === "overdue";

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
      </div>

      {/* Vaccination alert — single next date only */}
      <div className={`rounded-2xl border-2 p-4 flex items-center gap-4 ${isOverdue ? "border-destructive/40 bg-destructive/5" : "border-warning/30 bg-warning/5"}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${isOverdue ? "bg-destructive/10" : "bg-warning/10"}`}>
          <Syringe size={22} className={isOverdue ? "text-destructive" : "text-warning"} />
        </div>
        <div className="flex-1 min-w-0">
          {nextVax ? (
            <>
              <p className={`text-xs font-bold mb-0.5 ${isOverdue ? "text-destructive" : "text-warning"}`}>
                {isOverdue
                  ? (lang === "ta" ? "⚠️ காலாவதியானது!" : "⚠️ Overdue!")
                  : (lang === "ta" ? "💉 அடுத்த தடுப்பூசி" : "💉 Next Vaccination")}
              </p>
              <p className="text-sm font-bold text-foreground">
                {TYPE_LABEL[nextVax.type]?.[lang as "en" | "ta"] ?? nextVax.label}
              </p>
              <p className={`text-xs mt-0.5 font-semibold ${isOverdue ? "text-destructive" : "text-primary"}`}>
                {fmt(nextVax.scheduledDate)}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-muted-foreground mb-0.5">
                {lang === "ta" ? "தடுப்பூசி அட்டவணை" : "Vaccination Schedule"}
              </p>
              <p className="text-xs text-muted-foreground">
                {lang === "ta"
                  ? "CRP குஞ்சு தேதியை பதிவு செய்த பிறகு தெரியும்"
                  : "CRP will set your batch date to show schedule"}
              </p>
            </>
          )}
        </div>
        <button onClick={() => onNavigate?.("history")} className="shrink-0">
          <ChevronRight size={18} className="text-muted-foreground" />
        </button>
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

    </div>
  );
};

export default HomeTab;
