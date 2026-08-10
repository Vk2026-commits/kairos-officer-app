import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";

export type FillSpec = {
  /** field name -> value for text fields / dropdowns */
  text?: Record<string, string | undefined>;
  /** field name -> true to tick the checkbox */
  checks?: Record<string, boolean | undefined>;
  /** field name -> value drawn on top of the widget (used for signature fields) */
  drawAt?: Record<string, string | undefined>;
  /** field names whose drawn value should use the signature font */
  signatureFields?: string[];
  /** absolute-positioned text (y measured from the bottom of the page) */
  draws?: {
    page?: number;
    x: number;
    y: number;
    text?: string;
    size?: number;
    signature?: boolean;
  }[];
};

export type Stamp = {
  /** which page of the template (0-based, negative counts from the end) */
  page?: number;
  lines: { label: string; value: string; signature?: boolean }[];
};

const clean = (val?: string | null): string => {
  if (val === undefined || val === null) return "";
  const s = String(val).trim();
  if (s === "undefined" || s === "null") return "";
  return s;
};

export async function loadTemplate(path: string): Promise<PDFDocument> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load form template: ${path}`);
  const bytes = await res.arrayBuffer();
  return PDFDocument.load(bytes, { ignoreEncryption: true, throwOnInvalidObject: false });
}

/**
 * Fills an official blank PDF's AcroForm fields, draws text on signature
 * widgets, stamps extra lines, then flattens so the result reads as a
 * printed-and-filled page.
 */
export async function fillTemplate(
  path: string,
  spec: FillSpec = {},
  stamps: Stamp[] = []
): Promise<PDFDocument> {
  const doc = await loadTemplate(path);
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const script = await doc.embedFont(StandardFonts.TimesRomanItalic);

  let form: ReturnType<PDFDocument["getForm"]> | null = null;
  try {
    form = doc.getForm();
  } catch {
    form = null;
  }

  if (form) {
    for (const [name, raw] of Object.entries(spec.text ?? {})) {
      const value = clean(raw);
      if (!value) continue;
      try {
        form.getTextField(name).setText(value);
        continue;
      } catch {
        /* not a text field */
      }
      try {
        const dd = form.getDropdown(name);
        dd.select(value);
      } catch {
        /* unknown field - skip rather than guess */
      }
    }

    for (const [name, on] of Object.entries(spec.checks ?? {})) {
      if (!on) continue;
      try {
        form.getCheckBox(name).check();
      } catch {
        try {
          const radio = form.getRadioGroup(name);
          const opts = radio.getOptions();
          if (opts.length) radio.select(opts[0]);
        } catch {
          /* unknown field */
        }
      }
    }

    // Draw on top of widgets (signature fields can't hold text)
    const sigSet = new Set(spec.signatureFields ?? []);
    for (const [name, raw] of Object.entries(spec.drawAt ?? {})) {
      const value = clean(raw);
      if (!value) continue;
      try {
        const field = form.getFieldMaybe?.(name) ?? form.getField(name);
        if (!field) continue;
        for (const widget of field.acroField.getWidgets()) {
          const rect = widget.getRectangle();
          const pageRef = widget.P();
          const page =
            doc.getPages().find((p) => p.ref === pageRef) ?? doc.getPages()[0];
          const useScript = sigSet.has(name);
          const size = Math.min(useScript ? 13 : 10, Math.max(7, rect.height - 4));
          page.drawText(value, {
            x: rect.x + 3,
            y: rect.y + Math.max(2, (rect.height - size) / 2),
            size,
            font: useScript ? script : helv,
            color: rgb(0, 0, 0),
          });
        }
      } catch {
        /* unknown field */
      }
    }

    try {
      form.flatten();
    } catch {
      try {
        // Fallback: strip the interactive layer so nothing renders as an
        // empty editable box.
        form.getFields().forEach((f) => {
          try {
            form?.removeField(f);
          } catch {
            /* ignore */
          }
        });
      } catch {
        /* ignore */
      }
    }
  }

  for (const draw of spec.draws ?? []) {
    const value = clean(draw.text);
    if (!value) continue;
    const pages = doc.getPages();
    const page = pages[Math.min(pages.length - 1, draw.page ?? 0)];
    page.drawText(value, {
      x: draw.x,
      y: draw.y,
      size: draw.size ?? (draw.signature ? 12 : 10),
      font: draw.signature ? script : helv,
      color: rgb(0, 0, 0),
    });
  }

  for (const stamp of stamps) {
    applyStamp(doc, stamp, helv, script);
  }

  return doc;
}

function applyStamp(
  doc: PDFDocument,
  stamp: Stamp,
  helv: PDFFont,
  script: PDFFont
) {
  const pages = doc.getPages();
  const idx =
    stamp.page === undefined
      ? pages.length - 1
      : stamp.page < 0
      ? pages.length + stamp.page
      : stamp.page;
  const page = pages[Math.max(0, Math.min(pages.length - 1, idx))];
  const { width } = page.getSize();

  const boxHeight = 16 + stamp.lines.length * 16;
  let y = 34 + (stamp.lines.length - 1) * 16;

  page.drawRectangle({
    x: 36,
    y: 24,
    width: width - 72,
    height: boxHeight,
    borderColor: rgb(0.55, 0.55, 0.55),
    borderWidth: 0.6,
    color: rgb(1, 1, 1),
    opacity: 1,
  });

  for (const line of stamp.lines) {
    page.drawText(line.label, {
      x: 44,
      y,
      size: 8,
      font: helv,
      color: rgb(0.35, 0.35, 0.35),
    });
    const labelWidth = helv.widthOfTextAtSize(line.label, 8);
    page.drawText(clean(line.value), {
      x: 48 + labelWidth,
      y: y - 1,
      size: line.signature ? 12 : 10,
      font: line.signature ? script : helv,
      color: rgb(0, 0, 0),
    });
    y -= 16;
  }
}

/** Copy every page of `src` into `target`. */
export async function appendDoc(target: PDFDocument, src: PDFDocument) {
  const pages = await target.copyPages(src, src.getPageIndices());
  pages.forEach((p) => target.addPage(p));
}

export function downloadPdfBytes(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
