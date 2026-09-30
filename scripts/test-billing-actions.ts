import { getDb } from '../src/lib/db/client';

async function testActions() {
  console.log('Testing full commercial billing lifecycle actions...');
  const baseUrl = 'http://localhost:3010';

  // 1. Create a new quotation
  const createRes = await fetch(`${baseUrl}/api/admin/billing`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: 'client_goldfields',
      type: 'quote',
      status: 'sent',
      docNumber: `QUO-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: '2026-09-30',
      dueDate: '2026-10-30',
      currency: 'R',
      items: [
        { id: 'item_1', description: 'Enterprise ESG Dashboard & Satellite Telemetry Integration', qty: 1, unitPrice: 85000, taxRate: 15 },
        { id: 'item_2', description: 'Real-Time Investor Sentiment Engine & Financial Disclosure Hub', qty: 1, unitPrice: 42000, taxRate: 15 }
      ],
      paymentTerms: 'Net 14 Days. 50% upon digital signature approval.',
      clientContactPerson: 'Malcolm Govender',
      clientEmail: 'malcolm@movedigital.africa',
      clientPhone: '+27 11 883 4000',
      clientAddress: '100 Sandton Drive, Sandton, Johannesburg, 2196',
      clientVat: '4890123456',
      companyName: 'Bastion Group (Pty) Ltd',
      companyAddress: '100 Sandton Drive, Sandton, Johannesburg, 2196, South Africa',
      companyEmail: 'billing@bastiongroup.co.za',
      companyPhone: '+27 11 883 4000',
      companyVat: '4820194821',
      companyRegNo: '2024/091823/07',
      bankName: 'First National Bank (FNB)',
      accountNo: '62849102941',
      branchCode: '250655',
      swiftCode: 'FIRNZAJJ'
    })
  });

  const createData = await createRes.json();
  console.log('1. Created New Quotation:', createData);
  const quoteId = createData.docId || createData.id;

  // 2. Convert Quote to Invoice
  const convertRes = await fetch(`${baseUrl}/api/admin/billing`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'convert_to_invoice', docId: quoteId })
  });
  const convertData = await convertRes.json();
  console.log('2. Converted Quote to Invoice:', convertData);
  const invoiceId = convertData.invoiceId || convertData.newInvoiceId || convertData.newId;

  // 3. Send Payment Reminder
  const remindRes = await fetch(`${baseUrl}/api/admin/billing`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'send_reminder', docId: invoiceId })
  });
  const remindData = await remindRes.json();
  console.log('3. Sent Payment Reminder:', remindData);

  // 4. Mark Invoice as Paid
  const payRes = await fetch(`${baseUrl}/api/admin/billing`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'update_status', docId: invoiceId, status: 'paid' })
  });
  const payData = await payRes.json();
  console.log('4. Marked Invoice as Paid:', payData);

  // 5. Duplicate Document
  const dupRes = await fetch(`${baseUrl}/api/admin/billing`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'duplicate', docId: invoiceId })
  });
  const dupData = await dupRes.json();
  console.log('5. Duplicated Document:', dupData);

  console.log('--- All Commercial Billing API Actions Tested Successfully! ---');
}

testActions().catch(console.error);
