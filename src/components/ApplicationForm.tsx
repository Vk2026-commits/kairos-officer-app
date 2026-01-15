import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Phone, Briefcase, Award, Clock, FileCheck, ChevronRight, ChevronLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  middleName: z.string().optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  ssn: z.string().min(9, "Valid SSN is required").max(11),
  
  // Contact Information
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Zip code is required"),
  
  // Employment History
  previousEmployer: z.string().optional(),
  previousPosition: z.string().optional(),
  yearsExperience: z.string().min(1, "Please select your experience level"),
  reasonForLeaving: z.string().optional(),
  
  // Certifications
  guardCard: z.enum(["yes", "no"]),
  guardCardNumber: z.string().optional(),
  guardCardExpiry: z.string().optional(),
  cprCertified: z.boolean(),
  firstAidCertified: z.boolean(),
  armedExperience: z.boolean(),
  
  // Availability
  availableStart: z.string().min(1, "Start date is required"),
  shiftPreference: z.string().min(1, "Please select shift preference"),
  weekendAvailable: z.boolean(),
  overtimeAvailable: z.boolean(),
  
  // Background & Consent
  felonyConviction: z.enum(["yes", "no"]),
  felonyExplanation: z.string().optional(),
  backgroundCheckConsent: z.boolean().refine(val => val === true, "You must consent to background check"),
  drugTestConsent: z.boolean().refine(val => val === true, "You must consent to drug testing"),
  termsAccepted: z.boolean().refine(val => val === true, "You must accept the terms"),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Contact", icon: Phone },
  { id: 3, title: "Experience", icon: Briefcase },
  { id: 4, title: "Certifications", icon: Award },
  { id: 5, title: "Availability", icon: Clock },
  { id: 6, title: "Consent", icon: FileCheck },
];

export function ApplicationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  
  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      middleName: "",
      dateOfBirth: "",
      ssn: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      previousEmployer: "",
      previousPosition: "",
      yearsExperience: "",
      reasonForLeaving: "",
      guardCard: "no",
      guardCardNumber: "",
      guardCardExpiry: "",
      cprCertified: false,
      firstAidCertified: false,
      armedExperience: false,
      availableStart: "",
      shiftPreference: "",
      weekendAvailable: false,
      overtimeAvailable: false,
      felonyConviction: "no",
      felonyExplanation: "",
      backgroundCheckConsent: false,
      drugTestConsent: false,
      termsAccepted: false,
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    console.log("Application submitted:", data);
    toast.success("Application submitted successfully!", {
      description: "We will contact you within 2-3 business days.",
    });
  };

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const guardCardValue = form.watch("guardCard");
  const felonyValue = form.watch("felonyConviction");

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive
                        ? "bg-primary text-primary-foreground elevated-shadow"
                        : isCompleted
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`mt-2 text-xs font-medium hidden md:block ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 lg:w-24 h-1 mx-2 rounded transition-all duration-300 ${
                    isCompleted ? "bg-accent" : "bg-muted"
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="form-section animate-fade-in">
              <h2 className="section-title">
                <User className="w-5 h-5 text-accent" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="middleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Michael" {...field} />
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
                    <FormItem className="md:col-span-2">
                      <FormLabel>Social Security Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="XXX-XX-XXXX" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="form-section animate-fade-in">
              <h2 className="section-title">
                <Phone className="w-5 h-5 text-accent" />
                Contact Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="john.doe@email.com" {...field} />
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Street Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street, Apt 4B" {...field} />
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
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input placeholder="Los Angeles" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <FormControl>
                          <Input placeholder="CA" {...field} />
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
                        <FormLabel>Zip Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="90001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Employment History */}
          {currentStep === 3 && (
            <div className="form-section animate-fade-in">
              <h2 className="section-title">
                <Briefcase className="w-5 h-5 text-accent" />
                Employment History
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="yearsExperience"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Security Experience *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No prior experience</SelectItem>
                          <SelectItem value="0-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5+">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousEmployer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Employer</FormLabel>
                      <FormControl>
                        <Input placeholder="Company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="previousPosition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Previous Position</FormLabel>
                      <FormControl>
                        <Input placeholder="Security Officer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reasonForLeaving"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Reason for Leaving</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please describe why you left your previous position..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 4: Certifications */}
          {currentStep === 4 && (
            <div className="form-section animate-fade-in">
              <h2 className="section-title">
                <Award className="w-5 h-5 text-accent" />
                Licenses & Certifications
              </h2>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="guardCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you have a valid Guard Card? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="guardCardYes" />
                            <label htmlFor="guardCardYes">Yes</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="guardCardNo" />
                            <label htmlFor="guardCardNo">No</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {guardCardValue === "yes" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-accent">
                    <FormField
                      control={form.control}
                      name="guardCardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Guard Card Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter card number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="guardCardExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiration Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <FormField
                    control={form.control}
                    name="cprCertified"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">CPR Certified</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="firstAidCertified"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">First Aid Certified</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="armedExperience"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Armed Security Experience</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Availability */}
          {currentStep === 5 && (
            <div className="form-section animate-fade-in">
              <h2 className="section-title">
                <Clock className="w-5 h-5 text-accent" />
                Availability
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="availableStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Start Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shiftPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Shift *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preferred shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="day">Day Shift (6AM - 2PM)</SelectItem>
                          <SelectItem value="swing">Swing Shift (2PM - 10PM)</SelectItem>
                          <SelectItem value="night">Night Shift (10PM - 6AM)</SelectItem>
                          <SelectItem value="flexible">Flexible / Any Shift</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weekendAvailable"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Available for weekend shifts</FormLabel>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="overtimeAvailable"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Willing to work overtime</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {/* Step 6: Background & Consent */}
          {currentStep === 6 && (
            <div className="form-section animate-fade-in">
              <h2 className="section-title">
                <FileCheck className="w-5 h-5 text-accent" />
                Background & Consent
              </h2>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="felonyConviction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Have you ever been convicted of a felony? *</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="yes" id="felonyYes" />
                            <label htmlFor="felonyYes">Yes</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="no" id="felonyNo" />
                            <label htmlFor="felonyNo">No</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {felonyValue === "yes" && (
                  <FormField
                    control={form.control}
                    name="felonyExplanation"
                    render={({ field }) => (
                      <FormItem className="pl-4 border-l-2 border-accent">
                        <FormLabel>Please explain</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Please provide details..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Please read and acknowledge the following consent statements:
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="backgroundCheckConsent"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer text-sm leading-relaxed">
                          I authorize Kairos Security to conduct a comprehensive background check, including criminal history, employment verification, and reference checks. *
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="drugTestConsent"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer text-sm leading-relaxed">
                          I consent to pre-employment drug testing and random drug testing during employment. *
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="mt-1"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer text-sm leading-relaxed">
                          I certify that all information provided in this application is true and complete. I understand that any false statements may result in disqualification or termination. *
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            {currentStep < 6 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="gap-2 bg-primary hover:bg-primary/90"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="submit"
                className="gap-2 gold-gradient text-accent-foreground hover:opacity-90"
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
