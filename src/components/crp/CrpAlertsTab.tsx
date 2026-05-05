import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HAMLETS } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const CrpAlertsTab = () => {
  const { t } = useLanguage();

  const [alertHamlet, setAlertHamlet] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);

  const [tipMsg, setTipMsg] = useState("");
  const [tipLoading, setTipLoading] = useState(false);

  const [broilerPrice, setBroilerPrice] = useState("");
  const [chickPrice, setChickPrice] = useState("");
  const [eggPrice, setEggPrice] = useState("");
  const [priceDate, setPriceDate] = useState(new Date().toISOString().split("T")[0]);
  const [priceLoading, setPriceLoading] = useState(false);

  const handleSendAlert = async () => {
    if (!alertMsg.trim()) return;
    setAlertLoading(true);
    await api.createNotification({ type: "disease", message: alertMsg, hamlet: alertHamlet || undefined });
    setAlertLoading(false);
    toast.success(t("alertSent") + " ✅ (செயலி அறிவிப்பாக அனுப்பப்பட்டது)");
    setAlertMsg("");
  };

  const handleSendTip = async () => {
    if (!tipMsg.trim()) return;
    setTipLoading(true);
    await api.createNotification({ type: "tip", message: tipMsg });
    setTipLoading(false);
    toast.success(t("tipSent") + " ✅ (செயலி அறிவிப்பாக அனுப்பப்பட்டது)");
    setTipMsg("");
  };

  const handleSendPrice = async () => {
    if (!broilerPrice && !chickPrice && !eggPrice) return;
    setPriceLoading(true);
    await api.setMarketPrice({
      broiler: Number(broilerPrice) || 0,
      chick: Number(chickPrice) || 0,
      egg: Number(eggPrice) || 0,
    });
    await api.createNotification({
      type: "market",
      message: `சந்தை விலை புதுப்பிப்பு: கறிக்கோழி ₹${broilerPrice}/kg | குஞ்சு ₹${chickPrice}/குஞ்சு | முட்டை ₹${eggPrice}/முட்டை (தேதி: ${priceDate})`,
    });
    setPriceLoading(false);
    toast.success(t("priceSent") + " ✅ (செயலி அறிவிப்பாக அனுப்பப்பட்டது)");
    setBroilerPrice(""); setChickPrice(""); setEggPrice("");
  };

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("sendDiseaseAlert")}</h2>
        <div className="flex flex-col gap-3">
          <select value={alertHamlet} onChange={(e) => setAlertHamlet(e.target.value)} className="border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground">
            <option value="">{t("allHamletsTarget")}</option>
            {HAMLETS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <Textarea value={alertMsg} onChange={(e) => setAlertMsg(e.target.value)} placeholder={t("message")} rows={3} className="text-base" />
          <Button onClick={handleSendAlert} disabled={!alertMsg.trim() || alertLoading} className="tap-target w-full bg-danger text-danger-foreground">
            {alertLoading ? <Loader2 className="animate-spin" size={18} /> : t("sendAlert")}
          </Button>
        </div>
      </Card>

      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("sendFarmingTip")}</h2>
        <Textarea value={tipMsg} onChange={(e) => setTipMsg(e.target.value)} placeholder={t("message")} rows={3} className="text-base mb-3" />
        <Button onClick={handleSendTip} disabled={!tipMsg.trim() || tipLoading} className="tap-target w-full bg-primary text-primary-foreground">
          {tipLoading ? <Loader2 className="animate-spin" size={18} /> : t("sendFarmingTip")}
        </Button>
      </Card>

      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("sendMarketPrice")}</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">கறிக்கோழி (Broiler) ₹/kg</label>
            <Input value={broilerPrice} onChange={(e) => setBroilerPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="180" className="tap-target" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">குஞ்சு (Chick) ₹/குஞ்சு</label>
            <Input value={chickPrice} onChange={(e) => setChickPrice(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="45" className="tap-target" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">முட்டை (Egg) ₹/முட்டை</label>
            <Input value={eggPrice} onChange={(e) => setEggPrice(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="decimal" placeholder="6.50" className="tap-target" />
          </div>
          <Input type="date" value={priceDate} onChange={(e) => setPriceDate(e.target.value)} />
          <Button onClick={handleSendPrice} disabled={(!broilerPrice && !chickPrice && !eggPrice) || priceLoading} className="tap-target bg-primary text-primary-foreground">
            {priceLoading ? <Loader2 className="animate-spin" size={18} /> : t("sendMarketPrice")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CrpAlertsTab;
