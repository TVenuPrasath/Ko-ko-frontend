import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Drumstick, Egg, Bird, TrendingUp, RefreshCw } from "lucide-react";

function formatTamilDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

const MarketPricesTab = () => {
  const [price, setPrice] = useState<any>(null);

  useEffect(() => {
    api.getMarketPrice().then(setPrice).catch(() => {});
    const interval = setInterval(() => {
      api.getMarketPrice().then(setPrice).catch(() => {});
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!price) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-4">
          <TrendingUp size={36} className="text-muted-foreground/50" />
        </div>
        <p className="text-base font-semibold text-foreground">விலை விவரங்கள் இல்லை</p>
        <p className="text-sm text-muted-foreground mt-1">CRP-ஐ தொடர்பு கொள்ளவும்</p>
      </div>
    );
  }

  const items = [
    { icon: Drumstick, label: "கறிக்கோழி விலை", sublabel: "Broiler Chicken", value: price.broiler, unit: "/ kg", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
    { icon: Bird,      label: "குஞ்சுகள் விலை",  sublabel: "Chicks",          value: price.chick,   unit: "/ குஞ்சு", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200" },
    { icon: Egg,       label: "முட்டை விலை",      sublabel: "Eggs",            value: price.egg,     unit: "/ முட்டை", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="rounded-2xl p-4 text-white shadow-sm" style={{ background: "linear-gradient(135deg, #F9A825, #FFB300)" }}>
        <div className="flex items-center gap-3">
          <TrendingUp size={22} className="text-white" />
          <div>
            <p className="text-base font-bold">சந்தை விலை</p>
            <p className="text-xs opacity-80">(Market Prices)</p>
          </div>
        </div>
      </div>

      {/* Price cards */}
      {items.map((it, i) => (
        <div key={i} className={`bg-white rounded-2xl border ${it.border} shadow-sm p-5`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${it.bg} flex items-center justify-center shrink-0`}>
              <it.icon size={28} className={it.color} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">{it.label}</p>
              <p className="text-xs text-muted-foreground/70">{it.sublabel}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <p className="text-3xl font-bold text-foreground">₹{it.value}</p>
                <span className="text-sm text-muted-foreground font-normal">{it.unit}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Last updated */}
      <div className="bg-muted/30 rounded-xl px-4 py-3 flex items-center gap-2">
        <RefreshCw size={13} className="text-muted-foreground shrink-0" />
        <div>
          <p className="text-xs text-muted-foreground">கடைசியாக புதுப்பிக்கப்பட்டது: <span className="font-medium text-foreground">{formatTamilDate(price.updatedAt)}</span></p>
          <p className="text-xs text-muted-foreground">புதுப்பித்தவர்: <span className="font-medium text-foreground">{price.updatedBy}</span></p>
        </div>
      </div>
    </div>
  );
};

export default MarketPricesTab;
