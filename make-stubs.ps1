$ErrorActionPreference = 'Stop'

$files = @{
  "src/design/DesignTokenReceiver.ts" = @'
export const designTokens = {};
export default designTokens;
'@

  "src/components/ui/AuditTrailPanel.tsx" = @'
export const AuditTrailPanel = () => null;
export default AuditTrailPanel;
'@

  "src/components/layout/MeshDashboardGrid.tsx" = @'
export const MeshDashboardGrid = () => null;
export default MeshDashboardGrid;
'@

  "src/components/theme/MeshThemeProvider.tsx" = @'
export const MeshThemeProvider = ({ children }: any) => <>{children}</>;
export default MeshThemeProvider;
'@

  "src/components/ui/MeshStatusCard.tsx" = @'
export const MeshStatusCard = () => null;
export default MeshStatusCard;
'@

  "src/components/ui/ProvisioningHeatmap.tsx" = @'
export const ProvisioningHeatmap = () => null;
export default ProvisioningHeatmap;
'@

  "src/components/ui/PerformanceMetricsPanel.tsx" = @'
export const PerformanceMetricsPanel = () => null;
export default PerformanceMetricsPanel;
'@

  "src/components/ui/SignalFlowGraph.tsx" = @'
export const SignalFlowGraph = () => null;
export default SignalFlowGraph;
'@

  "src/components/ui/MeshControlBar.tsx" = @'
export const MeshControlBar = () => null;
export default MeshControlBar;
'@

  "src/mesh/MeshBus.ts" = @'
export const meshBus = {};
export default function MeshBus() { return null; }
'@

  "src/lib/types.ts" = @'
import { z } from "zod";

export const AuditEventSchema = {};

export const StrategistUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  photoURL: z.string().url().optional(),
  providerId: z.string(),
});
'@

  "src/components/visualization/NDimensionalInsight.tsx" = @'
import * as THREE from "three";
const { extend } = THREE;

// ...rest of your component code
'@
}

foreach ($kv in $files.GetEnumerator()) {
  $rel = $kv.Key
  $content = $kv.Value
  $full = Join-Path (Get-Location) $rel
  $dir  = Split-Path $full
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  $content | Set-Content -LiteralPath $full -Encoding UTF8
  Write-Host "✅ Wrote $rel"
}

# Strip tsx`...` tagged templates
Get-ChildItem -Path .\src -Recurse -Include *.ts,*.tsx |
  ForEach-Object {
    $c = Get-Content -LiteralPath $_.FullName -Raw
    $c2 = [regex]::Replace($c, 'tsx`([\s\S]*?)`', '$1')
    if ($c2 -ne $c) {
      $c2 | Set-Content -LiteralPath $_.FullName -Encoding UTF8
      Write-Host "🛠  Stripped tsx tag in $($_.FullName)"
    }
  }

Write-Host "✔ All stubs written."