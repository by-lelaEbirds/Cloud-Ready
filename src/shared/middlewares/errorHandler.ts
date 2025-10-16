import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err); // Importante para vermos o erro no log da Render
  if (err.message === 'Product not found') {
    return res.status(404).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Internal Server Error' });
};
