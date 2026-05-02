// Mock storage for vaccination/deworming history and market prices

export interface VaccinationRecord {
  id: string;
  date: string; // ISO
  type: "white_diarrhea" | "smallpox" | "deworming";
  ageGroup: string;
  status: "completed" | "pending";
  nextDueDate: string;
}

export interface MarketPrice {
  broiler: number;
  chick: number;
  egg: number;
  updatedAt: string;
  updatedBy: string;
}

const VAC_KEY = "vaccination_history";
const PRICE_KEY = "market_prices";

export function getVaccinationHistory(): VaccinationRecord[] {
  const data = localStorage.getItem(VAC_KEY);
  if (data) return JSON.parse(data);
  // Seed with a couple of demo records
  const today = new Date();
  const past = new Date(today); past.setDate(past.getDate() - 20);
  const next = new Date(today); next.setDate(next.getDate() + 10);
  const overdue = new Date(today); overdue.setDate(overdue.getDate() - 3);
  const seed: VaccinationRecord[] = [
    {
      id: crypto.randomUUID(),
      date: past.toISOString(),
      type: "white_diarrhea",
      ageGroup: "(0 – 7) நாள்",
      status: "completed",
      nextDueDate: next.toISOString(),
    },
    {
      id: crypto.randomUUID(),
      date: past.toISOString(),
      type: "deworming",
      ageGroup: "(60) நாள் மேல்",
      status: "pending",
      nextDueDate: overdue.toISOString(),
    },
  ];
  localStorage.setItem(VAC_KEY, JSON.stringify(seed));
  return seed;
}

export function addVaccinationRecord(rec: Omit<VaccinationRecord, "id">) {
  const list = getVaccinationHistory();
  list.unshift({ ...rec, id: crypto.randomUUID() });
  localStorage.setItem(VAC_KEY, JSON.stringify(list));
}

export function getNextDue(type: VaccinationRecord["type"]): VaccinationRecord | null {
  const list = getVaccinationHistory().filter(r => r.type === type);
  if (!list.length) return null;
  return list.sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())[0];
}

export function getMarketPrice(): MarketPrice | null {
  const data = localStorage.getItem(PRICE_KEY);
  if (data) return JSON.parse(data);
  // Seed default
  const seed: MarketPrice = {
    broiler: 180,
    chick: 50,
    egg: 7,
    updatedAt: new Date().toISOString(),
    updatedBy: "CRP நிர்வாகி",
  };
  localStorage.setItem(PRICE_KEY, JSON.stringify(seed));
  return seed;
}

export function setMarketPrice(p: MarketPrice) {
  localStorage.setItem(PRICE_KEY, JSON.stringify(p));
}

export function formatTamilDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ta-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}
