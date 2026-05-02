import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { User, clearUser } from "@/lib/auth";
import {
  LayoutDashboard, Users, Bell, ShoppingCart, FileText, LogOut, UserPlus, AlertTriangle,
} from "lucide-react";
import CrpDashboardTab from "./CrpDashboardTab";
import CrpFarmersTab from "./CrpFarmersTab";
import CrpAlertsTab from "./CrpAlertsTab";
import CrpBuyersTab from "./CrpBuyersTab";
import CrpReportsTab from "./CrpReportsTab";
import CrpSendSmsTab from "./CrpSendSmsTab";
import CrpApproveFarmersTab from "./CrpApproveFarmersTab";

interface CrpDashboardProps {
  user: User;
  onLogout: () => void;
}

type CrpTab = "dashboard" | "farmers" | "alerts" | "sms" | "buyers" | "approve" | "reports";

const CrpDashboard = ({ user, onLogout }: CrpDashboardProps) => {
  const { t } = useLanguage();
  const [tab, setTab] = useState<CrpTab>("dashboard");

  const handleLogout = () => {
    clearUser();
    onLogout();
  };

  const tabs: { key: CrpTab; icon: typeof LayoutDashboard; label: string }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { key: "farmers", icon: Users, label: t("farmers") },
    { key: "sms", icon: Bell, label: t("sendSms") },
    { key: "buyers", icon: ShoppingCart, label: t("buyers") },
    { key: "reports", icon: FileText, label: t("reports") },
  ];

  const handleNavigate = (target: "reports" | "alerts" | "buyers" | "approve") => {
    if (target === "alerts") setTab("sms");
    else setTab(target as CrpTab);
  };

  const renderContent = () => {
    switch (tab) {
      case "dashboard": return <CrpDashboardTab onNavigate={handleNavigate} />;
      case "farmers": return <CrpFarmersTab />;
      case "alerts": return <CrpAlertsTab />;
      case "sms": return <CrpSendSmsTab />;
      case "buyers": return <CrpBuyersTab />;
      case "approve": return <CrpApproveFarmersTab />;
      case "reports": return <CrpReportsTab />;
    }
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">கோ-கோ செயலி</h1>
          <p className="text-xs text-muted-foreground">CRP - {user.name}</p>
        </div>
        <button onClick={handleLogout} className="text-muted-foreground p-1">
          <LogOut size={20} />
        </button>
      </header>

      {/* Secondary quick actions row (approve / alerts) */}
      <div className="px-4 pt-3 flex gap-2">
        <button
          onClick={() => setTab("approve")}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-medium border ${
            tab === "approve" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
          }`}
        >
          <UserPlus size={14} /> {t("addNewMembers")}
        </button>
        <button
          onClick={() => setTab("alerts")}
          className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-md text-xs font-medium border ${
            tab === "alerts" ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground border-border"
          }`}
        >
          <AlertTriangle size={14} /> {t("alerts")}
        </button>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        {renderContent()}
      </main>

      {/* Bottom Nav */}
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
              <Icon size={18} />
              <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default CrpDashboard;
