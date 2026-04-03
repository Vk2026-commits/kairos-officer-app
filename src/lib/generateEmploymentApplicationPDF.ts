import { jsPDF } from "jspdf";

interface EmploymentAppData {
  // Licenses
  level2License?: boolean;
  level3License?: boolean;
  level4License?: boolean;
  emailAddress?: string;

  // Job
  jobAppliedFor?: string;
  todaysDate?: string;
  employmentType?: string;
  startDate?: string;

  // Personal
  lastName: string;
  firstName: string;
  middleName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;

  // Eligibility
  is18OrOlder?: string;
  ssn?: string;
  eligibleToWork?: string;
  appliedBefore?: string;
  appliedBeforeWhen?: string;
  employedHereBefore?: string;
  employedHereWhen?: string;
  convicted?: string;
  convictionDetails?: string;
  outsideEmployment?: string;
  outsideEmploymentDetails?: string;

  // Driving
  hasDriversLicense?: string;
  driversLicenseNumber?: string;
  licenseClass?: string;
  stateLicensedIn?: string;
  licenseSuspended?: string;
  licenseSuspendedDetails?: string;

  // Activities
  professionalActivities?: string;

  // Education
  highSchool?: string;
  highSchoolYears?: string;
  highSchoolDiploma?: string;
  highSchoolSubjects?: string;
  college?: string;
  collegeYears?: string;
  collegeDiploma?: string;
  collegeSubjects?: string;
  vocational?: string;
  vocationalYears?: string;
  vocationalDiploma?: string;
  vocationalSubjects?: string;

  skillsTraining?: string;
  machinesEquipment?: string;

  // Employers
  employer1?: Employer;
  employer2?: Employer;
  employer3?: Employer;
  employer4?: Employer;

  // Additional
  otherNamesUsed?: string;
  otherNames?: string;
  presentlyEmployed?: string;
  contactSuggestion?: string;
  everFired?: string;
  firedDetails?: string;

  // References
  reference1?: Reference;
  reference2?: Reference;
  reference3?: Reference;

  certificationAcknowledged?: boolean;
}

interface Employer {
  name?: string;
  address?: string;
  cityStateZip?: string;
  supervisor?: string;
  telephone?: string;
  jobTitle?: string;
  datesFrom?: string;
  datesTo?: string;
  payStart?: string;
  payFinal?: string;
  reasonForLeaving?: string;
}

interface Reference {
  name?: string;
  address?: string;
  phone?: string;
}

const v = (val?: string | boolean | null): string => {
  if (val === undefined || val === null || val === "") return "";
  if (typeof val === "boolean") return val ? "Yes" : "No";
  return String(val);
};

const yesNo = (val?: string): string => {
  if (!val) return "";
  return val === "yes" ? "☑ Yes  ☐ No" : "☐ Yes  ☑ No";
};

const check = (val?: boolean): string => val ? "☑" : "☐";

