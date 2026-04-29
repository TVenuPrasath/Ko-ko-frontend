import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { addBirdUpdate, getBirdUpdates, formatDate } from "@/lib/mockData";
import { Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

const WeeklyUpdateTab = () => {
  const { t } = useLanguage();

  // Birds update (wireframe 6)
  const [chicks, setChicks] = useState(0);
  const [growers, setGrowers] = useState(0);
  const [layers, setLayers] = useState(0);

  // Saleable (wireframe 6 bottom)
  const [saleBroiler, setSaleBroiler] = useState(0);
  const [saleChicks, setSaleChicks] = useState(0);
  const [saleEggs, setSaleEggs] = useState(0);

  // Services (wireframe 7) — vaccination by age group
  const [vacAge1, setVacAge1] = useState(0);
  const [vacAge2, setVacAge2] = useState(0);
  const [vacAge3, setVacAge3] = useState(0);
  const [smallpox, setSmallpox] = useState(0);
  const [deworm, setDeworm] = useState(0);
  const [loan, setLoan] = useState(0);
  const [other, setOther] = useState({ feeder: false, cage: false, net: false });

  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    addBirdUpdate({ chicks, growers, layers, broilers: saleBroiler });
    setLoading(false);
    toast.success(t("updateSubmitted") + " ✅");
    setChicks(0); setGrowers(0); setLayers(0);
    setSaleBroiler(0); setSaleChicks(0); setSaleEggs(0);
    setVacAge1(0); setVacAge2(0); setVacAge3(0); setSmallpox(0);
    setDeworm(0); setLoan(0); setOther({ feeder: false, cage: false, net: false });
    setRefreshKey((k) => k + 1);
  };

  const pastUpdates = getBirdUpdates().slice(0, 4);

  return (
    <div className="flex flex-col gap-5" key={refreshKey}>
      {/* Birds update — wireframe 6 */}
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
      </Card>

      {/* Saleable — wireframe 6 bottom */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">{t("saleableReady")}</h3>
        <Row label={`1. ${t("broilerChicken")}`} value={saleBroiler} onChange={setSaleBroiler} />
        <Row label={`2. ${t("youngChicks")}`} value={saleChicks} onChange={setSaleChicks} />
        <Row label={`3. ${t("eggs")}`} value={saleEggs} onChange={setSaleEggs} />
      </Card>

      {/* Services needed — wireframe 7 */}
      <Card className="p-4 bg-card">
        <div className="text-center mb-3">
          <h2 className="text-base font-bold text-foreground">{t("servicesNeededTitle")}</h2>
          <p className="text-xs italic text-muted-foreground">{t("servicesNeededEn")}</p>
        </div>

        <div className="border border-input rounded-md py-2 px-3 text-center text-sm font-bold mb-3 bg-muted/50">
          {t("vaccinationLabel")}
        </div>

        <p className="text-sm font-medium text-foreground mb-2">{t("whiteDiarrheaPrevention")}</p>
        <div className="pl-3">
          <Row label={`1. ${t("ageGroup0to7")}`} value={vacAge1} onChange={setVacAge1} />
          <Row label={`2. ${t("ageGroup7to60")}`} value={vacAge2} onChange={setVacAge2} />
          <Row label={`3. ${t("ageGroupAbove60")}`} value={vacAge3} onChange={setVacAge3} />
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <Row label={t("smallpoxPrevention")} value={smallpox} onChange={setSmallpox} />
        </div>

        <div className="mt-3 pt-3 border-t border-border flex flex-col gap-2">
          <Row label={t("dewormingService")} value={deworm} onChange={setDeworm} />
          <Row label={t("poultryLoan")} value={loan} onChange={setLoan} />
        </div>

        <div className="mt-3 pt-3 border-t border-border">
          <Label className="text-sm font-medium text-foreground">{t("others")}</Label>
          <div className="flex gap-4 mt-2 flex-wrap">
            {([
              ["feeder", t("feeder")],
              ["cage", t("cage")],
              ["net", t("net")],
            ] as const).map(([key, lbl]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={other[key]}
                  onCheckedChange={(v) => setOther((o) => ({ ...o, [key]: !!v }))}
                  className="w-5 h-5"
                />
                <span className="text-sm text-foreground">{lbl}</span>
              </label>
            ))}
          </div>
        </div>
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
        <Card className="p-4 bg-card">
          <h2 className="text-base font-bold mb-3 text-foreground">{t("pastUpdates")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">{t("week")}</th>
                  <th className="text-center py-2 text-muted-foreground">🐣</th>
                  <th className="text-center py-2 text-muted-foreground">🐔</th>
                  <th className="text-center py-2 text-muted-foreground">🥚</th>
                  <th className="text-center py-2 text-muted-foreground">{t("total")}</th>
                </tr>
              </thead>
              <tbody>
                {pastUpdates.map((u) => (
                  <tr key={u.id} className="border-b border-border/50">
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
