import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { Minus, Plus, Loader2, Bird, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const WeeklyUpdateTab = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [chicks, setChicks] = useState(0);
  const [growers, setGrowers] = useState(0);
  const [layers, setLayers] = useState(0);
  const [saleBroiler, setSaleBroiler] = useState(0);
  const [saleChicks, setSaleChicks] = useState(0);
  const [saleEggs, setSaleEggs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saleLoading, setSaleLoading] = useState(false);
  const [birdResetKey, setBirdResetKey] = useState(0);
  const [saleResetKey, setSaleResetKey] = useState(0);

  const { data: pastUpdates = [] } = useQuery({
    queryKey: ["birdUpdates"],
    queryFn: () => api.getBirdUpdates(),
    staleTime: 30_000,
  });

  const total = chicks + growers + layers;
  const saleTotal = saleBroiler + saleChicks + saleEggs;

  const Counter = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
    const [inputVal, setInputVal] = useState(String(value));
    useEffect(() => { setInputVal(String(value)); }, [value]);
    return (
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(0, value - 1))} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center active:bg-muted/70 border border-border">
          <Minus size={15} />
        </button>
        <input
          type="number" min={0} value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onBlur={() => { const v = parseInt(inputVal); const safe = isNaN(v) || v < 0 ? 0 : v; onChange(safe); setInputVal(String(safe)); }}
          className="w-14 text-center text-lg font-bold text-foreground border-2 border-input rounded-xl py-1.5 bg-white focus:outline-none focus:border-primary"
        />
        <button onClick={() => onChange(value + 1)} className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center active:opacity-80 shadow-sm">
          <Plus size={15} />
        </button>
      </div>
    );
  };

  const Row = ({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) => (
    <div className="flex items-center justify-between py-3 gap-3 border-b border-border/40 last:border-0">
      <span className="text-sm font-medium text-foreground flex-1 leading-tight">{label}</span>
      <Counter value={value} onChange={onChange} />
    </div>
  );

  const handleSubmitBirds = async () => {
    setLoading(true);
    try {
      await api.submitBirdUpdate({ chicks, growers, layers, broilers: saleBroiler });
      toast.success(t("updateSubmitted") + " ✅");
      setChicks(0); setGrowers(0); setLayers(0);
      setBirdResetKey((k) => k + 1);
      queryClient.invalidateQueries({ queryKey: ["birdUpdates"] });
      queryClient.invalidateQueries({ queryKey: ["checkWeek"] });
    } catch (err: any) {
      toast.error(err.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSale = async () => {
    setSaleLoading(true);
    try {
      await api.submitSaleStock({ broilers: saleBroiler, chicks: saleChicks, eggs: saleEggs });
      toast.success("விற்பனை தகவல் சேமிக்கப்பட்டது ✅");
      setSaleBroiler(0); setSaleChicks(0); setSaleEggs(0);
      setSaleResetKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Submit failed");
    } finally {
      setSaleLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Bird count card */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden" key={birdResetKey}>
        <div className="px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #2E7D32, #4CAF50)" }}>
          <Bird size={20} className="text-white" />
          <div>
            <h2 className="text-sm font-bold text-white">{t("birdsUpdate")}</h2>
            <p className="text-[11px] text-white/75">{t("birdsUpdateEn")}</p>
          </div>
        </div>
        <div className="p-4">
          <Row label={`1. ${t("chicks")}`} value={chicks} onChange={setChicks} />
          <Row label={`2. ${t("growers")}`} value={growers} onChange={setGrowers} />
          <Row label={`3. ${t("layers")}`} value={layers} onChange={setLayers} />
          <div className="flex items-center justify-between pt-3 mt-1">
            <span className="text-sm text-muted-foreground">{t("total")}</span>
            <span className="text-xl font-bold text-primary">{total}</span>
          </div>
          <Button
            onClick={handleSubmitBirds}
            disabled={total === 0 || loading}
            className="tap-target w-full text-base font-bold mt-4 rounded-xl shadow-sm disabled:opacity-40"
            style={{ background: total > 0 ? "linear-gradient(135deg, #2E7D32, #4CAF50)" : undefined }}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : t("saveBirdCount")}
          </Button>
        </div>
      </div>

      {/* Sale stock card */}
      <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden" key={saleResetKey}>
        <div className="px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #8D6E63, #A1887F)" }}>
          <ShoppingCart size={20} className="text-white" />
          <div>
            <h3 className="text-sm font-bold text-white">{t("saleableReady")}</h3>
            <p className="text-[11px] text-white/75">விற்பனைக்கு தயாரான கோழிகள்</p>
          </div>
        </div>
        <div className="p-4">
          <Row label={`1. ${t("broilerChicken")}`} value={saleBroiler} onChange={setSaleBroiler} />
          <Row label={`2. ${t("youngChicks")}`} value={saleChicks} onChange={setSaleChicks} />
          <Row label={`3. ${t("eggs")}`} value={saleEggs} onChange={setSaleEggs} />
          <div className="flex items-center justify-between pt-3 mt-1">
            <span className="text-sm text-muted-foreground">{t("total")}</span>
            <span className="text-xl font-bold text-[#8D6E63]">{saleTotal}</span>
          </div>
          <Button
            onClick={handleSubmitSale}
            disabled={saleTotal === 0 || saleLoading}
            className="tap-target w-full text-base font-bold mt-4 rounded-xl shadow-sm disabled:opacity-40 bg-success text-success-foreground hover:bg-success/90"
          >
            {saleLoading ? <Loader2 className="animate-spin" size={20} /> : t("saveSaleInfo")}
          </Button>
        </div>
      </div>

      {/* Past updates table */}
      {pastUpdates.length > 0 && (
        <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border/40 bg-muted/30">
            <h2 className="text-sm font-bold text-foreground">{t("pastUpdates")}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left py-2.5 px-4 text-muted-foreground font-semibold">{t("week")}</th>
                  <th className="text-center py-2.5 px-2 text-muted-foreground font-semibold">{t("chicks")}</th>
                  <th className="text-center py-2.5 px-2 text-muted-foreground font-semibold">{t("growers")}</th>
                  <th className="text-center py-2.5 px-2 text-muted-foreground font-semibold">{t("layers")}</th>
                  <th className="text-center py-2.5 px-2 text-muted-foreground font-semibold">{t("total")}</th>
                </tr>
              </thead>
              <tbody>
                {pastUpdates.map((u: any, i: number) => (
                  <tr key={u._id} className={`border-b border-border/40 ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                    <td className="py-2.5 px-4 text-foreground font-medium">{formatDate(u.weekDate)}</td>
                    <td className="text-center py-2.5 px-2 text-foreground">{u.chicks}</td>
                    <td className="text-center py-2.5 px-2 text-foreground">{u.growers}</td>
                    <td className="text-center py-2.5 px-2 text-foreground">{u.layers}</td>
                    <td className="text-center py-2.5 px-2 font-bold text-primary">{u.chicks + u.growers + u.layers + u.broilers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyUpdateTab;
