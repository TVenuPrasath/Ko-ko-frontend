import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHamletSummaries, getMockFarmers } from "@/lib/crpMockData";
import { HAMLETS } from "@/lib/auth";
import { FileBarChart2, MessageSquare, Users, IndianRupee, Activity, ChevronDown, ChevronUp, X } from "lucide-react";
import { mockServiceDemands, mockBirdUpdates, mockActivityLog, ActivityEntry } from "@/lib/api";
import { formatDate } from "@/lib/mockData";

interface CrpDashboardTabProps {
  onNavigate?: (tab: "reports" | "alerts" | "services" | "approve") => void;
}

function getThisWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

function isToday(dateStr: string) {
  return new Date(dateStr).toDateString() === new Date().toDateString();
}

const FILTER_TYPES = ["அனைத்தும்", "கோழி புதுப்பிப்பு", "கடன்", "நோய்", "சேவை"] as const;
type FilterType = typeof FILTER_TYPES[number];

const actionMatchesFilter = (action: string, filter: FilterType) => {
  if (filter === "அனைத்தும்") return true;
  if (filter === "கோழி புதுப்பிப்பு") return action.includes("கோழி எண்ணிக்கை");
  if (filter === "கடன்") return action.includes("Loan") || action.includes("கடன்");
  if (filter === "நோய்") return action.includes("நோய்");
  if (filter === "சேவை") return !action.includes("கோழி எண்ணிக்கை") && !action.includes("நோய்");
  return true;
};

