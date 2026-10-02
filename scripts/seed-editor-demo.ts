/** Complete fictional website for local CMS practice. Never overwrites an existing demo. */
import { createClient } from '@libsql/client';
import { COMPONENT_REGISTRY } from '../src/lib/studio/componentRegistry';
import type { SectionInstance, SectionStyles } from '../src/lib/studio/types';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.startsWith('file:')) throw new Error('Set DATABASE_URL to an explicit local file database. This demo does not run against production.');
const db = createClient({ url: databaseUrl });
const siteId = 'site_northstar_demo';
const clientId = 'client_apex_advisory';
const slug = 'northstar-demo';
const base = `/sites/${slug}`;
const url = (page: string) => page === 'home' ? base : `${base}/${page}`;
const navigation = ['home', 'about', 'services', 'projects', 'insights', 'contact'].map(page => ({ label: page === 'home' ? 'Home' : page[0].toUpperCase() + page.slice(1), href: url(page) }));
const photo = (id: string, width = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const building = photo('photo-1486406146926-c627a92ad1ab');
const meeting = photo('photo-1521737711867-e3b97375f902');
const light: SectionStyles = { theme: 'light', backgroundType: 'solid', backgroundColor: '#FFFFFF', headingColor: '#102A43', textColor: '#526777', accentColor: '#0D9488', paddingY: 'py-20' };
function block(page: string, key: string, componentId: string, props: Record<string, unknown>, variant?: string, styles: SectionStyles = light): SectionInstance {
  return { id: `${page}_${key}`, componentId, props: { ...structuredClone(COMPONENT_REGISTRY[componentId].defaultProps), ...props }, variant: variant || COMPONENT_REGISTRY[componentId].variants[0].id, styles: { ...styles }, visible: true };
}
const header = (page: string) => block(page, 'navigation', 'header', { brandName: 'NORTHSTAR', links: navigation, allLinks: navigation, ctaText: 'Let’s talk', ctaHref: url('contact') }, 'standard_glass', { theme: 'dark', backgroundColor: 'rgba(15, 23, 42, 0.88)', textColor: '#E2E8F0', brandTextColor: '#FFFFFF', accentColor: '#2DD4BF' });
const footer = (page: string) => block(page, 'footer', 'footer', { brandName: 'NORTHSTAR', tagline: 'Clear thinking. Lasting progress.', privacyHref: url('privacy'), termsHref: url('terms'), copyright: '© 2026 Northstar Advisory. Fictional Bastion demo website.', officeAddress: 'Demo Studio · Cape Town, South Africa', contactEmail: 'hello@northstar.example', contactPhone: '', columns: [{ title: 'Explore', links: navigation.map(link => ({ label: link.label, href: link.href })) }] }, 'multi_column', { theme: 'dark', backgroundColor: '#0F172A', textColor: '#CBD5E1', headingColor: '#F8FAFC', accentColor: '#2DD4BF' });
const hero = (page: string, title: string, subtitle: string, image = building) => block(page, 'hero', 'hero', { badge: 'NORTHSTAR ADVISORY · DEMO WEBSITE', title, subtitle, bgImage: image, primaryCta: { label: 'Explore our services', href: url('services') }, secondaryCta: { label: 'Meet the team', href: url('about') } }, 'editorial_split', { ...light, headingScale: 'compact', fontFamily: 'sans' });
const cta = (page: string) => block(page, 'cta', 'cta', { eyebrow: 'YOUR NEXT CHAPTER', title: 'Let’s turn your ambition into a clear plan.', description: 'Explore a conversation with our fictional advisory team. This complete demo is yours to edit and experiment with.', ctaText: 'Start a conversation', ctaHref: url('contact') }, undefined, { ...light, backgroundColor: '#F0FDFA' });
const services = (page: string) => block(page, 'services', 'services_grid', { eyebrow: 'WHAT WE DO', title: 'Clarity for the decisions that matter.', description: 'Practical advice that connects your strategy, operations, and people.', services: [
  { title: 'Business strategy', description: 'Set priorities, understand your market, and turn opportunities into a focused roadmap.', metrics: 'Strategy & direction', href: url('services') },
  { title: 'Operational transformation', description: 'Simplify processes and create better ways for your teams to work together.', metrics: 'Process & performance', href: url('services') },
  { title: 'Growth advisory', description: 'Explore new markets and shape a sustainable plan for your next stage of growth.', metrics: 'Markets & momentum', href: url('services') },
] });
const processSection = (page: string) => block(page, 'process', 'process', { eyebrow: 'OUR APPROACH', title: 'A thoughtful process. A practical outcome.', subtitle: 'A clear partnership from the first conversation to the next step.', steps: [
  { number: '01', icon: 'Compass', title: 'Listen', description: 'We start with your goals, context, and the challenges your team is facing.' },
  { number: '02', icon: 'Layers', title: 'Define', description: 'Together we agree the priorities, scope, and what success should look like.' },
  { number: '03', icon: 'Cpu', title: 'Build', description: 'We develop a practical roadmap and work alongside your team.' },
  { number: '04', icon: 'CheckCircle', title: 'Move forward', description: 'We review progress and equip your team to keep improving.' },
] });
const cases = (page: string) => block(page, 'projects', 'case_studies', { eyebrow: 'ILLUSTRATIVE PROJECTS', title: 'Ideas made useful.', caseStudies: [
  { headline: 'A clearer direction for a growing business', client: 'Fictional retail group', outcome: 'An illustrative strategy engagement aligning teams around a simpler customer proposition and a shared roadmap.', tag: 'Business strategy' },
  { headline: 'Bringing a distributed team together', client: 'Fictional technology company', outcome: 'An example operating model connecting decision-making, delivery, and internal communication.', tag: 'Operational transformation' },
  { headline: 'Preparing for the next market', client: 'Fictional professional services firm', outcome: 'A sample market-entry plan combining research, service positioning, and a phased launch approach.', tag: 'Growth advisory' },
] });
const faq = (page: string) => block(page, 'faq', 'faq', { eyebrow: 'GOOD QUESTIONS', title: 'Before we begin.', subtitle: 'A few helpful answers about working with our example advisory team.', items: [
  { question: 'How does an engagement start?', answer: 'We begin with a conversation about your goals and agree a focused scope together.' },
  { question: 'Can you work alongside our existing team?', answer: 'Yes. Our example approach is collaborative and designed around the people already in your business.' },
  { question: 'Is this a real company?', answer: 'No. Northstar Advisory, its people, projects, and testimonials are fictional sample content for testing Bastion’s CMS.' },
] });
const team = block('about', 'team', 'team', { eyebrow: 'FICTIONAL DEMO TEAM', title: 'People with perspective.', members: [
  { name: 'Alex Morgan', role: 'Strategy lead · fictional profile', bio: 'Helps teams connect their ambition to a clear set of priorities.', image: photo('photo-1560250097-0b93528c311a', 700) },
  { name: 'Sam Taylor', role: 'Transformation lead · fictional profile', bio: 'Focuses on practical improvements to how businesses work.', image: photo('photo-1573496359142-b8d87734a5a2', 700) },
  { name: 'Jordan Ellis', role: 'Growth lead · fictional profile', bio: 'Explores opportunities across services, customers, and markets.', image: photo('photo-1500648767791-00dcc994a43e', 700) },
] });
const testimonials = block('home', 'testimonials', 'testimonials', { eyebrow: 'ILLUSTRATIVE FEEDBACK', title: 'A better way to move forward.', subtitle: 'Fictional testimonials to help you test content editing.', items: [
  { quote: 'Our priorities became clearer, and our team had a practical starting point.', author: 'Demo client A', role: 'Managing director', company: 'Fictional retail group', rating: 5, verified: false },
  { quote: 'The process brought everyone into the conversation and turned ideas into next steps.', author: 'Demo client B', role: 'Operations director', company: 'Fictional technology company', rating: 5, verified: false },
] });
const insights = block('insights', 'articles', 'services_grid', { eyebrow: 'THE NORTHSTAR NOTEBOOK', title: 'Fresh perspectives on familiar challenges.', description: 'Example article summaries for editing headings, descriptions, links, and layouts.', services: [
  { title: 'Start with the decision, not the slide deck', description: 'Why clearer questions are often the first step toward a useful business strategy.', metrics: 'Strategy · Sample article', href: `${url('insights')}#insights_articles` },
  { title: 'Make change easier for the people doing it', description: 'A practical perspective on communication, ownership, and small improvements.', metrics: 'Transformation · Sample article', href: `${url('insights')}#insights_articles` },
  { title: 'A thoughtful approach to your next market', description: 'The questions to consider before expanding a service or entering a new region.', metrics: 'Growth · Sample article', href: `${url('insights')}#insights_articles` },
] });
const pages: Record<string, { title: string; sections: SectionInstance[] }> = {
  home: { title: 'Home', sections: [header('home'), hero('home', 'Clear thinking. Lasting progress.', 'Strategy and transformation for businesses ready to move forward.'), services('home'), processSection('home'), cases('home'), testimonials, cta('home'), footer('home')] },
  about: { title: 'About us', sections: [header('about'), hero('about', 'A partner for your next chapter.', 'We connect fresh perspective with practical action. Meet the fictional team behind Northstar.', meeting), block('about', 'story', 'rich_text', { quote: 'Good advice should make the next step clearer, not the conversation more complicated.', author: 'The Northstar philosophy', role: 'Fictional demo brand' }), team, cta('about'), footer('about')] },
  services: { title: 'Our services', sections: [header('services'), hero('services', 'Your ambition. A clearer path.', 'Explore our sample strategy, transformation, and growth practices.'), services('services'), processSection('services'), faq('services'), cta('services'), footer('services')] },
  projects: { title: 'Selected projects', sections: [header('projects'), hero('projects', 'From possibility to progress.', 'Illustrative projects showing how clear thinking can turn into practical outcomes.', meeting), cases('projects'), cta('projects'), footer('projects')] },
  insights: { title: 'Insights', sections: [header('insights'), hero('insights', 'A little perspective goes a long way.', 'Sample ideas on strategy, change, and growth for you to rewrite and refine.'), insights, faq('insights'), cta('insights'), footer('insights')] },
  privacy: { title: 'Demo privacy notice', sections: [header('privacy'), hero('privacy', 'Your privacy, in plain language.', 'This is an editable sample notice for a fictional demonstration website.'), block('privacy', 'notice', 'rich_text', { quote: 'This local demo has no analytics integration. Its contact form does not send messages. Replace this sample content with your own approved privacy notice before using a real client website.', author: 'Sample content for CMS practice', role: 'Not a real company policy' }), footer('privacy')] },
  terms: { title: 'Demo terms', sections: [header('terms'), hero('terms', 'A space to explore and experiment.', 'Sample website information for a fictional brand.'), block('terms', 'notice', 'rich_text', { quote: 'Northstar Advisory is a fictional example website. Its services, team profiles, projects, and testimonials are sample content. No real service or agreement is offered through this demo.', author: 'Bastion demonstration website', role: 'Editable sample content' }), footer('terms')] },
  contact: { title: 'Contact', sections: [header('contact'), hero('contact', 'Let’s start with a conversation.', 'Tell our fictional team what you are working toward. This page is a CMS practice space.', meeting), block('contact', 'form', 'contact_form', { title: 'What would you like to explore?', description: 'Demo form only. No message or email is sent. Use this section to edit the form’s heading, description, and button text.', submitButtonText: 'Try the demo form' }, 'centered_card'), faq('contact'), footer('contact')] },
};

async function main() {
  if (!(await db.execute({ sql: 'SELECT id FROM clients WHERE id = ?', args: [clientId] })).rows.length) throw new Error('The Apex demo client is missing. Run the local preview setup first.');
  if ((await db.execute({ sql: 'SELECT id FROM websites WHERE id = ? OR slug = ?', args: [siteId, slug] })).rows.length) { console.log('Northstar demo already exists; existing edits preserved.'); return; }
  const now = new Date().toISOString();
  const tx = await db.transaction('write');
  try {
    const settings = { tagline: 'Clear thinking. Lasting progress.', demo: true, navigation: { mainNav: navigation, primaryCta: { label: 'Let’s talk', href: url('contact') } }, footer: { copyright: 'Fictional demo website', columns: [] }, enabledModules: { servicesList: true, caseStudies: true } };
    await tx.execute({ sql: 'INSERT INTO websites(id,client_id,name,slug,blueprint_id,design_collection_id,status,settings_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)', args: [siteId, clientId, 'Northstar Advisory · Demo', slug, 'professional_services', 'contemporary', 'published', JSON.stringify(settings), now, now] });
    const token = (name: string, value: string) => ({ name, value, status: 'approved' });
    const colors = { primary: token('Midnight', '#102A43'), secondary: token('Slate', '#526777'), accent: token('Teal', '#0D9488'), background: token('White', '#FFFFFF'), surface: token('Cloud', '#F8FAFC'), textPrimary: token('Ink', '#102A43'), textMuted: token('Muted', '#526777'), hairline: token('Border', '#E2E8F0') };
    await tx.execute({ sql: 'INSERT INTO brand_kits(id,site_id,version,status,logos_json,colors_json,typography_json,component_rules_json,voice_and_messaging_json,locked_attributes_json,created_at,updated_at) VALUES(?,?,1,?,?,?,?,?,?,?,?,?)', args: ['brand_northstar_demo', siteId, 'approved', JSON.stringify({ primary: { url: '', status: 'approved' } }), JSON.stringify(colors), JSON.stringify({ headingFont: 'Inter', bodyFont: 'Inter', baseSize: 16, scaleRatio: 1.25 }), JSON.stringify({ radius: 'lg', buttonStyle: 'solid', shadows: 'subtle', imageryDirection: 'Modern workplaces and human collaboration' }), JSON.stringify({ toneOfVoice: 'Clear, thoughtful, confident. All content is fictional.', approvedFacts: ['Northstar is a fictional company for CMS practice.', 'All team profiles, projects and testimonials are illustrative.'], tagline: 'Clear thinking. Lasting progress.' }), '[]', now, now] });
    for (const [pageSlug, page] of Object.entries(pages)) {
      await tx.execute({ sql: 'INSERT INTO page_compositions(id,site_id,page_slug,title,layout_collection,sections_json,meta_json,version,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,1,?,?,?)', args: [`demo_northstar_${pageSlug}`, siteId, pageSlug, page.title, 'contemporary', JSON.stringify(page.sections), JSON.stringify({ description: `${page.title} — fictional Northstar Advisory demonstration website.`, demo: true }), 'published', now, now] });
    }
    await tx.commit();
    console.log(`Created Northstar demo: ${Object.keys(pages).length} pages, ${Object.values(pages).reduce((sum, page) => sum + page.sections.length, 0)} editable sections.`);
    console.log(`Editor: http://localhost:3012/admin/editor?siteId=${siteId}&pageSlug=home`);
    console.log(`Website: http://localhost:3012${base}`);
  } catch (error) { await tx.rollback(); throw error; } finally { tx.close(); }
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => db.close());
