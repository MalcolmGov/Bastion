import { sendTransactionalEmail } from '../src/lib/email/delivery';

async function main() {
  const recipient = process.argv[2] || 'malcolm@movedigital.africa';
  console.log(`--------------------------------------------------`);
  console.log(`🚀 BASTION LIVE RESEND EMAIL DELIVERY TEST`);
  console.log(`--------------------------------------------------`);
  console.log(`Recipient:       ${recipient}`);
  console.log(`RESEND_API_KEY:  ${process.env.RESEND_API_KEY ? 'PRESENT (length: ' + process.env.RESEND_API_KEY.length + ')' : 'MISSING'}`);
  console.log(`EMAIL_FROM:      ${process.env.EMAIL_FROM || '(using default)'}`);
  console.log(`--------------------------------------------------`);

  const result = await sendTransactionalEmail({
    to: recipient,
    subject: 'Bastion Platform — Live Resend Integration Verified',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #0b1019; color: #ffffff; border-radius: 12px; border: 1px solid #1c2638;">
        <h1 style="color: #6366f1; margin-bottom: 16px;">Bastion Platform</h1>
        <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1;">
          This is a verified live delivery test confirming that your <strong>Resend API Key</strong> is active and connected to the Bastion platform.
        </p>
        <div style="margin: 24px 0; padding: 16px; background: #131c2e; border-radius: 8px; border-left: 4px solid #10b981;">
          <p style="margin: 0; color: #10b981; font-weight: 600;">✓ Email Delivery Verified</p>
          <p style="margin: 4px 0 0 0; color: #94a3b8; font-size: 14px;">Timestamp: ${new Date().toISOString()}</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">
          Sent by Bastion Multi-Tenant Corporate Digital Experience Platform.
        </p>
      </div>
    `
  });

  console.log('Result payload:', JSON.stringify(result, null, 2));

  if (!result.ok) {
    console.error(`❌ Test email delivery failed: ${result.error}`);
    process.exit(1);
  }

  console.log(`✅ Success! Email delivered to ${recipient}.`);
  console.log(`Provider Message ID: ${result.providerMessageId}`);
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
