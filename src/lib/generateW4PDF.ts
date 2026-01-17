import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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

export async function generateW4PDF(application: Application): Promise<void> {
  try {
    // Fetch the original W-4 form PDF
    const formUrl = "/forms/W-4_Form_2025.pdf";
    const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());

    // Load the PDF
    const pdfDoc = await PDFDocument.load(formPdfBytes);
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Get the first page (the main W-4 form)
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { height } = firstPage.getSize();

    const data = application.full_form_data || {};

    // Helper function to draw text
    const drawText = (text: string, x: number, y: number, size: number = 10, bold: boolean = false) => {
      firstPage.drawText(String(text || ""), {
        x,
        y: height - y,
        size,
        font: bold ? helveticaBold : helveticaFont,
        color: rgb(0, 0, 0),
      });
    };

    // Helper to draw a checkmark
    const drawCheck = (x: number, y: number) => {
      firstPage.drawText("✓", {
        x,
        y: height - y,
        size: 12,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
    };

    // Step 1: Personal Information
    // (a) First name and middle initial
    const firstName = String(data.firstName || application.first_name || "");
    const middleInitial = String(data.middleInitial || application.middle_name || "");
    drawText(`${firstName} ${middleInitial}`.trim(), 32, 119, 10);

    // Last name
    const lastName = String(data.lastName || application.last_name || "");
    drawText(lastName, 200, 119, 10);

    // (b) Social security number
    const ssn = String(data.ssn || application.ssn || "");
    drawText(ssn, 475, 119, 10);

    // Address
    const address = String(data.address || application.address || "");
    const aptNumber = String(data.aptNumber || "");
    const fullAddress = aptNumber ? `${address}, ${aptNumber}` : address;
    drawText(fullAddress, 32, 139, 10);

    // City, State, ZIP
    const city = String(data.city || application.city || "");
    const state = String(data.state || application.state || "");
    const zipCode = String(data.zipCode || application.zip_code || "");
    drawText(`${city}, ${state} ${zipCode}`, 32, 159, 10);

    // (c) Filing status checkboxes - positions based on the form layout
    const filingStatus = String(data.w4FilingStatus || "single");
    
    if (filingStatus === "single") {
      drawCheck(33, 179); // Single or Married filing separately
    } else if (filingStatus === "married_jointly") {
      drawCheck(156, 179); // Married filing jointly
    } else if (filingStatus === "head_of_household") {
      drawCheck(330, 179); // Head of household
    }

    // Step 2: Multiple Jobs checkbox
    if (data.w4MultipleJobsCheckbox) {
      drawCheck(33, 282); // Two jobs checkbox
    }

    // Step 3: Claim Dependents
    // Qualifying children amount
    const qualifyingChildrenAmount = String(data.w4QualifyingChildrenAmount || "");
    if (qualifyingChildrenAmount) {
      drawText(qualifyingChildrenAmount, 540, 332, 10);
    }

    // Other dependents amount
    const otherDependentsAmount = String(data.w4OtherDependentsAmount || "");
    if (otherDependentsAmount) {
      drawText(otherDependentsAmount, 540, 348, 10);
    }

    // Total credits (line 3)
    const totalCredits = String(data.w4TotalCredits || "");
    if (totalCredits) {
      drawText(totalCredits, 540, 368, 10);
    }

    // Step 4: Other Adjustments
    // 4(a) Other income
    const otherIncome = String(data.w4OtherIncome || "");
    if (otherIncome) {
      drawText(otherIncome, 540, 410, 10);
    }

    // 4(b) Deductions
    const deductions = String(data.w4Deductions || "");
    if (deductions) {
      drawText(deductions, 540, 432, 10);
    }

    // 4(c) Extra withholding
    const extraWithholding = String(data.w4ExtraWithholding || "");
    if (extraWithholding) {
      drawText(extraWithholding, 540, 454, 10);
    }

    // Step 5: Signature and Date
    // Employee signature (we'll type the name as electronic signature)
    drawText(`${firstName} ${lastName}`, 100, 508, 10);

    // Date
    const signatureDate = String(data.w4SignatureDate || new Date().toISOString().split("T")[0]);
    drawText(signatureDate, 480, 508, 10);

    // Employers Only section
    // Employer's name and address
    drawText("Kairos Security LLC", 100, 545, 9);

    // First date of employment
    const startDate = String(data.scheduledStartDate || data.scheduleStartDate || "");
    if (startDate) {
      drawText(startDate, 320, 545, 9);
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Create a blob and download - convert Uint8Array to regular array buffer
    const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `W-4_${application.last_name}_${application.first_name}_2025.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating W-4 PDF:", error);
    alert("Error generating W-4 PDF. Please try again.");
  }
}
