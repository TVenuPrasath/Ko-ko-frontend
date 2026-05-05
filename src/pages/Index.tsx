import { useState, useEffect } from "react";
import { getUser, User } from "@/lib/auth";
import LoginScreen from "@/components/auth/LoginScreen";
import Dashboard from "@/components/dashboard/Dashboard";
import CrpDashboard from "@/components/crp/CrpDashboard";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = getUser();
    if (stored) setUser(stored);
  }, []);

  if (user) {
    if (user.role === "CRP") return <CrpDashboard user={user} onLogout={() => setUser(null)} />;
    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg">
        <Dashboard user={user} onLogout={() => setUser(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-card shadow-lg">
      <LoginScreen onSuccess={setUser} onBack={() => {}} />
    </div>
  );
};

export default Index;
