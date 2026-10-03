import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';

const base = process.env.BASTION_E2E_URL;
assert.equal(process.env.BASTION_E2E_ISOLATED, '1', 'Run only against a disposable fixture database.');
assert.ok(base && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base), 'Provide a local preview URL.');
const siteId = process.env.BASTION_E2E_SITE_ID;
assert.ok(siteId, 'Provide the fixture website ID.');
const browser = await chromium.launch({headless:true});
const contexts=[];
async function account(role) {
  const email=process.env[`BASTION_E2E_${role}_EMAIL`], password=process.env[`BASTION_E2E_${role}_PASSWORD`];
  assert.ok(email && password, `Provide a dedicated ${role} fixture account.`);
  const context=await browser.newContext({baseURL:base}); contexts.push(context);
  const login=await context.request.post('/api/admin/auth/login',{data:{email,password}});
  assert.equal(login.status(),200,`${role} login failed`);
  return context;
}
async function json(response,status=200) {const body=await response.json();assert.equal(response.status(),status,body.error);return body;}
try {
  const agency=await account('AGENCY'),reviewer=await account('REVIEWER'),publisher=await account('PUBLISHER');
  const slug=`e2e-review-${Date.now()}`;
  const title=`Synthetic review fixture ${slug}`;
  const sections=[{id:'synthetic-hero',componentId:'hero',visible:true,variant:'contemporary_bold',props:{title:'Synthetic approval fixture',subtitle:'Not a customer disclosure.'}}];
  const saved=await json(await agency.request.post('/api/admin/editor/assistant/apply',{data:{siteId,pages:[{pageSlug:slug,title,sections,expectedVersion:0}],options:{allowCreate:true,status:'in_review'}}}));
  const pageSave=saved.pages[0];
  const page=await reviewer.newPage(); await page.goto('/admin/tasks');
  await page.getByRole('heading',{name:'Website pages for review'}).waitFor();
  await page.getByRole('heading',{name:title,exact:true}).waitFor();
  await page.getByRole('link',{name:'Financial publications',exact:true}).waitFor();
  assert.equal(await page.getByRole('link',{name:'AI Ingest Report',exact:true}).count(),0);
  const queue=await json(await reviewer.request.get('/api/admin/editor/reviews'));
  assert.ok(queue.reviews.some(item=>item.id===pageSave.compositionId));
  await json(await agency.request.post('/api/admin/editor/reviews',{data:{id:pageSave.compositionId,expectedVersion:pageSave.version,action:'approve'}}),403);
  await json(await publisher.request.post('/api/admin/editor/reviews',{data:{id:pageSave.compositionId,expectedVersion:pageSave.version,action:'publish'}}),409);
  await json(await reviewer.request.post('/api/admin/editor/reviews',{data:{id:pageSave.compositionId,expectedVersion:pageSave.version,action:'approve'}}));
  await json(await publisher.request.post('/api/admin/editor/reviews',{data:{id:pageSave.compositionId,expectedVersion:pageSave.version,action:'publish'}}));
  const updated=await json(await agency.request.post('/api/admin/editor',{data:{siteId,pageSlug:slug,sections:[{...sections[0],props:{title:'Synthetic second draft'}}],expectedVersion:pageSave.version,status:'draft'}}));
  assert.equal(updated.version,pageSave.version+1);
  await json(await agency.request.post('/api/admin/editor',{data:{siteId,pageSlug:slug,sections,expectedVersion:updated.version,status:'published'}}),409);
  await json(await agency.request.post('/api/admin/editor',{data:{siteId,pageSlug:slug,title,sections,expectedVersion:updated.version,status:'in_review'}}));
  await page.goto('/admin/results');
  await page.getByRole('heading',{name:'Financial publications',exact:true}).waitFor();
  assert.equal(await page.getByRole('button',{name:'Merafe 2025 example',exact:true}).count(),0);
  console.log('PASS: browser queue, independent exact-version approval, publication and edit invalidation. Synthetic fixture remains only in the disposable database.');
} finally {for(const context of contexts)await context.close();await browser.close();}
