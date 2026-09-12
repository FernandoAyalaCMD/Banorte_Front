const fs = require('fs');
const file = 'src/types/a2ui.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('DynamicBankView')) {
  code = code.replace(
    /export type ComponentName =[\s\S]*?ResolutionSuccessCard';/,
    `export type ComponentName =
  | 'BurnerCard'
  | 'FraudAlertView'
  | 'SubscriptionManager'
  | 'PayrollAdvance'
  | 'ResolutionSuccessCard'
  | 'DynamicBankView';`
  );

  code = code.replace(
    /ResolutionSuccessCard: ResolutionSuccessCardProps;/g,
    `ResolutionSuccessCard: ResolutionSuccessCardProps;
  DynamicBankView: DynamicBankViewProps;`
  );

  code += `\n\n// --- DynamicBankView Props (Generative UI) ---\n\n`;
  code += `export interface DynamicElement {
  type: 'header' | 'text' | 'key_value' | 'bar_chart' | 'action_button';
  content?: string;
  label?: string;
  value?: string | number;
  data?: Array<{ label: string; value: number }>;
  action?: string;
}

export interface DynamicBankViewProps {
  title: string;
  subtitle?: string;
  elements: DynamicElement[];
}\n`;

  fs.writeFileSync(file, code, 'utf8');
  console.log('Updated a2ui.ts with DynamicBankView types.');
} else {
  console.log('DynamicBankView already exists in a2ui.ts');
}
