import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBuyers, addBuyer, getAggregatedStock, getLatestMarketPrice, Buyer } from "@/lib/crpMockData";
import { toast } from "sonner";
import { Loader2, MessageCircle, Search } from "lucide-react";

const CrpBuyersTab = () => {
  const { t } = useLanguage();
  const [buyers, setBuyersList] = useState(getBuyers());
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<Buyer["type"]>("Individual");
  const [loading, setLoading] = useState(false);

  const stock = getAggregatedStock();
  const marketPrice = getLatestMarketPrice();

  const handleAdd = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    addBuyer({ name, phone, type });
    setBuyersList(getBuyers());
    setLoading(false);
    toast.success(t("buyerAdded") + " ✅");
    setName("");
    setPhone("");
  };

  const handleShareStock = (buyer: Buyer) => {
    const msg = `🐔 Poultry Stock Update\n\nChicks: ${stock.chicks}\nGrowers: ${stock.growers}\nLayers: ${stock.layers}\nBroilers: ${stock.broilers}\nTotal: ${stock.total}\n\nPrice: ${marketPrice}\n\nContact for purchase.`;
    window.open(`https://wa.me/${buyer.phone}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const filtered = buyers.filter((b) => !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.phone.includes(search));

  return (
    <div className="flex flex-col gap-5">
      {/* Saleable Stock */}
      <Card className="p-5 bg-primary text-primary-foreground">
        <h2 className="text-lg font-bold mb-2">{t("saleableStock")}</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span>{t("chicks")}: {stock.chicks}</span>
          <span>{t("growers")}: {stock.growers}</span>
          <span>{t("layers")}: {stock.layers}</span>
          <span>{t("broilers")}: {stock.broilers}</span>
        </div>
        <p className="text-lg font-bold mt-2">{t("total")}: {stock.total} {t("birds")}</p>
        <p className="text-sm mt-1 opacity-90">{marketPrice}</p>
      </Card>

      {/* Add Buyer */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("addBuyer")}</h2>
        <div className="flex flex-col gap-3">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("buyerName")} className="tap-target" />
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={t("buyerPhone")} inputMode="tel" className="tap-target" />
          <select value={type} onChange={(e) => setType(e.target.value as Buyer["type"])} className="border border-input rounded-md px-3 py-2.5 text-sm bg-card text-foreground">
            <option value="Individual">{t("individual")}</option>
            <option value="Broker">{t("broker")}</option>
            <option value="Retailer">{t("retailer")}</option>
            <option value="Hotel industry">{t("hotelIndustry")}</option>
          </select>
          <Button onClick={handleAdd} disabled={!name.trim() || !phone.trim() || loading} className="tap-target bg-primary text-primary-foreground">
            {loading ? <Loader2 className="animate-spin" size={18} /> : t("addBuyer")}
          </Button>
        </div>
      </Card>

      {/* Buyer List */}
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-3 text-foreground">{t("buyerList")}</h2>
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchBuyers")} className="pl-9" />
        </div>
        <div className="flex flex-col gap-2">
          {filtered.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/30">
              <div>
                <p className="text-sm font-medium text-foreground">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.phone} • <Badge variant="outline" className="text-xs">{b.type}</Badge></p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleShareStock(b)} className="gap-1 text-success border-success text-xs">
                <MessageCircle size={14} /> {t("shareStock")}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CrpBuyersTab;
