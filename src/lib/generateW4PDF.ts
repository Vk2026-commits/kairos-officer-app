import { fillTemplate, downloadPdfBytes } from "./pdfFill";
import { w4Spec } from "./generateOnboardingPacketPDF";

interface Application {
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

const str = (val: unknown): string =>
  val === undefined || val === null || typeof val === "boolean" ? "" : String(val);

/** Fills the official IRS Form W-4 so it reads as a completed, signed form. */
export async function generateW4PDF(application: Application): Promise<void> {
  try {
    const data = application.full_form_data || {};

    const first = str(data.firstName) || application.first_name || "";
    const last = str(data.lastName) || application.last_name || "";
    const mi = str(data.middleInitial) || application.middle_name || "";
    const address = str(data.address) || application.address || "";
    const apt = str(data.aptNumber);
    const city = str(data.city) || application.city || "";
    const state = (str(data.state) || application.state || "").toUpperCase();
    const zip = str(data.zipCode) || application.zip_code || "";

    const doc = await fillTemplate(
      "/forms/W-4_Form_2025.pdf",
      w4Spec(data, {
        first,
        mi,
        last,
        address: apt ? `${address}, ${apt}` : address,
        cityStateZip: [city, state].filter(Boolean).join(", ") + (zip ? ` ${zip}` : ""),
        ssn: str(data.ssn) || application.ssn || "",
        signDate: new Date(application.created_at).toLocaleDateString("en-US"),
      })
    );

    const bytes = await doc.save();
    downloadPdfBytes(bytes, `W-4_${last}_${first}_2025.pdf`);
  } catch (error) {
    console.error("Error generating W-4 PDF:", error);
    alert("Error generating W-4 PDF. Please try again.");
  }
}
