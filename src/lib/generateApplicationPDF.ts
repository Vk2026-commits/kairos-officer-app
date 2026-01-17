import { jsPDF } from "jspdf";

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
  created_at: string;
  full_form_data: Record<string, unknown>;
}

const formatFieldName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    // For availability/schedule objects
    const entries = Object.entries(value as Record<string, unknown>);
    return entries
      .map(([k, v]) => `${formatFieldName(k)}: ${formatValue(v)}`)
      .join(", ");
  }
  return String(value);
};

const sectionTitles: Record<string, string> = {
  // I-9 Fields
  lastName: "Section 1: I-9 Employment Eligibility",
  firstName: "Section 1: I-9 Employment Eligibility",
  middleInitial: "Section 1: I-9 Employment Eligibility",
  otherLastNames: "Section 1: I-9 Employment Eligibility",
  address: "Section 1: I-9 Employment Eligibility",
  aptNumber: "Section 1: I-9 Employment Eligibility",
  city: "Section 1: I-9 Employment Eligibility",
  state: "Section 1: I-9 Employment Eligibility",
  zipCode: "Section 1: I-9 Employment Eligibility",
  dateOfBirth: "Section 1: I-9 Employment Eligibility",
  ssn: "Section 1: I-9 Employment Eligibility",
  email: "Section 1: I-9 Employment Eligibility",
  phone: "Section 1: I-9 Employment Eligibility",
  citizenshipStatus: "Section 1: I-9 Employment Eligibility",
  uscisNumber: "Section 1: I-9 Employment Eligibility",
  i94Number: "Section 1: I-9 Employment Eligibility",
  foreignPassportNumber: "Section 1: I-9 Employment Eligibility",
  countryOfIssuance: "Section 1: I-9 Employment Eligibility",
  workAuthExpiration: "Section 1: I-9 Employment Eligibility",
  
  // Direct Deposit
  bankName: "Section 2: Direct Deposit",
  routingNumber: "Section 2: Direct Deposit",
  accountNumber: "Section 2: Direct Deposit",
  accountType: "Section 2: Direct Deposit",
  depositType: "Section 2: Direct Deposit",
  depositAmount: "Section 2: Direct Deposit",
  
  // Emergency Contact
  emergencyName1: "Section 3: Emergency Contact",
  emergencyRelationship1: "Section 3: Emergency Contact",
  emergencyAddress1: "Section 3: Emergency Contact",
  emergencyPhone1: "Section 3: Emergency Contact",
  emergencyAltPhone1: "Section 3: Emergency Contact",
  emergencyName2: "Section 3: Emergency Contact",
  emergencyRelationship2: "Section 3: Emergency Contact",
  emergencyAddress2: "Section 3: Emergency Contact",
  emergencyPhone2: "Section 3: Emergency Contact",
  emergencyAltPhone2: "Section 3: Emergency Contact",
  medicalInstructions: "Section 3: Emergency Contact",
  doctorName: "Section 3: Emergency Contact",
  doctorAddress: "Section 3: Emergency Contact",
  doctorPhone: "Section 3: Emergency Contact",
  
  // Handbook
  handbookAcknowledged: "Section 4: Handbook Acknowledgement",
  
  // Company Property
  receivedBuildingKey: "Section 5: Company Property",
  receivedIdBadge: "Section 5: Company Property",
  receivedMobileDevice: "Section 5: Company Property",
  receivedParkingPass: "Section 5: Company Property",
  receivedLaptop: "Section 5: Company Property",
  receivedUniform: "Section 5: Company Property",
  propertyNotes: "Section 5: Company Property",
  
  // Confidentiality
  confidentialityAcknowledged: "Section 6: Confidentiality Agreement",
  position: "Section 6: Confidentiality Agreement",
  
  // Offer Letter
  hourlyRate: "Section 7: Offer Letter",
  scheduledStartDate: "Section 7: Offer Letter",
  offerAccepted: "Section 7: Offer Letter",
  
  // TrackTik
  trackTikUsername: "Section 8: TrackTik Info",
  trackTikPasswordSet: "Section 8: TrackTik Info",
  
  // Policies
  temporaryEmploymentAcknowledged: "Section 9: Temporary Employment",
  personalAppearanceAcknowledged: "Section 10: Personal Appearance",
  attendancePolicyAcknowledged: "Section 11: Attendance & Punctuality",
  disciplinaryPolicyAcknowledged: "Section 12: Disciplinary Action",
  drugAlcoholPolicyAcknowledged: "Section 13: Drug & Alcohol Policy",
  drugTestConsentAcknowledged: "Section 14: Drug Test Consent",
  
  // Availability
  availabilityPosition: "Section 15: Employee Availability",
  mondayFrom: "Section 15: Employee Availability",
  mondayTo: "Section 15: Employee Availability",
  tuesdayFrom: "Section 15: Employee Availability",
  tuesdayTo: "Section 15: Employee Availability",
  wednesdayFrom: "Section 15: Employee Availability",
  wednesdayTo: "Section 15: Employee Availability",
  thursdayFrom: "Section 15: Employee Availability",
  thursdayTo: "Section 15: Employee Availability",
  fridayFrom: "Section 15: Employee Availability",
  fridayTo: "Section 15: Employee Availability",
  saturdayFrom: "Section 15: Employee Availability",
  saturdayTo: "Section 15: Employee Availability",
  sundayFrom: "Section 15: Employee Availability",
  sundayTo: "Section 15: Employee Availability",
  availabilityNotes: "Section 15: Employee Availability",
  
  // More policies
  jobDescriptionAcknowledged: "Section 16: Job Description",
  socialMediaPolicyAcknowledged: "Section 17: Social Media Policy",
  workersCompNoticeAcknowledged: "Section 18: Workers' Compensation",
  retainCommonLawRights: "Section 18: Workers' Compensation",
  
  // Uniform
  uniformLongSleeveShirt: "Section 19: Uniform Checklist",
  uniformShortSleeveButtonUp: "Section 19: Uniform Checklist",
  uniformShortSleeveShirt: "Section 19: Uniform Checklist",
  uniformHighVisLongSleeve: "Section 19: Uniform Checklist",
  uniformHighVisShortSleeve: "Section 19: Uniform Checklist",
  uniformTie: "Section 19: Uniform Checklist",
  uniformSilverBadge: "Section 19: Uniform Checklist",
  uniformSilverSOs: "Section 19: Uniform Checklist",
  uniformPants: "Section 19: Uniform Checklist",
  uniformBomberJacket: "Section 19: Uniform Checklist",
  uniformJacket: "Section 19: Uniform Checklist",
  uniformBeanieHat: "Section 19: Uniform Checklist",
  uniformBaseballHat: "Section 19: Uniform Checklist",
  uniformFlashlight: "Section 19: Uniform Checklist",
  uniformFlagPatch: "Section 19: Uniform Checklist",
  uniformRadio: "Section 19: Uniform Checklist",
  uniformIdBadge: "Section 19: Uniform Checklist",
  uniformChecklistAcknowledged: "Section 19: Uniform Checklist",
  
  // Work Schedule
  schedulePostAddress: "Section 20: Work Schedule",
  schedulePostCity: "Section 20: Work Schedule",
  schedulePostState: "Section 20: Work Schedule",
  schedulePostZip: "Section 20: Work Schedule",
  scheduleMondayFrom: "Section 20: Work Schedule",
  scheduleMondayTo: "Section 20: Work Schedule",
  scheduleTuesdayFrom: "Section 20: Work Schedule",
  scheduleTuesdayTo: "Section 20: Work Schedule",
  scheduleWednesdayFrom: "Section 20: Work Schedule",
  scheduleWednesdayTo: "Section 20: Work Schedule",
  scheduleThursdayFrom: "Section 20: Work Schedule",
  scheduleThursdayTo: "Section 20: Work Schedule",
  scheduleFridayFrom: "Section 20: Work Schedule",
  scheduleFridayTo: "Section 20: Work Schedule",
  scheduleSaturdayFrom: "Section 20: Work Schedule",
  scheduleSaturdayTo: "Section 20: Work Schedule",
  scheduleSundayFrom: "Section 20: Work Schedule",
  scheduleSundayTo: "Section 20: Work Schedule",
  scheduleStartDate: "Section 20: Work Schedule",
  scheduleAcknowledged: "Section 20: Work Schedule",
  
  // W-2
  w2MaritalStatus: "Section 21: W-2 Information",
  w2Allowances: "Section 21: W-2 Information",
  w2AdditionalWithholding: "Section 21: W-2 Information",
  w2Exempt: "Section 21: W-2 Information",
  w2Acknowledged: "Section 21: W-2 Information",
  
  // Background Check
  backgroundCheckConsent: "Background Check Consent",
};

