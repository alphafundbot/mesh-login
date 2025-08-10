#!/usr/bin/env bash
set -euo pipefail

# 1. Create component directories
mkdir -p iam frontend mcp-server
mkdir -p frontend/pages

# 2. Populate a basic package.json in each
cat > iam/package.json << 'EOF'
{
  "name": "iam",
  "version": "1.0.0",
  "main": "daemon.ts",
  "scripts": {
    "start": "ts-node daemon.ts"
  },
  "dependencies": {
    "ts-node": "^10.0.0"
  }
}
EOF

cat > frontend/package.json << 'EOF'
{
  "name": "frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev -p 8080"
  },
  "dependencies": {
    "next": "^12.0.0",
    "react": "^17.0.2",
    "react-dom": "^17.0.2"
  }
}
EOF

cat > mcp-server/package.json << 'EOF'
{
  "name": "mcp-server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {}
}
EOF

# 3. Add stub entrypoints
cat > iam/daemon.ts << 'EOF'
console.log("IAM daemon started");
setInterval(() => console.log("IAM heartbeat"), 60000);
EOF

cat > frontend/pages/index.js << 'EOF'
export default function Home() {
  return <h1>Mesh Frontend</h1>;
}
EOF

cat > mcp-server/index.js << 'EOF'
console.log("MCP server listening on 9002");
# bind to 9002
require('http').createServer((req, res) => {
  res.end("MCP OK");
}).listen(9002);
EOF

# 4. Install deps in each component
(cd iam && npm install)
(cd frontend && npm install)
(cd mcp-server && npm install)

echo "Bootstrap complete. Directories and stub files are in place."