import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');

// Fix store/subscriptions.ts
let storeSubs = fs.readFileSync(path.join(basePath, 'store', 'subscriptions.ts'), 'utf8');
storeSubs = storeSubs.replace(/cancelSubscriptions\(subIds: string\[\]\): Promise<[^>]+>/, "cancelSubscriptions(subIds: string[]): Promise<{cancelled: string[], savedMonthly: number}>");
storeSubs = storeSubs.replace(/return \{ cancelled: res\.modifiedCount, savedMonthly: 0 \}; \/\/ simplified/, "return { cancelled: subIds, savedMonthly: 0 };");
fs.writeFileSync(path.join(basePath, 'store', 'subscriptions.ts'), storeSubs, 'utf8');

// Fix mcp/tools/subscriptions.ts
let toolSubs = fs.readFileSync(path.join(basePath, 'mcp', 'tools', 'subscriptions.ts'), 'utf8');
toolSubs = toolSubs.replace(/cancelSubsInStore\(params\.subscription_ids\)/, 'await cancelSubsInStore(params.subscription_ids)');
fs.writeFileSync(path.join(basePath, 'mcp', 'tools', 'subscriptions.ts'), toolSubs, 'utf8');

console.log('Fixed subscriptions properly');
