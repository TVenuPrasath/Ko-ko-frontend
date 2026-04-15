import { HAMLETS, User } from "@/lib/auth";
import { BirdUpdate, DiseaseReport, Notification, ServiceDemand } from "@/lib/mockData";

export interface Farmer {
  userId: string;
  name: string;
  phone: string;
  hamlet: string;
  shgName: string;
  role: string;
  birdUpdates: BirdUpdate[];
  vaccinations: VaccinationRecord[];
  dewormings: DewormingRecord[];
  serviceDemands: CrpServiceDemand[];
  diseaseReports: DiseaseReport[];
  lastUpdateWeek: string | null;
}

export interface VaccinationRecord {
  id: string;
  vaccineType: string;
  dateGiven: string;
  nextDueDate: string;
}

export interface DewormingRecord {
  id: string;
  dateGiven: string;
  nextDueDate: string;
}

export interface CrpServiceDemand {
  id: string;
  userId: string;
  farmerName: string;
  hamlet: string;
  type: string;
  quantity: number;
  status: "Pending" | "Completed";
  createdAt: string;
}

export interface Buyer {
  id: string;
  name: string;
  phone: string;
  type: "Individual" | "Broker" | "Retailer" | "Hotel industry";
}

export interface HamletSummary {
  hamlet: string;
  totalFarmers: number;
  totalBirds: number;
  vaccinatedPct: number;
  dewormedPct: number;
  pendingDemands: number;
}

function getWeekString(date: Date = new Date()): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split("T")[0];
}

const thisWeek = getWeekString();

function generateBirdUpdates(count: number): BirdUpdate[] {
  const updates: BirdUpdate[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i * 7);
    updates.push({
      id: crypto.randomUUID(),
      weekDate: getWeekString(d),
      chicks: Math.floor(Math.random() * 15) + 2,
      growers: Math.floor(Math.random() * 10) + 1,
      layers: Math.floor(Math.random() * 20) + 5,
      broilers: Math.floor(Math.random() * 12) + 3,
    });
  }
  return updates;
}

const FARMER_NAMES = [
  "Lakshmi S", "Kavitha R", "Meena P", "Saroja M", "Geetha V",
  "Anitha K", "Revathi D", "Pushpa N", "Selvi T", "Uma B",
  "Devi L", "Priya A", "Kamala G", "Vasanthi J", "Bharathi E",
  "Rani F", "Malathi H", "Sumathi I", "Jaya C", "Nirmala W",
  "Padma X", "Valli Y", "Chitra Z", "Mala Q", "Indira U",
];

const SHG_NAMES = [
  "Thendral SHG", "Suriya SHG", "Kaveri SHG", "Mullai SHG", "Poonkodi SHG",
  "Rani SHG", "Vaigai SHG", "Malar SHG", "Kurinji SHG", "Thamarai SHG",
];

function generateMockFarmers(): Farmer[] {
  const farmers: Farmer[] = [];
  FARMER_NAMES.forEach((name, i) => {
    const hamlet = HAMLETS[i % HAMLETS.length];
    const hasUpdatedThisWeek = Math.random() > 0.35;
    const birdUpdates = generateBirdUpdates(hasUpdatedThisWeek ? 8 : 7);
    if (!hasUpdatedThisWeek) {
      // Remove this week's update
      birdUpdates.forEach((u, idx) => { if (u.weekDate === thisWeek) birdUpdates.splice(idx, 1); });
    }

    const isVaccinated = Math.random() > 0.3;
    const isDewormed = Math.random() > 0.3;

    farmers.push({
      userId: `farmer-${i}`,
      name,
      phone: `98${String(42000000 + i).padStart(8, "0")}`,
      hamlet,
      shgName: SHG_NAMES[i % SHG_NAMES.length],
      role: "SHG Member",
      birdUpdates,
      vaccinations: isVaccinated ? [{
        id: crypto.randomUUID(),
        vaccineType: "Newcastle (R2B)",
        dateGiven: new Date(Date.now() - 30 * 86400000).toISOString(),
        nextDueDate: new Date(Date.now() + (Math.random() > 0.5 ? 15 : -5) * 86400000).toISOString(),
      }] : [],
      dewormings: isDewormed ? [{
        id: crypto.randomUUID(),
        dateGiven: new Date(Date.now() - 45 * 86400000).toISOString(),
        nextDueDate: new Date(Date.now() + (Math.random() > 0.5 ? 20 : -3) * 86400000).toISOString(),
      }] : [],
      serviceDemands: Math.random() > 0.6 ? [{
        id: crypto.randomUUID(),
        userId: `farmer-${i}`,
        farmerName: name,
        hamlet,
        type: ["Vaccination", "Deworming", "Feed Stock", "Loan", "Equipment"][Math.floor(Math.random() * 5)],
        quantity: Math.floor(Math.random() * 10) + 1,
        status: Math.random() > 0.5 ? "Pending" : "Completed",
        createdAt: new Date(Date.now() - Math.random() * 14 * 86400000).toISOString(),
      }] : [],
      diseaseReports: Math.random() > 0.7 ? [{
        id: crypto.randomUUID(),
        description: ["Birds not eating for 2 days", "Feathers falling, looks weak", "White discharge in droppings"][Math.floor(Math.random() * 3)],
        reportedAt: new Date(Date.now() - Math.random() * 10 * 86400000).toISOString(),
        status: Math.random() > 0.5 ? "Pending" : "Reviewed",
      }] : [],
      lastUpdateWeek: hasUpdatedThisWeek ? thisWeek : (birdUpdates.length > 0 ? birdUpdates[0].weekDate : null),
    });
  });
  return farmers;
}

