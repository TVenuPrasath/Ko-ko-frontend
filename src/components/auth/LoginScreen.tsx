import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginWithPhone, User } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface LoginScreenProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
}

const LoginScreen = ({ onSuccess, onBack }: LoginScreenProps) => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");

  const handleSubmit = () => {
    if (phone.length !== 10) return;
    const result = loginWithPhone(phone);
    if (result.success && result.user) {
      toast.success("✅ உள்நுழைவு வெற்றி");
      onSuccess(result.user);
    } else {
      toast.error("இந்த எண் பதிவு செய்யப்படவில்லை");
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <button onClick={onBack} className="flex items-center gap-1 text-primary mb-6 tap-target justify-start">
        <ArrowLeft size={20} /> {t("back")}
      </button>
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t("login")}</h1>

      <div>
        <Label className="text-base font-medium mb-2 block">{t("phoneNumber")}</Label>
        <Input
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
          className="tap-target text-base"
          placeholder="9876543210"
          inputMode="numeric"
          type="tel"
        />
      </div>

      <div className="mt-3 p-3 bg-muted/40 rounded-md text-xs text-muted-foreground">
        <p className="font-medium mb-1">Demo Accounts:</p>
        <p>👩‍🌾 Farmer — <span className="font-mono">9842100001</span></p>
        <p>👷 CRP — <span className="font-mono">9876500000</span></p>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={phone.length !== 10}
        className="tap-target w-full text-lg font-semibold mt-8 bg-primary text-primary-foreground"
      >
        {t("login")}
      </Button>
    </div>
  );
};

export default LoginScreen;
