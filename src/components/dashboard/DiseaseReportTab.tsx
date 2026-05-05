import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/mockData";
import { User } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DiseaseReportTabProps {
  user: User;
}

const SYMPTOM_KEYS = [
  "symptomGreenWhiteDischarge",
  "symptomNeckBending",
  "symptomLyingOnFloor",
  "symptomBreathingDifficulty",
  "symptomCombColorChange",
  "symptomBleeding",
  "symptomPoxLesions",
  "symptomEyeSwelling",
] as const;

const DiseaseReportTab = ({ user }: DiseaseReportTabProps) => {
  const { t } = useLanguage();
  const [symptoms, setSymptoms] = useState<Record<string, boolean>>({});
  const [affected, setAffected] = useState("");
  const [death, setDeath] = useState("");
  const [otherNote, setOtherNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    api.getDiseaseReports().then(setReports).catch(() => {});
  }, [refreshKey]);

  const toggleSymptom = (key: string) => {
    setSymptoms((s) => ({ ...s, [key]: !s[key] }));
  };

  const handleSubmit = async () => {
    const selected = SYMPTOM_KEYS.filter((k) => symptoms[k]).map((k) => t(k));
    if (selected.length === 0 && !affected && !death && !otherNote) {
      toast.error("ஒரு அறிகுறியையாவது தேர்ந்தெடுக்கவும்");
      return;
    }
    setLoading(true);
    try {
      const parts = [];
      if (selected.length > 0) parts.push(`அறிகுறிகள்: ${selected.join(", ")}`);
      if (otherNote.trim()) parts.push(`கூடுதல் குறிப்பு: ${otherNote.trim()}`);
      parts.push(`நோய்வாய்: ${affected || 0}`);
      parts.push(`இறப்பு: ${death || 0}`);
      const desc = parts.join(" | ");
      await api.submitDiseaseReport({ description: desc });
      toast.success(t("reportSent") + " ✅");
      setSymptoms({});
      setAffected("");
      setDeath("");
      setOtherNote("");
      setRefreshKey((k) => k + 1);
    } catch (err: any) {
      toast.error(err.message || "Submit failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5" key={refreshKey}>
      <Card className="p-4 bg-card">
        <div className="text-center mb-3">
          <h2 className="text-base font-bold text-foreground">{t("reportDisease")}</h2>
          <p className="text-xs italic text-muted-foreground">{t("reportDiseaseEn")}</p>
        </div>

        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground">{t("hamlet")}</p>
          <Input
            value={user.hamlet}
            readOnly
            className="mt-0.5 bg-muted text-foreground"
          />
        </div>

        <p className="text-sm font-medium text-foreground mb-2">{t("symptoms")}</p>
        <div className="flex flex-col gap-2">
          {SYMPTOM_KEYS.map((key) => (
            <label key={key} className="flex items-center justify-between py-1.5 px-2 border-b border-border/30 cursor-pointer">
              <span className="text-sm text-foreground flex-1">{t(key)}</span>
              <Checkbox
                checked={!!symptoms[key]}
                onCheckedChange={() => toggleSymptom(key)}
                className="w-5 h-5"
              />
            </label>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-foreground flex-1">{t("affectedCount")}</span>
            <Input
              value={affected}
              onChange={(e) => setAffected(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="w-24 text-center text-base"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-foreground flex-1">{t("deathCount")}</span>
            <Input
              value={death}
              onChange={(e) => setDeath(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className="w-24 text-center text-base"
            />
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-sm text-foreground">கூடுதல் குறிப்பு / Other notes</span>
            <Textarea
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              placeholder="எ.கா. கோழிகள் தீவனம் சாப்பிடவில்லை, வேறு நோய் அறிகுறிகள்..."
              rows={3}
              className="text-sm resize-none"
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="tap-target w-full text-lg font-semibold bg-danger text-danger-foreground mt-4"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : t("register")}
        </Button>
      </Card>

      {reports.length > 0 && (
        <div>
          <h2 className="text-base font-bold mb-3 text-foreground">{t("myPastReports")}</h2>
          <div className="flex flex-col gap-3">
            {reports.map((r) => (
              <Card key={r._id} className="p-3 bg-card">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-xs text-muted-foreground">{formatDate(r.reportedAt)}</p>
                  <Badge className={r.status === "Reviewed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                    {r.status === "Reviewed" ? "🟢 " + t("reviewed") : "🟡 " + t("pending")}
                  </Badge>
                </div>
                <p className="text-sm text-foreground">{r.description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseReportTab;
