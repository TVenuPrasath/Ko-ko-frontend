import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/LanguageContext";
import { User, clearUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Users,
  Home,
  FileText,
  Bell,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Loader2,
  Syringe,
  ClipboardList,
  AlertTriangle,
} from "lucide-react";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type AdminTab = "overview" | "users" | "hamlets" | "reports" | "notifications";
type ReportSubTab = "birds" | "vaccinations" | "services" | "diseases";

const AdminDashboard = ({ user, onLogout }: AdminDashboardProps) => {
  const { t, lang, setLang } = useLanguage();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>("birds");

  // Stats State
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [crps, setCrps] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // CRP Form State
  const [crpForm, setCrpForm] = useState({ name: "", phone: "", designation: "CRP", assignedLocation: "", password: "" });
  const [editingCrpId, setEditingCrpId] = useState<string | null>(null);
  const [showCrpModal, setShowCrpModal] = useState(false);

  // Hamlets State
  const [hamlets, setHamlets] = useState<any[]>([]);
  const [loadingHamlets, setLoadingHamlets] = useState(false);
  const [newHamletName, setNewHamletName] = useState("");
  const [editingHamletId, setEditingHamletId] = useState<string | null>(null);
  const [editingHamletName, setEditingHamletName] = useState("");
  const [assignCrpMap, setAssignCrpMap] = useState<Record<string, string>>({});

  // Reports States
  const [birdReports, setBirdReports] = useState<any[]>([]);
  const [vaxReports, setVaxReports] = useState<any[]>([]);
  const [serviceReports, setServiceReports] = useState<any[]>([]);
  const [diseaseReports, setDiseaseReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);

  // Notifications State
  const [notificationLogs, setNotificationLogs] = useState<any[]>([]);
  const [newNotification, setNewNotification] = useState({ type: "vaccination_reminder", message: "", hamlet: "", shg_name: "" });
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (tab === "overview") loadStats();
    if (tab === "users") loadUsersAndCRPs();
    if (tab === "hamlets") loadHamletsData();
    if (tab === "reports") loadReports();
    if (tab === "notifications") loadNotificationsData();
  }, [tab]);

  // --- API Loaders ---
  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load dashboard stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsersAndCRPs = async () => {
    setLoadingUsers(true);
    try {
      const [allUsers, allCrps, allBuyers] = await Promise.all([
        api.getAdminUsers(),
        api.getCrps(),
        api.getBuyers().catch(() => []),
      ]);
      setUsers(allUsers);
      setCrps(allCrps);
      setBuyers(allBuyers);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load user records");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadHamletsData = async () => {
    setLoadingHamlets(true);
    try {
      const [allHamlets, allCrps] = await Promise.all([
        api.getHamlets(),
        api.getCrps(),
      ]);
      setHamlets(allHamlets);
      setCrps(allCrps);
      const initialMap: Record<string, string> = {};
      allHamlets.forEach((h: any) => {
        initialMap[h._id] = h.crpId?._id || "unassigned";
      });
      setAssignCrpMap(initialMap);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load hamlets");
    } finally {
      setLoadingHamlets(false);
    }
  };

  const loadReports = async () => {
    setLoadingReports(true);
    try {
      if (reportSubTab === "birds") {
        const data = await api.getAllBirdUpdates();
        setBirdReports(data);
      } else if (reportSubTab === "vaccinations") {
        const data = await api.getAllVaccinations();
        setVaxReports(data);
      } else if (reportSubTab === "services") {
        const data = await api.getAllServiceDemands();
        setServiceReports(data);
      } else if (reportSubTab === "diseases") {
        const data = await api.getAllDiseaseReports();
        setDiseaseReports(data);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load reports");
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (tab === "reports") loadReports();
  }, [reportSubTab]);

  const loadNotificationsData = async () => {
    setLoadingNotifs(true);
    try {
      const data = await api.getNotifications();
      setNotificationLogs(data);
      const hData = await api.getHamlets();
      setHamlets(hData);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load notifications");
    } finally {
      setLoadingNotifs(false);
    }
  };

  // --- Actions ---
  const handleToggleApprove = async (userId: string) => {
    try {
      await api.toggleUserApproval(userId);
      toast.success("User approval status updated");
      loadUsersAndCRPs();
    } catch (err: any) {
      toast.error(err?.message || "Operation failed");
    }
  };

  const handleSaveCrp = async () => {
    if (!crpForm.name || !crpForm.phone) {
      toast.error("Name and Phone are required");
      return;
    }
    try {
      if (editingCrpId) {
        await api.updateCrp(editingCrpId, crpForm);
        toast.success("CRP profile updated");
      } else {
        await api.createCrp(crpForm);
        toast.success("CRP created successfully");
      }
      setCrpForm({ name: "", phone: "", designation: "CRP", assignedLocation: "", password: "" });
      setEditingCrpId(null);
      setShowCrpModal(false);
      loadUsersAndCRPs();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save CRP");
    }
  };

  const handleDeleteCrp = async (id: string) => {
    if (!confirm("Are you sure you want to delete this CRP? This will delete their CRP login too.")) return;
    try {
      await api.deleteCrp(id);
      toast.success("CRP deleted");
      loadUsersAndCRPs();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const handleAddHamlet = async () => {
    if (!newHamletName.trim()) return;
    try {
      await api.addHamlet(newHamletName.trim());
      toast.success("Hamlet added successfully");
      setNewHamletName("");
      loadHamletsData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to add Hamlet");
    }
  };

  const handleUpdateHamlet = async (id: string) => {
    if (!editingHamletName.trim()) return;
    try {
      await api.editHamlet(id, editingHamletName.trim());
      toast.success("Hamlet renamed");
      setEditingHamletId(null);
      setEditingHamletName("");
      loadHamletsData();
    } catch (err: any) {
      toast.error(err?.message || "Rename failed");
    }
  };

  const handleDeleteHamlet = async (id: string) => {
    if (!confirm("Delete this hamlet? All streets in it will be deleted.")) return;
    try {
      await api.deleteHamlet(id);
      toast.success("Hamlet deleted");
      loadHamletsData();
    } catch (err: any) {
      toast.error(err?.message || "Delete failed");
    }
  };

  const handleAssignCrp = async (hamletId: string, crpId: string) => {
    try {
      const resolvedCrpId = crpId === "unassigned" ? "" : crpId;
      await api.editHamlet(hamletId, undefined, resolvedCrpId);
      toast.success("CRP assigned to hamlet");
      loadHamletsData();
    } catch (err: any) {
      toast.error(err?.message || "Assignment failed");
    }
  };

  const handleReviewDisease = async (id: string) => {
    try {
      await api.reviewDiseaseReport(id);
      toast.success("Disease report reviewed");
      loadReports();
    } catch (err: any) {
      toast.error(err?.message || "Failed to review report");
    }
  };

  const handleSendNotification = async () => {
    if (!newNotification.message.trim()) {
      toast.error("Notification message required");
      return;
    }
    try {
      await api.createNotification({
        type: newNotification.type,
        message: newNotification.message.trim(),
        hamlet: newNotification.hamlet || undefined,
        shg_name: newNotification.shg_name || undefined,
      });
      toast.success("Notification sent!");
      setNewNotification({ type: "vaccination_reminder", message: "", hamlet: "", shg_name: "" });
      loadNotificationsData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to send notification");
    }
  };

  const handleLogoutClick = () => {
    clearUser();
    onLogout();
  };

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-slate-50 flex flex-col pb-20 shadow-xl border-x">
      {/* Header */}
      <header className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between shadow-sm" style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg bg-white/10" />
          <div>
            <h1 className="text-base font-bold text-white leading-tight">Ko-Ko Admin</h1>
            <p className="text-xs text-slate-300">Control Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === "ta" ? "en" : "ta")}
            className="text-xs font-bold border border-white/20 rounded-lg px-2.5 py-1 text-slate-300 hover:text-white hover:border-white/50 bg-white/5"
          >
            {lang === "ta" ? "EN" : "தமிழ்"}
          </button>
          <button onClick={handleLogoutClick} className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto">
        {/* TAB 1: OVERVIEW */}
        {tab === "overview" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800">Operational Overview</h2>
            {loadingStats ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : stats ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-semibold">Total Farmers</span>
                  <span className="text-2xl font-bold text-emerald-700">{stats.totalFarmers}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-semibold">Total CRPs</span>
                  <span className="text-2xl font-bold text-indigo-700">{stats.totalCrps}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-semibold">Hamlets</span>
                  <span className="text-2xl font-bold text-blue-700">{stats.totalHamlets}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-semibold">Active Birds</span>
                  <span className="text-2xl font-bold text-amber-700">{stats.totalBirds}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-1 col-span-2">
                  <span className="text-xs text-muted-foreground font-semibold">Buyers Registered</span>
                  <span className="text-2xl font-bold text-slate-700">{stats.totalBuyers}</span>
                </div>
                <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-1 col-span-2">
                  <span className="text-xs text-muted-foreground font-semibold">Disease Alerts</span>
                  <span className="text-2xl font-bold text-rose-600">{stats.totalDiseaseReports}</span>
                </div>
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">No statistics available.</p>
            )}
          </div>
        )}

        {/* TAB 2: USER MANAGEMENT */}
        {tab === "users" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">User Management</h2>
              <Button size="sm" className="gap-1.5" onClick={() => { setEditingCrpId(null); setCrpForm({ name: "", phone: "", designation: "CRP", assignedLocation: "", password: "" }); setShowCrpModal(true); }}>
                <Plus size={16} /> CRP
              </Button>
            </div>

            {showCrpModal && (
              <div className="bg-white p-4 rounded-xl border shadow-md flex flex-col gap-3">
                <h3 className="text-sm font-bold text-slate-700">{editingCrpId ? "Edit CRP Profile" : "Create CRP Account"}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Full Name</Label>
                    <Input size={24} value={crpForm.name} onChange={(e) => setCrpForm({ ...crpForm, name: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Phone Number</Label>
                    <Input size={10} value={crpForm.phone} onChange={(e) => setCrpForm({ ...crpForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-xs">Designation</Label>
                    <Select value={crpForm.designation} onValueChange={(v) => setCrpForm({ ...crpForm, designation: v })}>
                      <SelectTrigger className="text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRP">CRP</SelectItem>
                        <SelectItem value="PLF Representative">PLF Representative</SelectItem>
                        <SelectItem value="Animal Husbandry Officer">Animal Husbandry Officer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Location</Label>
                    <Input value={crpForm.assignedLocation} onChange={(e) => setCrpForm({ ...crpForm, assignedLocation: e.target.value })} />
                  </div>
                  {!editingCrpId && (
                    <div className="col-span-2">
                      <Label className="text-xs">Password</Label>
                      <Input type="password" value={crpForm.password} onChange={(e) => setCrpForm({ ...crpForm, password: e.target.value })} placeholder="Default: changeme123" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-end mt-2">
                  <Button size="sm" variant="outline" onClick={() => setShowCrpModal(false)}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveCrp}>Save Profile</Button>
                </div>
              </div>
            )}

            {loadingUsers ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* CRPs Section */}
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Community Resource Persons (CRPs)</h3>
                  {crps.map((crp) => (
                    <div key={crp._id} className="bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{crp.name}</p>
                        <p className="text-xs text-muted-foreground">{crp.phone} • {crp.designation}</p>
                        <p className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 mt-1 w-fit">Location: {crp.assignedLocation || "None"}</p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="icon" variant="outline" className="w-8 h-8 text-blue-600" onClick={() => { setEditingCrpId(crp._id); setCrpForm({ name: crp.name, phone: crp.phone, designation: crp.designation, assignedLocation: crp.assignedLocation || "", password: "" }); setShowCrpModal(true); }}>
                          <Edit2 size={14} />
                        </Button>
                        <Button size="icon" variant="outline" className="w-8 h-8 text-rose-600" onClick={() => handleDeleteCrp(crp._id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Farmers Section */}
                <div className="flex flex-col gap-2 mt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Farmers</h3>
                  {users.filter(u => u.role === "SHG Member").map((farmer) => (
                    <div key={farmer._id} className="bg-white p-3 rounded-xl border shadow-sm flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{farmer.name}</p>
                        <p className="text-xs text-muted-foreground">{farmer.phone} • {farmer.shg_name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{farmer.hamlet} ({farmer.street})</p>
                      </div>
                      <div>
                        <Button
                          size="sm"
                          variant={farmer.approved ? "outline" : "default"}
                          className={`h-8 text-xs font-semibold ${farmer.approved ? "text-rose-600 border-rose-200 hover:bg-rose-50" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}
                          onClick={() => handleToggleApprove(farmer._id)}
                        >
                          {farmer.approved ? "Suspend" : "Approve"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buyers Section */}
                <div className="flex flex-col gap-2 mt-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Buyers</h3>
                  {buyers.map((buyer) => (
                    <div key={buyer._id} className="bg-white p-3 rounded-xl border shadow-sm">
                      <p className="font-bold text-slate-800 text-sm">{buyer.name}</p>
                      <p className="text-xs text-muted-foreground">{buyer.phone} • Type: {buyer.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HAMLET MANAGEMENT */}
        {tab === "hamlets" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800">Hamlet & CRP Assignment</h2>

            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-2">
              <Label className="text-xs font-semibold">Create New Hamlet</Label>
              <div className="flex gap-2">
                <Input placeholder="Hamlet Name" value={newHamletName} onChange={(e) => setNewHamletName(e.target.value)} />
                <Button onClick={handleAddHamlet}>Add</Button>
              </div>
            </div>

            {loadingHamlets ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="flex flex-col gap-2">
                {hamlets.map((hamlet) => (
                  <div key={hamlet._id} className="bg-white p-3 rounded-xl border shadow-sm flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      {editingHamletId === hamlet._id ? (
                        <div className="flex gap-1.5 flex-1 mr-4">
                          <Input size={12} value={editingHamletName} onChange={(e) => setEditingHamletName(e.target.value)} className="h-8 text-sm" />
                          <Button size="sm" onClick={() => handleUpdateHamlet(hamlet._id)}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingHamletId(null)}>Cancel</Button>
                        </div>
                      ) : (
                        <p className="font-bold text-slate-800 text-sm">{hamlet.name}</p>
                      )}
                      {editingHamletId !== hamlet._id && (
                        <div className="flex gap-1">
                          <button onClick={() => { setEditingHamletId(hamlet._id); setEditingHamletName(hamlet.name); }} className="p-1 text-slate-400 hover:text-slate-600"><Edit2 size={14} /></button>
                          <button onClick={() => handleDeleteHamlet(hamlet._id)} className="p-1 text-rose-400 hover:text-rose-600"><Trash2 size={14} /></button>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Assigned CRP</Label>
                      <Select
                        value={assignCrpMap[hamlet._id] || "unassigned"}
                        onValueChange={(v) => {
                          setAssignCrpMap({ ...assignCrpMap, [hamlet._id]: v });
                          handleAssignCrp(hamlet._id, v);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs bg-slate-50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {crps.map((c) => (
                            <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {tab === "reports" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800">Operational Reports</h2>

            {/* Sub-tabs */}
            <div className="flex bg-slate-200/60 p-1 rounded-xl">
              {(["birds", "vaccinations", "services", "diseases"] as ReportSubTab[]).map((sub) => (
                <button
                  key={sub}
                  onClick={() => setReportSubTab(sub)}
                  className={`flex-1 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${reportSubTab === sub ? "bg-white text-slate-800 shadow-sm" : "text-muted-foreground hover:text-slate-700"}`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {loadingReports ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Bird Stock Report */}
                {reportSubTab === "birds" && birdReports.map((report) => (
                  <div key={report._id} className="bg-white p-3 rounded-xl border shadow-sm text-xs">
                    <div className="flex justify-between font-bold mb-1">
                      <span>{report.userId?.name || "Unknown"}</span>
                      <span className="text-muted-foreground">{new Date(report.weekDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-muted-foreground mb-2">{report.userId?.hamlet} • {report.userId?.shg_name}</p>
                    <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2 rounded-lg font-semibold text-slate-700 text-center">
                      <div><p className="text-[10px] text-muted-foreground">Chicks</p><p>{report.chicks}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Growers</p><p>{report.growers}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Layers</p><p>{report.layers}</p></div>
                      <div><p className="text-[10px] text-muted-foreground">Broilers</p><p>{report.broilers}</p></div>
                    </div>
                  </div>
                ))}

                {/* Vaccination Report */}
                {reportSubTab === "vaccinations" && vaxReports.map((report) => (
                  <div key={report._id} className="bg-white p-3 rounded-xl border shadow-sm text-xs flex flex-col gap-1">
                    <div className="flex justify-between font-bold">
                      <span>{report.label}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${report.status === "completed" ? "bg-emerald-100 text-emerald-800" : report.status === "missed" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{report.status}</span>
                    </div>
                    <p className="text-slate-700">Farmer: {report.userId?.name || "Farmer"} ({report.userId?.hamlet})</p>
                    <p className="text-muted-foreground">Scheduled Date: {new Date(report.scheduledDate).toLocaleDateString()}</p>
                    {report.notes && <p className="text-slate-500 italic mt-0.5">Notes: {report.notes}</p>}
                  </div>
                ))}

                {/* Service Demand Report */}
                {reportSubTab === "services" && serviceReports.map((report) => (
                  <div key={report._id} className="bg-white p-3 rounded-xl border shadow-sm text-xs flex flex-col gap-1">
                    <div className="flex justify-between font-bold">
                      <span className="capitalize">{report.type}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${report.status === "Completed" ? "bg-emerald-100 text-emerald-800" : report.status === "Rejected" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{report.status}</span>
                    </div>
                    <p className="text-slate-700">Farmer: {report.farmerName || "Farmer"} ({report.hamlet})</p>
                    <p className="text-slate-600">Qty: {report.quantity} {report.option && `(${report.option})`}</p>
                    {report.amount && <p className="font-semibold text-emerald-700">Amount: ₹{report.amount}</p>}
                  </div>
                ))}

                {/* Disease Reports */}
                {reportSubTab === "diseases" && diseaseReports.map((report) => (
                  <div key={report._id} className="bg-white p-3 rounded-xl border shadow-sm text-xs flex flex-col gap-2">
                    <div className="flex justify-between font-bold">
                      <span>Report #{report._id.slice(-6)}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${report.status === "Reviewed" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>{report.status}</span>
                    </div>
                    <p className="text-slate-700 font-semibold">{report.userId?.name} ({report.userId?.hamlet})</p>
                    <p className="text-slate-600 bg-slate-50 p-2 rounded">{report.description}</p>
                    {report.photo && (
                      <img src={report.photo} alt="Disease Report" className="w-full h-32 object-cover rounded-lg" />
                    )}
                    {report.status !== "Reviewed" && (
                      <Button size="sm" onClick={() => handleReviewDisease(report._id)} className="w-fit self-end mt-1 gap-1">
                        <CheckCircle size={14} /> Mark Reviewed
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {tab === "notifications" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-slate-800">Global Announcements</h2>

            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col gap-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Broadcast Notification</h3>
              
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Select Category</Label>
                <Select value={newNotification.type} onValueChange={(v) => setNewNotification({ ...newNotification, type: v })}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination_reminder">Vaccination Alert</SelectItem>
                    <SelectItem value="disease_outbreak">Disease Outbreak warning</SelectItem>
                    <SelectItem value="general_announcement">General Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Filter by Hamlet (Optional)</Label>
                <Select value={newNotification.hamlet} onValueChange={(v) => setNewNotification({ ...newNotification, hamlet: v === "all" ? "" : v })}>
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder="All Hamlets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hamlets</SelectItem>
                    {hamlets.map((h) => (
                      <SelectItem key={h._id} value={h.name}>{h.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs">Notification Message</Label>
                <Input value={newNotification.message} onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })} placeholder="Write notification message..." />
              </div>

              <Button onClick={handleSendNotification} className="w-full mt-2">Send Announcement</Button>
            </div>

            {loadingNotifs ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Broadcast Logs</h3>
                {notificationLogs.map((log) => (
                  <div key={log.notification_id} className="bg-white p-3 rounded-xl border shadow-sm text-xs">
                    <div className="flex justify-between font-bold mb-1">
                      <span className="capitalize text-slate-700">{log.type.replace(/_/g, " ")}</span>
                      <span className="text-muted-foreground">{new Date(log.created_at || log.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-800 font-semibold mb-1">{log.title}</p>
                    <p className="text-slate-600 bg-slate-50 p-2 rounded leading-relaxed">{log.message}</p>
                    {log.hamlet && <p className="text-[10px] text-blue-600 font-bold mt-1.5">Target Hamlet: {log.hamlet}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navigation Footer */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-10">
        <div className="max-w-[430px] mx-auto flex justify-around">
          <button onClick={() => setTab("overview")} className={`flex-1 flex flex-col items-center py-2.5 ${tab === "overview" ? "text-slate-900 font-bold" : "text-slate-400"}`}>
            <LayoutDashboard size={20} />
            <span className="text-[9px] mt-0.5">Overview</span>
          </button>
          <button onClick={() => setTab("users")} className={`flex-1 flex flex-col items-center py-2.5 ${tab === "users" ? "text-slate-900 font-bold" : "text-slate-400"}`}>
            <Users size={20} />
            <span className="text-[9px] mt-0.5">Users</span>
          </button>
          <button onClick={() => setTab("hamlets")} className={`flex-1 flex flex-col items-center py-2.5 ${tab === "hamlets" ? "text-slate-900 font-bold" : "text-slate-400"}`}>
            <Home size={20} />
            <span className="text-[9px] mt-0.5">Hamlets</span>
          </button>
          <button onClick={() => setTab("reports")} className={`flex-1 flex flex-col items-center py-2.5 ${tab === "reports" ? "text-slate-900 font-bold" : "text-slate-400"}`}>
            <FileText size={20} />
            <span className="text-[9px] mt-0.5">Reports</span>
          </button>
          <button onClick={() => setTab("notifications")} className={`flex-1 flex flex-col items-center py-2.5 ${tab === "notifications" ? "text-slate-900 font-bold" : "text-slate-400"}`}>
            <Bell size={20} />
            <span className="text-[9px] mt-0.5">Alerts</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminDashboard;
