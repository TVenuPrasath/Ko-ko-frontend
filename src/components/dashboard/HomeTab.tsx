import { useLanguage } from "@/i18n/LanguageContext";
import { User } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import {
  getLatestBirdTotal,
  getVaccinationDaysLeft,
  getDewormingDaysLeft,
  hasSubmittedThisWeek,
  formatDate,
} from "@/lib/mockData";
import { Bird, Syringe, Bug, ClipboardCheck, AlertTriangle } from "lucide-react";

interface HomeTabProps {
  user: User;
}

const HomeTab = ({ user }: HomeTabProps) => {
  const { t } = useLanguage();
  const totalBirds = getLatestBirdTotal();
  const vacDays = getVaccinationDaysLeft();
  const dewDays = getDewormingDaysLeft();
  const weekDone = hasSubmittedThisWeek();

  const getStatusColor = (days: number) => {
    if (days < 0) return "bg-danger text-danger-foreground";
    if (days <= 14) return "bg-warning text-warning-foreground";
    return "bg-success text-success-foreground";
  };

  const getStatusText = (days: number) => {
    if (days < 0) return t("overdue");
    return `${days} ${t("daysLeft")}`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome Card */}
      <Card className="bg-primary text-primary-foreground p-5 rounded-xl">
        <p className="text-xl font-bold">{t("hello")}, {user.name} 👋</p>
        <p className="text-sm opacity-90 mt-1">{user.hamlet}</p>
        <p className="text-sm opacity-80">{t("today")}: {formatDate(new Date().toISOString())}</p>
      </Card>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 flex flex-col items-center text-center bg-card">
          <Bird size={28} className="text-primary mb-2" />
          <p className="text-2xl font-bold text-foreground">{totalBirds}</p>
          <p className="text-sm text-muted-foreground">{t("totalBirds")}</p>
        </Card>
        <Card className={`p-4 flex flex-col items-center text-center ${getStatusColor(vacDays)}`}>
          <Syringe size={28} className="mb-2" />
          <p className="text-lg font-bold">{getStatusText(vacDays)}</p>
          <p className="text-sm opacity-90">{t("vaccination")}</p>
        </Card>
        <Card className={`p-4 flex flex-col items-center text-center ${getStatusColor(dewDays)}`}>
          <Bug size={28} className="mb-2" />
          <p className="text-lg font-bold">{getStatusText(dewDays)}</p>
          <p className="text-sm opacity-90">{t("deworming")}</p>
        </Card>
        <Card className={`p-4 flex flex-col items-center text-center ${weekDone ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}`}>
          <ClipboardCheck size={28} className="mb-2" />
          <p className="text-lg font-bold">{weekDone ? "✅" : "⚠️"}</p>
          <p className="text-sm opacity-90">{t("thisWeeksUpdate")}</p>
        </Card>
      </div>

      {/* Alert Banners */}
      {!weekDone && (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-lg p-4">
          <AlertTriangle className="text-warning shrink-0" size={22} />
          <p className="text-sm font-medium text-foreground">{t("submitWeeklyAlert")}</p>
        </div>
      )}
      {vacDays < 0 && (
        <div className="flex items-center gap-3 bg-danger/10 border border-danger/30 rounded-lg p-4">
          <AlertTriangle className="text-danger shrink-0" size={22} />
          <p className="text-sm font-medium text-foreground">{t("vaccinationOverdue")}</p>
        </div>
      )}
      {dewDays < 0 && (
        <div className="flex items-center gap-3 bg-danger/10 border border-danger/30 rounded-lg p-4">
          <AlertTriangle className="text-danger shrink-0" size={22} />
          <p className="text-sm font-medium text-foreground">{t("dewormingOverdue")}</p>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
