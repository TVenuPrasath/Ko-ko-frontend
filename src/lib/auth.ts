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

// Known accounts — login by phone number
const MOCK_USERS: User[] = [
  {
    userId: "farmer-1",
    name: "Lakshmi S",
    phone: "9842100001",
    hamlet: "வடுகப்பட்டு",
    shgName: "Thendral SHG",
    role: "SHG Member",
    approved: true,
  },
  {
    userId: "crp-1",
    name: "Ravi Kumar",
    phone: "9876500000",
    hamlet: "கோணாங்கிப்பட்டி",
    shgName: "",
    role: "CRP",
    approved: true,
  },
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

export function loginWithPhone(phone: string): { success: boolean; user?: User } {
  const user = MOCK_USERS.find((u) => u.phone === phone);
  if (!user) return { success: false };
  setUser(user);
  return { success: true, user };
}

// kept for compat
export function mockLogin(phone: string) {
  return { success: true, phone };
}
export function mockRegister(data: { name: string; phone: string; hamlet: string; shgName: string }) {
  return { success: true, phone: data.phone };
}
export async function verifyOtpAndLogin(_otp: string): Promise<{ success: boolean; user?: User }> {
  return { success: false };
}
