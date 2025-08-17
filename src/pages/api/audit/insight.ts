export default function handler(req, res) {
  res.status(200).json({ type: 'mnemonic', density: Math.random().toFixed(2) });
}
