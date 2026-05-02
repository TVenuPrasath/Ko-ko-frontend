import { Card } from "@/components/ui/card";
import { getVaccinationHistory, getNextDue, formatTamilDate, isOverdue, VaccinationRecord } from "@/lib/marketAndHistory";
import { Calendar, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const typeLabel: Record<VaccinationRecord["type"], string> = {
  white_diarrhea: "வெள்ளை கழிச்சல் தடுப்பூசி",
  smallpox: "அம்மை தடுப்பூசி",
  deworming: "குடற்புழு நீக்கம்",
};

const VaccinationHistoryTab = () => {
  const records = getVaccinationHistory();
  const nextVac = getNextDue("white_diarrhea") || getNextDue("smallpox");
  const nextDeworm = getNextDue("deworming");

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-primary text-primary-foreground p-4 rounded-xl">
        <p className="text-base font-bold">தடுப்பூசி வரலாறு</p>
        <p className="text-xs opacity-90">(Vaccination & Deworming History)</p>
      </Card>

      {/* Summary banner */}
      <div className="grid grid-cols-1 gap-2">
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
      </div>

      {records.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground">
          இன்னும் பதிவுகள் இல்லை
        </Card>
      ) : (
        records.map((r) => (
          <Card key={r.id} className="p-4 border-2">
            <div className="flex items-start gap-3">
              <Calendar size={22} className="text-primary shrink-0 mt-1" />
              <div className="flex-1">
                <p className="text-base font-bold text-foreground">{typeLabel[r.type]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">தேதி: {formatTamilDate(r.date)}</p>
                <p className="text-xs text-muted-foreground">வயது: {r.ageGroup}</p>
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
                  அடுத்த தேதி: <span className={isOverdue(r.nextDueDate) ? "text-danger font-bold" : "font-medium"}>{formatTamilDate(r.nextDueDate)}</span>
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
