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
  ssn?: string;
  created_at: string;
  full_form_data: Record<string, unknown>;
}

export function generateW4PDF(application: Application): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos = margin;

  const data = application.full_form_data || {};

  // Header
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Form", margin, yPos);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("W-4", margin + 10, yPos + 2);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Department of the Treasury", pageWidth - margin - 50, yPos - 2, { align: "left" });
  doc.text("Internal Revenue Service", pageWidth - margin - 50, yPos + 3, { align: "left" });
  
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Employee's Withholding Certificate", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 6;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("▶ Complete Form W-4 so that your employer can withhold the correct federal income tax from your pay.", margin, yPos);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2025", pageWidth - margin - 5, yPos, { align: "right" });
  
  yPos += 5;
  doc.setFontSize(8);
  doc.text("▶ Give Form W-4 to your employer. Your withholding is subject to review by the IRS.", margin, yPos);
  
  yPos += 8;

  // Step 1: Personal Information
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  doc.rect(margin, yPos, contentWidth, 35);
  
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, yPos, 60, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Step 1:", margin + 2, yPos + 4);
  doc.setFont("helvetica", "normal");
  doc.text("Enter Personal Information", margin + 18, yPos + 4);
  doc.setTextColor(0, 0, 0);
  
  yPos += 10;
  doc.setFontSize(8);
  doc.text("(a) First name and middle initial", margin + 2, yPos);
  doc.text("Last name", margin + 60, yPos);
  doc.text("(b) Social security number", pageWidth - margin - 45, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const firstName = String(data.firstName || application.first_name || "");
  const middleInitial = String(data.middleInitial || application.middle_name || "");
  const lastName = String(data.lastName || application.last_name || "");
  const ssn = String(data.ssn || application.ssn || "");
  
  doc.text(`${firstName} ${middleInitial}`, margin + 2, yPos + 4);
  doc.text(lastName, margin + 60, yPos + 4);
  doc.text(ssn, pageWidth - margin - 45, yPos + 4);
  
  yPos += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Address", margin + 2, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  const address = String(data.address || application.address || "");
  const city = String(data.city || application.city || "");
  const state = String(data.state || application.state || "");
  const zipCode = String(data.zipCode || application.zip_code || "");
  doc.text(`${address}, ${city}, ${state} ${zipCode}`, margin + 2, yPos + 4);
  
  yPos += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("(c)", margin + 2, yPos);
  
  const filingStatus = String(data.w4FilingStatus || "single");
  const isChecked = (status: string) => filingStatus === status ? "☑" : "☐";
  
  doc.text(`${isChecked("single")} Single or Married filing separately`, margin + 10, yPos);
  doc.text(`${isChecked("married_jointly")} Married filing jointly or Qualifying surviving spouse`, margin + 70, yPos);
  yPos += 4;
  doc.text(`${isChecked("head_of_household")} Head of household`, margin + 10, yPos);
  
  yPos += 10;

  // Step 2: Multiple Jobs
  doc.rect(margin, yPos, contentWidth, 20);
  
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, yPos, 70, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Step 2:", margin + 2, yPos + 4);
  doc.setFont("helvetica", "normal");
  doc.text("Multiple Jobs or Spouse Works", margin + 18, yPos + 4);
  doc.setTextColor(0, 0, 0);
  
  yPos += 10;
  doc.setFontSize(8);
  const multipleJobs = data.w4MultipleJobsCheckbox ? "☑" : "☐";
  doc.text(`(c) ${multipleJobs} If there are only two jobs total, check this box.`, margin + 2, yPos);
  
  yPos += 14;

  // Step 3: Claim Dependents
  doc.rect(margin, yPos, contentWidth, 30);
  
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, yPos, 50, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Step 3:", margin + 2, yPos + 4);
  doc.setFont("helvetica", "normal");
  doc.text("Claim Dependents", margin + 18, yPos + 4);
  doc.setTextColor(0, 0, 0);
  
  yPos += 10;
  doc.setFontSize(8);
  doc.text("Multiply number of qualifying children under age 17 by $2,000 ▶", margin + 2, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(`$ ${data.w4QualifyingChildrenAmount || "0"}`, pageWidth - margin - 20, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Multiply number of other dependents by $500 ▶", margin + 2, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(`$ ${data.w4OtherDependentsAmount || "0"}`, pageWidth - margin - 20, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Add the amounts above for qualifying children and other dependents. Enter total here ▶", margin + 2, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(`3   $ ${data.w4TotalCredits || "0"}`, pageWidth - margin - 20, yPos);
  
  yPos += 14;

  // Step 4: Other Adjustments
  doc.rect(margin, yPos, contentWidth, 30);
  
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, yPos, 60, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Step 4", margin + 2, yPos + 4);
  doc.setFont("helvetica", "normal");
  doc.text("(optional):", margin + 16, yPos + 4);
  doc.text("Other Adjustments", margin + 34, yPos + 4);
  doc.setTextColor(0, 0, 0);
  
  yPos += 10;
  doc.setFontSize(8);
  doc.text("(a) Other income (not from jobs) ▶", margin + 2, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(`4(a)   $ ${data.w4OtherIncome || "0"}`, pageWidth - margin - 25, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text("(b) Deductions ▶", margin + 2, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(`4(b)   $ ${data.w4Deductions || "0"}`, pageWidth - margin - 25, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "normal");
  doc.text("(c) Extra withholding ▶", margin + 2, yPos);
  doc.setFont("helvetica", "bold");
  doc.text(`4(c)   $ ${data.w4ExtraWithholding || "0"}`, pageWidth - margin - 25, yPos);
  
  yPos += 14;

  // Step 5: Sign Here
  doc.rect(margin, yPos, contentWidth, 25);
  
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, yPos, 40, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Step 5:", margin + 2, yPos + 4);
  doc.setFont("helvetica", "normal");
  doc.text("Sign Here", margin + 18, yPos + 4);
  doc.setTextColor(0, 0, 0);
  
  yPos += 10;
  doc.setFontSize(7);
  doc.text("Under penalties of perjury, I declare that this certificate, to the best of my knowledge and belief, is true, correct, and complete.", margin + 2, yPos);
  
  yPos += 8;
  doc.setFontSize(8);
  doc.text("Employee's signature (This form is not valid unless you sign it.)", margin + 2, yPos);
  doc.text("Date", pageWidth - margin - 40, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`${firstName} ${lastName}`, margin + 2, yPos);
  doc.text(String(data.w4SignatureDate || new Date().toISOString().split("T")[0]), pageWidth - margin - 40, yPos);
  
  yPos += 12;

  // Employers Only section
  doc.rect(margin, yPos, contentWidth, 20);
  
  doc.setFillColor(200, 200, 200);
  doc.rect(margin, yPos, contentWidth, 6, "F");
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("Employers Only", margin + 2, yPos + 4);
  
  yPos += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Employer's name and address:", margin + 2, yPos);
  doc.text("First date of employment:", margin + 80, yPos);
  doc.text("Employer identification number (EIN):", pageWidth - margin - 55, yPos);
  
  yPos += 5;
  doc.setFont("helvetica", "bold");
  doc.text("Kairos Security LLC", margin + 2, yPos);
  doc.text(String(data.scheduledStartDate || data.scheduleStartDate || ""), margin + 80, yPos);
  
  yPos += 15;
  
  // Footer
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("For Privacy Act and Paperwork Reduction Act Notice, see page 3.", margin, yPos);
  doc.text("Cat. No. 10220Q", pageWidth / 2, yPos, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text("Form W-4 (2025)", pageWidth - margin, yPos, { align: "right" });

  // Save the PDF
  const fileName = `W-4_${application.last_name}_${application.first_name}_2025.pdf`;
  doc.save(fileName);
}
