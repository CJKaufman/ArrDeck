const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  const configPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
  
  // 1. Definitively patch the config in memory before building
  console.log('Patching tauri.conf.json for final-final-final success...');
  let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  
  // Force the pubkey to be the exact base64 string (no path, no header)
  config.plugins.updater.pubkey = "RWTQ/3VsjQquQSbJzaYuELDawlT1RC1PhthxuQ6pKPF9P12qHeE1tCK3";
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // 2. Decode the secret
  const b64 = process.env.TAURI_SIGNING_PRIVATE_KEY_B64;
  if (!b64) {
    console.error('Error: TAURI_SIGNING_PRIVATE_KEY_B64 is not set');
    process.exit(1);
  }

  const decrypted = Buffer.from(b64, 'base64').toString('utf8');
  
  // 3. Set the environment variable for the child process
  const env = { ...process.env, TAURI_SIGNING_PRIVATE_KEY: decrypted };
  
  // 4. Run tauri build
  console.log('Starting Tauri build with injected config and decoded signing key...');
  const child = spawn('npx', ['tauri', 'build'], { 
    env, 
    stdio: 'inherit',
    shell: true 
  });

  child.on('exit', (code) => {
    process.exit(code);
  });
}

run();
