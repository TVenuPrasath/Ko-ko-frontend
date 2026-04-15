import { useState, useEffect } from "react";
import { getUser, User } from "@/lib/auth";
import ChooseActionScreen from "@/components/auth/ChooseActionScreen";
import RegistrationScreen from "@/components/auth/RegistrationScreen";
import LoginScreen from "@/components/auth/LoginScreen";
import OtpScreen from "@/components/auth/OtpScreen";
import Dashboard from "@/components/dashboard/Dashboard";
import CrpDashboard from "@/components/crp/CrpDashboard";
import BuyerDashboard from "@/components/buyer/BuyerDashboard";

type Screen = "choose" | "register" | "login" | "otp";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>("choose");
  const [otpPhone, setOtpPhone] = useState("");

  useEffect(() => {
    const stored = getUser();
    if (stored) setUser(stored);
  }, []);

  if (user) {
    if (user.role === "CRP") {
      return <CrpDashboard user={user} onLogout={() => setUser(null)} />;
    }
    if (user.role === "Buyer") {
      return (
        <BuyerDashboard user={user} onLogout={() => setUser(null)} />
      );
    }
    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg">
        <Dashboard user={user} onLogout={() => setUser(null)} />
      </div>
    );
  }

  const handleOtp = (phone: string) => {
    setOtpPhone(phone);
    setScreen("otp");
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg">
      {screen === "choose" && (
        <ChooseActionScreen onRegister={() => setScreen("register")} onLogin={() => setScreen("login")} />
      )}
      {screen === "register" && (
        <RegistrationScreen onOtp={handleOtp} onBack={() => setScreen("choose")} />
      )}
      {screen === "login" && (
        <LoginScreen onOtp={handleOtp} onBack={() => setScreen("choose")} />
      )}
      {screen === "otp" && (
        <OtpScreen phone={otpPhone} onVerified={(u) => setUser(u)} onBack={() => setScreen("choose")} />
      )}
    </div>
  );
};

export default Index;
