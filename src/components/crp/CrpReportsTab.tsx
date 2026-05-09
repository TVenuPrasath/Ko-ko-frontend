import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { Download, FileText, ChevronDown, ChevronUp } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";

function downloadExcel(headers: string[], rows: (string | number)[][], filename: string) {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

async function downloadPDF(title: string, headers: string[], rows: (string | number)[][], filename: string) {
  const container = document.createElement("div");
  container.style.cssText = "position:fixed;left:-9999px;top:0;background:#fff;padding:16px;font-family:sans-serif;width:900px";

  const titleEl = document.createElement("h2");
  titleEl.style.cssText = "font-size:16px;font-weight:bold;margin-bottom:12px;color:#111";
  titleEl.textContent = title;
  container.appendChild(titleEl);

  const table = document.createElement("table");
  table.style.cssText = "width:100%;border-collapse:collapse;font-size:12px";

  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.style.cssText = "background:#e5e7eb;padding:6px 8px;text-align:left;border:1px solid #d1d5db;font-weight:600;color:#111";
    th.textContent = h;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    tr.style.background = i % 2 === 0 ? "#fff" : "#f9fafb";
    row.forEach((cell) => {
      const td = document.createElement("td");
      td.style.cssText = "padding:5px 8px;border:1px solid #e5e7eb;color:#111";
      td.textContent = String(cell ?? "-");
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
  document.body.appendChild(container);

  const canvas = await html2canvas(container, { scale: 2, useCORS: true });
  document.body.removeChild(container);

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({ orientation: canvas.width > canvas.height ? "landscape" : "portrait", unit: "px", format: [canvas.width / 2, canvas.height / 2] });
  pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
  pdf.save(`${filename}.pdf`);
}

function ExportButtons({ onExcel, onPdf }: { onExcel: () => void; onPdf: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const handlePdf = async () => { setLoading(true); await onPdf(); setLoading(false); };
  return (
    <div className="flex gap-2 mt-3">
      <Button size="sm" onClick={onExcel} className="gap-1 bg-success text-success-foreground flex-1">
        <Download size={13} /> Excel
      </Button>
      <Button size="sm" onClick={handlePdf} disabled={loading} variant="outline" className="gap-1 flex-1">
        <FileText size={13} /> {loading ? "உருவாக்குகிறது..." : "PDF"}
      </Button>
    </div>
  );
}

function Section({ title, count, defaultOpen = true, children, onExcel, onPdf }: {
  title: string; count?: number; defaultOpen?: boolean;
  children: React.ReactNode; onExcel: () => void; onPdf: () => Promise<void>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="p-4 bg-card">
      <button className="w-full flex items-center justify-between" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          {count !== undefined && <Badge className="bg-muted text-muted-foreground text-xs">{count}</Badge>}
        </div>
        {open ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
      <ExportButtons onExcel={onExcel} onPdf={onPdf} />
    </Card>
  );
}

const CrpReportsTab = () => {
  const [farmers, setFarmers] = useState<any[]>([]);
  const [demands, setDemands] = useState<any[]>([]);
  const [diseaseReports, setDiseaseReports] = useState<any[]>([]);
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [birdUpdates, setBirdUpdates] = useState<any[]>([]);
  const [saleStocks, setSaleStocks] = useState<any[]>([]);

  useEffect(() => {
    api.getFarmers().then(setFarmers).catch(() => {});
    api.getAllServiceDemands().then(setDemands).catch(() => {});
    api.getAllDiseaseReports().then(setDiseaseReports).catch(() => {});
    api.getAllVaccinations().then(setVaccinations).catch(() => {});
    api.getAllBirdUpdates().then(setBirdUpdates).catch(() => {});
    api.getSaleStocks().then(setSaleStocks).catch(() => {});
  }, []);

  const today = new Date();

  const farmerRows: (string | number)[][] = farmers.map((f) => [f.name, f.phone, f.hamlet, f.shg_name || "-"]);
  const farmerHeadersTamil = ["பெயர்", "தொலைபேசி", "ஊர்", "SHG"];
  const farmerHeadersEn = ["Name", "Phone", "Hamlet", "SHG"];

  const demandTypes = ["Loan", "Feed Stock", "Equipment", "Vaccination", "Deworming"];
  const demandRows: (string | number)[][] = demandTypes.map((type) => {
    const all = demands.filter((d) => d.type === type);
    return [type, all.length, all.filter((d) => d.status === "Pending").length, all.filter((d) => d.status === "Completed").length, all.filter((d) => d.status === "Rejected").length];
  });
  const demandHeadersTamil = ["வகை", "மொத்தம்", "நிலுவை", "நிறைவு", "நிராகரிப்பு"];
  const demandHeadersEn = ["Type", "Total", "Pending", "Completed", "Rejected"];

  const pendingDisease = diseaseReports.filter((r) => r.status === "Pending");
  const diseaseRows: (string | number)[][] = diseaseReports.map((r) => [r.userId?.name || "-", formatDate(r.reportedAt), r.description, r.status]);
  const diseaseHeadersTamil = ["விவசாயி", "தேதி", "விவரம்", "நிலை"];
  const diseaseHeadersEn = ["Farmer", "Date", "Description", "Status"];

  const overdueVax = vaccinations.filter((v) => v.type !== "deworming" && new Date(v.nextDueDate) < today);
  const overdueDew = vaccinations.filter((v) => v.type === "deworming" && new Date(v.nextDueDate) < today);
  const vacRows: (string | number)[][] = vaccinations.map((v) => [
    v.userId?.name || "-",
    v.type === "deworming" ? "குடற்புழு நீக்கம்" : v.type === "smallpox" ? "அம்மை தடுப்பூசி" : "வெள்ளை கழிச்சல்",
    formatDate(v.dateGiven), formatDate(v.nextDueDate),
    new Date(v.nextDueDate) < today ? "காலாவதி" : "சரி",
  ]);
  const vacHeadersTamil = ["விவசாயி", "வகை", "கடைசி தேதி", "அடுத்த தேதி", "நிலை"];

  const weeklyRows: (string | number)[][] = birdUpdates.map((u) => [
    u.userId?.name || "-", formatDate(u.weekDate), u.chicks, u.growers, u.layers, u.broilers,
    u.chicks + u.growers + u.layers + u.broilers,
  ]);
  const weeklyHeadersTamil = ["விவசாயி", "வாரம்", "குஞ்சு", "வளர்ச்சி", "முட்டை", "கறி", "மொத்தம்"];

  const loans = demands.filter((d) => d.type === "Loan");
  const totalRequested = loans.reduce((s, d) => s + (d.amount || 0), 0);
  const totalApproved  = loans.filter((d) => d.status === "Completed").reduce((s, d) => s + (d.amount || 0), 0);
  const totalRejected  = loans.filter((d) => d.status === "Rejected").reduce((s, d) => s + (d.amount || 0), 0);
  const totalPending   = loans.filter((d) => d.status === "Pending").reduce((s, d) => s + (d.amount || 0), 0);
  const loanRows: (string | number)[][] = loans.map((d) => [d.userId?.name || d.farmerName || "-", d.amount || 0, d.notes || "-", d.status, formatDate(d.createdAt)]);
  const loanHeadersTamil = ["விவசாயி", "தொகை", "நோக்கம்", "நிலை", "தேதி"];

  const soldStocks = saleStocks.filter((s) => s.status === "sold");
  const soldRows: (string | number)[][] = soldStocks.map((s) => [s.farmerName, s.hamlet, s.broilers, s.chicks, s.eggs, formatDate(s.createdAt), s.soldAt ? formatDate(s.soldAt) : "-"]);
  const soldHeadersTamil = ["விவசாயி", "ஊர்", "கறிக்கோழி", "குஞ்சு", "முட்டை", "பதிவு தேதி", "விற்பனை தேதி"];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-center text-foreground">அறிக்கைகள் (Reports)</h2>

      <Section title="விவசாயி தரவு" count={farmers.length} defaultOpen={false}
        onExcel={() => downloadExcel(farmerHeadersTamil, farmerRows, "farmer_data")}
        onPdf={() => downloadPDF("விவசாயி தரவு", farmerHeadersTamil, farmerRows, "farmer_data")}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border">{farmerHeadersTamil.map((h) => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}</tr></thead>
            <tbody>{farmerRows.map((row, i) => (<tr key={i} className="border-b border-border/40">{row.map((cell, j) => <td key={j} className="py-2 px-1 text-foreground">{cell}</td>)}</tr>))}</tbody>
          </table>
        </div>
      </Section>

      <Section title="சேவை கோரிக்கை அறிக்கை" defaultOpen={true}
        onExcel={() => downloadExcel(demandHeadersTamil, demandRows, "service_demands")}
        onPdf={() => downloadPDF("சேவை கோரிக்கை அறிக்கை", demandHeadersTamil, demandRows, "service_demands")}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border">{demandHeadersTamil.map((h) => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}</tr></thead>
            <tbody>{demandRows.map((row, i) => (<tr key={i} className="border-b border-border/40"><td className="py-2 px-1 font-medium text-foreground">{row[0]}</td><td className="py-2 px-1 text-center">{row[1]}</td><td className="py-2 px-1 text-center text-warning font-bold">{row[2]}</td><td className="py-2 px-1 text-center text-success font-bold">{row[3]}</td><td className="py-2 px-1 text-center text-danger font-bold">{row[4]}</td></tr>))}</tbody>
          </table>
        </div>
      </Section>

      <Section title="கோரிக்கையாளர் பட்டியல்" defaultOpen={false}
        onExcel={() => {
          const type = demandTypes.find((_, i) => i === 0) || "Loan";
          const allRows: (string | number)[][] = demandTypes.flatMap((type) =>
            demands.filter((d) => d.type === type).map((d, i) => [
              type, i + 1, d.userId?.name || d.farmerName || "-",
              d.userId?.hamlet || d.hamlet || "-",
              d.type === "Loan" ? `₹${(d.amount || 0).toLocaleString()}` : (d.quantity || "-"),
              d.status, formatDate(d.createdAt),
            ])
          );
          downloadExcel(["வகை", "#", "பெயர்", "ஊர்", "தொகை/அளவு", "நிலை", "தேதி"], allRows, "demand_farmers_list");
        }}
        onPdf={async () => {
          for (const type of demandTypes) {
            const list = demands.filter((d) => d.type === type);
            if (list.length === 0) continue;
            const rows = list.map((d, i) => [
              i + 1, d.userId?.name || d.farmerName || "-",
              d.userId?.hamlet || d.hamlet || "-",
              type === "Loan" ? `Rs.${(d.amount || 0).toLocaleString()}` : (d.quantity || "-"),
              d.status, formatDate(d.createdAt),
            ]);
            await downloadPDF(`${type} கோரிக்கையாளர் பட்டியல் (${list.length} பேர்)`, ["#", "பெயர்", "ஊர்", "தொகை/அளவு", "நிலை", "தேதி"], rows, `${type}_farmers`);
          }
        }}>
        <div className="flex flex-col gap-4">
          {demandTypes.map((type) => {
            const list = demands.filter((d) => d.type === type);
            if (list.length === 0) return null;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-bold text-foreground">{type}</p>
                  <Badge className="bg-primary text-primary-foreground text-xs">{list.length} பேர்</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-border">
                      <th className="text-left py-1.5 px-1 text-muted-foreground">#</th>
                      <th className="text-left py-1.5 px-1 text-muted-foreground">பெயர்</th>
                      <th className="text-left py-1.5 px-1 text-muted-foreground">ஊர்</th>
                      <th className="text-left py-1.5 px-1 text-muted-foreground">தொகை/அளவு</th>
                      <th className="text-left py-1.5 px-1 text-muted-foreground">நிலை</th>
                    </tr></thead>
                    <tbody>
                      {list.map((d, i) => (
                        <tr key={d._id} className="border-b border-border/40">
                          <td className="py-1.5 px-1 text-muted-foreground">{i + 1}</td>
                          <td className="py-1.5 px-1 font-medium text-foreground">{d.userId?.name || d.farmerName || "-"}</td>
                          <td className="py-1.5 px-1 text-foreground">{d.userId?.hamlet || d.hamlet || "-"}</td>
                          <td className="py-1.5 px-1 text-foreground">{type === "Loan" ? `₹${(d.amount || 0).toLocaleString()}` : (d.quantity || "-")}</td>
                          <td className="py-1.5 px-1">
                            <span className={`font-semibold ${
                              d.status === "Completed" ? "text-success" :
                              d.status === "Rejected" ? "text-danger" : "text-warning"
                            }`}>{d.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="நோய் அறிக்கை பதிவு" count={pendingDisease.length} defaultOpen={true}
        onExcel={() => downloadExcel(diseaseHeadersTamil, diseaseRows, "disease_reports")}
        onPdf={() => downloadPDF("நோய் அறிக்கை பதிவு", diseaseHeadersTamil, diseaseRows, "disease_reports")}>
        <div className="flex flex-col gap-2">
          {diseaseReports.slice(0, 20).map((r, i) => (
            <div key={i} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground">{r.userId?.name || "-"} • {formatDate(r.reportedAt)}</p>
                <Badge className={r.status === "Reviewed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                  {r.status === "Reviewed" ? "பரிசீலிக்கப்பட்டது" : "நிலுவையில்"}
                </Badge>
              </div>
              <p className="text-sm text-foreground">{r.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="தடுப்பூசி நிலை" count={overdueVax.length + overdueDew.length} defaultOpen={false}
        onExcel={() => downloadExcel(vacHeadersTamil, vacRows, "vaccination_status")}
        onPdf={() => downloadPDF("தடுப்பூசி நிலை", vacHeadersTamil, vacRows, "vaccination_status")}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-danger/10 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-danger">{overdueVax.length}</p><p className="text-xs text-muted-foreground">தடுப்பூசி காலாவதி</p></div>
          <div className="bg-warning/10 rounded-lg p-3 text-center"><p className="text-2xl font-bold text-warning">{overdueDew.length}</p><p className="text-xs text-muted-foreground">குடற்புழு காலாவதி</p></div>
        </div>
      </Section>

      <Section title="வாராந்திர புதுப்பிப்பு வரலாறு" defaultOpen={false}
        onExcel={() => downloadExcel(weeklyHeadersTamil, weeklyRows, "weekly_history")}
        onPdf={() => downloadPDF("வாராந்திர புதுப்பிப்பு வரலாறு", weeklyHeadersTamil, weeklyRows, "weekly_history")}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-border">{weeklyHeadersTamil.map((h) => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}</tr></thead>
            <tbody>{weeklyRows.map((row, i) => (<tr key={i} className="border-b border-border/40">{row.map((cell, j) => <td key={j} className={`py-2 px-1 ${j === 6 ? "font-bold text-primary" : "text-foreground"}`}>{cell}</td>)}</tr>))}</tbody>
          </table>
        </div>
      </Section>

      <Section title="கடன் சுருக்கம்" count={loans.length} defaultOpen={false}
        onExcel={() => downloadExcel(loanHeadersTamil, loanRows, "loan_summary")}
        onPdf={() => downloadPDF("கடன் சுருக்கம்", loanHeadersTamil, loanRows, "loan_summary")}>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-muted/40 rounded-lg p-3 text-center"><p className="text-lg font-bold text-foreground">₹{totalRequested.toLocaleString()}</p><p className="text-xs text-muted-foreground">மொத்த கோரிக்கை</p></div>
          <div className="bg-warning/10 rounded-lg p-3 text-center"><p className="text-lg font-bold text-warning">₹{totalPending.toLocaleString()}</p><p className="text-xs text-muted-foreground">நிலுவையில்</p></div>
          <div className="bg-success/10 rounded-lg p-3 text-center"><p className="text-lg font-bold text-success">₹{totalApproved.toLocaleString()}</p><p className="text-xs text-muted-foreground">அனுமதிக்கப்பட்டது</p></div>
          <div className="bg-danger/10 rounded-lg p-3 text-center"><p className="text-lg font-bold text-danger">₹{totalRejected.toLocaleString()}</p><p className="text-xs text-muted-foreground">நிராகரிக்கப்பட்டது</p></div>
        </div>
      </Section>

      <Section title="விற்பனை இருப்பு வரலாறு" count={soldStocks.length} defaultOpen={false}
        onExcel={() => downloadExcel(soldHeadersTamil, soldRows, "sold_stocks")}
        onPdf={() => downloadPDF("விற்பனை இருப்பு வரலாறு", soldHeadersTamil, soldRows, "sold_stocks")}>
        {soldStocks.length === 0 ? <p className="text-sm text-muted-foreground">விற்பனை வரலாறு இல்லை</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-border">{soldHeadersTamil.map((h) => <th key={h} className="text-left py-2 px-1 text-muted-foreground font-medium">{h}</th>)}</tr></thead>
              <tbody>{soldRows.map((row, i) => (<tr key={i} className="border-b border-border/40">{row.map((cell, j) => <td key={j} className="py-2 px-1 text-foreground">{cell}</td>)}</tr>))}</tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
};

export default CrpReportsTab;
