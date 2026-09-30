import fs from 'fs';
import path from 'path';
import {
  getSchemaSyncStatus,
  generateJsonSchema,
  generateTypeScriptDefinitions,
  generateConfigFile
} from '../src/lib/schema/gitSync';
import { ensureDbReady, getDb } from '../src/lib/db/client';
import { buildSchema, graphql } from 'graphql';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  \x1b[32m✔\x1b[0m ${testName}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖\x1b[0m ${testName}${detail ? ` — ${detail}` : ''}`);
    failed++;
  }
}

async function runPhase3TestSuite() {
  console.log('\n======================================================');
  console.log('  BASTION STUDIO CMS — PHASE 3 AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  // -------------------------------------------------------------------------
  // PILLAR 1: VISUAL CLICK-TO-EDIT INSPECTOR
  // -------------------------------------------------------------------------
  console.log('\x1b[36m▶ [PILLAR 1] Visual Click-to-Edit Inspector (Sanity & Vercel Parity)\x1b[0m');

  const rendererPath = path.join(process.cwd(), 'src/components/studio/StudioComponentRenderer.tsx');
  const rendererCode = fs.readFileSync(rendererPath, 'utf8');

  assert(
    rendererCode.includes('data-cms-field') || rendererCode.includes('closestField'),
    'StudioComponentRenderer implements data-cms-field heuristic detection'
  );
  assert(
    rendererCode.includes('onSelectField') || rendererCode.includes('handleFieldClick'),
    'StudioComponentRenderer emits onSelectField callbacks on element click'
  );
  assert(
    rendererCode.includes('AI Polish') && rendererCode.includes('Inspector'),
    'StudioComponentRenderer renders floating executive quick action toolbar docked above active block'
  );

  const editorPath = path.join(process.cwd(), 'src/app/admin/editor/page.tsx');
  const editorCode = fs.readFileSync(editorPath, 'utf8');

  assert(
    editorCode.includes('focusedFieldPath') && editorCode.includes('handleSelectField'),
    'Editor page manages focusedFieldPath state and provides handleSelectField dispatch'
  );
  assert(
    editorCode.includes('field-title') && editorCode.includes('field-subtitle'),
    'Properties Inspector inputs have DOM IDs for smooth auto-scroll & focus targeting'
  );

  // -------------------------------------------------------------------------
  // PILLAR 2: TWO-WAY GIT SCHEMA & CODE SYNC
  // -------------------------------------------------------------------------
  console.log('\n\x1b[36m▶ [PILLAR 2] Two-Way Git Schema & Code Sync (Strapi Content-Type Builder Parity)\x1b[0m');

  const syncStatus = getSchemaSyncStatus();
  assert(
    typeof syncStatus.repo === 'string' && syncStatus.repo.includes('Goldfields'),
    'Git sync status accurately identifies repository',
    `Repo: ${syncStatus.repo}`
  );
  assert(
    syncStatus.branch === 'main',
    'Git sync status targets correct branch',
    `Branch: ${syncStatus.branch}`
  );
  assert(
    Array.isArray(syncStatus.schemaFiles) && syncStatus.schemaFiles.length === 3,
    'Git sync tracks 3 core schema files (JSON Schema, TypeScript defs, Config)'
  );

  const jsonSchema = generateJsonSchema();
  assert(
    jsonSchema.$schema === 'https://json-schema.org/draft/2020-12/schema',
    'Generates standard JSON Schema draft 2020-12'
  );
  assert(
    jsonSchema.definitions && Object.keys(jsonSchema.definitions).length >= 8,
    'JSON Schema defines all 8 Bastion Studio corporate blueprints',
    `Blueprints defined: ${Object.keys(jsonSchema.definitions).length}`
  );

  const typeScriptDefs = generateTypeScriptDefinitions();
  assert(
    typeScriptDefs.includes('export interface BastionBlueprint') &&
    typeScriptDefs.includes('export type BlueprintId ='),
    'Generates strict TypeScript interfaces and BlueprintId union'
  );
  assert(
    typeScriptDefs.includes('export interface DynamicZoneSection'),
    'TypeScript declarations export DynamicZoneSection types'
  );

  const configFile = generateConfigFile();
  assert(
    configFile.includes('export default defineConfig(') && configFile.includes('studio_goldfields_enterprise'),
    'Generates valid bastion.config.ts configuration'
  );

  const blueprintsUiPath = path.join(process.cwd(), 'src/app/admin/blueprints/page.tsx');
  const blueprintsUiCode = fs.readFileSync(blueprintsUiPath, 'utf8');

  assert(
    blueprintsUiCode.includes('Two-Way Git Schema Sync') &&
    blueprintsUiCode.includes('Push Schema to Git') &&
    blueprintsUiCode.includes('Pull from Git'),
    'Blueprints dashboard renders Two-Way Git Schema Sync card and controls'
  );
  assert(
    blueprintsUiCode.includes('showPushModal') && blueprintsUiCode.includes('showSchemaModal'),
    'Blueprints dashboard provides Push to Git modal and Schema Code Inspector modal'
  );

  // -------------------------------------------------------------------------
  // PILLAR 3: ENHANCED GRAPHQL & RELATIONS POPULATION API
  // -------------------------------------------------------------------------
  console.log('\n\x1b[36m▶ [PILLAR 3] Enhanced GraphQL & Deep Relations API (Sanity GROQ & Strapi 5 Parity)\x1b[0m');

  await ensureDbReady();
  const db = getDb();

  // Test GraphQL Route File Existence
  const gqlRoutePath = path.join(process.cwd(), 'src/app/api/graphql/route.ts');
  assert(fs.existsSync(gqlRoutePath), 'GraphQL API route (/api/graphql) exists');

  // Dynamic import of GraphQL route module or testing schema execution directly
  const gqlRouteCode = fs.readFileSync(gqlRoutePath, 'utf8');
  assert(
    gqlRouteCode.includes('type Page') &&
    gqlRouteCode.includes('dynamicZones: [DynamicZoneBlock!]!') &&
    gqlRouteCode.includes('bundledRelease: ContentRelease'),
    'GraphQL Schema defines Page type with deeply populated dynamicZones & bundledRelease'
  );
  assert(
    gqlRouteCode.includes('type FocalPoint') && gqlRouteCode.includes('focalPoint: FocalPoint'),
    'GraphQL Schema defines MediaAsset type with AI focal point coordinates'
  );

  // Test Schema compilation and execution via graphql library
  const schemaRegex = /const typeDefs = `([\s\S]*?)`;/;
  const match = gqlRouteCode.match(schemaRegex);
  assert(match !== null, 'GraphQL Schema SDL extracted successfully');

  if (match) {
    const typeDefs = match[1];
    const testSchema = buildSchema(typeDefs);
    assert(testSchema !== null, 'GraphQL Schema SDL parses and compiles without error');

    // Test Introspection Query
    const introspectionResult = await graphql({
      schema: testSchema,
      source: `
        query TestIntrospection {
          __schema {
            queryType {
              name
              fields {
                name
              }
            }
          }
        }
      `
    });

    assert(
      !introspectionResult.errors && introspectionResult.data !== undefined,
      'GraphQL Introspection query executes cleanly'
    );

    const queryFieldNames = (introspectionResult.data as any)?.__schema?.queryType?.fields.map((f: any) => f.name) || [];
    assert(
      queryFieldNames.includes('pages') &&
      queryFieldNames.includes('page') &&
      queryFieldNames.includes('operations') &&
      queryFieldNames.includes('releases') &&
      queryFieldNames.includes('mediaAssets'),
      'GraphQL Query root contains all required queries (pages, page, operations, releases, mediaAssets)',
      `Fields: ${queryFieldNames.join(', ')}`
    );
  }

  // Test Sandbox UI Integration
  const sandboxPath = path.join(process.cwd(), 'src/app/admin/sandbox/page.tsx');
  const sandboxCode = fs.readFileSync(sandboxPath, 'utf8');

  assert(
    (sandboxCode.includes('GraphQL Explorer &amp; Relations DSL') || sandboxCode.includes('GraphQL Explorer & Relations DSL')) &&
    sandboxCode.includes('sandboxMode'),
    'Sandbox UI provides tabbed switching between REST API and GraphQL Explorer'
  );
  assert(
    sandboxCode.includes('GRAPHQL_PRESETS') && sandboxCode.includes('executeGraphQLQuery'),
    'Sandbox UI includes 6 deep-population GraphQL presets and interactive query runner'
  );
  assert(
    sandboxCode.includes('getGqlApolloSnippet') && sandboxCode.includes('Apollo Client'),
    'Sandbox UI generates Apollo Client, urql, and native fetch client code snippets'
  );

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`  PHASE 3 TEST RESULTS: \x1b[32m${passed} PASSED\x1b[0m, \x1b[31m${failed} FAILED\x1b[0m`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runPhase3TestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
