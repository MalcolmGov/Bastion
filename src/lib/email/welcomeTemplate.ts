/**
 * Bastion Corporate CMS — Visual Welcome Email Template Generator
 * Generates an executive, responsive HTML email template for new CMS portal users.
 */

export interface WelcomeEmailOptions {
  recipientName: string;
  recipientEmail: string;
  roleTitle: string;
  clientName: string;
  clientInitials?: string;
  primaryColor?: string;
  loginUrl: string;
  temporaryPassword?: string;
  inviterName?: string;
}

export function generateWelcomeEmailHtml(options: WelcomeEmailOptions): string {
  let clientName = options.clientName || 'Bastion Group';
  if (clientName.toLowerCase().includes('moove')) {
    clientName = 'Bastion Group';
  }

  const recipientEmail = options.recipientEmail?.trim() || 'malcolm@movedigital.africa';
  const sanitizedClient = clientName.replace(/[^a-zA-Z0-9]/g, '') || 'Bastion';
  const {
    recipientName = 'Malcolm Govender',
    roleTitle = 'Platform Administrator',
    loginUrl: rawLoginUrl = 'http://localhost:3010/admin/login',
    temporaryPassword = options.temporaryPassword || `${sanitizedClient}2026!`,
    inviterName = 'Bastion Group Platform Operations'
  } = options;

  let loginUrl = rawLoginUrl.replace(/email=[^&]*/, `email=${encodeURIComponent(recipientEmail)}`);
  if (!loginUrl.includes('email=')) {
    loginUrl += `${loginUrl.includes('?') ? '&' : '?'}email=${encodeURIComponent(recipientEmail)}`;
  }

  const clientInitials = options.clientInitials || (clientName.toLowerCase().includes('bastion') ? 'BG' : clientName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase());
  const primaryColor = options.primaryColor || (clientName.toLowerCase().includes('gold') ? '#C99700' : clientName.toLowerCase().includes('bastion') ? '#B48C36' : '#2563EB');

  const currentYear = new Date().getFullYear();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to the ${clientName} Corporate CMS Portal</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #070B12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; padding: 12px !important; }
      .email-content { padding: 24px 18px !important; }
      .mobile-stack { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #070B12; color: #E2E8F0;">
  <!-- Preheader text (preview in email client) -->
  <div style="display: none; max-height: 0px; overflow: hidden;">
    Your enterprise CMS access for ${clientName} is ready. Access the corporate management portal operated by Bastion Group.
  </div>

  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #070B12;">
    <tr>
      <td align="center" style="padding: 40px 12px;">
        <!-- Email Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; width: 100%; background-color: #0D131F; border: 1px solid #1E2E44; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);">
          
          <!-- Top Accent Brand Line -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, ${primaryColor} 0%, #38BDF8 50%, ${primaryColor} 100%); line-height: 4px; font-size: 4px;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="padding: 32px 36px 24px; border-bottom: 1px solid #1A2636; background-color: #090E17;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td valign="middle">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="44" height="44" align="center" valign="middle" style="background-color: #131E2D; border: 1px solid ${primaryColor}66; border-radius: 10px; font-weight: bold; font-size: 15px; color: ${primaryColor}; letter-spacing: 1px; font-family: monospace;">
                          ${clientInitials}
                        </td>
                        <td style="padding-left: 14px;">
                          <div style="font-size: 15px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.5px; text-transform: uppercase;">
                            ${clientName}
                          </div>
                          <div style="font-size: 11px; color: #94A3B8; font-weight: 500; margin-top: 2px;">
                            ${clientName.toLowerCase().includes('bastion') ? 'Corporate Website Management Platform' : `Corporate Portal &bull; <span style="color: ${primaryColor};">Operated by Bastion Group</span>`}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="right" valign="middle">
                    <span style="font-size: 10px; font-family: monospace; font-weight: 600; padding: 4px 8px; border-radius: 6px; background-color: #131E2D; border: 1px solid #24354D; color: #38BDF8; text-transform: uppercase;">
                      CMS Access
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td class="email-content" style="padding: 36px 36px 20px;">
              <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: ${primaryColor}; margin-bottom: 8px;">
                Official Invitation &bull; Content Management
              </div>
              <h1 style="margin: 0 0 14px; font-size: 24px; font-weight: 800; color: #FFFFFF; line-height: 1.3; letter-spacing: -0.5px;">
                Welcome to your Corporate CMS Portal
              </h1>
              <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.6; color: #94A3B8;">
                Dear <strong style="color: #F1F5F9;">${recipientName}</strong>,<br><br>
                You have been provisioned official enterprise access to manage digital content, publication releases, and web platforms for <strong style="color: #FFFFFF;">${clientName}</strong>.
              </p>

              <!-- Credentials Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #070B12; border: 1px solid #1E293B; border-radius: 12px; margin-bottom: 26px;">
                <tr>
                  <td style="padding: 18px 22px;">
                    <div style="font-size: 10px; font-family: monospace; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #151D2A; padding-bottom: 6px;">
                      Your Account Provisioning Details
                    </div>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td width="35%" style="font-size: 12px; color: #64748B; padding: 4px 0;">Corporate Email:</td>
                        <td width="65%" style="font-size: 13px; font-weight: 600; color: #FFFFFF; font-family: monospace; padding: 4px 0;">${recipientEmail}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748B; padding: 4px 0;">Assigned Role:</td>
                        <td style="font-size: 13px; font-weight: 600; color: #38BDF8; padding: 4px 0;">${roleTitle}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748B; padding: 4px 0;">Initial Password:</td>
                        <td style="font-size: 12px; font-family: monospace; color: #FCD34D; background-color: #1A180E; padding: 3px 6px; border-radius: 4px; display: inline-block;">${temporaryPassword}</td>
                      </tr>
                      <tr>
                        <td style="font-size: 12px; color: #64748B; padding: 4px 0;">Provisioned By:</td>
                        <td style="font-size: 12px; color: #94A3B8; padding: 4px 0;">${inviterName}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Big Primary CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td align="center">
                    <a href="${loginUrl}" target="_blank" style="display: block; background: linear-gradient(135deg, ${primaryColor} 0%, #0284C7 100%); color: #000000; font-size: 14px; font-weight: 700; text-decoration: none; text-align: center; padding: 15px 32px; border-radius: 10px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 14px rgba(6, 182, 212, 0.3);">
                      Access Corporate CMS Portal &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- 3-Step Getting Started Section -->
              <div style="font-size: 12px; font-weight: 700; color: #E2E8F0; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                3 Steps to Get Started
              </div>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                <tr>
                  <td width="32" valign="top" style="padding-bottom: 12px;">
                    <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #131E2D; border: 1px solid #23344B; text-align: center; line-height: 22px; font-size: 11px; font-weight: bold; color: ${primaryColor};">1</div>
                  </td>
                  <td style="padding-bottom: 12px; font-size: 13px; color: #94A3B8; line-height: 1.5;">
                    <strong style="color: #FFFFFF;">Sign In:</strong> Log into <a href="${loginUrl}" style="color: #38BDF8; text-decoration: none;">${loginUrl}</a> using your email and initial password.
                  </td>
                </tr>
                <tr>
                  <td width="32" valign="top" style="padding-bottom: 12px;">
                    <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #131E2D; border: 1px solid #23344B; text-align: center; line-height: 22px; font-size: 11px; font-weight: bold; color: ${primaryColor};">2</div>
                  </td>
                  <td style="padding-bottom: 12px; font-size: 13px; color: #94A3B8; line-height: 1.5;">
                    <strong style="color: #FFFFFF;">Edit with Zero Code:</strong> Update website pages, publish announcements, or draft press releases with built-in AI writing assistance.
                  </td>
                </tr>
                <tr>
                  <td width="32" valign="top">
                    <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #131E2D; border: 1px solid #23344B; text-align: center; line-height: 22px; font-size: 11px; font-weight: bold; color: ${primaryColor};">3</div>
                  </td>
                  <td style="font-size: 13px; color: #94A3B8; line-height: 1.5;">
                    <strong style="color: #FFFFFF;">Instant One-Click Publish:</strong> Published changes sync live to the public website in under 500ms with complete JSE/NYSE audit protection.
                  </td>
                </tr>
              </table>

              <!-- Security & Compliance Safeguard -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0A1019; border: 1px solid #162232; border-radius: 8px; padding: 12px 16px;">
                <tr>
                  <td style="font-size: 11px; color: #64748B; line-height: 1.5;">
                    <strong style="color: #10B981;">&#x2714; Enterprise Governance:</strong> All edits are permanently logged with author timestamps, SHA-256 revision hashes, and two-person sign-off enforcement where required.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px 32px; border-top: 1px solid #1A2636; background-color: #070B12; text-align: center;">
              <p style="margin: 0 0 6px; font-size: 12px; color: #64748B;">
                ${clientName} Corporate Content Management Platform
              </p>
              <p style="margin: 0 0 12px; font-size: 11px; color: #475569;">
                Operated securely by Bastion Group. All rights reserved &copy; ${currentYear}.
              </p>
              <div style="font-size: 10px; color: #334155; font-family: monospace;">
                Portal URL: <a href="${loginUrl}" style="color: #475569; text-decoration: underline;">${loginUrl}</a> &bull; Support: support@bastiongroup.co.za
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Guarantee agency branding
  return html.replace(/Moove Digital/gi, 'Bastion Group');
}
