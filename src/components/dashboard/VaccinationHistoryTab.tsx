import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { Calendar, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

function formatTamilDate(dateStr: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}
function isOverdue(dateStr: string): boolean {
  return !!dateStr && new Date(dateStr) < new Date();
}

const typeLabel: Record<string, string> = {
  white_diarrhea: "வெள்ளை கழிச்சல் தடுப்பூசி",
  smallpox: "அம்மை தடுப்பூசி",
  deworming: "குடற்புழு நீக்கம்",
};

const VaccinationHistoryTab = () => {
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    api.getVaccinations().then(setRecords).catch(() => {});
  }, []);

  const nextVac = records.find((r) => r.type !== "deworming");
  const nextDeworm = records.find((r) => r.type === "deworming");

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-primary text-primary-foreground p-4 rounded-xl">
        <p className="text-base font-bold">தடுப்பூசி வரலாறு</p>
        <p className="text-xs opacity-90">(Vaccination & Deworming History)</p>
      </Card>

      {/* Next due banners */}
      {nextVac && (
        <Card className={`p-3 border-2 ${isOverdue(nextVac.nextDueDate) ? "border-danger bg-danger/10" : "border-primary bg-primary/5"}`}>
          <p className="text-xs text-muted-foreground">அடுத்த தடுப்பூசி தேதி</p>
          <p className={`text-base font-bold ${isOverdue(nextVac.nextDueDate) ? "text-danger" : "text-primary"}`}>
            {formatTamilDate(nextVac.nextDueDate)} {isOverdue(nextVac.nextDueDate) && "⚠️ காலாவதி"}
          </p>
        </Card>
      )}
      {nextDeworm && (
        <Card className={`p-3 border-2 ${isOverdue(nextDeworm.nextDueDate) ? "border-danger bg-danger/10" : "border-primary bg-primary/5"}`}>
          <p className="text-xs text-muted-foreground">அடுத்த குடற்புழு நீக்கம் தேதி</p>
          <p className={`text-base font-bold ${isOverdue(nextDeworm.nextDueDate) ? "text-danger" : "text-primary"}`}>
            {formatTamilDate(nextDeworm.nextDueDate)} {isOverdue(nextDeworm.nextDueDate) && "⚠️ காலாவதி"}
          </p>
        </Card>
      )}

      {records.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          இன்னும் பதிவுகள் இல்லை. CRP தடுப்பூசி பதிவு செய்த பிறகு இங்கே தெரியும்.
        </Card>
      ) : (
        records.map((r) => (
          <Card key={r._id} className="p-4 border-2">
            <div className="flex items-start gap-3">
              <Calendar size={22} className="text-primary shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-base font-bold text-foreground">{typeLabel[r.type] || r.type}</p>
                <p className="text-xs text-muted-foreground mt-0.5">தேதி: {formatTamilDate(r.dateGiven)}</p>
                {r.ageGroup && <p className="text-xs text-muted-foreground">வயது: {r.ageGroup}</p>}
                <div className="flex items-center gap-2 mt-2">
                  {r.status === "completed" ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success bg-success/10 px-2 py-1 rounded">
                      <CheckCircle2 size={14} /> நிறைவேற்றப்பட்டது
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-warning bg-warning/10 px-2 py-1 rounded">
                      <Clock size={14} /> நிலுவையில் உள்ளது
                    </span>
                  )}
                </div>
                <p className="text-xs mt-2 flex items-center gap-1">
                  {isOverdue(r.nextDueDate) && r.status === "pending" && <AlertTriangle size={14} className="text-danger" />}
                  அடுத்த தேதி:{" "}
                  <span className={isOverdue(r.nextDueDate) ? "text-danger font-bold" : "font-medium"}>
                    {formatTamilDate(r.nextDueDate)}
                  </span>
                </p>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default VaccinationHistoryTab;
