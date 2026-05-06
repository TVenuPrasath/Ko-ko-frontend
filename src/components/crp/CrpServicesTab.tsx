import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HAMLETS } from "@/lib/auth";
import { formatDate } from "@/lib/mockData";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, IndianRupee, ChevronDown, ChevronUp } from "lucide-react";
import { User } from "@/lib/auth";

const CrpServicesTab = ({ user }: { user: User }) => {
  const { t } = useLanguage();
  const [farmers, setFarmers] = useState<any[]>([]);

  useEffect(() => {
    api.getFarmers().then(setFarmers).catch(() => {});
  }, []);

  const [vaxHamlet, setVaxHamlet] = useState("");
  const [vaxFarmer, setVaxFarmer] = useState("");
  const [vaccineType, setVaccineType] = useState("Newcastle (R2B)");
  const [vaxDate, setVaxDate] = useState(new Date().toISOString().split("T")[0]);
  const [vaxNextDue, setVaxNextDue] = useState("");
  const [vaxLoading, setVaxLoading] = useState(false);

  const [dewHamlet, setDewHamlet] = useState("");
  const [dewFarmer, setDewFarmer] = useState("");
  const [dewDate, setDewDate] = useState(new Date().toISOString().split("T")[0]);
  const [dewNextDue, setDewNextDue] = useState("");
  const [dewLoading, setDewLoading] = useState(false);

  const vaxFarmers = vaxHamlet ? farmers.filter((f) => f.hamlet === vaxHamlet) : farmers;
  const dewFarmers = dewHamlet ? farmers.filter((f) => f.hamlet === dewHamlet) : farmers;

  const handleVaxSave = async () => {
    setVaxLoading(true);
    await api.addVaccination({ userId: vaxFarmer, type: vaccineType.toLowerCase().includes("smallpox") ? "smallpox" : "white_diarrhea", ageGroup: vaccineType, dateGiven: vaxDate, nextDueDate: vaxNextDue, status: "completed" });
    setVaxLoading(false);
    toast.success(t("saved") + " ✅ தடுப்பூசி பதிவு சேமிக்கப்பட்டது");
    setVaxFarmer(""); setVaxNextDue("");
  };

  const handleDewSave = async () => {
    setDewLoading(true);
    await api.addVaccination({ userId: dewFarmer, type: "deworming", dateGiven: dewDate, nextDueDate: dewNextDue, status: "completed" });
    setDewLoading(false);
    toast.success(t("saved") + " ✅ குடற்புழு நீக்கம் பதிவு சேமிக்கப்பட்டது");
    setDewFarmer(""); setDewNextDue("");
  };

  const [allDemands, setAllDemands] = useState<any[]>([]);
  const [allDiseaseReports, setAllDiseaseReports] = useState<any[]>([]);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    api.getAllServiceDemands().then(setAllDemands).catch(() => {});
    api.getAllDiseaseReports().then(setAllDiseaseReports).catch(() => {});
  }, [refresh]);

  const pendingDemands  = allDemands.filter((d) => d.status === "Pending" && ["Feed Stock", "Equipment", "Vaccination", "Deworming"].includes(d.type));
  const doneDemands     = allDemands.filter((d) => d.status !== "Pending" && ["Feed Stock", "Equipment", "Vaccination", "Deworming"].includes(d.type));
  const pendingLoans    = allDemands.filter((d) => d.type === "Loan" && d.status === "Pending");
  const doneLoans       = allDemands.filter((d) => d.type === "Loan" && d.status !== "Pending");
  const pendingDisease  = allDiseaseReports.filter((r) => r.status === "Pending");
  const reviewedDisease = allDiseaseReports.filter((r) => r.status === "Reviewed");

  const [serviceTab, setServiceTab] = useState<"pending" | "history">("pending");
  const [loanTab,    setLoanTab]    = useState<"pending" | "history">("pending");
  const [diseaseTab, setDiseaseTab] = useState<"pending" | "reviewed">("pending");
  const [serviceOpen, setServiceOpen] = useState(true);
  const [loanOpen,    setLoanOpen]    = useState(true);
  const [diseaseOpen, setDiseaseOpen] = useState(true);

  const officer = { id: user.userId, name: user.name };

  const handleApprove = async (id: string) => {
    try { await api.completeServiceDemand(id, officer); setRefresh((k) => k + 1); toast.success("அனுமதிக்கப்பட்டது ✅"); }
    catch { toast.error("Failed"); }
  };
  const handleReject = async (id: string) => {
    try { await api.rejectServiceDemand(id, officer); setRefresh((k) => k + 1); toast.success("நிராகரிக்கப்பட்டது ❌"); }
    catch { toast.error("Failed"); }
  };
  const handleReviewDisease = async (id: string) => {
    try { await api.reviewDiseaseReport(id); setRefresh((k) => k + 1); toast.success("பரிசீலிக்கப்பட்டது ✅"); }
    catch { toast.error("Failed"); }
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
            {vaxFarmers.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
          <Input value={vaccineType} onChange={(e) => setVaccineType(e.target.value)} placeholder={t("vaccineType")} className="tap-target" />
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">{t("dateGiven")}</label><Input type="date" value={vaxDate} onChange={(e) => setVaxDate(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">{t("nextDueDate")}</label><Input type="date" value={vaxNextDue} onChange={(e) => setVaxNextDue(e.target.value)} /></div>
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
            {dewFarmers.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">{t("dateGiven")}</label><Input type="date" value={dewDate} onChange={(e) => setDewDate(e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">{t("nextDueDate")}</label><Input type="date" value={dewNextDue} onChange={(e) => setDewNextDue(e.target.value)} /></div>
          </div>
          <Button onClick={handleDewSave} disabled={!dewFarmer || !dewNextDue || dewLoading} className="tap-target bg-primary text-primary-foreground">
            {dewLoading ? <Loader2 className="animate-spin" size={18} /> : t("save")}
          </Button>
        </div>
      </Card>

      {/* Service Demands */}
      <Card className="p-5 bg-card">
        <button className="w-full flex items-center justify-between" onClick={() => setServiceOpen((o) => !o)}>
          <h2 className="text-lg font-bold text-foreground">விவசாயி கோரிக்கைகள் (Feed / Equipment / Vaccination)</h2>
          {serviceOpen ? <ChevronUp size={18} className="text-muted-foreground shrink-0" /> : <ChevronDown size={18} className="text-muted-foreground shrink-0" />}
        </button>
        {serviceOpen && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex gap-2">
              <button onClick={() => setServiceTab("pending")} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${serviceTab === "pending" ? "bg-warning text-warning-foreground border-warning" : "border-border text-muted-foreground"}`}>
                நிலுவை ({pendingDemands.length})
              </button>
              <button onClick={() => setServiceTab("history")} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${serviceTab === "history" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                வரலாறு ({doneDemands.length})
              </button>
            </div>
            {serviceTab === "pending" && (
              pendingDemands.length === 0 ? <p className="text-sm text-muted-foreground">நிலுவை கோரிக்கைகள் இல்லை</p> :
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
                      <Button size="sm" onClick={() => handleApprove(d._id)} className="flex-1 bg-success text-success-foreground text-xs">✅ அனுமதி</Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(d._id)} className="flex-1 border-danger text-danger text-xs">❌ நிராகரி</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {serviceTab === "history" && (
              doneDemands.length === 0 ? <p className="text-sm text-muted-foreground">இன்னும் எதுவும் இல்லை</p> :
              <div className="flex flex-col gap-3">
                {doneDemands.map((d) => (
                  <div key={d._id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-bold text-foreground">{d.userId?.name || d.farmerName}</p>
                        <p className="text-xs text-muted-foreground">{d.userId?.hamlet || d.hamlet} • {formatDate(d.createdAt)}</p>
                      </div>
                      <Badge className={d.status === "Completed" ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground"}>
                        {d.status === "Completed" ? "✅ அனுமதி" : "❌ நிராகரிக்கப்பட்டது"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Qty: {d.quantity}{d.notes ? ` • ${d.notes}` : ""}</p>
                    {d.actionBy && <p className="text-xs text-muted-foreground mt-0.5">செயல்: {d.actionBy}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Loan Demands */}
      <Card className="p-5 bg-card border-2 border-warning/40">
        <button className="w-full flex items-center justify-between" onClick={() => setLoanOpen((o) => !o)}>
          <div className="flex items-center gap-2">
            <IndianRupee size={20} className="text-warning" />
            <h2 className="text-lg font-bold text-foreground">கடன் கோரிக்கைகள் (Credit / Loan Demands)</h2>
          </div>
          {loanOpen ? <ChevronUp size={18} className="text-muted-foreground shrink-0" /> : <ChevronDown size={18} className="text-muted-foreground shrink-0" />}
        </button>
        {loanOpen && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex gap-2">
              <button onClick={() => setLoanTab("pending")} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${loanTab === "pending" ? "bg-warning text-warning-foreground border-warning" : "border-border text-muted-foreground"}`}>
                நிலுவை ({pendingLoans.length})
              </button>
              <button onClick={() => setLoanTab("history")} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${loanTab === "history" ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
                வரலாறு ({doneLoans.length})
              </button>
            </div>
            {loanTab === "pending" && (
              pendingLoans.length === 0 ? <p className="text-sm text-muted-foreground">நிலுவை கடன் கோரிக்கைகள் இல்லை</p> :
              <div className="flex flex-col gap-3">
                {pendingLoans.map((d: any) => (
                  <div key={d._id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">{d.userId?.name || d.farmerName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{d.userId?.hamlet || d.hamlet || ""} • {formatDate(d.createdAt)}</p>
                      </div>
                      <Badge className="bg-warning text-warning-foreground">நிலுவை</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xl font-bold text-warning">₹{(d.amount || 0).toLocaleString("ta-IN")}</p>
                        {d.notes && <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(d._id)} className="bg-success text-success-foreground text-xs">அனுமதி</Button>
                        <Button size="sm" variant="outline" onClick={() => handleReject(d._id)} className="border-danger text-danger text-xs">நிராகரி</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {loanTab === "history" && (
              doneLoans.length === 0 ? <p className="text-sm text-muted-foreground">இன்னும் எதுவும் இல்லை</p> :
              <div className="flex flex-col gap-3">
                {doneLoans.map((d: any) => (
                  <div key={d._id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">{d.userId?.name || d.farmerName || "—"}</p>
                        <p className="text-xs text-muted-foreground">{d.userId?.hamlet || d.hamlet || ""} • {formatDate(d.createdAt)}</p>
                      </div>
                      <Badge className={d.status === "Completed" ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground"}>
                        {d.status === "Completed" ? "✅ அனுமதிக்கப்பட்டது" : "❌ நிராகரிக்கப்பட்டது"}
                      </Badge>
                    </div>
                    <p className="text-xl font-bold text-foreground">₹{(d.amount || 0).toLocaleString("ta-IN")}</p>
                    {d.notes && <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>}
                    {d.actionBy && <p className="text-xs text-muted-foreground mt-0.5">செயல்: {d.actionBy}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Disease Reports */}
      <Card className="p-5 bg-card border-2 border-danger/30">
        <button className="w-full flex items-center justify-between" onClick={() => setDiseaseOpen((o) => !o)}>
          <h2 className="text-lg font-bold text-foreground">நோய் அறிக்கைகள்</h2>
          {diseaseOpen ? <ChevronUp size={18} className="text-muted-foreground shrink-0" /> : <ChevronDown size={18} className="text-muted-foreground shrink-0" />}
        </button>
        {diseaseOpen && (
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex gap-2">
              <button onClick={() => setDiseaseTab("pending")} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${diseaseTab === "pending" ? "bg-warning text-warning-foreground border-warning" : "border-border text-muted-foreground"}`}>
                நிலுவை ({pendingDisease.length})
              </button>
              <button onClick={() => setDiseaseTab("reviewed")} className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${diseaseTab === "reviewed" ? "bg-success text-success-foreground border-success" : "border-border text-muted-foreground"}`}>
                பரிசீலிக்கப்பட்டது ({reviewedDisease.length})
              </button>
            </div>
            {diseaseTab === "pending" && (
              pendingDisease.length === 0 ? <p className="text-sm text-muted-foreground">நிலுவை நோய் அறிக்கைகள் இல்லை</p> :
              <div className="flex flex-col gap-3">
                {pendingDisease.map((r: any) => (
                  <div key={r._id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-bold text-foreground">{r.farmerName || r.userId?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(r.reportedAt)}</p>
                      </div>
                      <Badge className="bg-warning text-warning-foreground">நிலுவை</Badge>
                    </div>
                    <p className="text-sm text-foreground mb-3">{r.description}</p>
                    <Button size="sm" onClick={() => handleReviewDisease(r._id)} className="w-full bg-success text-success-foreground text-xs">
                      ✅ பரிசீலிக்கப்பட்டததாக குறி
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {diseaseTab === "reviewed" && (
              reviewedDisease.length === 0 ? <p className="text-sm text-muted-foreground">இன்னும் எதுவும் இல்லை</p> :
              <div className="flex flex-col gap-3">
                {reviewedDisease.map((r: any) => (
                  <div key={r._id} className="border border-border rounded-lg p-3">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-sm font-bold text-foreground">{r.farmerName || r.userId?.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(r.reportedAt)}</p>
                      </div>
                      <Badge className="bg-success text-success-foreground">✅ பரிசீலிக்கப்பட்டது</Badge>
                    </div>
                    <p className="text-sm text-foreground">{r.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

    </div>
  );
};

export default CrpServicesTab;
