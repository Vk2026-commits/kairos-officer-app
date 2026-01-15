import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  User, Phone, CreditCard, Heart, FileText, Package, Lock, 
  FileCheck, Smartphone, Clock, ChevronRight, ChevronLeft, Send, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
  
  // Background Check & Drug Test Consent
  backgroundCheckConsent: z.boolean().refine(val => val === true, "You must consent to background check"),
  drugTestConsent: z.boolean().refine(val => val === true, "You must consent to drug testing"),
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
];

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  
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
      backgroundCheckConsent: false,
      drugTestConsent: false,
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    console.log("Application submitted:", data);
    toast.success("Application submitted successfully!", {
      description: "We will contact you within 2-3 business days.",
    });
  };

  const nextStep = () => {
    if (currentStep < 9) setCurrentStep(currentStep + 1);
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
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : isCompleted
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </div>
                  <span className={`mt-2 text-[10px] md:text-xs font-medium text-center max-w-[60px] md:max-w-[80px] leading-tight ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-6 md:w-12 h-0.5 mx-1 md:mx-2 transition-all duration-300 ${
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
          Step {currentStep} of {steps.length}: <span className="text-foreground font-medium">{steps[currentStep - 1].description}</span>
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

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Physician Contact (Optional)</h3>
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
                  name="doctorPhone"
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
            </div>
          )}

          {/* Step 4: Handbook Acknowledgement */}
          {currentStep === 4 && (
            <div className="form-section animate-fade-in">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Employee Acknowledgement of Handbook
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  I acknowledge that I have received and reviewed the employee handbook. I understand and recognize that there may be changes to the information, policies, and benefits in the handbook. I understand that Kairos Security LLC may add new policies to the handbook as well as replace, change, or cancel existing policies. I understand that I will be told about any handbook changes and I understand that handbook changes can only be authorized by Kairos Security LLC management.
                </p>
                <p>
                  I understand that I became an employee of Kairos Security LLC voluntarily. I understand and acknowledge that there is no specified length to my employment and that my employment is at will. I understand and acknowledge that "at will" means that I may terminate my employment at any time, with or without cause or advance notice. I also understand and acknowledge that "at will" means that Kairos Security LLC may terminate my employment at any time, with or without cause or advance notice, as long as they do not violate federal or state laws.
                </p>
                <p>
                  I understand that it is my responsibility to read and comply with all policies included within the employee handbook. I further understand that I should consult my supervisor regarding any questions I may have.
                </p>
                <p className="text-muted-foreground italic">
                  You can access the full handbook at: <a href="https://www.myhandbookonline.com/kairossecurity" target="_blank" rel="noopener noreferrer" className="text-primary underline">www.myhandbookonline.com/kairossecurity</a>
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
                        I acknowledge that I have received and reviewed the employee handbook *
                      </FormLabel>
                      <FormDescription>
                        By checking this box, you confirm you understand and agree to comply with all policies.
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
                  Receipt & Return of Company Property
                </h2>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm">
                <p>
                  I acknowledge receipt of the company property listed below. I will maintain the property in good condition and will return it upon termination of employment from Kairos Security LLC, or earlier upon request. I will report any loss or damage immediately. I agree that I will use the property for work-related purposes only.
                </p>
              </div>

              <h3 className="font-semibold text-foreground mb-4">Property Received (check all that apply):</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <FormField
                  control={form.control}
                  name="receivedBuildingKey"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg border hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Building Key/Card</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedIdBadge"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg border hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Identification Badge</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedMobileDevice"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg border hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Mobile Device</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedParkingPass"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg border hover:bg-muted/30">
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
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg border hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Laptop Computer</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="receivedUniform"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0 p-3 rounded-lg border hover:bg-muted/30">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="cursor-pointer">Uniform/Vest</FormLabel>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="propertyNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes / Serial Numbers</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any serial numbers, model information, or other details..."
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
                <p className="text-sm text-muted-foreground mt-1">
                  Kairos Security LLC
                </p>
              </div>

              <div className="mb-6">
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position/Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Security Officer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <h4 className="font-semibold">Term</h4>
                <p>
                  This Agreement applies to discussions related to the duties of your Position during the period beginning on today's date and ending on the later of 5 years, or the term of service.
                </p>

                <h4 className="font-semibold">Acknowledgment</h4>
                <p>
                  Individual understands and acknowledges that in his or her Position they will receive confidential information pertaining to the activities, operations and the business of Kairos Security LLC and/or financial and personal information of Kairos Security LLC employees ("Confidential Information"). Individual further acknowledges that disclosure of such Confidential Information may be prejudicial to Kairos Security LLC.
                </p>

                <h4 className="font-semibold">Confidentiality</h4>
                <p>Individual agrees to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Not disclose or discuss Confidential Information with others not authorized to receive such;</li>
                  <li>Use reasonable means to protect and prevent the disclosure of Confidential Information, whether oral or written;</li>
                  <li>Use the Confidential Information only in connection with Kairos Security LLC business.</li>
                </ul>

                <h4 className="font-semibold">Remedy</h4>
                <p>
                  Upon violation of this Agreement, Kairos Security LLC may in its sole discretion remove such Individual immediately from said Position and prevent such Individual from serving on any other position that involves receipt of Confidential Information.
                </p>
              </div>

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
                        I agree to the Confidentiality Agreement terms *
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
                <p className="text-sm text-muted-foreground mt-1">
                  Kairos Security LLC - Texas DPS License # C20778
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-6 mb-6 space-y-4 text-sm leading-relaxed">
                <p>
                  I am delighted to confirm the offer of employment. Your position will be <strong>Security Officer</strong> reporting to the Supervisor in Private Security.
                </p>

                <p>
                  You will receive compensation paid hourly, weekly provided you have rendered services during the pay period, subject to any deductions permitted under law.
                </p>

                <p>
                  As a regular part-time employee of Kairos Security LLC, you will be expected to attend work during scheduled hours.
                </p>

                <p>
                  <strong>Important:</strong> This offer of employment is contingent upon the completion of a background check, passing a drug test, and any license requirements by DPS.
                </p>

                <p className="text-muted-foreground italic">
                  Kairos Security LLC is an at-will employer. This means that both you and Kairos Security reserve the right to terminate the employment relationship at any time for any reason.
                </p>
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
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-primary/30 p-4 bg-primary/5 mb-6">
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

              <h3 className="font-semibold text-foreground mb-4 border-b pb-2">Background Check & Drug Test Consent</h3>
              
              <div className="space-y-4">
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

                <FormField
                  control={form.control}
                  name="drugTestConsent"
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
                          I consent to drug testing *
                        </FormLabel>
                        <FormDescription>
                          I agree to submit to drug and/or alcohol testing as required.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
            
            {currentStep < 9 ? (
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
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
                Submit Application
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
