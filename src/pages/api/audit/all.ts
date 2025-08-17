export default async function handler(req, res) {
  const get = async (path) => {
    const mod = await import(`./${path}`);
    return new Promise((resolve) => {
      const mockReq = {};
      const mockRes = {
        status: () => ({
          json: resolve
        })
      };
      mod.default(mockReq, mockRes);
    });
  };

  const [count, globe, insight, symbolic] = await Promise.all([
    get('count'),
    get('globe'),
    get('insight'),
    get('symbolic')
  ]);

  res.status(200).json({ count, globe, insight, symbolic });
}