import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateEmploymentApplicationPDF } from "@/lib/generateEmploymentApplicationPDF";
import { Phone, Mail } from "lucide-react";
import kairosLogo from "@/assets/kairos-logo.png";

const employerSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  cityStateZip: z.string().optional(),
  supervisor: z.string().optional(),
  telephone: z.string().optional(),
  jobTitle: z.string().optional(),
  datesFrom: z.string().optional(),
  datesTo: z.string().optional(),
  payStart: z.string().optional(),
  payFinal: z.string().optional(),
  reasonForLeaving: z.string().optional(),
});

const referenceSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});

const formSchema = z.object({
  // Licenses
  level2License: z.boolean().default(false),
  level3License: z.boolean().default(false),
  level4License: z.boolean().default(false),
  emailAddress: z.string().email("Please enter a valid email").optional().or(z.literal("")),

  // Job Info
  jobAppliedFor: z.string().optional(),
  todaysDate: z.string().optional(),
  employmentType: z.enum(["full-time", "part-time", "temporary"]).optional(),
  startDate: z.string().optional(),

  // Personal
  lastName: z.string().min(1, "Last name is required"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),

  // Yes/No
  is18OrOlder: z.enum(["yes", "no"]).optional(),
  ssn: z.string().optional(),
  eligibleToWork: z.enum(["yes", "no"]).optional(),
  appliedBefore: z.enum(["yes", "no"]).optional(),
  appliedBeforeWhen: z.string().optional(),
  employedHereBefore: z.enum(["yes", "no"]).optional(),
  employedHereWhen: z.string().optional(),
  convicted: z.enum(["yes", "no"]).optional(),
  convictionDetails: z.string().optional(),
  outsideEmployment: z.enum(["yes", "no"]).optional(),
  outsideEmploymentDetails: z.string().optional(),

  // Driving
  hasDriversLicense: z.enum(["yes", "no"]).optional(),
  driversLicenseNumber: z.string().optional(),
  licenseClass: z.string().optional(),
  stateLicensedIn: z.string().optional(),
  licenseSuspended: z.enum(["yes", "no"]).optional(),
  licenseSuspendedDetails: z.string().optional(),

  // Activities & Skills
  professionalActivities: z.string().optional(),
  
  // Education
  highSchool: z.string().optional(),
  highSchoolYears: z.string().optional(),
  highSchoolDiploma: z.string().optional(),
  highSchoolSubjects: z.string().optional(),
  college: z.string().optional(),
  collegeYears: z.string().optional(),
  collegeDiploma: z.string().optional(),
  collegeSubjects: z.string().optional(),
  vocational: z.string().optional(),
  vocationalYears: z.string().optional(),
  vocationalDiploma: z.string().optional(),
  vocationalSubjects: z.string().optional(),
  
  skillsTraining: z.string().optional(),
  machinesEquipment: z.string().optional(),

  // Employment History
  employer1: employerSchema.optional(),
  employer2: employerSchema.optional(),
  employer3: employerSchema.optional(),
  employer4: employerSchema.optional(),

  // Additional
  otherNamesUsed: z.enum(["yes", "no"]).optional(),
  otherNames: z.string().optional(),
  presentlyEmployed: z.enum(["yes", "no"]).optional(),
  contactSuggestion: z.string().optional(),
  everFired: z.enum(["yes", "no"]).optional(),
  firedDetails: z.string().optional(),

  // References
  reference1: referenceSchema.optional(),
  reference2: referenceSchema.optional(),
  reference3: referenceSchema.optional(),

  // Certification
  certificationAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the certification"),
});

type FormData = z.infer<typeof formSchema>;

