import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getHamletSummaries, getMockFarmers, getPendingUpdateFarmers } from "@/lib/crpMockData";
import { Users, Bird, Syringe, Bug } from "lucide-react";

const CrpDashboardTab = () => {
  const { t } = useLanguage();
  const summaries = getHamletSummaries();
  const farmers = getMockFarmers();
  const pendingFarmers = getPendingUpdateFarmers();

  const totalFarmers = farmers.length;
  const totalBirds = summaries.reduce((s, h) => s + h.totalBirds, 0);
  const pendingVax = farmers.filter((f) => f.vaccinations.length === 0 || f.vaccinations.some((v) => new Date(v.nextDueDate) < new Date())).length;
  const pendingDew = farmers.filter((f) => f.dewormings.length === 0 || f.dewormings.some((d) => new Date(d.nextDueDate) < new Date())).length;

  const [selectedHamlet, setSelectedHamlet] = useState<string | null>(null);

  const hamletFarmers = selectedHamlet ? farmers.filter((f) => f.hamlet === selectedHamlet) : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 bg-card">
          <Users size={24} className="text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{totalFarmers}</p>
          <p className="text-xs text-muted-foreground">{t("totalFarmers")}</p>
        </Card>
        <Card className="p-4 bg-card">
          <Bird size={24} className="text-primary mb-1" />
          <p className="text-2xl font-bold text-foreground">{totalBirds}</p>
          <p className="text-xs text-muted-foreground">{t("totalBirds")}</p>
        </Card>
        <Card className="p-4 bg-card">
          <Syringe size={24} className="text-warning mb-1" />
          <p className="text-2xl font-bold text-foreground">{pendingVax}</p>
          <p className="text-xs text-muted-foreground">{t("pendingVaccinations")}</p>
        </Card>
        <Card className="p-4 bg-card">
          <Bug size={24} className="text-warning mb-1" />
          <p className="text-2xl font-bold text-foreground">{pendingDew}</p>
          <p className="text-xs text-muted-foreground">{t("pendingDewormings")}</p>
        </Card>
      </div>

      {/* Hamlet Summary Table */}
      <Card className="p-4 bg-card">
        <h2 className="text-lg font-bold mb-3 text-foreground">{t("hamletSummary")}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">{t("hamlet")}</th>
                <th className="text-center py-2 text-muted-foreground font-medium">{t("totalBirds")}</th>
                <th className="text-center py-2 text-muted-foreground font-medium">{t("vaccinatedPct")}</th>
                <th className="text-center py-2 text-muted-foreground font-medium">{t("dewormedPct")}</th>
                <th className="text-center py-2 text-muted-foreground font-medium">{t("pendingDemands")}</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr
                  key={s.hamlet}
                  onClick={() => setSelectedHamlet(selectedHamlet === s.hamlet ? null : s.hamlet)}
                  className="border-b border-border/50 cursor-pointer hover:bg-muted/50"
                >
                  <td className="py-2 text-foreground font-medium">{s.hamlet}</td>
                  <td className="text-center py-2 text-foreground">{s.totalBirds}</td>
                  <td className="text-center py-2">{s.vaccinatedPct}%</td>
                  <td className="text-center py-2">{s.dewormedPct}%</td>
                  <td className="text-center py-2">
                    {s.pendingDemands > 0 ? (
                      <Badge className="bg-warning text-warning-foreground">{s.pendingDemands}</Badge>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Drill-down */}
      {hamletFarmers && (
        <Card className="p-4 bg-card">
          <h3 className="text-base font-bold mb-3 text-foreground">{selectedHamlet} — {t("farmerList")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground">{t("farmerName")}</th>
                  <th className="text-center py-2 text-muted-foreground">{t("totalBirds")}</th>
                  <th className="text-center py-2 text-muted-foreground">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {hamletFarmers.map((f) => {
                  const latest = f.birdUpdates[0];
                  const birds = latest ? latest.chicks + latest.growers + latest.layers + latest.broilers : 0;
                  const thisWeek = new Date(); thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
                  const weekStr = thisWeek.toISOString().split("T")[0];
                  const updated = f.lastUpdateWeek === weekStr;
                  return (
                    <tr key={f.userId} className="border-b border-border/50">
                      <td className="py-2 text-foreground">{f.name}</td>
                      <td className="text-center py-2">{birds}</td>
                      <td className="text-center py-2">
                        <Badge className={updated ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground"}>
                          {updated ? "✅" : "⚠️"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pending Farmers */}
      {pendingFarmers.length > 0 && (
        <Card className="p-4 bg-card border-danger/30">
          <h3 className="text-base font-bold mb-3 text-danger">{t("farmersNotUpdated")} ({pendingFarmers.length})</h3>
          <div className="flex flex-col gap-1">
            {pendingFarmers.map((f) => (
              <div key={f.userId} className="flex items-center justify-between py-1.5 border-b border-border/30">
                <span className="text-sm text-foreground">{f.name} — <span className="text-muted-foreground">{f.hamlet}</span></span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CrpDashboardTab;
