const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// The correct pubkey value for tauri.conf.json:
// = base64(full minisign public key text with header)
// Tauri 2 base64-decodes this field, then parses it as UTF-8 minisign text.
const PUBKEY = "dW50cnVzdGVkIGNvbW1lbnQ6IG1pbmlzaWduIHB1YmxpYyBrZXk6IDQxQUUwQThENkM3NUZGRDAKUldUUS8zVnNqUXF1UVNiSnphWXVFTERhd2xUMVJDMVBIdGh4dVE2cEtQRjlQMTJxSGVFMXRDSzMK";

async function run() {
  const configPath = path.join(__dirname, 'src-tauri', 'tauri.conf.json');
  
  // 1. Patch the public key into config
  console.log('[build-wrapper] Patching tauri.conf.json with correct public key...');
  let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  config.plugins.updater.pubkey = PUBKEY;
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('[build-wrapper] Public key injected.');

  // 2. Decode the private key secret (stored as base64 of the full key text)
  const b64Secret = process.env.TAURI_SIGNING_PRIVATE_KEY_B64;
  if (!b64Secret) {
    console.error('[build-wrapper] Error: TAURI_SIGNING_PRIVATE_KEY_B64 is not set');
    process.exit(1);
  }

  const realKeyContent = Buffer.from(b64Secret, 'base64').toString('utf8');
  console.log('[build-wrapper] Private key first line:', realKeyContent.split('\n')[0]);

  // Write to a temp file and pass the path to Tauri (official recommended approach)
  const keyPath = path.join(__dirname, 'src-tauri', '.tmp_signing_key');
  fs.writeFileSync(keyPath, realKeyContent, { encoding: 'utf8' });

  // 3. Run tauri build
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