const YesNoField = ({ label, name, register, watch, subNote }: { label: string; name: string; register: any; watch: any; subNote?: string }) => {
  const value = watch(name);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-4">
        <Label className="text-sm flex-1">{label}</Label>
        <RadioGroup value={value} onValueChange={(v) => register(name).onChange({ target: { name, value: v } })} className="flex gap-4">
          <div className="flex items-center gap-1">
            <RadioGroupItem value="yes" id={`${name}-yes`} />
            <Label htmlFor={`${name}-yes`} className="text-sm">Yes</Label>
          </div>
          <div className="flex items-center gap-1">
            <RadioGroupItem value="no" id={`${name}-no`} />
            <Label htmlFor={`${name}-no`} className="text-sm">No</Label>
          </div>
        </RadioGroup>
      </div>
      {subNote && <p className="text-xs text-muted-foreground">{subNote}</p>}
    </div>
  );
};

const EmploymentApplication = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      level2License: false,
      level3License: false,
      level4License: false,
      certificationAcknowledged: false,
      todaysDate: new Date().toISOString().split("T")[0],
      employer1: {}, employer2: {}, employer3: {}, employer4: {},
      reference1: {}, reference2: {}, reference3: {},
    },
  });

  const handleYesNoChange = (name: string, value: string) => {
    setValue(name as any, value as any);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const id = crypto.randomUUID();
      
      const { error } = await supabase.from("employment_applications").insert({
        id,
        first_name: data.firstName,
        last_name: data.lastName,
        middle_name: data.middleName || null,
        email: data.emailAddress || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zipCode || null,
        ssn: data.ssn || null,
        job_applied_for: data.jobAppliedFor || null,
        todays_date: data.todaysDate || null,
        employment_type: data.employmentType || null,
        start_date: data.startDate || null,
        level2_license: data.level2License,
        level3_license: data.level3License,
        level4_license: data.level4License,
        is_18_or_older: data.is18OrOlder === "yes",
        eligible_to_work: data.eligibleToWork === "yes",
        applied_before: data.appliedBefore === "yes",
        applied_before_when: data.appliedBeforeWhen || null,
        employed_here_before: data.employedHereBefore === "yes",
        employed_here_when: data.employedHereWhen || null,
        convicted: data.convicted === "yes",
        conviction_details: data.convictionDetails || null,
        outside_employment: data.outsideEmployment === "yes",
        outside_employment_details: data.outsideEmploymentDetails || null,
        has_drivers_license: data.hasDriversLicense === "yes",
        drivers_license_number: data.driversLicenseNumber || null,
        license_class: data.licenseClass || null,
        state_licensed_in: data.stateLicensedIn || null,
        license_suspended: data.licenseSuspended === "yes",
        license_suspended_details: data.licenseSuspendedDetails || null,
        professional_activities: data.professionalActivities || null,
        skills_training: data.skillsTraining || null,
        machines_equipment: data.machinesEquipment || null,
        education: {
          highSchool: { name: data.highSchool, years: data.highSchoolYears, diploma: data.highSchoolDiploma, subjects: data.highSchoolSubjects },
          college: { name: data.college, years: data.collegeYears, diploma: data.collegeDiploma, subjects: data.collegeSubjects },
          vocational: { name: data.vocational, years: data.vocationalYears, diploma: data.vocationalDiploma, subjects: data.vocationalSubjects },
        } as any,
        employment_history: [data.employer1, data.employer2, data.employer3, data.employer4].filter(e => e?.name) as any,
        other_names_used: data.otherNamesUsed === "yes",
        other_names: data.otherNames || null,
        presently_employed: data.presentlyEmployed === "yes",
        contact_suggestion: data.contactSuggestion || null,
        ever_fired: data.everFired === "yes",
        fired_details: data.firedDetails || null,
        personal_references: [data.reference1, data.reference2, data.reference3].filter(r => r?.name) as any,
        certification_acknowledged: data.certificationAcknowledged,
        signature_date: data.todaysDate || null,
        full_form_data: data as any,
      });

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke("send-employment-app-email", {
          body: {
            id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.emailAddress,
            phone: data.phone,
            jobAppliedFor: data.jobAppliedFor,
            fullFormData: data,
          },
        });
      } catch (emailErr) {
        console.error("Email notification failed:", emailErr);
      }

      setIsSubmitted(true);
      toast({ title: "Application Submitted", description: "Your employment application has been submitted successfully." });
    } catch (err) {
      console.error("Submission error:", err);
      toast({ title: "Submission Failed", description: "There was an error submitting your application. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Application Submitted!</h2>
            <p className="text-muted-foreground">Thank you for your application. We will review it and contact you if your qualifications match our requirements.</p>
            <Button onClick={() => window.location.href = "/onboarding-packet"}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const EmployerBlock = ({ index }: { index: 1 | 2 | 3 | 4 }) => {
    const prefix = `employer${index}` as const;
    return (
      <div className="border border-border rounded p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Name of Employer</Label>
            <Input {...register(`${prefix}.name`)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Job Title and Duties</Label>
            <Input {...register(`${prefix}.jobTitle`)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Address</Label>
            <Input {...register(`${prefix}.address`)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">From (Mo/Yr)</Label>
              <Input {...register(`${prefix}.datesFrom`)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">To (Mo/Yr)</Label>
              <Input {...register(`${prefix}.datesTo`)} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">City, State, Zip</Label>
            <Input {...register(`${prefix}.cityStateZip`)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Pay Start $</Label>
              <Input {...register(`${prefix}.payStart`)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Pay Final $</Label>
              <Input {...register(`${prefix}.payFinal`)} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Supervisor(s)</Label>
            <Input {...register(`${prefix}.supervisor`)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Telephone</Label>
            <Input {...register(`${prefix}.telephone`)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold uppercase text-muted-foreground">Reason for Leaving</Label>
            <Input {...register(`${prefix}.reasonForLeaving`)} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <a href="/">
              <img src={kairosLogo} alt="Kairos Security" className="h-14 md:h-16 object-contain" />
            </a>
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              <a href="tel:1-888-524-7678" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium">
                <Phone className="w-4 h-4 text-primary" />1-888-524-7678
              </a>
              <a href="mailto:info@kairossecurity.com" className="flex items-center gap-2 text-foreground hover:text-primary transition-colors font-medium">
                <Mail className="w-4 h-4 text-primary" />info@kairossecurity.com
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-foreground text-background py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">APPLICATION FOR EMPLOYMENT</h1>
          <p className="text-background/70 text-sm">An Equal Opportunity Employer</p>
        </div>
      </section>

      {/* Form */}
      <section className="py-6 md:py-10 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* EEO Notice */}
            <Card>
              <CardContent className="p-4 md:p-6">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We do not discriminate on the basis of race, color, religion, national origin, sex, age, disability, or any other status protected by law or regulation. It is our intention that all qualified applicants be given equal opportunity and that selection decisions be based on job-related factors.
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                  Answer each question fully and accurately. No action can be taken on this application until you have answered all questions.
                </p>
              </CardContent>
            </Card>

            {/* Licenses & Email */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Licenses & Contact</h2>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={watch("level2License")} onCheckedChange={(c) => setValue("level2License", !!c)} id="l2" />
                    <Label htmlFor="l2" className="text-sm">Level 2 License</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={watch("level3License")} onCheckedChange={(c) => setValue("level3License", !!c)} id="l3" />
                    <Label htmlFor="l3" className="text-sm">Level 3 License</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={watch("level4License")} onCheckedChange={(c) => setValue("level4License", !!c)} id="l4" />
                    <Label htmlFor="l4" className="text-sm">Level 4 License</Label>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Email Address</Label>
                    <Input {...register("emailAddress")} type="email" />
                    {errors.emailAddress && <p className="text-xs text-destructive">{errors.emailAddress.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Info */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Job Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Job Applied For</Label>
                    <Input {...register("jobAppliedFor")} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Today's Date</Label>
                    <Input {...register("todaysDate")} type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Are you seeking:</Label>
                  <RadioGroup value={watch("employmentType")} onValueChange={(v) => setValue("employmentType", v as any)} className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="full-time" id="ft" />
                      <Label htmlFor="ft" className="text-sm">Full-time</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="part-time" id="pt" />
                      <Label htmlFor="pt" className="text-sm">Part-time</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="temporary" id="temp" />
                      <Label htmlFor="temp" className="text-sm">Temporary</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">When could you start work?</Label>
                    <Input {...register("startDate")} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personal Info */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm">Last Name *</Label>
                    <Input {...register("lastName")} />
                    {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">First Name *</Label>
                    <Input {...register("firstName")} />
                    {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Middle Name</Label>
                    <Input {...register("middleName")} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">Telephone Number</Label>
                    <Input {...register("phone")} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <Label className="text-sm">Present Street Address</Label>
                    <Input {...register("address")} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">City</Label>
                    <Input {...register("city")} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-sm">State</Label>
                      <Input {...register("state")} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Zip Code</Label>
                      <Input {...register("zipCode")} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eligibility Questions */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Eligibility</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="text-sm">Are you 18 years of age or older?</Label>
                      <p className="text-xs text-muted-foreground">(If you are hired, you may be required to submit proof of age.)</p>
                    </div>
                    <RadioGroup value={watch("is18OrOlder")} onValueChange={(v) => setValue("is18OrOlder", v as any)} className="flex gap-4">
                      <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="age-y" /><Label htmlFor="age-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center gap-1"><RadioGroupItem value="no" id="age-n" /><Label htmlFor="age-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm">Social Security #</Label>
                      <Input {...register("ssn")} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-sm">If hired, can you furnish proof you are eligible to work in the U.S.?</Label>
                    <RadioGroup value={watch("eligibleToWork")} onValueChange={(v) => setValue("eligibleToWork", v as any)} className="flex gap-4">
                      <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="elig-y" /><Label htmlFor="elig-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center gap-1"><RadioGroupItem value="no" id="elig-n" /><Label htmlFor="elig-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-sm">Have you ever applied here before?</Label>
                    <RadioGroup value={watch("appliedBefore")} onValueChange={(v) => setValue("appliedBefore", v as any)} className="flex gap-4">
                      <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="ab-y" /><Label htmlFor="ab-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center gap-1"><RadioGroupItem value="no" id="ab-n" /><Label htmlFor="ab-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>
                  {watch("appliedBefore") === "yes" && (
                    <div className="space-y-1 pl-4">
                      <Label className="text-sm">If yes, when?</Label>
                      <Input {...register("appliedBeforeWhen")} />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <Label className="text-sm">Were you ever employed here?</Label>
                    <RadioGroup value={watch("employedHereBefore")} onValueChange={(v) => setValue("employedHereBefore", v as any)} className="flex gap-4">
                      <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="eh-y" /><Label htmlFor="eh-y" className="text-sm">Yes</Label></div>
                      <div className="flex items-center gap-1"><RadioGroupItem value="no" id="eh-n" /><Label htmlFor="eh-n" className="text-sm">No</Label></div>
                    </RadioGroup>
                  </div>
                  {watch("employedHereBefore") === "yes" && (
                    <div className="space-y-1 pl-4">
                      <Label className="text-sm">If yes, when?</Label>
                      <Input {...register("employedHereWhen")} />
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-sm">Have you ever been convicted of any law violation? (Include any plea of "guilty" or "no contest." Exclude minor traffic violations.)</Label>
                      <RadioGroup value={watch("convicted")} onValueChange={(v) => setValue("convicted", v as any)} className="flex gap-4">
                        <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="conv-y" /><Label htmlFor="conv-y" className="text-sm">Yes</Label></div>
                        <div className="flex items-center gap-1"><RadioGroupItem value="no" id="conv-n" /><Label htmlFor="conv-n" className="text-sm">No</Label></div>
                      </RadioGroup>
                    </div>
                    {watch("convicted") === "yes" && (
                      <div className="space-y-1 pl-4">
                        <Label className="text-sm">If yes, give details</Label>
                        <Input {...register("convictionDetails")} />
                        <p className="text-xs text-muted-foreground">(A conviction will not necessarily disqualify an applicant for employment.)</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                      <Label className="text-sm">If employed, do you expect to be engaged in any additional business or employment outside of our job?</Label>
                      <RadioGroup value={watch("outsideEmployment")} onValueChange={(v) => setValue("outsideEmployment", v as any)} className="flex gap-4">
                        <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="oe-y" /><Label htmlFor="oe-y" className="text-sm">Yes</Label></div>
                        <div className="flex items-center gap-1"><RadioGroupItem value="no" id="oe-n" /><Label htmlFor="oe-n" className="text-sm">No</Label></div>
                      </RadioGroup>
                    </div>
                    {watch("outsideEmployment") === "yes" && (
                      <div className="space-y-1 pl-4">
                        <Label className="text-sm">If yes, give details</Label>
                        <Input {...register("outsideEmploymentDetails")} />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driving */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">For Driving Jobs Only</h2>
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Do you have a valid driver's license?</Label>
                  <RadioGroup value={watch("hasDriversLicense")} onValueChange={(v) => setValue("hasDriversLicense", v as any)} className="flex gap-4">
                    <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="dl-y" /><Label htmlFor="dl-y" className="text-sm">Yes</Label></div>
                    <div className="flex items-center gap-1"><RadioGroupItem value="no" id="dl-n" /><Label htmlFor="dl-n" className="text-sm">No</Label></div>
                  </RadioGroup>
                </div>
                {watch("hasDriversLicense") === "yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm">Driver's License Number</Label>
                      <Input {...register("driversLicenseNumber")} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Class of License</Label>
                      <Input {...register("licenseClass")} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">State Licensed In</Label>
                      <Input {...register("stateLicensedIn")} />
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Have you had your driver's license suspended or revoked in the last 3 years?</Label>
                  <RadioGroup value={watch("licenseSuspended")} onValueChange={(v) => setValue("licenseSuspended", v as any)} className="flex gap-4">
                    <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="ls-y" /><Label htmlFor="ls-y" className="text-sm">Yes</Label></div>
                    <div className="flex items-center gap-1"><RadioGroupItem value="no" id="ls-n" /><Label htmlFor="ls-n" className="text-sm">No</Label></div>
                  </RadioGroup>
                </div>
                {watch("licenseSuspended") === "yes" && (
                  <div className="space-y-1 pl-4">
                    <Label className="text-sm">If yes, give details</Label>
                    <Input {...register("licenseSuspendedDetails")} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activities */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Professional Activities</h2>
                <p className="text-xs text-muted-foreground">List professional, trade, business or civic activities and offices held. (Exclude labor organizations and memberships which reveal race, color, religion, national origin, sex, age, disability or other protected status.)</p>
                <Textarea {...register("professionalActivities")} rows={3} />
              </CardContent>
            </Card>

            {/* Education */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Education</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">School</th>
                        <th className="text-left p-2 font-medium">Name & Address</th>
                        <th className="text-left p-2 font-medium">Years Completed</th>
                        <th className="text-left p-2 font-medium">Diploma/Degree</th>
                        <th className="text-left p-2 font-medium">Subjects Studied</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 text-muted-foreground">High School or GED</td>
                        <td className="p-2"><Input {...register("highSchool")} className="h-8" /></td>
                        <td className="p-2"><Input {...register("highSchoolYears")} className="h-8" /></td>
                        <td className="p-2"><Input {...register("highSchoolDiploma")} className="h-8" /></td>
                        <td className="p-2"><Input {...register("highSchoolSubjects")} className="h-8" /></td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-2 text-muted-foreground">College or University</td>
                        <td className="p-2"><Input {...register("college")} className="h-8" /></td>
                        <td className="p-2"><Input {...register("collegeYears")} className="h-8" /></td>
                        <td className="p-2"><Input {...register("collegeDiploma")} className="h-8" /></td>
                        <td className="p-2"><Input {...register("collegeSubjects")} className="h-8" /></td>
                      </tr>
                      <tr>
                        <td className="p-2 text-muted-foreground">Vocational or Technical</td>
                        <td className="p-2"><Input {...register("vocational")} className="h-8" /></td>
                        <td className="p-2"><Input {...register("vocationalYears")} className="h-8" /></td>
                        <td className="p-2"><Input {...register("vocationalDiploma")} className="h-8" /></td>
                        <td className="p-2"><Input {...register("vocationalSubjects")} className="h-8" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-sm">What skills or additional training do you have that relate to the job for which you are applying?</Label>
                    <Textarea {...register("skillsTraining")} rows={2} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm">What machines or equipment can you operate that relate to the job for which you are applying?</Label>
                    <Textarea {...register("machinesEquipment")} rows={2} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Employment History */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Employment History</h2>
                <p className="text-xs text-muted-foreground">List names of employers in consecutive order with present or last employer listed first. Account for all periods of time including military service and any periods of unemployment.</p>
                <p className="text-xs text-muted-foreground font-medium">Note: A job offer may be contingent upon acceptable references from current and former employers.</p>
                <div className="space-y-4">
                  <EmployerBlock index={1} />
                  <EmployerBlock index={2} />
                  <EmployerBlock index={3} />
                  <EmployerBlock index={4} />
                </div>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Additional Information</h2>

                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Have you worked or attended school under any other names?</Label>
                  <RadioGroup value={watch("otherNamesUsed")} onValueChange={(v) => setValue("otherNamesUsed", v as any)} className="flex gap-4">
                    <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="on-y" /><Label htmlFor="on-y" className="text-sm">Yes</Label></div>
                    <div className="flex items-center gap-1"><RadioGroupItem value="no" id="on-n" /><Label htmlFor="on-n" className="text-sm">No</Label></div>
                  </RadioGroup>
                </div>
                {watch("otherNamesUsed") === "yes" && (
                  <div className="space-y-1 pl-4">
                    <Label className="text-sm">If yes, give names</Label>
                    <Input {...register("otherNames")} />
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Are you presently employed?</Label>
                  <RadioGroup value={watch("presentlyEmployed")} onValueChange={(v) => setValue("presentlyEmployed", v as any)} className="flex gap-4">
                    <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="pe-y" /><Label htmlFor="pe-y" className="text-sm">Yes</Label></div>
                    <div className="flex items-center gap-1"><RadioGroupItem value="no" id="pe-n" /><Label htmlFor="pe-n" className="text-sm">No</Label></div>
                  </RadioGroup>
                </div>
                {watch("presentlyEmployed") === "yes" && (
                  <div className="space-y-1 pl-4">
                    <Label className="text-sm">If yes, whom do you suggest we contact?</Label>
                    <Input {...register("contactSuggestion")} />
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm">Have you ever been fired from a job or asked to resign?</Label>
                  <RadioGroup value={watch("everFired")} onValueChange={(v) => setValue("everFired", v as any)} className="flex gap-4">
                    <div className="flex items-center gap-1"><RadioGroupItem value="yes" id="ef-y" /><Label htmlFor="ef-y" className="text-sm">Yes</Label></div>
                    <div className="flex items-center gap-1"><RadioGroupItem value="no" id="ef-n" /><Label htmlFor="ef-n" className="text-sm">No</Label></div>
                  </RadioGroup>
                </div>
                {watch("everFired") === "yes" && (
                  <div className="space-y-1 pl-4">
                    <Label className="text-sm">If yes, please explain</Label>
                    <Input {...register("firedDetails")} />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* References */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">References</h2>
                <p className="text-xs text-muted-foreground">Give three references, not relatives or former employers.</p>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-sm">Name</Label>
                      <Input {...register(`reference${i}.name` as any)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Address</Label>
                      <Input {...register(`reference${i}.address` as any)} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm">Phone</Label>
                      <Input {...register(`reference${i}.phone` as any)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Certification */}
            <Card>
              <CardContent className="p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-foreground">Certification</h2>
                <p className="text-xs font-semibold text-foreground">PLEASE READ EACH STATEMENT CAREFULLY BEFORE SIGNING</p>
                <div className="text-xs text-muted-foreground space-y-3 leading-relaxed">
                  <p>I certify that all information provided in this employment application is true and complete. I understand that any false information or omission may disqualify me from further consideration for employment and may result in my dismissal if discovered at a later date.</p>
                  <p>I authorize the investigation of any or all statements contained in this application. I also authorize, whether listed or not, any person, school, current employer, past employers and organizations to provide relevant information and opinions that may be useful in making a hiring decision. I release such persons and organizations from any legal liability in making such statements.</p>
                  <p>I understand I may be required to successfully pass a drug screening examination. I hereby consent to a pre- and/or post-employment drug screen as a condition of employment, if required.</p>
                  <p>I understand that if I am extended an offer of employment it may be conditioned upon my successfully passing a complete pre-employment physical examination. I consent to the release of any or all medical information as may be deemed necessary to judge my capability to do the work for which I am applying.</p>
                  <p className="font-semibold text-foreground uppercase text-[10px]">I UNDERSTAND THAT THIS APPLICATION, VERBAL STATEMENTS BY MANAGEMENT, OR SUBSEQUENT EMPLOYMENT DOES NOT CREATE AN EXPRESS OR IMPLIED CONTRACT OF EMPLOYMENT NOR GUARANTEE EMPLOYMENT FOR ANY DEFINITE PERIOD OF TIME. ONLY THE PRESIDENT OF THE ORGANIZATION HAS THE AUTHORITY TO ENTER INTO AN AGREEMENT OF EMPLOYMENT FOR ANY SPECIFIED PERIOD AND SUCH AGREEMENT MUST BE IN WRITING, SIGNED BY THE PRESIDENT AND THE EMPLOYEE. IF EMPLOYED, I UNDERSTAND THAT I HAVE BEEN HIRED AT THE WILL OF THE EMPLOYER AND MY EMPLOYMENT MAY BE TERMINATED AT ANY TIME, WITH OR WITHOUT REASON AND WITH OR WITHOUT NOTICE.</p>
                  <p>I have read, understand, and by my signature consent to these statements.</p>
                </div>
                <div className="flex items-start gap-2 pt-2">
                  <Checkbox 
                    checked={watch("certificationAcknowledged")} 
                    onCheckedChange={(c) => setValue("certificationAcknowledged", !!c)} 
                    id="cert" 
                  />
                  <Label htmlFor="cert" className="text-sm">I acknowledge and agree to the above statements (Electronic Signature)</Label>
                </div>
                {errors.certificationAcknowledged && <p className="text-xs text-destructive">{errors.certificationAcknowledged.message}</p>}
                <p className="text-xs text-muted-foreground">This application for employment will remain active for a limited time. Ask the organization's representative for details.</p>
              </CardContent>
            </Card>

            <div className="flex justify-center">
              <Button type="submit" size="lg" disabled={isSubmitting} className="px-12">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <img src={kairosLogo} alt="Kairos Security" className="h-10 object-contain brightness-0 invert" />
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              <a href="tel:1-888-524-7678" className="flex items-center gap-2 hover:text-primary transition-colors"><Phone className="w-4 h-4" />1-888-524-7678</a>
              <a href="mailto:info@kairossecurity.com" className="flex items-center gap-2 hover:text-primary transition-colors"><Mail className="w-4 h-4" />info@kairossecurity.com</a>
            </div>
          </div>
          <p className="text-center text-sm text-background/60 mt-4">© 2026 Kairos Security. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default EmploymentApplication;
