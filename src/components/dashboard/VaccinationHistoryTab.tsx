import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Calendar, CheckCircle2, Clock, AlertTriangle, Syringe } from "lucide-react";

function formatTamilDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function isOverdue(dateStr: string): boolean {
  return !!dateStr && new Date(dateStr) < new Date();
}

const typeLabel: Record<string, string> = {
  white_diarrhea: "வெள்ளை கழிச்சல் தடுப்பூசி",
  smallpox: "அம்மை தடுப்பூசி",
  deworming: "குடற்புழு நீக்கம்",
};

const VaccinationHistoryTab = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"completed" | "upcoming">("completed");

  useEffect(() => {
    api.getVaccinations().then(setRecords).catch(() => {});
  }, []);

  const today = new Date();
  const completed = records.filter((r) => r.status === "completed");
  const upcoming = records.filter((r) => r.nextDueDate && new Date(r.nextDueDate) >= today)
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  const overdue = records.filter((r) => r.nextDueDate && new Date(r.nextDueDate) < today);

  const renderCard = (r: any) => (
    <div key={r._id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Syringe size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-base font-bold text-foreground">{typeLabel[r.type] || r.type}</p>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <Calendar size={11} /> தேதி: {formatTamilDate(r.dateGiven)}
          </p>
          {r.ageGroup && <p className="text-xs text-muted-foreground">வயது: {r.ageGroup}</p>}
          <div className="flex items-center gap-2 mt-2">
            {r.status === "completed" ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2.5 py-1 rounded-lg">
                <CheckCircle2 size={13} /> நிறைவேற்றப்பட்டது
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 px-2.5 py-1 rounded-lg">
                <Clock size={13} /> நிலுவையில் உள்ளது
              </span>
            )}
          </div>
          {r.nextDueDate && (
            <p className="text-xs mt-2 flex items-center gap-1">
              {isOverdue(r.nextDueDate) && <AlertTriangle size={13} className="text-danger" />}
              <span className="text-muted-foreground">அடுத்த தேதி:</span>{" "}
              <span className={`font-semibold ${isOverdue(r.nextDueDate) ? "text-danger" : "text-foreground"}`}>
                {formatTamilDate(r.nextDueDate)}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #2E7D32, #4CAF50)" }}>
        <div className="flex items-center gap-3">
          <Syringe size={22} className="text-white" />
          <div>
            <p className="text-base font-bold">தடுப்பூசி வரலாறு</p>
            <p className="text-xs opacity-80">(Vaccination & Deworming History)</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-muted/40 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "completed"
              ? "bg-white text-primary shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          முடிந்தவை ({completed.length})
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "upcoming"
              ? "bg-white text-warning shadow-sm"
              : "text-muted-foreground"
          }`}
        >
          வரவிருக்கும் ({upcoming.length})
        </button>
      </div>

      {activeTab === "completed" && (
        completed.length === 0
          ? (
            <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
              <Syringe size={32} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">இன்னும் பதிவுகள் இல்லை. CRP தடுப்பூசி பதிவு செய்த பிறகு இங்கே தெரியும்.</p>
            </div>
          )
          : <div className="flex flex-col gap-3">{completed.map(renderCard)}</div>
      )}

      {activeTab === "upcoming" && (
        upcoming.length === 0 && overdue.length === 0
          ? (
            <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
              <Clock size={32} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">வரவிருக்கும் தேதிகள் இல்லை.</p>
            </div>
          )
          : (
            <>
              {overdue.length > 0 && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-bold text-danger flex items-center gap-1.5 px-1">
                    <AlertTriangle size={13} /> காலாவதியானவை ({overdue.length})
                  </p>
                  {overdue.map(renderCard)}
                </div>
              )}
              {upcoming.length > 0 && (
                <div className="flex flex-col gap-3">
                  {overdue.length > 0 && (
                    <p className="text-xs font-bold text-primary flex items-center gap-1.5 px-1">
                      <Clock size={13} /> வரவிருக்கும் ({upcoming.length})
                    </p>
                  )}
                  {upcoming.map(renderCard)}
                </div>
              )}
            </>
          )
      )}
    </div>
  );
};

export default VaccinationHistoryTab;
