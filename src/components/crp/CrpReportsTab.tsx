import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMockFarmers, getAggregatedStock } from "@/lib/crpMockData";
import { mockServiceDemands, mockDiseaseReports, mockVaccinations, mockBirdUpdates, api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

function downloadExcel(headers: string[], rows: (string | number)[][], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function downloadPDF(title: string, headers: string[], rows: (string | number)[][], filename: string) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const marginL = 14;
  const usableW = 277 - marginL * 2;
  const colW = Math.floor(usableW / headers.length);
  let y = 20;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, marginL, y);
  y += 8;

  doc.setFontSize(8);
  doc.setFillColor(200, 200, 200);
  doc.rect(marginL, y - 4, usableW, 7, "F");
  headers.forEach((h, i) => doc.text(h, marginL + i * colW, y));
  y += 8;

  doc.setFont("helvetica", "normal");
  rows.forEach((row) => {
    if (y > 190) { doc.addPage(); y = 20; }
    row.forEach((cell, i) => doc.text(String(cell ?? "-"), marginL + i * colW, y));
    y += 6;
  });

  doc.save(`${filename}.pdf`);
}

function ExportButtons({ onExcel, onPdf }: { onExcel: () => void; onPdf: () => void }) {
  return (
    <div className="flex gap-2 mt-3">
      <Button size="sm" onClick={onExcel} className="gap-1 bg-success text-success-foreground flex-1">
        <Download size={13} /> Excel
      </Button>
      <Button size="sm" onClick={onPdf} variant="outline" className="gap-1 flex-1">
        <FileText size={13} /> PDF
      </Button>
    </div>
  );
}

