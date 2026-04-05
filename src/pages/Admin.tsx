import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Eye, Calendar, Mail, Phone, MapPin, User, Download, FileText, CreditCard, Briefcase, Shield, PhoneCall, Clock, MessageSquare, Copy, Check, RefreshCw } from "lucide-react";
import { format, startOfDay, startOfWeek } from "date-fns";
import { generateApplicationPDF } from "@/lib/generateApplicationPDF";
import { generateW4PDF } from "@/lib/generateW4PDF";
import { generateEmploymentApplicationPDF } from "@/lib/generateEmploymentApplicationPDF";
import { AvailabilityTable } from "@/components/AvailabilityTable";

interface AvailabilityData {
  [key: string]: {
    from?: string;
    to?: string;
  };
}

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  desired_position?: string;
  created_at: string;
  full_form_data: Record<string, unknown>;
  availability?: AvailabilityData;
}

interface EmploymentApplication {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  date_of_birth?: string;
  job_applied_for?: string;
  employment_type?: string;
  start_date?: string;
  level2_license?: boolean;
  level3_license?: boolean;
  level4_license?: boolean;
  created_at: string;
  full_form_data: Record<string, unknown>;
}

interface RetellCall {
  id: string;
  call_id?: string;
  caller_number?: string;
  callee_number?: string;
  call_status?: string;
  call_type?: string;
  direction?: string;
  duration_ms?: number;
  start_time?: string;
  end_time?: string;
  transcript?: string;
  summary?: string;
  sentiment?: string;
  custom_data?: Record<string, unknown>;
  recording_url?: string;
  recording_multi_channel_url?: string;
  public_log_url?: string;
  retell_agent_id?: string;
  agent_name?: string;
  agent_version?: number;
  disconnection_reason?: string;
  transcript_object?: Array<Record<string, unknown>>;
  call_analysis?: Record<string, unknown>;
  call_cost?: Record<string, unknown>;
  latency?: Record<string, unknown>;
  retell_llm_dynamic_variables?: Record<string, unknown>;
  collected_dynamic_variables?: Record<string, unknown>;
  transfer_destination?: string;
  event_type?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

type CallFilter = "all" | "today" | "week" | "custom";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [employmentApplications, setEmploymentApplications] = useState<EmploymentApplication[]>([]);
  const [retellCalls, setRetellCalls] = useState<RetellCall[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [callFilter, setCallFilter] = useState<CallFilter>("all");
  const [customDate, setCustomDate] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const baseUrl = "https://apply.kairossecurity.com";

  const copyLink = (path: string) => {
    const url = `${baseUrl}${path}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(path);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const normalizePhone = (phone?: string | null): string => {
    if (!phone) return "";
    return phone.replace(/\D/g, "").slice(-10);
  };

  const findMatchingApplication = (call: RetellCall): EmploymentApplication | undefined => {
    const callerNorm = normalizePhone(call.caller_number);
    if (!callerNorm) return undefined;
    return employmentApplications.find(app => normalizePhone(app.phone) === callerNorm);
  };

  const filteredCalls = useMemo(() => {
    const now = new Date();
    return retellCalls.filter(call => {
      const callDate = new Date(call.start_time || call.created_at);
      switch (callFilter) {
        case "today": {
          const todayStart = startOfDay(now);
          return callDate >= todayStart;
        }
        case "week": {
          const weekStart = startOfWeek(now, { weekStartsOn: 1 });
          return callDate >= weekStart;
        }
        case "custom": {
          if (!customDate) return true;
          const selected = startOfDay(new Date(customDate));
          const nextDay = new Date(selected);
          nextDay.setDate(nextDay.getDate() + 1);
          return callDate >= selected && callDate < nextDay;
        }
        default:
          return true;
      }
    });
  }, [retellCalls, callFilter, customDate]);

  const [refreshing, setRefreshing] = useState(false);

  const refreshData = async () => {
    setRefreshing(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("get-applications", {
        body: { password },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setApplications(data.applications || []);
      setEmploymentApplications(data.employmentApplications || []);
      setRetellCalls(data.retellCalls || []);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: fnError } = await supabase.functions.invoke("get-applications", {
        body: { password },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setApplications(data.applications || []);
      setEmploymentApplications(data.employmentApplications || []);
      setRetellCalls(data.retellCalls || []);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const formatFieldName = (name: string) =>
    name.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/^./, (s) => s.toUpperCase()).trim();

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getAvailability = (app: Application): AvailabilityData | null => {
    if (app.availability && Object.keys(app.availability).length > 0) {
      const hasData = Object.values(app.availability).some((day) => day?.from || day?.to);
      if (hasData) return app.availability;
    }
    const formData = app.full_form_data;
    if (!formData) return null;
    const availability: AvailabilityData = {
      monday: { from: formData.mondayFrom as string, to: formData.mondayTo as string },
      tuesday: { from: formData.tuesdayFrom as string, to: formData.tuesdayTo as string },
      wednesday: { from: formData.wednesdayFrom as string, to: formData.wednesdayTo as string },
      thursday: { from: formData.thursdayFrom as string, to: formData.thursdayTo as string },
      friday: { from: formData.fridayFrom as string, to: formData.fridayTo as string },
      saturday: { from: formData.saturdayFrom as string, to: formData.saturdayTo as string },
      sunday: { from: formData.sundayFrom as string, to: formData.sundayTo as string },
    };
    const hasData = Object.values(availability).some((day) => day?.from || day?.to);
    return hasData ? availability : null;
  };

  const handleDownloadEmploymentPDF = (app: EmploymentApplication) => {
    const formData = app.full_form_data as Record<string, any>;
    generateEmploymentApplicationPDF({ ...formData, firstName: app.first_name, lastName: app.last_name });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Access Dashboard"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyLink("/onboarding-packet")}
              className="gap-2"
            >
              {copiedLink === "/onboarding-packet" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copiedLink === "/onboarding-packet" ? "Copied!" : "Copy Onboarding Link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyLink("/employment-application")}
              className="gap-2"
            >
              {copiedLink === "/employment-application" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copiedLink === "/employment-application" ? "Copied!" : "Copy Application Link"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsAuthenticated(false)}>
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="onboarding" className="space-y-6">
           <TabsList>
            <TabsTrigger value="onboarding">
              Onboarding Packets ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="employment">
              Employment Applications ({employmentApplications.length})
            </TabsTrigger>
            <TabsTrigger value="calls">
              <PhoneCall className="w-4 h-4 mr-1" />
              Calls ({filteredCalls.length}{callFilter !== "all" ? `/${retellCalls.length}` : ""})
            </TabsTrigger>
          </TabsList>

          {/* Onboarding Packets Tab */}
          <TabsContent value="onboarding">
            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No onboarding packets submitted yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold text-lg">
                                {app.first_name} {app.middle_name || ""} {app.last_name}
                              </span>
                              {app.desired_position && (
                                <Badge variant="secondary">{app.desired_position}</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {app.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {app.email}
                                </span>
                              )}
                              {app.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {app.phone}
                                </span>
                              )}
                              {app.city && app.state && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {app.city}, {app.state}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(app.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="default" size="sm" onClick={() => generateApplicationPDF(app)}>
                              <Download className="w-4 h-4 mr-2" />
                              Full Application
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => generateW4PDF(app)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Form W-4
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Application: {app.first_name} {app.last_name}
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[70vh] pr-4">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">Application ID:</span>
                                        <p className="text-muted-foreground text-xs font-mono">{app.id}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Submitted:</span>
                                        <p className="text-muted-foreground">
                                          {format(new Date(app.created_at), "MMMM d, yyyy 'at' h:mm a")}
                                        </p>
                                      </div>
                                    </div>
                                    {getAvailability(app) && (
                                      <AvailabilityTable availability={getAvailability(app)!} title="Weekly Availability" />
                                    )}
                                    <div className="border rounded-lg overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                          <tr>
                                            <th className="text-left p-3 font-medium">Field</th>
                                            <th className="text-left p-3 font-medium">Value</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {Object.entries(app.full_form_data || {}).map(([key, value], idx) => (
                                            <tr key={key} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                                              <td className="p-3 font-medium border-t">{formatFieldName(key)}</td>
                                              <td className="p-3 border-t">
                                                {typeof value === "object" ? (
                                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(value, null, 2)}
                                                  </pre>
                                                ) : (
                                                  renderValue(value)
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        {(app.full_form_data?.bankName || app.full_form_data?.accountNumber || app.full_form_data?.routingNumber) && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center gap-2 text-sm font-medium mb-2">
                              <CreditCard className="w-4 h-4 text-primary" />
                              Direct Deposit Information
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm bg-muted/30 p-3 rounded-lg">
                              {app.full_form_data?.bankName && (
                                <div>
                                  <span className="text-muted-foreground block text-xs">Bank Name</span>
                                  <span className="font-medium">{String(app.full_form_data.bankName)}</span>
                                </div>
                              )}
                              {app.full_form_data?.routingNumber && (
                                <div>
                                  <span className="text-muted-foreground block text-xs">Routing Number</span>
                                  <span className="font-mono font-medium">{String(app.full_form_data.routingNumber)}</span>
                                </div>
                              )}
                              {app.full_form_data?.accountNumber && (
                                <div>
                                  <span className="text-muted-foreground block text-xs">Account Number</span>
                                  <span className="font-mono font-medium">{String(app.full_form_data.accountNumber)}</span>
                                </div>
                              )}
                              {app.full_form_data?.accountType && (
                                <div>
                                  <span className="text-muted-foreground block text-xs">Account Type</span>
                                  <span className="font-medium capitalize">{String(app.full_form_data.accountType)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {getAvailability(app) && (
                          <div className="pt-2 border-t">
                            <AvailabilityTable availability={getAvailability(app)!} title="Weekly Availability" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Employment Applications Tab */}
          <TabsContent value="employment">
            {employmentApplications.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No employment applications submitted yet.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {employmentApplications.map((app) => (
                  <Card key={app.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-semibold text-lg">
                                {app.first_name} {app.middle_name || ""} {app.last_name}
                              </span>
                              {app.job_applied_for && (
                                <Badge variant="secondary">
                                  <Briefcase className="w-3 h-3 mr-1" />
                                  {app.job_applied_for}
                                </Badge>
                              )}
                              {app.employment_type && (
                                <Badge variant="outline" className="capitalize">{app.employment_type}</Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {app.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {app.email}
                                </span>
                              )}
                              {app.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {app.phone}
                                </span>
                              )}
                              {app.city && app.state && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {app.city}, {app.state}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(app.created_at), "MMM d, yyyy 'at' h:mm a")}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {app.level2_license && <Badge className="bg-blue-600"><Shield className="w-3 h-3 mr-1" />Level 2</Badge>}
                              {app.level3_license && <Badge className="bg-green-600"><Shield className="w-3 h-3 mr-1" />Level 3</Badge>}
                              {app.level4_license && <Badge className="bg-purple-600"><Shield className="w-3 h-3 mr-1" />Level 4</Badge>}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="default" size="sm" onClick={() => handleDownloadEmploymentPDF(app)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </Button>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[90vh]">
                                <DialogHeader>
                                  <DialogTitle>
                                    Employment Application: {app.first_name} {app.last_name}
                                  </DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="max-h-[70vh] pr-4">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">Application ID:</span>
                                        <p className="text-muted-foreground text-xs font-mono">{app.id}</p>
                                      </div>
                                      <div>
                                        <span className="font-medium">Submitted:</span>
                                        <p className="text-muted-foreground">
                                          {format(new Date(app.created_at), "MMMM d, yyyy 'at' h:mm a")}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="border rounded-lg overflow-hidden">
                                      <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                          <tr>
                                            <th className="text-left p-3 font-medium">Field</th>
                                            <th className="text-left p-3 font-medium">Value</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {Object.entries(app.full_form_data || {}).map(([key, value], idx) => (
                                            <tr key={key} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                                              <td className="p-3 font-medium border-t">{formatFieldName(key)}</td>
                                              <td className="p-3 border-t">
                                                {typeof value === "object" ? (
                                                  <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                                    {JSON.stringify(value, null, 2)}
                                                  </pre>
                                                ) : (
                                                  renderValue(value)
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </ScrollArea>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Calls Tab */}
          <TabsContent value="calls">
            {/* Date Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-sm font-medium text-muted-foreground mr-1">Filter:</span>
              {(["all", "today", "week"] as CallFilter[]).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={callFilter === f ? "default" : "outline"}
                  onClick={() => { setCallFilter(f); setCustomDate(""); }}
                >
                  {f === "all" ? "All" : f === "today" ? "Today" : "This Week"}
                </Button>
              ))}
              <Input
                type="date"
                className="w-auto h-8 text-sm"
                value={customDate}
                onChange={(e) => { setCustomDate(e.target.value); setCallFilter("custom"); }}
                placeholder="Pick a date"
              />
              <span className="text-sm text-muted-foreground ml-2">
                Showing {filteredCalls.length} of {retellCalls.length} calls
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                disabled={refreshing}
                className="ml-auto gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>
            </div>

            {filteredCalls.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {retellCalls.length === 0
                    ? "No calls recorded yet. Configure your Retell webhook to start receiving call data."
                    : "No calls match the selected filter."}
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredCalls.map((call) => {
                  const analysis = call.call_analysis || {};
                  const matchedApp = findMatchingApplication(call);
                  const formatDuration = (ms?: number) => {
                    if (!ms) return "N/A";
                    const totalSec = Math.round(ms / 1000);
                    const min = Math.floor(totalSec / 60);
                    const sec = totalSec % 60;
                    return min > 0 ? `${min}m ${sec}s` : `${sec}s`;
                  };

                  return (
                    <Card key={call.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <PhoneCall className="w-4 h-4 text-muted-foreground" />
                                <span className="font-semibold text-lg">
                                  {call.caller_number || "Unknown Caller"}
                                </span>
                                {call.call_status && (
                                  <Badge variant={call.call_status === "ended" || call.call_status === "registered" ? "secondary" : "default"}>
                                    {call.call_status.replace(/_/g, " ")}
                                  </Badge>
                                )}
                                {call.direction && (
                                  <Badge variant="outline" className="capitalize">{call.direction}</Badge>
                                )}
                                {call.call_type && (
                                  <Badge variant="outline">{call.call_type.replace(/_/g, " ")}</Badge>
                                )}
                                {(call.sentiment || (analysis as Record<string, unknown>).user_sentiment) && (
                                  <Badge variant={
                                    (call.sentiment || String((analysis as Record<string, unknown>).user_sentiment)).toLowerCase() === "positive" ? "default" :
                                    (call.sentiment || String((analysis as Record<string, unknown>).user_sentiment)).toLowerCase() === "negative" ? "destructive" : "secondary"
                                  }>
                                    {call.sentiment || String((analysis as Record<string, unknown>).user_sentiment)}
                                  </Badge>
                                )}
                                {(analysis as Record<string, unknown>).call_successful !== undefined && (
                                  <Badge variant={(analysis as Record<string, unknown>).call_successful ? "default" : "destructive"}>
                                    {(analysis as Record<string, unknown>).call_successful ? "Successful" : "Unsuccessful"}
                                  </Badge>
                                )}
                                {(analysis as Record<string, unknown>).in_voicemail && (
                                  <Badge variant="outline">Voicemail</Badge>
                                )}
                                {matchedApp && (
                                  <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                                    <Briefcase className="w-3 h-3 mr-1" />
                                    Applied
                                  </Badge>
                                )}
                              </div>
                              {matchedApp && (
                                <div className="text-sm bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-2 rounded-lg flex items-center gap-2">
                                  <Briefcase className="w-4 h-4 text-green-600" />
                                  <span>
                                    <span className="font-medium">{matchedApp.first_name} {matchedApp.last_name}</span> submitted an employment application
                                    {matchedApp.job_applied_for && <> for <span className="font-medium">{matchedApp.job_applied_for}</span></>}
                                    {" "}on {format(new Date(matchedApp.created_at), "MMM d, yyyy")}
                                  </span>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm" className="ml-auto shrink-0">
                                        <Eye className="w-3 h-3 mr-1" /> View Application
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-3xl max-h-[90vh]">
                                      <DialogHeader>
                                        <DialogTitle>
                                          Employment Application: {matchedApp.first_name} {matchedApp.last_name}
                                        </DialogTitle>
                                      </DialogHeader>
                                      <ScrollArea className="max-h-[70vh] pr-4">
                                        <div className="space-y-4">
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <span className="font-medium">Submitted:</span>
                                              <p className="text-muted-foreground">
                                                {format(new Date(matchedApp.created_at), "MMMM d, yyyy 'at' h:mm a")}
                                              </p>
                                            </div>
                                            <div>
                                              <span className="font-medium">Position:</span>
                                              <p className="text-muted-foreground">{matchedApp.job_applied_for || "N/A"}</p>
                                            </div>
                                          </div>
                                          <div className="border rounded-lg overflow-hidden">
                                            <table className="w-full text-sm">
                                              <thead className="bg-muted">
                                                <tr>
                                                  <th className="text-left p-3 font-medium">Field</th>
                                                  <th className="text-left p-3 font-medium">Value</th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {Object.entries(matchedApp.full_form_data || {}).map(([key, value], idx) => (
                                                  <tr key={key} className={idx % 2 === 0 ? "bg-background" : "bg-muted/30"}>
                                                    <td className="p-3 font-medium border-t">{formatFieldName(key)}</td>
                                                    <td className="p-3 border-t">
                                                      {typeof value === "object" ? (
                                                        <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                                          {JSON.stringify(value, null, 2)}
                                                        </pre>
                                                      ) : (
                                                        renderValue(value)
                                                      )}
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      </ScrollArea>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              )}
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {call.callee_number && (
                                  <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> To: {call.callee_number}
                                  </span>
                                )}
                                {call.agent_name && (
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" /> Agent: {call.agent_name}
                                  </span>
                                )}
                                {call.duration_ms && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {formatDuration(call.duration_ms)}
                                  </span>
                                )}
                                {call.disconnection_reason && (
                                  <span className="flex items-center gap-1">
                                    Ended: {call.disconnection_reason.replace(/_/g, " ")}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(call.start_time || call.created_at), "MMM d, yyyy 'at' h:mm a")}
                                </span>
                              </div>
                              {(call.summary || (analysis as Record<string, unknown>).call_summary) && (
                                <div className="mt-2 text-sm bg-muted/30 p-3 rounded-lg">
                                  <span className="font-medium flex items-center gap-1 mb-1">
                                    <MessageSquare className="w-3 h-3" /> Summary
                                  </span>
                                  <p className="text-muted-foreground">{call.summary || String((analysis as Record<string, unknown>).call_summary)}</p>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {call.recording_url && (
                                <Button variant="secondary" size="sm" asChild>
                                  <a href={call.recording_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="w-4 h-4 mr-2" />
                                    Recording
                                  </a>
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh]">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Call: {call.caller_number || "Unknown"} → {call.callee_number || "Unknown"}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <ScrollArea className="max-h-[70vh] pr-4">
                                    <div className="space-y-6">
                                      {/* Basic Info */}
                                      <div>
                                        <h3 className="font-semibold mb-3">Call Information</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                          <div>
                                            <span className="font-medium text-muted-foreground">Call ID</span>
                                            <p className="text-xs font-mono mt-1">{call.call_id || call.id}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">Status</span>
                                            <p className="capitalize mt-1">{call.call_status?.replace(/_/g, " ") || "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">Type</span>
                                            <p className="mt-1">{call.call_type?.replace(/_/g, " ") || "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">Direction</span>
                                            <p className="capitalize mt-1">{call.direction || "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">Duration</span>
                                            <p className="mt-1">{formatDuration(call.duration_ms)}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">Disconnection</span>
                                            <p className="mt-1">{call.disconnection_reason?.replace(/_/g, " ") || "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">From</span>
                                            <p className="mt-1">{call.caller_number || "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">To</span>
                                            <p className="mt-1">{call.callee_number || "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">Start</span>
                                            <p className="mt-1">{call.start_time ? format(new Date(call.start_time), "MMM d, yyyy h:mm:ss a") : "N/A"}</p>
                                          </div>
                                          <div>
                                            <span className="font-medium text-muted-foreground">End</span>
                                            <p className="mt-1">{call.end_time ? format(new Date(call.end_time), "MMM d, yyyy h:mm:ss a") : "N/A"}</p>
                                          </div>
                                          {call.transfer_destination && (
                                            <div>
                                              <span className="font-medium text-muted-foreground">Transferred To</span>
                                              <p className="mt-1">{call.transfer_destination}</p>
                                            </div>
                                          )}
                                          {call.event_type && (
                                            <div>
                                              <span className="font-medium text-muted-foreground">Last Event</span>
                                              <p className="mt-1">{call.event_type.replace(/_/g, " ")}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Agent Info */}
                                      {(call.agent_name || call.retell_agent_id) && (
                                        <div>
                                          <h3 className="font-semibold mb-3">Agent</h3>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            {call.agent_name && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Name</span>
                                                <p className="mt-1">{call.agent_name}</p>
                                              </div>
                                            )}
                                            {call.retell_agent_id && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Agent ID</span>
                                                <p className="text-xs font-mono mt-1">{call.retell_agent_id}</p>
                                              </div>
                                            )}
                                            {call.agent_version !== undefined && call.agent_version !== null && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Version</span>
                                                <p className="mt-1">v{call.agent_version}</p>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Call Analysis */}
                                      {Object.keys(analysis).length > 0 && (
                                        <div>
                                          <h3 className="font-semibold mb-3">Call Analysis</h3>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            {(analysis as Record<string, unknown>).call_summary && (
                                              <div className="col-span-full">
                                                <span className="font-medium text-muted-foreground">Summary</span>
                                                <p className="mt-1 bg-muted/30 p-3 rounded-lg">{String((analysis as Record<string, unknown>).call_summary)}</p>
                                              </div>
                                            )}
                                            {(analysis as Record<string, unknown>).user_sentiment && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Sentiment</span>
                                                <p className="mt-1">{String((analysis as Record<string, unknown>).user_sentiment)}</p>
                                              </div>
                                            )}
                                            {(analysis as Record<string, unknown>).call_successful !== undefined && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Successful</span>
                                                <p className="mt-1">{(analysis as Record<string, unknown>).call_successful ? "Yes" : "No"}</p>
                                              </div>
                                            )}
                                            {(analysis as Record<string, unknown>).in_voicemail !== undefined && (
                                              <div>
                                                <span className="font-medium text-muted-foreground">Voicemail</span>
                                                <p className="mt-1">{(analysis as Record<string, unknown>).in_voicemail ? "Yes" : "No"}</p>
                                              </div>
                                            )}
                                            {(analysis as Record<string, unknown>).custom_analysis_data && Object.keys((analysis as Record<string, unknown>).custom_analysis_data as object).length > 0 && (
                                              <div className="col-span-full">
                                                <span className="font-medium text-muted-foreground">Custom Analysis</span>
                                                <pre className="mt-1 text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                                  {JSON.stringify((analysis as Record<string, unknown>).custom_analysis_data, null, 2)}
                                                </pre>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Summary (fallback if not in analysis) */}
                                      {call.summary && !((analysis as Record<string, unknown>).call_summary) && (
                                        <div>
                                          <h3 className="font-semibold mb-2">Summary</h3>
                                          <p className="text-sm bg-muted/30 p-3 rounded-lg">{call.summary}</p>
                                        </div>
                                      )}

                                      {/* Transcript */}
                                      {call.transcript && (
                                        <div>
                                          <h3 className="font-semibold mb-2">Transcript</h3>
                                          <pre className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap max-h-96 overflow-y-auto">
                                            {call.transcript}
                                          </pre>
                                        </div>
                                      )}


                                      {/* Dynamic Variables */}
                                      {call.retell_llm_dynamic_variables && Object.keys(call.retell_llm_dynamic_variables).length > 0 && (
                                        <div>
                                          <h3 className="font-semibold mb-2">Dynamic Variables (Input)</h3>
                                          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                            {JSON.stringify(call.retell_llm_dynamic_variables, null, 2)}
                                          </pre>
                                        </div>
                                      )}

                                      {call.collected_dynamic_variables && Object.keys(call.collected_dynamic_variables).length > 0 && (
                                        <div>
                                          <h3 className="font-semibold mb-2">Collected Variables (Output)</h3>
                                          <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto">
                                            {JSON.stringify(call.collected_dynamic_variables, null, 2)}
                                          </pre>
                                        </div>
                                      )}

                                      {/* Latency */}
                                      {call.latency && Object.keys(call.latency).length > 0 && (
                                        <div>
                                          <h3 className="font-semibold mb-3">Latency (ms)</h3>
                                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                            {Object.entries(call.latency).map(([key, val]) => {
                                              const latencyVal = val as Record<string, unknown> | null;
                                              if (!latencyVal || typeof latencyVal !== "object") return null;
                                              return (
                                                <div key={key} className="bg-muted/30 p-2 rounded">
                                                  <span className="font-medium text-muted-foreground text-xs uppercase">{key.replace(/_/g, " ")}</span>
                                                  <p className="mt-1">p50: {String(latencyVal.p50 ?? "–")} | p90: {String(latencyVal.p90 ?? "–")} | p99: {String(latencyVal.p99 ?? "–")}</p>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}

                                      {/* Links */}
                                      {(call.recording_url || call.recording_multi_channel_url || call.public_log_url) && (
                                        <div>
                                          <h3 className="font-semibold mb-3">Links</h3>
                                          <div className="flex flex-wrap gap-2">
                                            {call.recording_url && (
                                              <Button variant="outline" size="sm" asChild>
                                                <a href={call.recording_url} target="_blank" rel="noopener noreferrer">Recording</a>
                                              </Button>
                                            )}
                                            {call.recording_multi_channel_url && (
                                              <Button variant="outline" size="sm" asChild>
                                                <a href={call.recording_multi_channel_url} target="_blank" rel="noopener noreferrer">Multi-Channel Recording</a>
                                              </Button>
                                            )}
                                            {call.public_log_url && (
                                              <Button variant="outline" size="sm" asChild>
                                                <a href={call.public_log_url} target="_blank" rel="noopener noreferrer">Public Log</a>
                                              </Button>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </ScrollArea>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
