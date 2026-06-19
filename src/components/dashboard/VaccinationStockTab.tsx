import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Syringe, Loader2, Info } from "lucide-react";

const CATEGORIES = [
  { key: "week0",  tamil: "1 வார வயதுக்குள்",  vaccine: "F Strain Vaccine" },
  { key: "week2",  tamil: "2 - 3 வார வயது",     vaccine: "IBD Vaccine" },
  { key: "week4",  tamil: "4 - 5 வார வயது",     vaccine: "LaSota Vaccine" },
  { key: "week6",  tamil: "6 - 7 வார வயது",     vaccine: "Fowl Pox Vaccine" },
  { key: "week8",  tamil: "8 - 9 வார வயது",     vaccine: "Dewormer" },
  { key: "week10", tamil: "10 - 11 வார வயது",   vaccine: "R2B + Dewormer" },
  { key: "week12", tamil: "12 - 13 வார வயது",   vaccine: "Multivitamins" },
  { key: "month4", tamil: "4 மாதங்கள் ஆனவை",   vaccine: "Monitor (Booster Soon)" },
  { key: "month5", tamil: "5 மாதங்கள் ஆனவை",   vaccine: "R2B Booster + Dewormer" },
];

const VaccinationStockTab = () => {
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState<Record<string, string>>({});

  const { data: existing, isLoading } = useQuery({
    queryKey: ["vaccination-stock"],
    queryFn: () => api.getVaccinationStock(),
    staleTime: 30_000,
    onSuccess: (data: any) => {
      if (data && Object.keys(data).length > 0) {
        const prefilled: Record<string, string> = {};
        CATEGORIES.forEach(({ key }) => {
          prefilled[key] = data[key] > 0 ? String(data[key]) : "";
        });
        setCounts(prefilled);
      }
    },
  });

  const handleSubmit = async () => {
    const body: Record<string, number> = {};
    CATEGORIES.forEach(({ key }) => {
      body[key] = parseInt(counts[key] || "0") || 0;
    });

    const hasAny = Object.values(body).some((v) => v > 0);
    if (!hasAny) {
      toast.error(lang === "ta" ? "குறைந்தது ஒரு வகையை நிரப்பவும்" : "Please enter at least one count");
      return;
    }

    setLoading(true);
    try {
      await api.submitVaccinationStock(body);
      queryClient.invalidateQueries({ queryKey: ["vaccination-stock"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread"] });
      toast.success(lang === "ta" ? "இருப்பு சமர்ப்பிக்கப்பட்டது ✅" : "Stock submitted successfully ✅");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-border/60 p-4 animate-pulse h-16" />
        ))}
      </div>
    );
  }

  const lastUpdated = existing?.updatedAt
    ? new Date(existing.updatedAt).toLocaleDateString("ta-IN")
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground">
            {lang === "ta" ? "தடுப்பூசி இருப்பு பதிவு" : "Vaccination Stock Entry"}
          </h2>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {lang === "ta" ? `கடைசி புதுப்பிப்பு: ${lastUpdated}` : `Last updated: ${lastUpdated}`}
            </p>
          )}
        </div>
        <Syringe size={22} className="text-primary" />
      </div>

      <Card className="p-3 bg-primary/5 border-primary/20 flex items-start gap-2">
        <Info size={15} className="text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-primary leading-relaxed">
          {lang === "ta"
            ? "உங்கள் கோழிகளின் வயது வகை வாரியாக எண்ணிக்கையை பதிவு செய்யவும். சமர்ப்பித்த உடனே தொடர்புடைய தடுப்பூசி அறிவிப்பு வழங்கப்படும்."
            : "Enter your bird count by age category. You will receive immediate vaccination reminders after submitting."}
        </p>
      </Card>

      <div className="flex flex-col gap-2">
        {CATEGORIES.map(({ key, tamil, vaccine }) => (
          <Card key={key} className="p-3 bg-card border-border/60">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{tamil}</p>
                <p className="text-xs text-muted-foreground">{vaccine}</p>
              </div>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={counts[key] ?? ""}
                onChange={(e) => setCounts((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder="0"
                className="w-20 text-center font-bold text-base"
              />
            </div>
          </Card>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground tap-target"
      >
        {loading ? <Loader2 className="animate-spin" size={18} /> : (lang === "ta" ? "சமர்ப்பி" : "Submit Stock")}
      </Button>
    </div>
  );
};

export default VaccinationStockTab;
