import { useLanguage } from "@/i18n/LanguageContext";
import { User } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { hasSubmittedThisWeek } from "@/lib/mockData";
import { ClipboardList, Bug, Bird, AlertTriangle } from "lucide-react";

interface HomeTabProps {
  user: User;
  onNavigate?: (tab: "weekly" | "disease" | "notifications") => void;
}

const HomeTab = ({ user, onNavigate }: HomeTabProps) => {
  const { t } = useLanguage();
  const weekDone = hasSubmittedThisWeek();

  const cards: { key: "weekly" | "disease"; titleTa: string; titleEn: string; icon: typeof Bird; color: string }[] = [
    { key: "weekly", titleTa: t("birdsUpdate"), titleEn: "(Birds update)", icon: Bird, color: "text-primary" },
    { key: "weekly", titleTa: t("servicesNeededTitle"), titleEn: "(Service update)", icon: ClipboardList, color: "text-warning" },
    { key: "disease", titleTa: t("reportDisease"), titleEn: "(Report diseases)", icon: Bug, color: "text-danger" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome */}
      <Card className="bg-primary text-primary-foreground p-4 rounded-xl">
        <p className="text-base font-bold">{t("hello")}, {user.name}</p>
        <p className="text-xs opacity-90 mt-0.5">{user.hamlet}{user.shgName ? ` • ${user.shgName}` : ""}</p>
      </Card>

      <p className="text-sm italic text-muted-foreground text-center">{t("dashboardEn")}</p>

      {/* Action cards */}
      {cards.map((c, i) => (
        <Card
          key={i}
          onClick={() => onNavigate?.(c.key)}
          className="p-5 bg-card cursor-pointer hover:bg-muted/40 transition-colors border-2"
        >
          <div className="flex items-center gap-4">
            <c.icon size={28} className={c.color + " shrink-0"} />
            <div className="flex-1">
              <p className="text-base font-bold text-foreground leading-tight">{c.titleTa}</p>
              <p className="text-xs italic text-muted-foreground mt-0.5">{c.titleEn}</p>
            </div>
          </div>
        </Card>
      ))}

      {/* Alert ticker */}
      <Card className="p-4 bg-warning/10 border-warning/40 border-2">
        <p className="text-xs italic text-muted-foreground mb-1">{t("alertMessageDisplay")}</p>
        <div className="flex items-center gap-2">
          <AlertTriangle className="text-warning shrink-0" size={20} />
          <p className="text-base font-bold text-foreground">{t("attention")}</p>
        </div>
        <div className="mt-2 overflow-hidden">
          <p className="text-sm text-foreground whitespace-nowrap animate-marquee">
            {weekDone
              ? "📢 இந்த வாரம் நல்ல வளர்ச்சி • சந்தை விலை: ₹180/kg • தடுப்பூசி நினைவில் கொள்ளவும்"
              : "⚠️ உங்கள் வாராந்திர புதுப்பிப்பை சமர்ப்பிக்கவும் • " + t("submitWeeklyAlert")}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default HomeTab;
