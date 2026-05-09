import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { Bell, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react";

const NotificationsTab = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(() => {});
  }, []);

  const typeConfig: Record<string, { label: string; className: string; icon: typeof Bell; iconColor: string; bg: string }> = {
    disease: { label: t("diseaseAlert"), className: "bg-danger text-danger-foreground", icon: AlertTriangle, iconColor: "text-danger", bg: "bg-danger/8" },
    market:  { label: t("marketPrice"),  className: "bg-success text-success-foreground", icon: TrendingUp,   iconColor: "text-success", bg: "bg-success/8" },
    tip:     { label: t("farmingTip"),   className: "bg-primary text-primary-foreground", icon: Lightbulb,    iconColor: "text-primary", bg: "bg-primary/8" },
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-4">
          <Bell size={36} className="text-muted-foreground/50" />
        </div>
        <p className="text-base font-semibold text-foreground">{t("noNotifications")}</p>
        <p className="text-sm text-muted-foreground mt-1">புதிய அறிவிப்புகள் இங்கே தெரியும்</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((n) => {
        const config = typeConfig[n.type] ?? { label: n.type, className: "bg-muted text-foreground", icon: Bell, iconColor: "text-muted-foreground", bg: "bg-muted/20" };
        const Icon = config.icon;
        return (
          <div key={n._id} className="bg-white rounded-2xl border border-border/60 shadow-sm p-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon size={18} className={config.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge className={`${config.className} text-xs`}>{config.label}</Badge>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{n.message}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationsTab;
