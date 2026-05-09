import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { Loader2, Wheat, Wrench, Syringe, ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { toast } from "sonner";

const REQUEST_TYPES = [
  { type: "Feed Stock",   icon: Wheat,   label: "தீவனம் (Feed)",          color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200" },
  { type: "Equipment",   icon: Wrench,  label: "உபகரணம் (Equipment)",    color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200" },
  { type: "Vaccination", icon: Syringe, label: "தடுப்பூசி (Vaccination)", color: "text-green-600",  bg: "bg-green-50",   border: "border-green-200" },
];

const statusConfig: Record<string, { label: string; className: string }> = {
  Pending:   { label: "🟡 நிலுவையில்",         className: "bg-warning text-warning-foreground" },
  Completed: { label: "✅ அனுமதிக்கப்பட்டது",  className: "bg-success text-success-foreground" },
  Rejected:  { label: "❌ நிராகரிக்கப்பட்டது", className: "bg-destructive text-destructive-foreground" },
};

const ServiceRequestTab = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    api.getServiceDemands()
      .then((all) => setRequests(all.filter((d: any) => ["Feed Stock", "Equipment", "Vaccination"].includes(d.type))))
      .catch(() => {});
  }, [refreshKey]);

  const handleSubmit = async () => {
    if (!selected) return;
    if (!notes.trim()) { toast.error("விளக்கம் கட்டாயம் உள்ளிடவும்"); return; }
    setLoading(true);
    try {
      await api.submitServiceDemand({ type: selected, quantity: Number(quantity) || 1, notes: notes || undefined });
      toast.success("கோரிக்கை அனுப்பப்பட்டது ✅");
      setSelected(null); setQuantity(""); setNotes("");
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #8D6E63, #A1887F)" }}>
        <div className="flex items-center gap-3">
          <ClipboardList size={22} className="text-white" />
          <div>
            <p className="text-base font-bold">சேவை கோரிக்கை</p>
            <p className="text-xs opacity-80">(Service Request to CRP)</p>
          </div>
        </div>
      </div>

      {/* Request type selection */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-4 flex flex-col gap-4">
        <p className="text-sm font-bold text-foreground">கோரிக்கை வகை தேர்வு செய்யவும்</p>
        <div className="flex flex-col gap-2.5">
          {REQUEST_TYPES.map(({ type, icon: Icon, label, color, bg, border }) => (
            <button
              key={type}
              onClick={() => setSelected(selected === type ? null : type)}
              className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all text-left ${
                selected === type ? "border-primary bg-primary/5 shadow-sm" : `border-border/60 hover:border-border`
              }`}
            >
              <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center shrink-0`}>
                <Icon size={20} className={color} />
              </div>
              <span className="text-sm font-semibold text-foreground">{label}</span>
              {selected === type && <span className="ml-auto text-primary text-lg">✓</span>}
            </button>
          ))}
        </div>

        {selected && (
          <div className="flex flex-col gap-3 pt-3 border-t border-border/40">
            {selected !== "Vaccination" && (
              <div>
                <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">அளவு (Quantity)</label>
                <Input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="1"
                  className="tap-target border-2 focus:border-primary rounded-xl"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-semibold mb-1.5 block">
                விளக்கம் <span className="text-danger">*</span>
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="உங்கள் தேவையை விளக்கவும்..."
                className={`tap-target border-2 rounded-xl ${!notes.trim() ? "border-danger/50" : "focus:border-primary"}`}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !notes.trim()}
              className="tap-target w-full font-bold rounded-xl shadow-sm disabled:opacity-40"
              style={{ background: notes.trim() ? "linear-gradient(135deg, #2E7D32, #4CAF50)" : undefined }}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "கோரிக்கை அனுப்பு →"}
            </Button>
          </div>
        )}
      </div>

      {/* Past requests */}
      {requests.length > 0 && (
        <div>
          <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3 px-1">
            <p className="text-sm font-bold text-foreground">எனது கோரிக்கைகள் ({requests.length})</p>
            {open ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </button>
          {open && (
            <div className="flex flex-col gap-3">
              {requests.map((r) => {
                const config = statusConfig[r.status] ?? statusConfig.Pending;
                const rt = REQUEST_TYPES.find((x) => x.type === r.type);
                return (
                  <div key={r._id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-4">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {rt && <rt.icon size={15} className={rt.color} />}
                        <p className="text-sm font-bold text-foreground">{rt ? rt.label : r.type}</p>
                      </div>
                      <Badge className={config.className + " text-xs"}>{config.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                    {r.notes && <p className="text-xs text-foreground mt-2 bg-muted/40 px-3 py-2 rounded-xl">{r.notes}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {requests.length === 0 && (
        <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
          <ClipboardList size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">இன்னும் கோரிக்கைகள் இல்லை</p>
          <p className="text-xs mt-1 text-muted-foreground/60">(No requests yet)</p>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestTab;
