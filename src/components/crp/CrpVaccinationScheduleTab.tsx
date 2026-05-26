import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import {
  Syringe, Calendar, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp, Plus, XCircle, RefreshCw, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function fmt(d: string | Date): string {
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}/${dt.getFullYear()}`;
}

const TYPE_LABELS: Record<string, string> = {
  F_vaccine:   "F Vaccine (Day 14)",
  IBD:         "IBD Vaccine (Day 28)",
  LaSota:      "LaSota Vaccine (Day 42)",
  fowl_pox:    "Fowl Pox Vaccine (Day 56)",
  deworming:   "Deworming (Day 70)",
  R2B:         "R2B + Deworming (Day 84)",
  R2B_booster: "R2B Booster + Deworming",
};

const STATUS_STYLE: Record<string, string> = {
  completed:   "text-success bg-success/10",
  scheduled:   "text-primary bg-primary/10",
  overdue:     "text-destructive bg-destructive/10",
  missed:      "text-danger bg-danger/10",
  rescheduled: "text-warning bg-warning/10",
};

// ── Action modal ──────────────────────────────────────────────────────────────
interface ActionModalProps {
  event: any;
  onClose: () => void;
  onDone: () => void;
}

const ActionModal = ({ event, onClose, onDone }: ActionModalProps) => {
  const [action, setAction] = useState<"complete" | "missed" | "reschedule" | null>(null);
  const [notes, setNotes] = useState("");
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [loading, setLoading] = useState(false);

  const label = TYPE_LABELS[event.type] ?? event.label;

  const handleSubmit = async () => {
    if (!action) return;
    setLoading(true);
    try {
      if (action === "complete") {
        await api.completeVaccination(event._id, notes);
        toast.success(`✅ ${label} marked as completed`);
      } else if (action === "missed") {
        await api.missVaccination(event._id, notes);
        toast.success(`⚠️ ${label} marked as missed`);
      } else if (action === "reschedule") {
        if (!rescheduleDate) { toast.error("Select a new date"); setLoading(false); return; }
        await api.rescheduleVaccination(event._id, rescheduleDate, notes);
        toast.success(`📅 ${label} rescheduled to ${fmt(rescheduleDate)}`);
      }
      onDone();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-foreground">{label}</p>
          <button onClick={onClose} className="text-muted-foreground"><XCircle size={20} /></button>
        </div>
        <p className="text-xs text-muted-foreground">Scheduled: {fmt(event.scheduledDate)}</p>

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          {(["complete", "missed", "reschedule"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAction(a)}
              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                action === a
                  ? a === "complete" ? "bg-success text-white border-success"
                    : a === "missed" ? "bg-danger text-white border-danger"
                    : "bg-warning text-white border-warning"
                  : "border-border text-muted-foreground"
              }`}
            >
              {a === "complete" ? "✅ Done" : a === "missed" ? "❌ Missed" : "📅 Reschedule"}
            </button>
          ))}
        </div>

        {action === "reschedule" && (
          <Input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="text-sm" />
        )}

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes / Remarks (optional)"
          rows={2}
          className="w-full border border-input rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={!action || loading} onClick={handleSubmit}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Batch card ────────────────────────────────────────────────────────────────
interface BatchCardProps {
  batch: any;
  onRefetch: () => void;
}

