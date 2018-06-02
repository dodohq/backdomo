export default (e, res) => {
  if (e.send) return e.send(res);
  res.status(500).json({ message: `Internal Server Error: ${e}` });
};
