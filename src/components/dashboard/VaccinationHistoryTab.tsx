import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Clock, AlertTriangle, Syringe } from "lucide-react";

function fmt(d: string | Date): string {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
}

const TYPE_LABELS: Record<string, { en: string; ta: string }> = {
  F_vaccine:    { en: "F Vaccine (Day 14)",        ta: "F தடுப்பூசி (14ஆம் நாள்)" },
  IBD:          { en: "IBD Vaccine (Day 28)",       ta: "IBD தடுப்பூசி (28ஆம் நாள்)" },
  LaSota:       { en: "LaSota Vaccine (Day 42)",    ta: "LaSota தடுப்பூசி (42ஆம் நாள்)" },
  fowl_pox:     { en: "Fowl Pox Vaccine (Day 56)",  ta: "கோழி அம்மை தடுப்பூசி (56ஆம் நாள்)" },
  deworming:    { en: "Deworming (Day 70)",          ta: "குடற்புழு நீக்கம் (70ஆம் நாள்)" },
  R2B:          { en: "R2B + Deworming (Day 84)",   ta: "R2B + புழு நீக்கம் (84ஆம் நாள்)" },
  R2B_booster:  { en: "R2B Booster + Deworming",    ta: "R2B மீண்டும் + புழு நீக்கம்" },
  white_diarrhea: { en: "White Diarrhea Vaccine",   ta: "வெள்ளை கழிச்சல் தடுப்பூசி" },
  smallpox:     { en: "Smallpox Vaccine",           ta: "அம்மை தடுப்பூசி" },
};

const STATUS_STYLE: Record<string, string> = {
  completed: "text-success bg-success/10",
  upcoming:  "text-primary bg-primary/10",
  overdue:   "text-destructive bg-destructive/10",
  scheduled: "text-warning bg-warning/10",
  pending:   "text-warning bg-warning/10",
};

const VaccinationHistoryTab = () => {
  const { lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<"schedule" | "history">("schedule");

  const { data: scheduleData, isLoading: schedLoading } = useQuery({
    queryKey: ["mySchedule"],
    queryFn: () => api.getMySchedule().catch(() => ({ batchDate: null, schedule: [] })),
    staleTime: 60_000,
  });

  const { data: records = [], isLoading: histLoading } = useQuery({
    queryKey: ["vaccinations"],
    queryFn: () => api.getVaccinations(),
    staleTime: 60_000,
  });

  const schedule: any[] = scheduleData?.schedule ?? [];
  const batchDate: string | null = scheduleData?.batchDate ?? null;

  const upcoming = schedule.filter((e) => e.status === "upcoming" || e.status === "scheduled");
  const overdue  = schedule.filter((e) => e.status === "overdue");
  const done     = schedule.filter((e) => e.status === "completed");
  const manualHistory = (records as any[]).filter((r) => !r.isAutoScheduled);

  const renderScheduleCard = (e: any) => {
    const label = TYPE_LABELS[e.type]?.[lang as "en" | "ta"] ?? e.label ?? e.type;
    const isR2B = e.type === "R2B" || e.type === "R2B_booster";
    return (
      <div key={e.type + e.scheduledDate} className="bg-white rounded-2xl border border-border/60 shadow-sm p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Syringe size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Calendar size={11} /> {fmt(e.scheduledDate)}
            </p>
            {isR2B && (
              <p className="text-xs text-warning mt-1">
                ⚠️ {lang === "ta" ? "முதலில் புழு நீக்கம், பிறகு R2B" : "Deworm first, then R2B after 1 day"}
              </p>
            )}
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg mt-2 ${STATUS_STYLE[e.status] ?? "text-muted-foreground bg-muted"}`}>
              {e.status === "completed" && <CheckCircle2 size={12} />}
              {e.status === "overdue"   && <AlertTriangle size={12} />}
              {(e.status === "upcoming" || e.status === "scheduled") && <Clock size={12} />}
              {e.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryCard = (r: any) => {
    const label = TYPE_LABELS[r.type]?.[lang as "en" | "ta"] ?? r.type;
    return (
      <div key={r._id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Syringe size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "ta" ? "கொடுத்த தேதி" : "Given"}: {fmt(r.dateGiven)}
            </p>
            {r.nextDueDate && (
              <p className="text-xs text-muted-foreground">
                {lang === "ta" ? "அடுத்த தேதி" : "Next"}: {fmt(r.nextDueDate)}
              </p>
            )}
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg mt-2 ${STATUS_STYLE[r.status] ?? ""}`}>
              {r.status}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const isLoading = schedLoading || histLoading;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #2E7D32, #4CAF50)" }}>
        <div className="flex items-center gap-3">
          <Syringe size={22} className="text-white" />
          <div>
            <p className="text-base font-bold">
              {lang === "ta" ? "தடுப்பூசி அட்டவணை" : "Vaccination Schedule"}
            </p>
            {batchDate && (
              <p className="text-xs opacity-80">
                {lang === "ta" ? "குஞ்சு வாங்கிய தேதி" : "Batch date"}: {fmt(batchDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 bg-muted/40 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "schedule" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}
        >
          {lang === "ta" ? "அட்டவணை" : "Schedule"} ({upcoming.length + overdue.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "history" ? "bg-white text-primary shadow-sm" : "text-muted-foreground"}`}
        >
          {lang === "ta" ? "வரலாறு" : "History"} ({done.length + manualHistory.length})
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border/60 p-4 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && activeTab === "schedule" && (
        <>
          {!batchDate ? (
            <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
              <Syringe size={32} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {lang === "ta"
                  ? "CRP குஞ்சு வாங்கிய தேதியை பதிவு செய்த பிறகு அட்டவணை தெரியும்"
                  : "CRP will set your batch date to generate the schedule"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {overdue.length > 0 && (
                <>
                  <p className="text-xs font-bold text-destructive flex items-center gap-1.5 px-1">
                    <AlertTriangle size={13} /> {lang === "ta" ? "காலாவதியானவை" : "Overdue"} ({overdue.length})
                  </p>
                  {overdue.map(renderScheduleCard)}
                </>
              )}
              {upcoming.length > 0 && (
                <>
                  {overdue.length > 0 && (
                    <p className="text-xs font-bold text-primary flex items-center gap-1.5 px-1">
                      <Clock size={13} /> {lang === "ta" ? "வரவிருக்கும்" : "Upcoming"} ({upcoming.length})
                    </p>
                  )}
                  {upcoming.map(renderScheduleCard)}
                </>
              )}
              {overdue.length === 0 && upcoming.length === 0 && (
                <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
                  <CheckCircle2 size={32} className="mx-auto mb-3 text-success" />
                  <p className="text-sm text-muted-foreground">
                    {lang === "ta" ? "அனைத்தும் முடிந்தது!" : "All vaccinations completed!"}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!isLoading && activeTab === "history" && (
        <div className="flex flex-col gap-3">
          {done.map(renderScheduleCard)}
          {manualHistory.map(renderHistoryCard)}
          {done.length === 0 && manualHistory.length === 0 && (
            <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
              <Clock size={32} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {lang === "ta" ? "இன்னும் பதிவுகள் இல்லை" : "No records yet"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VaccinationHistoryTab;