const CrpDashboardTab = ({ onNavigate }: CrpDashboardTabProps) => {
  const { t } = useLanguage();
  const summaries = getHamletSummaries();
  const farmers = getMockFarmers();

  const totalFarmers = farmers.length;
  const totalBirds = summaries.reduce((s, h) => s + h.totalBirds, 0);
  const totalHamlets = HAMLETS.length;
  const thisWeek = getThisWeek();

  // Weekly update — per hamlet
  const hamletUpdateStats = summaries.map((s) => {
    const hamletFarmers = farmers.filter((f) => f.hamlet === s.hamlet);
    const updated = mockBirdUpdates.filter((u) => u.weekDate === thisWeek).length;
    const total = hamletFarmers.length;
    return { hamlet: s.hamlet, updated: Math.min(updated, total), total, notUpdated: Math.max(0, total - updated) };
  });
  const totalUpdated = hamletUpdateStats.reduce((s, h) => s + h.updated, 0);
  const totalNotUpdated = hamletUpdateStats.reduce((s, h) => s + h.notUpdated, 0);

  // Weekly counter drill-down
  const [showWeeklyDetail, setShowWeeklyDetail] = useState(false);
  const [weeklyView, setWeeklyView] = useState<"updated" | "not_updated">("not_updated");

  // Activity feed filters
  const [activityFilter, setActivityFilter] = useState<FilterType>("அனைத்தும்");
  const [hamletFilter, setHamletFilter] = useState("அனைத்தும்");
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [activityCleared, setActivityCleared] = useState(false);

  const pendingLoans = mockServiceDemands.filter((d) => d.type === "Loan" && d.status === "Pending");
  const totalLoanAmount = pendingLoans.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  // Filter activity — today only by default, all if showAll
  const filteredActivity = mockActivityLog
    .filter((a) => showAllActivity || isToday(a.createdAt))
    .filter((a) => hamletFilter === "அனைத்தும்" || a.hamlet === hamletFilter)
    .filter((a) => actionMatchesFilter(a.action, activityFilter));

  const StatRow = ({ label, value }: { label: string; value: number | string }) => (
    <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
      <span className="text-sm text-foreground">{label}</span>
      <span className="text-base font-bold text-foreground border border-input rounded-md px-3 py-1 min-w-[60px] text-center bg-muted/30">{value}</span>
    </div>
  );

  const actions: { key: "reports" | "alerts" | "services" | "approve"; label: string; icon: typeof Users }[] = [
    { key: "reports",  label: t("dataSummary"),    icon: FileBarChart2 },
    { key: "alerts",   label: t("sendSms"),         icon: MessageSquare },
    { key: "services", label: "சேவை கோரிக்கைகள்", icon: Activity },
    { key: "approve",  label: t("addNewMembers"),   icon: Users },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-base font-bold text-foreground">{t("userTypeStaff")}</h2>
        <p className="text-xs italic text-muted-foreground mt-1">{t("dashboardEn")}</p>
      </div>

      {/* Weekly Update Counter — clickable */}
      <Card className={`p-4 border-2 ${totalNotUpdated > 0 ? "border-warning/50 bg-warning/5" : "border-success/50 bg-success/5"}`}>
        <button className="w-full" onClick={() => setShowWeeklyDetail(!showWeeklyDetail)}>
          <div className="flex items-center justify-between">
            <div className="text-left">
              <p className="text-sm font-bold text-foreground">இந்த வார பதிவு</p>
              <p className="text-xs text-muted-foreground">(This week's updates)</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {totalUpdated}<span className="text-sm text-muted-foreground font-normal">/{totalFarmers}</span>
                </p>
                {totalNotUpdated > 0
                  ? <Badge className="bg-warning text-warning-foreground text-xs">{totalNotUpdated} பதிவிடவில்லை</Badge>
                  : <Badge className="bg-success text-success-foreground text-xs">அனைவரும் ✅</Badge>
                }
              </div>
              {showWeeklyDetail ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </div>
          </div>
        </button>

        {/* Drill-down */}
        {showWeeklyDetail && (
          <div className="mt-4 border-t border-border pt-3">
            <div className="flex gap-2 mb-3">
              <Button size="sm" onClick={() => setWeeklyView("not_updated")}
                className={`flex-1 text-xs ${weeklyView === "not_updated" ? "bg-warning text-warning-foreground" : "bg-muted text-foreground"}`}>
                ❌ பதிவிடவில்லை ({totalNotUpdated})
              </Button>
              <Button size="sm" onClick={() => setWeeklyView("updated")}
                className={`flex-1 text-xs ${weeklyView === "updated" ? "bg-success text-success-foreground" : "bg-muted text-foreground"}`}>
                ✅ பதிவிட்டார்கள் ({totalUpdated})
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              {hamletUpdateStats.map((h) => {
                const count = weeklyView === "not_updated" ? h.notUpdated : h.updated;
                if (count === 0) return null;
                const hamletFarmers = farmers.filter((f) => f.hamlet === h.hamlet);
                const relevantFarmers = weeklyView === "updated"
                  ? hamletFarmers.slice(0, h.updated)
                  : hamletFarmers.slice(h.updated);
                return (
                  <div key={h.hamlet} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-foreground">{h.hamlet}</p>
                      <Badge className={weeklyView === "not_updated" ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}>
                        {count}/{h.total}
                      </Badge>
                    </div>
                    {relevantFarmers.map((f) => (
                      <div key={f.userId} className="flex items-center justify-between py-1 border-t border-border/30">
                        <span className="text-xs text-foreground">{f.name}</span>
                        <span className="text-xs text-muted-foreground">{f.phone}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Stat counts */}
      <Card className="p-4 bg-card">
        <StatRow label={t("totalChickenCount")} value={totalBirds} />
        <StatRow label={t("totalMembersCount")} value={totalFarmers} />
        <StatRow label={t("streets")} value={totalHamlets} />
      </Card>

      {/* Loan Summary */}
      <Card className="p-4 bg-card border-2 border-warning/40">
        <div className="flex items-center gap-2 mb-3">
          <IndianRupee size={20} className="text-warning" />
          <h3 className="text-base font-bold text-foreground">கடன் கோரிக்கைகள்</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-warning">{pendingLoans.length}</p>
            <p className="text-xs text-muted-foreground mt-1">நிலுவை கோரிக்கைகள்</p>
          </div>
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-warning">₹{totalLoanAmount.toLocaleString("ta-IN")}</p>
            <p className="text-xs text-muted-foreground mt-1">மொத்த தொகை</p>
          </div>
        </div>
        {pendingLoans.length > 0 && (
          <div className="mt-3 flex flex-col gap-1">
            {pendingLoans.slice(0, 3).map((d: any) => (
              <div key={d._id} className="flex items-center justify-between py-1.5 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{d.userId?.name || d.farmerName}</p>
                  <p className="text-xs text-muted-foreground">{d.hamlet}</p>
                </div>
                <span className="text-sm font-bold text-warning">₹{(d.amount || 0).toLocaleString("ta-IN")}</span>
              </div>
            ))}
            {pendingLoans.length > 3 && <p className="text-xs text-muted-foreground text-center mt-1">+ {pendingLoans.length - 3} more</p>}
          </div>
        )}
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {actions.map((a) => (
          <Card key={a.key} onClick={() => onNavigate?.(a.key)}
            className="p-4 bg-card cursor-pointer hover:bg-muted/40 border-2 flex flex-col items-center justify-center text-center gap-2 min-h-[90px]">
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
                <tr key={s.hamlet} className="border-b border-border/50">
                  <td className="py-2 text-foreground font-medium">{s.hamlet}</td>
                  <td className="text-center py-2">{s.totalBirds}</td>
                  <td className="text-center py-2">{s.vaccinatedPct}%</td>
                  <td className="text-center py-2">
                    {s.pendingDemands > 0
                      ? <Badge className="bg-warning text-warning-foreground">{s.pendingDemands}</Badge>
                      : <span className="text-muted-foreground">0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Activity Feed */}
      <Card className="p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <h3 className="text-base font-bold text-foreground">சமீப செயல்பாடுகள்</h3>
          </div>
          {mockActivityLog.length > 0 && (
            <Button size="sm" variant="outline" className="text-xs"
              onClick={() => { mockActivityLog.splice(0, mockActivityLog.length); setActivityFilter("அனைத்தும்"); setHamletFilter("அனைத்தும்"); setShowAllActivity(false); setActivityCleared(c => !c); }}>
              ✔ படித்ததாக குறி
            </Button>
          )}
        </div>

        {/* Filter chips — type */}
        <div className="flex gap-1.5 flex-wrap mb-2">
          {FILTER_TYPES.map((f) => (
            <button key={f} onClick={() => setActivityFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                activityFilter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* Filter — hamlet */}
        <select value={hamletFilter} onChange={(e) => setHamletFilter(e.target.value)}
          className="w-full border border-input rounded-md px-3 py-1.5 text-xs bg-card text-foreground mb-3">
          <option value="அனைத்தும்">அனைத்து ஊர்களும்</option>
          {summaries.map((s) => <option key={s.hamlet} value={s.hamlet}>{s.hamlet}</option>)}
        </select>

        {filteredActivity.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              {showAllActivity ? "செயல்பாடுகள் இல்லை" : "இன்று செயல்பாடுகள் இல்லை"}
            </p>
            {!showAllActivity && (
              <button onClick={() => setShowAllActivity(true)} className="text-xs text-primary underline mt-1">
                அனைத்து செயல்பாடுகளும் காட்டு
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-0">
              {filteredActivity.slice(0, showAllActivity ? 50 : 8).map((a: ActivityEntry) => (
                <div key={a._id} className="flex items-start gap-3 py-2 border-b border-border/30 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-bold">{a.farmerName}</span> — {a.action}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.hamlet} • {formatDate(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              {!showAllActivity ? (
                <button onClick={() => setShowAllActivity(true)} className="text-xs text-primary underline">
                  அனைத்தும் காட்டு ({mockActivityLog.length})
                </button>
              ) : (
                <button onClick={() => setShowAllActivity(false)} className="text-xs text-primary underline flex items-center gap-1">
                  <X size={12} /> குறைக்கவும்
                </button>
              )}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default CrpDashboardTab;
