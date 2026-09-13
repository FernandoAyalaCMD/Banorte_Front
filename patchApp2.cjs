const fs = require('fs');
const file = 'App.tsx';
let code = fs.readFileSync(file, 'utf8');

const regex = /\{\/\* Welcome message \*\/\}[\s\S]*?(?=\{\/\* Messages \*\/\}|messages\.map\()/;
if (regex.test(code)) {
  code = code.replace(regex, '');
  fs.writeFileSync(file, code, 'utf8');
  console.log('Welcome message removed');
} else {
  console.log('Regex not found, printing next lines instead');
  const lines = code.split('\n');
  const idx = lines.findIndex(l => l.includes('{/* Welcome message */}'));
  console.log(lines.slice(idx, idx + 40).join('\n'));
}
