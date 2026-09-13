import fs from 'node:fs';
import path from 'node:path';

const dbCode = `import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.warn('?O MONGODB_URI no está definido en el archivo .env. Usando mock_mode...');
      return false;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Ys? Conectado a MongoDB Atlas');
    return true;
  } catch (error) {
    console.error('?O Error conectando a MongoDB:', error);
    process.exit(1);
  }
};
`;

const dbPath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src', 'config', 'db.ts');
fs.writeFileSync(dbPath, dbCode, 'utf8');
console.log('db.ts created');
