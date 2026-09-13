import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');

let accountTs = fs.readFileSync(path.join(basePath, 'mcp', 'tools', 'account.ts'), 'utf8');
accountTs = accountTs.replace("const activeCards = cards.filter(c => c.status !== 'destroyed');", "const activeCards = cards.filter(c => c.destroyedAt === null);");
fs.writeFileSync(path.join(basePath, 'mcp', 'tools', 'account.ts'), accountTs, 'utf8');

console.log('Fixed account.ts filter');
