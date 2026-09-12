const fs = require('fs');
const path = require('path');
const dir = path.join('src', 'components', 'cards');

function addFallbacks(filename, regex, replacement) {
  const file = path.join(dir, filename);
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(regex, replacement);
  fs.writeFileSync(file, code, 'utf8');
  console.log('Patched', filename);
}

addFallbacks(
  'BurnerCard.tsx',
  /export const BurnerCard: React\.FC<Props> = \(\{\n([^}]+)\}\) => \{/,
  `export const BurnerCard: React.FC<Props> = ({
  cardNumber = '4152 8234 5678 9012',
  cardHolder = 'Carlos Mendoza García',
  expiryDate = '12/28',
  cvv = '742',
  spendingLimit = 1000,
  remainingSeconds = 600,
  brand = 'visa',
  onAction,
}) => {`
);

let bc = fs.readFileSync(path.join(dir, 'BurnerCard.tsx'), 'utf8');
bc = bc.replace(/const formatCardNumber = \(num: string\) => \{/g, 'const formatCardNumber = (num?: string) => { if(!num) return "•••• •••• •••• ••••";');
bc = bc.replace(/spendingLimit\.toLocaleString/g, '(spendingLimit || 0).toLocaleString');
fs.writeFileSync(path.join(dir, 'BurnerCard.tsx'), bc, 'utf8');

addFallbacks(
  'FraudAlertView.tsx',
  /export const FraudAlertView: React\.FC<Props> = \(\{\n([^}]+)\}\) => \{/,
  `export const FraudAlertView: React.FC<Props> = ({
  cardInfo = { id: 'card_1', lastFour: '1234', type: 'Credit', isFrozen: false },
  suspiciousTransaction = { id: 'tx_0', merchant: 'Unknown', amount: 0, currency: 'MXN', date: new Date().toISOString(), location: 'Unknown', category: 'Unknown' },
  recentTransactions = [],
  plasticEnabled = true,
  onAction,
}) => {`
);

addFallbacks(
  'PayrollAdvance.tsx',
  /export const PayrollAdvance: React\.FC<Props> = \(\{\n([^}]+)\}\) => \{/,
  `export const PayrollAdvance: React.FC<Props> = ({
  maxAmount = 5000,
  minAmount = 500,
  defaultAmount = 2500,
  disbursementDate = 'Hoy',
  installmentOptions = [],
  employerName = 'Empresa SA de CV',
  onAction,
}) => {`
);

addFallbacks(
  'ResolutionSuccessCard.tsx',
  /export const ResolutionSuccessCard: React\.FC<Props> = \(\{\n([^}]+)\}\) => \{/,
  `export const ResolutionSuccessCard: React.FC<Props> = ({
  title = 'Operación Exitosa',
  description = 'La solicitud fue procesada correctamente.',
  details = [],
  folio = 'Folio N/A',
  type = 'card',
  onAction,
}) => {`
);

addFallbacks(
  'SubscriptionManager.tsx',
  /export const SubscriptionManager: React\.FC<Props> = \(\{\n([^}]+)\}\) => \{/,
  `export const SubscriptionManager: React.FC<Props> = ({
  subscriptions = [],
  totalMonthlySpend = 0,
  onAction,
}) => {`
);

console.log('All components patched successfully.');
