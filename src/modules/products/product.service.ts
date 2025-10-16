import { productRepository } from './product.repository';

export const productService = {
  create: async (data: any) => productRepository.create(data),
  findAll: async () => productRepository.findAll(),
  findById: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product) { throw new Error('Product not found'); }
    return product;
  },
  update: async (id: string, data: any) => {
    await productService.findById(id); // Garante que o produto existe antes de atualizar
    return productRepository.update(id, data);
  },
  delete: async (id: string) => {
    await productService.findById(id); // Garante que o produto existe antes de deletar
    return productRepository.delete(id);
  },
};
