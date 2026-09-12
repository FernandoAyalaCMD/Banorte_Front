const fs = require('fs');
const file = 'src/services/a2uiClient.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(/45000/g, '120000'); // Increase timeout to 120s

fs.writeFileSync(file, code, 'utf8');
console.log('Timeout increased to 120s in a2uiClient.ts');
