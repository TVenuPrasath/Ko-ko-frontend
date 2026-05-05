import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HAMLETS } from "@/lib/auth";
import { getMockFarmers } from "@/lib/crpMockData";
import { formatDate } from "@/lib/mockData";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, IndianRupee } from "lucide-react";

const CrpServicesTab = () => {
  const { t } = useLanguage();
  const farmers = getMockFarmers();

  // Vaccination form
  const [vaxHamlet, setVaxHamlet] = useState("");
  const [vaxFarmer, setVaxFarmer] = useState("");
  const [vaccineType, setVaccineType] = useState("Newcastle (R2B)");
  const [vaxDate, setVaxDate] = useState(new Date().toISOString().split("T")[0]);
  const [vaxNextDue, setVaxNextDue] = useState("");
  const [vaxLoading, setVaxLoading] = useState(false);

  // Deworming form
  const [dewHamlet, setDewHamlet] = useState("");
  const [dewFarmer, setDewFarmer] = useState("");
  const [dewDate, setDewDate] = useState(new Date().toISOString().split("T")[0]);
  const [dewNextDue, setDewNextDue] = useState("");
  const [dewLoading, setDewLoading] = useState(false);

  const vaxFarmers = vaxHamlet ? farmers.filter((f) => f.hamlet === vaxHamlet) : farmers;
  const dewFarmers = dewHamlet ? farmers.filter((f) => f.hamlet === dewHamlet) : farmers;

  const handleVaxSave = async () => {
    setVaxLoading(true);
    await api.addVaccination({
      userId: vaxFarmer,
      type: vaccineType.toLowerCase().includes("smallpox") ? "smallpox" : "white_diarrhea",
      ageGroup: vaccineType,
      dateGiven: vaxDate,
      nextDueDate: vaxNextDue,
      status: "completed",
    });
    setVaxLoading(false);
    toast.success(t("saved") + " ✅ தடுப்பூசி பதிவு சேமிக்கப்பட்டது");
    setVaxFarmer("");
    setVaxNextDue("");
  };

  const handleDewSave = async () => {
    setDewLoading(true);
    await api.addVaccination({
      userId: dewFarmer,
      type: "deworming",
      dateGiven: dewDate,
      nextDueDate: dewNextDue,
      status: "completed",
    });
    setDewLoading(false);
    toast.success(t("saved") + " ✅ குடற்புழு நீக்கம் பதிவு சேமிக்கப்பட்டது");
    setDewFarmer("");
    setDewNextDue("");
  };

  const [allDemands, setAllDemands] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    api.getAllServiceDemands().then(setAllDemands).catch(() => {});
  }, [refresh]);

  const pendingDemands = allDemands.filter((d) => d.status === "Pending" && ["Feed Stock", "Equipment", "Vaccination"].includes(d.type));
  const loanDemands = allDemands.filter((d) => d.type === "Loan");

  const handleApprove = async (id: string) => {
    try {
      await api.completeServiceDemand(id);
      setRefresh((k) => k + 1);
      toast.success("அனுமதிக்கப்பட்டது ✅");
    } catch { toast.error("Failed"); }
  };

  const handleReject = async (id: string) => {
    try {
      await api.rejectServiceDemand(id);
      setRefresh((k) => k + 1);
      toast.success("நிராகரிக்கப்பட்டது ❌");
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Mark Vaccination */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("markVaccination")}</h2>
        <div className="flex flex-col gap-3">
          <select value={vaxHamlet} onChange={(e) => setVaxHamlet(e.target.value)} className="border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground">
            <option value="">{t("allHamlets")}</option>
            {HAMLETS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={vaxFarmer} onChange={(e) => setVaxFarmer(e.target.value)} className="border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground">
            <option value="">{t("selectFarmer")}</option>
            {vaxFarmers.map((f) => <option key={f.userId} value={f.userId}>{f.name}</option>)}
          </select>
          <Input value={vaccineType} onChange={(e) => setVaccineType(e.target.value)} placeholder={t("vaccineType")} className="tap-target" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">{t("dateGiven")}</label>
              <Input type="date" value={vaxDate} onChange={(e) => setVaxDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("nextDueDate")}</label>
              <Input type="date" value={vaxNextDue} onChange={(e) => setVaxNextDue(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleVaxSave} disabled={!vaxFarmer || !vaxNextDue || vaxLoading} className="tap-target bg-primary text-primary-foreground">
            {vaxLoading ? <Loader2 className="animate-spin" size={18} /> : t("save")}
          </Button>
        </div>
      </Card>

      {/* Mark Deworming */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("markDeworming")}</h2>
        <div className="flex flex-col gap-3">
          <select value={dewHamlet} onChange={(e) => setDewHamlet(e.target.value)} className="border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground">
            <option value="">{t("allHamlets")}</option>
            {HAMLETS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={dewFarmer} onChange={(e) => setDewFarmer(e.target.value)} className="border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground">
            <option value="">{t("selectFarmer")}</option>
            {dewFarmers.map((f) => <option key={f.userId} value={f.userId}>{f.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">{t("dateGiven")}</label>
              <Input type="date" value={dewDate} onChange={(e) => setDewDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">{t("nextDueDate")}</label>
              <Input type="date" value={dewNextDue} onChange={(e) => setDewNextDue(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleDewSave} disabled={!dewFarmer || !dewNextDue || dewLoading} className="tap-target bg-primary text-primary-foreground">
            {dewLoading ? <Loader2 className="animate-spin" size={18} /> : t("save")}
          </Button>
        </div>
      </Card>

      {/* Pending Service Demands — Feed, Equipment, Vaccination, Deworming */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">விவசாயி கோரிக்கைகள் (Feed / Equipment / Vaccination)</h2>
        {pendingDemands.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noData")}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingDemands.map((d) => (
              <div key={d._id} className="border border-border rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">{d.userId?.name || d.farmerName}</p>
                    <p className="text-xs text-muted-foreground">{d.userId?.hamlet || d.hamlet} • {formatDate(d.createdAt)}</p>
                  </div>
                  <Badge className="bg-warning text-warning-foreground">{d.type}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Qty: {d.quantity}{d.notes ? ` • ${d.notes}` : ""}</p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(d._id)} className="flex-1 bg-success text-success-foreground text-xs">
                    ✅ அனுமதி
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleReject(d._id)} className="flex-1 border-danger text-danger text-xs">
                    ❌ நிராகரி
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Credit / Loan Demands — separate section */}
      <Card className="p-5 bg-card border-2 border-warning/40">
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee size={20} className="text-warning" />
          <h2 className="text-lg font-bold text-foreground">கடன் கோரிக்கைகள் (Credit / Loan Demands)</h2>
        </div>

        {loanDemands.length === 0 ? (
          <p className="text-sm text-muted-foreground">கடன் கோரிக்கைகள் இல்லை</p>
        ) : (
          <div className="flex flex-col gap-3">
            {loanDemands.map((d: any) => {
              const statusConfig: Record<string, { label: string; className: string }> = {
                Pending:   { label: "🟡 நிலுவையில்",        className: "bg-warning text-warning-foreground" },
                Completed: { label: "🟢 அனுமதிக்கப்பட்டது", className: "bg-success text-success-foreground" },
                Rejected:  { label: "🔴 நிராகரிக்கப்பட்டது", className: "bg-danger text-danger-foreground" },
              };
              const config = statusConfig[d.status] ?? statusConfig.Pending;
              return (
                <div key={d._id} className="border border-border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        {d.userId?.name || d.farmerName || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {d.userId?.hamlet || d.hamlet || ""} • {formatDate(d.createdAt)}
                      </p>
                    </div>
                    <Badge className={config.className}>{config.label}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-warning">₹{(d.amount || 0).toLocaleString("ta-IN")}</p>
                      {d.notes && <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>}
                    </div>
                    {d.status === "Pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(d._id)}
                          className="bg-success text-success-foreground text-xs"
                        >
                          அனுமதி
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(d._id)}
                          className="border-danger text-danger text-xs"
                        >
                          நிராகரி
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CrpServicesTab;
