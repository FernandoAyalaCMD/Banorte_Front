import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');

const accountToolCode = `import { z } from 'zod';
import type { MCPTool } from '../types.js';
import { getUserOrThrow, getUserCards, getUserTransactions } from '../../store/index.js';
import { formatMXN } from '../../utils/currency.js';

export const getFinancialSummary: MCPTool = {
  name: 'get_financial_summary',
  description: 'Obtiene el resumen financiero completo del usuario, incluyendo su perfil (nombre, clabe, salario), sus tarjetas (físicas y virtuales) con sus saldos y límites, y el total gastado recientemente.',
  parameters: z.object({
    user_id: z.string().describe('ID del usuario (por defecto: usr_banorte_demo)'),
  }),
  execute: async (params: { user_id: string }) => {
    const userId = params.user_id || 'usr_banorte_demo';
    const user = await getUserOrThrow(userId);
    const cards = await getUserCards(userId);
    const transactions = await getUserTransactions(userId);

    const totalBalance = cards.reduce((sum, c) => sum + (c.status === 'active' || c.status === 'frozen' ? c.balance : 0), 0);
    const activeCards = cards.filter(c => c.status !== 'destroyed');

    return {
      profile: {
        name: user.name,
        email: user.email,
        clabe: user.clabe,
        salary_formatted: formatMXN(user.salary),
        risk_profile: user.riskProfile,
      },
      total_balance_formatted: formatMXN(totalBalance),
      cards: activeCards.map(c => ({
        id: c.id,
        type: c.type,
        label: c.label,
        last4: c.number.slice(-4),
        balance_formatted: formatMXN(c.balance),
        limit_formatted: formatMXN(c.limit),
        status: c.status
      })),
      recent_transactions_count: transactions.length,
      message: \`Resumen de \${user.name}: \${activeCards.length} tarjetas activas/congeladas con un saldo total de \${formatMXN(totalBalance)}.\`
    };
  },
};

export const accountTools: MCPTool[] = [getFinancialSummary];
`;
fs.writeFileSync(path.join(basePath, 'mcp', 'tools', 'account.ts'), accountToolCode, 'utf8');

// Update index.ts to import and register accountTools
let indexCode = fs.readFileSync(path.join(basePath, 'index.ts'), 'utf8');
if (!indexCode.includes('import { accountTools }')) {
  indexCode = indexCode.replace("import { payrollTools } from './mcp/tools/payroll.js';", "import { payrollTools } from './mcp/tools/payroll.js';\nimport { accountTools } from './mcp/tools/account.js';");
  indexCode = indexCode.replace("mcpRegistry.registerAll(payrollTools);", "mcpRegistry.registerAll(payrollTools);\n  mcpRegistry.registerAll(accountTools);");
  fs.writeFileSync(path.join(basePath, 'index.ts'), indexCode, 'utf8');
}

console.log('account.ts tool added and registered');
