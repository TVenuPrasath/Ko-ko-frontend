import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HAMLET_STREETS } from "@/lib/auth";
import { api } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

const HAMLETS_LIST = Object.keys(HAMLET_STREETS);

interface RegistrationScreenProps {
  onNext: (data: {
    name: string;
    phone: string;
    hamlet: string;
    houseNo: string;
    street: string;
    shgName: string;
  }) => void;
  onBack: () => void;
}

const RegistrationScreen = ({ onNext, onBack }: RegistrationScreenProps) => {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [hamlet, setHamlet] = useState("");
  const [shgName, setShgName] = useState("");
  const [shgNames, setShgNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getShgGroups().then((data: any[]) => setShgNames(data.map((g) => g.name))).catch(() => {});
  }, []);

  const availableStreets = hamlet ? HAMLET_STREETS[hamlet] || [] : [];

  const isValid = name.trim() && phone.length === 10 && hamlet && street && shgName;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    setLoading(false);
    onNext({ name, phone, hamlet, houseNo, street, shgName });
  };

  const handleHamletChange = (value: string) => {
    setHamlet(value);
    setStreet(""); // Reset street when hamlet changes
  };

  return (
    <div className="flex flex-col min-h-screen p-5">
      <button onClick={onBack} className="flex items-center gap-1 text-primary mb-4 tap-target justify-start">
        <ArrowLeft size={20} /> {t("back")}
      </button>

      <h1 className="text-xl font-bold mb-5 text-center text-foreground">{t("registration")}</h1>

      <Card className="p-5 bg-card flex flex-col gap-4">

        {/* Name */}
        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
          <Label className="text-base font-medium">{t("fullName")} :</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="tap-target text-base"
            placeholder="உங்கள் பெயர்"
          />
        </div>

        {/* Phone */}
        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
          <Label className="text-base font-medium">{t("phoneNumber")} :</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="tap-target text-base"
            inputMode="numeric"
            type="tel"
            placeholder="9876543210"
          />
        </div>

        {/* Address */}
        <div>
          <Label className="text-base font-medium mb-2 block">{t("address")} :</Label>
          <div className="pl-4 flex flex-col gap-3">
            <div className="grid grid-cols-[110px_1fr] items-center gap-3">
              <Label className="text-sm font-medium">{t("houseNo")}:</Label>
              <Input value={houseNo} onChange={(e) => setHouseNo(e.target.value)} className="tap-target text-base" />
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-3">
              <Label className="text-sm font-medium">{t("village")} :</Label>
              <Select value={hamlet} onValueChange={handleHamletChange}>
                <SelectTrigger className="tap-target text-base">
                  <SelectValue placeholder={t("selectHamlet")} />
                </SelectTrigger>
                <SelectContent>
                  {HAMLETS_LIST.map((h) => (
                    <SelectItem key={h} value={h} className="text-base py-3">{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-[110px_1fr] items-center gap-3">
              <Label className="text-sm font-medium">{t("street")} :</Label>
              <Select value={street} onValueChange={setStreet} disabled={!hamlet}>
                <SelectTrigger className="tap-target text-base">
                  <SelectValue placeholder="தெருவை தேர்ந்தெடுக்கவும்" />
                </SelectTrigger>
                <SelectContent>
                  {availableStreets.map((s) => (
                    <SelectItem key={s} value={s} className="text-base py-3">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* SHG Group Name */}
        <div className="grid grid-cols-[110px_1fr] items-center gap-3">
          <Label className="text-base font-medium">{t("shgGroupName")} :</Label>
          <Select value={shgName} onValueChange={setShgName}>
            <SelectTrigger className="tap-target text-base">
              <SelectValue placeholder="SHG குழுவை தேர்ந்தெடுக்கவும்" />
            </SelectTrigger>
            <SelectContent>
              {shgNames.map((s) => (
                <SelectItem key={s} value={s} className="text-base py-3">{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
