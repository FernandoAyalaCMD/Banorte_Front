import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');
const agentPath = path.join(basePath, 'orchestrator', 'agent.ts');

let agentCode = fs.readFileSync(agentPath, 'utf8');
agentCode = agentCode.replace(/'llama-3\.1-8b-instant'/g, "'llama3-8b-8192'");
fs.writeFileSync(agentPath, agentCode, 'utf8');

console.log('Fixed agent model again');
