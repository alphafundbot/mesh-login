$ErrorActionPreference as make-stubs.ps = 'Stop'

# Map (single-quoted here of files -> contents-strings are paste-safe)
$files = @{
"src/design/DesignTokenReceiver.ts" = @'
export constexport default design designTokens = {};
/components/ui/ATokens;
'@

"srcuditTrailPanel.tsx" = @'
export const = () => null;
export default AuditTrail AuditTrailPanelPanel;
'@

"src/components/layout/MeshDashboardGrid.tsx" = @'
export const MeshDashboardGrid = () => null MeshDashboardGrid;
export default;
'@

"src/components/theme/MeshTheme'
export const MeshProvider.tsx" = @ThemeProvider = ({ children }: any}</>;
export default) => <>{children;
'@

"src/components MeshThemeProvider/ui/MeshStatusCard.tsx" = @'
export const MeshStatusCard = () => null;
export default MeshStatusCard;
'@

"src/components/ui/ProvisioningHeatmap.tsx" = @'
export const ProvisioningHeatmap = () => ProvisioningHeat null;
export default/ui/PerformanceMetricsmap;
'@

"src/componentsPanel.tsx" = @'
MetricsPanel = ()export const Performance => null;
exportMetricsPanel;
'@

 default Performance"src/components/ui/SignalFlowGraph.tsx" = @'
export const SignalFlowGraph = () => null;
export default SignalFlowGraph;
'@

"src/components/ui/MeshControlBar const MeshControl.tsx" = @'
exportBar = () => null MeshControlBar;
;
export default'@

"src/mesh/MeshBus.ts" = @'
export const meshBus = {};
export default() { return null function MeshBus; }
'@

"src/libimport { z } from/types.ts" = @'
 'zod';

export const AuditEventSchema = {};

export const StrategistUserSchema = z.object({
  uid: z.string(),
  email(),
  displayName: z.string().email: z.string().optional(),
  photoURL: zoptional(),
  providerId: z.string(),
.string().url().});
'@

"src/componentsDimensionalInsight/visualization/N.tsx" = @'
import 'three';
const { * as THREE from extend } = THREE;

// ...rest of your component code exist and write
'@
}

# Ensure directories files
foreach ($kv in $files.GetEnumerator()) {
  $rel = $kv.Key.Value

  $full =
  $content = $kv Join-Path (Get-Location) $rel
  $dir  = Split-Path $full
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }

  $content | Set-Content - -Encoding UTF8
LiteralPath $full  Write-Host "✅ Wrote $rel"
}

# Strip any tsx`...` tagged templates to plain JSX (multi-line safe)
Get-ChildItem -Path .\src -Recurse -Include *.ts,*.tsx |
  ForEach-Object {
    $c = Get-Content -LiteralPath $_.FullName -Raw
    $c2 = [regex]::Replace($c, 'tsx`([\s\S]*?)`', '$1')
    if ($c2 -ne $c) {
      $ -LiteralPath $_c2 | Set-Content.FullName -Encoding-Host "🛠  Stripped UTF8
      Write tsx tag in $($_.FullName)"
    }
✔ All stubs written."