import { BirdUpdate, DiseaseReport } from "@/lib/mockData";
import { mockBirdUpdates } from "@/lib/api";

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
  amount?: number;
  notes?: string;
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
  d.setDate(d.getDate() - d.getDay()); // start of that week
  return d.toISOString().split("T")[0];
}

// Single farmer — Lakshmi S, using the app for ~3 months (13 weeks of data)
const FARMER: Farmer = {
  userId: "farmer-1",
  name: "Lakshmi S",
  phone: "9842100001",
  hamlet: "வடுகப்பட்டு",
  shgName: "Thendral SHG",
  role: "SHG Member",

  // 13 weeks of bird updates (week 0 = this week, week 12 = ~3 months ago)
  birdUpdates: [
    { id: "bu-1",  weekDate: weekOf(0),  chicks: 12, growers: 8,  layers: 20, broilers: 10 },
    { id: "bu-2",  weekDate: weekOf(7),  chicks: 10, growers: 9,  layers: 18, broilers: 12 },
    { id: "bu-3",  weekDate: weekOf(14), chicks: 8,  growers: 10, layers: 17, broilers: 14 },
    { id: "bu-4",  weekDate: weekOf(21), chicks: 6,  growers: 11, layers: 16, broilers: 15 },
    { id: "bu-5",  weekDate: weekOf(28), chicks: 14, growers: 7,  layers: 15, broilers: 11 },
    { id: "bu-6",  weekDate: weekOf(35), chicks: 13, growers: 6,  layers: 14, broilers: 10 },
    { id: "bu-7",  weekDate: weekOf(42), chicks: 11, growers: 8,  layers: 13, broilers: 9  },
    { id: "bu-8",  weekDate: weekOf(49), chicks: 9,  growers: 9,  layers: 12, broilers: 8  },
    { id: "bu-9",  weekDate: weekOf(56), chicks: 7,  growers: 10, layers: 11, broilers: 7  },
    { id: "bu-10", weekDate: weekOf(63), chicks: 10, growers: 8,  layers: 10, broilers: 6  },
    { id: "bu-11", weekDate: weekOf(70), chicks: 8,  growers: 7,  layers: 9,  broilers: 5  },
    { id: "bu-12", weekDate: weekOf(77), chicks: 6,  growers: 6,  layers: 8,  broilers: 4  },
    { id: "bu-13", weekDate: weekOf(84), chicks: 5,  growers: 5,  layers: 7,  broilers: 3  },
  ],

  // Two vaccination records over 3 months
  vaccinations: [
    {
      id: "vax-1",
      vaccineType: "Newcastle (R2B)",
      dateGiven: daysAgo(75),
      nextDueDate: daysAgo(5), // overdue — needs attention
    },
    {
      id: "vax-2",
      vaccineType: "Marek's Disease",
      dateGiven: daysAgo(45),
      nextDueDate: daysFromNow(15),
    },
  ],

  // Two deworming records
  dewormings: [
    {
      id: "dew-1",
      dateGiven: daysAgo(80),
      nextDueDate: daysAgo(10), // overdue
    },
    {
      id: "dew-2",
      dateGiven: daysAgo(40),
      nextDueDate: daysFromNow(20),
    },
  ],

  // Service demands over 3 months — loan, feed, equipment
  serviceDemands: [
    {
      id: "sd-1",
      userId: "farmer-1",
      farmerName: "Lakshmi S",
      hamlet: "வடுகப்பட்டு",
      type: "Loan",
      quantity: 1,
      amount: 15000,
      notes: "கோழி கூண்டு வாங்க கடன் தேவை",
      status: "Completed",
      createdAt: daysAgo(85),
    },
    {
      id: "sd-2",
      userId: "farmer-1",
      farmerName: "Lakshmi S",
      hamlet: "வடுகப்பட்டு",
      type: "Feed Stock",
      quantity: 5,
      notes: "5 bags of layer mash needed",
      status: "Completed",
      createdAt: daysAgo(60),
    },
    {
      id: "sd-3",
      userId: "farmer-1",
      farmerName: "Lakshmi S",
      hamlet: "வடுகப்பட்டு",
      type: "Equipment",
      quantity: 2,
      notes: "2 water drinkers broken, need replacement",
      status: "Completed",
      createdAt: daysAgo(40),
    },
    {
      id: "sd-4",
      userId: "farmer-1",
      farmerName: "Lakshmi S",
      hamlet: "வடுகப்பட்டு",
      type: "Feed Stock",
      quantity: 3,
      notes: "3 bags of chick starter feed",
      status: "Completed",
      createdAt: daysAgo(20),
    },
    {
      id: "sd-5",
      userId: "farmer-1",
      farmerName: "Lakshmi S",
      hamlet: "வடுகப்பட்டு",
      type: "Loan",
      quantity: 1,
      amount: 8000,
      notes: "புதிய கோழி வாங்க கடன் தேவை",
      status: "Pending",
      createdAt: daysAgo(3),
    },
    {
      id: "sd-6",
      userId: "farmer-1",
      farmerName: "Lakshmi S",
      hamlet: "வடுகப்பட்டு",
      type: "Equipment",
      quantity: 1,
      notes: "Feeder tray cracked, need 1 new one",
      status: "Pending",
      createdAt: daysAgo(1),
    },
  ],

  // Disease reports over 3 months
  diseaseReports: [
    {
      id: "dr-1",
      description: "3 birds not eating for 2 days, sitting separately",
      reportedAt: daysAgo(70),
      status: "Reviewed",
    },
    {
      id: "dr-2",
      description: "White discharge in droppings, feathers look dull",
      reportedAt: daysAgo(35),
      status: "Reviewed",
    },
    {
      id: "dr-3",
      description: "2 chicks died overnight, cause unknown",
      reportedAt: daysAgo(5),
      status: "Pending",
    },
  ],

  lastUpdateWeek: weekOf(0),
};

