import { useState } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HAMLETS, mockRegister } from "@/lib/auth";
import { ArrowLeft, Loader2 } from "lucide-react";

interface RegistrationScreenProps {
  onNext: (data: { name: string; phone: string; hamlet: string; houseNo: string; street: string }) => void;
  onBack: () => void;
}

const RegistrationScreen = ({ onNext, onBack }: RegistrationScreenProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [hamlet, setHamlet] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = name.trim() && phone.length === 10 && hamlet;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    onNext({ name, phone, hamlet, houseNo, street });
  };

  return (
    <div className="flex flex-col min-h-screen p-5">
      <button onClick={onBack} className="flex items-center gap-1 text-primary mb-4 tap-target justify-start">
        <ArrowLeft size={20} /> {t("back")}
      </button>

      <h1 className="text-xl font-bold mb-5 text-center text-foreground">{t("registration")}</h1>

      <Card className="p-5 bg-card flex flex-col gap-4">
        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
          <Label className="text-base font-medium">{t("fullName")} :</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="tap-target text-base"
          />
        </div>

        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
          <Label className="text-base font-medium">{t("phoneNumber")} :</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="tap-target text-base"
            inputMode="numeric"
            type="tel"
          />
        </div>

        <div>
          <Label className="text-base font-medium mb-2 block">{t("address")} :</Label>

          <div className="pl-4 flex flex-col gap-3">
            <div className="grid grid-cols-[110px_1fr] items-center gap-3">
              <Label className="text-sm font-medium">{t("houseNo")}:</Label>
              <Input value={houseNo} onChange={(e) => setHouseNo(e.target.value)} className="tap-target text-base" />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-3">
              <Label className="text-sm font-medium">{t("street")} :</Label>
              <Input value={street} onChange={(e) => setStreet(e.target.value)} className="tap-target text-base" />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-3">
              <Label className="text-sm font-medium">{t("village")} :</Label>
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
          </div>
        </div>
      </Card>

      <Button
        onClick={handleSubmit}
        disabled={!isValid || loading}
        className="tap-target w-full text-lg font-semibold mt-6 bg-primary text-primary-foreground"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : t("submit")}
      </Button>
    </div>
  );
};

export default RegistrationScreen;
