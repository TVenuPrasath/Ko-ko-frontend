import { useLanguage } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

interface ChooseActionScreenProps {
  onRegister: () => void;
  onLogin: () => void;
}

const ChooseActionScreen = ({ onRegister, onLogin }: ChooseActionScreenProps) => {
  const { t, lang, setLang } = useLanguage();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 gap-6">
      <div className="text-center mb-4">
        <span className="text-4xl mb-3 block">🐔</span>
        <h1 className="text-2xl font-bold text-foreground">கோழி கண்காணிப்பு</h1>
        <p className="text-lg text-muted-foreground mt-1">Poultry Tracker</p>
      </div>

      <button
        onClick={() => setLang(lang === "en" ? "ta" : "en")}
        className="text-sm font-medium text-primary underline"
      >
        {lang === "en" ? "தமிழ்" : "English"}
      </button>

      <div className="w-full flex flex-col gap-4 mt-4">
        <Button
          onClick={onRegister}
          className="tap-target w-full text-lg font-semibold rounded-lg bg-primary text-primary-foreground"
        >
          {t("newRegistration")}
        </Button>
        <Button
          onClick={onLogin}
          variant="outline"
          className="tap-target w-full text-lg font-semibold rounded-lg border-2 border-primary text-primary"
        >
          {t("alreadyRegistered")}
        </Button>
      </div>
    </div>
  );
};

export default ChooseActionScreen;
