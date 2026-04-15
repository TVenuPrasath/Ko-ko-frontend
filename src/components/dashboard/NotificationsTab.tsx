import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getNotifications, formatDate } from "@/lib/mockData";
import { Share2 } from "lucide-react";

const NotificationsTab = () => {
  const { t } = useLanguage();
  const notifications = getNotifications();

  const typeConfig = {
    disease: { label: t("diseaseAlert"), className: "bg-danger text-danger-foreground" },
    market: { label: t("marketPrice"), className: "bg-success text-success-foreground" },
    tip: { label: t("farmingTip"), className: "bg-primary text-primary-foreground" },
  };

  const handleShare = (message: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
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
        const config = typeConfig[n.type];
        return (
          <Card key={n.id} className="p-4 bg-card">
            <div className="flex items-start justify-between mb-2">
              <Badge className={config.className}>{config.label}</Badge>
              <span className="text-xs text-muted-foreground">{formatDate(n.createdAt)}</span>
            </div>
            <p className="text-base text-foreground mb-3 leading-relaxed">{n.message}</p>
            <Button
              onClick={() => handleShare(n.message)}
              variant="outline"
              className="tap-target gap-2 text-success border-success"
              size="sm"
            >
              <Share2 size={16} /> WhatsApp {t("share")}
            </Button>
          </Card>
        );
      })}
    </div>
  );
};

export default NotificationsTab;
