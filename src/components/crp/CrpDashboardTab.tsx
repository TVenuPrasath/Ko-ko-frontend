import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HAMLETS } from "@/lib/auth";
import { FileBarChart2, MessageSquare, Users, Activity, ChevronDown, ChevronUp, Bird, ClipboardList, Bug } from "lucide-react";
import { api } from "@/lib/api";

interface CrpDashboardTabProps {
  onNavigate?: (tab: "reports" | "alerts" | "services" | "approve") => void;
}

function getThisWeek() {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const TYPE_ICON: Record<string, any> = {
  bird: Bird,
  service: ClipboardList,
  disease: Bug,
};

const TYPE_COLOR: Record<string, string> = {
  bird: "bg-primary/10 text-primary",
  service: "bg-warning/10 text-warning",
  disease: "bg-danger/10 text-danger",
};

const CrpDashboardTab = ({ onNavigate }: CrpDashboardTabProps) => {
  const { t } = useLanguage();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [birdUpdates, setBirdUpdates] = useState<any[]>([]);
  const [activityFeed, setActivityFeed] = useState<any[]>([]);
  const [showWeeklyDetail, setShowWeeklyDetail] = useState(false);
  const [weeklyView, setWeeklyView] = useState<"updated" | "not_updated">("not_updated");
  const [showAllActivity, setShowAllActivity] = useState(false);

  const markAsRead = (id: string) => {
    setActivityFeed((prev) => prev.filter((a) => a._id !== id));
  };

  const markAllAsRead = () => {
    setActivityFeed([]);
  };

  useEffect(() => {
    api.getFarmers().then(setFarmers).catch(() => {});
    api.getAllBirdUpdates().then(setBirdUpdates).catch(() => {});
    api.getActivity().then(setActivityFeed).catch(() => {});
  }, []);

  const thisWeek = getThisWeek();
  const totalFarmers = farmers.length;
  const totalHamlets = HAMLETS.length;

  const updatedUserIds = new Set(
    birdUpdates.filter((u) => u.weekDate === thisWeek).map((u) => u.userId?._id || u.userId)
  );
  const totalUpdated = updatedUserIds.size;
  const totalNotUpdated = Math.max(0, totalFarmers - totalUpdated);

  const hamletUpdateStats = HAMLETS.map((hamlet) => {
    const hf = farmers.filter((f) => f.hamlet === hamlet);
    const updated = hf.filter((f) => updatedUserIds.has(f._id)).length;
    return { hamlet, updated, total: hf.length, notUpdated: hf.length - updated };
  }).filter((h) => h.total > 0);

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

  const visibleActivity = showAllActivity ? activityFeed : activityFeed.slice(0, 8);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-base font-bold text-foreground">{t("userTypeStaff")}</h2>
        <p className="text-xs italic text-muted-foreground mt-1">{t("dashboardEn")}</p>
      </div>

      {/* Weekly Update Counter */}
      <Card className="p-4 border-2 border-primary/30 bg-primary/5">
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

        {showWeeklyDetail && (
          <div className="mt-4 border-t border-border pt-3">
            <div className="flex rounded-lg overflow-hidden border border-border mb-3">
              <button onClick={() => setWeeklyView("not_updated")}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${weeklyView === "not_updated" ? "bg-warning text-warning-foreground" : "bg-card text-muted-foreground"}`}>
                ❌ பதிவிடவில்லை ({totalNotUpdated})
              </button>
              <div className="w-px bg-border" />
              <button onClick={() => setWeeklyView("updated")}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${weeklyView === "updated" ? "bg-success text-success-foreground" : "bg-card text-muted-foreground"}`}>
                ✅ பதிவிட்டார்கள் ({totalUpdated})
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {hamletUpdateStats.map((h) => {
                const count = weeklyView === "not_updated" ? h.notUpdated : h.updated;
                if (count === 0) return null;
                const relevantFarmers = farmers.filter((f) => f.hamlet === h.hamlet && (weeklyView === "updated" ? updatedUserIds.has(f._id) : !updatedUserIds.has(f._id)));
                return (
                  <div key={h.hamlet} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-foreground">{h.hamlet}</p>
                      <Badge className={weeklyView === "not_updated" ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground"}>
                        {count}/{h.total}
                      </Badge>
                    </div>
                    {relevantFarmers.map((f) => (
                      <div key={f._id} className="flex items-center justify-between py-1 border-t border-border/30">
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
        <StatRow label={t("totalMembersCount")} value={totalFarmers} />
        <StatRow label={t("streets")} value={totalHamlets} />
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

      {/* Activity Feed */}
      <Card className="p-4 bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <h3 className="text-base font-bold text-foreground">சமீப செயல்பாடுகள்</h3>
            {activityFeed.length > 0 && (
              <Badge className="bg-danger text-danger-foreground text-xs px-1.5 py-0.5">{activityFeed.length}</Badge>
            )}
          </div>
          {activityFeed.length > 0 && (
            <button onClick={markAllAsRead} className="text-xs text-primary font-medium border border-primary rounded-md px-2.5 py-1 shrink-0">
              அனைத்தும் படித்தது ✓
            </button>
          )}
        </div>

        {activityFeed.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">இன்னும் செயல்பாடுகள் இல்லை</p>
        ) : (
          <>
            <div className="flex flex-col gap-0">
              {visibleActivity.map((a) => {
                const Icon = TYPE_ICON[a.type] || Activity;
                return (
                  <div key={a._id} className="flex items-start gap-3 py-2.5 border-b border-border/30 last:border-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLOR[a.type]}`}>
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-snug">
                        <span className="font-bold">{a.farmerName}</span> — {a.action}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.hamlet} • {formatDateTime(a.createdAt)}</p>
                    </div>
                    <button onClick={() => markAsRead(a._id)} className="text-base font-bold text-muted-foreground hover:text-success shrink-0 self-center px-1">
                      ✓
                    </button>
                  </div>
                );
              })}
            </div>
            {activityFeed.length > 8 && (
              <button onClick={() => setShowAllActivity(!showAllActivity)} className="text-xs text-primary underline mt-2 w-full text-center">
                {showAllActivity ? "குறைக்கவும்" : `அனைத்தும் காட்டு (${activityFeed.length})`}
              </button>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default CrpDashboardTab;
