const fs = require('fs');
const file = 'App.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /messages\.map\(\(message\) => \(/,
  '{messages.map((message) => ('
);

fs.writeFileSync(file, code, 'utf8');
console.log('Fixed missing brace in App.tsx');
