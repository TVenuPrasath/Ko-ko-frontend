import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PLF_GROUPS } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";

interface FarmerSelectionScreenProps {
  onNext: (data: { isPlf: boolean; groupName: string }) => void;
  onBack: () => void;
}

const FarmerSelectionScreen = ({ onNext, onBack }: FarmerSelectionScreenProps) => {
  const { t } = useLanguage();
  const [choice, setChoice] = useState<"plf" | "non">("plf");
  const [groupName, setGroupName] = useState(PLF_GROUPS[0]);

  return (
    <div className="flex flex-col min-h-screen p-5">
      <button onClick={onBack} className="flex items-center gap-1 text-primary mb-4 tap-target justify-start">
        <ArrowLeft size={20} /> {t("back")}
      </button>

      <h1 className="text-xl font-bold text-center mb-6 text-foreground">{t("farmerSelection")}</h1>

      <Card className="p-5 bg-card flex flex-col gap-3">
        <label className="flex items-center gap-3 p-3 border-2 border-input rounded-lg cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="radio"
            name="plf"
            checked={choice === "plf"}
            onChange={() => setChoice("plf")}
            className="w-5 h-5 accent-primary"
          />
          <span className="text-base font-medium text-foreground">{t("plfMember")}</span>
        </label>

        {choice === "plf" && (
          <div className="pl-10 flex flex-col gap-2">
            <Label className="text-sm text-muted-foreground italic">({t("groupName")})</Label>
            {PLF_GROUPS.map((g) => (
              <label key={g} className="flex items-center gap-3 py-1 cursor-pointer">
                <input
                  type="radio"
                  name="group"
                  value={g}
                  checked={groupName === g}
                  onChange={() => setGroupName(g)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-base text-foreground">{g}</span>
              </label>
            ))}
          </div>
        )}

        <label className="flex items-center gap-3 p-3 border-2 border-input rounded-lg cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="radio"
            name="plf"
            checked={choice === "non"}
            onChange={() => setChoice("non")}
            className="w-5 h-5 accent-primary"
          />
          <span className="text-base font-medium text-foreground">{t("nonPlfMember")}</span>
        </label>
      </Card>

      <Button
        onClick={() => onNext({ isPlf: choice === "plf", groupName: choice === "plf" ? groupName : "" })}
        className="tap-target w-full text-lg font-semibold mt-6 bg-primary text-primary-foreground"
      >
        {t("continue")}
      </Button>
    </div>
  );
};

export default FarmerSelectionScreen;
