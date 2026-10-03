# Financial report review and version history

The results studio separates the working draft from the live publication. Saving or restoring a draft keeps the approved live report available at the same URL.

## Workflow

1. An editor converts the PDF and saves any content or design changes.
2. The editor selects **Request review**. A reviewer opens the saved report from PDF to HTML's saved reports list.
3. The reviewer compares the whole publication against the PDF, checks the financial validation items, and records approval with optional notes.
4. A publisher checks the source-review acknowledgements and selects **Publish HTML**. The server requires approval of that exact saved version.

Editors can request review and restore versions. Reviewers can approve. Publishers can publish. Agency administrators have these permissions, but cannot approve a version they authored. This requires separate author and reviewer accounts; the interface does not impersonate a reviewer or automatically approve AI changes. Review requests are recorded in the report; this feature does not send notifications.

## Changes and recovery

- Content changes create a new version and require new approval. Saving identical content keeps the existing version and approval.
- **Version history** records author, saved time, review request, approval, reviewer notes, and the currently live version.
- **Preview** opens a sandboxed snapshot and a summary of differences from the saved draft.
- **Restore as draft** creates a new version, retains the original PDF evidence, and requires fresh approval. Save or discard unsaved changes before restoring.
- Version lists contain metadata only and load 50 entries at a time. Full snapshots load on demand; inline artwork is stored once per report and content hash.
- Existing reports start an honest history on their next save. The previous document is marked **Legacy baseline**, with no invented author or prior approval. Existing live reports remain live when edited.

Versioning, publication selection, and optimistic concurrency checks use database transactions. A stale request fails without adding a version or changing the live publication. Schema tables are created lazily alongside the existing results schema; no production data reset or separate reseeding is needed.

These review records are an operational audit trail, not cryptographically signed approvals or certification that extraction is financially complete. PDF comparison remains a human responsibility. Automated checks do not replace it.