let _farmers: Farmer[] | null = null;
export function getMockFarmers(): Farmer[] {
  if (!_farmers) _farmers = generateMockFarmers();
  return _farmers;
}

export function getHamletSummaries(): HamletSummary[] {
  const farmers = getMockFarmers();
  return HAMLETS.map((hamlet) => {
    const hf = farmers.filter((f) => f.hamlet === hamlet);
    const totalBirds = hf.reduce((sum, f) => {
      const latest = f.birdUpdates[0];
      return sum + (latest ? latest.chicks + latest.growers + latest.layers + latest.broilers : 0);
    }, 0);
    const vaccinated = hf.filter((f) => f.vaccinations.length > 0).length;
    const dewormed = hf.filter((f) => f.dewormings.length > 0).length;
    const pendingDemands = hf.reduce((s, f) => s + f.serviceDemands.filter((d) => d.status === "Pending").length, 0);
    return {
      hamlet,
      totalFarmers: hf.length,
      totalBirds,
      vaccinatedPct: hf.length > 0 ? Math.round((vaccinated / hf.length) * 100) : 0,
      dewormedPct: hf.length > 0 ? Math.round((dewormed / hf.length) * 100) : 0,
      pendingDemands,
    };
  });
}

export function getPendingUpdateFarmers(): Farmer[] {
  return getMockFarmers().filter((f) => f.lastUpdateWeek !== thisWeek);
}

export function getAllServiceDemands(): CrpServiceDemand[] {
  return getMockFarmers().flatMap((f) => f.serviceDemands);
}

export function getAllDiseaseReports(): (DiseaseReport & { farmerName: string; hamlet: string })[] {
  return getMockFarmers().flatMap((f) =>
    f.diseaseReports.map((r) => ({ ...r, farmerName: f.name, hamlet: f.hamlet }))
  );
}

// Buyers
const BUYERS_KEY = "crp_buyers";
export function getBuyers(): Buyer[] {
  const data = localStorage.getItem(BUYERS_KEY);
  return data ? JSON.parse(data) : [
    { id: "b1", name: "Rajan Traders", phone: "9876543210", type: "Broker" },
    { id: "b2", name: "Meena Hotel", phone: "9876543211", type: "Hotel industry" },
    { id: "b3", name: "Kumar", phone: "9876543212", type: "Individual" },
  ];
}

export function addBuyer(buyer: Omit<Buyer, "id">) {
  const buyers = getBuyers();
  buyers.push({ ...buyer, id: crypto.randomUUID() });
  localStorage.setItem(BUYERS_KEY, JSON.stringify(buyers));
}

export function getAggregatedStock(): { chicks: number; growers: number; layers: number; broilers: number; total: number } {
  const farmers = getMockFarmers();
  let chicks = 0, growers = 0, layers = 0, broilers = 0;
  farmers.forEach((f) => {
    const latest = f.birdUpdates[0];
    if (latest) {
      chicks += latest.chicks;
      growers += latest.growers;
      layers += latest.layers;
      broilers += latest.broilers;
    }
  });
  return { chicks, growers, layers, broilers, total: chicks + growers + layers + broilers };
}

export function getLatestMarketPrice(): string {
  return "₹180/kg (Broiler) | ₹6.50/egg";
}

export function getCrpPhone(): string {
  return "9876500000";
}

// CSV export
export function exportToCSV(headers: string[], rows: (string | number)[][], filename: string) {
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
