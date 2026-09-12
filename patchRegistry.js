const fs = require('fs');
const file = 'src/components/registry.ts';
let code = fs.readFileSync(file, 'utf8');

if (!code.includes('DynamicBankView')) {
  code = code.replace(
    /import \{ ResolutionSuccessCard \} from '.\/cards\/ResolutionSuccessCard';/,
    `import { ResolutionSuccessCard } from './cards/ResolutionSuccessCard';
import { DynamicBankView } from './cards/DynamicBankView';`
  );
  
  code = code.replace(
    /ResolutionSuccessCard,/,
    `ResolutionSuccessCard,
  DynamicBankView,`
  );

  fs.writeFileSync(file, code, 'utf8');
  console.log('Updated registry.ts');
}
