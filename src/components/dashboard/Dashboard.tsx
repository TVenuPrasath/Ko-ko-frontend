import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { User, clearUser } from "@/lib/auth";
import { Home, ClipboardList, Bug, Bell, LogOut, History, IndianRupee } from "lucide-react";
import HomeTab from "./HomeTab";
import WeeklyUpdateTab from "./WeeklyUpdateTab";
import DiseaseReportTab from "./DiseaseReportTab";
import NotificationsTab from "./NotificationsTab";
import VaccinationHistoryTab from "./VaccinationHistoryTab";
import MarketPricesTab from "./MarketPricesTab";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type Tab = "home" | "weekly" | "disease" | "history" | "prices" | "notifications";

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<Tab>("home");

  const handleLogout = () => {
    clearUser();
    onLogout();
  };

  const tabs: { key: Tab; icon: typeof Home; label: string }[] = [
    { key: "home", icon: Home, label: t("home") },
    { key: "weekly", icon: ClipboardList, label: t("weeklyUpdate") },
    { key: "history", icon: History, label: "தடுப்பூசி" },
    { key: "prices", icon: IndianRupee, label: "சந்தை விலை" },
    { key: "notifications", icon: Bell, label: t("notifications") },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">கோ-கோ செயலி</h1>
          <p className="text-xs text-muted-foreground">கோணாங்கிப்பட்டி கோழி செயலி</p>
        </div>
        <button onClick={handleLogout} className="text-muted-foreground p-1">
          <LogOut size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {tab === "home" && <HomeTab user={user} onNavigate={(t) => setTab(t)} />}
        {tab === "weekly" && <WeeklyUpdateTab />}
        {tab === "disease" && <DiseaseReportTab user={user} />}
        {tab === "history" && <VaccinationHistoryTab />}
        {tab === "prices" && <MarketPricesTab />}
        {tab === "notifications" && <NotificationsTab />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-10">
        <div className="max-w-[430px] mx-auto flex">
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex flex-col items-center py-2 gap-1 tap-target ${
                tab === key ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
