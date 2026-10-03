# Bastion document ingestion and page review integration

## Scope and limits

Agency staff can prepare four editable page drafts from PDF text, pasted text or an explicitly selected fictional demo. This is a deterministic text extraction and template workflow, not a multimodal AI guarantee. It does not reconstruct arbitrary financial tables or verify disclosure accuracy. Use the existing PDF-to-HTML Results Centre for source-page comparison and detailed financial report work.

Real uploads never borrow demo figures, prior-period values, variances, executive quotations, biographies, sustainability targets or assurance statements. Candidate values carry source excerpts; missing categories remain clearly labelled editorial shells. A person must check every figure, period, unit and disclosure against the original source before approval. Known-company palettes are inferred defaults; the supplied site accent takes priority; other inferred styling should be reviewed in Design. Extraction supports selectable-text PDFs up to 25 MB and 200 pages; scanned PDFs need OCR elsewhere. A failed page aborts ingestion rather than silently returning a partial report. There is no claimed sub-second performance.

## Commercial access

`isAgencyUser` means a platform administrator without a client assignment. Only agency staff can call the ingestion and PDF conversion endpoints or use the corresponding creation controls. Client users retain access to Financial publications, delivered reports, source comparison, permitted edits and exact-version approvals. Pricing is a commercial decision, not a behaviour implemented by these endpoints.

## Document handover

The ingestion response captures existing page versions before parsing. Applying compares those captured versions in one transaction: a conflict on any page saves none of the pages. Assistant updates target existing pages only; agency staff can explicitly create report drafts or submit a handover. The assistant cannot publish. Successful application refreshes the editor version so subsequent manual saves work.

Submitting a page for review writes an exact-version request to `composition_reviews`. The client's Tasks & Approvals page displays the real queue, a rendered saved-page preview, the live baseline and exact section data. A different person with approval permission must approve the saved version. A publisher then publishes that same version from this queue. Later edits create a new draft and require resubmission and a new approval. The live snapshot remains available while edits and review are in progress. Direct editor publication, release bundles and MCP writes cannot bypass the handover review workflow.

If earlier experimental handovers exist without review metadata, reload and use **Save & submit for review** to create a traceable request. Review metadata is created lazily by the versioned save/review service; no client data is copied into another tenant.

## Wording review

The Compliance Guardian is a limited phrase scanner. It cannot certify JSE, King IV, ISSB, privacy or other legal compliance, or verify figures and assurance. Empty content is marked Not scanned. Financial, environmental and privacy findings provide human-review guidance and never insert invented evidence. Only neutral editorial tone suggestions have automatic patches. Applying those patches leaves evidence findings pending.

## Verification

Run `npm run test:editor`, `npm run test:security`, `npm run test:workspace`, `npm run test:results`, `npm run typecheck`, `npm run lint:ci` and a production build. Editor tests include actual SQLite transactions, tenant isolation, independent approval, stale-version rejection, approval invalidation, live-baseline preservation and source-integrity regressions.

`tests/e2e/test-end-to-end-complete.mjs` requires an explicitly isolated local preview and dedicated agency, reviewer and publisher fixture accounts supplied through environment variables. It creates only a synthetic uniquely named page, verifies the browser queue, approves and publishes that fixture. Never point it at customer or production data. Historical screenshots imported from the original PR are design references, not evidence of the corrected workflow.
