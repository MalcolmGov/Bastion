'use client';

import React, { useState } from 'react';
import {
  Building2,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  ShieldAlert,
  Send,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface OfficeInfo {
  id: string;
  name: string;
  region: string;
  address: string[];
  telephone: string;
  email: string;
  operationsCovered: string;
  officeHours: string;
}

const REGIONAL_OFFICES: OfficeInfo[] = [
  {
    id: 'sandton-hq',
    name: 'Corporate Headquarters (Sandton)',
    region: 'South Africa',
    address: [
      '150 Helen Road, Sandown',
      'Sandton, 2196, Gauteng',
      'South Africa',
    ],
    telephone: '+27 11 562 9700',
    email: 'southafrica@goldfields.com',
    operationsCovered: 'Global Corporate Executive, South Deep Mine',
    officeHours: 'Mon – Fri: 08:00 – 17:00 SAST',
  },
  {
    id: 'perth-au',
    name: 'Australia Regional Office (Perth)',
    region: 'Australia',
    address: [
      'Level 5, 50 Colin Street',
      'West Perth, WA 6005',
      'Australia',
    ],
    telephone: '+61 8 9211 9400',
    email: 'australia@goldfields.com',
    operationsCovered: 'Agnew, Granny Smith, Gruyere (50/50 JV), St Ives',
    officeHours: 'Mon – Fri: 08:30 – 17:00 AWST',
  },
  {
    id: 'accra-gh',
    name: 'Ghana Regional Office (Accra)',
    region: 'Ghana',
    address: [
      'Gold Fields Ghana Ltd',
      '7 Dr. Isert Street, North Ridge',
      'Accra, Ghana',
    ],
    telephone: '+233 302 770 189',
    email: 'ghana@goldfields.com',
    operationsCovered: 'Tarkwa Mine, Gold Fields Ghana Foundation',
    officeHours: 'Mon – Fri: 08:00 – 17:00 GMT',
  },
  {
    id: 'santiago-cl',
    name: 'Chile Regional Office (Santiago)',
    region: 'Chile (Americas)',
    address: [
      'Gold Fields Corona / Salares Norte',
      'Av. Vitacura 2670, Of. 1501, Las Condes',
      'Santiago, Chile',
    ],
    telephone: '+56 2 2434 2600',
    email: 'chile@goldfields.com',
    operationsCovered: 'Salares Norte Mine (Atacama)',
    officeHours: 'Mon – Fri: 08:30 – 17:30 CLT',
  },
  {
    id: 'lima-pe',
    name: 'Peru Regional Office (Lima)',
    region: 'Peru (Americas)',
    address: [
      'Gold Fields La Cima S.A.',
      'Av. Santo Toribio 143, Of. 601, San Isidro',
      'Lima 27, Peru',
    ],
    telephone: '+51 1 611 9700',
    email: 'peru@goldfields.com',
    operationsCovered: 'Cerro Corona Mine (Cajamarca)',
    officeHours: 'Mon – Fri: 08:30 – 17:30 PET',
  },
];

export default function ContactPage() {
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    category: 'Investor Relations',
    region: 'Corporate HQ (South Africa)',
    subject: '',
    message: '',
    consent: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form Validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name (minimum 2 characters).';
    }

    if (!formData.email.trim()) {
      errors.email = 'Please provide a valid contact email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.subject.trim() || formData.subject.trim().length < 3) {
      errors.subject = 'Please provide a subject line (minimum 3 characters).';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errors.message = 'Please provide a detailed inquiry (minimum 10 characters).';
    }

    if (!formData.consent) {
      errors.consent = 'You must acknowledge the demonstration prototype disclosure.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate clean brief submission handling
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleResetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      category: 'Investor Relations',
      region: 'Corporate HQ (South Africa)',
      subject: '',
      message: '',
      consent: false,
    });
    setFormErrors({});
    setIsSubmitted(false);
  };

  return (
    <div className="space-y-0">
      {/* ============================================================ */}
      {/* 1. HERO HEADER                                               */}
      {/* ============================================================ */}
      <section className="bg-navy py-16 px-6 text-white border-b border-navy-surface">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/30 border border-gold-mineral/40 text-gold-light text-xs font-semibold uppercase tracking-widest">
            <Building2 className="w-3.5 h-3.5 text-gold" />
            <span>Global Directory</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display">
            Contact Gold Fields
          </h1>

          <p className="text-sm sm:text-base text-mist/90 max-w-2xl leading-relaxed">
            Connect with our Sandton Corporate Headquarters, regional operational offices in Perth, Accra, Santiago, and Lima, investor relations, and media communications.
          </p>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. DIRECT CONTACT STRIP: IR, MEDIA, TRANSFER SECRETARIES    */}
      {/* ============================================================ */}
      <section className="bg-white border-b border-mist py-8 px-6 shadow-subtle">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Investor Relations */}
          <div className="p-5 rounded-2xl bg-editorial border border-mist shadow-subtle flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">
                Shareholder Enquiries
              </span>
              <h3 className="text-base font-bold text-navy">Investor Relations</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Thomas van den Berg &amp; Global Investor Relations Team. Results, earnings calls, and SENS filings.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-mist/80 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-ink">
                <Mail className="w-3.5 h-3.5 text-gold-dark" />
                <a href="mailto:investors@goldfields.com" className="font-semibold hover:underline">
                  investors@goldfields.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Phone className="w-3.5 h-3.5 text-ink-subtle" />
                <span>+27 11 562 9775</span>
              </div>
            </div>
          </div>

          {/* Media & Corporate Communications */}
          <div className="p-5 rounded-2xl bg-editorial border border-mist shadow-subtle flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">
                Press &amp; Publications
              </span>
              <h3 className="text-base font-bold text-navy">Media &amp; Public Affairs</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                Sven Lunsche &amp; Corporate Communications. Official releases, press kits, and interview requests.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-mist/80 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-ink">
                <Mail className="w-3.5 h-3.5 text-gold-dark" />
                <a href="mailto:media@goldfields.com" className="font-semibold hover:underline">
                  media@goldfields.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Phone className="w-3.5 h-3.5 text-ink-subtle" />
                <span>+27 11 562 9763</span>
              </div>
            </div>
          </div>

          {/* Transfer Secretaries & Registers */}
          <div className="p-5 rounded-2xl bg-editorial border border-mist shadow-subtle flex flex-col justify-between">
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gold-dark block">
                Share Registry &amp; Dividends
              </span>
              <h3 className="text-base font-bold text-navy">Transfer Secretaries</h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                JSE: Computershare Investor Services (Pty) Ltd. NYSE ADR: BNY Mellon Shareowner Services.
              </p>
            </div>
            <div className="pt-4 mt-3 border-t border-mist/80 space-y-1 text-xs">
              <div className="flex items-center gap-2 text-ink">
                <Mail className="w-3.5 h-3.5 text-gold-dark" />
                <a href="mailto:web.queries@computershare.co.za" className="font-semibold hover:underline">
                  web.queries@computershare.co.za
                </a>
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Phone className="w-3.5 h-3.5 text-ink-subtle" />
                <span>SA: 0861 100 933 | US: +1 888 269 2377</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. REGIONAL OFFICES DIRECTORY                                */}
      {/* ============================================================ */}
      <section className="py-20 px-6 bg-editorial">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block mb-2">
              Corporate Presence
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">
              Regional Offices Directory
            </h2>
            <p className="text-sm text-ink-muted mt-2">
              Operating hub addresses, telephone lines, and jurisdiction contacts across South Africa, Australia, Ghana, Chile, and Peru.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REGIONAL_OFFICES.map((office) => (
              <div
                key={office.id}
                className="p-6 rounded-2xl bg-white border border-mist shadow-subtle flex flex-col justify-between hover:shadow-card transition-shadow"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-mist">
                    <span className="px-2.5 py-1 rounded bg-navy text-white text-[10px] font-bold uppercase tracking-wider">
                      {office.region}
                    </span>
                    <span className="text-[11px] text-ink-muted">Official Hub</span>
                  </div>

                  <h3 className="text-lg font-bold text-navy leading-snug">
                    {office.name}
                  </h3>

                  {/* Physical Address */}
                  <div className="text-xs text-ink-muted space-y-0.5">
                    {office.address.map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>

                  {/* Operational Scope */}
                  <div className="p-3 bg-editorial rounded-lg border border-mist text-xs text-ink-muted">
                    <strong className="text-navy block text-[11px] mb-0.5">Operations:</strong>
                    <span>{office.operationsCovered}</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-mist space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-ink">
                    <Phone className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                    <span className="font-semibold">{office.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-ink-muted">
                    <Mail className="w-3.5 h-3.5 text-gold-dark shrink-0" />
                    <a href={`mailto:${office.email}`} className="hover:underline">
                      {office.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-ink-subtle text-[11px]">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{office.officeHours}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. VALIDATED DEMONSTRATION CONTACT FORM                     */}
      {/* ============================================================ */}
      <section className="py-20 px-6 bg-white border-t border-mist">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gold-dark block">
              Enquiry Portal
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-navy">
              Send a Demonstration Message
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted">
              Submit stakeholder feedback, investor inquiries, or media requests. Validation rules ensure adherence to corporate intake protocols.
            </p>
          </div>

          {/* Form Body or Completion Banner */}
          {isSubmitted ? (
            <div className="p-8 sm:p-10 rounded-2xl bg-editorial border-2 border-gold-mineral/50 shadow-card text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-forest-light text-forest mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-lg mx-auto">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gold-light text-gold-dark border border-gold/40 inline-block">
                  Prototype Status
                </span>
                <h3 className="text-2xl font-bold text-navy">
                  Demo complete — nothing has been sent.
                </h3>
                <p className="text-xs text-ink-muted leading-relaxed">
                  This Gold Fields website is an evaluation concept prototype. No form payload has been dispatched or transmitted to Gold Fields Limited servers.
                </p>
                <div className="p-4 bg-white rounded-xl border border-mist text-left text-xs text-ink-muted space-y-1 mt-4">
                  <p><strong className="text-navy">Simulated Recipient:</strong> {formData.category} ({formData.region})</p>
                  <p><strong className="text-navy">Sender:</strong> {formData.fullName} ({formData.email})</p>
                  <p><strong className="text-navy">Subject:</strong> {formData.subject}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleResetForm}
                  className="px-6 py-3 rounded-lg bg-navy hover:bg-navy-light text-white font-bold text-xs transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Submit Another Enquiry</span>
                </button>

                <a
                  href="mailto:investors@goldfields.com"
                  className="px-6 py-3 rounded-lg bg-white hover:bg-mist text-ink font-semibold text-xs border border-mist transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Email Official IR Directly</span>
                  <ExternalLink className="w-3.5 h-3.5 text-ink-muted" />
                </a>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="p-8 sm:p-10 rounded-2xl bg-editorial border border-mist shadow-card space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-bold text-navy mb-1.5">
                    Full Name <span className="text-amber-700">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="e.g. Elena Rostova"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className={`w-full text-xs bg-white rounded-lg border px-3.5 py-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-gold-mineral ${
                      formErrors.fullName ? 'border-amber-600 bg-amber-50/20' : 'border-mist'
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-navy mb-1.5">
                    Email Address <span className="text-amber-700">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="e.g. elena@institution.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className={`w-full text-xs bg-white rounded-lg border px-3.5 py-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-gold-mineral ${
                      formErrors.email ? 'border-amber-600 bg-amber-50/20' : 'border-mist'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{formErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Enquiry Category */}
                <div>
                  <label htmlFor="category" className="block text-xs font-bold text-navy mb-1.5">
                    Enquiry Category <span className="text-amber-700">*</span>
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full text-xs bg-white rounded-lg border border-mist px-3.5 py-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-gold-mineral"
                  >
                    <option value="Investor Relations">Investor Relations &amp; Financial Results</option>
                    <option value="Media & Press">Media &amp; Corporate Communications</option>
                    <option value="Suppliers & Procurement">Suppliers &amp; Procurement Tenders</option>
                    <option value="Careers & HR">Careers &amp; Recruitment Verification</option>
                    <option value="Sustainability & ESG">Sustainability, Climate &amp; Decarbonization</option>
                    <option value="Community & Stakeholders">Host Community Inquiries</option>
                    <option value="General Corporate">General Corporate Governance</option>
                  </select>
                </div>

                {/* Region / Mine */}
                <div>
                  <label htmlFor="region" className="block text-xs font-bold text-navy mb-1.5">
                    Region or Operation of Interest
                  </label>
                  <select
                    id="region"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                    className="w-full text-xs bg-white rounded-lg border border-mist px-3.5 py-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-gold-mineral"
                  >
                    <option value="Corporate HQ (South Africa)">Sandton Corporate HQ (South Africa)</option>
                    <option value="South Deep Mine (South Africa)">South Deep Mine (South Africa)</option>
                    <option value="Australia Region">Australia Region (Perth / Agnew / St Ives / Granny Smith / Gruyere)</option>
                    <option value="Ghana (Tarkwa)">Ghana Region (Tarkwa Mine)</option>
                    <option value="Chile (Salares Norte)">Chile (Salares Norte Mine)</option>
                    <option value="Peru (Cerro Corona)">Peru (Cerro Corona Mine)</option>
                    <option value="Canada (Windfall)">Canada (Windfall Project JV)</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-navy mb-1.5">
                  Subject Line <span className="text-amber-700">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Summary of inquiry or disclosure request..."
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className={`w-full text-xs bg-white rounded-lg border px-3.5 py-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-gold-mineral ${
                    formErrors.subject ? 'border-amber-600 bg-amber-50/20' : 'border-mist'
                  }`}
                />
                {formErrors.subject && (
                  <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.subject}</span>
                  </p>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-xs font-bold text-navy mb-1.5">
                  Message <span className="text-amber-700">*</span>
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="Detail your question, reporting reference, or commercial inquiry..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className={`w-full text-xs bg-white rounded-lg border px-3.5 py-2.5 text-ink focus:outline-none focus:ring-1 focus:ring-gold-mineral ${
                    formErrors.message ? 'border-amber-600 bg-amber-50/20' : 'border-mist'
                  }`}
                />
                {formErrors.message && (
                  <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.message}</span>
                  </p>
                )}
              </div>

              {/* Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consent}
                    onChange={(e) =>
                      setFormData({ ...formData, consent: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-mist text-navy focus:ring-gold-mineral"
                  />
                  <span className="text-xs text-ink-muted leading-relaxed">
                    I understand this website is an evaluation concept prototype and that submitting this form will conclude with a verified &ldquo;Demo complete — nothing has been sent&rdquo; notice.
                  </span>
                </label>
                {formErrors.consent && (
                  <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{formErrors.consent}</span>
                  </p>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-between">
                <span className="text-[11px] text-ink-subtle">
                  * All fields marked with an asterisk are required
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg bg-gold hover:bg-gold-light text-navy-dark font-bold text-xs shadow-card transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Validating Form...</span>
                  ) : (
                    <>
                      <span>Submit Demonstration Message</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. SPEAK UP ANONYMOUS REPORTING INTEGRATION                  */}
      {/* ============================================================ */}
      <section className="py-16 px-6 bg-navy-dark text-white border-t border-navy-surface">
        <div className="max-w-7xl mx-auto">
          <div className="bg-navy rounded-3xl border border-mist/15 p-8 sm:p-10 shadow-elevated flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-dark/30 border border-gold-mineral/40 text-gold-light text-xs font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-gold" />
                <span>Speak Up Whistleblowing Program</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Confidential &amp; Anonymous Whistleblowing
              </h2>
              <p className="text-xs sm:text-sm text-mist/90 leading-relaxed">
                Do not use general contact forms to report fraud, bribery, safety violations, harassment, or unethical conduct. Use our independent, 24/7 hotline service administered by EthicsPoint. All reports are confidential and protected by our strict non-retaliation governance.
              </p>
            </div>

            <div className="shrink-0 space-y-3">
              <a
                href="https://secure.ethicspoint.eu/domain/media/en/gui/114521/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-navy-dark font-bold text-xs shadow-card transition-all flex items-center justify-center gap-2"
              >
                <span>Access Speak Up Secure Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <span className="text-[11px] text-mist/60 block text-center">
                South Africa Hotline: 0800 203 712 (Toll-free)
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
