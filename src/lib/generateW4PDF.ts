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

    // Helper function to draw text (y from bottom of page)
    const drawText = (text: string, x: number, yFromBottom: number, size: number = 10, bold: boolean = false) => {
      if (!text || text === "undefined" || text === "null") return;
      firstPage.drawText(String(text), {
        x,
        y: yFromBottom,
        size,
        font: bold ? helveticaBold : helveticaFont,
        color: rgb(0, 0, 0),
      });
    };

    // Helper to draw an X inside a checkbox
    const drawCheck = (x: number, yFromBottom: number) => {
      const size = 8;
      firstPage.drawLine({
        start: { x: x + 1, y: yFromBottom + 1 },
        end: { x: x + size - 1, y: yFromBottom + size - 1 },
        thickness: 1.5,
        color: rgb(0, 0, 0),
      });
      firstPage.drawLine({
        start: { x: x + 1, y: yFromBottom + size - 1 },
        end: { x: x + size - 1, y: yFromBottom + 1 },
        thickness: 1.5,
        color: rgb(0, 0, 0),
      });
    };

    // Get data values
    const firstName = String(data.firstName || application.first_name || "");
    const middleInitial = String(data.middleInitial || application.middle_name || "");
    const lastName = String(data.lastName || application.last_name || "");
    const ssn = String(data.ssn || application.ssn || "");
    const address = String(data.address || application.address || "");
    const aptNumber = String(data.aptNumber || "");
    const city = String(data.city || application.city || "");
    const state = String(data.state || application.state || "");
    const zipCode = String(data.zipCode || application.zip_code || "");
    const filingStatus = String(data.w4FilingStatus || "single");

    // ========== STEP 1: Personal Information ==========
    // PDF coordinates: y increases from bottom, form is ~792 pts tall
    // Adjusted values - moved down by ~15-20 pts
    
    // (a) First name and middle initial - top left field box
    drawText(`${firstName} ${middleInitial}`.trim(), 100, height - 100, 10);
    
    // Last name - middle field box  
    drawText(lastName, 300, height - 100, 10);
    
    // (b) Social security number - right side
    drawText(ssn, 495, height - 100, 10);
    
    // Address line
    const fullAddress = aptNumber ? `${address}, ${aptNumber}` : address;
    drawText(fullAddress, 100, height - 122, 10);
    
    // City, State, ZIP
    drawText(`${city}, ${state} ${zipCode}`, 100, height - 145, 10);
    
    // (c) Filing status checkboxes
    // Single or Married filing separately - first checkbox
    if (filingStatus === "single") {
      drawCheck(100, height - 168);
    }
    // Married filing jointly - second checkbox
    if (filingStatus === "married_jointly") {
      drawCheck(100, height - 182);
    }
    // Head of household - third checkbox
    if (filingStatus === "head_of_household") {
      drawCheck(100, height - 196);
    }

    // ========== STEP 2: Multiple Jobs ==========
    // Checkbox for (c) two jobs total
    if (data.w4MultipleJobsCheckbox) {
      drawCheck(555, height - 385);
    }

    // ========== STEP 3: Claim Dependents ==========
    // Qualifying children amount - right side of first line
    const qualifyingChildrenAmount = String(data.w4QualifyingChildrenAmount || "");
    if (qualifyingChildrenAmount && qualifyingChildrenAmount !== "undefined") {
      drawText(qualifyingChildrenAmount, 530, height - 438, 10);
    }
    
    // Other dependents amount
    const otherDependentsAmount = String(data.w4OtherDependentsAmount || "");
    if (otherDependentsAmount && otherDependentsAmount !== "undefined") {
      drawText(otherDependentsAmount, 530, height - 453, 10);
    }
    
    // Line 3 total credits
    const totalCredits = String(data.w4TotalCredits || "");
    if (totalCredits && totalCredits !== "undefined") {
      drawText(totalCredits, 555, height - 477, 10);
    }

    // ========== STEP 4: Other Adjustments ==========
    // 4(a) Other income
    const otherIncome = String(data.w4OtherIncome || "");
    if (otherIncome && otherIncome !== "undefined") {
      drawText(otherIncome, 555, height - 520, 10);
    }
    
    // 4(b) Deductions
    const deductions = String(data.w4Deductions || "");
    if (deductions && deductions !== "undefined") {
      drawText(deductions, 555, height - 560, 10);
    }
    
    // 4(c) Extra withholding
    const extraWithholding = String(data.w4ExtraWithholding || "");
    if (extraWithholding && extraWithholding !== "undefined") {
      drawText(extraWithholding, 555, height - 585, 10);
    }

    // ========== STEP 5: Signature ==========
    // Employee signature
    drawText(`${firstName} ${lastName}`, 130, height - 650, 10);
    
    // Date
    const signatureDate = String(data.w4SignatureDate || new Date().toISOString().split("T")[0]);
    drawText(signatureDate, 510, height - 650, 10);

    // ========== EMPLOYERS ONLY ==========
    // Employer's name and address
    drawText("Kairos Security LLC", 130, height - 690, 9);
    
    // First date of employment
    const startDate = String(data.scheduledStartDate || data.scheduleStartDate || "");
    if (startDate && startDate !== "undefined") {
      drawText(startDate, 385, height - 690, 9);
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();

    // Create a blob and download
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
