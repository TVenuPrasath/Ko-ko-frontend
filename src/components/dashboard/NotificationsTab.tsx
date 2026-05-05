import { useEffect, useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";

const NotificationsTab = () => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api.getNotifications().then(setNotifications).catch(() => {});
  }, []);

  const typeConfig: Record<string, { label: string; className: string }> = {
    disease: { label: t("diseaseAlert"), className: "bg-danger text-danger-foreground" },
    market:  { label: t("marketPrice"), className: "bg-success text-success-foreground" },
    tip:     { label: t("farmingTip"),  className: "bg-primary text-primary-foreground" },
  };

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <span className="text-5xl mb-4">🔔</span>
        <p className="text-lg">{t("noNotifications")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((n) => {
        const config = typeConfig[n.type] ?? { label: n.type, className: "bg-muted text-foreground" };
        return (
          <Card key={n._id} className="p-4 bg-card">
            <div className="flex items-start justify-between mb-2">
              <Badge className={config.className}>{config.label}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
            </div>
            <p className="text-base text-foreground leading-relaxed">{n.message}</p>
          </Card>
        );
      })}
    </div>
  );
};

export default NotificationsTab;
