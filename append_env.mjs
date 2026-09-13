import fs from 'node:fs';
import path from 'node:path';

const envPath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', '.env');
const uri = 'MONGODB_URI="mongodb+srv://gaborodriguezsanchez_db_user:vDCQQ4UonLqXSqhk@cluster0.toiimzb.mongodb.net/banorte_hackathon?retryWrites=true&w=majority"\n';

let currentEnv = fs.readFileSync(envPath, 'utf8');
if (!currentEnv.includes('MONGODB_URI')) {
  fs.appendFileSync(envPath, `\n${uri}`);
  console.log('MONGODB_URI appended to .env');
} else {
  console.log('MONGODB_URI already exists in .env');
}
