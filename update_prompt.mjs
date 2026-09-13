import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');
const agentPath = path.join(basePath, 'orchestrator', 'agent.ts');

let agentCode = fs.readFileSync(agentPath, 'utf8');
const instructionToAdd = `
- ¡MUY IMPORTANTE (Generative UI)!: Cuando el usuario haga preguntas analíticas, proyecciones financieras, resúmenes, o pida información de su cuenta (ej. "¿Cuánto gastaré en dos meses?", "¿Cuál es mi saldo?", "¿Cuáles son mis suscripciones?"), NUNCA uses componentes estáticos limitados (como SubscriptionManager, BurnerCard, etc.). En su lugar, DEBES USAR SIEMPRE el componente "DynamicBankView" para generar una interfaz completamente nueva y a la medida. Utiliza los \`elements\` (header, text, key_value, bar_chart) para construir la respuesta visual de forma espectacular y dinámica.`;

// Insert the new rule in REGLAS DE FORMATO
agentCode = agentCode.replace("REGLAS DE FORMATO:", "REGLAS DE FORMATO:" + instructionToAdd);

fs.writeFileSync(agentPath, agentCode, 'utf8');
console.log('Updated agent.ts system prompt');
