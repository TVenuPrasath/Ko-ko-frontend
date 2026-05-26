import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Syringe, Calendar, CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function fmt(d: string | Date): string {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
}

const TYPE_LABELS: Record<string, string> = {
  F_vaccine:    "F Vaccine (Day 14)",
  IBD:          "IBD Vaccine (Day 28)",
  LaSota:       "LaSota Vaccine (Day 42)",
  fowl_pox:     "Fowl Pox Vaccine (Day 56)",
  deworming:    "Deworming (Day 70)",
  R2B:          "R2B + Deworming (Day 84)",
  R2B_booster:  "R2B Booster + Deworming",
};

const STATUS_STYLE: Record<string, string> = {
  completed: "text-success bg-success/10",
  upcoming:  "text-primary bg-primary/10",
  overdue:   "text-destructive bg-destructive/10",
  scheduled: "text-warning bg-warning/10",
};

interface FarmerRowProps {
  farmer: any;
}

const FarmerScheduleRow = ({ farmer }: FarmerRowProps) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [batchInput, setBatchInput] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["farmerSchedule", farmer._id],
    queryFn: () => api.getFarmerSchedule(farmer._id).catch(() => ({ batchDate: null, schedule: [] })),
    enabled: expanded,
    staleTime: 60_000,
  });

  const schedule: any[] = data?.schedule ?? [];
  const batchDate: string | null = data?.batchDate ?? null;

  const overdue  = schedule.filter((e) => e.status === "overdue");
  const upcoming = schedule.filter((e) => e.status === "upcoming" || e.status === "scheduled");
  const done     = schedule.filter((e) => e.status === "completed");

  const handleSetBatch = async () => {
    if (!batchInput) return;
    setSaving(true);
    try {
      await api.setBatchDate({ userId: farmer._id, batchDate: batchInput });
      toast.success(`✅ Schedule generated for ${farmer.name}`);
      refetch();
      setBatchInput("");
    } catch (err: any) {
      if (err?.status === 404 || err?.message?.includes("404")) {
        toast.error("⚠️ Server not updated yet — redeploy backend first");
      } else {
        toast.error(err?.message || "Failed to set batch date");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async (vaccinationId: string, label: string) => {
    try {
      await api.completeVaccination(vaccinationId);
      toast.success(`✅ ${label} marked as completed`);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["allVaccinations"] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    }
  };

  const nextEvent = upcoming[0] ?? overdue[0] ?? null;

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Syringe size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{farmer.name}</p>
            <p className="text-xs text-muted-foreground">{farmer.hamlet} • {farmer.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {overdue.length > 0 && (
            <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-lg">
              {overdue.length} overdue
            </span>
          )}
          {nextEvent && overdue.length === 0 && (
            <span className="text-xs text-muted-foreground">{fmt(nextEvent.scheduledDate)}</span>
          )}
          {!batchDate && !expanded && (
            <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-lg">No batch</span>
          )}
          {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 p-4 flex flex-col gap-4">
          {/* Set batch date */}
          <div className="bg-muted/30 rounded-xl p-3 flex flex-col gap-2">
            <p className="text-xs font-bold text-foreground">
              {batchDate ? `Batch date: ${fmt(batchDate)} — Update:` : "Set chick batch date:"}
            </p>
            <div className="flex gap-2">
              <Input
                type="date"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                className="flex-1 text-sm"
              />
              <Button size="sm" onClick={handleSetBatch} disabled={!batchInput || saving} className="shrink-0">
                {saving ? "..." : batchDate ? "Update" : "Generate"}
              </Button>
            </div>
          </div>

          {isLoading && (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => <div key={i} className="h-12 bg-muted/40 rounded-xl animate-pulse" />)}
            </div>
          )}

          {!isLoading && !batchDate && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Set a batch date above to generate the vaccination schedule.
            </p>
          )}

          {!isLoading && batchDate && (
            <div className="flex flex-col gap-2">
              {overdue.length > 0 && (
                <p className="text-xs font-bold text-destructive flex items-center gap-1">
                  <AlertTriangle size={12} /> Overdue ({overdue.length})
                </p>
              )}
              {[...overdue, ...upcoming].map((e) => (
                <div key={e.type + e.scheduledDate} className="flex items-center justify-between gap-2 py-2 border-b border-border/30 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{TYPE_LABELS[e.type] ?? e.label}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar size={10} /> {fmt(e.scheduledDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${STATUS_STYLE[e.status] ?? ""}`}>
                      {e.status}
                    </span>
                    {e._id && e.status !== "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 border-success text-success"
                        onClick={() => handleComplete(e._id, TYPE_LABELS[e.type] ?? e.label)}
                      >
                        <CheckCircle2 size={12} className="mr-1" /> Done
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {done.length > 0 && (
                <details className="mt-1">
                  <summary className="text-xs text-muted-foreground cursor-pointer">
                    Completed ({done.length})
                  </summary>
                  <div className="flex flex-col gap-1 mt-2">
                    {done.map((e) => (
                      <div key={e.type + e.scheduledDate} className="flex items-center justify-between py-1">
                        <p className="text-xs text-muted-foreground">{TYPE_LABELS[e.type] ?? e.label}</p>
                        <span className="text-xs font-bold text-success flex items-center gap-1">
                          <CheckCircle2 size={11} /> {fmt(e.scheduledDate)}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CrpVaccinationScheduleTab = () => {
  const [search, setSearch] = useState("");

  const { data: farmers = [], isLoading } = useQuery({
    queryKey: ["crpFarmers"],
    queryFn: () => api.getFarmers(),
    staleTime: 60_000,
  });

  const filtered = (farmers as any[]).filter((f) =>
    !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.phone.includes(search)
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #2E7D32, #4CAF50)" }}>
        <div className="flex items-center gap-3">
          <Syringe size={22} className="text-white" />
          <div>
            <p className="text-base font-bold">Vaccination Schedule</p>
            <p className="text-xs opacity-80">Set batch dates & track all farmers</p>
          </div>
        </div>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search farmers..."
        className="w-full border border-input rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-white rounded-2xl border border-border/60 animate-pulse" />)}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
          <p className="text-sm text-muted-foreground">No farmers found</p>
        </div>
      )}

      {!isLoading && (
        <div className="flex flex-col gap-3">
          {filtered.map((f: any) => (
            <FarmerScheduleRow key={f._id} farmer={f} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CrpVaccinationScheduleTab;
