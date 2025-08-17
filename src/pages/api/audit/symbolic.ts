export default function handler(req, res) {
  const glyphs = ['Ω', 'Δ', '∞', 'Ψ', 'Σ'];
  res.status(200).json({ glyphs: glyphs.slice(0, 3), active: true });
}
