import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .replace(/_/g, " ")
    .trim();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    console.log("Employment application from:", data.firstName, data.lastName);

    const formDataHtml = Object.entries(data.fullFormData || {})
      .map(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          return `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${formatFieldName(key)}</td><td style="padding:8px;border:1px solid #ddd;"><pre style="margin:0;white-space:pre-wrap;">${JSON.stringify(value, null, 2)}</pre></td></tr>`;
        }
        return `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">${formatFieldName(key)}</td><td style="padding:8px;border:1px solid #ddd;">${value ?? "N/A"}</td></tr>`;
      })
      .join("");

    const emailHtml = `<!DOCTYPE html><html><head><style>
      body{font-family:Arial,sans-serif;line-height:1.6;color:#333}
      .header{background-color:#4a1c1c;color:white;padding:20px;text-align:center}
      .content{padding:20px}
      .summary{background-color:#f5f5f5;padding:15px;border-radius:5px;margin-bottom:20px}
      table{width:100%;border-collapse:collapse;margin-top:20px}
      th{background-color:#4a1c1c;color:white;padding:10px;text-align:left}
      td{padding:8px;border:1px solid #ddd}
      tr:nth-child(even){background-color:#f9f9f9}
    </style></head><body>
      <div class="header">
        <h1>New Employment Application</h1>
        <p>Kairos Security - General Employment Application</p>
      </div>
      <div class="content">
        <div class="summary">
          <h2>Applicant Summary</h2>
          <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>Email:</strong> ${data.email || "Not provided"}</p>
          <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
          <p><strong>Position:</strong> ${data.jobAppliedFor || "Not specified"}</p>
          <p><strong>Application ID:</strong> ${data.id}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}</p>
        </div>
        <h2>Complete Application Details</h2>
        <table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>${formDataHtml}</tbody></table>
        <p style="margin-top:30px;color:#666;font-size:12px;">This application was submitted through the Kairos Security general employment application portal.</p>
      </div></body></html>`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Kairos Security Applications <applications@hiring.kairossecurity.com>",
        to: ["info@kairossecurity.com"],
        subject: `New Employment Application: ${data.firstName} ${data.lastName} - ${data.jobAppliedFor || "General"}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    if (!emailResponse.ok) throw new Error(emailResult.message || "Failed to send email");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
