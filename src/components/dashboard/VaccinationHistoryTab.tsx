import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CheckCircle2, Clock, AlertTriangle, Syringe, ChevronDown, ChevronUp } from "lucide-react";

function fmt(d: string | Date): string {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
}

const TYPE_LABELS: Record<string, { en: string; ta: string }> = {
  F_vaccine:    { en: "F Vaccine (Day 0)",          ta: "F தடுப்பூசி (0ஆம் நாள்)" },
  IBD:          { en: "IBD Vaccine (Day 14)",       ta: "IBD தடுப்பூசி (14ஆம் நாள்)" },
  LaSota:       { en: "LaSota Vaccine (Day 28)",    ta: "LaSota தடுப்பூசி (28ஆம் நாள்)" },
  fowl_pox:     { en: "Fowl Pox Vaccine (Day 42)",  ta: "கோழி அம்மை தடுப்பூசி (42ஆம் நாள்)" },
  deworming:    { en: "Deworming (Day 56)",          ta: "குடற்புழு நீக்கம் (56ஆம் நாள்)" },
  R2B:          { en: "R2B + Deworming (Day 70)",   ta: "R2B + புழு நீக்கம் (70ஆம் நாள்)" },
  multivitamin: { en: "Multivitamins (Day 84)",     ta: "மல்டிவைட்டமின்கள் (84ஆம் நாள்)" },
  R2B_booster:  { en: "R2B Booster + Deworming",    ta: "R2B மீண்டும் + புழு நீக்கம்" },
};

const STATUS_STYLE: Record<string, string> = {
  completed:   "text-success bg-success/10",
  scheduled:   "text-primary bg-primary/10",
  overdue:     "text-destructive bg-destructive/10",
  missed:      "text-amber-700 bg-amber-100",
  rescheduled: "text-warning bg-warning/10",
};

interface BatchSectionProps {
  batch: any;
  lang: string;
}

const BatchSection = ({ batch, lang }: BatchSectionProps) => {
  const [expanded, setExpanded] = useState(true);
  const schedule: any[] = batch.schedule ?? [];
  const upcoming = schedule.filter((e) => e.status === "scheduled" || e.status === "rescheduled" || e.status === "overdue");
  const done     = schedule.filter((e) => e.status === "completed" || e.status === "missed");

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div>
          <p className="text-sm font-bold text-foreground">{batch.batchName}</p>
          <p className="text-xs text-muted-foreground">
            {batch.numberOfChicks} {lang === "ta" ? "குஞ்சுகள்" : "chicks"} •{" "}
            {lang === "ta" ? "குஞ்சு தேதி" : "Batch date"}: {fmt(batch.batchDate)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {upcoming.filter((e) => e.status === "overdue").length > 0 && (
            <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-lg">
              {upcoming.filter((e) => e.status === "overdue").length} {lang === "ta" ? "காலாவதி" : "overdue"}
            </span>
          )}
          {expanded ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 px-4 py-3 flex flex-col gap-2">
          {upcoming.length === 0 && done.length > 0 && (
            <div className="flex items-center gap-2 py-2">
              <CheckCircle2 size={16} className="text-success" />
              <p className="text-xs font-semibold text-success">
                {lang === "ta" ? "அனைத்தும் முடிந்தது!" : "All vaccinations completed!"}
              </p>
            </div>
          )}

          {upcoming.map((e) => {
            const label = TYPE_LABELS[e.type]?.[lang as "en" | "ta"] ?? e.label ?? e.type;
            const isR2B = e.type === "R2B" || e.type === "R2B_booster";
            return (
              <div key={e.type + e.scheduledDate} className="flex items-start gap-3 py-2 border-b border-border/20 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Syringe size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar size={10} />
                    {e.status === "rescheduled" && e.rescheduledDate
                      ? `${lang === "ta" ? "மாற்றப்பட்டது" : "Rescheduled"}: ${fmt(e.rescheduledDate)}`
                      : fmt(e.scheduledDate)}
                  </p>
                  {isR2B && (
                    <p className="text-xs text-warning mt-0.5">
                      ⚠️ {lang === "ta" ? "முதலில் புழு நீக்கம், பிறகு R2B" : "Deworm 2 days before R2B"}
                    </p>
                  )}
                  {e.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{e.notes}"</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg shrink-0 mt-1 ${STATUS_STYLE[e.status] ?? ""}`}>
                  {e.status === "overdue" && <AlertTriangle size={10} className="inline mr-0.5" />}
                  {e.status === "scheduled" && <Clock size={10} className="inline mr-0.5" />}
                  {e.status === "missed" ? "skipped" : e.status}
                </span>
              </div>
            );
          })}

          {done.length > 0 && (
            <details className="mt-1">
              <summary className="text-xs text-muted-foreground cursor-pointer">
                {lang === "ta" ? "முடிந்தவை" : "Completed"} ({done.length})
              </summary>
              <div className="flex flex-col gap-1 mt-2">
                {done.map((e) => {
                  const label = TYPE_LABELS[e.type]?.[lang as "en" | "ta"] ?? e.label ?? e.type;
                  const skipped = e.status === "missed" || (e.notes && String(e.notes).toLowerCase().includes("skipped"));
                  return (
                    <div key={e.type + e.scheduledDate} className="flex items-center justify-between py-1">
                      <p className="text-xs text-muted-foreground">
                        {label} {skipped ? `(${lang === "ta" ? "தவறிவிட்டது" : "skipped"})` : ""}
                      </p>
                      <span className="text-xs font-bold text-success flex items-center gap-1">
                        <CheckCircle2 size={11} /> {e.completedDate ? fmt(e.completedDate) : fmt(e.scheduledDate)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
};

const VaccinationHistoryTab = () => {
  const { lang } = useLanguage();

  const { data: batches = [], isLoading } = useQuery({
    queryKey: ["mySchedule"],
    queryFn: () => api.getMySchedule().catch(() => []),
    staleTime: 60_000,
  });

  const batchList = batches as any[];

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #2E7D32, #4CAF50)" }}>
        <div className="flex items-center gap-3">
          <Syringe size={22} className="text-white" />
          <div>
            <p className="text-base font-bold">
              {lang === "ta" ? "தடுப்பூசி அட்டவணை" : "Vaccination Schedule"}
            </p>
            <p className="text-xs opacity-80">
              {batchList.length > 0
                ? `${batchList.length} ${lang === "ta" ? "தொகுதிகள்" : "active batches"}`
                : lang === "ta" ? "CRP தொகுதி சேர்க்கும் வரை காத்திருக்கவும்" : "Waiting for CRP to add a batch"}
            </p>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((i) => <div key={i} className="bg-white rounded-2xl border border-border/60 p-4 h-24 animate-pulse" />)}
        </div>
      )}

      {!isLoading && batchList.length === 0 && (
        <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
          <Syringe size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {lang === "ta"
              ? "CRP உங்கள் குஞ்சு தொகுதியை சேர்த்த பிறகு அட்டவணை தெரியும்"
              : "CRP will add your chick batch to generate the schedule"}
          </p>
        </div>
      )}

      {!isLoading && batchList.map((batch: any) => (
        <BatchSection key={batch.batchId} batch={batch} lang={lang} />
      ))}
    </div>
  );
};

export default VaccinationHistoryTab;
