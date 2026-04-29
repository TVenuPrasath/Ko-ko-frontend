import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getHamletSummaries, getMockFarmers, exportToCSV, getAggregatedStock,
} from "@/lib/crpMockData";
import { Download } from "lucide-react";

const CrpReportsTab = () => {
  const { t } = useLanguage();
  const summaries = getHamletSummaries();
  const stock = getAggregatedStock();

  const handleExportSummary = () => {
    exportToCSV(
      ["தெரு / Hamlet", "வெள்ளை கழிச்சல் தடுப்பூசி", "அம்மை தடுப்பூசி", "குடற்புழு நீக்கம்", "கடன்", "இதர"],
      summaries.map((s) => [
        s.hamlet, s.vaccinatedPct + "%", s.vaccinatedPct + "%",
        s.dewormedPct + "%", s.pendingDemands, "—",
      ]),
      "data_summary.csv"
    );
  };

  const handleExportSaleable = () => {
    exportToCSV(
      ["வகை", "எண்ணிக்கை"],
      [
        [t("broilerChicken"), stock.broilers],
        [t("youngChicks"), stock.chicks],
        [t("eggs"), stock.layers * 5],
      ],
      "saleable_stock.csv"
    );
  };

  const handleFarmerData = () => {
    const farmers = getMockFarmers();
    exportToCSV(
      ["Name", "Phone", "Hamlet", "SHG", "Total Birds"],
      farmers.map((f) => {
        const latest = f.birdUpdates[0];
        const birds = latest ? latest.chicks + latest.growers + latest.layers + latest.broilers : 0;
        return [f.name, f.phone, f.hamlet, f.shgName, birds];
      }),
      "farmer_data.csv"
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <h2 className="text-lg font-bold text-foreground">{t("dataSummary")}</h2>
        <p className="text-xs italic text-muted-foreground">{t("dataSummaryEn")}</p>
      </div>

      {/* Data summary table — wireframe 10 */}
      <Card className="p-4 bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-border">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border py-2 px-2 text-left text-muted-foreground font-medium">தெரு</th>
                <th className="border border-border py-2 px-2 text-center text-muted-foreground font-medium leading-tight">வெள்ளை<br/>கழிச்சல்<br/>தடுப்பூசி</th>
                <th className="border border-border py-2 px-2 text-center text-muted-foreground font-medium leading-tight">அம்மை<br/>தடுப்பூசி</th>
                <th className="border border-border py-2 px-2 text-center text-muted-foreground font-medium leading-tight">குடற்புழு<br/>நீக்கம்</th>
                <th className="border border-border py-2 px-2 text-center text-muted-foreground font-medium">கடன்</th>
                <th className="border border-border py-2 px-2 text-center text-muted-foreground font-medium">இதர</th>
              </tr>
            </thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.hamlet}>
                  <td className="border border-border py-2 px-2 text-foreground">{s.hamlet}</td>
                  <td className="border border-border py-2 px-2 text-center">{s.vaccinatedPct}%</td>
                  <td className="border border-border py-2 px-2 text-center">{s.vaccinatedPct}%</td>
                  <td className="border border-border py-2 px-2 text-center">{s.dewormedPct}%</td>
                  <td className="border border-border py-2 px-2 text-center">{s.pendingDemands}</td>
                  <td className="border border-border py-2 px-2 text-center">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={handleExportSummary} size="sm" className="mt-3 gap-2 bg-primary text-primary-foreground">
          <Download size={14} /> {t("exportCSV")}
        </Button>
      </Card>

      {/* Saleable — wireframe 10 bottom */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">{t("saleableReady")}</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-foreground">1. {t("broilerChicken")}</span>
            <span className="border border-input rounded-md px-3 py-1 min-w-[70px] text-center bg-muted/30 font-bold">
              {stock.broilers}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-border/40">
            <span className="text-sm text-foreground">2. {t("youngChicks")}</span>
            <span className="border border-input rounded-md px-3 py-1 min-w-[70px] text-center bg-muted/30 font-bold">
              {stock.chicks}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-foreground">3. {t("eggs")}</span>
            <span className="border border-input rounded-md px-3 py-1 min-w-[70px] text-center bg-muted/30 font-bold">
              {stock.layers * 5}
            </span>
          </div>
        </div>
        <Button onClick={handleExportSaleable} size="sm" className="mt-3 gap-2 bg-primary text-primary-foreground">
          <Download size={14} /> {t("exportCSV")}
        </Button>
      </Card>

      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-2 text-foreground">{t("farmerDataReport")}</h3>
        <Button onClick={handleFarmerData} size="sm" className="gap-2 bg-primary text-primary-foreground">
          <Download size={14} /> {t("exportCSV")}
        </Button>
      </Card>
    </div>
  );
};

export default CrpReportsTab;
