import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');

// Fix sentinel.ts
let sentinel = fs.readFileSync(path.join(basePath, 'mcp', 'tools', 'sentinel.ts'), 'utf8');
sentinel = sentinel.replace(/freezeCardInStore\(params\.card_id\)/, 'await freezeCardInStore(params.card_id)');
sentinel = sentinel.replace(/freezeCardInStore\(tx\.cardId\)/, 'await freezeCardInStore(tx.cardId)');
fs.writeFileSync(path.join(basePath, 'mcp', 'tools', 'sentinel.ts'), sentinel, 'utf8');

// Fix subscriptions.ts
let subs = fs.readFileSync(path.join(basePath, 'mcp', 'tools', 'subscriptions.ts'), 'utf8');
subs = subs.replace(/cancelSubscriptions\(params\.sub_ids\)/g, 'await cancelSubscriptions(params.sub_ids)');
fs.writeFileSync(path.join(basePath, 'mcp', 'tools', 'subscriptions.ts'), subs, 'utf8');

console.log('Fixed awaits in sentinel and subscriptions');
