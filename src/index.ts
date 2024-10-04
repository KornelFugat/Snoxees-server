// src/index.ts

import express from 'express';
import path from 'path';
import accountRoutes from './routes/account';
import cors from 'cors';
import battleRoutes from './routes/battleRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/assets', express.static(path.join(__dirname, 'assets')))

app.use('/api', accountRoutes);
app.use('/api/battle', battleRoutes);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
