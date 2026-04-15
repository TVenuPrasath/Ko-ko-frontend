import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getHamletSummaries, getMockFarmers, getAllServiceDemands, getAllDiseaseReports, exportToCSV,
} from "@/lib/crpMockData";
import { formatDate } from "@/lib/mockData";
import { Download } from "lucide-react";

type ReportType = "hamlet_stock" | "farmer_data" | "vaccination" | "service_demand" | "disease_log";

const CrpReportsTab = () => {
  const { t } = useLanguage();
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const reports: { key: ReportType; label: string }[] = [
    { key: "hamlet_stock", label: t("hamletStockReport") },
    { key: "farmer_data", label: t("farmerDataReport") },
    { key: "vaccination", label: t("vaccinationCoverage") },
    { key: "service_demand", label: t("serviceDemandReport") },
    { key: "disease_log", label: t("diseaseReportLog") },
  ];

  const handleExport = () => {
    switch (activeReport) {
      case "hamlet_stock": {
        const summaries = getHamletSummaries();
        exportToCSV(
          ["Hamlet", "Total Birds", "Vaccinated %", "Dewormed %", "Pending Demands"],
          summaries.map((s) => [s.hamlet, s.totalBirds, s.vaccinatedPct, s.dewormedPct, s.pendingDemands]),
          "hamlet_stock_report.csv"
        );
        break;
      }
      case "farmer_data": {
        const farmers = getMockFarmers();
        exportToCSV(
          ["Name", "Phone", "Hamlet", "SHG", "Total Birds", "Last Update"],
          farmers.map((f) => {
            const latest = f.birdUpdates[0];
            const birds = latest ? latest.chicks + latest.growers + latest.layers + latest.broilers : 0;
            return [f.name, f.phone, f.hamlet, f.shgName, birds, f.lastUpdateWeek || "N/A"];
          }),
          "farmer_data_report.csv"
        );
        break;
      }
      case "vaccination": {
        const farmers = getMockFarmers();
        const rows: (string | number)[][] = [];
        farmers.forEach((f) => {
          if (f.vaccinations.length > 0) {
            f.vaccinations.forEach((v) => {
              rows.push([f.name, f.hamlet, v.vaccineType, formatDate(v.dateGiven), formatDate(v.nextDueDate)]);
            });
          } else {
            rows.push([f.name, f.hamlet, "Not vaccinated", "", ""]);
          }
        });
        exportToCSV(["Farmer", "Hamlet", "Vaccine Type", "Date Given", "Next Due"], rows, "vaccination_coverage.csv");
        break;
      }
      case "service_demand": {
        const demands = getAllServiceDemands();
        exportToCSV(
          ["Farmer", "Hamlet", "Type", "Quantity", "Status", "Date"],
          demands.map((d) => [d.farmerName, d.hamlet, d.type, d.quantity, d.status, formatDate(d.createdAt)]),
          "service_demand_report.csv"
        );
        break;
      }
      case "disease_log": {
        const reports = getAllDiseaseReports();
        exportToCSV(
          ["Farmer", "Hamlet", "Description", "Status", "Date"],
          reports.map((r) => [r.farmerName, r.hamlet, r.description, r.status, formatDate(r.reportedAt)]),
          "disease_report_log.csv"
        );
        break;
      }
    }
  };

  const renderPreview = () => {
    if (!activeReport) return null;

    switch (activeReport) {
      case "hamlet_stock": {
        const summaries = getHamletSummaries();
        return (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground">{t("hamlet")}</th>
              <th className="text-center py-2 text-muted-foreground">{t("totalBirds")}</th>
              <th className="text-center py-2 text-muted-foreground">{t("vaccinatedPct")}</th>
              <th className="text-center py-2 text-muted-foreground">{t("dewormedPct")}</th>
            </tr></thead>
            <tbody>
              {summaries.map((s) => (
                <tr key={s.hamlet} className="border-b border-border/50">
                  <td className="py-2 text-foreground">{s.hamlet}</td>
                  <td className="text-center py-2">{s.totalBirds}</td>
                  <td className="text-center py-2">{s.vaccinatedPct}%</td>
                  <td className="text-center py-2">{s.dewormedPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      case "farmer_data": {
        const farmers = getMockFarmers().slice(0, 10);
        return (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground">{t("farmerName")}</th>
              <th className="text-left py-2 text-muted-foreground">{t("hamlet")}</th>
              <th className="text-center py-2 text-muted-foreground">{t("totalBirds")}</th>
            </tr></thead>
            <tbody>
              {farmers.map((f) => {
                const latest = f.birdUpdates[0];
                const birds = latest ? latest.chicks + latest.growers + latest.layers + latest.broilers : 0;
                return (
                  <tr key={f.userId} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{f.name}</td>
                    <td className="py-2 text-muted-foreground">{f.hamlet}</td>
                    <td className="text-center py-2">{birds}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      }
      default:
        return <p className="text-sm text-muted-foreground">{t("preview")} — {t("exportCSV")}</p>;
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-foreground">{t("reports")}</h2>

      {/* Date Range */}
      <Card className="p-4 bg-card">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">{t("fromDate")}</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t("toDate")}</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Report Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {reports.map(({ key, label }) => (
          <Button
            key={key}
            variant={activeReport === key ? "default" : "outline"}
            onClick={() => setActiveReport(activeReport === key ? null : key)}
            className="tap-target text-sm justify-start"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Preview & Export */}
      {activeReport && (
        <Card className="p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-foreground">{t("preview")}</h3>
            <Button size="sm" onClick={handleExport} className="gap-2 bg-primary text-primary-foreground">
              <Download size={14} /> {t("exportCSV")}
            </Button>
          </div>
          <div className="overflow-x-auto">
            {renderPreview()}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CrpReportsTab;
