import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { User, clearUser } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard, Users, Wrench, Bell, ShoppingCart, FileText, LogOut, Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import CrpDashboardTab from "./CrpDashboardTab";
import CrpFarmersTab from "./CrpFarmersTab";
import CrpServicesTab from "./CrpServicesTab";
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
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<CrpTab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleLogout = () => {
    clearUser();
    onLogout();
  };

  const tabs: { key: CrpTab; icon: typeof LayoutDashboard; label: string }[] = [
    { key: "dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { key: "farmers", icon: Users, label: t("farmers") },
    { key: "reports", icon: FileText, label: t("reports") },
    { key: "sms", icon: Bell, label: t("sendSms") },
    { key: "buyers", icon: ShoppingCart, label: t("buyers") },
    { key: "approve", icon: Wrench, label: t("addNewMembers") },
    { key: "alerts", icon: Bell, label: t("alerts") },
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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar (desktop) */}
      {!isMobile && (
        <aside className={`${sidebarOpen ? "w-56" : "w-14"} bg-card border-r border-border flex flex-col transition-all duration-200 shrink-0`}>
          <div className="p-3 border-b border-border flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="shrink-0">
              <Menu size={20} />
            </Button>
            {sidebarOpen && <span className="text-sm font-bold text-foreground truncate">CRP Panel</span>}
          </div>
          <nav className="flex-1 py-2">
            {tabs.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors ${
                  tab === key ? "bg-primary/10 text-primary border-r-2 border-primary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && <span>{label}</span>}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-border">
            <button onClick={handleLogout} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground w-full px-1 py-2">
              <LogOut size={18} />
              {sidebarOpen && <span>{t("logout")}</span>}
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground leading-tight">கோழி கண்காணிப்பு</h1>
            <p className="text-xs text-muted-foreground">CRP Dashboard</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">{user.name}</span>
            {isMobile && (
              <button onClick={handleLogout} className="text-muted-foreground p-1">
                <LogOut size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className={`flex-1 overflow-y-auto p-4 ${isMobile ? "pb-24" : ""}`}>
          {renderContent()}
        </main>
      </div>

      {/* Bottom Nav (mobile) */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-10">
          <div className="flex">
            {tabs.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 ${
                  tab === key ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon size={18} />
                <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
};

export default CrpDashboard;
