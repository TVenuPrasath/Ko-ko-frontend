import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { User, clearUser } from "@/lib/auth";
import { Home, ClipboardList, Bug, Bell, LogOut } from "lucide-react";
import HomeTab from "./HomeTab";
import WeeklyUpdateTab from "./WeeklyUpdateTab";
import DiseaseReportTab from "./DiseaseReportTab";
import NotificationsTab from "./NotificationsTab";

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type Tab = "home" | "weekly" | "disease" | "notifications";

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
    { key: "disease", icon: Bug, label: t("diseaseReport") },
    { key: "notifications", icon: Bell, label: t("notifications") },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">கோழி கண்காணிப்பு</h1>
          <p className="text-xs text-muted-foreground">Poultry Tracker</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleLogout} className="text-muted-foreground p-1">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {tab === "home" && <HomeTab user={user} />}
        {tab === "weekly" && <WeeklyUpdateTab />}
        {tab === "disease" && <DiseaseReportTab user={user} />}
        {tab === "notifications" && <NotificationsTab />}
      </main>

      {/* Bottom Navigation */}
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
              <Icon size={22} />
              <span className="text-xs font-medium leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
