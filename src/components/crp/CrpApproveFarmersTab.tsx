import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HAMLETS } from "@/lib/auth";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface PendingFarmer {
  id: string;
  name: string;
  phone: string;
  hamlet: string;
  houseNo: string;
  street: string;
  status: "pending" | "approved" | "rejected";
}

const seedPending = (): PendingFarmer[] => [
  { id: "p1", name: "ராதா K", phone: "9876511111", hamlet: HAMLETS[0], houseNo: "12/A", street: "மெயின் தெரு", status: "pending" },
  { id: "p2", name: "சுமதி R", phone: "9876522222", hamlet: HAMLETS[1], houseNo: "45", street: "புதிய தெரு", status: "pending" },
  { id: "p3", name: "வள்ளி M", phone: "9876533333", hamlet: HAMLETS[2], houseNo: "8", street: "கோயில் தெரு", status: "pending" },
  { id: "p4", name: "கல்யாணி S", phone: "9876544444", hamlet: HAMLETS[0], houseNo: "23/B", street: "ஆலமர தெரு", status: "pending" },
];

const CrpApproveFarmersTab = () => {
  const { t } = useLanguage();
  const [list, setList] = useState<PendingFarmer[]>(seedPending());

  const update = (id: string, status: "approved" | "rejected") => {
    setList((l) => l.map((f) => (f.id === id ? { ...f, status } : f)));
    toast.success(status === "approved" ? t("farmerApproved") : t("farmerRejected"));
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-center text-foreground">{t("addNewMembers")}</h2>

      <div className="flex flex-col gap-3">
        {list.map((f) => (
          <Card key={f.id} className="p-4 bg-card">
            <div className="flex items-start gap-3">
              <div className="flex-1 border border-input rounded-md p-3 italic text-sm">
                <p className="not-italic font-bold text-foreground">{f.name}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{f.phone}</p>
                <p className="text-muted-foreground text-xs">{f.houseNo}, {f.street}</p>
                <p className="text-muted-foreground text-xs">{f.hamlet}</p>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {f.status === "pending" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() => update(f.id, "approved")}
                      className="bg-success text-success-foreground gap-1"
                    >
                      <Check size={14} /> {t("approve")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => update(f.id, "rejected")}
                      variant="outline"
                      className="border-danger text-danger gap-1"
                    >
                      <X size={14} /> {t("reject")}
                    </Button>
                  </>
                ) : (
                  <Badge
                    className={f.status === "approved" ? "bg-success text-success-foreground" : "bg-danger text-danger-foreground"}
                  >
                    {f.status === "approved" ? t("approved") : t("rejected")}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}

        {list.filter((f) => f.status === "pending").length === 0 && (
          <p className="text-sm text-center text-muted-foreground">✅ {t("done")}</p>
        )}
      </div>
    </div>
  );
};

export default CrpApproveFarmersTab;
