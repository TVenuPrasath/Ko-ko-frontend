import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

const CrpApproveFarmersTab = () => {
  const { t } = useLanguage();
  const [farmers, setFarmers] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<Record<string, "approved" | "rejected">>({});

  useEffect(() => {
    api.getFarmers().then(setFarmers).catch(() => {});
  }, []);

  const update = (id: string, status: "approved" | "rejected") => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
    toast.success(status === "approved" ? t("farmerApproved") : t("farmerRejected"));
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-center text-foreground">{t("addNewMembers")}</h2>

      {farmers.length === 0 && (
        <p className="text-sm text-center text-muted-foreground">நிலுவையில் உள்ள விண்ணப்பங்கள் இல்லை</p>
      )}

      <div className="flex flex-col gap-3">
        {farmers.map((f) => {
          const status = statuses[f._id] ?? (f.approved ? "approved" : null);
          return (
            <Card key={f._id} className="p-4 bg-card">
              <div className="flex items-start gap-3">
                <div className="flex-1 border border-input rounded-md p-3 text-sm">
                  <p className="font-bold text-foreground">{f.name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{f.phone}</p>
                  <p className="text-muted-foreground text-xs">{f.hamlet}</p>
                  <p className="text-muted-foreground text-xs">{f.shg_name}</p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {status === "approved" ? (
                    <Badge className="bg-success text-success-foreground">{t("approved")}</Badge>
                  ) : status === "rejected" ? (
                    <Badge className="bg-danger text-danger-foreground">{t("rejected")}</Badge>
                  ) : (
                    <>
                      <Button size="sm" onClick={() => update(f._id, "approved")} className="bg-success text-success-foreground gap-1">
                        <Check size={14} /> {t("approve")}
                      </Button>
                      <Button size="sm" onClick={() => update(f._id, "rejected")} variant="outline" className="border-danger text-danger gap-1">
                        <X size={14} /> {t("reject")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CrpApproveFarmersTab;
