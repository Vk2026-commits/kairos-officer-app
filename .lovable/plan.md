# Printed-Form-Style PDF Output

Right now the admin downloads are generated summaries: a list of labels and answers. Instead, every download should look like the real form, printed and filled in by hand — the actual Kairos and government paperwork with the applicant's answers sitting in the correct blanks and checkboxes.

## What we already have

The archive already in the project (`public/uploads/Re_Kairos_Security_Application.zip`) contains the official blank PDFs for the whole packet, and most of them are already fillable:

| Form | Pages | Fillable fields |
|---|---|---|
| I-9 (2026) | 4 | 133 |
| Direct Deposit Authorization | 2 | 42 |
| Emergency Contact | 2 | 27 |
| Receipt for Company Property | 2 | 49 |
| Employee Availability | 1 | 36 |
| W-4 / tax form | 4 | 34 |
| Handbook Ack., Confidentiality, Offer Letter, TrackTik, Temp Employment, Drug-Free | 1-2 each | 2-11 each |
| Personal Appearance, Attendance, Disciplinary, Drug Abuse, Social Media, TDI, Uniform Checklist, Schedule, Folder Checklist | 1-3 each | none (signature/date stamped on) |

Because the official blanks exist, we overlay the real documents rather than redraw them. Only the employment application (no blank PDF supplied) gets rebuilt in code to visually match a printed form.

## Approach

1. **Extract the blank templates** from the zip into the project (`public/forms/`) so they can be loaded at download time.
2. **Add `pdf-lib`** and build a filler utility that opens a template, writes values into its named fields, ticks checkboxes, flattens the result (so it looks printed, not editable), and returns the page bytes.
3. **Map every onboarding answer to its field** on the matching official form — one mapping file per document, driven by the actual field names in each PDF.
4. **Stamp the non-fillable policy pages** with the applicant's name, signature text, and date at the correct positions, so acknowledgement pages read as signed.
5. **Rebuild the employment application** as a page-accurate recreation: the same boxed layout, ruled lines, Yes/No checkboxes, education grid, employer history blocks, references table, and certification/signature block, with answers written into the blanks.
6. **Single combined download**: the admin's "Download PDF" merges all completed pages into one packet in the official order (00, 02, 04, 05, ...), exactly as it would be if printed and filled by hand. Keep a separate W-4 button.
7. Admin screen keeps its current summary cards — no inline form preview.

## Technical notes

- `pdf-lib` handles both template filling (`getForm().getTextField(...).setText(...)`, `getCheckBox(...).check()`) and page merging (`copyPages`), all client-side, so no edge function or storage round-trip is needed.
- Forms are flattened after filling so the output is non-editable and prints identically everywhere.
- Field names differ per PDF, so each document gets its own explicit map from onboarding data key to PDF field name; unmapped fields are left blank rather than guessed.
- Signature text is rendered in an italic/script-style font to read as a signature on the signature lines.
- Existing `generateApplicationPDF.ts` / `generateW4PDF.ts` are replaced by the new template-driven generators; `generateEmploymentApplicationPDF.ts` is rewritten as the layout-accurate recreation.
- Template PDFs total ~6 MB, so they load on demand from `public/forms/` rather than being bundled.

## Open item

If you have a blank PDF of the paper employment application, drop it in and we overlay that instead of recreating it — the result would then be an exact match.