const CrpReportsTab = () => {
  const farmers = getMockFarmers();
  const stock = getAggregatedStock();
  const today = new Date();
  const [diseaseRefresh, setDiseaseRefresh] = useState(0);

  // 1. Bird Stock
  const stockRowsTamil: (string | number)[][] = [
    ["குஞ்சுகள்", stock.chicks],
    ["வளர்ச்சி", stock.growers],
    ["முட்டையிடும்", stock.layers],
    ["கறிக்கோழி", stock.broilers],
    ["மொத்தம்", stock.total],
  ];
  const stockRowsEn: (string | number)[][] = [
    ["Chicks", stock.chicks],
    ["Growers", stock.growers],
    ["Layers", stock.layers],
    ["Broilers", stock.broilers],
    ["Total", stock.total],
  ];

  // 2. Farmer Data
  const farmerHeadersTamil = ["பெயர்", "தொலைபேசி", "ஊர்", "SHG", "மொத்த கோழிகள்"];
  const farmerHeadersEn = ["Name", "Phone", "Hamlet", "SHG", "Total Birds"];
  const farmerRows: (string | number)[][] = farmers.map((f) => {
    const latest = f.birdUpdates[0];
    const total = latest ? latest.chicks + latest.growers + latest.layers + latest.broilers : 0;
    return [f.name, f.phone, f.hamlet, f.shgName, total];
  });

  // 3. Service Demands
  const demandTypes = ["Loan", "Feed Stock", "Equipment", "Vaccination", "Deworming"];
  const demandHeadersTamil = ["வகை", "மொத்தம்", "நிலுவை", "நிறைவு", "நிராகரிப்பு"];
  const demandHeadersEn = ["Type", "Total", "Pending", "Completed", "Rejected"];
  const demandRows: (string | number)[][] = demandTypes.map((type) => {
    const all = mockServiceDemands.filter((d) => d.type === type);
    return [type, all.length,
      all.filter((d) => d.status === "Pending").length,
      all.filter((d) => d.status === "Completed").length,
      all.filter((d) => d.status === "Rejected").length,
    ];
  });

  // 4. Disease Reports
  const diseaseHeadersTamil = ["விவசாயி", "தேதி", "விவரம்", "நிலை"];
  const diseaseHeadersEn = ["Farmer", "Date", "Description", "Status"];
  const diseaseRowsTamil: (string | number)[][] = mockDiseaseReports.map((r) => [
    farmers.find((f) => f.userId === r.userId)?.name ?? "-",
    formatDate(r.reportedAt), r.description, r.status,
  ]);
  const diseaseRowsEn: (string | number)[][] = mockDiseaseReports.map((r) => [
    farmers.find((f) => f.userId === r.userId)?.name ?? "-",
    formatDate(r.reportedAt), r.description, r.status,
  ]);

  // 5. Vaccination
  const overdueVax = mockVaccinations.filter((v) => v.type !== "deworming" && new Date(v.nextDueDate) < today);
  const overdueDew = mockVaccinations.filter((v) => v.type === "deworming" && new Date(v.nextDueDate) < today);
  const vacHeadersTamil = ["விவசாயி", "வகை", "கடைசி தேதி", "அடுத்த தேதி", "நிலை"];
  const vacHeadersEn = ["Farmer", "Type", "Date Given", "Next Due", "Status"];
  const vacRowsTamil: (string | number)[][] = mockVaccinations.map((v) => [
    farmers.find((f) => f.userId === v.userId)?.name ?? "-",
    v.type === "deworming" ? "குடற்புழு நீக்கம்" : v.type === "smallpox" ? "அம்மை தடுப்பூசி" : "வெள்ளை கழிச்சல்",
    formatDate(v.dateGiven), formatDate(v.nextDueDate),
    new Date(v.nextDueDate) < today ? "காலாவதி" : "சரி",
  ]);
  const vacRowsEn: (string | number)[][] = mockVaccinations.map((v) => [
    farmers.find((f) => f.userId === v.userId)?.name ?? "-",
    v.type === "deworming" ? "Deworming" : v.type === "smallpox" ? "Smallpox" : "White Diarrhea",
    formatDate(v.dateGiven), formatDate(v.nextDueDate),
    new Date(v.nextDueDate) < today ? "Overdue" : "OK",
  ]);

  // 6. Weekly History
  const weeklyHeadersTamil = ["வாரம்", "குஞ்சு", "வளர்ச்சி", "முட்டை", "கறி", "மொத்தம்"];
  const weeklyHeadersEn = ["Week", "Chicks", "Growers", "Layers", "Broilers", "Total"];
  const weeklyRows: (string | number)[][] = mockBirdUpdates.map((u) => [
    formatDate(u.weekDate), u.chicks, u.growers, u.layers, u.broilers,
    u.chicks + u.growers + u.layers + u.broilers,
  ]);

  // 7. Loans
  const loans = mockServiceDemands.filter((d) => d.type === "Loan");
  const totalRequested = loans.reduce((s, d) => s + (d.amount || 0), 0);
  const totalApproved  = loans.filter((d) => d.status === "Completed").reduce((s, d) => s + (d.amount || 0), 0);
  const totalRejected  = loans.filter((d) => d.status === "Rejected").reduce((s, d) => s + (d.amount || 0), 0);
  const totalPending   = loans.filter((d) => d.status === "Pending").reduce((s, d) => s + (d.amount || 0), 0);
  const loanHeadersTamil = ["விவசாயி", "தொகை", "நோக்கம்", "நிலை", "தேதி"];
  const loanHeadersEn = ["Farmer", "Amount (Rs)", "Purpose", "Status", "Date"];
  const loanRowsTamil: (string | number)[][] = loans.map((d) => [
    d.userId?.name || d.farmerName, d.amount || 0, d.notes || "-", d.status, formatDate(d.createdAt),
  ]);
  const loanRowsEn: (string | number)[][] = loans.map((d) => [
    d.userId?.name || d.farmerName, d.amount || 0, d.notes || "-", d.status, formatDate(d.createdAt),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-lg font-bold text-center text-foreground">அறிக்கைகள் (Reports)</h2>

      {/* 1. Bird Stock */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">🐔 கோழி இருப்பு நிலை</h3>
        <div className="grid grid-cols-2 gap-2">
          {stockRowsTamil.slice(0, 4).map(([label, count]) => (
            <div key={label} className="bg-muted/40 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 bg-primary/10 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stock.total}</p>
          <p className="text-xs text-muted-foreground">மொத்தம் (Total)</p>
        </div>
        <ExportButtons
          onExcel={() => downloadExcel(["வகை", "எண்ணிக்கை"], stockRowsTamil, "bird_stock")}
          onPdf={() => downloadPDF("Bird Stock Summary", ["Type", "Count"], stockRowsEn, "bird_stock")}
        />
      </Card>

      {/* 2. Farmer Data */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">👩‍🌾 விவசாயி தரவு ({farmers.length} பேர்)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {farmerHeadersTamil.map((h) => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {farmerRows.map((row, i) => (
                <tr key={i} className="border-b border-border/40">
                  {row.map((cell, j) => <td key={j} className="py-2 px-1 text-foreground">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ExportButtons
          onExcel={() => downloadExcel(farmerHeadersTamil, farmerRows, "farmer_data")}
          onPdf={() => downloadPDF("Farmer Data", farmerHeadersEn, farmerRows, "farmer_data")}
        />
      </Card>

      {/* 3. Service Demands */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">📋 சேவை கோரிக்கை அறிக்கை</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {demandHeadersTamil.map((h) => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {demandRows.map((row, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td className="py-2 px-1 font-medium text-foreground">{row[0]}</td>
                  <td className="py-2 px-1 text-center">{row[1]}</td>
                  <td className="py-2 px-1 text-center text-warning font-bold">{row[2]}</td>
                  <td className="py-2 px-1 text-center text-success font-bold">{row[3]}</td>
                  <td className="py-2 px-1 text-center text-danger font-bold">{row[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ExportButtons
          onExcel={() => downloadExcel(demandHeadersTamil, demandRows, "service_demands")}
          onPdf={() => downloadPDF("Service Demand Report", demandHeadersEn, demandRows, "service_demands")}
        />
      </Card>

      {/* 4. Disease Reports */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">🦠 நோய் அறிக்கை பதிவு</h3>
        <div className="flex flex-col gap-2" key={diseaseRefresh}>
          {mockDiseaseReports.map((r, i) => (
            <div key={i} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{formatDate(r.reportedAt)}</p>
                <Badge className={r.status === "Reviewed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                  {r.status === "Reviewed" ? "✅ பரிசீலிக்கப்பட்டது" : "🟡 நிலுவையில்"}
                </Badge>
              </div>
              <p className="text-sm text-foreground mb-2">{r.description}</p>
              {r.status === "Pending" && (
                <Button size="sm" className="w-full bg-success text-success-foreground text-xs"
                  onClick={async () => {
                    await api.reviewDiseaseReport(r._id);
                    toast.success("பரிசீலிக்கப்பட்டது ✅");
                    setDiseaseRefresh((k) => k + 1);
                  }}
                >
                  ✅ பரிசீலிக்கப்பட்டதாக குறி
                </Button>
              )}
            </div>
          ))}
        </div>
        <ExportButtons
          onExcel={() => downloadExcel(diseaseHeadersTamil, diseaseRowsTamil, "disease_reports")}
          onPdf={() => downloadPDF("Disease Report Log", diseaseHeadersEn, diseaseRowsEn, "disease_reports")}
        />
      </Card>

      {/* 5. Vaccination Status */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">💉 தடுப்பூசி நிலை</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-danger/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-danger">{overdueVax.length}</p>
            <p className="text-xs text-muted-foreground">தடுப்பூசி காலாவதி</p>
          </div>
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-warning">{overdueDew.length}</p>
            <p className="text-xs text-muted-foreground">குடற்புழு காலாவதி</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {vacHeadersTamil.map((h) => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {vacRowsTamil.map((row, i) => (
                <tr key={i} className="border-b border-border/40">
                  {row.map((cell, j) => <td key={j} className="py-2 px-1 text-foreground">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ExportButtons
          onExcel={() => downloadExcel(vacHeadersTamil, vacRowsTamil, "vaccination_status")}
          onPdf={() => downloadPDF("Vaccination Status", vacHeadersEn, vacRowsEn, "vaccination_status")}
        />
      </Card>

      {/* 6. Weekly History */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">📅 வாராந்திர புதுப்பிப்பு வரலாறு</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {weeklyHeadersTamil.map((h) => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {weeklyRows.map((row, i) => (
                <tr key={i} className="border-b border-border/40">
                  {row.map((cell, j) => (
                    <td key={j} className={`py-2 px-1 ${j === 5 ? "font-bold text-primary" : "text-foreground"}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ExportButtons
          onExcel={() => downloadExcel(weeklyHeadersTamil, weeklyRows, "weekly_history")}
          onPdf={() => downloadPDF("Weekly Update History", weeklyHeadersEn, weeklyRows, "weekly_history")}
        />
      </Card>

      {/* 7. Loan Summary */}
      <Card className="p-4 bg-card">
        <h3 className="text-base font-bold mb-3 text-foreground">💰 கடன் சுருக்கம்</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-foreground">Rs.{totalRequested.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">மொத்த கோரிக்கை</p>
          </div>
          <div className="bg-warning/10 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-warning">Rs.{totalPending.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">நிலுவையில்</p>
          </div>
          <div className="bg-success/10 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-success">Rs.{totalApproved.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">அனுமதிக்கப்பட்டது</p>
          </div>
          <div className="bg-danger/10 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-danger">Rs.{totalRejected.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">நிராகரிக்கப்பட்டது</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {loanHeadersTamil.map((h) => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loanRowsTamil.map((row, i) => (
                <tr key={i} className="border-b border-border/40">
                  {row.map((cell, j) => <td key={j} className="py-2 px-1 text-foreground">{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ExportButtons
          onExcel={() => downloadExcel(loanHeadersTamil, loanRowsTamil, "loan_summary")}
          onPdf={() => downloadPDF("Loan Summary", loanHeadersEn, loanRowsEn, "loan_summary")}
        />
      </Card>
    </div>
  );
};

export default CrpReportsTab;
