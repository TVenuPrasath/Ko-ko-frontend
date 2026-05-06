import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

interface ChooseActionScreenProps {
  onRegister: () => void;
  onLogin: (phone: string) => void;
}

const ChooseActionScreen = ({ onRegister, onLogin }: ChooseActionScreenProps) => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");

  const handleLogin = () => {
    if (phone.length !== 10) return;
    onLogin(phone);
  };

  return (
    <div className="flex flex-col min-h-screen p-5 gap-5">
      {/* Logo + App name */}
      <Card className="p-5 flex items-center gap-4 bg-card">
        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-3xl shrink-0">
          🐔
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground leading-tight">{t("appNameTamil")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("appTagline")}</p>
        </div>
      </Card>

      {/* New user registration */}
      <Button
        onClick={onRegister}
        variant="outline"
        className="tap-target w-full text-lg font-semibold rounded-lg border-2 border-primary text-primary"
      >
        {t("newRegistration")}
      </Button>

      {/* Login — phone only */}
      <Card className="p-5 bg-card flex flex-col gap-4">
        <p className="text-sm font-bold text-foreground text-center">{t("login")}</p>

        <div>
          <Label className="text-base font-medium mb-2 block">{t("phoneNumber")} :</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="tap-target text-base"
            placeholder="9876543210"
            inputMode="numeric"
            type="tel"
          />
        </div>

        <Button
          onClick={handleLogin}
          disabled={phone.length !== 10}
          className="tap-target w-full text-lg font-semibold bg-primary text-primary-foreground"
        >
          {t("login")}
        </Button>
      </Card>
    </div>
  );
};

export default ChooseActionScreen;
