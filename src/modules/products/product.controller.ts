import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';

export const productController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newProduct = await productService.create(req.body);
      return res.status(201).json(newProduct);
    } catch (error) { next(error); }
  },
  findAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await productService.findAll();
      return res.status(200).json(products);
    } catch (error) { next(error); }
  },
  findById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await productService.findById(req.params.id);
      return res.status(200).json(product);
    } catch (error) { next(error); }
  },
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await productService.update(req.params.id, req.body);
      return res.status(200).json(updated);
    } catch (error) { next(error); }
  },
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await productService.delete(req.params.id);
      return res.status(204).send();
    } catch (error) { next(error); }
  },
};
