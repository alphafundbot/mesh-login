import fs from 'fs';
import path from 'path';
import { createSVGWindow } from 'svgdom';
import { SVG, registerWindow } from '@svgdotjs/svg.js';

const window = createSVGWindow();
const document = window.document;
registerWindow(window, document);

const meshPath = path.resolve('mesh_manifest.json');
const tracePath = path.resolve('carrier_telemetry.json');

const mesh = JSON.parse(fs.readFileSync(meshPath, 'utf8'));
const trace = JSON.parse(fs.readFileSync(tracePath, 'utf8'));

const draw = SVG(document.documentElement).size(1200, 800);
draw.rect(1200, 800).fill('#0f0f0f');

mesh.overlays.forEach((overlay, i) => {
  const x = 100 + i * 200;
  const y = 100;
  draw.circle(80).fill('#00ffcc').move(x, y);
  draw.text(overlay.name).fill('#ffffff').move(x - 20, y + 100);
});

trace.mutations.forEach((mutation, i) => {
  const x = 100 + i * 180;
  const y = 300;
  draw.rect(140, 40).fill('#ff00aa').move(x, y);
  draw.text(mutation.id).fill('#ffffff').move(x + 10, y + 10);
});

fs.writeFileSync('OverlaySignalMap.svg', draw.svg());
console.log('✅ OverlaySignalMap.svg generated');
