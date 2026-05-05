import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const WeeklyUpdateTab = () => {
  const { t } = useLanguage();

  const [chicks, setChicks] = useState(0);
  const [growers, setGrowers] = useState(0);
  const [layers, setLayers] = useState(0);
  const [saleBroiler, setSaleBroiler] = useState(0);
  const [saleChicks, setSaleChicks] = useState(0);
  const [saleEggs, setSaleEggs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const saleTotal = saleBroiler + saleChicks + saleEggs;
  const [pastUpdates, setPastUpdates] = useState<any[]>([]);

  useEffect(() => {
    api.getBirdUpdates().then(setPastUpdates).catch(() => {});
  }, [refreshKey]);

  const total = chicks + growers + layers;

  const Counter = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="w-9 h-9 rounded-md bg-muted flex items-center justify-center active:bg-muted/70"
      >
        <Minus size={16} />
      </button>
      <span className="w-12 text-center text-lg font-bold text-foreground border border-input rounded-md py-1.5">{value}</span>
      <button
        onClick={() => onChange(value + 1)}
        className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center active:opacity-80"
      >
        <Plus size={16} />
      </button>
    </div>
  );

  const Row = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between py-2 gap-3">
      <span className="text-sm text-foreground flex-1 leading-tight">{label}</span>
      <Counter value={value} onChange={onChange} />
    </div>
  );

  const handleSubmitBirds = async () => {
    setLoading(true);
    try {
      await api.submitBirdUpdate({ chicks, growers, layers, broilers: saleBroiler });
      toast.success(t("updateSubmitted") + " ✅");
      setChicks(0); setGrowers(0); setLayers(0);
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSale = async () => {
    setSaleLoading(true);
    try {
      await api.submitBirdUpdate({ chicks: 0, growers: 0, layers: 0, broilers: saleBroiler, saleChicks, saleEggs });
      toast.success("விற்பனை தகவல் சேமிக்கப்பட்டது ✅");
      setSaleBroiler(0); setSaleChicks(0); setSaleEggs(0);
    } catch (err: any) {
      toast.error(err.message || "Submit failed");
    } finally {
      setSaleLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5" key={refreshKey}>
      <Card className="p-4 bg-card">
        <div className="text-center mb-3">
          <h2 className="text-base font-bold text-foreground">{t("birdsUpdate")}</h2>
          <p className="text-xs italic text-muted-foreground">{t("birdsUpdateEn")}</p>
        </div>
        <Row label={`1. ${t("chicks")}`} value={chicks} onChange={setChicks} />
        <Row label={`2. ${t("growers")}`} value={growers} onChange={setGrowers} />
        <Row label={`3. ${t("layers")}`} value={layers} onChange={setLayers} />
        <div className="border-t border-border pt-2 mt-1">
          <p className="text-sm font-bold text-foreground text-right">{t("total")}: {total}</p>
        </div>
        <Button
          onClick={handleSubmitBirds}
          disabled={total === 0 || loading}
          className="tap-target w-full text-lg font-semibold mt-3 bg-primary text-primary-foreground"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : "கோழி எண்ணிக்கை சேமி"}
        </Button>
      </Card>

      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">{t("saleableReady")}</h3>
        <Row label={`1. ${t("broilerChicken")}`} value={saleBroiler} onChange={setSaleBroiler} />
        <Row label={`2. ${t("youngChicks")}`} value={saleChicks} onChange={setSaleChicks} />
        <Row label={`3. ${t("eggs")}`} value={saleEggs} onChange={setSaleEggs} />
        <div className="border-t border-border pt-2 mt-1">
          <p className="text-sm font-bold text-foreground text-right">{t("total")}: {saleTotal}</p>
        </div>
        <Button
          onClick={handleSubmitSale}
          disabled={saleTotal === 0 || saleLoading}
          className="tap-target w-full text-lg font-semibold mt-3 bg-success text-success-foreground"
        >
          {saleLoading ? <Loader2 className="animate-spin" size={20} /> : "விற்பனை தகவல் சேமி"}
        </Button>
      </Card>

      {pastUpdates.length > 0 && (
        <Card className="p-4 bg-card">
          <h2 className="text-base font-bold mb-3 text-foreground">{t("pastUpdates")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">{t("week")}</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">{t("chicks")}</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">{t("growers")}</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">{t("layers")}</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">{t("total")}</th>
                </tr>
              </thead>
              <tbody>
                {pastUpdates.map((u) => (
                  <tr key={u._id} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{formatDate(u.weekDate)}</td>
                    <td className="text-center py-2">{u.chicks}</td>
                    <td className="text-center py-2">{u.growers}</td>
                    <td className="text-center py-2">{u.layers}</td>
                    <td className="text-center py-2 font-bold">{u.chicks + u.growers + u.layers + u.broilers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default WeeklyUpdateTab;
