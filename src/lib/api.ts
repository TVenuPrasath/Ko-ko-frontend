const BASE = "https://ko-ko.onrender.com/api";

function getToken() {
  return localStorage.getItem("token") || "";
}

async function request(method: string, path: string, body?: object, auth = true) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) headers["Authorization"] = `Bearer ${getToken()}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export const api = {
  // Auth
  sendOtp: (phone: string) => request("POST", "/auth/send-otp", { phone }, false),
  verifyOtp: (phone: string, otp: string) => request("POST", "/auth/verify-otp", { phone, otp }, false),
  register: (data: { phone: string; name: string; hamlet: string; street: string; houseNo: string; shg_name: string }) =>
    request("POST", "/auth/register", data, false),

  // Bird Updates
  getBirdUpdates: () => request("GET", "/birds"),
  checkWeekSubmitted: () => request("GET", "/birds/check-week"),
  submitBirdUpdate: (body: { chicks: number; growers: number; layers: number; broilers: number }) =>
    request("POST", "/birds", body),
  getAllBirdUpdates: () => request("GET", "/birds/all"),

  // Vaccinations
  getVaccinations: () => request("GET", "/vaccinations"),
  getAllVaccinations: () => request("GET", "/vaccinations/all"),
  addVaccination: (body: object) => request("POST", "/vaccinations", body),
  getMySchedule: () => request("GET", "/vaccinations/schedule/me"),
  getFarmerSchedule: (farmerId: string) => request("GET", `/vaccinations/schedule/${farmerId}`),
  setBatchDate: (body: { userId: string; batchDate: string }) => request("POST", "/vaccinations/batch", body),
  completeVaccination: (id: string) => request("PATCH", `/vaccinations/${id}/complete`),

  // Service Demands
  getServiceDemands: () => request("GET", "/services"),
  getAllServiceDemands: () => request("GET", "/services/all"),
  submitServiceDemand: (body: { type: string; quantity: number; amount?: number; notes?: string }) =>
    request("POST", "/services", body),
  completeServiceDemand: (id: string) => request("PATCH", `/services/${id}/complete`),
  rejectServiceDemand: (id: string) => request("PATCH", `/services/${id}/reject`),

  // Disease Reports
  getDiseaseReports: () => request("GET", "/disease"),
  getAllDiseaseReports: () => request("GET", "/disease/all"),
  submitDiseaseReport: (body: { description: string; photo?: string }) => request("POST", "/disease", body),
  reviewDiseaseReport: (id: string) => request("PATCH", `/disease/${id}/review`),

  // Market Prices
  getMarketPrice: () => request("GET", "/market", undefined, false),
  setMarketPrice: (body: { broiler: number; chick: number; egg: number }, officer?: any) => request("POST", "/market", body),

  // Notifications
  getNotifications: () => request("GET", "/notifications"),
  createNotification: (body: { type: string; message: string; hamlet?: string; shg_name?: string; shg_names?: string[] }) =>
    request("POST", "/notifications", body),
  deleteNotification: (id: string) => request("DELETE", `/notifications/${id}`),

  // Farmers (CRP)
  getFarmers: () => request("GET", "/farmers"),
  getPendingFarmers: () => request("GET", "/farmers?approved=false"),
  approveFarmer: (id: string) => request("PATCH", `/farmers/${id}/approve`),
  rejectFarmer: (id: string) => request("DELETE", `/farmers/${id}/reject`),
  deleteFarmer: (id: string) => request("DELETE", `/farmers/${id}`),

  // SHG Groups
  getShgGroups: () => request("GET", "/shg", undefined, false),
  addShgGroup: (name: string) => request("POST", "/shg", { name }),
  deleteShgGroup: (id: string) => request("DELETE", `/shg/${id}`),

  // Sale Stocks
  getSaleStocks: () => request("GET", "/sale-stocks", undefined, false),
  submitSaleStock: (body: { broilers: number; chicks: number; eggs: number }) =>
    request("POST", "/sale-stocks", body),
  markSold: (id: string) => request("PATCH", `/sale-stocks/${id}/sold`),

  // Activity Feed
  getActivity: () => request("GET", "/activity"),
};
