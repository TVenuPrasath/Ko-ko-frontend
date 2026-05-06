import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { User } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { ClipboardList, Bug, Bird, AlertTriangle, History, IndianRupee } from "lucide-react";

type NavTab = "weekly" | "disease" | "notifications" | "history" | "prices" | "loan";

interface HomeTabProps {
  user: User;
  onNavigate?: (tab: NavTab) => void;
}

const HomeTab = ({ user, onNavigate }: HomeTabProps) => {
  const { t } = useLanguage();
  const [weekDone, setWeekDone] = useState(false);
  const [marketPrice, setMarketPrice] = useState<any>(null);

  useEffect(() => {
    api.checkWeekSubmitted().then((r) => setWeekDone(r.submitted)).catch(() => {});
    api.getMarketPrice().then(setMarketPrice).catch(() => {});
  }, []);

  const cards: { key: NavTab; titleTa: string; titleEn: string; icon: typeof Bird; color: string }[] = [
    { key: "weekly",  titleTa: t("birdsUpdate"),        titleEn: "(Birds update)",        icon: Bird,        color: "text-primary" },
    { key: "loan",    titleTa: t("servicesNeededTitle"), titleEn: "(Services & Loan)",     icon: ClipboardList, color: "text-primary" },
    { key: "disease", titleTa: t("reportDisease"),       titleEn: "(Report diseases)",     icon: Bug,         color: "text-danger" },
    { key: "history", titleTa: "தடுப்பூசி வரலாறு",       titleEn: "(Vaccination History)", icon: History,     color: "text-success" },
    { key: "prices",  titleTa: "சந்தை விலை",             titleEn: "(Market Prices)",       icon: IndianRupee, color: "text-primary" },
  ];

  const tickerText = weekDone
    ? `📢 இந்த வாரம் நல்ல வளர்ச்சி • சந்தை விலை: ₹${marketPrice?.broiler ?? "—"}/kg • தடுப்பூசி நினைவில் கொள்ளவும்`
    : `⚠️ உங்கள் வாராந்திர புதுப்பிப்பை சமர்ப்பிக்கவும் • ${t("submitWeeklyAlert")}`;

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome */}
      <Card className="bg-primary text-primary-foreground p-4 rounded-xl">
        <p className="text-base font-bold">{t("hello")}, {user.name}</p>
        <p className="text-xs opacity-90 mt-0.5">{user.hamlet}{user.shgName ? ` • ${user.shgName}` : ""}</p>
        {weekDone && (
          <p className="text-xs mt-1 opacity-80">✅ இந்த வாரம் புதுப்பிப்பு சமர்ப்பிக்கப்பட்டது</p>
        )}
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
            {c.key === "weekly" && !weekDone && (
              <span className="text-xs bg-warning/20 text-warning font-bold px-2 py-1 rounded">புதுப்பி</span>
            )}
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
            {tickerText}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default HomeTab;
