export const errorHandler = (err, req, res, next) => {
  console.error(err);
  if (err.message.includes('not found')) {
    return res.status(404).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Error interno del servidor.', error: err.message });
};
