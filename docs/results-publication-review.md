# Financial publication review

The converter handles investor presentations and financial booklets differently: presentations show original page artwork alongside the HTML transcription; financial booklets lead with HTML tables and commentary, with the original pages available for comparison below.

## Changes

- Preserve original PDF page imagery, including vector charts, using PDF.js's Node canvas factory. Previews are bounded to 40 pages, a 1400px longest edge and 8 MB of encoded imagery. Failures remain visible as extraction warnings; glyph extraction continues independently.
- Record source page numbers on publication blocks and extracted statements. Show incomplete-row warnings in the review workspace, with source page numbers.
- Default to the full-width HTML publication. Open the coding assistant on demand. Use left-aligned commentary, tabular and unbroken figures, accessible column/row headers, clear totals and responsive source visuals.
- Treat extracted website DNA as a suggestion. Allow manual brand creation and corrections to colours, typography and logo URL. Avoid social banners masquerading as logos, mid-grey body text and near-identical primary/accent colours.
- Mask encoded raster artwork before AI calls and restore it locally, so original page images do not consume model context. Sanitization rejects oversized transcription rather than silently truncating the publication and losing tables or its footer.

## Verification

`npm run test:results` is deterministic and covers synthetic documents plus the existing Merafe fixture: issuer/period, financial values, notes, current/prior columns, wrapped labels, figure edits, source-page artwork, unique region IDs and artwork survival during sanitization/local polishing. Enable the optional public-site integration check with `RESULTS_LIVE_BRAND_TEST=1`.

Both user-provided documents were converted locally: Standard Bank's six-page September 2026 overview and Merafe's 22-page year-ended December 2025 booklet. Drafts belong only to the isolated local review database. No supplied PDFs or generated page imagery are committed.

## Review boundaries

Source previews are faithful raster reproductions, not editable HTML charts. They do not prove that the transcription is complete or correct. Complex financial tables, restatements, periods, units and footnotes still require source comparison before publication. Existing extraction warnings remain visible. Fonts absent from the browser use fallback fonts; extracted proprietary font names do not imply permission to redistribute font files. The extractor reads public HTML and linked CSS; it does not claim pixel-perfect reconstruction of dynamically rendered corporate sites.
