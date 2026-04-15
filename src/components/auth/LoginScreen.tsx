import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockLogin } from "@/lib/auth";
import { ArrowLeft, Loader2 } from "lucide-react";

interface LoginScreenProps {
  onOtp: (phone: string) => void;
  onBack: () => void;
}

const LoginScreen = ({ onOtp, onBack }: LoginScreenProps) => {
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("SHG Member");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (phone.length !== 10) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    mockLogin(phone, role);
    setLoading(false);
    onOtp(phone);
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <button onClick={onBack} className="flex items-center gap-1 text-primary mb-6 tap-target justify-start">
        <ArrowLeft size={20} /> {t("back")}
      </button>
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t("login")}</h1>

      <div className="mb-4">
        <Label className="text-base font-medium mb-2 block">{t("selectRole")}</Label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-input rounded-md px-3 py-3 text-base bg-card text-foreground"
        >
          <option value="SHG Member">{t("shgMember")}</option>
          <option value="CRP">{t("crpStaff")}</option>
          <option value="Buyer">{t("buyer")}</option>
        </select>
      </div>

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

      <Button
        onClick={handleSubmit}
        disabled={phone.length !== 10 || loading}
        className="tap-target w-full text-lg font-semibold mt-8 bg-primary text-primary-foreground"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : t("sendOtp")}
      </Button>
    </div>
  );
};

export default LoginScreen;
