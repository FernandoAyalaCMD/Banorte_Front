import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');
const agentPath = path.join(basePath, 'orchestrator', 'agent.ts');

let agentCode = fs.readFileSync(agentPath, 'utf8');

// Replace the strict rule with a more nuanced one
const oldRule = `- ¡MUY IMPORTANTE (Generative UI)!: Cuando el usuario haga preguntas analíticas, proyecciones financieras, resúmenes, o pida información de su cuenta (ej. "¿Cuánto gastaré en dos meses?", "¿Cuál es mi saldo?", "¿Cuáles son mis suscripciones?"), NUNCA uses componentes estáticos limitados (como SubscriptionManager, BurnerCard, etc.). En su lugar, DEBES USAR SIEMPRE el componente "DynamicBankView" para generar una interfaz completamente nueva y a la medida. Utiliza los 'elements' (header, text, key_value, bar_chart) para construir la respuesta visual de forma espectacular y dinámica.`;

const newRule = `- USO DE COMPONENTES:
  - Si el usuario quiere ver, gestionar o cancelar sus suscripciones (ej. "Mis suscripciones activas", "Quiero cancelar"), USA SIEMPRE "SubscriptionManager" para mostrar los logos oficiales.
  - Si el usuario hace preguntas de proyección matemática o análisis (ej. "¿Cuánto gastaré en 2 meses?", "¿Cuál es mi saldo disponible?"), USA "DynamicBankView" con 'elements' (header, text, key_value, bar_chart) para generar una UI analítica.`;

agentCode = agentCode.replace(oldRule, newRule);

fs.writeFileSync(agentPath, agentCode, 'utf8');
console.log('Fixed agent.ts rules to allow SubscriptionManager');
