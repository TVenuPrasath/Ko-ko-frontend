import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { mockVerifyOtp, User } from "@/lib/auth";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface OtpScreenProps {
  phone: string;
  onVerified: (user: User) => void;
  onBack: () => void;
}

const OtpScreen = ({ phone, onVerified, onBack }: OtpScreenProps) => {
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
    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const result = mockVerifyOtp(code);
    setLoading(false);
    if (result.success && result.user) {
      toast.success("✅ " + t("done"));
      onVerified(result.user);
    } else {
      toast.error("Invalid OTP. Try 123456");
      setOtp(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    }
  };

  const handleResend = () => {
    setResendTimer(30);
    toast("OTP resent!");
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="flex flex-col min-h-screen p-6">
      <button onClick={onBack} className="flex items-center gap-1 text-primary mb-6 tap-target justify-start">
        <ArrowLeft size={20} /> {t("back")}
      </button>
      <h1 className="text-2xl font-bold mb-2 text-foreground">{t("otpVerification")}</h1>
      <p className="text-base text-muted-foreground mb-8">{t("otpSentTo")} {phone}</p>

      <div className="flex gap-3 justify-center mb-8">
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
            className="w-12 h-14 text-center text-2xl font-bold border-2 border-input rounded-lg bg-card focus:border-primary focus:outline-none"
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

      <div className="text-center mt-6">
        {resendTimer > 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("resendIn")} {resendTimer} {t("seconds")}
          </p>
        ) : (
          <button onClick={handleResend} className="text-primary font-medium text-base underline">
            {t("resendOtp")}
          </button>
        )}
      </div>
    </div>
  );
};

export default OtpScreen;
