import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { User, clearUser } from "@/lib/auth";
import {
  LayoutDashboard, Users, Bell, FileText, LogOut, ClipboardList, ShoppingBag,
} from "lucide-react";
import CrpDashboardTab from "./CrpDashboardTab";
import CrpFarmersTab from "./CrpFarmersTab";
import CrpAlertsTab from "./CrpAlertsTab";
import CrpReportsTab from "./CrpReportsTab";
import CrpApproveFarmersTab from "./CrpApproveFarmersTab";
import CrpServicesTab from "./CrpServicesTab";
import CrpStockTab from "./CrpStockTab";

interface CrpDashboardProps {
  user: User;
  onLogout: () => void;
}

type CrpTab = "dashboard" | "farmers" | "alerts" | "services" | "approve" | "reports" | "stock";

const CrpDashboard = ({ user, onLogout }: CrpDashboardProps) => {
  const { t, lang, setLang } = useLanguage();
  const [tab, setTab] = useState<CrpTab>("dashboard");

  const handleLogout = () => {
    clearUser();
    onLogout();
  };

  const tabs: { key: CrpTab; icon: typeof LayoutDashboard; label: string }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { key: "farmers",   icon: Users,           label: t("farmers") },
    { key: "services",  icon: ClipboardList,   label: t("services") },
    { key: "stock",     icon: ShoppingBag,  label: "இருப்பு" },
    { key: "alerts",    icon: Bell,         label: t("alerts") },
    { key: "reports",   icon: FileText,     label: t("reports") },
  ];

  const handleNavigate = (target: "reports" | "alerts" | "services" | "approve") => {
    setTab(target as CrpTab);
  };

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return <CrpDashboardTab onNavigate={handleNavigate} />;
      case "farmers":   return <CrpFarmersTab />;
      case "alerts":    return <CrpAlertsTab user={user} />;
      case "services":  return <CrpServicesTab user={user} />;
      case "stock":     return <CrpStockTab />;
      case "approve":   return <CrpApproveFarmersTab />;
      case "reports":   return <CrpReportsTab />;
    }
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg flex flex-col">
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">கோ-கோ செயலி</h1>
          <p className="text-xs text-muted-foreground">CRP - {user.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "ta" ? "en" : "ta")}
            className="text-xs font-bold border border-border rounded-md px-2 py-1 text-muted-foreground hover:text-foreground"
          >
            {lang === "ta" ? "EN" : "தமிழ்"}
          </button>
          <button onClick={handleLogout} className="text-muted-foreground p-1">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-10">
        <div className="max-w-[430px] mx-auto flex">
          {tabs.map(({ key, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex flex-col items-center py-3 ${
                tab === key ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} />
              {tab === key && <div className="w-4 h-0.5 bg-primary rounded-full mt-1" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CrpDashboard;
