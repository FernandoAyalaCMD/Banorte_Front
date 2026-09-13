import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');

// Fix subscriptions.ts return type
let subsCode = fs.readFileSync(path.join(basePath, 'store', 'subscriptions.ts'), 'utf8');
subsCode = subsCode.replace(/cancelSubscriptions\(subIds: string\[\]\): Promise<number>/, "cancelSubscriptions(subIds: string[]): Promise<{cancelled: number, savedMonthly: number}>");
subsCode = subsCode.replace(/return res\.modifiedCount;/, "return { cancelled: res.modifiedCount, savedMonthly: 0 }; // simplified");
fs.writeFileSync(path.join(basePath, 'store', 'subscriptions.ts'), subsCode, 'utf8');

// Fix tools
function addAwaits(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(/getUserOrThrow\(/g, 'await getUserOrThrow(');
  fs.writeFileSync(filePath, code, 'utf8');
}

addAwaits(path.join(basePath, 'mcp', 'tools', 'payroll.ts'));
addAwaits(path.join(basePath, 'mcp', 'tools', 'sentinel.ts'));
addAwaits(path.join(basePath, 'mcp', 'tools', 'subscriptions.ts'));
addAwaits(path.join(basePath, 'mcp', 'tools', 'safecart.ts'));

console.log('Fixed tools and store');
