// ── Pure mock API — localStorage backed so data survives refresh ──────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function daysFromNow(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}
function weekOf(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

// ── localStorage helpers ──────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}
function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Default seed data ─────────────────────────────────────────────────────────
const defaultBirdUpdates = [
  { _id: "bu-1",  weekDate: weekOf(0),  chicks: 12, growers: 8,  layers: 20, broilers: 10, createdAt: daysAgo(0)  },
  { _id: "bu-2",  weekDate: weekOf(7),  chicks: 10, growers: 9,  layers: 18, broilers: 12, createdAt: daysAgo(7)  },
  { _id: "bu-3",  weekDate: weekOf(14), chicks: 8,  growers: 10, layers: 17, broilers: 14, createdAt: daysAgo(14) },
  { _id: "bu-4",  weekDate: weekOf(21), chicks: 6,  growers: 11, layers: 16, broilers: 15, createdAt: daysAgo(21) },
  { _id: "bu-5",  weekDate: weekOf(28), chicks: 14, growers: 7,  layers: 15, broilers: 11, createdAt: daysAgo(28) },
  { _id: "bu-6",  weekDate: weekOf(35), chicks: 13, growers: 6,  layers: 14, broilers: 10, createdAt: daysAgo(35) },
  { _id: "bu-7",  weekDate: weekOf(42), chicks: 11, growers: 8,  layers: 13, broilers: 9,  createdAt: daysAgo(42) },
  { _id: "bu-8",  weekDate: weekOf(49), chicks: 9,  growers: 9,  layers: 12, broilers: 8,  createdAt: daysAgo(49) },
  { _id: "bu-9",  weekDate: weekOf(56), chicks: 7,  growers: 10, layers: 11, broilers: 7,  createdAt: daysAgo(56) },
  { _id: "bu-10", weekDate: weekOf(63), chicks: 10, growers: 8,  layers: 10, broilers: 6,  createdAt: daysAgo(63) },
  { _id: "bu-11", weekDate: weekOf(70), chicks: 8,  growers: 7,  layers: 9,  broilers: 5,  createdAt: daysAgo(70) },
  { _id: "bu-12", weekDate: weekOf(77), chicks: 6,  growers: 6,  layers: 8,  broilers: 4,  createdAt: daysAgo(77) },
  { _id: "bu-13", weekDate: weekOf(84), chicks: 5,  growers: 5,  layers: 7,  broilers: 3,  createdAt: daysAgo(84) },
];

const defaultVaccinations = [
  { _id: "vax-1", userId: "farmer-1", type: "white_diarrhea", ageGroup: "0-7 days",      dateGiven: daysAgo(75), nextDueDate: daysAgo(5),      status: "completed" },
  { _id: "vax-2", userId: "farmer-1", type: "smallpox",       ageGroup: "above 60 days", dateGiven: daysAgo(45), nextDueDate: daysFromNow(15), status: "completed" },
  { _id: "vax-3", userId: "farmer-1", type: "deworming",                                 dateGiven: daysAgo(80), nextDueDate: daysAgo(10),      status: "completed" },
  { _id: "vax-4", userId: "farmer-1", type: "deworming",                                 dateGiven: daysAgo(40), nextDueDate: daysFromNow(20), status: "completed" },
];

const defaultServiceDemands = [
  { _id: "sd-1", userId: { _id: "farmer-1", name: "Lakshmi S", hamlet: "வடுகப்பட்டு" }, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", type: "Loan",       quantity: 1, amount: 15000, notes: "நோக்கம்: கூண்டு / உபகரணம் | குறிப்பு: கோழி கூண்டு வாங்க கடன் தேவை", status: "Completed", createdAt: daysAgo(85) },
  { _id: "sd-2", userId: { _id: "farmer-1", name: "Lakshmi S", hamlet: "வடுகப்பட்டு" }, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", type: "Feed Stock", quantity: 5,             notes: "5 bags of layer mash needed",                                          status: "Completed", createdAt: daysAgo(60) },
  { _id: "sd-3", userId: { _id: "farmer-1", name: "Lakshmi S", hamlet: "வடுகப்பட்டு" }, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", type: "Equipment",  quantity: 2,             notes: "2 water drinkers broken, need replacement",                            status: "Completed", createdAt: daysAgo(40) },
  { _id: "sd-4", userId: { _id: "farmer-1", name: "Lakshmi S", hamlet: "வடுகப்பட்டு" }, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", type: "Feed Stock", quantity: 3,             notes: "3 bags of chick starter feed",                                         status: "Completed", createdAt: daysAgo(20) },
  { _id: "sd-5", userId: { _id: "farmer-1", name: "Lakshmi S", hamlet: "வடுகப்பட்டு" }, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", type: "Loan",       quantity: 1, amount: 8000,  notes: "நோக்கம்: குஞ்சுகள் வாங்க | குறிப்பு: புதிய கோழி வாங்க கடன் தேவை",   status: "Pending",   createdAt: daysAgo(3)  },
  { _id: "sd-6", userId: { _id: "farmer-1", name: "Lakshmi S", hamlet: "வடுகப்பட்டு" }, farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", type: "Equipment",  quantity: 1,             notes: "Feeder tray cracked, need 1 new one",                                  status: "Pending",   createdAt: daysAgo(1)  },
];

const defaultDiseaseReports = [
  { _id: "dr-1", userId: "farmer-1", description: "அறிகுறிகள்: வெள்ளை கழிச்சல் | நோய்வாய்: 3 | இறப்பு: 0",              reportedAt: daysAgo(70), status: "Reviewed" },
  { _id: "dr-2", userId: "farmer-1", description: "அறிகுறிகள்: இறகு உதிர்வு, சோர்வு | நோய்வாய்: 5 | இறப்பு: 0",        reportedAt: daysAgo(35), status: "Reviewed" },
  { _id: "dr-3", userId: "farmer-1", description: "அறிகுறிகள்: தீவனம் சாப்பிடவில்லை | நோய்வாய்: 2 | இறப்பு: 2",       reportedAt: daysAgo(5),  status: "Pending"  },
];

const defaultNotifications = [
  { _id: "n-1", type: "disease", message: "Newcastle disease alert in வடுகப்பட்டு area. Keep birds isolated.", createdAt: daysAgo(2) },
  { _id: "n-2", type: "market",  message: "Egg price increased to ₹6.50/egg at Villupuram market.",            createdAt: daysAgo(4) },
  { _id: "n-3", type: "tip",     message: "Add turmeric powder to feed water to improve bird immunity during monsoon.", createdAt: daysAgo(6) },
];

const defaultMarketPrice = { _id: "mp-1", broiler: 180, chick: 45, egg: 6.5, updatedBy: "Ravi Kumar (CRP)", updatedAt: daysAgo(1) };

// ── Activity Log ─────────────────────────────────────────────────────────────
export interface ActivityEntry {
  _id: string;
  farmerName: string;
  hamlet: string;
  action: string;
  createdAt: string;
}

const defaultActivityLog: ActivityEntry[] = [
  { _id: "act-1", farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", action: "கோழி எண்ணிக்கை புதுப்பித்தார்", createdAt: daysAgo(0) },
  { _id: "act-2", farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", action: "கடன் கோரிக்கை அனுப்பினார் (₹8,000)", createdAt: daysAgo(3) },
  { _id: "act-3", farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", action: "நோய் அறிக்கை அனுப்பினார்", createdAt: daysAgo(5) },
  { _id: "act-4", farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", action: "உபகரண கோரிக்கை அனுப்பினார்", createdAt: daysAgo(7) },
  { _id: "act-5", farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு", action: "கோழி எண்ணிக்கை புதுப்பித்தார்", createdAt: daysAgo(7) },
];

export const mockActivityLog: ActivityEntry[] = load("mock_activity", defaultActivityLog);

function addActivity(farmerName: string, hamlet: string, action: string) {
  mockActivityLog.unshift({ _id: `act-${Date.now()}`, farmerName, hamlet, action, createdAt: new Date().toISOString() });
  if (mockActivityLog.length > 50) mockActivityLog.pop(); // keep last 50
  save("mock_activity", mockActivityLog);
}

// ── Live state (loaded from localStorage, falls back to seed) ─────────────────
export const mockBirdUpdates:     any[] = load("mock_birds",     defaultBirdUpdates);
export const mockVaccinations:    any[] = load("mock_vax",       defaultVaccinations);
export const mockServiceDemands:  any[] = load("mock_demands",   defaultServiceDemands);
export const mockDiseaseReports:  any[] = load("mock_disease",   defaultDiseaseReports);
export const mockNotifications:   any[] = load("mock_notifs",    defaultNotifications);
export let   mockMarketPrice:     any   = load("mock_price",     defaultMarketPrice);

// ── API ───────────────────────────────────────────────────────────────────────
export const api = {
  // Bird Updates
  getBirdUpdates: async () => [...mockBirdUpdates],

  checkWeekSubmitted: async () => {
    const thisWeek = weekOf(0);
    return { submitted: mockBirdUpdates.some((u) => u.weekDate === thisWeek) };
  },

  submitBirdUpdate: async (body: { chicks: number; growers: number; layers: number; broilers: number }) => {
    const thisWeek = weekOf(0);
    const idx = mockBirdUpdates.findIndex((u) => u.weekDate === thisWeek);
    const entry = { _id: `bu-${Date.now()}`, weekDate: thisWeek, createdAt: new Date().toISOString(), ...body };
    if (idx >= 0) mockBirdUpdates[idx] = entry; else mockBirdUpdates.unshift(entry);
    save("mock_birds", mockBirdUpdates);
    addActivity("Lakshmi S", "வடுகப்பட்டு", "கோழி எண்ணிக்கை புதுப்பித்தார்");
    return entry;
  },

  getAllBirdUpdates: async () => [...mockBirdUpdates],

  // Vaccinations
  getVaccinations: async () => [...mockVaccinations],
  getAllVaccinations: async () => [...mockVaccinations],

  addVaccination: async (body: { userId: string; type: string; ageGroup?: string; dateGiven: string; nextDueDate: string; status?: string }) => {
    const entry = { _id: `vax-${Date.now()}`, ...body };
    mockVaccinations.unshift(entry);
    save("mock_vax", mockVaccinations);
    return entry;
  },

  // Service Demands
  getServiceDemands: async () => mockServiceDemands.filter((d) => d.userId?._id === "farmer-1" || d.userId === "farmer-1"),

  getAllServiceDemands: async () => [...mockServiceDemands],

  submitServiceDemand: async (body: { type: string; quantity: number; amount?: number; notes?: string }) => {
    const entry = {
      _id: `sd-${Date.now()}`,
      userId: { _id: "farmer-1", name: "Lakshmi S", hamlet: "வடுகப்பட்டு" },
      farmerName: "Lakshmi S", hamlet: "வடுகப்பட்டு",
      status: "Pending", createdAt: new Date().toISOString(), ...body,
    };
    mockServiceDemands.push(entry);
    save("mock_demands", mockServiceDemands);
    addActivity("Lakshmi S", "வடுகப்பட்டு", `${body.type} கோரிக்கை அனுப்பினார்${body.amount ? ` (₹${body.amount})` : ""}`);
    return entry;
  },

  completeServiceDemand: async (id: string) => {
    const d = mockServiceDemands.find((x) => x._id === id);
    if (d) { d.status = "Completed"; save("mock_demands", mockServiceDemands); }
    return d;
  },

  rejectServiceDemand: async (id: string) => {
    const d = mockServiceDemands.find((x) => x._id === id);
    if (d) { d.status = "Rejected"; save("mock_demands", mockServiceDemands); }
    return d;
  },

  // Disease Reports
  getDiseaseReports: async () => [...mockDiseaseReports],
  getAllDiseaseReports: async () => [...mockDiseaseReports],

  submitDiseaseReport: async (body: { description: string; photo?: string }) => {
    const entry = { _id: `dr-${Date.now()}`, userId: "farmer-1", reportedAt: new Date().toISOString(), status: "Pending", ...body };
    mockDiseaseReports.unshift(entry);
    save("mock_disease", mockDiseaseReports);
    addActivity("Lakshmi S", "வடுகப்பட்டு", "நோய் அறிக்கை அனுப்பினார்");
    return entry;
  },

  reviewDiseaseReport: async (id: string) => {
    const r = mockDiseaseReports.find((x) => x._id === id);
    if (r) { r.status = "Reviewed"; save("mock_disease", mockDiseaseReports); }
    return r;
  },

  // Market Prices
  getMarketPrice: async () => ({ ...mockMarketPrice }),

  setMarketPrice: async (body: { broiler: number; chick: number; egg: number }) => {
    mockMarketPrice = { ...mockMarketPrice, ...body, updatedAt: new Date().toISOString() };
    save("mock_price", mockMarketPrice);
    return mockMarketPrice;
  },

  // Notifications
  getNotifications: async () => [...mockNotifications],

  createNotification: async (body: { type: string; message: string; hamlet?: string }) => {
    const entry = { _id: `n-${Date.now()}`, createdAt: new Date().toISOString(), ...body };
    mockNotifications.unshift(entry);
    save("mock_notifs", mockNotifications);
    return entry;
  },

  deleteNotification: async (id: string) => {
    const i = mockNotifications.findIndex((x) => x._id === id);
    if (i >= 0) { mockNotifications.splice(i, 1); save("mock_notifs", mockNotifications); }
  },

  // Farmers
  getFarmers: async () => [
    { _id: "farmer-1", name: "Lakshmi S", phone: "9842100001", hamlet: "வடுகப்பட்டு", shg_name: "Thendral SHG", approved: true, role: "SHG Member" },
  ],

  approveFarmer: async (id: string) => ({ _id: id, approved: true }),
};
