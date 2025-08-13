import { NextResponse, type NextRequest } from 'next/server';
import { canUserPerform } from '@/lib/roles';
import { auth } from 'firebase-admin';
import { promises as fs } from 'fs';
import path from 'path';

// Define the required action to view mesh info
const REQUIRED_ACTION = 'viewMeshInfo';

const parseMarkdown = (markdown: string) => {
    const modules = [];
    const moduleRegex = /-\s+\*\*([\w-& ]+):\*\*\s*\(([^)]+)\)\s*(.*)/g;
    let match;
    while ((match = moduleRegex.exec(markdown)) !== null) {
        modules.push({ name: match[1].trim(), tech: match[2].trim(), description: match[3].trim() });
    }

    const apiEndpoints = [];
    const endpointRegex = /-\s+\*\*`(\/api\/[\w-]+)`\*\*\s+-\s+\*\*Method:\*\* ([\w, ]+)\s+-\s+\*\*Purpose:\*\* (.*)/g;
    while ((match = endpointRegex.exec(markdown)) !== null) {
        apiEndpoints.push({
            path: match[1].trim(),
            methods: match[2].split(',').map(m => m.trim()),
            description: match[3].trim(),
        });
    }

    return { modules, apiEndpoints };
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return new NextResponse('Unauthorized: Missing or invalid token', { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    const userRole = (decodedToken.role || 'Analyst') as any;

    if (!canUserPerform(userRole, REQUIRED_ACTION)) {
      return new NextResponse('Forbidden: Insufficient permissions', { status: 403 });
    }
    
    const filePath = path.join(process.cwd(), 'docs', 'mesh_logical_topology.md');
    const markdownContent = await fs.readFile(filePath, 'utf-8');

    const { modules, apiEndpoints } = parseMarkdown(markdownContent);
    
    const meshInfo = {
      modules,
      apiEndpoints,
      documentationUrl: '/docs/mesh_logical_topology.md',
    };

    const response = NextResponse.json(meshInfo);

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Documentation file not found.' }, { status: 404 });
    }
    console.error('Mesh Info Error:', error);
    return new NextResponse('Unauthorized or Internal Server Error', { status: 500 });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}
