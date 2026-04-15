import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HAMLETS } from "@/lib/auth";
import { getMockFarmers, getAllServiceDemands } from "@/lib/crpMockData";
import { formatDate } from "@/lib/mockData";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
    await new Promise((r) => setTimeout(r, 600));
    setVaxLoading(false);
    toast.success(t("saved") + " ✅");
    setVaxFarmer("");
    setVaxNextDue("");
  };

  const handleDewSave = async () => {
    setDewLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setDewLoading(false);
    toast.success(t("saved") + " ✅");
    setDewFarmer("");
    setDewNextDue("");
  };

  const demands = getAllServiceDemands();
  const pendingDemands = demands.filter((d) => d.status === "Pending");
  const [demandStatuses, setDemandStatuses] = useState<Record<string, string>>({});

  const toggleDemand = (id: string) => {
    setDemandStatuses((prev) => ({ ...prev, [id]: "Completed" }));
    toast.success(t("completed") + " ✅");
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

      {/* Pending Service Demands */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("pendingServiceDemands")}</h2>
        {pendingDemands.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("noData")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingDemands.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.farmerName} — {d.type}</p>
                  <p className="text-xs text-muted-foreground">{d.hamlet} • Qty: {d.quantity} • {formatDate(d.createdAt)}</p>
                </div>
                {demandStatuses[d.id] === "Completed" ? (
                  <Badge className="bg-success text-success-foreground">{t("completed")}</Badge>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => toggleDemand(d.id)} className="text-xs">
                    {t("markCompleted")}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CrpServicesTab;
