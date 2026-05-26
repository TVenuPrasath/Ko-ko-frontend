import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/lib/mockData";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import { Bell, AlertTriangle, TrendingUp, Lightbulb, Volume2, VolumeX, Square, Syringe } from "lucide-react";

const useSpeech = () => {
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      TextToSpeech.stop().catch(() => {});
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakWeb = (id: string, text: string) => {
    window.speechSynthesis.cancel();
    if (speakingId === id) { setSpeakingId(null); return; }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ta-IN";
    utterance.rate = 0.85;
    utterance.pitch = 1;

    const setVoiceAndSpeak = () => {
      const voices = window.speechSynthesis.getVoices();
      const tamilVoice = voices.find((v) => v.lang.startsWith("ta"));
      if (tamilVoice) utterance.voice = tamilVoice;
      setSpeakingId(id);
      window.speechSynthesis.speak(utterance);
    };

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoiceAndSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  };

  const speakNative = async (id: string, text: string) => {
    try {
      await TextToSpeech.speak({ text, locale: "ta-IN", rate: 1.0 });
      setSpeakingId(id);
    } catch (error) {
      console.warn("Native TTS failed, falling back to web TTS", error);
      speakWeb(id, text);
    }
  };

  const speak = async (id: string, text: string) => {
    if (typeof window === "undefined") return;
    if (window.navigator?.userAgent?.includes("Android") || window.navigator?.userAgent?.includes("iPhone")) {
      await speakNative(id, text);
      return;
    }
    speakWeb(id, text);
  };

  const stop = async () => {
    await TextToSpeech.stop().catch(() => {});
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  };

  return { speakingId, speak, stop };
};

const NotificationsTab = () => {
  const { t, lang, setLang } = useLanguage();
  const { speakingId, speak, stop } = useSpeech();
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.getNotifications(),
    staleTime: 30_000,
  });

  const typeConfig: Record<string, { label: string; className: string; icon: typeof Bell; iconColor: string; bg: string }> = {
    disease:              { label: t("diseaseAlert"),       className: "bg-danger text-danger-foreground",   icon: AlertTriangle, iconColor: "text-danger",       bg: "bg-danger/8" },
    market:               { label: t("marketPrice"),        className: "bg-success text-success-foreground", icon: TrendingUp,    iconColor: "text-success",      bg: "bg-success/8" },
    tip:                  { label: t("farmingTip"),         className: "bg-primary text-primary-foreground", icon: Lightbulb,     iconColor: "text-primary",      bg: "bg-primary/8" },
    vaccination_reminder: { label: lang === "ta" ? "தடுப்பூசி நினைவூட்டல்" : "Vaccination Reminder", className: "bg-warning text-warning-foreground", icon: Syringe, iconColor: "text-warning", bg: "bg-warning/8" },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-border/60 p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/3 mb-2" />
            <div className="h-3 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="relative flex flex-col items-center justify-center py-20 text-muted-foreground">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setLang(lang === "ta" ? "en" : "ta")}
            className="text-xs font-bold border border-border rounded-lg px-2.5 py-1 text-muted-foreground hover:text-foreground bg-muted/20"
          >
            {lang === "ta" ? "EN" : "தமிழ்"}
          </button>
        </div>
        <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-4">
          <Bell size={36} className="text-muted-foreground/50" />
        </div>
        <p className="text-base font-semibold text-foreground">{t("noNotifications")}</p>
        <p className="text-sm text-muted-foreground mt-1">{t("noNotificationsSub")}</p>
      </div>
    );
  }

  const isSpeaking = speakingId !== null;

  return (
    <div className="flex flex-col gap-3">
      {isSpeaking && (
        <button
          onClick={stop}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-danger/10 border border-danger/30 rounded-xl text-sm font-semibold text-danger"
        >
          <Square size={14} fill="currentColor" /> நிறுத்து (Stop)
        </button>
      )}

      {(notifications as any[]).map((n) => {
        const config = typeConfig[n.type] ?? { label: n.type, className: "bg-muted text-foreground", icon: Bell, iconColor: "text-muted-foreground", bg: "bg-muted/20" };
        const Icon = config.icon;
        const isThisSpeaking = speakingId === n._id;

        return (
          <div key={n._id} className={`bg-white rounded-2xl border shadow-sm p-4 transition-all ${isThisSpeaking ? "border-primary/40 bg-primary/5" : "border-border/60"}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                <Icon size={18} className={config.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge className={`${config.className} text-xs`}>{config.label}</Badge>
                  <span className="text-xs text-muted-foreground shrink-0">{formatDate(n.createdAt)}</span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{n.message}</p>
                <button
                  onClick={() => speak(n._id, n.message)}
                  className={`mt-2.5 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isThisSpeaking
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/60 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {isThisSpeaking ? (
                    <><VolumeX size={13} /> நிறுத்து</>
                  ) : (
                    <><Volume2 size={13} /> கேட்க</>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationsTab;
