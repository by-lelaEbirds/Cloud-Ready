import express from 'express';
import 'dotenv/config';
import { productRoutes } from './modules/products/product.routes';
import { errorHandler } from './shared/middlewares/errorHandler';

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('API Mestre dos Dados - Missão 8 - FUNCIONANDO!'));

app.use('/products', productRoutes);

app.use(errorHandler);

export { app };
