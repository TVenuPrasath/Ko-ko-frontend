import { useState, useEffect } from "react";
import { getUser, User, mockRegister } from "@/lib/auth";
import ChooseActionScreen from "@/components/auth/ChooseActionScreen";
import RegistrationScreen from "@/components/auth/RegistrationScreen";
import UserTypeScreen from "@/components/auth/UserTypeScreen";
import FarmerSelectionScreen from "@/components/auth/FarmerSelectionScreen";
import OtpScreen from "@/components/auth/OtpScreen";
import Dashboard from "@/components/dashboard/Dashboard";
import CrpDashboard from "@/components/crp/CrpDashboard";
import BuyerDashboard from "@/components/buyer/BuyerDashboard";

type Screen = "choose" | "register" | "userType" | "farmerSelection" | "otp";

interface RegData {
  name: string;
  phone: string;
  hamlet: string;
  houseNo: string;
  street: string;
  role?: string;
  shgName?: string;
}

const Index = () => {
  const [user, setUserState] = useState<User | null>(null);
  const [screen, setScreen] = useState<Screen>("choose");
  const [otpPhone, setOtpPhone] = useState("");
  const [regData, setRegData] = useState<RegData | null>(null);

  useEffect(() => {
    const stored = getUser();
    if (stored) setUserState(stored);
  }, []);

  if (user) {
    if (user.role === "CRP") {
      return <CrpDashboard user={user} onLogout={() => setUserState(null)} />;
    }
    if (user.role === "Buyer") {
      return <BuyerDashboard user={user} onLogout={() => setUserState(null)} />;
    }
    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg">
        <Dashboard user={user} onLogout={() => setUserState(null)} />
      </div>
    );
  }

  // Login OTP from Choose screen
  const handleLoginOtp = (phone: string, role: string) => {
    setRegData({ name: "", phone, hamlet: "", houseNo: "", street: "", role });
    setOtpPhone(phone);
    setScreen("otp");
  };

  // Step 1 of registration
  const handleRegisterNext = (data: { name: string; phone: string; hamlet: string; houseNo: string; street: string }) => {
    setRegData(data);
    setScreen("userType");
  };

  // Step 2: user type
  const handleUserTypeNext = (role: "SHG Member" | "CRP") => {
    if (!regData) return;
    const updated = { ...regData, role };
    setRegData(updated);
    if (role === "SHG Member") {
      setScreen("farmerSelection");
    } else {
      mockRegister({ ...updated, shgName: "" });
      setOtpPhone(updated.phone);
      setScreen("otp");
    }
  };

  // Step 3 (farmer only): PLF group
  const handleFarmerSelectionNext = (data: { isPlf: boolean; groupName: string }) => {
    if (!regData) return;
    const updated = { ...regData, shgName: data.groupName };
    mockRegister({ ...updated, role: regData.role });
    setOtpPhone(updated.phone);
    setScreen("otp");
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg">
      {screen === "choose" && (
        <ChooseActionScreen
          onRegister={() => setScreen("register")}
          onOtp={handleLoginOtp}
        />
      )}
      {screen === "register" && (
        <RegistrationScreen onNext={handleRegisterNext} onBack={() => setScreen("choose")} />
      )}
      {screen === "userType" && (
        <UserTypeScreen onSelect={handleUserTypeNext} onBack={() => setScreen("register")} />
      )}
      {screen === "farmerSelection" && (
        <FarmerSelectionScreen onNext={handleFarmerSelectionNext} onBack={() => setScreen("userType")} />
      )}
      {screen === "otp" && (
        <OtpScreen phone={otpPhone} onVerified={(u) => setUserState(u)} onBack={() => setScreen("choose")} />
      )}
    </div>
  );
};

export default Index;
