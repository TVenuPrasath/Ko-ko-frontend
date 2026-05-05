import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { Loader2, IndianRupee, ClipboardList } from "lucide-react";
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
    if (!amount || !purpose) {
      toast.error("தொகை மற்றும் நோக்கம் தேவை");
      return;
    }
    if (Number(amount) <= 0) {
      toast.error("சரியான தொகையை உள்ளிடவும்");
      return;
    }
    if (purpose === "இதர" && !notes.trim()) {
      toast.error("'இதர' தேர்வு செய்தால் காரணம் கட்டாயம் உள்ளிடவும்");
      return;
    }
    setLoading(true);
    try {
      await api.submitServiceDemand({
        type: "Loan",
        quantity: 1,
        amount: Number(amount),
        notes: `நோக்கம்: ${purpose}${notes ? ` | குறிப்பு: ${notes}` : ""}`,
      });
      toast.success("கடன் கோரிக்கை அனுப்பப்பட்டது ✅");
      setAmount("");
      setPurpose("");
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

      {/* Header */}
      <Card className="bg-primary text-primary-foreground p-4 rounded-xl">
        <div className="flex items-center gap-3">
          <IndianRupee size={24} />
          <div>
            <p className="text-base font-bold">கோழி வளர்ப்புக்கான கடன்</p>
            <p className="text-xs opacity-90">(Poultry Loan Request)</p>
          </div>
        </div>
      </Card>

      {/* Request form */}
      <Card className="p-4 bg-card flex flex-col gap-4">
        <p className="text-sm font-bold text-foreground">புதிய கடன் கோரிக்கை</p>

        {/* Amount */}
        <div>
          <Label className="text-sm font-medium mb-1 block">
            கடன் தொகை (₹) <span className="text-danger">*</span>
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="tap-target text-base pl-7"
              placeholder="5000"
            />
          </div>
        </div>

        {/* Purpose */}
        <div>
          <Label className="text-sm font-medium mb-1 block">
            கடன் நோக்கம் <span className="text-danger">*</span>
          </Label>
          <div className="flex flex-col gap-2">
            {LOAN_PURPOSES.map((p) => (
              <label
                key={p.value}
                className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                  purpose === p.value
                    ? "border-primary bg-primary/5"
                    : "border-input"
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

        {/* Additional notes */}
        <div>
          <Label className="text-sm font-medium mb-1 block">
            {purpose === "இதர" ? (
              <>காரணம் <span className="text-danger">*</span> <span className="text-xs text-danger">(கட்டாயம்)</span></>
            ) : (
              <>கூடுதல் குறிப்பு <span className="text-muted-foreground text-xs">(விருப்பத்திற்கு)</span></>
            )}
          </Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={`tap-target text-base ${
              purpose === "இதர" && !notes.trim() ? "border-danger" : ""
            }`}
            placeholder={purpose === "இதர" ? "காரணத்தை விவரமாக உள்ளிடவும்" : "எ.கா. 50 குஞ்சுகள் வாங்க திட்டமிட்டுள்ளேன்"}
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!amount || !purpose || (purpose === "இதர" && !notes.trim()) || loading}
          className="tap-target w-full text-lg font-semibold bg-primary text-primary-foreground"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "கடன் கோரிக்கை அனுப்பு"}
        </Button>
      </Card>

      {/* Past loan requests */}
      {loanRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ClipboardList size={18} className="text-primary" />
            <p className="text-base font-bold text-foreground">எனது கடன் கோரிக்கைகள்</p>
          </div>
          <div className="flex flex-col gap-3">
            {loanRequests.map((r) => {
              const config = statusConfig[r.status] ?? statusConfig.Pending;
              return (
                <Card key={r._id} className="p-4 border-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xl font-bold text-foreground">₹{r.amount?.toLocaleString("ta-IN") ?? "—"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(r.createdAt)}</p>
                    </div>
                    <Badge className={config.className}>{config.label}</Badge>
                  </div>
                  {r.notes && (
                    <p className="text-sm text-foreground bg-muted/40 px-3 py-2 rounded-md">{r.notes}</p>
                  )}
                  <p className={`text-xs mt-2 font-medium ${
                    r.status === "Completed" ? "text-success" :
                    r.status === "Rejected"  ? "text-destructive" : "text-warning"
                  }`}>{config.msg}</p>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {loanRequests.length === 0 && (
        <Card className="p-6 text-center text-muted-foreground">
          <IndianRupee size={32} className="mx-auto mb-2 opacity-30" />
          <p>இன்னும் கடன் கோரிக்கைகள் இல்லை</p>
        </Card>
      )}
    </div>
  );
};

export default LoanRequestTab;
