import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  User, Phone, CreditCard, Heart, FileText, Package, Lock, 
  FileCheck, Smartphone, Clock, ChevronRight, ChevronLeft, Send, CheckCircle2,
  Shirt, Calendar, AlertTriangle, Shield, Pill, CalendarDays, Briefcase, Share2, Building2,
  ClipboardList, CalendarClock, Receipt, Loader2, Upload, X, Image
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";

const applicationSchema = z.object({
  // Section 1: I-9 Employment Eligibility (Employee Information)
  lastName: z.string().min(2, "Last name is required"),
  firstName: z.string().min(2, "First name is required"),
  middleInitial: z.string().optional(),
  otherLastNames: z.string().optional(),
  address: z.string().min(5, "Address is required"),
  aptNumber: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().min(9, "Valid SSN is required").max(11),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  citizenshipStatus: z.enum(["citizen", "noncitizen_national", "permanent_resident", "authorized_alien"]),
  uscisNumber: z.string().optional(),
  i94Number: z.string().optional(),
  foreignPassportNumber: z.string().optional(),
  countryOfIssuance: z.string().optional(),
  workAuthExpiration: z.string().optional(),
  
  // Section 2: Direct Deposit
  bankName: z.string().min(2, "Bank name is required"),
  routingNumber: z.string().min(9, "Valid routing number is required").max(9),
  accountNumber: z.string().min(4, "Account number is required"),
  accountType: z.enum(["checking", "savings"]),
  depositType: z.enum(["full", "partial"]),
  depositAmount: z.string().optional(),
  
  // Section 3: Emergency Contact
  emergencyName1: z.string().min(2, "Primary emergency contact name is required"),
  emergencyRelationship1: z.string().min(2, "Relationship is required"),
  emergencyAddress1: z.string().optional(),
  emergencyPhone1: z.string().min(10, "Phone number is required"),
  emergencyAltPhone1: z.string().optional(),
  emergencyName2: z.string().optional(),
  emergencyRelationship2: z.string().optional(),
  emergencyAddress2: z.string().optional(),
  emergencyPhone2: z.string().optional(),
  emergencyAltPhone2: z.string().optional(),
  medicalInstructions: z.string().optional(),
  doctorName: z.string().optional(),
  doctorAddress: z.string().optional(),
  doctorPhone: z.string().optional(),
  
  // Section 4: Handbook Acknowledgement
  handbookAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the handbook"),
  
  // Section 5: Company Property
  receivedBuildingKey: z.boolean().optional(),
  receivedIdBadge: z.boolean().optional(),
  receivedMobileDevice: z.boolean().optional(),
  receivedParkingPass: z.boolean().optional(),
  receivedLaptop: z.boolean().optional(),
  receivedUniform: z.boolean().optional(),
  propertyNotes: z.string().optional(),
  
  // Section 6: Confidentiality Agreement
  confidentialityAcknowledged: z.boolean().refine(val => val === true, "You must agree to the confidentiality terms"),
  position: z.string().min(2, "Position is required"),
  
  // Section 7: Offer Letter Acceptance
  hourlyRate: z.string().optional(),
  scheduledStartDate: z.string().optional(),
  offerAccepted: z.boolean().refine(val => val === true, "You must accept the offer letter"),
  
  // Section 8: TrackTik Info
  trackTikUsername: z.string().optional(),
  trackTikPasswordSet: z.boolean().optional(),
  
  // Section 9: Temporary Employment Acknowledgement
  temporaryEmploymentAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge temporary employment terms"),
  
  // Section 10: Personal Appearance
  personalAppearanceAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the personal appearance policy"),
  
  // Section 11: Attendance & Punctuality
  attendancePolicyAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the attendance policy"),
  
  // Section 12: Disciplinary Action
  disciplinaryPolicyAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the disciplinary policy"),
  
  // Section 13: Drug & Alcohol Use
  drugAlcoholPolicyAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the drug & alcohol policy"),
  
  // Section 14: Drug Test Consent
  drugTestConsentAcknowledged: z.boolean().refine(val => val === true, "You must consent to drug testing"),
  
  // Section 15: Employee Availability
  availabilityPosition: z.string().optional(),
  mondayFrom: z.string().optional(),
  mondayTo: z.string().optional(),
  tuesdayFrom: z.string().optional(),
  tuesdayTo: z.string().optional(),
  wednesdayFrom: z.string().optional(),
  wednesdayTo: z.string().optional(),
  thursdayFrom: z.string().optional(),
  thursdayTo: z.string().optional(),
  fridayFrom: z.string().optional(),
  fridayTo: z.string().optional(),
  saturdayFrom: z.string().optional(),
  saturdayTo: z.string().optional(),
  sundayFrom: z.string().optional(),
  sundayTo: z.string().optional(),
  availabilityNotes: z.string().optional(),
  
  // Section 16: Job Description
  jobDescriptionAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the job description"),
  
  // Section 17: Social Media Policy
  socialMediaPolicyAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the social media policy"),
  
  // Section 18: Workers' Compensation Notice
  workersCompNoticeAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the workers' compensation notice"),
  retainCommonLawRights: z.boolean().optional(),
  
  // Section 19: Uniform Checklist
  uniformLongSleeveShirt: z.boolean().optional(),
  uniformShortSleeveButtonUp: z.boolean().optional(),
  uniformShortSleeveShirt: z.boolean().optional(),
  uniformHighVisLongSleeve: z.boolean().optional(),
  uniformHighVisShortSleeve: z.boolean().optional(),
  uniformTie: z.boolean().optional(),
  uniformSilverBadge: z.boolean().optional(),
  uniformSilverSOs: z.boolean().optional(),
  uniformPants: z.boolean().optional(),
  uniformBomberJacket: z.boolean().optional(),
  uniformJacket: z.boolean().optional(),
  uniformBeanieHat: z.boolean().optional(),
  uniformBaseballHat: z.boolean().optional(),
  uniformFlashlight: z.boolean().optional(),
  uniformFlagPatch: z.boolean().optional(),
  uniformRadio: z.boolean().optional(),
  uniformIdBadge: z.boolean().optional(),
  uniformChecklistAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge the uniform checklist"),
  
  // Section 20: Work Schedule
  schedulePostAddress: z.string().optional(),
  schedulePostCity: z.string().optional(),
  schedulePostState: z.string().optional(),
  schedulePostZip: z.string().optional(),
  scheduleMondayFrom: z.string().optional(),
  scheduleMondayTo: z.string().optional(),
  scheduleTuesdayFrom: z.string().optional(),
  scheduleTuesdayTo: z.string().optional(),
  scheduleWednesdayFrom: z.string().optional(),
  scheduleWednesdayTo: z.string().optional(),
  scheduleThursdayFrom: z.string().optional(),
  scheduleThursdayTo: z.string().optional(),
  scheduleFridayFrom: z.string().optional(),
  scheduleFridayTo: z.string().optional(),
  scheduleSaturdayFrom: z.string().optional(),
  scheduleSaturdayTo: z.string().optional(),
  scheduleSundayFrom: z.string().optional(),
  scheduleSundayTo: z.string().optional(),
  scheduleStartDate: z.string().optional(),
  scheduleAcknowledged: z.boolean().refine(val => val === true, "You must acknowledge your work schedule"),
  
  // Section 21: W-4 Employee's Withholding Certificate (2025)
  // Step 1: Personal Information (uses existing fields)
  w4FilingStatus: z.enum(["single", "married_jointly", "head_of_household"]),
  
  // Step 2: Multiple Jobs or Spouse Works
  w4MultipleJobsCheckbox: z.boolean().optional(),
  
  // Step 3: Claim Dependents
  w4QualifyingChildrenCount: z.string().optional(),
  w4QualifyingChildrenAmount: z.string().optional(),
  w4OtherDependentsCount: z.string().optional(),
  w4OtherDependentsAmount: z.string().optional(),
  w4TotalCredits: z.string().optional(),
  
  // Step 4: Other Adjustments
  w4OtherIncome: z.string().optional(),
  w4Deductions: z.string().optional(),
  w4ExtraWithholding: z.string().optional(),
  
  // Step 5: Signature
  w4SignatureDate: z.string().optional(),
  w4Acknowledged: z.boolean().refine(val => val === true, "You must sign the W-4 form"),
  
  // Background Check Consent
  backgroundCheckConsent: z.boolean().refine(val => val === true, "You must consent to background check"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const steps = [
  { id: 1, title: "I-9 Form", icon: User, description: "Employment Eligibility" },
  { id: 2, title: "Direct Deposit", icon: CreditCard, description: "Bank Information" },
  { id: 3, title: "Emergency Contact", icon: Heart, description: "Emergency Contacts" },
  { id: 4, title: "Handbook", icon: FileText, description: "Policy Acknowledgement" },
  { id: 5, title: "Property", icon: Package, description: "Company Property" },
  { id: 6, title: "Confidentiality", icon: Lock, description: "NDA Agreement" },
  { id: 7, title: "Offer Letter", icon: FileCheck, description: "Job Acceptance" },
  { id: 8, title: "TrackTik", icon: Smartphone, description: "App Login" },
  { id: 9, title: "Temp Status", icon: Clock, description: "Employment Terms" },
  { id: 10, title: "Appearance", icon: Shirt, description: "Personal Appearance" },
  { id: 11, title: "Attendance", icon: Calendar, description: "Punctuality Policy" },
  { id: 12, title: "Disciplinary", icon: AlertTriangle, description: "Disciplinary Action" },
  { id: 13, title: "Drug Policy", icon: Shield, description: "Drug & Alcohol Use" },
  { id: 14, title: "Drug Test", icon: Pill, description: "Testing Consent" },
  { id: 15, title: "Availability", icon: CalendarDays, description: "Work Schedule" },
  { id: 16, title: "Job Description", icon: Briefcase, description: "Role & Duties" },
  { id: 17, title: "Social Media", icon: Share2, description: "Code of Conduct" },
  { id: 18, title: "Workers' Comp", icon: Building2, description: "Insurance Notice" },
  { id: 19, title: "Uniform", icon: ClipboardList, description: "Uniform Checklist" },
  { id: 20, title: "Schedule", icon: CalendarClock, description: "Work Schedule" },
  { id: 21, title: "Form W-4", icon: Receipt, description: "Tax Withholding" },
];

const TOTAL_STEPS = 21;

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [driversLicenseFile, setDriversLicenseFile] = useState<File | null>(null);
  const [driversLicensePreview, setDriversLicensePreview] = useState<string | null>(null);
  const [ssnCardFile, setSsnCardFile] = useState<File | null>(null);
  const [ssnCardPreview, setSsnCardPreview] = useState<string | null>(null);
  const dlInputRef = useRef<HTMLInputElement>(null);
  const ssnInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    file: File | null,
    setFile: (f: File | null) => void,
    setPreview: (p: string | null) => void
  ) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File too large", { description: "Maximum file size is 10MB." });
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Invalid file type", { description: "Please upload an image or PDF." });
      return;
    }
    setFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };
  
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      middleInitial: "",
      otherLastNames: "",
      address: "",
      aptNumber: "",
      city: "",
      state: "",
      zipCode: "",
      dateOfBirth: "",
      ssn: "",
      email: "",
      phone: "",
      citizenshipStatus: "citizen",
      uscisNumber: "",
      i94Number: "",
      foreignPassportNumber: "",
      countryOfIssuance: "",
      workAuthExpiration: "",
      bankName: "",
      routingNumber: "",
      accountNumber: "",
      accountType: "checking",
      depositType: "full",
      depositAmount: "",
      emergencyName1: "",
      emergencyRelationship1: "",
      emergencyAddress1: "",
      emergencyPhone1: "",
      emergencyAltPhone1: "",
      emergencyName2: "",
      emergencyRelationship2: "",
      emergencyAddress2: "",
      emergencyPhone2: "",
      emergencyAltPhone2: "",
      medicalInstructions: "",
      doctorName: "",
      doctorAddress: "",
      doctorPhone: "",
      handbookAcknowledged: false,
      receivedBuildingKey: false,
      receivedIdBadge: false,
      receivedMobileDevice: false,
      receivedParkingPass: false,
      receivedLaptop: false,
      receivedUniform: false,
      propertyNotes: "",
      confidentialityAcknowledged: false,
      position: "",
      hourlyRate: "",
      scheduledStartDate: "",
      offerAccepted: false,
      trackTikUsername: "",
      trackTikPasswordSet: false,
      temporaryEmploymentAcknowledged: false,
      personalAppearanceAcknowledged: false,
      attendancePolicyAcknowledged: false,
      disciplinaryPolicyAcknowledged: false,
      drugAlcoholPolicyAcknowledged: false,
      drugTestConsentAcknowledged: false,
      availabilityPosition: "",
      mondayFrom: "",
      mondayTo: "",
      tuesdayFrom: "",
      tuesdayTo: "",
      wednesdayFrom: "",
      wednesdayTo: "",
      thursdayFrom: "",
      thursdayTo: "",
      fridayFrom: "",
      fridayTo: "",
      saturdayFrom: "",
      saturdayTo: "",
      sundayFrom: "",
      sundayTo: "",
      availabilityNotes: "",
      jobDescriptionAcknowledged: false,
      socialMediaPolicyAcknowledged: false,
      workersCompNoticeAcknowledged: false,
      retainCommonLawRights: false,
      uniformLongSleeveShirt: false,
      uniformShortSleeveButtonUp: false,
      uniformShortSleeveShirt: false,
      uniformHighVisLongSleeve: false,
      uniformHighVisShortSleeve: false,
      uniformTie: false,
      uniformSilverBadge: false,
      uniformSilverSOs: false,
      uniformPants: false,
      uniformBomberJacket: false,
      uniformJacket: false,
      uniformBeanieHat: false,
      uniformBaseballHat: false,
      uniformFlashlight: false,
      uniformFlagPatch: false,
      uniformRadio: false,
      uniformIdBadge: false,
      uniformChecklistAcknowledged: false,
      schedulePostAddress: "",
      schedulePostCity: "",
      schedulePostState: "",
      schedulePostZip: "",
      scheduleMondayFrom: "",
      scheduleMondayTo: "",
      scheduleTuesdayFrom: "",
      scheduleTuesdayTo: "",
      scheduleWednesdayFrom: "",
      scheduleWednesdayTo: "",
      scheduleThursdayFrom: "",
      scheduleThursdayTo: "",
      scheduleFridayFrom: "",
      scheduleFridayTo: "",
      scheduleSaturdayFrom: "",
      scheduleSaturdayTo: "",
      scheduleSundayFrom: "",
      scheduleSundayTo: "",
      scheduleStartDate: "",
      scheduleAcknowledged: false,
      w4FilingStatus: "single",
      w4MultipleJobsCheckbox: false,
      w4QualifyingChildrenCount: "",
      w4QualifyingChildrenAmount: "",
      w4OtherDependentsCount: "",
      w4OtherDependentsAmount: "",
      w4TotalCredits: "",
      w4OtherIncome: "",
      w4Deductions: "",
      w4ExtraWithholding: "",
      w4SignatureDate: "",
      w4Acknowledged: false,
      backgroundCheckConsent: false,
    },
  });

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true);
    
    try {
      // Prepare the application data
      const applicationData = {
        first_name: data.firstName,
        last_name: data.lastName,
        middle_name: data.middleInitial || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zipCode || null,
        phone: data.phone || null,
        email: data.email || null,
        date_of_birth: data.dateOfBirth || null,
        ssn: data.ssn || null,
        citizenship_status: data.citizenshipStatus || null,
        desired_position: data.position || null,
        direct_deposit_consent: true,
        bank_name: data.bankName || null,
        routing_number: data.routingNumber || null,
        account_number: data.accountNumber || null,
        account_type: data.accountType || null,
        emergency_contact_name: data.emergencyName1 || null,
        emergency_contact_relationship: data.emergencyRelationship1 || null,
        emergency_contact_phone: data.emergencyPhone1 || null,
        emergency_contact_address: data.emergencyAddress1 || null,
        background_consent: data.backgroundCheckConsent || null,
        uniform_shirt_size: data.uniformLongSleeveShirt ? 'Long Sleeve' : data.uniformShortSleeveShirt ? 'Short Sleeve' : null,
        w2_filing_status: data.w4FilingStatus || null,
        w2_allowances: data.w4TotalCredits || null,
        w2_additional_withholding: data.w4ExtraWithholding || null,
        policy_acknowledgements: JSON.parse(JSON.stringify({
          handbook: data.handbookAcknowledged,
          confidentiality: data.confidentialityAcknowledged,
          temporaryEmployment: data.temporaryEmploymentAcknowledged,
          personalAppearance: data.personalAppearanceAcknowledged,
          attendance: data.attendancePolicyAcknowledged,
          disciplinary: data.disciplinaryPolicyAcknowledged,
          drugAlcohol: data.drugAlcoholPolicyAcknowledged,
          drugTest: data.drugTestConsentAcknowledged,
          jobDescription: data.jobDescriptionAcknowledged,
          socialMedia: data.socialMediaPolicyAcknowledged,
          workersComp: data.workersCompNoticeAcknowledged,
        })),
        availability: JSON.parse(JSON.stringify({
          monday: { from: data.mondayFrom, to: data.mondayTo },
          tuesday: { from: data.tuesdayFrom, to: data.tuesdayTo },
          wednesday: { from: data.wednesdayFrom, to: data.wednesdayTo },
          thursday: { from: data.thursdayFrom, to: data.thursdayTo },
          friday: { from: data.fridayFrom, to: data.fridayTo },
          saturday: { from: data.saturdayFrom, to: data.saturdayTo },
          sunday: { from: data.sundayFrom, to: data.sundayTo },
        })),
        full_form_data: JSON.parse(JSON.stringify(data)),
      };

      // Save to database (generate ID client-side; RLS blocks SELECT on returning row)
      const applicationId = crypto.randomUUID();
      const { error: dbError } = await supabase
        .from('applications')
        .insert({ ...applicationData, id: applicationId });

      if (dbError) {
        console.error("Database error:", dbError);
        throw new Error("Failed to save application");
      }

      console.log("Application saved to database:", applicationId);

      // Upload documents to storage

      const uploadFile = async (file: File, docType: string) => {
        const ext = file.name.split('.').pop();
        const path = `${applicationId}/${docType}.${ext}`;
        const { error } = await supabase.storage
          .from('onboarding-documents')
          .upload(path, file);
        if (error) console.error(`Failed to upload ${docType}:`, error);
      };

      if (driversLicenseFile) await uploadFile(driversLicenseFile, 'drivers-license');
      if (ssnCardFile) await uploadFile(ssnCardFile, 'social-security-card');

      // Send email notification
      const { error: emailError } = await supabase.functions.invoke('send-application-email', {
        body: {
          id: insertedApplication.id,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          desiredPosition: data.position,
          fullFormData: data,
        },
      });

      if (emailError) {
        console.error("Email error:", emailError);
        // Don't throw - application was saved, just email failed
        toast.warning("Application saved but email notification failed", {
          description: "We received your application and will contact you soon.",
        });
      } else {
        toast.success("Application submitted successfully!", {
          description: "We will contact you within 2-3 business days.",
        });
      }

      // Reset form after successful submission
      form.reset();
      setCurrentStep(1);
      
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit application", {
        description: "Please try again or contact us directly.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const citizenshipStatus = form.watch("citizenshipStatus");

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Steps - Scrollable on mobile */}
      <div className="mb-8 overflow-x-auto pb-4">
        <div className="flex items-center min-w-max px-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : isCompleted
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-3 h-3 md:w-4 md:h-4" />
                    )}
                  </div>
                  <span className={`mt-1 text-[8px] md:text-[10px] font-medium text-center max-w-[50px] md:max-w-[60px] leading-tight ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-4 md:w-6 h-0.5 mx-0.5 md:mx-1 transition-all duration-300 ${
                    isCompleted ? "bg-accent" : "bg-muted"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Indicator */}
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {TOTAL_STEPS}: <span className="text-foreground font-medium">{steps[currentStep - 1].description}</span>
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Step 1: I-9 Employment Eligibility */}
          {currentStep === 1 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Employment Eligibility Verification (I-9)
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Department of Homeland Security - U.S. Citizenship and Immigration Services
                </p>
              </div>
              
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 text-sm">
                <strong>Anti-Discrimination Notice:</strong> All employees can choose which acceptable documentation to present for Form I-9.
              </div>

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Section 1: Employee Information and Attestation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name (Family Name) *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name (Given Name) *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleInitial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Initial</FormLabel>
                      <FormControl>
                        <Input maxLength={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherLastNames"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Other Last Names Used</FormLabel>
                      <FormControl>
                        <Input placeholder="if any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address (Street Number and Name) *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="aptNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apt. Number</FormLabel>
                      <FormControl>
                        <Input placeholder="if any" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City or Town *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input placeholder="TX" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ssn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>U.S. Social Security Number *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="XXX-XX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee's Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee's Telephone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(XXX) XXX-XXXX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-muted-foreground mb-4">
                  I am aware that federal law provides for imprisonment and/or fines for false statements, or the use of false documents, in connection with the completion of this form.
                </p>
                
                <FormField
                  control={form.control}
                  name="citizenshipStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Citizenship or Immigration Status *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-2 mt-2"
                        >
                          <div className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50">
                            <RadioGroupItem value="citizen" id="citizen" className="mt-0.5" />
                            <label htmlFor="citizen" className="text-sm cursor-pointer">
                              <strong>1.</strong> A citizen of the United States
                            </label>
                          </div>
                          <div className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50">
                            <RadioGroupItem value="noncitizen_national" id="noncitizen_national" className="mt-0.5" />
                            <label htmlFor="noncitizen_national" className="text-sm cursor-pointer">
                              <strong>2.</strong> A noncitizen national of the United States
                            </label>
                          </div>
                          <div className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50">
                            <RadioGroupItem value="permanent_resident" id="permanent_resident" className="mt-0.5" />
                            <label htmlFor="permanent_resident" className="text-sm cursor-pointer">
                              <strong>3.</strong> A lawful permanent resident
                            </label>
                          </div>
                          <div className="flex items-start space-x-3 p-2 rounded hover:bg-muted/50">
                            <RadioGroupItem value="authorized_alien" id="authorized_alien" className="mt-0.5" />
                            <label htmlFor="authorized_alien" className="text-sm cursor-pointer">
                              <strong>4.</strong> A noncitizen authorized to work until expiration date
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(citizenshipStatus === "permanent_resident" || citizenshipStatus === "authorized_alien") && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-lg border-l-4 border-primary">
                  <FormField
                    control={form.control}
                    name="uscisNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>USCIS A-Number</FormLabel>
                        <FormControl>
                          <Input placeholder="A-XXXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="i94Number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Form I-94 Admission Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="workAuthExpiration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Authorization Expiration</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="foreignPassportNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foreign Passport Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="countryOfIssuance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country of Issuance</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
               )}

              {/* Document Uploads */}
              <div className="mt-8 border-t pt-6">
                <h3 className="font-semibold text-foreground mb-4 border-b pb-2 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  Document Uploads
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Please upload clear photos or scans of the following documents. Accepted formats: JPG, PNG, PDF (max 10MB each).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Driver's License */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Driver's License *</label>
                    <input
                      ref={dlInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setDriversLicenseFile, setDriversLicensePreview)}
                    />
                    {driversLicenseFile ? (
                      <div className="border rounded-lg p-3 bg-muted/30">
                        {driversLicensePreview ? (
                          <img src={driversLicensePreview} alt="Driver's License" className="w-full h-40 object-contain rounded mb-2" />
                        ) : (
                          <div className="w-full h-40 flex items-center justify-center bg-muted rounded mb-2">
                            <FileText className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">{driversLicenseFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setDriversLicenseFile(null); setDriversLicensePreview(null); }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => dlInputRef.current?.click()}
                        className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <Image className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload</span>
                      </button>
                    )}
                  </div>

                  {/* Social Security Card */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Social Security Card *</label>
                    <input
                      ref={ssnInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files?.[0] || null, setSsnCardFile, setSsnCardPreview)}
                    />
                    {ssnCardFile ? (
                      <div className="border rounded-lg p-3 bg-muted/30">
                        {ssnCardPreview ? (
                          <img src={ssnCardPreview} alt="Social Security Card" className="w-full h-40 object-contain rounded mb-2" />
                        ) : (
                          <div className="w-full h-40 flex items-center justify-center bg-muted rounded mb-2">
                            <FileText className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground truncate max-w-[180px]">{ssnCardFile.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => { setSsnCardFile(null); setSsnCardPreview(null); }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => ssnInputRef.current?.click()}
                        className="w-full h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-colors"
                      >
                        <Image className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Direct Deposit */}
          {currentStep === 2 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Full Service Direct Deposit Enrollment
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Your Pay Goes into the Bank. You Don't.
                </p>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6">
                <h3 className="font-semibold mb-2">Benefits of Direct Deposit:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                  <li><strong>Convenient:</strong> Deposits your net pay automatically to your account(s)</li>
                  <li><strong>Safe:</strong> Eliminates lost, stolen, or damaged paychecks</li>
                  <li><strong>Confidential:</strong> Reduces handling of your personal payroll information</li>
                  <li><strong>Reliable:</strong> Complete paystub information every payday</li>
                  <li><strong>Free:</strong> No additional charge to employees</li>
                </ul>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 text-sm">
                <strong>Important:</strong> Attach a voided check for checking accounts. For savings accounts, ask your bank for the Routing/Transit Number.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Financial Institution (Bank Name) *</FormLabel>
                      <FormControl>
                        <Input placeholder="Chase Bank, Wells Fargo, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing/Transit Number (9 digits) *</FormLabel>
                      <FormControl>
                        <Input placeholder="XXXXXXXXX" maxLength={9} {...field} />
                      </FormControl>
                      <FormDescription>Found at the bottom left of your check</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number *</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>Found at the bottom center of your check</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Type *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="checking" id="checking" />
                            <label htmlFor="checking" className="cursor-pointer">Checking</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="savings" id="savings" />
                            <label htmlFor="savings" className="cursor-pointer">Savings</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="depositType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deposit Amount *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="full" id="full" />
                            <label htmlFor="full" className="cursor-pointer">Entire Net Pay</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="partial" id="partial" />
                            <label htmlFor="partial" className="cursor-pointer">Partial Amount</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 3: Emergency Contact */}
          {currentStep === 3 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Emergency Contact Form
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Kairos Security LLC - Lic# C20778
                </p>
              </div>

              <div className="mb-6">
                <FormField
                  control={form.control}
                  name="medicalInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Medical Instructions</FormLabel>
                      <FormDescription>
                        In the event of a medical emergency, are there any emergency procedures or restrictions on medications of which emergency personnel should be aware?
                      </FormDescription>
                      <FormControl>
                        <Textarea 
                          placeholder="If yes, please explain any medical conditions, allergies, or restrictions..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2 text-primary">Primary Emergency Contact *</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="emergencyName1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyRelationship1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship *</FormLabel>
                      <FormControl>
                        <Input placeholder="Spouse, Parent, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyAddress1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyPhone1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyAltPhone1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alternate Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Secondary Emergency Contact (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="emergencyName2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyRelationship2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emergencyPhone2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Personal Physician (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="doctorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor's Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doctorAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor's Address</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="doctorPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor's Phone</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 4: Handbook Acknowledgement */}
          {currentStep === 4 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Employee Handbook Acknowledgement
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  I have received a copy of the Kairos Security LLC Employee Handbook. I understand that I am responsible for reading and familiarizing myself with the policies and procedures contained therein.
                </p>
                <p>
                  I understand that the handbook is intended to provide employees with a general understanding of the personnel policies. Neither the handbook nor any of Kairos Security LLC's policies, procedures or practices is intended to create a contract of employment, or a promise or guarantee of continued employment.
                </p>
                <p>
                  I understand that employment with Kairos Security LLC is "at will" and may be terminated by either the employee or the company at any time for any reason.
                </p>
                <p>
                  I understand that Kairos Security LLC reserves the right to revise the contents of the handbook or any policy at any time and that I will be notified of any changes through company communication channels.
                </p>
              </div>

              <FormField
                control={form.control}
                name="handbookAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge that I have received and read the Employee Handbook *
                      </FormLabel>
                      <FormDescription>
                        By checking this box, you confirm that you understand the policies contained in the handbook.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 5: Company Property */}
          {currentStep === 5 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  Receipt of Company Property
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm">
                <p>
                  I acknowledge that I have received the following company property and agree to return all items upon separation from the company.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="receivedUniform"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Uniform</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedIdBadge"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">ID Badge</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedBuildingKey"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Building Key</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedMobileDevice"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Mobile Device / Radio</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedParkingPass"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Parking Pass</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedLaptop"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Laptop / Computer</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="propertyNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes / Other Items</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List any additional items received..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 6: Confidentiality Agreement */}
          {currentStep === 6 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Confidentiality Agreement
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  As a condition of my employment with Kairos Security LLC, I agree to hold in strictest confidence any trade secrets, confidential or proprietary information, or any other type of data which is a part of Kairos Security LLC's business.
                </p>
                <p>
                  I will not, during or after my employment with Kairos Security LLC, disclose any of the above to any person, firm, corporation, or other entity. I will not make any use whatsoever, directly or indirectly, of any of the aforementioned, except as required in the course of my employment with Kairos Security LLC.
                </p>
                <p>
                  I understand that violation of this Confidentiality Agreement may result in discipline or termination.
                </p>
              </div>

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Position/Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Security Guard, Supervisor, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confidentialityAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I agree to the terms of this Confidentiality Agreement *
                      </FormLabel>
                      <FormDescription>
                        By checking this box, you acknowledge and agree to maintain confidentiality.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 7: Offer Letter */}
          {currentStep === 7 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-primary" />
                  Offer Letter Acceptance
                </h2>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-3">Job Offer Details</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Welcome to Kairos Security LLC! We are pleased to offer you a position with our company.
                </p>
                <ul className="text-sm space-y-2">
                  <li><strong>Company:</strong> Kairos Security LLC</li>
                  <li><strong>License:</strong> Texas DPS License #C20778</li>
                  <li><strong>Employment Type:</strong> Part-time / As needed basis</li>
                  <li><strong>Pay Frequency:</strong> Bi-weekly (every two weeks)</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate (if known)</FormLabel>
                      <FormControl>
                        <Input placeholder="$XX.XX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="scheduledStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Start Date (if known)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="offerAccepted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I accept this offer of employment *
                      </FormLabel>
                      <FormDescription>
                        By checking this box, you confirm acceptance of the job offer terms.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 8: TrackTik Login */}
          {currentStep === 8 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  TrackTik Login Information
                </h2>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-3">Setup Instructions:</h3>
                <ol className="text-sm space-y-2 list-decimal pl-5">
                  <li>Download the <strong>TrackTik Shift</strong> app from Google Play Store or Apple Store</li>
                  <li>Enter the URL: <code className="bg-background px-2 py-1 rounded text-primary font-mono">kairos.staffr.net</code></li>
                  <li>Use your username and password to log in</li>
                </ol>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-2">Default Login Credentials:</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Username:</strong> First initial + last name (e.g., <code className="bg-background px-1 rounded">jdoe</code>)
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Default Password:</strong> <code className="bg-background px-1 rounded">#Security2020</code> (you will be prompted to change it)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="trackTikUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your TrackTik Username</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., jdoe" {...field} />
                      </FormControl>
                      <FormDescription>First initial + last name</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trackTikPasswordSet"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg border mt-6">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">I have set up my TrackTik password</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6 p-4 bg-secondary/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">
                  <strong>Company Address:</strong> 13165 W Lake Houston Suite 312, Houston, TX 77044
                </p>
                <p className="text-sm text-muted-foreground">
                  Texas DPS License # C-20778
                </p>
              </div>
            </div>
          )}

          {/* Step 9: Temporary Employment Acknowledgement */}
          {currentStep === 9 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Temporary Employment Information and Acknowledgement
                </h2>
              </div>

              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-6 text-sm">
                <strong>IMPORTANT:</strong> Every temporary/part time employee of Kairos Security LLC must read and sign this form when hired.
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <h4 className="font-semibold">What is a Temporary Employee?</h4>
                <p>
                  You have been hired to perform job duties on a TEMPORARY BASIS. Reasons for hiring this way include:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Overload Work</li>
                  <li>Special Short-term Projects</li>
                  <li>Temporary replacement for a permanent employee</li>
                  <li>Temporarily filling a vacant position</li>
                </ul>

                <h4 className="font-semibold">Your Status</h4>
                <p>
                  As a Temporary Employee you have not been hired through the usual competitive process and, therefore, you do not have permanent status nor any guarantee to continued employment.
                </p>

                <h4 className="font-semibold">Payroll Information</h4>
                <p>
                  Paychecks are mailed every two weeks on Friday. Normal payroll deductions such as federal and state taxes will be withheld. As a temporary employee, you are not eligible for benefits such as sick leave, vacation or holiday pay, hospitalization insurance or other benefits.
                </p>

                <h4 className="font-semibold">Employment Duration</h4>
                <p>
                  Temporary employees can be employed UP TO SIX (6) MONTHS, but there is no guarantee that you will be needed or kept on that long.
                </p>

                <p className="text-muted-foreground italic">
                  Questions? Contact HR at 1-888-KAIROS 8 (1-888-524-7678) or 713-300-8948
                </p>
              </div>

              <FormField
                control={form.control}
                name="temporaryEmploymentAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I have read and understand the above information *
                      </FormLabel>
                      <FormDescription>
                        I acknowledge my status as a temporary employee.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 10: Personal Appearance */}
          {currentStep === 10 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Shirt className="w-5 h-5 text-primary" />
                  Personal Appearance Policy
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  The purpose of Kairos Security LLC's personal appearance policy is to ensure a safe and sanitary workplace for all employees. Kairos Security LLC strives to maintain a professional working environment that promotes efficiency, positive employee morale and promotes a professional image.
                </p>
                <p>
                  During business hours or when representing Kairos Security LLC, employees are expected to use common sense and good judgment to meet the goals of this policy.
                </p>
                <h4 className="font-semibold">General Guidelines:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Wear appropriate clothing according to the Kairos Security LLC uniform check list</li>
                  <li>Observe high standards of personal hygiene</li>
                  <li>Dress and groom according to the requirements of your position</li>
                  <li>Maintain a clean and neat appearance</li>
                  <li>Refrain from wearing stained, wrinkled, frayed, or revealing clothing to the workplace</li>
                </ul>
                <p>
                  If management designates "casual days," an employee's casual dress must still be clean, neat and project a professional image.
                </p>
                <p>
                  Employees who wear inappropriate attire to work may be sent home to change their clothing.
                </p>
                <p className="text-muted-foreground italic">
                  Kairos Security LLC will make every effort to provide reasonable accommodation for religious, disability, or other characteristics protected under federal, state or local law.
                </p>
              </div>

              <FormField
                control={form.control}
                name="personalAppearanceAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge and agree to the Personal Appearance Policy *
                      </FormLabel>
                      <FormDescription>
                        I will maintain professional appearance standards as outlined above.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 11: Attendance & Punctuality */}
          {currentStep === 11 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Attendance and Punctuality Policy
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  Absenteeism and tardiness place an undue burden on other employees and on the Kairos Security LLC. Kairos Security LLC expects regular attendance and punctuality from all employees.
                </p>
                <h4 className="font-semibold">Expectations:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Be in the workplace, ready to work, at your scheduled start time each day</li>
                  <li>Complete your entire shift</li>
                  <li>Return from scheduled meal and break periods on time</li>
                </ul>
                <h4 className="font-semibold">Time Off Requests:</h4>
                <p>
                  All time off must be requested in writing, in advance, as outlined in the time-off policy.
                </p>
                <h4 className="font-semibold">Reporting Absences:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>If unexpectedly unable to report for work, directly notify your supervisor as early as possible</li>
                  <li>It is NOT acceptable to leave a voicemail, text, or email message except in extreme emergencies</li>
                  <li>If you must leave a message, a follow-up call must be made later that day</li>
                  <li>For absences of more than one day, contact your supervisor on each day of absence</li>
                </ul>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-4">
                  <strong>Important:</strong> If an employee fails to notify their supervisor after three consecutive days of absence, Kairos Security LLC will presume that the employee has voluntarily resigned.
                </div>
                <p className="text-muted-foreground italic">
                  Should undue or recurrent absence and tardiness become apparent, the employee will be subject to disciplinary action, up to and including termination of employment.
                </p>
              </div>

              <FormField
                control={form.control}
                name="attendancePolicyAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge and agree to the Attendance and Punctuality Policy *
                      </FormLabel>
                      <FormDescription>
                        I understand the attendance expectations and consequences.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 12: Disciplinary Action */}
          {currentStep === 12 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-primary" />
                  Disciplinary Action Policy
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  Disciplinary action at Kairos Security LLC is intended to fairly and impartially correct behavior and performance problems early on and to prevent reoccurrence.
                </p>
                <h4 className="font-semibold">Disciplinary Action May Include:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Verbal warning</li>
                  <li>Written warning</li>
                  <li>Suspension with or without pay</li>
                  <li>Termination of employment</li>
                </ul>
                <p>
                  The severity depends on the problem and the frequency of occurrence. Kairos Security LLC reserves the right to administer disciplinary action at its discretion and based upon the circumstances.
                </p>
                <h4 className="font-semibold">Immediate Termination Violations:</h4>
                <p className="text-destructive">
                  Certain types of employee behavior are serious enough to justify termination of employment without observing other disciplinary action first:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Workplace violence</li>
                  <li>Harassment</li>
                  <li>Theft of any kind</li>
                  <li>Vandalism or destruction of company property</li>
                  <li>Use of company equipment and/or company vehicles without prior authorization</li>
                  <li>Divulging Kairos Security LLC business practices or any other confidential information</li>
                </ul>
              </div>

              <FormField
                control={form.control}
                name="disciplinaryPolicyAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge and understand the Disciplinary Action Policy *
                      </FormLabel>
                      <FormDescription>
                        I understand the consequences of policy violations.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 13: Drug & Alcohol Use */}
          {currentStep === 13 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Drug & Alcohol Use Policy
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  Kairos Security LLC is committed to maintaining a workplace free of substance abuse.
                </p>
                <h4 className="font-semibold">Prohibited Activities:</h4>
                <p>
                  No employee is allowed to consume, possess, sell, purchase, or be under the influence of alcohol or illegal drugs:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>On any property owned by or leased on behalf of Kairos Security LLC</li>
                  <li>In any vehicle owned or leased on behalf of Kairos Security LLC</li>
                </ul>
                <h4 className="font-semibold">Prescription & Over-the-Counter Drugs:</h4>
                <p>
                  The use of over-the-counter drugs and legally prescribed drugs is permitted if used in the manner prescribed and does not hinder job performance or safety. Employees should inform their supervisor if medication may impair job performance.
                </p>
                <h4 className="font-semibold">Reporting Requirements:</h4>
                <p>
                  All employees should report evidence of alcohol or drug abuse to their supervisor or administrator immediately. If use creates an imminent threat to safety, employees are required to report the violation.
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-4">
                  <strong>Drug Testing:</strong> If Kairos Security LLC selects a random drug testing, the employee has within 24 hours to report. Kairos Security LLC reserves the right to examine and test for drugs and alcohol at its discretion.
                </div>
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3 mt-4">
                  <h4 className="font-semibold mb-2">Drug Test Location:</h4>
                  <p>National Screening Center</p>
                  <p>401 Fannin St. | Houston, TX 77002</p>
                  <p>(713) 226-7847</p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="drugAlcoholPolicyAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge and agree to the Drug & Alcohol Use Policy *
                      </FormLabel>
                      <FormDescription>
                        I will comply with this policy as a condition of my employment.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 14: Drug Test Consent */}
          {currentStep === 14 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Pill className="w-5 h-5 text-primary" />
                  Drug and/or Alcohol Testing Consent Form
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <h4 className="font-semibold">Employee Agreement and Consent to Drug and/or Alcohol Testing</h4>
                <p>
                  I hereby agree, upon a request made under the drug/alcohol testing policy of Kairos Security LLC, to submit to a drug or alcohol test and to furnish a sample of my urine, breath, and/or blood for analysis.
                </p>
                <p>
                  I understand and agree that if I at any time refuse to submit to a drug or alcohol test under company policy, or if I otherwise fail to cooperate with the testing procedures, I will be subject to immediate termination.
                </p>
                <p>
                  I further authorize and give full permission to have the Company and/or its company physician send the specimen(s) collected to a laboratory for screening and for the laboratory to release documentation to the Company and/or any governmental entity involved in a legal proceeding.
                </p>
                <p>
                  I understand that only duly-authorized Company officers, employees, and agents will have access to information furnished or obtained in connection with the test; they will maintain and protect confidentiality to the greatest extent possible.
                </p>
                <p>
                  I will hold harmless the Company, its company physician, and any testing laboratory for any alleged harm resulting from such testing, including loss of employment or adverse job action.
                </p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 mt-4">
                  <strong>Important Notice:</strong> The Company will require a drug screen and/or alcohol test whenever you are involved in an on-the-job accident or injury under circumstances that suggest possible involvement or influence of drugs or alcohol.
                </div>
              </div>

              <FormField
                control={form.control}
                name="drugTestConsentAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I consent to Drug and/or Alcohol Testing *
                      </FormLabel>
                      <FormDescription>
                        This policy has been explained to me and I agree to submit to testing.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 15: Employee Availability */}
          {currentStep === 15 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  Employee Availability Form
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Texas DPS License #C20778
                </p>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6 text-sm">
                <p>
                  Show the times and days you are available for work. Whenever your schedule changes, request this form, complete it and return it to your manager or supervisor.
                </p>
                <p className="mt-2 font-semibold">
                  Any changes must be presented to a manager or supervisor 10 days in advance.
                </p>
              </div>

              <FormField
                control={form.control}
                name="availabilityPosition"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Position</FormLabel>
                    <FormControl>
                      <Input placeholder="Security Guard, Supervisor, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">I am available to work the following days and times:</h3>
              
              <div className="space-y-3">
                {[
                  { day: "Monday", fromField: "mondayFrom" as const, toField: "mondayTo" as const },
                  { day: "Tuesday", fromField: "tuesdayFrom" as const, toField: "tuesdayTo" as const },
                  { day: "Wednesday", fromField: "wednesdayFrom" as const, toField: "wednesdayTo" as const },
                  { day: "Thursday", fromField: "thursdayFrom" as const, toField: "thursdayTo" as const },
                  { day: "Friday", fromField: "fridayFrom" as const, toField: "fridayTo" as const },
                  { day: "Saturday", fromField: "saturdayFrom" as const, toField: "saturdayTo" as const },
                  { day: "Sunday", fromField: "sundayFrom" as const, toField: "sundayTo" as const },
                ].map(({ day, fromField, toField }) => (
                  <div key={day} className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-muted/30">
                    <span className="font-medium">{day}</span>
                    <FormField
                      control={form.control}
                      name={fromField}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="time" placeholder="From" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={toField}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="time" placeholder="To" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="availabilityNotes"
                render={({ field }) => (
                  <FormItem className="mt-6">
                    <FormLabel>Notes/Explanations</FormLabel>
                    <FormDescription>
                      Ex: School Mon-Fri 7:00am-3:00pm
                    </FormDescription>
                    <FormControl>
                      <Textarea 
                        placeholder="Any scheduling notes or conflicts..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 16: Job Description */}
          {currentStep === 16 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Security Guard Job Description
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Texas DPS License #C20778
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div><strong>Department:</strong> Security</div>
                  <div><strong>Reports To:</strong> S. Taylor</div>
                </div>

                <h4 className="font-semibold">Job Summary:</h4>
                <p>
                  Guards, patrols, and monitors premises to prevent theft, violence, and rule infractions.
                </p>

                <h4 className="font-semibold">General Accountabilities:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Monitors and authorizes entrance and departure of employees, visitors, and other persons to guard against theft and maintain security of premises</li>
                  <li>Writes reports of daily activities and irregularities, such as equipment or property damage, theft, presence of unauthorized persons, or unusual occurrences</li>
                  <li>Calls police or fire departments in cases of emergency</li>
                  <li>Answers alarms and investigates disturbances</li>
                  <li>Circulates among visitors, patrons, or employees to preserve order and protect property</li>
                  <li>Patrols premises to prevent and detect signs of intrusion</li>
                  <li>Escorts or drives motor vehicle to transport individuals to specified locations or provide personal protection</li>
                  <li>Operates detecting devices to screen individuals and prevent passage of prohibited articles</li>
                  <li>Warns persons of rule infractions or violations, and apprehends or evicts violators from premises</li>
                </ul>
                <p className="text-muted-foreground italic">
                  *The company reserves the right to add or change duties at any time.
                </p>

                <h4 className="font-semibold">Job Qualifications:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Education:</strong> High school diploma or equivalent</li>
                  <li><strong>Experience:</strong> 1-2 years of related experience</li>
                  <li><strong>Licenses:</strong> Security guard license from state</li>
                </ul>

                <h4 className="font-semibold">Skills Required:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Excellent verbal and written communication</li>
                  <li>Active listening</li>
                  <li>Critical thinking</li>
                </ul>
              </div>

              <FormField
                control={form.control}
                name="jobDescriptionAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge and understand the Job Description *
                      </FormLabel>
                      <FormDescription>
                        I understand the duties and responsibilities of this position.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 17: Social Media Policy */}
          {currentStep === 17 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-primary" />
                  Social and Digital Media Code of Conduct
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  Social media includes electronic communications and online activities, such as text messages, email, wikis, social networking like Facebook, Twitter, and posting comments on blogs.
                </p>

                <h4 className="font-semibold">Guidelines:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li><strong>All internet postings are permanent</strong> - able to be duplicated and may go viral.</li>
                  <li><strong>Use common sense.</strong> If you wonder whether or not to communicate or post, don't do it until you consult with Kairos Security leadership.</li>
                  <li><strong>Confidentiality:</strong> You are prohibited from using social media channels to discuss confidential items, legal matters, litigation, or the organization's financial performance.</li>
                  <li><strong>Be open and honest</strong> about who you are when you communicate.</li>
                  <li><strong>Respect privacy</strong> - yours, your coworkers', and the organization's - by not providing personal or confidential information without permission.</li>
                  <li>Only <strong>officially designated persons</strong> may use social media to speak on behalf of the organization in an official capacity.</li>
                  <li>If communicating with youth, act as you would in person. <strong>Do not initiate one-on-one relationships with minors.</strong></li>
                  <li><strong>Do not violate copyright</strong> and fair use laws. Do not plagiarize.</li>
                  <li><strong>Do not use</strong> Kairos Security's email or social media channels for personal use.</li>
                  <li><strong>Harassment, threats, intimidation, ethnic slurs, personal insults, pornography, obscenity, or abuse</strong> is prohibited via social media channels.</li>
                  <li>Violations may result in <strong>disciplinary action, up to and including termination</strong>.</li>
                </ol>
              </div>

              <FormField
                control={form.control}
                name="socialMediaPolicyAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge and agree to the Social and Digital Media Code of Conduct *
                      </FormLabel>
                      <FormDescription>
                        I will comply with this code of conduct in all my communications.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 18: Workers' Compensation Notice */}
          {currentStep === 18 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Texas Department of Insurance - Workers' Compensation Notice
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Division of Workers' Compensation - Reference Rule 110.101
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  In accordance with Texas Labor Code and Rule 110.101, employers must notify employees of workers' compensation insurance coverage status in writing.
                </p>

                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">NOTICE TO NEW EMPLOYEES</h4>
                  <p>
                    "You may elect to retain your common law right of action if, no later than five days after you begin employment or within five days after receiving written notice from the employer that the employer has obtained workers' compensation insurance coverage, you notify your employer in writing that you wish to retain your common law right to recover damages for personal injury.
                  </p>
                  <p className="mt-2">
                    If you elect to retain your common law right of action, you cannot obtain workers' compensation income or medical benefits if you are injured."
                  </p>
                </div>

                <h4 className="font-semibold">When This Notice is Provided:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  <li>At the time an employee is hired (when completing W-4 and I-9 forms)</li>
                  <li>When a break in service has occurred</li>
                  <li>Within 15 days after termination or cancellation of coverage takes effect</li>
                  <li>Within 15 days after the employer obtains workers' compensation insurance coverage</li>
                </ul>
              </div>

              <FormField
                control={form.control}
                name="workersCompNoticeAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge receipt of the Workers' Compensation Notice *
                      </FormLabel>
                      <FormDescription>
                        I have read and understand the information above.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="retainCommonLawRights"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/30">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I elect to RETAIN my common law right of action (Optional)
                      </FormLabel>
                      <FormDescription>
                        Check this box only if you wish to retain your common law right to recover damages. This means you will NOT be covered by workers' compensation benefits.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 19: Uniform Checklist */}
          {currentStep === 19 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Uniform Check List
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Uniforms Received
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm">
                <p>
                  Check all uniform items that you have received. All items must be returned upon separation from the company.
                </p>
              </div>

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Shirts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                <FormField
                  control={form.control}
                  name="uniformLongSleeveShirt"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Long Sleeve Shirt (complete with patches)</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformShortSleeveButtonUp"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Short Sleeve Button Up Shirt (complete with patches)</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformShortSleeveShirt"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Short Sleeve Shirt (complete with patches)</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformHighVisLongSleeve"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">High Visibility Traffic Long Sleeve Shirt</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformHighVisShortSleeve"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">High Visibility Traffic Short Sleeve Shirt</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Accessories & Equipment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <FormField
                  control={form.control}
                  name="uniformTie"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Tie</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformSilverBadge"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Silver Badge</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformSilverSOs"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Silver SO's</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformPants"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Pants</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformBomberJacket"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Bomber Jacket</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformJacket"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Jacket</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformBeanieHat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Beanie Hat</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformBaseballHat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Baseball Hat</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformFlashlight"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Flashlight</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformFlagPatch"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Flag Patch</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformRadio"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">Radio</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="uniformIdBadge"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border p-3 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="cursor-pointer text-sm">ID Badge</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="uniformChecklistAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge receipt of the uniform items checked above *
                      </FormLabel>
                      <FormDescription>
                        I agree to return all items upon separation from the company.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 20: Work Schedule */}
          {currentStep === 20 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <CalendarClock className="w-5 h-5 text-primary" />
                  Initial Work Schedule
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Welcome to Kairos Security!
                </p>
              </div>

              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 mb-6 text-sm">
                <p>
                  <strong>Important:</strong> This schedule is not fixed and is subject to change at any time based on operational needs or client requirements. You will be notified promptly of any adjustments to your schedule.
                </p>
              </div>

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Post Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="schedulePostAddress"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Post Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Street Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schedulePostCity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="schedulePostState"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input maxLength={2} placeholder="TX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="schedulePostZip"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ZIP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Your Schedule</h3>
              <div className="space-y-3 mb-6">
                {[
                  { day: "Monday", fromField: "scheduleMondayFrom" as const, toField: "scheduleMondayTo" as const },
                  { day: "Tuesday", fromField: "scheduleTuesdayFrom" as const, toField: "scheduleTuesdayTo" as const },
                  { day: "Wednesday", fromField: "scheduleWednesdayFrom" as const, toField: "scheduleWednesdayTo" as const },
                  { day: "Thursday", fromField: "scheduleThursdayFrom" as const, toField: "scheduleThursdayTo" as const },
                  { day: "Friday", fromField: "scheduleFridayFrom" as const, toField: "scheduleFridayTo" as const },
                  { day: "Saturday", fromField: "scheduleSaturdayFrom" as const, toField: "scheduleSaturdayTo" as const },
                  { day: "Sunday", fromField: "scheduleSundayFrom" as const, toField: "scheduleSundayTo" as const },
                ].map(({ day, fromField, toField }) => (
                  <div key={day} className="grid grid-cols-3 gap-4 items-center p-3 rounded-lg bg-muted/30">
                    <span className="font-medium">{day}</span>
                    <FormField
                      control={form.control}
                      name={fromField}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="time" placeholder="From" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={toField}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="time" placeholder="To" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="scheduleStartDate"
                render={({ field }) => (
                  <FormItem className="mb-6">
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduleAcknowledged"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I acknowledge my initial work schedule *
                      </FormLabel>
                      <FormDescription>
                        I understand this schedule is subject to change based on operational needs.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Step 21: W-4 Employee's Withholding Certificate */}
          {currentStep === 21 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-primary" />
                      Form W-4 (2025)
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Employee's Withholding Certificate
                    </p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <p>OMB No. 1545-0074</p>
                    <p>Department of the Treasury</p>
                    <p>Internal Revenue Service</p>
                  </div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm">
                <p className="font-medium mb-2">Complete Form W-4 so that your employer can withhold the correct federal income tax from your pay.</p>
                <p className="text-muted-foreground">Give Form W-4 to your employer. Your withholding is subject to review by the IRS.</p>
              </div>

              {/* Step 1: Enter Personal Information */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
                  Enter Personal Information
                </h3>
                
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <p className="text-sm text-muted-foreground">Your personal information has been pre-filled from Step 1 of this application (I-9 form).</p>
                </div>

                <FormField
                  control={form.control}
                  name="w4FilingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">(c) Filing Status *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-2 mt-2"
                        >
                          <div className="flex items-center space-x-2 p-3 rounded border hover:bg-muted/50">
                            <RadioGroupItem value="single" id="w4_single" />
                            <label htmlFor="w4_single" className="cursor-pointer text-sm flex-1">
                              Single or Married filing separately
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 rounded border hover:bg-muted/50">
                            <RadioGroupItem value="married_jointly" id="w4_married" />
                            <label htmlFor="w4_married" className="cursor-pointer text-sm flex-1">
                              Married filing jointly or Qualifying surviving spouse
                            </label>
                          </div>
                          <div className="flex items-center space-x-2 p-3 rounded border hover:bg-muted/50">
                            <RadioGroupItem value="head_of_household" id="w4_head" />
                            <label htmlFor="w4_head" className="cursor-pointer text-sm flex-1">
                              Head of household (Check only if you're unmarried and pay more than half the costs of keeping up a home for yourself and a qualifying individual.)
                            </label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Step 2: Multiple Jobs or Spouse Works */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
                  Multiple Jobs or Spouse Works
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Complete this step if you (1) hold more than one job at a time, or (2) are married filing jointly and your spouse also works.</p>

                <FormField
                  control={form.control}
                  name="w4MultipleJobsCheckbox"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          (c) If there are only two jobs total, check this box
                        </FormLabel>
                        <FormDescription>
                          Do the same on Form W-4 for the other job. This option is generally more accurate if pay at the lower paying job is more than half of the pay at the higher paying job.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Step 3: Claim Dependents */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
                  Claim Dependents
                </h3>
                <p className="text-sm text-muted-foreground mb-4">If your total income will be $200,000 or less ($400,000 or less if married filing jointly):</p>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField
                      control={form.control}
                      name="w4QualifyingChildrenCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of qualifying children under age 17</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="text-center text-muted-foreground">× $2,000 =</div>
                    <FormField
                      control={form.control}
                      name="w4QualifyingChildrenAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="$0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <FormField
                      control={form.control}
                      name="w4OtherDependentsCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of other dependents</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" placeholder="0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="text-center text-muted-foreground">× $500 =</div>
                    <FormField
                      control={form.control}
                      name="w4OtherDependentsAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="$0" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="w4TotalCredits"
                    render={({ field }) => (
                      <FormItem className="border-t pt-4">
                        <FormLabel className="font-semibold">3. Total Credits (add amounts above)</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="$0" {...field} />
                        </FormControl>
                        <FormDescription>Add the amounts for qualifying children and other dependents. Enter the total here.</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Step 4: Other Adjustments */}
              <div className="border rounded-lg p-4 mb-6">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">4</span>
                  Other Adjustments (Optional)
                </h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="w4OtherIncome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>4(a) Other income (not from jobs)</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="$0" {...field} />
                        </FormControl>
                        <FormDescription>If you want tax withheld for other income you expect this year that won't have withholding (interest, dividends, retirement income).</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="w4Deductions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>4(b) Deductions</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="$0" {...field} />
                        </FormControl>
                        <FormDescription>If you expect to claim deductions other than the standard deduction and want to reduce your withholding.</FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="w4ExtraWithholding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>4(c) Extra withholding</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="$0" {...field} />
                        </FormControl>
                        <FormDescription>Enter any additional tax you want withheld each pay period.</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Step 5: Sign Here */}
              <div className="border border-primary/30 rounded-lg p-4 mb-6 bg-primary/5">
                <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">5</span>
                  Sign Here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">Under penalties of perjury, I declare that this certificate, to the best of my knowledge and belief, is true, correct, and complete.</p>

                <FormField
                  control={form.control}
                  name="w4SignatureDate"
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="w4Acknowledged"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-semibold">
                          I certify that this Form W-4 is true, correct, and complete *
                        </FormLabel>
                        <FormDescription>
                          By checking this box, I am electronically signing this Form W-4.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Final Consent</h3>
              
              <FormField
                control={form.control}
                name="backgroundCheckConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/30">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-semibold">
                        I consent to a background check *
                      </FormLabel>
                      <FormDescription>
                        I authorize Kairos Security LLC to conduct a criminal background check.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {currentStep < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