const BatchCard = ({ batch, onRefetch }: BatchCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [actionEvent, setActionEvent] = useState<any | null>(null);

  const schedule: any[] = batch.schedule ?? [];
  const overdue   = schedule.filter((e) => e.status === "overdue" || e.status === "missed");
  const upcoming  = schedule.filter((e) => e.status === "scheduled" || e.status === "rescheduled");
  const done      = schedule.filter((e) => e.status === "completed");

  return (
    <>
      {actionEvent && (
        <ActionModal
          event={actionEvent}
          onClose={() => setActionEvent(null)}
          onDone={onRefetch}
        />
      )}

      <div className="bg-muted/30 rounded-xl border border-border/40 overflow-hidden">
        <button
          onClick={() => setExpanded((p) => !p)}
          className="w-full flex items-center justify-between px-4 py-3 text-left"
        >
          <div>
            <p className="text-sm font-bold text-foreground">{batch.batchName}</p>
            <p className="text-xs text-muted-foreground">
              {batch.numberOfChicks} chicks • Batch date: {fmt(batch.batchDate)}
              {batch.batchStatus === "inactive" && <span className="ml-2 text-danger font-semibold">• Inactive</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {overdue.length > 0 && (
              <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-lg">
                {overdue.length} overdue
              </span>
            )}
            {expanded ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
          </div>
        </button>

        {expanded && (
          <div className="border-t border-border/40 px-4 py-3 flex flex-col gap-2">
            {[...overdue, ...upcoming].length === 0 && done.length > 0 && (
              <p className="text-xs text-success font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> All vaccinations completed
              </p>
            )}

            {[...overdue, ...upcoming].map((e) => (
              <div key={e.type + e.scheduledDate} className="flex items-center justify-between gap-2 py-2 border-b border-border/20 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{TYPE_LABELS[e.type] ?? e.label}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={10} />
                    {e.status === "rescheduled" && e.rescheduledDate
                      ? `Rescheduled: ${fmt(e.rescheduledDate)}`
                      : fmt(e.scheduledDate)}
                  </p>
                  {e.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{e.notes}"</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${STATUS_STYLE[e.status] ?? ""}`}>
                    {e.status}
                  </span>
                  {e._id && (
                    <button
                      onClick={() => setActionEvent(e)}
                      className="text-xs font-semibold px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20"
                    >
                      <FileText size={12} />
                    </button>
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
                        <CheckCircle2 size={11} /> {e.completedDate ? fmt(e.completedDate) : fmt(e.scheduledDate)}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// ── Farmer row ────────────────────────────────────────────────────────────────
interface FarmerRowProps { farmer: any }

const FarmerScheduleRow = ({ farmer }: FarmerRowProps) => {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [batchName, setBatchName] = useState("");
  const [numChicks, setNumChicks] = useState("");
  const [batchDate, setBatchDate] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: batches = [], isLoading, refetch } = useQuery({
    queryKey: ["farmerSchedule", farmer._id],
    queryFn: () => api.getFarmerSchedule(farmer._id).catch(() => []),
    enabled: expanded,
    staleTime: 60_000,
  });

  const totalOverdue = (batches as any[]).reduce((sum, b) =>
    sum + (b.schedule ?? []).filter((e: any) => e.status === "overdue" || e.status === "missed").length, 0);

  const handleAddBatch = async () => {
    if (!batchName || !batchDate) { toast.error("Batch name and date required"); return; }
    setSaving(true);
    try {
      await api.createBatch({ userId: farmer._id, batchName, numberOfChicks: parseInt(numChicks) || 0, batchDate });
      toast.success(`✅ Batch "${batchName}" created`);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["allBatches"] });
      setBatchName(""); setNumChicks(""); setBatchDate("");
      setShowAddBatch(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to create batch");
    } finally {
      setSaving(false);
    }
  };

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
          {totalOverdue > 0 && (
            <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-lg">
              {totalOverdue} overdue
            </span>
          )}
          {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border/60 p-4 flex flex-col gap-3">

          {/* Add batch form */}
          {showAddBatch ? (
            <div className="bg-muted/30 rounded-xl p-3 flex flex-col gap-2">
              <p className="text-xs font-bold text-foreground">New Batch</p>
              <Input placeholder="Batch name (e.g. Batch 1)" value={batchName} onChange={(e) => setBatchName(e.target.value)} className="text-sm" />
              <Input placeholder="Number of chicks" type="number" value={numChicks} onChange={(e) => setNumChicks(e.target.value)} className="text-sm" />
              <Input type="date" value={batchDate} onChange={(e) => setBatchDate(e.target.value)} className="text-sm" />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowAddBatch(false)}>Cancel</Button>
                <Button size="sm" className="flex-1" disabled={saving} onClick={handleAddBatch}>
                  {saving ? "..." : "Create & Generate Schedule"}
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddBatch(true)}
              className="flex items-center gap-2 text-xs font-semibold text-primary border border-primary/30 rounded-xl px-3 py-2 hover:bg-primary/5"
            >
              <Plus size={14} /> Add New Batch
            </button>
          )}

          {isLoading && (
            <div className="flex flex-col gap-2">
              {[1, 2].map((i) => <div key={i} className="h-12 bg-muted/40 rounded-xl animate-pulse" />)}
            </div>
          )}

          {!isLoading && (batches as any[]).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">No batches yet. Add one above.</p>
          )}

          {!isLoading && (batches as any[]).map((batch: any) => (
            <BatchCard key={batch.batchId} batch={batch} onRefetch={refetch} />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main tab ──────────────────────────────────────────────────────────────────
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
            <p className="text-xs opacity-80">Manage batches & track all farmers</p>
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
