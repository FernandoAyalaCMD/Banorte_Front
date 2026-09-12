const fs = require('fs');
const file = 'src/components/cards/DynamicBankView.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/Shadows\.card/g, 'Shadows.md');
code = code.replace(/Colors\.banorteRed/g, 'Colors.primary');

fs.writeFileSync(file, code, 'utf8');
console.log('Fixed TS errors in DynamicBankView.tsx');
