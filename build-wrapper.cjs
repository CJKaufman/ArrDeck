const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
  const configPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
  
  // 1. Patch the public key directly into config
  console.log('[build-wrapper] Patching tauri.conf.json with correct public key...');
  let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.plugins.updater.pubkey = "RWTQ/3VsjQquQSbJzaYuELDawlT1RC1PhthxuQ6pKPF9P12qHeE1tCK3";
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

  // 2. The secret is already base64 of the real minisign key text.
  //    Decode it to get the actual multiline key string.
  const b64Secret = process.env.TAURI_SIGNING_PRIVATE_KEY_B64;
  if (!b64Secret) {
    console.error('[build-wrapper] Error: TAURI_SIGNING_PRIVATE_KEY_B64 is not set');
    process.exit(1);
  }

  // The real key content (multiline text with header + base64 payload)
  const realKeyContent = Buffer.from(b64Secret, 'base64').toString('utf8');
  console.log('[build-wrapper] Decoded key first line:', realKeyContent.split('\n')[0]);

  // Write to a temp file and point TAURI_SIGNING_PRIVATE_KEY at it
  const keyPath = path.join(__dirname, 'src-tauri', '.tmp_signing_key');
  fs.writeFileSync(keyPath, realKeyContent, { encoding: 'utf8' });
  console.log('[build-wrapper] Key file written to:', keyPath);

  // 3. Run tauri build with the KEY PATH (official recommended approach)
  const env = { ...process.env, TAURI_SIGNING_PRIVATE_KEY: keyPath };
  
  console.log('[build-wrapper] Starting Tauri build...');
  const child = spawn('npx', ['tauri', 'build'], { 
    env, 
    stdio: 'inherit',
    shell: true 
  });

  child.on('exit', (code) => {
    // Clean up the temp key file
    try { fs.unlinkSync(keyPath); } catch(e) {}
    process.exit(code);
  });
}

run();
