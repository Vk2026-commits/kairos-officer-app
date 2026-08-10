import { PDFDocument } from "pdf-lib";
import { appendDoc, downloadPdfBytes, fillTemplate, Stamp } from "./pdfFill";

export interface PacketApplication {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  date_of_birth?: string | null;
  ssn?: string | null;
  created_at: string;
  full_form_data: Record<string, unknown>;
}

type D = Record<string, unknown>;

const s = (d: D, key: string): string => {
  const val = d[key];
  if (val === undefined || val === null || typeof val === "boolean") return "";
  return String(val);
};
const b = (d: D, key: string): boolean => d[key] === true;

/** yyyy-mm-dd -> mm/dd/yyyy; anything else passed through */
const fmtDate = (raw?: string | null): string => {
  const val = (raw ?? "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val);
  if (m) return `${m[2]}/${m[3]}/${m[1]}`;
  return val;
};

const today = (created?: string) =>
  new Date(created ?? Date.now()).toLocaleDateString("en-US");

export async function generateOnboardingPacketPDF(
  app: PacketApplication
): Promise<void> {
  const d = (app.full_form_data ?? {}) as D;

  const first = s(d, "firstName") || app.first_name || "";
  const last = s(d, "lastName") || app.last_name || "";
  const mi = s(d, "middleInitial") || (app.middle_name ?? "");
  const fullName = [first, mi, last].filter(Boolean).join(" ");
  const address = s(d, "address") || (app.address ?? "");
  const city = s(d, "city") || (app.city ?? "");
  const state = (s(d, "state") || (app.state ?? "")).toUpperCase();
  const zip = s(d, "zipCode") || (app.zip_code ?? "");
  const cityStateZip = [city, state].filter(Boolean).join(", ") + (zip ? ` ${zip}` : "");
  const phone = s(d, "phone") || (app.phone ?? "");
  const email = s(d, "email") || (app.email ?? "");
  const ssn = s(d, "ssn") || (app.ssn ?? "");
  const ssnDigits = ssn.replace(/\D/g, "");
  const dob = fmtDate(s(d, "dateOfBirth") || (app.date_of_birth ?? ""));
  const signDate = today(app.created_at);
  const position = s(d, "position");

  const ackStamp = (label: string, extra: { label: string; value: string }[] = []): Stamp => ({
    lines: [
      { label: `${label}  Signature:`, value: fullName, signature: true },
      ...extra,
      { label: "Printed Name:", value: fullName },
      { label: "Date:", value: signDate },
    ],
  });

  const packet = await PDFDocument.create();
  packet.setTitle(`Onboarding Packet - ${last}, ${first}`);

  const add = async (
    path: string,
    spec: Parameters<typeof fillTemplate>[1] = {},
    stamps: Stamp[] = []
  ) => {
    try {
      const doc = await fillTemplate(path, spec, stamps);
      await appendDoc(packet, doc);
    } catch (err) {
      console.error(`Skipping ${path}`, err);
    }
  };

  // 00 - Employee folder checklist (reference page)
  await add("/forms/00-kairos-security-checklist-for-employee-folders.pdf", {}, [
    {
      lines: [
        { label: "Employee:", value: fullName },
        { label: "Date:", value: signDate },
      ],
    },
  ]);

  // 02 - Form I-9
  const citizenship = s(d, "citizenshipStatus");
  await add("/forms/02-i-9-2026.pdf", {
    text: {
      "Last Name (Family Name)": last,
      "First Name Given Name": first,
      "Employee Middle Initial (if any)": mi.slice(0, 1),
      "Employee Other Last Names Used (if any)": s(d, "otherLastNames"),
      "Address Street Number and Name": address,
      "Apt Number (if any)": s(d, "aptNumber"),
      "City or Town": city,
      State: state,
      "ZIP Code": zip,
      "Date of Birth mmddyyyy": dob,
      "US Social Security Number": ssnDigits,
      "Employees E-mail Address": email,
      "Telephone Number": phone,
      "Signature of Employee": fullName,
      "Today's Date mmddyyy": signDate,
      "3 A lawful permanent resident Enter USCIS or ANumber":
        citizenship === "permanent_resident" ? s(d, "uscisNumber") : "",
      "USCIS ANumber": citizenship === "authorized_alien" ? s(d, "uscisNumber") : "",
      "Form I94 Admission Number": s(d, "i94Number"),
      "Foreign Passport Number and Country of IssuanceRow1": [
        s(d, "foreignPassportNumber"),
        s(d, "countryOfIssuance"),
      ]
        .filter(Boolean)
        .join(" / "),
      "Exp Date mmddyyyy": fmtDate(s(d, "workAuthExpiration")),
    },
    checks: {
      CB_1: citizenship === "citizen",
      CB_2: citizenship === "noncitizen_national",
      CB_3: citizenship === "permanent_resident",
      CB_4: citizenship === "authorized_alien",
    },
    signatureFields: ["Signature of Employee"],
  });

  // 04 - Direct deposit authorization
  const accountType = s(d, "accountType");
  const depositType = s(d, "depositType");
  await add("/forms/04-direct-deposit-auth-form.pdf", {
    text: {
      "Company Name": "Kairos Security",
      "Employee Name": fullName,
      Date: signDate,
      "1  Bank NameCityState": s(d, "bankName"),
      "Account Number": s(d, "accountNumber"),
      "Routing #": s(d, "routingNumber"),
      "I wish to deposit": depositType === "partial" ? s(d, "depositAmount") : "",
    },
    checks: {
      Checking: accountType === "checking",
      Savings: accountType === "savings",
      "Entire Net Amount": depositType === "full",
    },
    drawAt: { "Employee Signature": fullName },
    signatureFields: ["Employee Signature"],
    draws: [
      { page: 1, x: 472, y: 346, text: ssnDigits.slice(0, 3), size: 9 },
      { page: 1, x: 508, y: 346, text: ssnDigits.slice(3, 5), size: 9 },
      { page: 1, x: 538, y: 346, text: ssnDigits.slice(5, 9), size: 9 },
    ],
  });

  // 05 - Emergency contact
  await add("/forms/05-emergency-contact-form-fill.pdf", {
    text: {
      "Employee Name": fullName,
      Address: address,
      Address_2: cityStateZip,
      "Phone Number": phone,
      "of which emergency personnel should be aware If yes please explain 1":
        s(d, "medicalInstructions"),
      Name: [s(d, "emergencyName1"), s(d, "emergencyRelationship1")]
        .filter(Boolean)
        .join(" - "),
      "Address 1": s(d, "emergencyAddress1"),
      "1": s(d, "emergencyPhone1"),
      "Alternate Phone Number": s(d, "emergencyAltPhone1"),
      Name_2: [s(d, "emergencyName2"), s(d, "emergencyRelationship2")]
        .filter(Boolean)
        .join(" - "),
      "Address 1_2": s(d, "emergencyAddress2"),
      "1_2": s(d, "emergencyPhone2"),
      "Alternate Phone Number_2": s(d, "emergencyAltPhone2"),
      "Doctors Name": s(d, "doctorName"),
      "Phone Number_2": s(d, "doctorPhone"),
      "Address 1_3": s(d, "doctorAddress"),
      Date: signDate,
    },
    drawAt: { "Employee signature": fullName },
    signatureFields: ["Employee signature"],
  });

  // 06 - Handbook acknowledgement
  await add("/forms/06-acknowledgement-of-handbook.pdf", {
    text: {
      "Printed Name": b(d, "handbookAcknowledged") ? fullName : "",
      Date: signDate,
    },
    drawAt: { "Employee signature": b(d, "handbookAcknowledged") ? fullName : "" },
    signatureFields: ["Employee signature"],
  });

  // 07 - Receipt of company property
  await add("/forms/07-receipt-company-property.pdf", {
    text: {
      Text1: fullName,
      Text2: fmtDate(s(d, "scheduledStartDate")) || signDate,
      Text3: s(d, "employeeIdNumber"),
      Text4: position || "Security",
      "QtyBuilding KeyCard": b(d, "receivedBuildingKey") ? "1" : "",
      "QtyIdentification Badge": b(d, "receivedIdBadge") ? "1" : "",
      "QtyMobile Device Enter service provider and model": b(d, "receivedMobileDevice")
        ? "1"
        : "",
      "QtyParking Pass": b(d, "receivedParkingPass") ? "1" : "",
      "QtyLaptop Computer Enter make and model": b(d, "receivedLaptop") ? "1" : "",
      "Other Enter Details": b(d, "receivedUniform") ? "Uniform issued" : "",
      "Other Enter Details_2": s(d, "propertyNotes"),
      "Printed Name": fullName,
      Date: signDate,
    },
    drawAt: { "Employee signature": fullName },
    signatureFields: ["Employee signature"],
  });

  // 09 - Confidentiality agreement
  await add("/forms/09-confidentialityagreement.pdf", {
    text: {
      "This Confidentiality Agreement the Agreement dated as of": signDate,
      "Print Name": b(d, "confidentialityAcknowledged") ? fullName : "",
      Title: position,
    },
    drawAt: { Signature: b(d, "confidentialityAcknowledged") ? fullName : "" },
    signatureFields: ["Signature"],
  });

  // 10 - Offer letter
  await add("/forms/10-offer-letter-per-hour.pdf", {
    text: {
      "Todays Date": signDate,
      "Employee Name": fullName,
      "Street Address": address,
      "City State ZIP": cityStateZip,
      undefined: s(d, "hourlyRate"),
      "Printed Name": b(d, "offerAccepted") ? fullName : "",
      Date: fmtDate(s(d, "scheduledStartDate")) || signDate,
      "Signature1_es_:signer:signature": b(d, "offerAccepted") ? fullName : "",
    },
    signatureFields: ["Signature1_es_:signer:signature"],
    checks: { "Check Box5": b(d, "offerAccepted") },
  });

  // 11 - TrackTik login sheet
  await add("/forms/11-track-tik-login-info-sheet.pdf", {
    draws: [
      { page: 0, x: 160, y: 792 - 328, text: s(d, "trackTikUsername"), size: 10 },
      {
        page: 0,
        x: 160,
        y: 792 - 350,
        text: b(d, "trackTikPasswordSet") ? "(set by employee)" : "",
        size: 10,
      },
      { page: 0, x: 160, y: 792 - 372, text: fullName, size: 10 },
    ],
  });

  // 12 - Temporary employment acknowledgement
  await add("/forms/12-temporary-employeement-acknowldgement.pdf", {
    text: {
      "Temporary Employees Signature Date": b(d, "temporaryEmploymentAcknowledged")
        ? `${fullName}   ${signDate}`
        : "",
    },
    signatureFields: ["Temporary Employees Signature Date"],
  });

  // 13 - Personal appearance (no fields: stamp acknowledgement)
  await add("/forms/13-personal-appearance.pdf", {}, [
    ackStamp(
      b(d, "personalAppearanceAcknowledged")
        ? "Acknowledged - Personal Appearance Policy."
        : "Not acknowledged."
    ),
  ]);

  // 14 - Attendance & punctuality
  await add("/forms/14-attendance-punctuality.pdf", {}, [
    ackStamp(
      b(d, "attendancePolicyAcknowledged")
        ? "Acknowledged - Attendance & Punctuality Policy."
        : "Not acknowledged."
    ),
  ]);

  // 15 - Disciplinary action
  await add("/forms/15-disciplinary-action.pdf", {}, [
    ackStamp(
      b(d, "disciplinaryPolicyAcknowledged")
        ? "Acknowledged - Disciplinary Action Policy."
        : "Not acknowledged."
    ),
  ]);

  // 16 - Drug abuse policy
  await add("/forms/16-drug-abuse.pdf", {}, [
    ackStamp(
      b(d, "drugAlcoholPolicyAcknowledged")
        ? "Acknowledged - Drug & Alcohol Policy."
        : "Not acknowledged."
    ),
  ]);

  // 17 - Drug-free workplace / testing consent
  await add("/forms/17-drug-free-policy.pdf", {
    text: {
      "Employees Name Printed": b(d, "drugTestConsentAcknowledged") ? fullName : "",
      "Employee Name": fullName,
      Date: signDate,
    },
  });

  // 18 - Employee availability
  await add("/forms/18-employee-availability.pdf", {
    text: {
      "Employee Name": fullName,
      Position: s(d, "availabilityPosition") || position,
      MONDAYFrom: s(d, "mondayFrom"),
      MONDAYTo: s(d, "mondayTo"),
      TUESDAYFrom: s(d, "tuesdayFrom"),
      TUESDAYTo: s(d, "tuesdayTo"),
      WEDNESDAYFrom: s(d, "wednesdayFrom"),
      WEDNESDAYTo: s(d, "wednesdayTo"),
      THURSDAYFrom: s(d, "thursdayFrom"),
      THURSDAYTo: s(d, "thursdayTo"),
      FRIDAYFrom: s(d, "fridayFrom"),
      FRIDAYTo: s(d, "fridayTo"),
      SATURDAYFrom: s(d, "saturdayFrom"),
      SATURDAYTo: s(d, "saturdayTo"),
      SUNDAYFrom: s(d, "sundayFrom"),
      SUNDAYTo: s(d, "sundayTo"),
      "NotesExplanations ex School MonFri 700am300pm": s(d, "availabilityNotes"),
      Date: signDate,
    },
    drawAt: { "Employee Signature": fullName },
    signatureFields: ["Employee Signature"],
  });

  // 20 - Job description
  await add("/forms/20-job-description.pdf", {}, [
    ackStamp(
      b(d, "jobDescriptionAcknowledged")
        ? "Acknowledged - Job Description."
        : "Not acknowledged.",
      position ? [{ label: "Position:", value: position }] : []
    ),
  ]);

  // 21 - Social & digital media code of conduct
  await add(
    "/forms/21-social-and-digital-media-code-of-conduct-for-your-organization.pdf",
    {},
    [
      ackStamp(
        b(d, "socialMediaPolicyAcknowledged")
          ? "Acknowledged - Social & Digital Media Code of Conduct."
          : "Not acknowledged."
      ),
    ]
  );

  // 22 - Texas Department of Insurance notice
  await add("/forms/22-texas-department-of-insurance.pdf", {}, [
    ackStamp(
      b(d, "workersCompNoticeAcknowledged")
        ? "Acknowledged - Workers' Compensation Notice."
        : "Not acknowledged.",
      [
        {
          label: "Retains common law rights:",
          value: b(d, "retainCommonLawRights") ? "Yes" : "No",
        },
      ]
    ),
  ]);

  // 23 - Uniform checklist
  const uniformItems: [string, string][] = [
    ["uniformLongSleeveShirt", "Long sleeve shirt"],
    ["uniformShortSleeveButtonUp", "Short sleeve button-up"],
    ["uniformShortSleeveShirt", "Short sleeve shirt"],
    ["uniformHighVisLongSleeve", "Hi-vis long sleeve"],
    ["uniformHighVisShortSleeve", "Hi-vis short sleeve"],
    ["uniformTie", "Tie"],
    ["uniformSilverBadge", "Silver badge"],
    ["uniformSilverSOs", "Silver SO's"],
    ["uniformPants", "Pants"],
    ["uniformBomberJacket", "Bomber jacket"],
    ["uniformJacket", "Jacket"],
    ["uniformBeanieHat", "Beanie hat"],
    ["uniformBaseballHat", "Baseball hat"],
    ["uniformFlashlight", "Flashlight"],
    ["uniformFlagPatch", "Flag patch"],
    ["uniformRadio", "Radio"],
    ["uniformIdBadge", "ID badge"],
  ];
  const issued = uniformItems.filter(([k]) => b(d, k)).map(([, label]) => label);
  await add("/forms/23-uniform-check-list.pdf", {}, [
    ackStamp(
      b(d, "uniformChecklistAcknowledged")
        ? "Acknowledged - Uniform Checklist."
        : "Not acknowledged.",
      [
        { label: "Items issued:", value: issued.join(", ") || "None selected" },
        {
          label: "Sizes:",
          value: [
            s(d, "uniformShirtSize") && `Shirt ${s(d, "uniformShirtSize")}`,
            s(d, "uniformPantsSize") && `Pants ${s(d, "uniformPantsSize")}`,
            s(d, "uniformShoeSize") && `Shoe ${s(d, "uniformShoeSize")}`,
          ]
            .filter(Boolean)
            .join("  |  "),
        },
      ]
    ),
  ]);

  // 24 - Work schedule
  const days: [string, string][] = [
    ["Mon", "scheduleMonday"],
    ["Tue", "scheduleTuesday"],
    ["Wed", "scheduleWednesday"],
    ["Thu", "scheduleThursday"],
    ["Fri", "scheduleFriday"],
    ["Sat", "scheduleSaturday"],
    ["Sun", "scheduleSunday"],
  ];
  const scheduleText = days
    .map(([label, key]) => {
      const from = s(d, `${key}From`);
      const to = s(d, `${key}To`);
      return from || to ? `${label} ${from}-${to}` : "";
    })
    .filter(Boolean)
    .join("   ");
  const postLocation = [
    s(d, "schedulePostAddress"),
    s(d, "schedulePostCity"),
    s(d, "schedulePostState"),
    s(d, "schedulePostZip"),
  ]
    .filter(Boolean)
    .join(", ");
  await add("/forms/24-kairos-schedule.pdf", {}, [
    ackStamp(
      b(d, "scheduleAcknowledged") ? "Acknowledged - Work Schedule." : "Not acknowledged.",
      [
        { label: "Post:", value: postLocation },
        { label: "Schedule:", value: scheduleText },
        { label: "Start date:", value: fmtDate(s(d, "scheduleStartDate")) },
      ]
    ),
  ]);

  // W-4
  await add("/forms/W-4_Form_2025.pdf", w4Spec(d, {
    first,
    mi,
    last,
    address,
    cityStateZip,
    ssn,
    signDate,
  }));

  const bytes = await packet.save();
  downloadPdfBytes(bytes, `Onboarding_Packet_${last}_${first}.pdf`);
}

type W4Ctx = {
  first: string;
  mi: string;
  last: string;
  address: string;
  cityStateZip: string;
  ssn: string;
  signDate: string;
};

export function w4Spec(d: D, ctx: W4Ctx) {
  const p1 = "topmostSubform[0].Page1[0]";
  const status = s(d, "w4FilingStatus");
  return {
    text: {
      [`${p1}.Step1a[0].f1_01[0]`]: [ctx.first, ctx.mi].filter(Boolean).join(" "),
      [`${p1}.Step1a[0].f1_02[0]`]: ctx.last,
      [`${p1}.Step1a[0].f1_03[0]`]: ctx.address,
      [`${p1}.Step1a[0].f1_04[0]`]: ctx.cityStateZip,
      [`${p1}.f1_05[0]`]: ctx.ssn,
      [`${p1}.Step3_ReadOrder[0].f1_06[0]`]: s(d, "w4QualifyingChildrenAmount"),
      [`${p1}.Step3_ReadOrder[0].f1_07[0]`]: s(d, "w4OtherDependentsAmount"),
      [`${p1}.f1_09[0]`]: s(d, "w4TotalCredits"),
      [`${p1}.f1_10[0]`]: s(d, "w4OtherIncome"),
      [`${p1}.f1_11[0]`]: s(d, "w4Deductions"),
      [`${p1}.f1_12[0]`]: s(d, "w4ExtraWithholding"),
      [`${p1}.f1_13[0]`]: "Kairos Security LLC",
      [`${p1}.f1_14[0]`]:
        fmtDate(s(d, "scheduledStartDate")) || fmtDate(s(d, "scheduleStartDate")),
    },
    checks: {
      [`${p1}.c1_1[0]`]: status === "single",
      [`${p1}.c1_1[1]`]: status === "married_jointly",
      [`${p1}.c1_1[2]`]: status === "head_of_household",
      [`${p1}.c1_2[0]`]: d["w4MultipleJobsCheckbox"] === true,
    },
    draws: [
      {
        page: 0,
        x: 130,
        y: 142,
        text: `${ctx.first} ${ctx.last}`.trim(),
        signature: true,
      },
      {
        page: 0,
        x: 500,
        y: 142,
        text: fmtDate(s(d, "w4SignatureDate")) || ctx.signDate,
        size: 10,
      },
    ],
  };
}
