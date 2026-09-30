import { NextRequest, NextResponse } from 'next/server';
import {
  getSchemaSyncStatus,
  generateJsonSchema,
  generateTypeScriptDefinitions,
  generateConfigFile,
  pushSchemaToGit,
  pullSchemaFromGit
} from '@/lib/schema/gitSync';

export async function GET(req: NextRequest) {
  try {
    const status = getSchemaSyncStatus();
    return NextResponse.json({
      success: true,
      status
    });
  } catch (err: any) {
    console.error('Git sync status error:', err);
    return NextResponse.json({ error: err.message || 'Failed to get git sync status' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, commitMessage } = body;

    if (action === 'export') {
      const jsonSchema = generateJsonSchema();
      const typeScriptDefs = generateTypeScriptDefinitions();
      const configFile = generateConfigFile();

      return NextResponse.json({
        success: true,
        bundle: {
          jsonSchema,
          typeScriptDefs,
          configFile,
          version: '3.0.0',
          timestamp: new Date().toISOString()
        }
      });
    }

    if (action === 'push') {
      const result = await pushSchemaToGit(commitMessage);
      return NextResponse.json({
        success: true,
        message: 'Schema successfully synchronized and committed to Git repository',
        commitSha: result.commitSha,
        filesUpdated: result.filesUpdated
      });
    }

    if (action === 'pull') {
      const result = await pullSchemaFromGit();
      return NextResponse.json({
        success: true,
        message: 'Schema successfully pulled and synchronized with Bastion CMS Blueprints',
        importedCollections: result.importedCollections,
        importedComponents: result.importedComponents
      });
    }

    return NextResponse.json({ error: 'Invalid action specified. Supported: export, push, pull' }, { status: 400 });
  } catch (err: any) {
    console.error('Git sync operation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to execute git schema sync' }, { status: 500 });
  }
}
