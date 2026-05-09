import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { Loader2, IndianRupee, ClipboardList, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const LOAN_PURPOSES = [
  { value: "குஞ்சுகள் வாங்க", label: "குஞ்சுகள் வாங்க (Buy Chicks)" },
  { value: "தீவனம் வாங்க", label: "தீவனம் வாங்க (Buy Feed)" },
  { value: "கூண்டு / உபகரணம்", label: "கூண்டு / உபகரணம் (Cage / Equipment)" },
  { value: "கொட்டகை கட்ட", label: "கொட்டகை கட்ட (Build Shed)" },
  { value: "மருந்து / தடுப்பூசி", label: "மருந்து / தடுப்பூசி (Medicine / Vaccine)" },
  { value: "இதர", label: "இதர (Other)" },
];

const statusConfig: Record<string, { label: string; className: string; msg: string }> = {
  Pending:   { label: "🟡 நிலுவையில்",         className: "bg-warning text-warning-foreground",  msg: "உங்கள் கோரிக்கை CRP-இடம் உள்ளது. விரைவில் பதில் வரும்." },
  Completed: { label: "✅ அனுமதிக்கப்பட்டது",  className: "bg-success text-success-foreground",  msg: "உங்கள் கடன் கோரிக்கை CRP-ஆல் அனுமதிக்கப்பட்டது!" },
  Rejected:  { label: "❌ நிராகரிக்கப்பட்டது", className: "bg-destructive text-destructive-foreground", msg: "உங்கள் கடன் கோரிக்கை நிராகரிக்கப்பட்டது. CRP-ஐ தொடர்பு கொள்ளவும்." },
};

const LoanHistorySection = ({ loanRequests }: { loanRequests: any[] }) => {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full mb-3 px-1">
        <div className="flex items-center gap-2">
          <ClipboardList size={16} className="text-primary" />
          <p className="text-sm font-bold text-foreground">எனது கடன் கோரிக்கைகள் ({loanRequests.length})</p>
        </div>
        {open ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
      </button>
      {open && (
        <div className="flex flex-col gap-3">
          {loanRequests.map((r) => {
            const config = statusConfig[r.status] ?? statusConfig.Pending;
            return (
              <div key={r._id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold text-foreground">₹{r.amount?.toLocaleString("ta-IN") ?? "—"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.createdAt)}</p>
                  </div>
                  <Badge className={config.className + " text-xs"}>{config.label}</Badge>
                </div>
                {r.notes && (
                  <p className="text-sm text-foreground bg-muted/40 px-3 py-2 rounded-xl">{r.notes}</p>
                )}
                <p className={`text-xs mt-2 font-semibold ${
                  r.status === "Completed" ? "text-success" :
                  r.status === "Rejected"  ? "text-destructive" : "text-warning"
                }`}>{config.msg}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const LoanRequestTab = () => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loanRequests, setLoanRequests] = useState<any[]>([]);

  useEffect(() => {
    api.getServiceDemands()
      .then((all) => setLoanRequests(all.filter((d: any) => d.type === "Loan")))
      .catch(() => {});
  }, [refreshKey]);

  const handleSubmit = async () => {
    if (!amount || !purpose) { toast.error("தொகை மற்றும் நோக்கம் தேவை"); return; }
    if (Number(amount) <= 0) { toast.error("சரியான தொகையை உள்ளிடவும்"); return; }
    if (purpose === "இதர" && !notes.trim()) { toast.error("'இதர' தேர்வு செய்தால் காரணம் கட்டாயம் உள்ளிடவும்"); return; }
    setLoading(true);
    try {
      await api.submitServiceDemand({
        type: "Loan", quantity: 1, amount: Number(amount),
        notes: `நோக்கம்: ${purpose}${notes ? ` | குறிப்பு: ${notes}` : ""}`,
      });
      toast.success("கடன் கோரிக்கை அனுப்பப்பட்டது ✅");
      setAmount(""); setPurpose(""); setNotes("");
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
      <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #F9A825, #FFB300)" }}>
        <div className="flex items-center gap-3">
          <IndianRupee size={22} className="text-white" />
          <div>
            <p className="text-base font-bold">கோழி வளர்ப்புக்கான கடன்</p>
            <p className="text-xs opacity-80">(Poultry Loan Request)</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-4 flex flex-col gap-4">
        <p className="text-sm font-bold text-foreground">புதிய கடன் கோரிக்கை</p>

        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
            கடன் தொகை (₹) <span className="text-danger">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-base">₹</span>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="tap-target text-base pl-8 border-2 focus:border-primary rounded-xl font-semibold"
              placeholder="5000"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-2 block">
            கடன் நோக்கம் <span className="text-danger">*</span>
          </Label>
          <div className="flex flex-col gap-2">
            {LOAN_PURPOSES.map((p) => (
              <label
                key={p.value}
                className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                  purpose === p.value ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-border"
                }`}
              >
                <input
                  type="radio"
                  name="purpose"
                  value={p.value}
                  checked={purpose === p.value}
                  onChange={() => setPurpose(p.value)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
            {purpose === "இதர" ? (
              <>காரணம் <span className="text-danger">*</span> <span className="text-xs text-danger">(கட்டாயம்)</span></>
            ) : (
              <>கூடுதல் குறிப்பு <span className="text-muted-foreground/60">(விருப்பத்திற்கு)</span></>
            )}
          </Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`tap-target text-base border-2 rounded-xl ${
              purpose === "இதர" && !notes.trim() ? "border-danger/60" : "focus:border-primary"
            }`}
            placeholder={purpose === "இதர" ? "காரணத்தை விவரமாக உள்ளிடவும்" : "எ.கா. 50 குஞ்சுகள் வாங்க திட்டமிட்டுள்ளேன்"}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!amount || !purpose || (purpose === "இதர" && !notes.trim()) || loading}
          className="tap-target w-full text-base font-bold rounded-xl shadow-sm disabled:opacity-40"
          style={{ background: (amount && purpose) ? "linear-gradient(135deg, #F9A825, #FFB300)" : undefined, color: (amount && purpose) ? "#1a1a1a" : undefined }}
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "கடன் கோரிக்கை அனுப்பு →"}
        </Button>
      </div>

      {loanRequests.length > 0 && <LoanHistorySection loanRequests={loanRequests} />}

      {loanRequests.length === 0 && (
        <div className="bg-white rounded-2xl border border-border/60 p-8 text-center">
          <IndianRupee size={32} className="mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">இன்னும் கடன் கோரிக்கைகள் இல்லை</p>
        </div>
      )}
    </div>
  );
};

export default LoanRequestTab;
