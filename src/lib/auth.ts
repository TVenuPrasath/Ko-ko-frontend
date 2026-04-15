export interface User {
  userId: string;
  name: string;
  phone: string;
  hamlet: string;
  shgName: string;
  role: string;
}

export const HAMLETS = [
  "Keezhpudhupattu", "Melpattu", "Kottakuppam", "Thiruvengadam",
  "Sathyamangalam", "Vadugapattu", "Kilnagar", "Periyakulam",
  "Arasankulam", "Thondamanallur"
];

export function getUser(): User | null {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

export function setUser(user: User) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearUser() {
  localStorage.removeItem("user");
}

let registrationData: any = null;

export function mockRegister(data: { name: string; phone: string; hamlet: string; shgName: string; role?: string }) {
  registrationData = data;
  return { success: true, phone: data.phone };
}

export function mockLogin(phone: string, role?: string) {
  registrationData = { phone, role: role || "SHG Member" };
  return { success: true, phone };
}

export function mockVerifyOtp(otp: string): { success: boolean; user?: User } {
  if (otp === "123456") {
    const role = registrationData?.role || "SHG Member";
    const user: User = {
      userId: crypto.randomUUID(),
      name: registrationData?.name || (role === "CRP" ? "CRP Admin" : role === "Buyer" ? "Buyer User" : "User"),
      phone: registrationData?.phone || "",
      hamlet: registrationData?.hamlet || "Keezhpudhupattu",
      shgName: registrationData?.shgName || "",
      role,
    };
    setUser(user);
    return { success: true, user };
  }
  return { success: false };
}
