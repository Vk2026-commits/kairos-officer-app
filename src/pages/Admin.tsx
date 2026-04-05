import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Eye, Calendar, Mail, Phone, MapPin, User, Download, FileText, CreditCard, Briefcase, Shield, PhoneCall, Clock, MessageSquare } from "lucide-react";
import { format } from "date-fns";
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

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [employmentApplications, setEmploymentApplications] = useState<EmploymentApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
            Logout
          </Button>
        </div>

        <Tabs defaultValue="onboarding" className="space-y-6">
          <TabsList>
            <TabsTrigger value="onboarding">
              Onboarding Packets ({applications.length})
            </TabsTrigger>
            <TabsTrigger value="employment">
              Employment Applications ({employmentApplications.length})
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
        </Tabs>
      </div>
    </div>
  );
}