let _farmers: Farmer[] | null = null;
export function getMockFarmers(): Farmer[] {
  if (!_farmers) _farmers = [FARMER];
  return _farmers;
}

export function getHamletSummaries(): HamletSummary[] {
  const f = FARMER;
  const latest = f.birdUpdates[0];
  const totalBirds = latest ? latest.chicks + latest.growers + latest.layers + latest.broilers : 0;
  return [
    {
      hamlet: f.hamlet,
      totalFarmers: 1,
      totalBirds,
      vaccinatedPct: f.vaccinations.length > 0 ? 100 : 0,
      dewormedPct: f.dewormings.length > 0 ? 100 : 0,
      pendingDemands: f.serviceDemands.filter((d) => d.status === "Pending").length,
    },
  ];
}

export function getPendingUpdateFarmers(): Farmer[] {
  const thisWeek = weekOf(0);
  const updatedThisWeek = mockBirdUpdates.some((u: any) => u.weekDate === thisWeek);
  return getMockFarmers().filter(() => !updatedThisWeek);
}

export function getAllServiceDemands(): CrpServiceDemand[] {
  return FARMER.serviceDemands;
}

export function getAllDiseaseReports(): (DiseaseReport & { farmerName: string; hamlet: string })[] {
  return FARMER.diseaseReports.map((r) => ({
    ...r,
    farmerName: FARMER.name,
    hamlet: FARMER.hamlet,
  }));
}

// Buyers
const BUYERS_KEY = "crp_buyers";
export function getBuyers(): Buyer[] {
  const data = localStorage.getItem(BUYERS_KEY);
  return data ? JSON.parse(data) : [
    { id: "b1", name: "Rajan Traders", phone: "6381679573", type: "Broker" },
    { id: "b2", name: "Meena Hotel", phone: "9876543211", type: "Hotel industry" },
    { id: "b3", name: "Kumar", phone: "9876543212", type: "Individual" },
  ];
}

export function addBuyer(buyer: Omit<Buyer, "id">) {
  const buyers = getBuyers();
  buyers.push({ ...buyer, id: crypto.randomUUID() });
  localStorage.setItem(BUYERS_KEY, JSON.stringify(buyers));
}

export function getAggregatedStock() {
  const latest = FARMER.birdUpdates[0];
  if (!latest) return { chicks: 0, growers: 0, layers: 0, broilers: 0, total: 0 };
  const { chicks, growers, layers, broilers } = latest;
  return { chicks, growers, layers, broilers, total: chicks + growers + layers + broilers };
}

export function getLatestMarketPrice(): string {
  return "₹180/kg (Broiler) | ₹6.50/egg";
}

export function getCrpPhone(): string {
  return "9876500000";
}

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