export function generateApplicationPDF(application: Application): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;
  const lineHeight = 7;
  
  const addNewPageIfNeeded = (requiredSpace: number = 30) => {
    if (yPos + requiredSpace > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("KAIROS SECURITY", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  
  doc.setFontSize(16);
  doc.text("Employee Application", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;
  
  // Application Info Box
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setDrawColor(200);
  doc.rect(margin, yPos, contentWidth, 25);
  
  doc.setFont("helvetica", "bold");
  doc.text("Applicant:", margin + 5, yPos + 7);
  doc.setFont("helvetica", "normal");
  doc.text(`${application.first_name} ${application.middle_name || ""} ${application.last_name}`, margin + 35, yPos + 7);
  
  doc.setFont("helvetica", "bold");
  doc.text("Submitted:", margin + 5, yPos + 14);
  doc.setFont("helvetica", "normal");
  const submittedDate = new Date(application.created_at).toLocaleString();
  doc.text(submittedDate, margin + 35, yPos + 14);
  
  doc.setFont("helvetica", "bold");
  doc.text("App ID:", margin + 5, yPos + 21);
  doc.setFont("helvetica", "normal");
  doc.text(application.id, margin + 35, yPos + 21);
  
  yPos += 35;

  // Group fields by section
  const formData = application.full_form_data || {};
  const sections: Record<string, Array<{ key: string; value: unknown }>> = {};
  
  Object.entries(formData).forEach(([key, value]) => {
    const section = sectionTitles[key] || "Other Information";
    if (!sections[section]) {
      sections[section] = [];
    }
    sections[section].push({ key, value });
  });

  // Render each section
  const sectionOrder = [
    "Section 1: I-9 Employment Eligibility",
    "Section 2: Direct Deposit",
    "Section 3: Emergency Contact",
    "Section 4: Handbook Acknowledgement",
    "Section 5: Company Property",
    "Section 6: Confidentiality Agreement",
    "Section 7: Offer Letter",
    "Section 8: TrackTik Info",
    "Section 9: Temporary Employment",
    "Section 10: Personal Appearance",
    "Section 11: Attendance & Punctuality",
    "Section 12: Disciplinary Action",
    "Section 13: Drug & Alcohol Policy",
    "Section 14: Drug Test Consent",
    "Section 15: Employee Availability",
    "Section 16: Job Description",
    "Section 17: Social Media Policy",
    "Section 18: Workers' Compensation",
    "Section 19: Uniform Checklist",
    "Section 20: Work Schedule",
    "Section 21: W-2 Information",
    "Background Check Consent",
    "Other Information",
  ];

  sectionOrder.forEach((sectionName) => {
    const fields = sections[sectionName];
    if (!fields || fields.length === 0) return;

    addNewPageIfNeeded(25 + fields.length * lineHeight);

    // Section Header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(sectionName, margin + 3, yPos + 6);
    yPos += 12;

    // Section Fields
    doc.setFontSize(9);
    fields.forEach(({ key, value }) => {
      addNewPageIfNeeded(lineHeight);
      
      const fieldName = formatFieldName(key);
      const fieldValue = formatValue(value);
      
      doc.setFont("helvetica", "bold");
      doc.text(`${fieldName}:`, margin + 3, yPos);
      
      doc.setFont("helvetica", "normal");
      const valueX = margin + 70;
      const maxValueWidth = contentWidth - 70;
      
      // Handle long values with text wrapping
      const lines = doc.splitTextToSize(fieldValue, maxValueWidth);
      doc.text(lines, valueX, yPos);
      
      yPos += lineHeight * Math.max(1, lines.length);
    });

    yPos += 5;
  });

  // Footer with signature lines
  addNewPageIfNeeded(50);
  yPos += 10;
  
  doc.setDrawColor(0);
  doc.line(margin, yPos, margin + 80, yPos);
  doc.setFontSize(9);
  doc.text("Employee Signature", margin, yPos + 5);
  
  doc.line(pageWidth - margin - 50, yPos, pageWidth - margin, yPos);
  doc.text("Date", pageWidth - margin - 50, yPos + 5);

  // Save the PDF
  const fileName = `Application_${application.last_name}_${application.first_name}_${new Date(application.created_at).toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
