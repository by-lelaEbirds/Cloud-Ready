import { Router } from 'express';
import { productController } from './product.controller';
import { validate } from '../../shared/middlewares/validateSchema';
import { createProductSchema, updateProductSchema } from './product.schemas';

const productRoutes = Router();

productRoutes.post('/', validate(createProductSchema), productController.create);
productRoutes.get('/', productController.findAll);
productRoutes.get('/:id', productController.findById);
productRoutes.put('/:id', validate(updateProductSchema), productController.update);
productRoutes.patch('/:id', validate(updateProductSchema), productController.update); // Bônus!
productRoutes.delete('/:id', productController.delete);

export { productRoutes };
