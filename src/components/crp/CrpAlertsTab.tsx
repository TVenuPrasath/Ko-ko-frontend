import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HAMLETS } from "@/lib/auth";
import { User } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";

const CrpAlertsTab = ({ user }: { user: User }) => {
  const { t } = useLanguage();
  const officer = { id: user.userId, name: user.name };

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

  const whatsapp = (msg: string) =>
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");

  const handleSendAlert = async () => {
    if (!alertMsg.trim()) return;
    setAlertLoading(true);
    await api.createNotification({ type: "disease", message: alertMsg, hamlet: alertHamlet || undefined }, officer);
    setAlertLoading(false);
    toast.success(t("alertSent") + " ✅ (செயலி அறிவிப்பாக அனுப்பப்பட்டது)");
    setAlertMsg("");
  };

  const handleSendTip = async () => {
    if (!tipMsg.trim()) return;
    setTipLoading(true);
    await api.createNotification({ type: "tip", message: tipMsg }, officer);
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
    }, officer);
    await api.createNotification({
      type: "market",
      message: `சந்தை விலை புதுப்பிப்பு: கறிக்கோழி ₹${broilerPrice}/kg | குஞ்சு ₹${chickPrice}/குஞ்சு | முட்டை ₹${eggPrice}/முட்டை (தேதி: ${priceDate})`,
    }, officer);
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
          <Button onClick={() => whatsapp(`🔴 நோய் எச்சரிக்கை: ${alertMsg}`)} disabled={!alertMsg.trim()} variant="outline" className="tap-target w-full gap-2 text-success border-success">
            <MessageCircle size={16} /> WhatsApp அனுப்பு
          </Button>
        </div>
      </Card>

      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("sendFarmingTip")}</h2>
        <Textarea value={tipMsg} onChange={(e) => setTipMsg(e.target.value)} placeholder={t("message")} rows={3} className="text-base mb-3" />
        <Button onClick={handleSendTip} disabled={!tipMsg.trim() || tipLoading} className="tap-target w-full bg-primary text-primary-foreground">
          {tipLoading ? <Loader2 className="animate-spin" size={18} /> : t("sendFarmingTip")}
        </Button>
        <Button onClick={() => whatsapp(`💡 விவசாய குறிப்பு: ${tipMsg}`)} disabled={!tipMsg.trim()} variant="outline" className="tap-target w-full gap-2 text-success border-success mt-2">
          <MessageCircle size={16} /> WhatsApp அனுப்பு
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
          <Button
            onClick={() => whatsapp(`📊 சந்தை விலை: கறிக்கோழி ₹${broilerPrice}/kg | குஞ்சு ₹${chickPrice}/குஞ்சு | முட்டை ₹${eggPrice}/முட்டை (${priceDate})`)}
            disabled={!broilerPrice && !chickPrice && !eggPrice}
            variant="outline" className="tap-target gap-2 text-success border-success"
          >
            <MessageCircle size={16} /> WhatsApp அனுப்பு
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CrpAlertsTab;
