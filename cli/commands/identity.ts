/**
 * cli/commands/identity.ts -- xeno --identity command
 *
 * Displays the Node Identity Certificate with a slow, rhythmic
 * typing animation. Exports strata_identity.xeno on completion.
 *
 * Usage: npx tsx cli/index.tsx --identity
 */

import {
  generateCertificateData,
  renderCertificateASCII,
  exportCertificateFile,
} from '../../core/identity/certificate';

const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const BOLD = '\x1b[1m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Type a single line with rhythmic character-by-character animation.
 * Frame borders type faster; content types at reading speed.
 */
async function typeLine(line: string, baseDelay: number): Promise<void> {
  const isFrame = /^[+|=\-]/.test(line.trim());
  const delay = isFrame ? baseDelay * 0.3 : baseDelay;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    process.stdout.write(isFrame ? `${DIM}${CYAN}${char}${RESET}` : `${CYAN}${char}${RESET}`);

    if (char === ' ' || char === '.' || char === '-' || char === '=') {
      await sleep(delay * 0.2);
    } else if (char === ':') {
      await sleep(delay * 1.5);
    } else {
      await sleep(delay);
    }
  }
  process.stdout.write('\n');
}

/**
 * Execute the --identity command: display certificate with animation.
 */
export async function runIdentityCommand(): Promise<void> {
  console.clear();

  process.stdout.write(`\n${DIM}${CYAN}[XENO] Initializing Sovereign Identity...${RESET}\n`);
  await sleep(800);

  const data = generateCertificateData();

  if (!data) {
    process.stdout.write(`\n${RED}${BOLD}[ERROR] IDENTITY INITIALIZATION FAILED${RESET}\n`);
    process.stdout.write(`${RED}Unable to generate or load Sovereign Identity.${RESET}\n`);
    process.stdout.write(`${DIM}${RED}Possible causes: missing VAULT_SECRET, corrupted .identity/ directory.${RESET}\n\n`);
    process.exit(1);
  }

  process.stdout.write(`${DIM}${CYAN}[XENO] Identity loaded. Node ${data.nodeId}. Rendering certificate...${RESET}\n`);
  await sleep(600);
  process.stdout.write(`${DIM}${CYAN}[XENO] Clearance: LEVEL-IV. Stand by.${RESET}\n`);
  await sleep(1200);

  const ascii = renderCertificateASCII(data);
  const lines = ascii.split('\n');

  for (const line of lines) {
    if (line.trim().length === 0) {
      process.stdout.write('\n');
      await sleep(80);
    } else if (line.includes('X E N O') || line.includes('NODE IDENTITY')) {
      await typeLine(line, 35);
      await sleep(200);
    } else if (line.includes('SECTION')) {
      await sleep(300);
      await typeLine(line, 18);
      await sleep(200);
    } else if (line.startsWith('+')) {
      await typeLine(line, 4);
      await sleep(60);
    } else {
      await typeLine(line, 12);
    }
  }

  await sleep(600);

  process.stdout.write(`\n${DIM}${CYAN}[XENO] Exporting certificate to strata_identity.xeno...${RESET}\n`);
  await sleep(400);

  try {
    const filePath = exportCertificateFile(data);
    process.stdout.write(`${GREEN}${BOLD}[XENO] Certificate exported: ${filePath}${RESET}\n`);
  } catch (err) {
    process.stdout.write(`${RED}[XENO] Export failed: ${err instanceof Error ? err.message : 'unknown'}${RESET}\n`);
  }

  await sleep(300);
  process.stdout.write(`\n${DIM}${CYAN}[XENO] The abyss has recorded your identity. Node ${data.nodeId} is sovereign.${RESET}\n\n`);
}