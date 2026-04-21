const { spawn } = require('child_process');
const fs = require('fs');

async function run() {
  // 1. Decode the secret
  const b64 = process.env.TAURI_SIGNING_PRIVATE_KEY_B64;
  if (!b64) {
    console.error('Error: TAURI_SIGNING_PRIVATE_KEY_B64 is not set');
    process.exit(1);
  }

  const decrypted = Buffer.from(b64, 'base64').toString('utf8');
  
  // 2. Set the environment variable for the child process
  const env = { ...process.env, TAURI_SIGNING_PRIVATE_KEY: decrypted };
  
  // 3. Run tauri build
  console.log('Starting Tauri build with decoded signing key...');
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
