import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Drumstick, Egg, Bird } from "lucide-react";

function formatTamilDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const MarketPricesTab = () => {
  const [price, setPrice] = useState<any>(null);

  useEffect(() => {
    api.getMarketPrice().then(setPrice).catch(() => {});
    // re-fetch every 5s so CRP price updates reflect without full reload
    const interval = setInterval(() => {
      api.getMarketPrice().then(setPrice).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!price) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        விலை விவரங்கள் இல்லை. CRP-ஐ தொடர்பு கொள்ளவும்
      </Card>
    );
  }

  const items = [
    { icon: Drumstick, label: "கறிக்கோழி விலை", value: `₹${price.broiler}`, unit: "/ kg" },
    { icon: Bird,      label: "குஞ்சுகள் விலை",  value: `₹${price.chick}`,   unit: "/ குஞ்சு" },
    { icon: Egg,       label: "முட்டை விலை",      value: `₹${price.egg}`,     unit: "/ முட்டை" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-primary text-primary-foreground p-4 rounded-xl">
        <p className="text-base font-bold">சந்தை விலை</p>
        <p className="text-xs opacity-90">(Market Prices)</p>
      </Card>

      {items.map((it, i) => (
        <Card key={i} className="p-4 border-2">
          <div className="flex items-center gap-4">
            <it.icon size={32} className="text-primary shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{it.label}</p>
              <p className="text-3xl font-bold text-foreground">
                {it.value}
                <span className="text-sm text-muted-foreground font-normal">{it.unit}</span>
              </p>
            </div>
          </div>
        </Card>
      ))}

      <Card className="p-3 bg-muted/40 text-xs text-muted-foreground">
        <p>கடைசியாக புதுப்பிக்கப்பட்டது: {formatTamilDate(price.updatedAt)}</p>
        <p>புதுப்பித்தவர்: {price.updatedBy}</p>
      </Card>
    </div>
  );
};

export default MarketPricesTab;
