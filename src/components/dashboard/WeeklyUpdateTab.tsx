import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { addBirdUpdate, getBirdUpdates, formatDate } from "@/lib/mockData";
import { Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const WeeklyUpdateTab = () => {
  const { t } = useLanguage();
  const [chicks, setChicks] = useState(0);
  const [growers, setGrowerCount] = useState(0);
  const [layers, setLayers] = useState(0);
  const [broilers, setBroilers] = useState(0);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Record<string, { checked: boolean; qty: number }>>({
    vaccination: { checked: false, qty: 0 },
    deworming: { checked: false, qty: 0 },
    feedStock: { checked: false, qty: 0 },
    loan: { checked: false, qty: 0 },
    equipment: { checked: false, qty: 0 },
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const total = chicks + growers + layers + broilers;

  const Counter = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-base font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-11 h-11 rounded-full bg-muted flex items-center justify-center active:bg-muted/70"
        >
          <Minus size={18} />
        </button>
        <span className="w-12 text-center text-xl font-bold text-foreground">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:opacity-80"
        >
          <Plus size={18} />
        </button>
      </div>
    </div>
  );

  const toggleService = (key: string) => {
    setServices((prev) => ({
      ...prev,
      [key]: { ...prev[key], checked: !prev[key].checked },
    }));
  };

  const setServiceQty = (key: string, qty: number) => {
    setServices((prev) => ({
      ...prev,
      [key]: { ...prev[key], qty },
    }));
  };

  const serviceLabels: Record<string, string> = {
    vaccination: t("vaccinationService"),
    deworming: t("dewormingService"),
    feedStock: t("feedStock"),
    loan: t("loan"),
    equipment: t("equipment"),
  };

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addBirdUpdate({ chicks, growers, layers, broilers });
    setLoading(false);
    toast.success(t("updateSubmitted") + " ✅");
    setChicks(0);
    setGrowerCount(0);
    setLayers(0);
    setBroilers(0);
    setServices({
      vaccination: { checked: false, qty: 0 },
      deworming: { checked: false, qty: 0 },
      feedStock: { checked: false, qty: 0 },
      loan: { checked: false, qty: 0 },
      equipment: { checked: false, qty: 0 },
    });
    setRefreshKey((k) => k + 1);
  };

  const pastUpdates = getBirdUpdates().slice(0, 4);

  return (
    <div className="flex flex-col gap-5" key={refreshKey}>
      {/* Bird Count */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-3 text-foreground">{t("birdCount")}</h2>
        <Counter label={t("chicks")} value={chicks} onChange={setChicks} />
        <Counter label={t("growers")} value={growers} onChange={setGrowerCount} />
        <Counter label={t("layers")} value={layers} onChange={setLayers} />
        <Counter label={t("broilers")} value={broilers} onChange={setBroilers} />
        <div className="border-t border-border pt-3 mt-2">
          <p className="text-base font-bold text-foreground">{t("total")}: {total} {t("birds")}</p>
        </div>
      </Card>

      {/* Services Needed */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-3 text-foreground">{t("servicesNeeded")}</h2>
        {Object.entries(services).map(([key, val]) => (
          <div key={key} className="mb-3">
            <label className="flex items-center gap-3 tap-target justify-start cursor-pointer">
              <Checkbox
                checked={val.checked}
                onCheckedChange={() => toggleService(key)}
                className="w-6 h-6"
              />
              <span className="text-base font-medium text-foreground">{serviceLabels[key]}</span>
            </label>
            {val.checked && (
              <div className="ml-9 mt-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  value={val.qty || ""}
                  onChange={(e) => setServiceQty(key, parseInt(e.target.value) || 0)}
                  placeholder={t("quantity")}
                  className="tap-target text-base max-w-[160px]"
                />
              </div>
            )}
          </div>
        ))}
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={total === 0 || loading}
        className="tap-target w-full text-lg font-semibold bg-primary text-primary-foreground"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : t("submitUpdate")}
      </Button>

      {/* Past Updates */}
      {pastUpdates.length > 0 && (
        <Card className="p-5 bg-card">
          <h2 className="text-lg font-bold mb-3 text-foreground">{t("pastUpdates")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">{t("week")}</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">🐣</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">🐔</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">🥚</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">🍗</th>
                  <th className="text-center py-2 text-muted-foreground font-medium">{t("total")}</th>
                </tr>
              </thead>
              <tbody>
                {pastUpdates.map((u) => (
                  <tr key={u.id} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{formatDate(u.weekDate)}</td>
                    <td className="text-center py-2 text-foreground">{u.chicks}</td>
                    <td className="text-center py-2 text-foreground">{u.growers}</td>
                    <td className="text-center py-2 text-foreground">{u.layers}</td>
                    <td className="text-center py-2 text-foreground">{u.broilers}</td>
                    <td className="text-center py-2 font-bold text-foreground">{u.chicks + u.growers + u.layers + u.broilers}</td>
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
