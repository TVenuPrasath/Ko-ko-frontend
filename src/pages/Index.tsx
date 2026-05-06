import { useState, useEffect, useRef, useCallback } from "react";
import { getUser, setUser, getToken, clearUser, User } from "@/lib/auth";
import { api } from "@/lib/api";
import ChooseActionScreen from "@/components/auth/ChooseActionScreen";
import RegistrationScreen from "@/components/auth/RegistrationScreen";
import OtpScreen from "@/components/auth/OtpScreen";
import Dashboard from "@/components/dashboard/Dashboard";
import CrpDashboard from "@/components/crp/CrpDashboard";
import { toast } from "sonner";

const INACTIVITY_MS = 30 * 60 * 1000; // 30 minutes

type Screen = "choose" | "register" | "otp" | "app";

const Index = () => {
  const [user, setUserState] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>("choose");
  const [pendingPhone, setPendingPhone] = useState("");
  const [pendingOtp, setPendingOtp] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogout = useCallback((reason?: string) => {
    clearUser();
    setUserState(null);
    setScreen("choose");
    if (reason) toast(reason);
  }, []);

// Inactivity auto-logout
  useEffect(() => {
    if (screen !== "app") return;
    const reset = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => handleLogout("⏳ உங்கள் கணக்கு செயல்படவில்லை. மீண்டும் உள்நுழையவும்."), INACTIVITY_MS);
    };
    const events = ["mousemove", "keydown", "touchstart", "click", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [screen, handleLogout]);

  useEffect(() => {
    const stored = getUser();
    if (stored) { setUserState(stored); setScreen("app"); }
  }, []);

  const handleLogin = async (phone: string) => {
    try {
      const res = await api.sendOtp(phone);
      setPendingPhone(phone);
      setPendingOtp(res.otp || null);
      setIsRegistering(false);
      setScreen("otp");
    } catch (err: any) {
      toast.error(err?.message || "இந்த எண் பதிவு செய்யப்படவில்லை");
    }
  };

  const handleRegisterData = async (data: any) => {
    try {
      await api.register({
        phone: data.phone,
        name: data.name,
        hamlet: data.hamlet,
        street: data.street,
        houseNo: data.houseNo,
        shg_name: data.shgName,
      });
      const res = await api.sendOtp(data.phone);
      setPendingPhone(data.phone);
      setPendingOtp(res.otp || null);
      setIsRegistering(true);
      setScreen("otp");
    } catch (err: any) {
      toast.error(err?.message || "பதிவு தோல்வியடைந்தது");
    }
  };

  const handleOtpVerified = (verifiedUser: User, token: string) => {
    setUser(verifiedUser, token);
    setUserState(verifiedUser);
    setScreen("app");
  };

  if (screen === "app" && user) {
    if (user.role === "CRP") return <CrpDashboard user={user} onLogout={handleLogout} />;
    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg">
        <Dashboard user={user} onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg">
      {screen === "choose" && (
        <ChooseActionScreen onRegister={() => setScreen("register")} onLogin={handleLogin} />
      )}
      {screen === "register" && (
        <RegistrationScreen onNext={handleRegisterData} onBack={() => setScreen("choose")} />
      )}
      {screen === "otp" && (
        <OtpScreen
          phone={pendingPhone}
          devOtp={pendingOtp}
          onVerified={handleOtpVerified}
          onBack={() => setScreen("choose")}
        />
      )}
    </div>
  );
};

export default Index;
