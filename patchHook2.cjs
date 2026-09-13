const fs = require('fs');
const file = 'src/hooks/useA2UI.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  /const userMessage: ChatMessage = \{\s*id: generateId\(\),\s*role: 'user',\s*content: text,\s*timestamp: Date\.now\(\),\s*\};\s*setState\(\(prev\) => \(\{\s*\.\.\.prev,\s*messages: \[\.\.\.prev\.messages, userMessage\],\s*isLoading: true,\s*error: null,\s*\}\)\);/s,
  `const isSilent = text === "INIT_SESSION_SILENT";
      const userMessage = {
        id: generateId(),
        role: 'user',
        content: text,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        messages: isSilent ? prev.messages : [...prev.messages, userMessage],
        isLoading: true,
        error: null,
      }));`
);

fs.writeFileSync(file, code, 'utf8');
console.log('useA2UI silent message patched');
