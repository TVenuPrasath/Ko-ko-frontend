import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getHamletSummaries, getMockFarmers, getPendingUpdateFarmers } from "@/lib/crpMockData";
import { HAMLETS } from "@/lib/auth";
import { FileBarChart2, MessageSquare, UserPlus, Users, IndianRupee } from "lucide-react";
import { mockServiceDemands } from "@/lib/api";

interface CrpDashboardTabProps {
  onNavigate?: (tab: "reports" | "alerts" | "share" | "approve") => void;
}

const CrpDashboardTab = ({ onNavigate }: CrpDashboardTabProps) => {
  const { t } = useLanguage();
  const summaries = getHamletSummaries();
  const farmers = getMockFarmers();
  const pendingFarmers = getPendingUpdateFarmers();

  const totalFarmers = farmers.length;
  const totalBirds = summaries.reduce((s, h) => s + h.totalBirds, 0);
  const totalHamlets = HAMLETS.length;

  const [selectedHamlet, setSelectedHamlet] = useState<string | null>(null);
  const hamletFarmers = selectedHamlet ? farmers.filter((f) => f.hamlet === selectedHamlet) : null;

  const pendingLoans = mockServiceDemands.filter((d) => d.type === "Loan" && d.status === "Pending");
  const totalLoanAmount = pendingLoans.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  const StatRow = ({ label, value }: { label: string; value: number | string }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-base font-bold text-foreground border border-input rounded-md px-3 py-1 min-w-[60px] text-center bg-muted/30">
        {value}
      </span>
    </div>
  );

  const actions: { key: "reports" | "alerts" | "share" | "approve"; label: string; icon: typeof Users }[] = [
    { key: "reports", label: t("dataSummary"), icon: FileBarChart2 },
    { key: "alerts", label: t("sendSms"), icon: MessageSquare },
    { key: "share", label: "கோழி இருப்பு பகிர்", icon: UserPlus },
    { key: "approve", label: t("addNewMembers"), icon: Users },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-base font-bold text-foreground">{t("userTypeStaff")}</h2>
        <p className="text-xs italic text-muted-foreground mt-1">{t("dashboardEn")}</p>
      </div>

      {/* Stat counts */}
      <Card className="p-4 bg-card">
        <StatRow label={t("totalChickenCount")} value={totalBirds} />
        <StatRow label={t("totalMembersCount")} value={totalFarmers} />
        <StatRow label={t("streets")} value={totalHamlets} />
      </Card>

      {/* Credit / Loan Demands Summary */}
      <Card className="p-4 bg-card border-2 border-warning/40">
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee size={20} className="text-warning" />
          <h3 className="text-base font-bold text-foreground">கடன் கோரிக்கைகள் (Credit / Loan Demands)</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-warning">{pendingLoans.length}</p>
            <p className="text-xs text-muted-foreground mt-1">நிலுவை கோரிக்கைகள்<br/>(Pending Requests)</p>
          </div>
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-warning">₹{totalLoanAmount.toLocaleString("ta-IN")}</p>
            <p className="text-xs text-muted-foreground mt-1">மொத்த தொகை<br/>(Total Amount)</p>
          </div>
        </div>
        {pendingLoans.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            {pendingLoans.slice(0, 3).map((d: any) => (
              <div key={d._id} className="flex items-center justify-between py-1.5 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.userId?.name || d.farmerName || "—"}</p>
                  <p className="text-xs text-muted-foreground">{d.hamlet} • {d.notes || ""}</p>
                </div>
                <span className="text-sm font-bold text-warning">₹{(d.amount || 0).toLocaleString("ta-IN")}</span>
              </div>
            ))}
            {pendingLoans.length > 3 && (
              <p className="text-xs text-muted-foreground text-center mt-1">+ {pendingLoans.length - 3} more</p>
            )}
          </div>
        )}
        {pendingLoans.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-2">நிலுவை கடன் கோரிக்கைகள் இல்லை</p>
        )}
      </Card>

      {/* Quick action buttons */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Card
            key={a.key}
            onClick={() => onNavigate?.(a.key)}
            className="p-4 bg-card cursor-pointer hover:bg-muted/40 border-2 flex flex-col items-center justify-center text-center gap-2 min-h-[100px]"
          >
            <a.icon size={24} className="text-primary" />
            <p className="text-sm font-medium text-foreground leading-tight">{a.label}</p>
          </Card>
        ))}
      </div>

      {/* Hamlet Summary */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">{t("hamletSummary")}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">{t("hamlet")}</th>
                <th className="text-center py-2 text-muted-foreground font-medium">{t("totalBirds")}</th>
                <th className="text-center py-2 text-muted-foreground font-medium">{t("vaccinatedPct")}</th>
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
                  <td className="text-center py-2">{s.totalBirds}</td>
                  <td className="text-center py-2">{s.vaccinatedPct}%</td>
                  <td className="text-center py-2">
                    {s.pendingDemands > 0 ? (
                      <Badge className="bg-warning text-warning-foreground">{s.pendingDemands}</Badge>
                    ) : <span className="text-muted-foreground">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {hamletFarmers && (
        <Card className="p-4 bg-card">
          <h3 className="text-base font-bold mb-3 text-foreground">{selectedHamlet} — {t("farmerList")}</h3>
          {hamletFarmers.map((f) => (
            <div key={f.userId} className="flex items-center justify-between py-1.5 border-b border-border/30">
              <span className="text-sm text-foreground">{f.name}</span>
              <span className="text-xs text-muted-foreground">{f.phone}</span>
            </div>
          ))}
        </Card>
      )}

      {pendingFarmers.length > 0 && (
        <Card className="p-4 bg-card border-danger/30">
          <h3 className="text-base font-bold mb-2 text-danger">{t("farmersNotUpdated")} ({pendingFarmers.length})</h3>
          <div className="flex flex-col gap-1">
            {pendingFarmers.slice(0, 5).map((f) => (
              <div key={f.userId} className="flex items-center justify-between py-1 border-b border-border/30">
                <span className="text-sm text-foreground">{f.name} <span className="text-muted-foreground">— {f.hamlet}</span></span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CrpDashboardTab;
