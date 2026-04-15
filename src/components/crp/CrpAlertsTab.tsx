import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { HAMLETS } from "@/lib/auth";
import { getPendingUpdateFarmers } from "@/lib/crpMockData";
import { toast } from "sonner";
import { Loader2, MessageCircle } from "lucide-react";

const CrpAlertsTab = () => {
  const { t } = useLanguage();
  const pendingFarmers = getPendingUpdateFarmers();

  // Disease Alert
  const [alertHamlet, setAlertHamlet] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertLoading, setAlertLoading] = useState(false);

  // Farming Tip
  const [tipMsg, setTipMsg] = useState("");
  const [tipLoading, setTipLoading] = useState(false);

  // Market Price
  const [birdType, setBirdType] = useState("Broiler");
  const [price, setPrice] = useState("");
  const [priceDate, setPriceDate] = useState(new Date().toISOString().split("T")[0]);
  const [priceLoading, setPriceLoading] = useState(false);

  const handleSendAlert = async () => {
    setAlertLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setAlertLoading(false);
    toast.success(t("alertSent") + " ✅");
    setAlertMsg("");
  };

  const handleWhatsappBroadcast = () => {
    const msg = `🔴 DISEASE ALERT: ${alertMsg}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleSendTip = async () => {
    setTipLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setTipLoading(false);
    toast.success(t("tipSent") + " ✅");
    setTipMsg("");
  };

  const handleSendPrice = async () => {
    setPriceLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setPriceLoading(false);
    toast.success(t("priceSent") + " ✅");
    setPrice("");
  };

  const handleRemindFarmer = (name: string, phone: string) => {
    const msg = `Dear ${name}, please submit your weekly poultry update.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleRemindAll = () => {
    const names = pendingFarmers.map((f) => f.name).join(", ");
    const msg = `Weekly update reminder for: ${names}. Please submit your poultry update.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Send Disease Alert */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("sendDiseaseAlert")}</h2>
        <div className="flex flex-col gap-3">
          <select value={alertHamlet} onChange={(e) => setAlertHamlet(e.target.value)} className="border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground">
            <option value="">{t("allHamletsTarget")}</option>
            {HAMLETS.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <Textarea value={alertMsg} onChange={(e) => setAlertMsg(e.target.value)} placeholder={t("message")} rows={3} className="text-base" />
          <div className="flex gap-2">
            <Button onClick={handleSendAlert} disabled={!alertMsg.trim() || alertLoading} className="tap-target flex-1 bg-danger text-danger-foreground">
              {alertLoading ? <Loader2 className="animate-spin" size={18} /> : t("sendAlert")}
            </Button>
            <Button onClick={handleWhatsappBroadcast} disabled={!alertMsg.trim()} variant="outline" className="tap-target gap-2 text-success border-success">
              <MessageCircle size={16} /> {t("whatsappBroadcast")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Send Farming Tip */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("sendFarmingTip")}</h2>
        <Textarea value={tipMsg} onChange={(e) => setTipMsg(e.target.value)} placeholder={t("message")} rows={3} className="text-base mb-3" />
        <Button onClick={handleSendTip} disabled={!tipMsg.trim() || tipLoading} className="tap-target w-full bg-primary text-primary-foreground">
          {tipLoading ? <Loader2 className="animate-spin" size={18} /> : t("sendFarmingTip")}
        </Button>
      </Card>

      {/* Send Market Price */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("sendMarketPrice")}</h2>
        <div className="flex flex-col gap-3">
          <Input value={birdType} onChange={(e) => setBirdType(e.target.value)} placeholder={t("birdType")} className="tap-target" />
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder={`${t("pricePerKg")} (₹)`} inputMode="numeric" className="tap-target" />
          <Input type="date" value={priceDate} onChange={(e) => setPriceDate(e.target.value)} />
          <Button onClick={handleSendPrice} disabled={!price || priceLoading} className="tap-target bg-primary text-primary-foreground">
            {priceLoading ? <Loader2 className="animate-spin" size={18} /> : t("sendMarketPrice")}
          </Button>
        </div>
      </Card>

      {/* Weekly Update Reminder */}
      <Card className="p-5 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">{t("weeklyReminder")}</h2>
          {pendingFarmers.length > 0 && (
            <Button onClick={handleRemindAll} size="sm" variant="outline" className="gap-1 text-success border-success">
              <MessageCircle size={14} /> {t("remindAll")}
            </Button>
          )}
        </div>
        {pendingFarmers.length === 0 ? (
          <p className="text-sm text-muted-foreground">✅ {t("done")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pendingFarmers.map((f) => (
              <div key={f.userId} className="flex items-center justify-between py-2 border-b border-border/30">
                <div>
                  <p className="text-sm font-medium text-foreground">{f.name}</p>
                  <p className="text-xs text-muted-foreground">{f.hamlet}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleRemindFarmer(f.name, f.phone)} className="gap-1 text-success border-success text-xs">
                  <MessageCircle size={14} /> {t("sendReminder")}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CrpAlertsTab;
