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

## Restatement extraction follow-up

Merafe's six missing-figure warnings were traced to intentional source blanks in previously/currently stated disclosures. Word hyphens are now distinguished from financial dashes; wrapped labels stay together; grouped year/state headings expand to their numeric and percentage columns. Source blanks are recorded separately from unrecognised missing values, and ordinary incomplete-table warnings remain active. Regression checks cover both parser statements and publication tables.

A separate source review item remains: on PDF page 18, the previously stated chrome revenue total is printed as 2 262 211 (R’000), while its two reported regional amounts, 506 580 and 1 755 641, add to 2 262 221. The converter preserves the printed amounts and total. This requires issuer/source review, not an automatic arithmetic correction.

## Safe design editing and source review

The workspace now compares a selected original PDF page with that page's actual HTML transcription. A separate confirmation is required before publishing; editing resets it. Front matter without a separate transcription remains explicitly identified. This is a human source check, not automated assurance that every PDF is accurate.

Design proposals require an explicit Apply action. Styling calls send the stylesheet and layout selectors rather than the full financial report or source imagery. Provider errors, timeouts, unusable replies, and changes to report text, table cells/structure or source artwork are rejected without a substitute edit. The built-in no-key mode is identified as stylesheet presets. Provider model IDs are transparent, without invented labels or silent model substitutions. Safe static SVG logos are rasterized to PNG before sanitization; active/external SVG content is excluded. Google Fonts stylesheet links survive saving, while arbitrary external stylesheets remain excluded.

Draft writes compare the loaded timestamp with the saved revision and use an atomic SQL condition to reject conflicts. Source evidence is retained from the stored draft. Tenant ownership, edit permission, publish permission, transcription consistency and source-review confirmation are checked on the server. A publisher without edit permission can publish the saved draft but cannot combine publishing with content changes.

CI runs the financial regression suite. App fonts use the existing runtime stylesheet and CSS fallbacks, removing the Next.js build's dependency on Google's font download service.
