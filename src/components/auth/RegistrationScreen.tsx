import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HAMLETS, mockRegister } from "@/lib/auth";
import { ArrowLeft, Loader2 } from "lucide-react";

interface RegistrationScreenProps {
  onOtp: (phone: string) => void;
  onBack: () => void;
}

const RegistrationScreen = ({ onOtp, onBack }: RegistrationScreenProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [hamlet, setHamlet] = useState("");
  const [shgName, setShgName] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = name.trim() && phone.length === 10 && hamlet && shgName.trim();

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    mockRegister({ name, phone, hamlet, shgName });
    setLoading(false);
    onOtp(phone);
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <button onClick={onBack} className="flex items-center gap-1 text-primary mb-6 tap-target justify-start">
        <ArrowLeft size={20} /> {t("back")}
      </button>
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t("registration")}</h1>

      <div className="flex flex-col gap-5">
        <div>
          <Label className="text-base font-medium mb-2 block">{t("fullName")}</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="tap-target text-base"
            placeholder={t("fullName")}
          />
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
        <div>
          <Label className="text-base font-medium mb-2 block">{t("hamlet")}</Label>
          <Select value={hamlet} onValueChange={setHamlet}>
            <SelectTrigger className="tap-target text-base">
              <SelectValue placeholder={t("selectHamlet")} />
            </SelectTrigger>
            <SelectContent>
              {HAMLETS.map((h) => (
                <SelectItem key={h} value={h} className="text-base py-3">{h}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-base font-medium mb-2 block">{t("shgGroupName")}</Label>
          <Input
            value={shgName}
            onChange={(e) => setShgName(e.target.value)}
            className="tap-target text-base"
            placeholder={t("shgGroupName")}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="tap-target w-full text-lg font-semibold mt-8 bg-primary text-primary-foreground"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : t("registerGetOtp")}
      </Button>
    </div>
  );
};

export default RegistrationScreen;
