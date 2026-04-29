import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

interface UserTypeScreenProps {
  onSelect: (role: "SHG Member" | "CRP") => void;
  onBack: () => void;
}

const UserTypeScreen = ({ onSelect, onBack }: UserTypeScreenProps) => {
  const { t } = useLanguage();
  const [role, setRole] = useState<"SHG Member" | "CRP">("SHG Member");

  return (
    <div className="flex flex-col min-h-screen p-5">
      <button onClick={onBack} className="flex items-center gap-1 text-primary mb-4 tap-target justify-start">
        <ArrowLeft size={20} /> {t("back")}
      </button>

      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-wide">USER TYPE SELECTION</h1>
        <p className="text-sm italic text-muted-foreground mt-1">{t("userTypeFirstTime")}</p>
      </div>

      <Card className="p-5 bg-card flex flex-col gap-4">
        <Label className="text-base font-medium">{t("userType")} :</Label>

        <label className="flex items-start gap-3 p-3 border-2 border-input rounded-lg cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="radio"
            name="usertype"
            value="SHG Member"
            checked={role === "SHG Member"}
            onChange={() => setRole("SHG Member")}
            className="mt-1 w-5 h-5 accent-primary"
          />
          <span className="text-base font-medium text-foreground">{t("userTypeFarmer")}</span>
        </label>

        <label className="flex items-start gap-3 p-3 border-2 border-input rounded-lg cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
          <input
            type="radio"
            name="usertype"
            value="CRP"
            checked={role === "CRP"}
            onChange={() => setRole("CRP")}
            className="mt-1 w-5 h-5 accent-primary"
          />
          <span className="text-base font-medium text-foreground leading-tight">{t("userTypeStaff")}</span>
        </label>
      </Card>

      <Button
        onClick={() => onSelect(role)}
        className="tap-target w-full text-lg font-semibold mt-6 bg-primary text-primary-foreground"
      >
        {t("continue")}
      </Button>
    </div>
  );
};

export default UserTypeScreen;
