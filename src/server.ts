// =============================================================================
// ARQUIVO ÚNICO DA API - VERSÃO FINAL CORRIGIDA
// =============================================================================

import express, { Request, Response, NextFunction, ErrorRequestHandler, Router } from 'express';
import { z, AnyZodObject } from 'zod';
import Airtable from 'airtable';
import dotenv from 'dotenv';

// =============================================================================
// 1. CONFIGURAÇÃO INICIAL
// =============================================================================
dotenv.config();

const app = express();
app.use(express.json());

const airtable = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID!);
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME!;

// =============================================================================
// 2. SCHEMAS DE VALIDAÇÃO (ZOD)
// =============================================================================
const createProductSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).min(3),
    price: z.number({ required_error: 'Price is required' }).positive(),
    description: z.string().optional(),
    stock: z.number().int().positive().optional(),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3).optional(),
    price: z.number().positive().optional(),
    description: z.string().optional(),
    stock: z.number().int().positive().optional(),
  }),
});

// =============================================================================
// 3. REPOSITORY
// =============================================================================
const formatRecord = (record: any) => {
    if (!record) return null;
    return { id: record.id, ...record.fields };
};

const productRepository = {
    create: async (data: any) => {
        const [createdRecord] = await base(TABLE_NAME).create([{ fields: data }]);
        return formatRecord(createdRecord);
    },
    findAll: async () => {
        const records = await base(TABLE_NAME).select({ sort: [{field: "name", direction: "asc"}] }).all();
        return records.map(formatRecord);
    },
    findById: async (id: string) => {
        try {
            const record = await base(TABLE_NAME).find(id);
            return formatRecord(record);
        } catch (error) { return null; }
    },
    update: async (id: string, dataToUpdate: any) => {
        const [updatedRecord] = await base(TABLE_NAME).update([{ id, fields: dataToUpdate }]);
        return formatRecord(updatedRecord);
    },
    delete: async (id: string) => {
        const [deletedRecord] = await base(TABLE_NAME).destroy([id]);
        return formatRecord(deletedRecord);
    },
};

// =============================================================================
// 4. SERVICE
// =============================================================================
const productService = {
  create: async (data: any) => productRepository.create(data),
  findAll: async () => productRepository.findAll(),
  findById: async (id: string) => {
    const product = await productRepository.findById(id);
    if (!product) { throw new Error('Product not found'); }
    return product;
  },
  update: async (id: string, data: any) => {
    await productService.findById(id);
    return productRepository.update(id, data);
  },
  delete: async (id: string) => {
    await productService.findById(id);
    return productRepository.delete(id);
  },
};

// =============================================================================
// 5. CONTROLLER
// =============================================================================
const productController = {
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

// =============================================================================
// 6. MIDDLEWARES
// =============================================================================
const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({ body: req.body, query: req.query, params: req.params });
      next();
    } catch (e: any) { return res.status(400).json(e.errors); }
  };

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err);
  if (err.message === 'Product not found') {
    return res.status(404).json({ message: err.message });
  }
  return res.status(500).json({ message: 'Internal Server Error' });
};

// =============================================================================
// 7. ROTAS
// =============================================================================
const productRoutes = Router();

// ### A CORREÇÃO ESTÁ AQUI! ESTA PARTE ESTAVA FALTANDO ###
productRoutes.post('/', validate(createProductSchema), productController.create);
productRoutes.get('/', productController.findAll);
productRoutes.get('/:id', productController.findById);
productRoutes.put('/:id', validate(updateProductSchema), productController.update);
productRoutes.patch('/:id', validate(updateProductSchema), productController.update);
productRoutes.delete('/:id', productController.delete);
// ### FIM DA CORREÇÃO ###

// ROTA DA PÁGINA INICIAL
app.get('/', (req, res) => res.send('API Mestre dos Dados - Missão 8 - FUNCIONANDO!'));

// USANDO AS ROTAS DE PRODUTOS
app.use('/products', productRoutes);

// ROTAS DE TESTE PELO NAVEGADOR
app.get('/test/create', async (req: Request, res: Response) => {
    try {
        const produtoDeTeste = {
            name: "Produto de Teste " + Math.floor(Math.random() * 100),
            price: 99.99,
            stock: 50,
            description: "Este produto foi criado pelo endpoint de teste."
        };
        const novoProduto = await productService.create(produtoDeTeste);
        res.status(201).send(`<h1>Produto Criado com Sucesso!</h1><pre>${JSON.stringify(novoProduto, null, 2)}</pre>`);
    } catch (error: any) {
        res.status(500).send(`<h1>Erro ao criar produto:</h1><p>${error.message}</p>`);
    }
});

app.get('/test/delete-last', async (req: Request, res: Response) => {
    try {
        const todosProdutos = await productService.findAll();
        if (todosProdutos.length === 0) {
            return res.status(404).send("<h1>Nenhum produto para deletar!</h1>");
        }
        const ultimoProduto = todosProdutos[todosProdutos.length - 1];
        await productService.delete(ultimoProduto.id);
        res.status(200).send(`<h1>Produto deletado com Sucesso!</h1><p>ID: ${ultimoProduto.id}</p><p>Nome: ${ultimoProduto.name}</p>`);
    } catch (error: any) {
        res.status(500).send(`<h1>Erro ao deletar produto:</h1><p>${error.message}</p>`);
    }
});

// USANDO O ERROR HANDLER (DEVE SER O ÚLTIMO)
app.use(errorHandler);

// =============================================================================
// 8. INICIANDO O SERVIDOR
// =============================================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