export function generateEmploymentApplicationPDF(data: EmploymentAppData): void {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 15; // margin
  const cw = pw - m * 2;
  let y = m;
  const lh = 5.5;

  const addPage = (needed: number = 20) => {
    if (y + needed > ph - m) {
      doc.addPage();
      y = m;
    }
  };

  const drawField = (label: string, value: string, x: number, width: number, yPos: number) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(label, x, yPos);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    const lines = doc.splitTextToSize(value || "", width - 2);
    doc.text(lines, x, yPos + 4);
    doc.setDrawColor(180);
    doc.line(x, yPos + 5, x + width, yPos + 5);
  };

  // === PAGE 1: HEADER ===
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("APPLICATION FOR EMPLOYMENT", pw / 2, y, { align: "center" });
  y += 8;

  // Licenses row
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Level 2: ${check(data.level2License)}  Level 3: ${check(data.level3License)}  Level 4: ${check(data.level4License)}`, m, y);
  y += 5;
  drawField("Email", v(data.emailAddress), m, cw, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("An Equal Opportunity Employer", pw / 2, y, { align: "center" });
  y += 6;

  // EEO text
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const eeo = "We do not discriminate on the basis of race, color, religion, national origin, sex, age, disability, or any other status protected by law or regulation. It is our intention that all qualified applicants be given equal opportunity and that selection decisions be based on job-related factors.";
  const eeoLines = doc.splitTextToSize(eeo, cw);
  doc.text(eeoLines, m, y);
  y += eeoLines.length * 3 + 3;

  // Instructions
  const instr = "Answer each question fully and accurately. No action can be taken on this application until you have answered all questions. Use blank paper if you do not have enough room on this application. PLEASE PRINT, except for signature on back of application.";
  doc.setFontSize(7);
  const instrLines = doc.splitTextToSize(instr, cw);
  doc.text(instrLines, m, y);
  y += instrLines.length * 3 + 4;

  // Box border for main content
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);

  // Job Applied For / Today's Date
  const halfW = cw / 2;
  drawField("Job Applied for", v(data.jobAppliedFor), m, halfW - 5, y);
  drawField("Today's Date", v(data.todaysDate), m + halfW, halfW, y);
  y += 10;

  // Employment type
  const et = data.employmentType;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`Are you seeking:  ${et === "full-time" ? "☑" : "☐"} Full-time   ${et === "part-time" ? "☑" : "☐"} Part-time   ${et === "temporary" ? "☑" : "☐"} Temporary`, m, y);
  drawField("When could you start work?", v(data.startDate), m + cw * 0.6, cw * 0.4, y - 3);
  y += 10;

  // Name row
  const nameW = cw / 4;
  drawField("Last Name", v(data.lastName), m, nameW, y);
  drawField("First Name", v(data.firstName), m + nameW, nameW, y);
  drawField("Middle Name", v(data.middleName), m + nameW * 2, nameW, y);
  drawField("Telephone Number", v(data.phone), m + nameW * 3, nameW, y);
  y += 10;

  // Address row
  drawField("Present Street Address", v(data.address), m, cw * 0.4, y);
  drawField("City", v(data.city), m + cw * 0.4, cw * 0.2, y);
  drawField("State", v(data.state), m + cw * 0.6, cw * 0.15, y);
  drawField("Zip Code", v(data.zipCode), m + cw * 0.75, cw * 0.25, y);
  y += 12;

  // Yes/No questions
  const ynRow = (question: string, answer?: string, subNote?: string) => {
    addPage(12);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(question, m, y);
    doc.text(yesNo(answer), pw - m - 30, y);
    y += lh;
    if (subNote) {
      doc.setFontSize(7);
      doc.text(subNote, m + 5, y);
      y += lh;
    }
  };

  ynRow("Are you 18 years of age or older?", data.is18OrOlder, "(If you are hired, you may be required to submit proof of age.)");

  // SSN
  drawField("Social Security #", v(data.ssn), m, cw * 0.3, y);
  y += 10;

  ynRow("If hired, can you furnish proof you are eligible to work in the U.S.?", data.eligibleToWork);
  
  ynRow("Have you ever applied here before?", data.appliedBefore);
  if (data.appliedBefore === "yes") {
    drawField("If yes, when?", v(data.appliedBeforeWhen), m + 5, cw * 0.5, y);
    y += 10;
  }

  ynRow("Were you ever employed here?", data.employedHereBefore);
  if (data.employedHereBefore === "yes") {
    drawField("If yes, when?", v(data.employedHereWhen), m + 5, cw * 0.5, y);
    y += 10;
  }

  ynRow("Have you ever been convicted of any law violation? (Include \"guilty\" or \"no contest.\" Exclude minor traffic.)", data.convicted);
  if (data.convicted === "yes") {
    drawField("If yes, give details", v(data.convictionDetails), m + 5, cw - 10, y);
    y += 10;
    doc.setFontSize(7);
    doc.text("(A conviction will not necessarily disqualify an applicant for employment.)", m + 5, y);
    y += lh;
  }

  ynRow("If employed, do you expect to be engaged in any additional business or employment outside of our job?", data.outsideEmployment);
  if (data.outsideEmployment === "yes") {
    drawField("If yes, give details", v(data.outsideEmploymentDetails), m + 5, cw - 10, y);
    y += 10;
  }

  // Driving
  addPage(30);
  ynRow("For Driving Jobs Only: Do you have a valid driver's license?", data.hasDriversLicense);
  if (data.hasDriversLicense === "yes") {
    drawField("Driver's License Number", v(data.driversLicenseNumber), m + 5, cw * 0.3, y);
    drawField("Class of License", v(data.licenseClass), m + cw * 0.35, cw * 0.2, y);
    drawField("State Licensed In", v(data.stateLicensedIn), m + cw * 0.6, cw * 0.3, y);
    y += 10;
  }
  ynRow("Have you had your driver's license suspended or revoked in the last 3 years?", data.licenseSuspended);
  if (data.licenseSuspended === "yes") {
    drawField("If yes, give details", v(data.licenseSuspendedDetails), m + 5, cw - 10, y);
    y += 10;
  }

  // Professional Activities
  addPage(20);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("List professional, trade, business or civic activities and offices held:", m, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  const actLines = doc.splitTextToSize(v(data.professionalActivities), cw - 5);
  doc.text(actLines, m + 2, y);
  doc.setDrawColor(180);
  doc.line(m, y + 1, m + cw, y + 1);
  y += Math.max(actLines.length * 4, 8) + 4;

  // Education Table
  addPage(40);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("LIST NAME AND ADDRESS OF SCHOOLS", m, y);
  y += 5;

  const eduCols = [cw * 0.25, cw * 0.3, cw * 0.15, cw * 0.15, cw * 0.15];
  const eduHeaders = ["School", "Name & Address", "Years", "Diploma/Degree", "Subjects"];
  const rh = 8;

  doc.setFillColor(230, 230, 230);
  doc.rect(m, y, cw, rh, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  let xPos = m;
  eduHeaders.forEach((h, i) => {
    doc.text(h, xPos + 2, y + 5.5);
    xPos += eduCols[i];
  });
  y += rh;

  const eduRows = [
    ["High School/GED", v(data.highSchool), v(data.highSchoolYears), v(data.highSchoolDiploma), v(data.highSchoolSubjects)],
    ["College/University", v(data.college), v(data.collegeYears), v(data.collegeDiploma), v(data.collegeSubjects)],
    ["Vocational/Technical", v(data.vocational), v(data.vocationalYears), v(data.vocationalDiploma), v(data.vocationalSubjects)],
  ];

  doc.setFont("helvetica", "normal");
  eduRows.forEach((row) => {
    xPos = m;
    doc.setDrawColor(200);
    row.forEach((cell, i) => {
      doc.rect(xPos, y, eduCols[i], rh);
      doc.setFontSize(7);
      doc.text(cell, xPos + 2, y + 5.5);
      xPos += eduCols[i];
    });
    y += rh;
  });
  y += 4;

  // Skills
  addPage(20);
  drawField("Skills or additional training related to the job", v(data.skillsTraining), m, cw, y);
  y += 12;
  drawField("Machines or equipment you can operate", v(data.machinesEquipment), m, cw, y);
  y += 12;

  // === PAGE 2: EMPLOYMENT HISTORY ===
  doc.addPage();
  y = m;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Employment History", pw / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const empInstr = "List names of employers in consecutive order with present or last employer listed first. Account for all periods of time including military service and any periods of unemployment. Note: A job offer may be contingent upon acceptable references from current and former employers.";
  const empLines = doc.splitTextToSize(empInstr, cw);
  doc.text(empLines, m, y);
  y += empLines.length * 3 + 4;

  const drawEmployer = (emp?: Employer) => {
    if (!emp) emp = {};
    addPage(40);
    const bh = 7;
    const leftW = cw * 0.45;
    const rightW = cw * 0.55;

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);

    // Row 1: Name / Job Title
    doc.rect(m, y, leftW, bh);
    doc.rect(m + leftW, y, rightW, bh);
    doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.text("NAME OF EMPLOYER", m + 1, y + 3);
    doc.text("JOB TITLE AND DUTIES", m + leftW + 1, y + 3);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(v(emp.name), m + 1, y + 6);
    doc.text(v(emp.jobTitle), m + leftW + 1, y + 6);
    y += bh;

    // Row 2: Address / Dates
    doc.rect(m, y, leftW, bh);
    doc.rect(m + leftW, y, rightW, bh);
    doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.text("ADDRESS", m + 1, y + 3);
    doc.text("DATES OF EMPLOYMENT (MO/YR)", m + leftW + 1, y + 3);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(v(emp.address), m + 1, y + 6);
    doc.text(`FROM: ${v(emp.datesFrom)}   TO: ${v(emp.datesTo)}`, m + leftW + 1, y + 6);
    y += bh;

    // Row 3: City / Pay
    doc.rect(m, y, leftW, bh);
    doc.rect(m + leftW, y, rightW, bh);
    doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.text("CITY, STATE, ZIP CODE", m + 1, y + 3);
    doc.text("PAY", m + leftW + 1, y + 3);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(v(emp.cityStateZip), m + 1, y + 6);
    doc.text(`START $${v(emp.payStart)}   FINAL $${v(emp.payFinal)}`, m + leftW + 1, y + 6);
    y += bh;

    // Row 4: Supervisor / Reason
    doc.rect(m, y, leftW * 0.6, bh);
    doc.rect(m + leftW * 0.6, y, leftW * 0.4, bh);
    doc.rect(m + leftW, y, rightW, bh);
    doc.setFontSize(6); doc.setFont("helvetica", "normal");
    doc.text("SUPERVISOR(S)", m + 1, y + 3);
    doc.text("TELEPHONE", m + leftW * 0.6 + 1, y + 3);
    doc.text("REASON FOR LEAVING", m + leftW + 1, y + 3);
    doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text(v(emp.supervisor), m + 1, y + 6);
    doc.text(v(emp.telephone), m + leftW * 0.6 + 1, y + 6);
    doc.text(v(emp.reasonForLeaving), m + leftW + 1, y + 6);
    y += bh + 4;
  };

  drawEmployer(data.employer1);
  drawEmployer(data.employer2);
  drawEmployer(data.employer3);
  drawEmployer(data.employer4);

  // Additional Info
  addPage(30);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Additional Information", pw / 2, y, { align: "center" });
  y += 8;

  ynRow("Have you worked or attended school under any other names?", data.otherNamesUsed);
  if (data.otherNamesUsed === "yes") {
    drawField("If yes, give names", v(data.otherNames), m + 5, cw - 10, y);
    y += 10;
  }

  ynRow("Are you presently employed?", data.presentlyEmployed);
  if (data.presentlyEmployed === "yes") {
    drawField("If yes, whom do you suggest we contact?", v(data.contactSuggestion), m + 5, cw - 10, y);
    y += 10;
  }

  ynRow("Have you ever been fired from a job or asked to resign?", data.everFired);
  if (data.everFired === "yes") {
    drawField("If yes, please explain", v(data.firedDetails), m + 5, cw - 10, y);
    y += 10;
  }

  // References
  addPage(30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("References", m, y);
  y += 5;

  const refCols = [cw * 0.35, cw * 0.4, cw * 0.25];
  doc.setFillColor(230, 230, 230);
  doc.rect(m, y, cw, 7, "F");
  doc.setFontSize(8);
  doc.text("Name", m + 2, y + 5);
  doc.text("Address", m + refCols[0] + 2, y + 5);
  doc.text("Phone", m + refCols[0] + refCols[1] + 2, y + 5);
  y += 7;

  [data.reference1, data.reference2, data.reference3].forEach((ref) => {
    if (!ref) ref = {};
    doc.setDrawColor(200);
    let rx = m;
    [v(ref.name), v(ref.address), v(ref.phone)].forEach((cell, i) => {
      doc.rect(rx, y, refCols[i], 7);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(cell, rx + 2, y + 5);
      rx += refCols[i];
    });
    y += 7;
  });
  y += 6;

  // Certification
  addPage(50);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("CERTIFICATION", pw / 2, y, { align: "center" });
  y += 5;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  const certText = [
    "I certify that all information provided in this employment application is true and complete. I understand that any false information or omission may disqualify me from further consideration for employment and may result in my dismissal if discovered at a later date.",
    "I authorize the investigation of any or all statements contained in this application. I also authorize, whether listed or not, any person, school, current employer, past employers and organizations to provide relevant information and opinions that may be useful in making a hiring decision.",
    "I understand I may be required to successfully pass a drug screening examination. I hereby consent to a pre- and/or post-employment drug screen as a condition of employment, if required.",
  ];

  certText.forEach((para) => {
    addPage(15);
    const pLines = doc.splitTextToSize(para, cw);
    doc.text(pLines, m, y);
    y += pLines.length * 3 + 2;
  });

  // Acknowledged
  y += 3;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Certification Acknowledged: ${data.certificationAcknowledged ? "☑ Yes" : "☐ No"}`, m, y);
  y += 10;

  // Signature line
  doc.setDrawColor(0);
  doc.line(m, y, m + 100, y);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Signature (Electronic)", m, y + 4);
  doc.line(pw - m - 40, y, pw - m, y);
  doc.text("Date", pw - m - 40, y + 4);
  doc.setFont("helvetica", "bold");
  doc.text(`${data.firstName} ${data.lastName}`, m, y - 2);
  doc.text(v(data.todaysDate), pw - m - 40, y - 2);

  const fileName = `Employment_Application_${data.lastName}_${data.firstName}.pdf`;
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
