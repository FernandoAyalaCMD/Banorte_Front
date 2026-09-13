import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');

// 6. Refactor src/index.ts
let indexCode = fs.readFileSync(path.join(basePath, 'index.ts'), 'utf8');
indexCode = indexCode.replace("import { seedAll } from './store/index.js';", "import { seedAll } from './store/index.js';\nimport { connectDB } from './config/db.js';");
indexCode = indexCode.replace("seedAll();", "await connectDB();\n  await seedAll();");
fs.writeFileSync(path.join(basePath, 'index.ts'), indexCode, 'utf8');
console.log('Refactored index.ts');

// 7. Refactor MCP tools
function addAwaits(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(/getCard\(/g, 'await getCard(');
  code = code.replace(/createVirtualCard\(/g, 'await createVirtualCard(');
  code = code.replace(/destroyCard\(/g, 'await destroyCard(');
  code = code.replace(/freezeCard\(/g, 'await freezeCard(');
  code = code.replace(/addTransaction\(/g, 'await addTransaction(');
  code = code.replace(/disputeTransaction\(/g, 'await disputeTransaction(');
  code = code.replace(/cancelSubscriptions\(/g, 'await cancelSubscriptions(');
  code = code.replace(/getUserSubscriptions\(/g, 'await getUserSubscriptions(');
  code = code.replace(/getActiveSubscriptions\(/g, 'await getActiveSubscriptions(');
  code = code.replace(/getSuspiciousTransactions\(/g, 'await getSuspiciousTransactions(');
  code = code.replace(/getUserTransactions\(/g, 'await getUserTransactions(');
  code = code.replace(/getUser\(/g, 'await getUser(');
  fs.writeFileSync(filePath, code, 'utf8');
}

addAwaits(path.join(basePath, 'mcp', 'tools', 'safecart.ts'));
addAwaits(path.join(basePath, 'mcp', 'tools', 'sentinel.ts'));
addAwaits(path.join(basePath, 'mcp', 'tools', 'subscriptions.ts'));
addAwaits(path.join(basePath, 'mcp', 'tools', 'payroll.ts'));
console.log('Refactored MCP tools to add awaits');
