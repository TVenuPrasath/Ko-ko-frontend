import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HAMLETS } from "@/lib/auth";
import { getMockFarmers, Farmer } from "@/lib/crpMockData";
import { formatDate } from "@/lib/mockData";
import { ArrowLeft, Search } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CrpFarmersTab = () => {
  const { t } = useLanguage();
  const farmers = getMockFarmers();
  const [search, setSearch] = useState("");
  const [hamletFilter, setHamletFilter] = useState("");
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [page, setPage] = useState(0);
  const perPage = 10;

  if (selectedFarmer) {
    const chartData = selectedFarmer.birdUpdates.slice(0, 8).reverse().map((u) => ({
      week: formatDate(u.weekDate),
      [t("chicks")]: u.chicks,
      [t("growers")]: u.growers,
      [t("layers")]: u.layers,
      [t("broilers")]: u.broilers,
    }));

    return (
      <div className="flex flex-col gap-4">
        <Button variant="ghost" onClick={() => setSelectedFarmer(null)} className="self-start gap-2">
          <ArrowLeft size={16} /> {t("back")}
        </Button>
        <Card className="p-5 bg-card">
          <h2 className="text-lg font-bold text-foreground">{selectedFarmer.name}</h2>
          <p className="text-sm text-muted-foreground">{selectedFarmer.hamlet} • {selectedFarmer.shgName} • {selectedFarmer.phone}</p>
        </Card>

        {/* Bird Update Chart */}
        <Card className="p-4 bg-card">
          <h3 className="text-base font-bold mb-3 text-foreground">{t("birdUpdateHistory")}</h3>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(50 10% 85%)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey={t("chicks")} fill="hsl(100 72% 24%)" />
                  <Bar dataKey={t("growers")} fill="hsl(36 76% 41%)" />
                  <Bar dataKey={t("layers")} fill="hsl(142 71% 45%)" />
                  <Bar dataKey={t("broilers")} fill="hsl(0 72% 51%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-muted-foreground">{t("noData")}</p>}
        </Card>

        {/* Vaccination History */}
        <Card className="p-4 bg-card">
          <h3 className="text-base font-bold mb-3 text-foreground">{t("vaccinationHistory")}</h3>
          {selectedFarmer.vaccinations.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground">{t("vaccineType")}</th>
                <th className="text-left py-2 text-muted-foreground">{t("dateGiven")}</th>
                <th className="text-left py-2 text-muted-foreground">{t("nextDueDate")}</th>
              </tr></thead>
              <tbody>
                {selectedFarmer.vaccinations.map((v) => (
                  <tr key={v.id} className="border-b border-border/50">
                    <td className="py-2 text-foreground">{v.vaccineType}</td>
                    <td className="py-2">{formatDate(v.dateGiven)}</td>
                    <td className="py-2">{formatDate(v.nextDueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-muted-foreground">{t("noData")}</p>}
        </Card>

        {/* Deworming History */}
        <Card className="p-4 bg-card">
          <h3 className="text-base font-bold mb-3 text-foreground">{t("dewormingHistory")}</h3>
          {selectedFarmer.dewormings.length > 0 ? (
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground">{t("dateGiven")}</th>
                <th className="text-left py-2 text-muted-foreground">{t("nextDueDate")}</th>
              </tr></thead>
              <tbody>
                {selectedFarmer.dewormings.map((d) => (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="py-2">{formatDate(d.dateGiven)}</td>
                    <td className="py-2">{formatDate(d.nextDueDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-muted-foreground">{t("noData")}</p>}
        </Card>

        {/* Service Demands */}
        <Card className="p-4 bg-card">
          <h3 className="text-base font-bold mb-3 text-foreground">{t("serviceDemands")}</h3>
          {selectedFarmer.serviceDemands.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedFarmer.serviceDemands.map((d) => (
                <div key={d.id} className="flex items-center justify-between py-1 border-b border-border/30">
                  <span className="text-sm text-foreground">{d.type} ({d.quantity})</span>
                  <Badge className={d.status === "Completed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>{d.status}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">{t("noData")}</p>}
        </Card>

        {/* Disease Reports */}
        <Card className="p-4 bg-card">
          <h3 className="text-base font-bold mb-3 text-foreground">{t("diseaseReports")}</h3>
          {selectedFarmer.diseaseReports.length > 0 ? (
            <div className="flex flex-col gap-2">
              {selectedFarmer.diseaseReports.map((r) => (
                <div key={r.id} className="flex items-start justify-between py-1 border-b border-border/30">
                  <div>
                    <p className="text-sm text-foreground">{r.description}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.reportedAt)}</p>
                  </div>
                  <Badge className={r.status === "Reviewed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>{r.status}</Badge>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">{t("noData")}</p>}
        </Card>
      </div>
    );
  }

  const filtered = farmers.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.phone.includes(search);
    const matchHamlet = !hamletFilter || f.hamlet === hamletFilter;
    return matchSearch && matchHamlet;
  });

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-foreground">{t("farmerList")}</h2>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder={t("searchFarmers")}
            className="pl-9"
          />
        </div>
        <select
          value={hamletFilter}
          onChange={(e) => { setHamletFilter(e.target.value); setPage(0); }}
          className="border border-input rounded-md px-3 py-2 text-sm bg-card text-foreground"
        >
          <option value="">{t("allHamlets")}</option>
          {HAMLETS.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      <Card className="p-0 bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">{t("farmerName")}</th>
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">{t("hamlet")}</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">{t("totalBirds")}</th>
                <th className="text-center py-3 px-4 text-muted-foreground font-medium">{t("phone")}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((f) => {
                const latest = f.birdUpdates[0];
                const birds = latest ? latest.chicks + latest.growers + latest.layers + latest.broilers : 0;
                return (
                  <tr
                    key={f.userId}
                    onClick={() => setSelectedFarmer(f)}
                    className="border-b border-border/50 cursor-pointer hover:bg-muted/50"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">{f.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{f.hamlet}</td>
                    <td className="text-center py-3 px-4">{birds}</td>
                    <td className="text-center py-3 px-4 text-muted-foreground">{f.phone}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-3 border-t border-border">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>←</Button>
            <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>→</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CrpFarmersTab;
