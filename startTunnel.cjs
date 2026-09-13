const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  const tunnel = await localtunnel({ port: 3001 });
  console.log("NEW TUNNEL URL: " + tunnel.url);
  
  let envFile = 'c:/Users/ayala/OneDrive/Desktop/HACK2026/banorte_front/.env';
  let env = fs.readFileSync(envFile, 'utf8');
  env = env.replace(/EXPO_PUBLIC_API_URL=.*/, 'EXPO_PUBLIC_API_URL=' + tunnel.url);
  fs.writeFileSync(envFile, env, 'utf8');
  
  console.log("Updated .env successfully!");
  
  // keep alive
  setInterval(() => {}, 1000000);
})();
