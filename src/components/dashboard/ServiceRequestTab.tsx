import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { Loader2, Wheat, Wrench, Syringe } from "lucide-react";
import { toast } from "sonner";

const REQUEST_TYPES = [
  { type: "Feed Stock",  icon: Wheat,   label: "தீவனம் (Feed)",         color: "bg-orange-100 text-orange-700 border-orange-300" },
  { type: "Equipment",  icon: Wrench,   label: "உபகரணம் (Equipment)",   color: "bg-blue-100 text-blue-700 border-blue-300" },
  { type: "Vaccination",icon: Syringe,  label: "தடுப்பூசி (Vaccination)", color: "bg-green-100 text-green-700 border-green-300" },
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

  useEffect(() => {
    api.getServiceDemands()
      .then((all) => setRequests(all.filter((d: any) => ["Feed Stock", "Equipment", "Vaccination"].includes(d.type))))
      .catch(() => {});
  }, [refreshKey]);

  const handleSubmit = async () => {
    if (!selected) return;
    if (!notes.trim()) {
      toast.error("விளக்கம் கட்டாயம் உள்ளிடவும்");
      return;
    }
    setLoading(true);
    try {
      await api.submitServiceDemand({
        type: selected,
        quantity: Number(quantity) || 1,
        notes: notes || undefined,
      });
      toast.success("கோரிக்கை அனுப்பப்பட்டது ✅");
      setSelected(null);
      setQuantity("");
      setNotes("");
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="bg-primary text-primary-foreground p-4 rounded-xl">
        <p className="text-base font-bold">சேவை கோரிக்கை</p>
        <p className="text-xs opacity-90">(Service Request to CRP)</p>
      </Card>

      {/* Request type buttons */}
      <Card className="p-4 flex flex-col gap-4">
        <p className="text-sm font-bold text-foreground">கோரிக்கை வகை தேர்வு செய்யவும்</p>
        <div className="flex flex-col gap-3">
          {REQUEST_TYPES.map(({ type, icon: Icon, label, color }) => (
            <button
              key={type}
              onClick={() => setSelected(selected === type ? null : type)}
              className={`flex items-center gap-3 p-4 border-2 rounded-xl transition-all text-left ${
                selected === type ? "border-primary bg-primary/5" : "border-input"
              }`}
            >
              <span className={`p-2 rounded-lg border ${color}`}>
                <Icon size={20} />
              </span>
              <span className="text-sm font-medium text-foreground">{label}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="flex flex-col gap-3 pt-2 border-t border-border">
            {selected !== "Vaccination" && (
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">அளவு (Quantity)</label>
                <Input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="1"
                  className="tap-target"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium mb-1 block">
                விளக்கம் <span className="text-danger">*</span>
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="உங்கள் தேவையை விளக்கவும்..."
                className={`tap-target ${!notes.trim() ? "border-danger" : ""}`}
              />
            </div>
            <Button
              onClick={handleSubmit}
              disabled={loading || !notes.trim()}
              className="tap-target w-full bg-primary text-primary-foreground font-semibold"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "கோரிக்கை அனுப்பு →"}
            </Button>
          </div>
        )}
      </Card>

      {/* Past requests */}
      {requests.length > 0 && (
        <div>
          <p className="text-base font-bold text-foreground mb-3">எனது கோரிக்கைகள்</p>
          <div className="flex flex-col gap-3">
            {requests.map((r) => {
              const config = statusConfig[r.status] ?? statusConfig.Pending;
              const rt = REQUEST_TYPES.find((x) => x.type === r.type);
              return (
                <Card key={r._id} className="p-4 border-2">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {rt && <rt.icon size={16} className="text-muted-foreground" />}
                      <p className="text-sm font-bold text-foreground">{rt ? rt.label : r.type}</p>
                    </div>
                    <Badge className={config.className}>{config.label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                  {r.notes && <p className="text-xs text-foreground mt-1 bg-muted/40 px-2 py-1 rounded">{r.notes}</p>}
                </Card>
              );
            })}
          </div>
        </div>
      )}
      {requests.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          <p className="text-sm">இன்னும் கோரிக்கைகள் இல்லை</p>
          <p className="text-xs mt-1 opacity-60">(No requests yet)</p>
        </Card>
      )}
    </div>
  );
};

export default ServiceRequestTab;
