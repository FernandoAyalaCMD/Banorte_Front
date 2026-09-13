import fs from 'node:fs';
import path from 'node:path';

const basePath = path.join(process.cwd(), '..', 'HACK2026', 'Reto_Banorte_Hack_2026', 'src');

// 3. Refactor transactions.ts
const transactionsCode = `import { generateId } from '../utils/id.js';
import { TransactionModel } from './models.js';

export interface Transaction {
  id: string;
  userId: string;
  cardId: string;
  merchant: string;
  amount: number;
  category: 'food' | 'transport' | 'entertainment' | 'shopping' | 'services' | 'health' | 'income' | 'simulated';
  date: string; // ISO String
  status: 'completed' | 'pending' | 'disputed' | 'declined';
  suspicious: boolean;
  riskScore: number;
  duplicateOf: string | null;
  description: string;
}

export async function seedTransactions(): Promise<void> {
  const count = await TransactionModel.countDocuments();
  if (count > 0) return;
  console.log('Seeded transactions - DB already has them from your data dump');
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  const txs = await TransactionModel.find({ userId }).sort({ _id: -1 }).lean();
  return txs.map(t => ({ ...t, id: t._id })) as any;
}

export async function getSuspiciousTransactions(userId: string): Promise<Transaction[]> {
  const txs = await TransactionModel.find({ userId, suspicious: true }).lean();
  return txs.map(t => ({ ...t, id: t._id })) as any;
}

export async function getTransaction(txId: string): Promise<Transaction | undefined> {
  const t = await TransactionModel.findById(txId).lean();
  if (!t) return undefined;
  t.id = t._id;
  return t as any;
}

export async function disputeTransaction(txId: string): Promise<Transaction> {
  const t = await TransactionModel.findByIdAndUpdate(txId, { status: 'disputed' }, { new: true }).lean();
  if (!t) throw new Error(\`Transacción no encontrada: \${txId}\`);
  t.id = t._id;
  return t as any;
}

export async function addTransaction(tx: Omit<Transaction, 'id'>): Promise<Transaction> {
  const id = generateId('tx_');
  const doc = { _id: id, id, ...tx };
  await TransactionModel.create(doc);
  return doc as any;
}
`;
fs.writeFileSync(path.join(basePath, 'store', 'transactions.ts'), transactionsCode, 'utf8');
console.log('Refactored transactions.ts');

// 4. Refactor subscriptions.ts
const subsCode = `import { SubscriptionModel } from './models.js';

export interface Subscription {
  id: string;
  userId: string;
  merchant: string;
  amount: number;
  currency: 'MXN' | 'USD';
  frequency: 'monthly' | 'yearly' | 'weekly';
  nextChargeDate: string; // YYYY-MM-DD
  category: string;
  logoUrl?: string;
  tokenStatus: 'active' | 'cancelled' | 'paused';
  cancelledAt: string | null;
}

export async function seedSubscriptions(): Promise<void> {
  const count = await SubscriptionModel.countDocuments();
  if (count > 0) return;
  console.log('Seeded subscriptions - handled via db');
}

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const subs = await SubscriptionModel.find({ userId }).lean();
  return subs.map(s => ({ ...s, id: s._id })) as any;
}

export async function getActiveSubscriptions(userId: string): Promise<Subscription[]> {
  const subs = await SubscriptionModel.find({ userId, tokenStatus: 'active' }).lean();
  return subs.map(s => ({ ...s, id: s._id })) as any;
}

export async function cancelSubscriptions(subIds: string[]): Promise<number> {
  const res = await SubscriptionModel.updateMany(
    { _id: { $in: subIds } },
    { $set: { tokenStatus: 'cancelled', cancelledAt: new Date().toISOString() } }
  );
  return res.modifiedCount;
}
`;
fs.writeFileSync(path.join(basePath, 'store', 'subscriptions.ts'), subsCode, 'utf8');
console.log('Refactored subscriptions.ts');

// 5. Refactor store/index.ts
const storeIndex = `// 🟢 Central Store Barrel Export - Async
export * from './models.js';

import { seedUsers } from './users.js';
import { seedCards } from './cards.js';
import { seedTransactions } from './transactions.js';
import { seedSubscriptions } from './subscriptions.js';

export { seedUsers, getUser, getUserOrThrow } from './users.js';
export type { User } from './users.js';

export {
  seedCards,
  getCard,
  getUserCards,
  createVirtualCard,
  destroyCard,
  freezeCard,
} from './cards.js';
export type { Card } from './cards.js';

export {
  seedTransactions,
  getUserTransactions,
  getSuspiciousTransactions,
  getTransaction,
  disputeTransaction,
  addTransaction,
} from './transactions.js';
export type { Transaction } from './transactions.js';

export {
  seedSubscriptions,
  getUserSubscriptions,
  getActiveSubscriptions,
  cancelSubscriptions,
} from './subscriptions.js';
export type { Subscription } from './subscriptions.js';

export async function seedAll(): Promise<void> {
  console.log('\\n🟡 Seeding MongoDB...');
  await seedUsers();
  await seedCards();
  await seedTransactions();
  await seedSubscriptions();
  console.log('🟢 Store ready\\n');
}
`;
fs.writeFileSync(path.join(basePath, 'store', 'index.ts'), storeIndex, 'utf8');
console.log('Refactored store/index.ts');
