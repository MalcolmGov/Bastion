# Bastion GitHub operations

Agency staff open **GitHub & Operations** (`/admin/repositories`), choose a client website using the workspace switcher, and link its codebase. Corporate CMS users cannot access this page or its API.

## Configure the GitHub App

Create a GitHub App in the agency organisation. Request these **repository permissions**, all **read-only**:

- Metadata (GitHub requires this)
- Contents
- Pull requests
- Actions
- Deployments

Install it only on the repositories that Bastion supports. This release does not require OAuth, an OAuth callback, or webhooks. Each repository is verified against the configured App's installation before linking.

Set these secrets in the Bastion server environment (never `NEXT_PUBLIC_*`):

```
BASTION_GITHUB_APP_ID=<App ID from GitHub>
BASTION_GITHUB_APP_PRIVATE_KEY=<PEM signing key; actual newlines or escaped \n accepted>
BASTION_GITHUB_APP_SLUG=<public App slug for the installation button>
```

Store the key in your hosting secret manager; do not commit it. Restart/redeploy after configuring the environment. The existing developer OAuth/PAT import integration is separate and is not used for operations. There is no local CLI-token fallback.

## Connect a website

1. Select the correct corporate client and website.
2. Install the App on its repository using the installation link.
3. Enter `owner/repository` (or its HTTPS github.com URL).
4. Leave branch empty to verify the repository default, or supply a branch. Enter the exact GitHub deployment environment, e.g. `production`.
5. Click **Verify & link repository**.

The server verifies the installation, repository ID and branch. It stores a mapping per website and an audit event in a single transaction. Mapping revisions guard stale tabs; revisions are never reused after disconnect/relink. Disconnect only removes the mapping for that website; uninstall the App on GitHub to revoke repository permissions.

## Diagnostics and limits

The dashboard fetches the latest five commits, open PRs targeting the mapped branch, and Actions runs for that branch. It shows up to three deployment records for the configured environment and resolves their latest status. A deployment request is never interpreted as success without a status. Hosting providers must report deployments to GitHub for those records to appear.

Requests use short-lived installation tokens restricted to the mapped repository and read permissions. Tokens are server-only, never stored in the mappings or audit events, and never returned to the browser. GitHub requests have deadlines, no caching and no redirect following. Missing credentials, revoked installations, rate limits and missing permissions surface as unavailable status; no demo repository or fabricated success is returned. A revoked connection can still be managed/disconnected.

This is **read-only code pipeline diagnostics**, not a runtime-health guarantee. It does not read source files, execute code, create PRs, merge, deploy, or trigger the existing autonomous SRE engine. AI diagnosis and reviewed fix PRs are a later phase. Existing incident functionality is linked for context only. Runtime logs, error monitoring and uptime signals still need their own provider integration.

## Verification

`node --test tests/security/github-operations.test.cjs` runs real route handlers, guards, SQL and transactions against an in-memory SQLite database; GitHub responses are mocked. It checks access control, secret non-disclosure, JWT validity, permission scopes, repository verification, stale saves, disconnect/relink revisions, transaction rollback and partial failures.

Reference: https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app
