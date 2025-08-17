export default function handler(req, res) {
  // Simulate audit event count (can be dynamic later)
  res.status(200).json({ count: Math.floor(Math.random() * 100) });
}
