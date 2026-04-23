const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  const configPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
  
  // 1. Patch the public key directly into config.
  // Read it dynamically from the .pub file to avoid hardcoding typos.
  console.log('[build-wrapper] Patching tauri.conf.json with correct public key...');
  let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  const pubFilePath = path.join(__dirname, 'final_linux_style.pub');
  const pubFileB64 = fs.readFileSync(pubFilePath, 'utf8').trim();
  const pubFileText = Buffer.from(pubFileB64, 'base64').toString('utf8');
  const correctPubKey = pubFileText.split('\n').find(line => line.startsWith('RW')).trim();
  console.log('[build-wrapper] Using pubkey:', correctPubKey);
  config.plugins.updater.pubkey = correctPubKey;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // 2. The secret is base64 of the real minisign key text. Decode it.
  const b64Secret = process.env.TAURI_SIGNING_PRIVATE_KEY_B64;
  if (!b64Secret) {
    console.error('[build-wrapper] Error: TAURI_SIGNING_PRIVATE_KEY_B64 is not set');
    process.exit(1);
  }

  const realKeyContent = Buffer.from(b64Secret, 'base64').toString('utf8');
  console.log('[build-wrapper] Decoded key first line:', realKeyContent.split('\n')[0]);

  // Write to a temp file and point TAURI_SIGNING_PRIVATE_KEY at the file path
  const keyPath = path.join(__dirname, 'src-tauri', '.tmp_signing_key');
  fs.writeFileSync(keyPath, realKeyContent, { encoding: 'utf8' });
  console.log('[build-wrapper] Key file written to:', keyPath);

  // 3. Run tauri build with the KEY PATH (official Tauri recommended approach)
  const env = { ...process.env, TAURI_SIGNING_PRIVATE_KEY: keyPath };
  
  console.log('[build-wrapper] Starting Tauri build...');
  const child = spawn('npx', ['tauri', 'build'], { 
    env, 
    stdio: 'inherit',
    shell: true 
  });

  child.on('exit', (code) => {
    try { fs.unlinkSync(keyPath); } catch(e) {}
    process.exit(code);
  });
}

run();
