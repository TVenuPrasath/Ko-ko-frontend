export interface User {
  userId: string;
  name: string;
  phone: string;
  hamlet: string;
  shgName: string;
  role: string;
  approved?: boolean;
}

export const HAMLETS = [
  "கோணாங்கிப்பட்டி", "மேல்பட்டு", "கொட்டக்குப்பம்", "திருவெங்கடம்",
  "சத்தியமங்கலம்", "வடுகப்பட்டு", "கீழ்நகர்", "பெரியகுளம்",
  "அரசன்குளம்", "தொண்டமனல்லூர்"
];

export const PLF_GROUPS = ["குழு 1", "குழு 2", "குழு 3", "குழு 4", "குழு 5"];

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

export function mockRegister(data: {
  name: string;
  phone: string;
  hamlet: string;
  shgName: string;
  role?: string;
  houseNo?: string;
  street?: string;
}) {
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
      name: registrationData?.name || (role === "CRP" ? "நிர்வாகி" : role === "Buyer" ? "வாங்குபவர்" : "பயனர்"),
      phone: registrationData?.phone || "",
      hamlet: registrationData?.hamlet || HAMLETS[0],
      shgName: registrationData?.shgName || "",
      role,
      approved: true,
    };
    setUser(user);
    return { success: true, user };
  }
  return { success: false };
}
