import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { addDiseaseReport, getDiseaseReports, formatDate } from "@/lib/mockData";
import { User } from "@/lib/auth";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DiseaseReportTabProps {
  user: User;
}

const DiseaseReportTab = ({ user }: DiseaseReportTabProps) => {
  const { t } = useLanguage();
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!description.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    addDiseaseReport({ description: description.trim(), photo });
    setLoading(false);
    toast.success(t("reportSent") + " ✅");
    setDescription("");
    setPhoto(undefined);
    setRefreshKey((k) => k + 1);
  };

  const reports = getDiseaseReports();

  return (
    <div className="flex flex-col gap-5" key={refreshKey}>
      <Card className="p-5 bg-card">
        <h2 className="text-lg font-bold mb-4 text-foreground">{t("reportDisease")}</h2>

        <div className="mb-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">{t("hamlet")}</p>
          <p className="text-base font-medium text-foreground bg-muted px-3 py-2 rounded-md">{user.hamlet}</p>
        </div>

        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("problemPlaceholder")}
          rows={5}
          className="text-base mb-4"
        />

        <label className="flex items-center gap-2 tap-target justify-start cursor-pointer text-primary font-medium mb-4">
          <Camera size={22} />
          <span>{t("addPhoto")}</span>
          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </label>
        {photo && (
          <img src={photo} alt="Preview" className="w-full h-40 object-cover rounded-lg mb-4" />
        )}

        <Button
          onClick={handleSubmit}
          disabled={!description.trim() || loading}
          className="tap-target w-full text-lg font-semibold bg-danger text-danger-foreground"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : t("reportDisease")}
        </Button>
      </Card>

      {/* Past Reports */}
      {reports.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-3 text-foreground">{t("myPastReports")}</h2>
          <div className="flex flex-col gap-3">
            {reports.map((r) => (
              <Card key={r.id} className="p-4 bg-card">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{formatDate(r.reportedAt)}</p>
                  <Badge className={r.status === "Reviewed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}>
                    {r.status === "Reviewed" ? "🟢 " + t("reviewed") : "🟡 " + t("pending")}
                  </Badge>
                </div>
                <p className="text-base text-foreground">{r.description}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseReportTab;
