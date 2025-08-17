export default function handler(req, res) {
  res.status(200).json({ status: 'healthy', nodes: Math.floor(Math.random() * 100) });
}
