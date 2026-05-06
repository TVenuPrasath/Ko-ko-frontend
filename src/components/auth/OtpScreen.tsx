import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User } from "@/lib/auth";
import { api } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OtpScreenProps {
  phone: string;
  devOtp?: string | null;
  onVerified: (user: User, token: string) => void;
  onBack: () => void;
}

const OtpScreen = ({ phone, devOtp, onVerified, onBack }: OtpScreenProps) => {
  const { t } = useLanguage();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const result = await api.verifyOtp(phone, code);
      toast.success("✅ " + t("done"));
      onVerified(result.user, result.token);
    } catch (err: any) {
      setLoading(false);
      if (err?.message === "pending") {
        toast("⏳ உங்கள் பதிவு CRP அனுமதிக்காக காத்திருக்கிறது");
        onBack();
      } else {
        toast.error(err?.message || "தவறான OTP. மீண்டும் முயற்சிக்கவும்.");
        setOtp(["", "", "", "", "", ""]);
        refs.current[0]?.focus();
      }
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      await api.sendOtp(phone);
      setResendTimer(30);
      toast("OTP மீண்டும் அனுப்பப்பட்டது");
    } catch {
      toast.error("மீண்டும் அனுப்ப முடியவில்லை");
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="flex flex-col min-h-screen p-5">
      <button onClick={onBack} className="flex items-center gap-1 text-primary mb-4 tap-target justify-start">
        <ArrowLeft size={20} /> {t("back")}
      </button>

      <Card className="p-5 bg-card flex flex-col gap-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">{t("otpVerification")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("otpSentTo")} {phone}</p>
          {devOtp && (
            <p className="text-xs mt-2 bg-muted px-3 py-1.5 rounded font-mono text-foreground">
              OTP: <span className="font-bold text-primary">{devOtp}</span>
            </p>
          )}
        </div>

        <Label className="text-base font-medium">{t("enterOtp")} :</Label>

        <div className="flex gap-2 justify-center">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { refs.current[i] = el; }}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-11 h-14 text-center text-2xl font-bold border-2 border-input rounded-lg bg-card focus:border-primary focus:outline-none"
            />
          ))}
        </div>

        <Button
          onClick={handleVerify}
          disabled={!isComplete || loading}
          className="tap-target w-full text-lg font-semibold bg-primary text-primary-foreground"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : t("verifyOtp")}
        </Button>

        <div className="text-center">
          {resendTimer > 0 ? (
            <p className="text-xs italic text-muted-foreground">மீண்டும் அனுப்ப... {resendTimer}s</p>
          ) : (
            <button onClick={handleResend} className="text-primary font-medium text-sm underline">
              {t("resendOtp")}
            </button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default OtpScreen;
